import React, { useState, useEffect, useCallback } from 'react';
import ProjectHero from './components/ProjectHero.jsx';
import MapHUD from './components/MapHUD.jsx';
import GlobeHUD from './components/GlobeHUD.jsx';
import CommandBar from './components/CommandBar.jsx';
import MetricsPanel from './components/MetricsPanel.jsx';
import ImageUploadModal from './components/ImageUploadModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import ReportModal from './components/ReportModal.jsx';
import { useSolarAPI } from './hooks/useSolarAPI.js';
import { calculateGeodesicArea } from './utils/geo.js';

export default function App() {
  // Center coordinates & zoom
  const [center, setCenter] = useState({ lat: 17.3850, lng: 78.4867 });
  const [zoom, setZoom] = useState(18);
  const [address, setAddress] = useState('Hyderabad Center Site');

  // View mode: 'map' (2D High-Res Satellite CAD) | 'globe' (3D Interactive Earth Globe)
  const [viewMode, setViewMode] = useState('map');

  // CAD interactive state
  const [cadMode, setCadMode] = useState('auto'); // 'auto' | 'draw'

  // Modeling parameters
  const [settings, setSettings] = useState({
    panelEfficiency: 0.20,
    performanceRatio: 0.75,
    electricityRate: 7.50,
    costPerKwp: 55000.0,
    state: 'Telangana',
    buildingScale: 'standard'
  });

  // State for metrics and rooftop facets
  const [metrics, setMetrics] = useState(null);
  const [activeFacetIds, setActiveFacetIds] = useState([]);
  const [recentScans, setRecentScans] = useState([]);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const { loading: isScanning, estimateSolar, segmentUploadedImage, fetchSavedReports } = useSolarAPI();

  // Perform solar scan at current coordinates (Auto AI or custom)
  const triggerScan = useCallback(async (targetLat = center.lat, targetLng = center.lng, customAddress = address, customPolygon = null) => {
    try {
      const result = await estimateSolar({
        latitude: targetLat,
        longitude: targetLng,
        zoom: zoom,
        address: customAddress,
        settings: settings,
        customPolygon: customPolygon
      });

      setMetrics(result);
      // Activate all segmented facets by default
      if (result.rooftop_polygon_geojson?.features) {
        const ids = result.rooftop_polygon_geojson.features.map(f => f.properties?.id);
        setActiveFacetIds(ids);
      }

      // Refresh saved scans
      const scans = await fetchSavedReports();
      setRecentScans(scans);
    } catch (err) {
      console.error("Scan error:", err);
    }
  }, [center.lat, center.lng, zoom, address, settings, estimateSolar, fetchSavedReports]);

  // Load cached reports on startup (do not auto-trigger scan)
  useEffect(() => {
    fetchSavedReports().then(setRecentScans);
  }, [fetchSavedReports]);

  // Handle address or coordinate search (fly map only, scan only when Scan Roof is pressed)
  const handleSearch = async (queryText, directCoords = null) => {
    if (directCoords) {
      setCenter(directCoords);
      setAddress(queryText);
      return;
    }

    // Check if query is "lat, lng" coordinates
    const coordMatch = queryText.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[3]);
      setCenter({ lat, lng });
      setAddress(`Coord: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      return;
    }

    // Use OpenStreetMap Nominatim free geocoding API
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText)}&limit=1`, {
        headers: { 'Accept-Language': 'en' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          const displayName = data[0].display_name.split(',').slice(0, 2).join(',');
          setCenter({ lat, lng });
          setAddress(displayName);
          return;
        }
      }
    } catch (err) {
      console.warn("Geocoding lookup error, falling back:", err);
    }

    // Fallback search
    setAddress(queryText);
  };

  // Map click to reposition target reticle only (when not in drawing mode)
  const handleMapClick = (coords) => {
    if (cadMode === 'draw') return;
    setCenter(coords);
    setAddress(`Target: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
  };

  // Toggle CAD drawing mode
  const handleToggleCadMode = () => {
    setCadMode((prev) => {
      const next = prev === 'draw' ? 'auto' : 'draw';
      if (next === 'draw') {
        // Clear previous scanned polygon and metrics when entering drawing mode
        setMetrics(null);
        setActiveFacetIds([]);
      }
      return next;
    });
  };

  // Handle user completing a drawn polygon
  const handleFinishDrawing = (ring) => {
    setCadMode('auto');
    // Calculate solar yield from user's custom-drawn polygon
    triggerScan(center.lat, center.lng, address, ring);
  };

  // Handle live vertex drag: recalculate area & physical solar metrics instantly in client
  const handlePolygonChange = useCallback((updatedRing) => {
    if (!updatedRing || updatedRing.length < 3) return;
    const newArea = calculateGeodesicArea(updatedRing, center.lat);
    const usableArea = Math.round(newArea * 0.70 * 10) / 10;
    const panels = Math.max(1, Math.floor(usableArea / 2.0));
    const capacityKw = Math.round(((panels * 400) / 1000) * 10) / 10;
    const ghi = metrics?.solar_irradiance_kwh_m2 || 1957;
    const pr = settings.performanceRatio || 0.75;
    const annualKwh = Math.round(capacityKw * ghi * pr);
    const co2Factor = metrics?.co2_factor_used || 0.86;
    const carbonOffset = Math.round(((annualKwh * co2Factor) / 1000) * 10) / 10;
    const capex = Math.round(capacityKw * (settings.costPerKwp || 55000));
    const annualSavings = Math.round(annualKwh * (settings.electricityRate || 7.50));
    const payback = annualSavings > 0 ? Math.round((capex / annualSavings) * 10) / 10 : 0;
    const lifetimeSavings = annualSavings * 25 * 0.92;
    const roi = capex > 0 ? Math.round(((lifetimeSavings - capex) / capex) * 1000) / 10 : 0;

    setMetrics((prev) => {
      if (!prev) return prev;
      const facetId = prev?.rooftop_polygon_geojson?.features?.[0]?.properties?.id || 'roof-facet-1';
      return {
        ...prev,
        total_area_m2: newArea,
        usable_area_m2: usableArea,
        estimated_panels: panels,
        system_capacity_kw: capacityKw,
        annual_energy_kwh: annualKwh,
        carbon_offset_tons: carbonOffset,
        estimated_cost: capex,
        annual_savings: annualSavings,
        payback_years: payback,
        roi_percentage: roi,
        rooftop_polygon_geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              id: facetId,
              properties: {
                ...(prev?.rooftop_polygon_geojson?.features?.[0]?.properties || {}),
                id: facetId,
                name: 'Custom CAD Boundary',
                area_m2: newArea,
                panel_capacity: panels,
                system_kwp: capacityKw,
                annual_kwh: annualKwh,
                active: true
              },
              geometry: {
                type: 'Polygon',
                coordinates: [updatedRing]
              }
            }
          ]
        }
      };
    });
  }, [center.lat, metrics?.solar_irradiance_kwh_m2, metrics?.co2_factor_used, settings]);

  // Handle final commit of polygon when dragging ends
  const handlePolygonCommit = useCallback((finalRing) => {
    // Keep local metrics and sync with API in background
    estimateSolar({
      latitude: center.lat,
      longitude: center.lng,
      zoom: zoom,
      address: address,
      settings: settings,
      customPolygon: finalRing
    }).then(() => {
      fetchSavedReports().then(setRecentScans);
    }).catch(() => {});
  }, [center.lat, center.lng, zoom, address, settings, estimateSolar, fetchSavedReports]);

  // Reset rooftop boundaries
  const handleResetRoof = () => {
    setMetrics(null);
    setActiveFacetIds([]);
    setCadMode('auto');
  };

  // Toggle individual roof facets ON/OFF
  const handleFacetToggle = (facetId) => {
    setActiveFacetIds((prev) =>
      prev.includes(facetId)
        ? prev.filter((id) => id !== facetId)
        : [...prev, facetId]
    );
  };

  // Reset default settings
  const handleResetSettings = () => {
    setSettings({
      panelEfficiency: 0.20,
      performanceRatio: 0.75,
      electricityRate: 7.50,
      costPerKwp: 55000.0,
      state: 'Telangana',
      buildingScale: 'standard'
    });
  };

  // Scroll smoothly down to interactive spatial workspace
  const handleScrollToMap = () => {
    const el = document.getElementById('map-workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll smoothly back up to top project overview description
  const handleScrollToOverview = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle between 3D Globe and 2D Satellite CAD
  const handleToggleViewMode = () => {
    setViewMode((prev) => (prev === 'globe' ? 'map' : 'globe'));
  };

  // When 3D Globe zooms in to street level or user selects a site
  const handleTransitionFromGlobe = (targetLat, targetLng, targetZoom = 18) => {
    setCenter({ lat: targetLat, lng: targetLng });
    setZoom(targetZoom);
    setViewMode('map');
  };

  // Triggered when user zooms all the way out on the 2D map
  const handleTriggerGlobe = () => {
    setViewMode('globe');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-roboto scroll-smooth selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. PROJECT TITLE & EXECUTIVE OVERVIEW SECTION AT TOP */}
      <ProjectHero
        onLaunchMap={handleScrollToMap}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* 2. INTERACTIVE SPATIAL CAD / 3D GLOBE WORKSPACE */}
      <section
        id="map-workspace"
        className="relative w-full h-[94vh] md:h-screen overflow-hidden border-t border-slate-200 select-none"
      >
        {/* SPATIAL ENGINE: 3D GLOBE OR 2D HIGH-RESOLUTION SATELLITE CAD */}
        {viewMode === 'globe' ? (
          <GlobeHUD
            center={center}
            currentAddress={address}
            onSelectCoordinates={(coords) => {
              setCenter(coords);
              setAddress(`Target: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
            }}
            onTransitionToMap={handleTransitionFromGlobe}
            onScrollToOverview={handleScrollToOverview}
          />
        ) : (
          <MapHUD
            center={center}
            zoom={zoom}
            onMapClick={handleMapClick}
            onCenterChange={({ lat, lng, zoom: newZoom }) => {
              setCenter({ lat, lng });
              setZoom(newZoom);
            }}
            isScanning={isScanning}
            geojsonFeatures={cadMode === 'draw' ? null : metrics?.rooftop_polygon_geojson}
            activeFacetIds={activeFacetIds}
            onFacetToggle={handleFacetToggle}
            cadMode={cadMode}
            onFinishDrawing={handleFinishDrawing}
            onPolygonChange={handlePolygonChange}
            onPolygonCommit={handlePolygonCommit}
            onTriggerGlobe={handleTriggerGlobe}
          />
        )}

        {/* FLOATING TOP COMMAND BAR IN LIGHT THEME */}
        <CommandBar
          onSearch={(queryText, directCoords) => {
            handleSearch(queryText, directCoords);
            if (viewMode === 'globe' && directCoords) {
              setViewMode('map');
              setZoom(18);
            }
          }}
          onScan={() => {
            if (viewMode === 'globe') {
              setViewMode('map');
            }
            triggerScan();
          }}
          isScanning={isScanning}
          currentAddress={address}
          zoom={zoom}
          center={center}
          cadMode={cadMode}
          onToggleCadMode={handleToggleCadMode}
          onResetRoof={handleResetRoof}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenReports={() => setIsReportOpen(true)}
          viewMode={viewMode}
          onToggleViewMode={handleToggleViewMode}
          onScrollToOverview={handleScrollToOverview}
        />

        {/* TACTILE BOTTOM METRICS PANEL IN LIGHT THEME (SHOWN IN MAP MODE OR WHEN METRICS EXIST, HIDDEN DURING DRAWING) */}
        {metrics && cadMode !== 'draw' && (
          <MetricsPanel
            metrics={metrics}
            activeFacetIds={activeFacetIds}
            onFacetToggle={handleFacetToggle}
            onOpenReport={() => setIsReportOpen(true)}
          />
        )}

        {/* TARGETING GUIDANCE PROMPT (WHEN IDLE BEFORE FIRST SCAN IN MAP MODE) */}
        {viewMode === 'map' && !metrics && !isScanning && cadMode === 'auto' && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-fade-in">
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs text-slate-700 font-roboto">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Position map over target building & click</span>
              <span className="text-white font-medium bg-blue-600 px-2.5 py-0.5 rounded-md shadow-xs">
                Scan Roof
              </span>
              <span>or use</span>
              <span className="text-slate-800 font-medium bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                Draw Roof
              </span>
              <span>to trace boundary</span>
            </div>
          </div>
        )}
      </section>

      {/* AERIAL IMAGE UPLOAD MODAL */}
      <ImageUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadProcess={segmentUploadedImage}
        loading={isScanning}
      />

      {/* SETTINGS / PARAMETERS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
        onReset={handleResetSettings}
      />

      {/* DETAILED AUDIT REPORT & HISTORY MODAL */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        metrics={metrics}
        recentScans={recentScans}
        onSelectScan={(scan) => {
          if (scan.latitude && scan.longitude) {
            setCenter({ lat: scan.latitude, lng: scan.longitude });
            setAddress(scan.address || 'Cached Site');
            // If cached report has precomputed data, load it directly
            if (scan.usable_area_m2) {
              setMetrics(scan);
              if (scan.rooftop_polygon_geojson?.features) {
                setActiveFacetIds(scan.rooftop_polygon_geojson.features.map(f => f.properties?.id));
              }
            }
          }
        }}
      />

    </div>
  );
}
