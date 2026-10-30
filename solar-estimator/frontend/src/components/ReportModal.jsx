import React, { useState } from 'react';
import { FileText, X, Printer, Download, Clock, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export default function ReportModal({
  isOpen,
  onClose,
  metrics,
  recentScans,
  onSelectScan
}) {
  const [activeTab, setActiveTab] = useState('report');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!metrics) return;
    const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar_audit_${metrics.address?.replace(/[^a-zA-Z0-9]/g, '_') || 'report'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const co2Factor = metrics?.co2_factor_used || 0.86;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl p-6 md:p-8 relative max-h-[92vh] overflow-y-auto print:max-h-none print:overflow-visible print:bg-white print:text-black shadow-2xl text-slate-800 font-roboto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="print:hidden absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="print:hidden flex items-center gap-3 border-b border-slate-100 pb-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg transition-colors font-medium ${
              activeTab === 'report'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>SOLAR AUDIT SPECIFICATION</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 text-xs px-3.5 py-2 rounded-lg transition-colors font-medium ${
              activeTab === 'history'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>CACHED SCANS HISTORY ({recentScans?.length || 0})</span>
          </button>
        </div>

        {/* TAB 1: TECHNICAL AUDIT REPORT */}
        {activeTab === 'report' && metrics && (
          <div>
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
              <div>
                <div className="flex items-center gap-2 text-blue-600 text-xs font-bold tracking-wider uppercase">
                  <ShieldCheck className="w-4 h-4" /> HIGH-RESOLUTION PHOTOVOLTAIC FEASIBILITY ASSESSMENT
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mt-1">
                  {metrics.address || 'Target Coordinate Footprint'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  NASA POWER Climatology Solar Data & CEA Grid Baseline (State: {metrics.state_applied || 'Telangana'})
                </p>
              </div>

              {/* Action Buttons */}
              <div className="print:hidden flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 px-3.5 py-2 rounded-lg transition-colors font-medium"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print Report</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJSON}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Engineering Metrics Matrix Table */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  1. GEOSPATIAL & PHYSICAL CHARACTERISTICS
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase font-medium">Gross Building Footprint</span>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{metrics.total_area_m2} m²</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase font-medium">Effective Usable Roof Area</span>
                    <div className="text-xl font-bold text-blue-600 mt-0.5">{metrics.usable_area_m2} m²</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase font-medium">Estimated 400W Modules</span>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{metrics.estimated_panels} Panels</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  2. PHOTOVOLTAIC POWER GENERATION
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase font-medium">Installed Peak Capacity</span>
                    <div className="text-xl font-bold text-emerald-600 mt-0.5">{metrics.system_capacity_kw} kWp</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase font-medium">NASA Solar Irradiance (GHI)</span>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{metrics.solar_irradiance_kwh_m2} kWh/m²/yr</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase font-medium">Est. Annual Yield (Yr 1)</span>
                    <div className="text-xl font-bold text-emerald-600 mt-0.5">{metrics.annual_energy_kwh.toLocaleString()} kWh/yr</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  3. FINANCIAL AMORTIZATION & ECONOMIC RETURN
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase font-medium">Estimated Turnkey CapEx</span>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">₹{metrics.estimated_cost?.toLocaleString()}</div>
                    <span className="text-[11px] text-slate-400">~₹55,000/kWp benchmark</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase font-medium">Annual Tariff Savings</span>
                    <div className="text-xl font-bold text-blue-600 mt-0.5">₹{metrics.annual_savings?.toLocaleString()}/yr</div>
                    <span className="text-[11px] text-slate-400">@ ₹7.50 / kWh standard tariff</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase font-medium">Simple Payback Period</span>
                    <div className="text-xl font-bold text-blue-600 mt-0.5">{metrics.payback_years} Years</div>
                    <span className="text-[11px] text-slate-400">CapEx / Annual Savings</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <span className="text-xs text-slate-500 uppercase font-medium">ROI (25-Yr System Net)</span>
                    <div className="text-xl font-bold text-emerald-600 mt-0.5">{metrics.roi_percentage}%</div>
                    <span className="text-[11px] text-slate-400">Compound 0.7%/yr degradation</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  4. ENVIRONMENTAL DECARBONIZATION IMPACT
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-medium">Grid CO2 Offset ({co2Factor} kg/kWh CEA)</span>
                      <div className="text-xl font-bold text-emerald-600 mt-0.5">{metrics.carbon_offset_tons} Metric Tons / yr</div>
                    </div>
                    <span className="text-xs text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                      {(metrics.carbon_offset_tons * 25).toFixed(1)} Tons / 25 yrs
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-medium">Trees Equivalent Planted</span>
                      <div className="text-xl font-bold text-emerald-600 mt-0.5">{metrics.trees_equivalent || Math.round(metrics.carbon_offset_tons * 45)} Mature Trees</div>
                    </div>
                    <span className="text-xs text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                      Offset Benchmark
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CACHED SCANS HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">PROCESSED SITES & SCANS CACHE</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Saved locally and synchronized with database storage
                </p>
              </div>
            </div>

            {(!recentScans || recentScans.length === 0) ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No previous scans cached yet. Perform a scan on the map to log reports!
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id || scan.created_at}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-xl transition-colors gap-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{scan.address || `${scan.latitude?.toFixed(4)}, ${scan.longitude?.toFixed(4)}`}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                        <span>Area: <b>{scan.usable_area_m2} m²</b></span>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium">Yield: {scan.annual_energy_kwh?.toLocaleString()} kWh/yr</span>
                        <span>•</span>
                        <span className="text-slate-400">{new Date(scan.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectScan(scan);
                        onClose();
                      }}
                      className="self-start sm:self-auto text-xs bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-medium shadow-2xs"
                    >
                      <span>Load Location</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
