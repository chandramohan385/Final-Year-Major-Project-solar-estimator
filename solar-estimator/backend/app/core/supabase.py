import logging
import json
import sqlite3
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger("solar-estimator.supabase")

# Local SQLite storage file for persistence when Supabase credentials are not live
DB_PATH = os.path.join(os.path.dirname(__file__), "solar_cache.db")

def init_local_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS processed_scans (
                id TEXT PRIMARY KEY,
                latitude REAL,
                longitude REAL,
                zoom INTEGER,
                address TEXT,
                total_area_m2 REAL,
                usable_area_m2 REAL,
                annual_energy_kwh REAL,
                carbon_offset_tons REAL,
                payback_years REAL,
                roi_percentage REAL,
                geojson_data TEXT,
                created_at TEXT
            )
        """)
        conn.commit()
        conn.close()
    except Exception as e:
        logger.warning(f"Error initializing local database: {e}")

init_local_db()

class SupabaseService:
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_KEY
        self.client = None
        self.use_supabase = False
        
        # Check if actual credentials provided
        if self.url and "xyzcompany" not in self.url and self.key and "placeholder" not in self.key:
            try:
                from supabase import create_client
                self.client = create_client(self.url, self.key)
                self.use_supabase = True
                logger.info("Connected to remote Supabase instance.")
            except Exception as e:
                logger.warning(f"Failed to connect to Supabase: {e}. Falling back to internal persistent store.")
        else:
            logger.info("Supabase client initialized in local persistent cache mode.")

    async def save_scan_report(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Saves a processed solar scan to Supabase or local cache."""
        report_id = report_data.get("id") or f"scan_{int(datetime.utcnow().timestamp()*1000)}"
        report_data["id"] = report_id
        report_data["created_at"] = datetime.utcnow().isoformat()
        
        if self.use_supabase and self.client:
            try:
                response = self.client.table("solar_reports").insert(report_data).execute()
                return {"success": True, "id": report_id, "backend": "supabase"}
            except Exception as e:
                logger.error(f"Supabase insert failed: {e}. Storing locally.")

        # Local SQLite fallback
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO processed_scans (
                    id, latitude, longitude, zoom, address, total_area_m2, usable_area_m2,
                    annual_energy_kwh, carbon_offset_tons, payback_years, roi_percentage,
                    geojson_data, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                report_id,
                report_data.get("latitude", 0.0),
                report_data.get("longitude", 0.0),
                report_data.get("zoom", 18),
                report_data.get("address", "Target Site"),
                report_data.get("total_area_m2", 0.0),
                report_data.get("usable_area_m2", 0.0),
                report_data.get("annual_energy_kwh", 0.0),
                report_data.get("carbon_offset_tons", 0.0),
                report_data.get("payback_years", 0.0),
                report_data.get("roi_percentage", 0.0),
                json.dumps(report_data.get("rooftop_polygon_geojson", {})),
                report_data["created_at"]
            ))
            conn.commit()
            conn.close()
            return {"success": True, "id": report_id, "backend": "sqlite_cache"}
        except Exception as e:
            logger.error(f"Local database write failed: {e}")
            return {"success": False, "error": str(e)}

    async def get_recent_scans(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Retrieves recent scans for telemetry and review."""
        if self.use_supabase and self.client:
            try:
                res = self.client.table("solar_reports").select("*").order("created_at", desc=True).limit(limit).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning(f"Supabase select failed: {e}")

        # Local SQLite fetch
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM processed_scans ORDER BY created_at DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            results = []
            for row in rows:
                item = dict(row)
                if item.get("geojson_data"):
                    try:
                        item["rooftop_polygon_geojson"] = json.loads(item["geojson_data"])
                    except Exception:
                        pass
                results.append(item)
            conn.close()
            return results
        except Exception as e:
            logger.error(f"Local query error: {e}")
            return []

supabase_service = SupabaseService()
