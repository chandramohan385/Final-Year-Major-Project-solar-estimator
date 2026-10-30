import math
import httpx
import logging
from typing import Dict, Any, List, Tuple, Optional
from shapely.geometry import Polygon, MultiPolygon, mapping
from shapely.affinity import scale, rotate, translate
from app.core.config import settings, INDIA_STATE_CO2_FACTORS

logger = logging.getLogger("solar-estimator.geo_engine")

class GeospatialMathEngine:
    """Geospatial calculations and physical solar energy modeling engine."""
    
    _ghi_cache: Dict[str, float] = {}

    @staticmethod
    def calculate_ground_resolution(latitude: float, zoom: int = 18) -> float:
        """
        Calculates ground resolution (meters/pixel) for standard Web Mercator tile coordinates
        at a specific latitude and zoom level.
        Formula: resolution = (156543.03392 * cos(lat * pi / 180)) / (2 ^ zoom)
        """
        lat_rad = math.radians(latitude)
        return (156543.03392 * math.cos(lat_rad)) / (2 ** zoom)

    @staticmethod
    def estimate_solar_irradiance(latitude: float, longitude: float) -> float:
        """
        Estimates global horizontal irradiance (GHI in kWh/m²/year)
        based on geographical latitude and atmospheric clearance index.
        Used as an instant mathematical fallback.
        """
        abs_lat = abs(latitude)
        if abs_lat <= 25:
            base_ghi = 2150 - (abs_lat * 12)
        elif abs_lat <= 45:
            base_ghi = 1850 - ((abs_lat - 25) * 22)
        else:
            base_ghi = 1410 - ((abs_lat - 45) * 20)
            
        regional_factor = 1.0 + 0.05 * math.sin(math.radians(longitude * 2))
        return round(max(850.0, min(2400.0, base_ghi * regional_factor)), 1)

    @classmethod
    async def fetch_nasa_ghi(cls, latitude: float, longitude: float) -> float:
        """
        Fetches climatological Global Horizontal Irradiance (GHI in kWh/m²/yr)
        from NASA POWER Climatology API (All Sky Surface Shortwave Downward Irradiance).
        Caches results in-memory and falls back gracefully to local estimate.
        """
        cache_key = f"{round(latitude, 2)},{round(longitude, 2)}"
        if cache_key in cls._ghi_cache:
            return cls._ghi_cache[cache_key]

        try:
            url = (
                f"https://power.larc.nasa.gov/api/temporal/climatology/point"
                f"?parameters=ALLSKY_SFC_SW_DWN"
                f"&community=RE"
                f"&longitude={longitude:.4f}&latitude={latitude:.4f}"
                f"&format=JSON"
            )
            async with httpx.AsyncClient(timeout=4.5) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    daily_ghi = data.get("properties", {}).get("parameter", {}).get("ALLSKY_SFC_SW_DWN", {}).get("ANN")
                    if daily_ghi and daily_ghi > 0:
                        annual_ghi = round(float(daily_ghi) * 365.25, 1)
                        cls._ghi_cache[cache_key] = annual_ghi
                        logger.info(f"Retrieved NASA POWER GHI for ({latitude}, {longitude}): {annual_ghi} kWh/m²/yr")
                        return annual_ghi
        except Exception as e:
            logger.warning(f"NASA POWER API unavailable or timed out ({e}). Using algorithmic irradiance estimate.")

        fallback = cls.estimate_solar_irradiance(latitude, longitude)
        cls._ghi_cache[cache_key] = fallback
        return fallback

    @classmethod
    def calculate_polygon_geodesic_area(cls, ring_coords: List[List[float]], center_lat: float) -> float:
        """
        Calculates exact metric ground area in m² for a polygon ring given as [[lng, lat], ...]
        using ellipsoidal metric projection around center_lat.
        """
        if not ring_coords or len(ring_coords) < 3:
            return 0.0
        
        # Metric conversion factors at center latitude
        lat_rad = math.radians(center_lat)
        m_per_deg_lat = 111132.954 - 559.822 * math.cos(2 * lat_rad) + 1.175 * math.cos(4 * lat_rad)
        m_per_deg_lng = 111412.84 * math.cos(lat_rad) - 93.5 * math.cos(3 * lat_rad)
        
        # Project each vertex to local metric meters (x, y) relative to ring_coords[0]
        x0, y0 = ring_coords[0][0], ring_coords[0][1]
        pts = []
        for p in ring_coords:
            x = (p[0] - x0) * m_per_deg_lng
            y = (p[1] - y0) * m_per_deg_lat
            pts.append((x, y))
            
        # Standard Shoelace formula in metric meters
        area_sum = 0.0
        n = len(pts)
        for i in range(n):
            j = (i + 1) % n
            area_sum += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]
            
        return round(abs(area_sum) * 0.5, 2)

    @classmethod
    def get_co2_factor_for_state(cls, state_name: Optional[str]) -> float:
        """Returns Central Electricity Authority (CEA) emission factor (kg CO2/kWh)."""
        if not state_name:
            return settings.DEFAULT_GRID_EMISSION_FACTOR
        return INDIA_STATE_CO2_FACTORS.get(state_name, settings.DEFAULT_GRID_EMISSION_FACTOR)

    @classmethod
    def calculate_potential(
        cls,
        building_pixels: Optional[int] = None,
        total_area_m2: Optional[float] = None,
        latitude: float = 17.385,
        longitude: float = 78.4867,
        zoom: int = 19,
        irradiance: Optional[float] = None,
        panel_efficiency: float = 0.20,
        performance_ratio: float = 0.75,
        electricity_rate: float = 7.50,
        cost_per_kwp: float = 55000.0,
        usable_fraction: float = 0.70,
        state: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Industry-grade physical solar modeling calculating gross/usable roof footprint,
        PV module count, capacity (kWp), annual generation, CEA decarbonization,
        simple payback, and degradation-adjusted 25-year lifetime ROI.
        """
        res_m = cls.calculate_ground_resolution(latitude, zoom)
        if total_area_m2 is not None and total_area_m2 > 0:
            total_area = float(total_area_m2)
        else:
            pixel_area_m2 = res_m ** 2
            total_area = (building_pixels or 1000) * pixel_area_m2
        
        # A. Usable Roof Area & Module Count
        usable_area = total_area * usable_fraction
        # Standard Monocrystalline Module: ~400W rating, ~2.0 m² footprint
        num_standard_panels = max(1, math.floor(usable_area / settings.DEFAULT_MODULE_AREA_M2))
        peak_system_capacity_kw = round((num_standard_panels * settings.DEFAULT_PANEL_RATING_W) / 1000.0, 2)
        
        # B. Annual Generation: Peak Capacity (kWp) * Annual GHI (kWh/m²/yr) * Performance Ratio (PR)
        annual_irradiance = irradiance if (irradiance is not None and irradiance > 0) else cls.estimate_solar_irradiance(latitude, longitude)
        annual_energy = peak_system_capacity_kw * annual_irradiance * performance_ratio
        
        # C. Environmental Decarbonization (India CEA Grid Factor)
        co2_factor = cls.get_co2_factor_for_state(state)
        carbon_offset_tons = (annual_energy * co2_factor) / 1000.0
        trees_equivalent = round(carbon_offset_tons * 45) # ~45 mature trees equivalent per ton CO2/yr
        
        # D. CapEx & Economics
        total_capex = peak_system_capacity_kw * cost_per_kwp
        annual_savings = annual_energy * electricity_rate
        payback_years = round(total_capex / max(annual_savings, 1.0), 1)
        
        # E. 25-Year Compound Degradation Model (~0.7% degradation/year, ~8% O&M reserve)
        degradation_rate = settings.ANNUAL_DEGRADATION_RATE
        lifetime_energy = sum([
            annual_energy * ((1.0 - degradation_rate) ** yr)
            for yr in range(25)
        ])
        lifetime_savings = lifetime_energy * electricity_rate * 0.92  # 8% total life-cycle inverter replacements / O&M
        lifetime_roi = round(((lifetime_savings - total_capex) / max(total_capex, 1.0)) * 100.0, 1)
        
        return {
            "total_area_m2": round(total_area, 1),
            "usable_area_m2": round(usable_area, 1),
            "pixel_resolution_m": round(res_m, 4),
            "solar_irradiance_kwh_m2": annual_irradiance,
            "annual_energy_kwh": round(annual_energy, 1),
            "carbon_offset_tons": round(carbon_offset_tons, 2),
            "co2_factor_used": co2_factor,
            "state_applied": state or "Telangana",
            "trees_equivalent": trees_equivalent,
            "estimated_cost": round(total_capex, 2),
            "annual_savings": round(annual_savings, 2),
            "payback_years": max(1.0, payback_years),
            "roi_percentage": max(0.0, lifetime_roi),
            "estimated_panels": num_standard_panels,
            "system_capacity_kw": peak_system_capacity_kw
        }

    @staticmethod
    def generate_rooftop_segments(
        center_lat: float,
        center_lng: float,
        usable_area: float,
        num_segments: int = 4,
        irradiance: float = 1800.0,
        performance_ratio: float = 0.75
    ) -> Dict[str, Any]:
        """
        Generates structured GeoJSON FeatureCollection representing discrete segmented
        rooftop facets with individual orientation, panel counts, and toggle capability.
        """
        roof_radius_m = math.sqrt(usable_area) * 0.65
        lat_deg_per_m = 1.0 / 111320.0
        lng_deg_per_m = 1.0 / (111320.0 * math.cos(math.radians(center_lat)))
        
        features = []
        d_lat = roof_radius_m * lat_deg_per_m
        d_lng = roof_radius_m * lng_deg_per_m
        
        orientations = [
            ("South Facing (Optimal)", 1.0, 180),
            ("East Facing (Morning)", 0.88, 90),
            ("West Facing (Afternoon)", 0.89, 270),
            ("Flat / North Section", 0.78, 0)
        ]
        
        offsets = [
            (-0.35, -0.35, 0.25, 0.45),
            (0.15, -0.35, 0.45, 0.35),
            (-0.35, 0.15, 0.38, 0.4),
            (0.12, 0.12, 0.42, 0.42)
        ]
        
        segment_count = min(num_segments, len(offsets))
        sub_area = usable_area / segment_count
        
        for i in range(segment_count):
            ox, oy, w, h = offsets[i]
            x1 = center_lng + (ox * d_lng)
            y1 = center_lat + (oy * d_lat)
            x2 = center_lng + ((ox + w) * d_lng)
            y2 = center_lat + ((oy + h) * d_lat)
            
            angle_deg = 12 * (i + 1)
            box_poly = Polygon([[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]])
            rotated = rotate(box_poly, angle_deg, origin=(center_lng, center_lat))
            
            label, eff_factor, azimuth = orientations[i % len(orientations)]
            seg_area = round(sub_area * (0.9 + (i * 0.06)), 1)
            seg_panels = max(1, math.floor(seg_area / 2.0))
            seg_kwp = round((seg_panels * 400.0) / 1000.0, 2)
            seg_kwh = round(seg_kwp * irradiance * performance_ratio * eff_factor, 1)
            
            feature = {
                "type": "Feature",
                "id": f"roof-seg-{i+1}",
                "properties": {
                    "id": f"roof-seg-{i+1}",
                    "name": f"Facet #{i+1} - {label}",
                    "orientation": label,
                    "azimuth_deg": azimuth,
                    "area_m2": seg_area,
                    "system_kwp": seg_kwp,
                    "annual_kwh": seg_kwh,
                    "efficiency_factor": eff_factor,
                    "panel_capacity": seg_panels,
                    "active": True
                },
                "geometry": mapping(rotated)
            }
            features.append(feature)
            
        return {
            "type": "FeatureCollection",
            "features": features
        }

geo_engine = GeospatialMathEngine()
