import io
import math
import base64
from typing import Optional, Dict, Any, List, Union
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from PIL import Image
import numpy as np

from app.services.geo_engine import geo_engine
from app.services.imagery import imagery_service
from app.ml.segmentation import segmentation_pipeline
from app.core.supabase import supabase_service
from app.core.config import settings

router = APIRouter()

class EstimationRequest(BaseModel):
    latitude: float = Field(..., description="Target site latitude")
    longitude: float = Field(..., description="Target site longitude")
    zoom: int = Field(default=18, description="Satellite tile zoom level")
    address: Optional[str] = Field(default="Target Site", description="Optional textual address")
    state: Optional[str] = Field(default="Telangana", description="Indian state for CEA grid CO2 factor")
    ghi_override: Optional[float] = Field(default=None, description="Manual GHI solar irradiance override (kWh/m²/yr)")
    panel_efficiency: Optional[float] = Field(default=0.20, description="Solar panel efficiency (e.g. 0.20 for 20%)")
    performance_ratio: Optional[float] = Field(default=0.75, description="System performance ratio / losses")
    electricity_rate: Optional[float] = Field(default=7.50, description="Tariff rate per kWh")
    cost_per_kwp: Optional[float] = Field(default=55000.0, description="Turnkey cost per kWp installed")
    building_scale: Optional[str] = Field(default="standard", description="Building scale: 'standard' (residential/small roof) or 'commercial' (large complex/tower)")
    custom_polygon: Optional[Union[Dict[str, Any], List[Any]]] = Field(default=None, description="Optional user-drawn CAD polygon GeoJSON or coordinate ring")

class EstimationResponse(BaseModel):
    total_area_m2: float
    usable_area_m2: float
    annual_energy_kwh: float
    carbon_offset_tons: float
    payback_years: float
    roi_percentage: float
    rooftop_polygon_geojson: dict
    trees_equivalent: Optional[int] = 0
    estimated_cost: Optional[float] = 0.0
    subsidy_amount: Optional[float] = 0.0
    net_cost: Optional[float] = 0.0
    currency_symbol: Optional[str] = "₹"
    currency_code: Optional[str] = "INR"
    subsidy_name: Optional[str] = "PM Surya Ghar (DBT)"
    building_category: Optional[str] = "Residential House"
    annual_savings: Optional[float] = 0.0
    estimated_panels: Optional[int] = 0
    system_capacity_kw: Optional[float] = 0.0
    solar_irradiance_kwh_m2: Optional[float] = 1800.0
    co2_factor_used: Optional[float] = 0.82
    state_applied: Optional[str] = "Telangana"
    address: Optional[str] = "Target Site"

@router.post("/estimate", response_model=EstimationResponse)
@router.post("/predict", response_model=EstimationResponse)
async def estimate_solar_potential(payload: EstimationRequest):
    try:
        lat, lng = payload.latitude, payload.longitude
        client_zoom = payload.zoom or 18
        
        # 1. Fetch satellite imagery at standard native resolution (Zoom 19)
        tile_rgb, proj = await imagery_service.fetch_satellite_tile(lat, lng, client_zoom)
        if tile_rgb is None:
            tile_rgb = np.full((512, 512, 3), 120, dtype=np.uint8)

        # 2. Real-World Solar Irradiance via NASA POWER Climatology API
        if payload.ghi_override and payload.ghi_override > 0:
            irradiance = payload.ghi_override
        else:
            irradiance = await geo_engine.fetch_nasa_ghi(lat, lng)

        # 3. Check if user provided an interactive CAD custom polygon
        if payload.custom_polygon:
            cp = payload.custom_polygon
            ring = []
            if isinstance(cp, dict):
                if cp.get("type") == "FeatureCollection" and cp.get("features"):
                    geom = cp["features"][0].get("geometry", {})
                    coords = geom.get("coordinates", [])
                    ring = coords[0] if coords and isinstance(coords[0], list) else []
                elif cp.get("type") == "Feature":
                    geom = cp.get("geometry", {})
                    coords = geom.get("coordinates", [])
                    ring = coords[0] if coords and isinstance(coords[0], list) else []
                elif cp.get("type") == "Polygon":
                    coords = cp.get("coordinates", [])
                    ring = coords[0] if coords and isinstance(coords[0], list) else []
                elif "coordinates" in cp:
                    coords = cp["coordinates"]
                    ring = coords[0] if coords and isinstance(coords[0], list) and isinstance(coords[0][0], list) else coords
            elif isinstance(cp, list):
                ring = cp[0] if cp and isinstance(cp[0], list) and isinstance(cp[0][0], list) else cp

            # Ensure polygon is closed
            if len(ring) >= 3:
                if ring[0] != ring[-1]:
                    ring.append(ring[0])
                gross_area_m2 = geo_engine.calculate_polygon_geodesic_area(ring, lat)
                usable_area_m2 = round(gross_area_m2 * 0.70, 1)
                
                geojson_data = {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "id": "cad-roof-facet-1",
                            "properties": {
                                "id": "cad-roof-facet-1",
                                "name": "CAD Selected Rooftop",
                                "orientation": "User-Defined Roof Plane",
                                "azimuth_deg": 180,
                                "area_m2": gross_area_m2,
                                "active": True
                            },
                            "geometry": {
                                "type": "Polygon",
                                "coordinates": [ring]
                            }
                        }
                    ]
                }
            else:
                gross_area_m2 = 150.0
                usable_area_m2 = 105.0
                geojson_data = geo_engine.generate_rooftop_segments(lat, lng, usable_area_m2, num_segments=1)
        else:
            # 3. Extract accurate contour polygons & GeoJSON facets (strictly targeted to building under reticle)
            geojson_data, gross_area_m2, usable_area_m2 = segmentation_pipeline.extract_rooftop_polygons(
                tile_rgb,
                proj,
                irradiance=irradiance,
                performance_ratio=payload.performance_ratio or 0.75,
                building_scale=payload.building_scale or "standard"
            )

        # 4. Standard Physical Solar Potential Calculation with CEA CO2 Factor and compound degradation
        metrics = geo_engine.calculate_potential(
            total_area_m2=gross_area_m2,
            latitude=lat,
            longitude=lng,
            zoom=19,
            irradiance=irradiance,
            panel_efficiency=payload.panel_efficiency or 0.20,
            performance_ratio=payload.performance_ratio or 0.75,
            electricity_rate=payload.electricity_rate or 7.50,
            cost_per_kwp=payload.cost_per_kwp or 55000.0,
            usable_fraction=0.70,
            state=payload.state or "Telangana"
        )
        
        response_data = {
            **metrics,
            "address": payload.address or f"{lat:.5f}, {lng:.5f}",
            "rooftop_polygon_geojson": geojson_data
        }
        
        # Background cache to Supabase / local SQLite
        try:
            await supabase_service.save_scan_report({
                "latitude": lat,
                "longitude": lng,
                "zoom": client_zoom,
                "address": response_data["address"],
                "total_area_m2": response_data["total_area_m2"],
                "usable_area_m2": response_data["usable_area_m2"],
                "annual_energy_kwh": response_data["annual_energy_kwh"],
                "carbon_offset_tons": response_data["carbon_offset_tons"],
                "payback_years": response_data["payback_years"],
                "roi_percentage": response_data["roi_percentage"],
                "rooftop_polygon_geojson": geojson_data
            })
        except Exception:
            pass

        return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/segment-image")
