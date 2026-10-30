import React, { useState } from 'react';
import { 
  BarChart3, Zap, Leaf, IndianRupee, Trees, Layers, 
  ChevronUp, ChevronDown, CheckCircle2, XCircle, 
  Share2, Sparkles, HelpCircle, MapPin 
} from 'lucide-react';

export default function MetricsPanel({
  metrics,
  activeFacetIds,
  onFacetToggle,
  onOpenReport
}) {
  const [showFacetDetails, setShowFacetDetails] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!metrics) return null;

  const features = metrics.rooftop_polygon_geojson?.features || [];
  const totalFacetsCount = features.length;
  const activeFacets = features.filter((f) => activeFacetIds.includes(f.properties?.id));
  const activeFacetsCount = activeFacets.length;
  
  // Calculate dynamic totals based on active facets
  let dynamicUsableArea = metrics.usable_area_m2;
  let dynamicPanels = metrics.estimated_panels;
  let dynamicKw = metrics.system_capacity_kw;
  let dynamicKwh = metrics.annual_energy_kwh;

  if (totalFacetsCount > 0) {
    if (activeFacetsCount === 0) {
      dynamicUsableArea = 0;
      dynamicPanels = 0;
      dynamicKw = 0;
      dynamicKwh = 0;
    } else if (activeFacetsCount < totalFacetsCount) {
      dynamicUsableArea = Math.round(activeFacets.reduce((acc, f) => acc + (f.properties?.area_m2 || 0), 0) * 10) / 10;
      dynamicPanels = activeFacets.reduce((acc, f) => acc + (f.properties?.panel_capacity || 0), 0);
      dynamicKw = Math.round(((dynamicPanels * 400) / 1000) * 10) / 10;
      dynamicKwh = Math.round(activeFacets.reduce((acc, f) => acc + (f.properties?.annual_kwh || 0), 0));
    }
  }

  // Real-World CEA Decarbonization & Economic Modeling
  const co2Factor = metrics.co2_factor_used || 0.86;
  const dynamicCarbon = Math.round(((dynamicKwh * co2Factor) / 1000) * 10) / 10;
  const dynamicSavings = Math.round(dynamicKwh * 7.50);
  const dynamicCapEx = Math.round(dynamicKw * 55000);
  const dynamicPayback = dynamicSavings > 0 ? Math.round((dynamicCapEx / dynamicSavings) * 10) / 10 : 0;
  
  // 25-Year Compound Degradation Model (0.7%/year PV derating + 8% O&M reserve)
  let lifetimeEnergy = 0;
  for (let yr = 0; yr < 25; yr++) {
    lifetimeEnergy += dynamicKwh * Math.pow(1 - 0.007, yr);
  }
  const dynamicLifetimeSavings = lifetimeEnergy * 7.50 * 0.92;
  const dynamicROI = dynamicCapEx > 0 
    ? Math.round(((dynamicLifetimeSavings - dynamicCapEx) / dynamicCapEx) * 1000) / 10 
    : 0;

  // Site name for collapsed strip
  const siteName = metrics.address ? metrics.address.split(',')[0].replace(/\(.*?\)/g, '').trim() : 'Site';
  const formattedSavings = dynamicSavings >= 100000 
    ? `₹${(dynamicSavings / 100000).toFixed(2)}L/yr`
    : `₹${dynamicSavings.toLocaleString()}/yr`;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl px-4 pointer-events-none font-sans">
      
      {/* COLLAPSED MINI STRIP IN LIGHT THEME */}
      {isCollapsed ? (
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 px-5 py-2.5 rounded-xl flex items-center justify-between shadow-lg transition-all duration-300 ease-out max-w-2xl mx-auto">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 truncate font-roboto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="font-semibold text-slate-900">{siteName}:</span>
            <span className="text-emerald-600 font-bold">{dynamicKw} kWp</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-800 font-bold">{dynamicKwh.toLocaleString()} kWh/yr</span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-600 font-bold">{formattedSavings} Savings</span>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="ml-3 flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 transition-colors shrink-0"
            title="Expand metrics panel"
          >
            <span>Expand</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* EXPANDED ENTERPRISE LIGHT PANEL */
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-xl p-5 md:p-6 relative overflow-hidden transition-all duration-300 ease-out font-roboto">
          
          {/* TOP STATUS BAR */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-slate-900 font-semibold uppercase tracking-wide truncate max-w-[200px] sm:max-w-[340px]">
                {metrics.address || 'Target Site Assessment'}
              </span>
              
              {/* NASA POWER GHI Badge */}
              <div className="relative group/ghi">
                <span className="text-[11px] bg-slate-50 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 flex items-center gap-1.5 cursor-help">
                  <span className="text-blue-600 font-semibold">NASA GHI:</span>
                  <span>{metrics.solar_irradiance_kwh_m2 || 1957} kWh/m²</span>
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                </span>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover/ghi:block w-72 p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 shadow-xl z-50 pointer-events-none">
                  <p className="font-semibold text-slate-900 mb-1">NASA POWER Climatology Dataset</p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Annual Global Horizontal Irradiance (GHI) retrieved directly for these coordinates from NASA's satellite meteorological database.
                  </p>
                </div>
              </div>

              {/* State Grid Badge */}
              {metrics.state_applied && (
                <span className="text-[11px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {metrics.state_applied} Grid
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Facets Expansion */}
              {totalFacetsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowFacetDetails(!showFacetDetails)}
                  className="text-xs text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>{activeFacetsCount}/{totalFacetsCount} Roof Facets</span>
                  {showFacetDetails ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Audit Report Button */}
              <button
                type="button"
                onClick={onOpenReport}
                className="text-xs text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors font-medium shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">Audit Report</span>
              </button>

              {/* Minimize Panel Button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                title="Minimize panel"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Minimize</span>
              </button>
            </div>
          </div>

          {/* 4 CORE METRIC CARDS IN LIGHT THEME */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Pillar 1: Usable Area */}
            <div className="bg-slate-50 border border-slate-200/90 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Usable Roof Area</span>
                <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 shadow-xs">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl md:text-[26px] font-bold text-slate-900 flex items-baseline gap-1 my-1">
                {dynamicUsableArea} <span className="text-xs font-normal text-slate-500">m²</span>
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span>Gross: <b>{metrics.total_area_m2} m²</b></span>
                <span>·</span>
                <span className="text-slate-700 font-medium">~{dynamicPanels} Modules</span>
              </div>
            </div>

            {/* Pillar 2: Estimated Generation */}
            <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-emerald-800 uppercase tracking-wider font-semibold">Est. Generation</span>
                <div className="p-1.5 bg-white border border-emerald-200 rounded-lg text-emerald-600 shadow-xs">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl md:text-[26px] font-bold text-emerald-700 flex items-baseline gap-1 my-1">
                {dynamicKwh.toLocaleString()} <span className="text-xs font-normal text-emerald-800">kWh/yr</span>
              </div>
              <div className="text-xs text-emerald-800 mt-2 flex items-center justify-between">
                <span>Cap: <b>{dynamicKw} kWp</b></span>
                <span>·</span>
                {/* PR Tooltip */}
                <div className="relative group/pr cursor-help">
                  <span className="text-emerald-900 flex items-center gap-0.5 font-medium">
                    PR: 75%
                    <HelpCircle className="w-3 h-3 text-emerald-600" />
                  </span>
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover/pr:block w-64 p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 shadow-xl z-50 pointer-events-none text-left">
                    <p className="font-semibold text-emerald-700 mb-1">Performance Ratio (PR: 75%)</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Standard IEC 61724 system factor accounting for inverter DC-AC conversion, thermal derating, and wiring losses.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 3: Carbon Offset */}
            <div className="bg-slate-50 border border-slate-200/90 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Carbon Offset</span>
                <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-emerald-600 shadow-xs">
                  <Leaf className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl md:text-[26px] font-bold text-emerald-600 flex items-baseline gap-1 my-1">
                {dynamicCarbon} <span className="text-xs font-normal text-slate-500">Tons/yr</span>
              </div>
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <Trees className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ~{Math.round(dynamicCarbon * 45)} Trees
                </span>
                <span>·</span>
                {/* CEA CO2 Factor Tooltip */}
                <div className="relative group/co2 cursor-help">
                  <span className="text-slate-700 flex items-center gap-0.5 font-medium">
                    {co2Factor} kg/kWh
                    <HelpCircle className="w-3 h-3 text-slate-400" />
                  </span>
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover/co2:block w-72 p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 shadow-xl z-50 pointer-events-none text-left">
                    <p className="font-semibold text-slate-900 mb-1">CEA Baseline Grid Factor ({co2Factor} kg/kWh)</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Central Electricity Authority (CEA) official emission baseline for {metrics.state_applied || 'regional grid'}.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 4: Financial Payback & ROI (Clean Royal Blue Theme - No Orange) */}
            <div className="bg-slate-50 border border-slate-200/90 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-1.5">
                <div className="relative group/payback cursor-help flex items-center gap-1">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Payback & ROI</span>
                  <HelpCircle className="w-3 h-3 text-slate-400" />
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover/payback:block w-64 p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 shadow-xl z-50 pointer-events-none text-left">
                    <p className="font-semibold text-blue-700 mb-1">Simple Payback Period</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">Turnkey CapEx (~₹55,000/kWp benchmark) divided by annual electricity bill savings.</p>
                  </div>
                </div>

                <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-blue-600 shadow-xs">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              
              <div className="text-2xl md:text-[26px] font-bold text-blue-600 flex items-baseline gap-1 my-1">
                {dynamicPayback} <span className="text-xs font-normal text-slate-500">Years</span>
              </div>
              
              <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                <span className="font-bold text-slate-900">{formattedSavings}</span>
                <span>·</span>
                {/* ROI (25-Yr) Tooltip */}
                <div className="relative group/roi cursor-help">
                  <span className="text-blue-600 font-bold flex items-center gap-0.5">
                    ROI: {dynamicROI}%
                    <HelpCircle className="w-3 h-3 text-blue-500" />
                  </span>
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover/roi:block w-72 p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 shadow-xl z-50 pointer-events-none text-left">
                    <p className="font-semibold text-blue-700 mb-1">25-Year Compound ROI ({dynamicROI}%)</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Cumulative net return over 25 years factoring 0.7%/year PV cell degradation and an 8% life-cycle maintenance reserve.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* EXPANDABLE ROOF FACETS CONTROLLER (TOGGLE PANELS ON/OFF) */}
          {showFacetDetails && totalFacetsCount > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-900 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Segmented Rooftop Structural Facets</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Click any facet below or on the map to toggle solar modules on that zone
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {features.map((facet) => {
                  const p = facet.properties || {};
                  const isActive = activeFacetIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onFacetToggle(p.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50/60 border-blue-200 text-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold flex items-center gap-1.5">
                          {isActive ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>{p.name?.split(' - ')[0] || p.id}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {p.orientation || 'Standard Pitch'}
                        </div>
                        <div className="text-[11px] text-blue-600 mt-0.5 font-medium">
                          {p.area_m2} m² • {p.panel_capacity} Panels ({p.system_kwp || ((p.panel_capacity * 400)/1000).toFixed(1)} kWp)
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isActive ? 'ACTIVE' : 'OFF'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
