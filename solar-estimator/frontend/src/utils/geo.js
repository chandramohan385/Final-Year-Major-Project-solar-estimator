/**
 * Geospatial utility functions for Web Mercator and Ground Sample Distance (GSD) calculations.
 */

// GSD formula for Web Mercator:
// GSD = (156543.03392 * cos(latitude * π / 180)) / (2 ^ zoomLevel)
export function getGSD(latitude, zoomLevel) {
  const rad = (latitude * Math.PI) / 180;
  return (156543.03392 * Math.cos(rad)) / Math.pow(2, zoomLevel);
}

/**
 * Calculates ground footprint dimensions (width & height in meters) for a 512x512 tile
 */
export function getTileFootprintMeters(latitude, zoomLevel, tileSize = 512) {
  const gsd = getGSD(latitude, zoomLevel);
  return gsd * tileSize;
}

/**
 * Calculates exact metric ground area in m² for a polygon ring given as [[lng, lat], ...]
 * using ellipsoidal metric projection around centerLat.
 */
export function calculateGeodesicArea(ringCoords, centerLat = 17.385) {
  if (!ringCoords || ringCoords.length < 3) return 0;
  const latRad = (centerLat * Math.PI) / 180;
  const mPerDegLat = 111132.954 - 559.822 * Math.cos(2 * latRad) + 1.175 * Math.cos(4 * latRad);
  const mPerDegLng = 111412.84 * Math.cos(latRad) - 93.5 * Math.cos(3 * latRad);

  const x0 = ringCoords[0][0];
  const y0 = ringCoords[0][1];
  const pts = ringCoords.map((p) => [
    (p[0] - x0) * mPerDegLng,
    (p[1] - y0) * mPerDegLat
  ]);

  let areaSum = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    areaSum += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
  }
  return Math.round(Math.abs(areaSum) * 0.5 * 10) / 10;
}