async def segment_uploaded_image(
    file: UploadFile = File(...),
    panel_efficiency: float = Form(0.20),
    performance_ratio: float = Form(0.75),
    electricity_rate: float = Form(7.50),
    pixel_resolution_m: float = Form(0.25),
    solar_irradiance: Optional[float] = Form(None),
    cost_per_kwp: float = Form(55000.0),
    state: str = Form("Telangana")
):
    """
    Accepts an uploaded aerial/satellite image, runs multi-band segmentation,
    and returns high-precision physical calculations using realistic GHI and CEA CO2 metrics.
    """
    try:
        content = await file.read()
        rgb_image, orig_size = imagery_service.process_uploaded_image(content)
        
        binary_mask = segmentation_pipeline.predict_mask(rgb_image)
        building_pixels = int(np.sum(binary_mask.squeeze()))
        
        # Calculate physical surface area
        pixel_area = pixel_resolution_m ** 2
        total_area = building_pixels * pixel_area
        usable_area = total_area * 0.70
        num_panels = max(1, math.floor(usable_area / 2.0))
        peak_kw = round((num_panels * 400.0) / 1000.0, 2)
        
        effective_ghi = solar_irradiance if (solar_irradiance and solar_irradiance > 0) else 1978.0
        annual_energy = round(peak_kw * effective_ghi * performance_ratio, 1)
        
        co2_factor = geo_engine.get_co2_factor_for_state(state)
        carbon_offset = round((annual_energy * co2_factor) / 1000.0, 2)
        
        capex = round(peak_kw * cost_per_kwp, 2)
        annual_savings = round(annual_energy * electricity_rate, 2)
        payback = round(capex / max(annual_savings, 1.0), 1)
        
        # 25-Year Compound Degradation Model
        degradation_rate = settings.ANNUAL_DEGRADATION_RATE
        lifetime_energy = sum([
            annual_energy * ((1.0 - degradation_rate) ** yr)
            for yr in range(25)
        ])
        lifetime_savings = lifetime_energy * electricity_rate * 0.92
        roi = round(((lifetime_savings - capex) / max(capex, 1.0)) * 100.0, 1)
        
        # Render colored mask overlay without purple (Cyan / Cyber Green #00F5D4 with alpha)
        mask_2d = binary_mask.squeeze()
        h, w = mask_2d.shape
        rgba_overlay = np.zeros((h, w, 4), dtype=np.uint8)
        rgba_overlay[mask_2d == 1] = [0, 245, 212, 175]
        
        overlay_pil = Image.fromarray(rgba_overlay, mode="RGBA")
        overlay_buffer = io.BytesIO()
        overlay_pil.save(overlay_buffer, format="PNG")
        mask_base64 = base64.b64encode(overlay_buffer.getvalue()).decode("utf-8")
        
        return {
            "success": True,
            "filename": file.filename,
            "original_dimensions": orig_size,
            "building_pixels": building_pixels,
            "total_area_m2": round(total_area, 1),
            "usable_area_m2": round(usable_area, 1),
            "estimated_panels": num_panels,
            "system_capacity_kw": peak_kw,
            "solar_irradiance_kwh_m2": effective_ghi,
            "annual_energy_kwh": annual_energy,
            "carbon_offset_tons": carbon_offset,
            "co2_factor_used": co2_factor,
            "state_applied": state,
            "estimated_cost": capex,
            "annual_savings": annual_savings,
            "payback_years": max(1.0, payback),
            "roi_percentage": max(0.0, roi),
            "mask_png_base64": f"data:image/png;base64,{mask_base64}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
