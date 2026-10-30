import os

# Central Electricity Authority (CEA) Baseline CO2 Emission Database (Version 19 / 2023-24)
INDIA_STATE_CO2_FACTORS = {
    "Telangana": 0.86,
    "Andhra Pradesh": 0.84,
    "Maharashtra": 0.81,
    "Karnataka": 0.72,       # Higher renewable / hydel mix
    "Tamil Nadu": 0.78,
    "Delhi": 0.82,
    "Rajasthan": 0.94,       # Coal-heavy grid base
    "Gujarat": 0.79,
    "Uttar Pradesh": 0.88,
    "National Average": 0.82
}

class Settings:
    PROJECT_NAME: str = "High-Resolution Solar Rooftop Energy Potential Estimator"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://xyzcompany.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "public-anon-key-placeholder")
    
    # Default Solar Modeling Constants
    DEFAULT_PANEL_EFFICIENCY: float = 0.20  # 20% standard monocrystalline PERC
    DEFAULT_PANEL_RATING_W: float = 400.0   # 400W standard monocrystalline PERC module
    DEFAULT_MODULE_AREA_M2: float = 2.0     # ~2.0 m² per module
    DEFAULT_USABLE_RATIO: float = 0.70      # 70% active coverage ratio accounting for setbacks & tilt clearance
    DEFAULT_PERFORMANCE_RATIO: float = 0.75 # Inverter, thermal and wiring losses
    DEFAULT_GRID_EMISSION_FACTOR: float = 0.82 # kg CO2 per kWh (global/national average)
    DEFAULT_ELECTRICITY_RATE: float = 7.50  # Average commercial/residential tariff in INR (₹/kWh)
    DEFAULT_COST_PER_KWP: float = 55000.0   # Industry benchmark ~₹50,000 to ₹60,000 per kWp installed
    DEFAULT_STATE: str = "Telangana"
    ANNUAL_DEGRADATION_RATE: float = 0.007  # 0.7%/year PV degradation standard
    
    # Imagery resolution at Zoom 18 (equator ~0.597 m/pixel)
    BASE_PIXEL_RESOLUTION_M: float = 0.597

settings = Settings()
