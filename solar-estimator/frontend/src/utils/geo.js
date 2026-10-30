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

/**
 * Resolves regional electricity grid, emission factor, currency symbol, and tariff rates
 * from geographical coordinates.
 */
export function getRegionalProfile(lat, lng) {
  // India Bounding Box: 6.5N - 37.5N, 68.0E - 97.5E
  if (lat >= 6.5 && lat <= 37.5 && lng >= 68.0 && lng <= 97.5) {
    return {
      country: 'India',
      gridName: 'Telangana Grid (CEA v20)',
      co2Factor: 0.82,
      currencySymbol: '₹',
      currencyCode: 'INR',
      electricityRate: 7.50,
      costPerKwp: 55000,
      subsidyName: 'PM Surya Ghar (DBT)',
      isIndia: true
    };
  }
  // United States & Canada: 24.0N - 50.0N, -125.0W to -65.0W
  if (lat >= 24.0 && lat <= 50.0 && lng >= -125.0 && lng <= -65.0) {
    const isCalifornia = lat >= 32.5 && lat <= 42.0 && lng >= -124.5 && lng <= -114.0;
    return {
      country: 'United States',
      gridName: isCalifornia ? 'California (CAISO Grid)' : 'US eGRID Subregion',
      co2Factor: isCalifornia ? 0.23 : 0.38,
      currencySymbol: '$',
      currencyCode: 'USD',
      electricityRate: isCalifornia ? 0.24 : 0.18,
      costPerKwp: 1800,
      subsidyName: 'Federal ITC (30%)',
      isIndia: false
    };
  }
  // Europe: 35.0N - 65.0N, -10.0W to 35.0E
  if (lat >= 35.0 && lat <= 65.0 && lng >= -10.0 && lng <= 35.0) {
    return {
      country: 'Europe',
      gridName: 'ENTSO-E European Grid',
      co2Factor: 0.26,
      currencySymbol: '€',
      currencyCode: 'EUR',
      electricityRate: 0.28,
      costPerKwp: 1200,
      subsidyName: 'EU Clean Energy Grant',
      isIndia: false
    };
  }
  // UAE / Middle East: 20.0N - 32.0N, 45.0E to 60.0E
  if (lat >= 20.0 && lat <= 32.0 && lng >= 45.0 && lng <= 60.0) {
    return {
      country: 'UAE',
      gridName: 'DEWA Regional Grid',
      co2Factor: 0.42,
      currencySymbol: 'AED ',
      currencyCode: 'AED',
      electricityRate: 0.38,
      costPerKwp: 4200,
      subsidyName: 'Shams Dubai Solar Initiative',
      isIndia: false
    };
  }
  // Japan: 30.0N - 46.0N, 128.0E to 146.0E
  if (lat >= 30.0 && lat <= 46.0 && lng >= 128.0 && lng <= 146.0) {
    return {
      country: 'Japan',
      gridName: 'TEPCO Regional Grid',
      co2Factor: 0.45,
      currencySymbol: '¥',
      currencyCode: 'JPY',
      electricityRate: 28.0,
      costPerKwp: 240000,
      subsidyName: 'Metropolitan Clean Energy Subsidy',
      isIndia: false
    };
  }
  // Australia: -45.0S to -10.0S, 112.0E to 155.0E
  if (lat >= -45.0 && lat <= -10.0 && lng >= 112.0 && lng <= 155.0) {
    return {
      country: 'Australia',
      gridName: 'NEM Australian Grid',
      co2Factor: 0.58,
      currencySymbol: 'A$',
      currencyCode: 'AUD',
      electricityRate: 0.29,
      costPerKwp: 1400,
      subsidyName: 'STC Solar Rebate',
      isIndia: false
    };
  }
  // Global Fallback
  return {
    country: 'International',
    gridName: 'IEA Global Baseline Grid',
    co2Factor: 0.48,
    currencySymbol: '$',
    currencyCode: 'USD',
    electricityRate: 0.20,
    costPerKwp: 1500,
    subsidyName: 'Clean Energy Tax Credit',
    isIndia: false
  };
}
