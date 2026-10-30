from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.supabase import supabase_service

router = APIRouter()

class SaveReportRequest(BaseModel):
    latitude: float
    longitude: float
    address: str
    total_area_m2: float
    usable_area_m2: float
    annual_energy_kwh: float
    carbon_offset_tons: float
    payback_years: float
    roi_percentage: float
    rooftop_polygon_geojson: dict

@router.get("/reports")
async def get_saved_reports():
    """Retrieve history of processed solar scans and generated reports."""
    try:
        scans = await supabase_service.get_recent_scans(limit=25)
        return {"scans": scans}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reports")
async def save_report(payload: SaveReportRequest):
    """Save an audited solar estimation report into Supabase or cache."""
    try:
        res = await supabase_service.save_scan_report(payload.model_dump())
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cached-scans")
async def get_cached_scans():
    """Fetch previously processed coordinates for quick access."""
    try:
        scans = await supabase_service.get_recent_scans(limit=50)
        coords = [
            {
                "id": s.get("id"),
                "latitude": s.get("latitude"),
                "longitude": s.get("longitude"),
                "address": s.get("address"),
                "usable_area_m2": s.get("usable_area_m2"),
                "annual_energy_kwh": s.get("annual_energy_kwh"),
                "created_at": s.get("created_at")
            }
            for s in scans
        ]
        return {"cached_sites": coords}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
