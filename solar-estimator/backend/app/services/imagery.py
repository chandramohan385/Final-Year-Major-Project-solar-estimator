import io
import math
import httpx
import logging
from PIL import Image
import numpy as np
from typing import Tuple, Optional, Dict, Any

logger = logging.getLogger("solar-estimator.imagery")

class SatelliteImageryService:
    """
    Handles satellite tile retrieval and aerial image ingestion.
    Always retrieves imagery at standard native resolution (Zoom 19)
    composited seamlessly around the target coordinates.
    """

    NATIVE_ZOOM = 19

    @classmethod
    def get_projection_metadata(cls, lat: float, lng: float, zoom: int = 19) -> Dict[str, Any]:
        """Calculates Web Mercator continuous tile and pixel coordinates at the given zoom level."""
        n = 2.0 ** zoom
        lat_rad = math.radians(lat)
        x_float = (lng + 180.0) / 360.0 * n
        y_float = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
        
        px = x_float * 256.0
        py = y_float * 256.0
        gsd = (156543.03392 * math.cos(lat_rad)) / n

        return {
            "lat": lat,
            "lng": lng,
            "zoom": zoom,
            "n": n,
            "x_float": x_float,
            "y_float": y_float,
            "px": px,
            "py": py,
            "gsd": gsd
        }

    @classmethod
    async def fetch_satellite_tile(cls, lat: float, lng: float, client_zoom: int = 18) -> Tuple[Optional[np.ndarray], Dict[str, Any]]:
        """
        Fetches satellite imagery tile around the specified coordinates at native Zoom 19 resolution.
        Composites adjacent tiles to ensure the target (lat, lng) is placed precisely at center pixel (256, 256).
        """
        zoom = cls.NATIVE_ZOOM
        proj = cls.get_projection_metadata(lat, lng, zoom=zoom)
        px, py = proj["px"], proj["py"]

        min_tx = int(math.floor((px - 256.0) / 256.0))
        max_tx = int(math.floor((px + 256.0) / 256.0))
        min_ty = int(math.floor((py - 256.0) / 256.0))
        max_ty = int(math.floor((py + 256.0) / 256.0))

        tiles_w = (max_tx - min_tx + 1) * 256
        tiles_h = (max_ty - min_ty + 1) * 256
        composite = Image.new("RGB", (tiles_w, tiles_h))

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        tiles_downloaded = 0
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                for ty in range(min_ty, max_ty + 1):
                    for tx in range(min_tx, max_tx + 1):
                        url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{zoom}/{ty}/{tx}"
                        try:
                            resp = await client.get(url, headers=headers)
                            if resp.status_code == 200:
                                tile_img = Image.open(io.BytesIO(resp.content)).convert("RGB")
                                ox = (tx - min_tx) * 256
                                oy = (ty - min_ty) * 256
                                composite.paste(tile_img, (ox, oy))
                                tiles_downloaded += 1
                        except Exception as e:
                            logger.warning(f"Error downloading tile ({zoom}/{ty}/{tx}): {e}")

            if tiles_downloaded > 0:
                crop_left = int(round(px - 256.0 - (min_tx * 256)))
                crop_top = int(round(py - 256.0 - (min_ty * 256)))
                patch = composite.crop((crop_left, crop_top, crop_left + 512, crop_top + 512))
                return np.array(patch), proj

        except Exception as e:
            logger.warning(f"Could not download live satellite composite: {e}. Generating fallback patch.")

        # Fallback patch if network is offline
        fallback_img = np.full((512, 512, 3), 120, dtype=np.uint8)
        return fallback_img, proj

    @classmethod
    def process_uploaded_image(cls, image_bytes: bytes) -> Tuple[np.ndarray, Tuple[int, int]]:
        """Processes raw uploaded image bytes into a 512x512 normalized RGB numpy array."""
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        orig_size = img.size
        resized = img.resize((512, 512), Image.Resampling.BILINEAR)
        return np.array(resized), orig_size

imagery_service = SatelliteImageryService()
