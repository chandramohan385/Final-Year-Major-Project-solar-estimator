import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Helper to extract rings from either Polygon or MultiPolygon
function extractRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') {
    return geometry.coordinates ? [geometry.coordinates[0]] : [];
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates ? geometry.coordinates.map((part) => part[0]) : [];
  }
  return [];
}

// Scanline intersection helper to clip PV grid lines strictly inside arbitrary polygons
function getPolygonIntersectionsAtLat(coords, lat) {
  const xs = [];
  for (let i = 0; i < coords.length - 1; i++) {
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    if ((y1 <= lat && y2 > lat) || (y2 <= lat && y1 > lat)) {
      const t = (lat - y1) / (y2 - y1);
      xs.push(x1 + t * (x2 - x1));
    }
  }
  xs.sort((a, b) => a - b);
  const segments = [];
  for (let i = 0; i < xs.length - 1; i += 2) {
    if (xs[i + 1] - xs[i] > 0.00001) {
      segments.push([xs[i], xs[i + 1]]);
    }
  }
  return segments;
}

export default function MapHUD({
  center,
  zoom,
  onMapClick,
  onCenterChange,
  isScanning,
  geojsonFeatures,
  activeFacetIds,
  onFacetToggle,
  cadMode = 'auto', // 'auto' | 'draw'
  onFinishDrawing,
  onPolygonChange,
  onPolygonCommit,
  onTriggerGlobe
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geojsonLayerRef = useRef(null);
  const panelGridLayersRef = useRef([]);
  const vertexHandlesRef = useRef([]);
  const drawingLayerGroupRef = useRef(null);

  // Single source of truth for the active polygon coordinates [ [lng, lat], ... ]
  const activePolygonRingRef = useRef([]);

  // Drawing state
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      minZoom: 3,
      maxZoom: 22,
      zoomControl: false,
      attributionControl: false
    });

    // Zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // High Resolution Satellite Imagery from Esri (with minZoom to prevent infinite wrap distortion)
    const satelliteTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        minZoom: 3,
        maxNativeZoom: 19,
        maxZoom: 22,
        attribution: 'Esri, Maxar, Earthstar Geographics'
      }
    );

    satelliteTile.addTo(map);

    // Drawing layer group
    drawingLayerGroupRef.current = L.layerGroup().addTo(map);

    // View change listener: triggers 3D Globe when zoomed out to planetary scale
    const handleViewChange = () => {
      const c = map.getCenter();
      const currentZ = map.getZoom();
      if (onCenterChange) {
        onCenterChange({ lat: c.lat, lng: c.lng, zoom: currentZ });
      }
      if (currentZ <= 3 && onTriggerGlobe) {
        onTriggerGlobe();
      }
    };
    map.on('moveend', handleViewChange);
    map.on('zoomend', handleViewChange);

    // Listen to wheel: if user scrolls down at minimum zoom, transition straight to 3D Globe
    const container = mapContainerRef.current;
    const handleContainerWheel = (e) => {
      if (map.getZoom() <= 3 && e.deltaY > 0 && onTriggerGlobe) {
        onTriggerGlobe();
      }
    };
    container.addEventListener('wheel', handleContainerWheel, { passive: true });

    mapInstanceRef.current = map;

    return () => {
      container.removeEventListener('wheel', handleContainerWheel);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Ensure map tiles render properly when container is scrolled into view or resized
  useEffect(() => {
    if (!mapInstanceRef.current || !mapContainerRef.current) return;
    const map = mapInstanceRef.current;

    const invalidate = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', invalidate);
    window.addEventListener('scroll', invalidate, { passive: true });

    let observer = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            map.invalidateSize();
          }
        });
      }, { threshold: [0.1, 0.5, 1.0] });
      observer.observe(mapContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', invalidate);
      window.removeEventListener('scroll', invalidate);
      if (observer) observer.disconnect();
    };
  }, []);

  // Update map center smoothly when center prop changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const current = mapInstanceRef.current.getCenter();
    const dist = Math.hypot(current.lat - center.lat, current.lng - center.lng);
    if (dist > 0.00005) {
      const currentZoom = mapInstanceRef.current.getZoom();
      const targetZoom = Math.min(22, Math.max(zoom || 18, currentZoom));
      mapInstanceRef.current.flyTo([center.lat, center.lng], targetZoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [center.lat, center.lng, zoom]);

  // Handle map clicks and drawing interaction
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    const handleClick = (e) => {
      if (cadMode === 'draw') {
        const newPoint = [e.latlng.lat, e.latlng.lng];
        // Allow user to click any number of corners without arbitrary distance cutoff
        setDrawnPoints((prev) => [...prev, newPoint]);
      } else {
        if (onMapClick) {
          onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      }
    };

    const handleKeyDown = (e) => {
      if (cadMode === 'draw') {
        if (e.key === 'Enter' && drawnPoints.length >= 3) {
          completePolygon([...drawnPoints, drawnPoints[0]]);
        }
      }
    };

    const handleMouseMove = (e) => {
      if (cadMode === 'draw') {
        setMousePos([e.latlng.lat, e.latlng.lng]);
      }
    };

    map.on('click', handleClick);
    map.on('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      map.off('click', handleClick);
      map.off('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cadMode, drawnPoints, onMapClick]);

  // Complete polygon helper
  const completePolygon = (points) => {
    const closed = [...points];
    if (
      closed[0][0] !== closed[closed.length - 1][0] ||
      closed[0][1] !== closed[closed.length - 1][1]
    ) {
      closed.push(closed[0]);
    }
    // GeoJSON is [lng, lat]
    const ring = closed.map((p) => [p[1], p[0]]);
    activePolygonRingRef.current = ring;
    setDrawnPoints([]);
    setMousePos(null);
    if (onFinishDrawing) {
      onFinishDrawing(ring);
    }
  };

  // Render in-progress drawing line and points
  useEffect(() => {
    if (!drawingLayerGroupRef.current) return;
    drawingLayerGroupRef.current.clearLayers();

    if (cadMode !== 'draw' || drawnPoints.length === 0) return;

    // Polyline connecting clicked vertices
    L.polyline(drawnPoints, {
      color: '#2563EB',
      weight: 2.5,
      dashArray: '4, 4'
    }).addTo(drawingLayerGroupRef.current);

    // Live guideline from last vertex to current cursor
    if (mousePos && drawnPoints.length > 0) {
      const lastPoint = drawnPoints[drawnPoints.length - 1];
      L.polyline([lastPoint, mousePos], {
        color: '#60A5FA',
        weight: 1.5,
        dashArray: '2, 4'
      }).addTo(drawingLayerGroupRef.current);
    }

    // Vertex points handles
    drawnPoints.forEach((pt, index) => {
      const isFirst = index === 0;
      const icon = L.divIcon({
        className: `cad-vertex-handle ${isFirst ? 'first-node' : ''}`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker(pt, { icon, interactive: true }).addTo(
        drawingLayerGroupRef.current
      );

      if (isFirst && drawnPoints.length >= 3) {
        marker.bindTooltip('Click to finish rooftop', {
          permanent: true,
          direction: 'top',
          className: 'bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow'
        });
        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          completePolygon([...drawnPoints, drawnPoints[0]]);
        });
      }
    });
  }, [cadMode, drawnPoints, mousePos]);

  // Helper to redraw PV module rows inside a polygon ring
  const redrawPanelGrid = (ringCoords, isActive = true) => {
    if (!mapInstanceRef.current) return;
    // Clear old lines
    panelGridLayersRef.current.forEach((l) => {
      try {
        mapInstanceRef.current.removeLayer(l);
      } catch (e) {}
    });
    panelGridLayersRef.current = [];

    if (!ringCoords || ringCoords.length < 3) return;

    const lats = ringCoords.map((c) => c[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const dLat = maxLat - minLat;
    const numRows = 6;

    for (let r = 1; r < numRows; r++) {
      const rowLat = minLat + (dLat * (r / numRows));
      const segments = getPolygonIntersectionsAtLat(ringCoords, rowLat);

      for (const [xStart, xEnd] of segments) {
        const segWidth = xEnd - xStart;
        if (segWidth > 0.00002) {
          const gridLine = L.polyline(
            [
              [rowLat, xStart + segWidth * 0.05],
              [rowLat, xEnd - segWidth * 0.05]
            ],
            {
              color: isActive ? '#1E40AF' : '#94A3B8',
              weight: 1.4,
              opacity: isActive ? 0.75 : 0.25,
              interactive: false
            }
          );
          gridLine.addTo(mapInstanceRef.current);
          panelGridLayersRef.current.push(gridLine);
        }
      }
    }
  };

  // Render vector polygon overlay & draggable vertex handles
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (cadMode === 'draw' || !geojsonFeatures || !geojsonFeatures.features || geojsonFeatures.features.length === 0) {
      if (geojsonLayerRef.current) {
        mapInstanceRef.current.removeLayer(geojsonLayerRef.current);
        geojsonLayerRef.current = null;
      }
      panelGridLayersRef.current.forEach((l) => {
        try { mapInstanceRef.current.removeLayer(l); } catch (e) {}
      });
      panelGridLayersRef.current = [];
      vertexHandlesRef.current.forEach((m) => {
        try { mapInstanceRef.current.removeLayer(m); } catch (e) {}
      });
      vertexHandlesRef.current = [];
      activePolygonRingRef.current = [];
      return;
    }

    const feature = geojsonFeatures.features[0];
    const incomingRings = extractRings(feature.geometry);
    if (!incomingRings || incomingRings.length === 0) return;

    const incomingRing = incomingRings[0];

    // Check if the geometry matches our current in-memory ring
    // If we are actively editing and length matches, keep existing handles to prevent resetting
    const isSameAsCurrent =
      activePolygonRingRef.current.length === incomingRing.length &&
      activePolygonRingRef.current.length > 0 &&
      Math.abs(activePolygonRingRef.current[0][0] - incomingRing[0][0]) < 0.0000001;

    if (isSameAsCurrent) {
      // Just update layer styling if facet active status changed
      return;
    }

    // New polygon loaded: update ref as source of truth
    activePolygonRingRef.current = incomingRing.map((p) => [...p]);

    // Clean up old layers
    if (geojsonLayerRef.current) {
      mapInstanceRef.current.removeLayer(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }
    panelGridLayersRef.current.forEach((l) => {
      try { mapInstanceRef.current.removeLayer(l); } catch (e) {}
    });
    panelGridLayersRef.current = [];
    vertexHandlesRef.current.forEach((m) => {
      try { mapInstanceRef.current.removeLayer(m); } catch (e) {}
    });
    vertexHandlesRef.current = [];

    const isActive = activeFacetIds.includes(feature.properties?.id);

    // Create Leaflet polygon
    const latLngs = activePolygonRingRef.current.map((c) => [c[1], c[0]]);
    const polygon = L.polygon(latLngs, {
      color: isActive ? '#2563EB' : '#94A3B8',
      weight: 2.5,
      fillColor: isActive ? '#3B82F6' : '#CBD5E1',
      fillOpacity: isActive ? 0.18 : 0.08
    }).addTo(mapInstanceRef.current);

    geojsonLayerRef.current = polygon;

    // Redraw PV module rows
    redrawPanelGrid(activePolygonRingRef.current, isActive);

    // Create interactive, persistent vertex handles for every corner dot
    if (cadMode !== 'draw') {
      const vertices = activePolygonRingRef.current.slice(0, -1);
      vertices.forEach((coord, vIdx) => {
        const icon = L.divIcon({
          className: 'cad-vertex-handle',
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });

        const marker = L.marker([coord[1], coord[0]], {
          icon,
          draggable: true,
          interactive: true
        }).addTo(mapInstanceRef.current);

        // DRAG HANDLER: updates shared ref in-place, adjusts polygon & recalculates metrics live
        marker.on('drag', (e) => {
          const newLat = e.latlng.lat;
          const newLng = e.latlng.lng;

          // MUTATE the shared ref in place so other markers never reset!
          activePolygonRingRef.current[vIdx] = [newLng, newLat];
          if (vIdx === 0) {
            activePolygonRingRef.current[activePolygonRingRef.current.length - 1] = [newLng, newLat];
          }

          // Update SVG polygon path
          polygon.setLatLngs([activePolygonRingRef.current.map((c) => [c[1], c[0]])]);

          // Redraw PV rows
          redrawPanelGrid(activePolygonRingRef.current, isActive);

          // Instant real-time metric update in UI
          if (onPolygonChange) {
            onPolygonChange([...activePolygonRingRef.current]);
          }
        });

        // DRAGEND HANDLER: persists final shape
        marker.on('dragend', () => {
          if (onPolygonCommit) {
            onPolygonCommit([...activePolygonRingRef.current]);
          }
        });

        vertexHandlesRef.current.push(marker);
      });
    }
  }, [geojsonFeatures, activeFacetIds, cadMode]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none bg-slate-100 font-sans ${
        cadMode === 'draw' ? 'cursor-crosshair' : ''
      }`}
    >
      {/* MAP CANVAS */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* CLEAN ARCHITECTURAL CROSSHAIR (SHOWN ONLY IN AUTO-SCAN MODE) */}
      {cadMode === 'auto' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2] pointer-events-none flex items-center justify-center">
          {/* Center circle */}
          <div
            className={`w-28 h-28 rounded-full border transition-all duration-300 ${
              isScanning
                ? 'border-blue-600 scale-110 border-dashed animate-spin'
                : 'border-slate-500/40'
            }`}
          />

          {/* Crosshair lines */}
          <div className="absolute -left-8 w-6 h-[1px] bg-slate-400/80" />
          <div className="absolute -right-8 w-6 h-[1px] bg-slate-400/80" />
          <div className="absolute -top-8 h-6 w-[1px] bg-slate-400/80" />
          <div className="absolute -bottom-8 h-6 w-[1px] bg-slate-400/80" />

          {/* Center Target Point in Royal Blue */}
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white shadow-md" />
        </div>
      )}

      {/* DRAWING MODE STATUS BANNER */}
      {cadMode === 'draw' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-blue-200 shadow-xl flex items-center gap-3 text-xs text-slate-800 animate-fade-in font-roboto">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping shrink-0"></span>
          <span>
            <b>CAD Drawing:</b> Click each corner of the roof ({drawnPoints.length} points placed).
          </span>

          {drawnPoints.length >= 3 && (
            <button
              type="button"
              onClick={() => completePolygon([...drawnPoints, drawnPoints[0]])}
              className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1 active:scale-95"
            >
              <span>✓ Finish Rooftop ({drawnPoints.length} Corners)</span>
            </button>
          )}

          {drawnPoints.length > 0 && (
            <button
              type="button"
              onClick={() => setDrawnPoints((prev) => prev.slice(0, -1))}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
            >
              Undo Point
            </button>
          )}
        </div>
      )}

      {/* DISCRETE COORDINATE BADGE (BOTTOM-LEFT IN LIGHT THEME) */}
      <div className="absolute bottom-24 md:bottom-28 left-4 md:left-6 z-10 pointer-events-none flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
        <span className="font-medium text-slate-900">Lat: {center.lat.toFixed(5)}°</span>
        <span className="text-slate-300">|</span>
        <span className="font-medium text-slate-900">Lng: {center.lng.toFixed(5)}°</span>
      </div>
    </div>
  );
}
