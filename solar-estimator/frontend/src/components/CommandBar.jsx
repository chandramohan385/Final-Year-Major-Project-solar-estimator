import React, { useState } from 'react';
import { Search, Sun, Loader2, Sliders, Upload, FileText, MapPin, X, ChevronDown, PenTool, RotateCcw, Globe, ArrowUp } from 'lucide-react';
import { getGSD } from '../utils/geo.js';

const PRESET_LOCATIONS = [
  { name: 'San Francisco (Silicon Valley)', lat: 37.7749, lng: -122.4194 },
  { name: 'Chilkur Balaji (Telangana)', lat: 17.3502, lng: 78.2864 },
  { name: 'Hyderabad (Hitec City)', lat: 17.4483, lng: 78.3742 },
  { name: 'Dubai (Silicon Oasis)', lat: 25.1228, lng: 55.3781 },
  { name: 'Tokyo (Shinjuku)', lat: 35.6895, lng: 139.6917 },
  { name: 'Sydney (Darling Harbour)', lat: -33.8708, lng: 151.2073 },
  { name: 'Berlin (Mitte)', lat: 52.5200, lng: 13.4050 }
];

export default function CommandBar({
  onSearch,
  onScan,
  isScanning,
  currentAddress,
  zoom = 18,
  center = { lat: 17.385, lng: 78.4867 },
  onOpenUpload,
  onOpenSettings,
  onOpenReports,
  cadMode = 'auto',
  onToggleCadMode,
  onResetRoof,
  viewMode = 'map', // 'map' | 'globe'
  onToggleViewMode,
  onScrollToOverview
}) {
  const [inputVal, setInputVal] = useState(currentAddress || '');
  const [showPresets, setShowPresets] = useState(false);

  React.useEffect(() => {
    if (currentAddress) {
      setInputVal(currentAddress);
    }
  }, [currentAddress]);

  const currentGSD = getGSD(center.lat, zoom);
  const formattedGSD = currentGSD < 0.1 ? currentGSD.toFixed(3) : currentGSD.toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onSearch(inputVal);
    setShowPresets(false);
  };

  const handleSelectPreset = (preset) => {
    setInputVal(preset.name);
    onSearch(preset.name, { lat: preset.lat, lng: preset.lng });
    setShowPresets(false);
  };

  return (
    <header className="absolute top-4 left-4 right-4 z-20 flex flex-col items-center gap-2 font-sans pointer-events-none">
      {/* ENTERPRISE SOLID LIGHT NAVBAR */}
      <div className="w-full bg-white/95 backdrop-blur-md border border-slate-200 h-14 px-4 rounded-xl shadow-md flex items-center justify-between gap-3 pointer-events-auto">
        
        {/* BRAND IDENTITY & OVERVIEW SHORTCUT */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Sun className="w-5 h-5 text-blue-600" />
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide text-slate-900 truncate max-w-[240px] md:max-w-none">
              High-Resolution Solar Rooftop Energy Potential Estimator
            </span>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium shrink-0">
              Enterprise
            </span>
          </div>

          {onScrollToOverview && (
            <button
              type="button"
              onClick={onScrollToOverview}
              className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-blue-700 font-semibold px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors"
              title="Return to Project Documentation, Architecture & Literature Review"
            >
              <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Documentation</span>
            </button>
          )}
        </div>

        {/* CENTER SEARCH & PRIMARY SCAN ACTION */}
        <div className="flex items-center flex-1 max-w-2xl mx-auto h-full py-1.5 gap-2">
          <form 
            onSubmit={handleSubmit} 
            className="flex items-center flex-1 h-10 bg-slate-50 border border-slate-200 rounded-lg px-3 gap-2 focus-within:border-blue-500 focus-within:bg-white transition-colors"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search site address or coordinates (lat, lng)..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="bg-transparent text-xs w-full focus:outline-none placeholder-slate-400 text-slate-900 font-roboto"
            />
            
            {inputVal && (
              <button
                type="button"
                onClick={() => setInputVal('')}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Quick Presets Toggle */}
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="text-xs text-slate-700 hover:text-slate-900 px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 shrink-0 flex items-center gap-1 transition-colors"
            >
              <span>Presets</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </form>

          {/* PRIMARY ACTION: ROYAL SAPPHIRE BLUE BUTTON */}
          <button
            type="button"
            onClick={onScan}
            disabled={isScanning || cadMode === 'draw'}
            className="h-10 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-xs tracking-wide px-4 rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            {isScanning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-white" />
            )}
            <span>{isScanning ? 'Analyzing...' : 'Scan Roof'}</span>
          </button>

          {/* CAD DRAWING TOOL TOGGLE */}
          <button
            type="button"
            onClick={onToggleCadMode}
            title={cadMode === 'draw' ? 'Cancel interactive drawing' : 'Draw exact rooftop polygon (connect the dots)'}
            className={`h-10 px-3.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-sm ${
              cadMode === 'draw'
                ? 'bg-blue-50 border-blue-400 text-blue-700'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">{cadMode === 'draw' ? 'Cancel Drawing' : 'Draw Roof'}</span>
          </button>

          {/* RESET / CLEAR TOOL */}
          {onResetRoof && (
            <button
              type="button"
              onClick={onResetRoof}
              title="Reset rooftop boundaries"
              className="h-10 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shrink-0 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* RIGHT TELEMETRY & TOOLS */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Geospatial Status Pill */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {viewMode === 'globe' ? (
              <span>Orbit: <b>Global 3D Earth</b></span>
            ) : (
              <>
                <span>GSD: <b>{formattedGSD} m/px</b></span>
                <span className="text-slate-300">·</span>
                <span>Zoom: <b>{zoom}x</b></span>
              </>
            )}
            <span className="text-slate-300">·</span>
            <span className="text-blue-600 font-medium">NASA POWER GHI</span>
          </div>

          {/* 3D GLOBE / 2D MAP TOGGLE */}
          <button
            type="button"
            onClick={onToggleViewMode}
            title={viewMode === 'globe' ? "Switch to 2D High-Resolution Rooftop CAD" : "Zoom out to 3D Interactive Earth Globe"}
            className={`h-9 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs ${
              viewMode === 'globe'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{viewMode === 'globe' ? '3D Globe' : 'Globe View'}</span>
          </button>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              type="button"
              onClick={onOpenUpload}
              title="Upload aerial/satellite photo for custom segmentation"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <Upload className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              title="Calibrate Regional Grid, PV Efficiency & Tariffs"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenReports}
              title="View Photovoltaic Audit Reports & Cached Scans"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* PRESETS DROPDOWN IN LIGHT THEME */}
      {showPresets && (
        <div className="pointer-events-auto w-full max-w-xl bg-white border border-slate-200 p-3 rounded-xl shadow-xl flex flex-wrap items-center gap-2 animate-fade-in cursor-default z-30">
          <span className="text-xs text-slate-500 px-1 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-600" /> Presets:
          </span>
          {PRESET_LOCATIONS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-xs bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-lg transition-colors font-roboto cursor-pointer active:scale-95"
            >
              {preset.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowPresets(false)}
            className="ml-auto text-xs text-slate-400 hover:text-slate-700 px-2 py-0.5 cursor-pointer font-medium"
          >
            ✕ Close
          </button>
        </div>
      )}
    </header>
  );
}
