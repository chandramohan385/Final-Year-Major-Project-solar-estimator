import React from 'react';
import { Sliders, X, RotateCcw, MapPin } from 'lucide-react';

const STATE_PRESETS = [
  { name: 'Telangana', co2: 0.86, tariff: 7.50 },
  { name: 'Andhra Pradesh', co2: 0.84, tariff: 7.25 },
  { name: 'Maharashtra', co2: 0.81, tariff: 8.50 },
  { name: 'Karnataka', co2: 0.72, tariff: 7.00 },
  { name: 'Tamil Nadu', co2: 0.78, tariff: 6.80 },
  { name: 'Delhi', co2: 0.82, tariff: 8.00 },
  { name: 'Rajasthan', co2: 0.94, tariff: 7.50 },
  { name: 'Gujarat', co2: 0.79, tariff: 6.50 },
  { name: 'Uttar Pradesh', co2: 0.88, tariff: 7.50 },
  { name: 'National Average', co2: 0.82, tariff: 7.50 }
];

export default function SettingsModal({ isOpen, onClose, settings, onSave, onReset }) {
  if (!isOpen) return null;

  const handleStateChange = (stateName) => {
    const found = STATE_PRESETS.find(s => s.name === stateName);
    if (found) {
      onSave({
        ...settings,
        state: found.name,
        electricityRate: found.tariff
      });
    } else {
      onSave({ ...settings, state: stateName });
    }
  };

  const currentState = settings.state || 'Telangana';
  const currentPreset = STATE_PRESETS.find(s => s.name === currentState) || STATE_PRESETS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl text-slate-800 font-roboto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-200">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Solar Modeling Parameters & Regional Grid
            </h2>
            <p className="text-xs text-slate-500">
              Calibrate photovoltaic efficiency, Indian CEA decarbonization factors, and tariffs
            </p>
          </div>
        </div>

        {/* Parameters Form */}
        <div className="space-y-4">

          {/* Regional State & CEA Emission Factor */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Indian Regional Grid (CEA Baseline)
              </label>
              <span className="text-xs font-bold text-emerald-600">
                {currentPreset.co2} kg CO₂/kWh
              </span>
            </div>
            
            <select
              value={currentState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-white border border-slate-300 text-xs text-slate-900 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 shadow-xs"
            >
              {STATE_PRESETS.map((st) => (
                <option key={st.name} value={st.name}>
                  {st.name} — CEA: {st.co2} kg CO₂/kWh (Avg Tariff: ₹{st.tariff.toFixed(2)})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-500 mt-1.5">
              Uses Central Electricity Authority (CEA) Baseline Emission Database for regional decarbonization.
            </div>
          </div>
          
          {/* Panel Efficiency */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-800">Photovoltaic Module Efficiency (η)</label>
              <span className="text-xs font-bold text-blue-600">
                {(settings.panelEfficiency * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.25"
              step="0.005"
              value={settings.panelEfficiency}
              onChange={(e) => onSave({ ...settings, panelEfficiency: parseFloat(e.target.value) })}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>Standard Poly (15%)</span>
              <span>Monocrystalline (20%)</span>
              <span>N-Type TOPCon (25%)</span>
            </div>
          </div>

          {/* Performance Ratio */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-800">System Performance Ratio (PR)</label>
              <span className="text-xs font-bold text-emerald-600">
                {(settings.performanceRatio * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.65"
              max="0.85"
              step="0.01"
              value={settings.performanceRatio}
              onChange={(e) => onSave({ ...settings, performanceRatio: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>High Losses (65%)</span>
              <span>Standard IEC (75%)</span>
              <span>Optimized Microinverter (85%)</span>
            </div>
          </div>

          {/* Electricity Tariff */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-800">Electricity Tariff Rate</label>
              <span className="text-xs font-bold text-blue-600">
                ₹{settings.electricityRate} / kWh
              </span>
            </div>
            <input
              type="number"
              step="0.25"
              min="2"
              max="25"
              value={settings.electricityRate}
              onChange={(e) => onSave({ ...settings, electricityRate: parseFloat(e.target.value) || 7.50 })}
              className="w-full bg-white border border-slate-300 text-xs text-slate-900 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>

          {/* System Cost per kWp */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-800">Turnkey Benchmark CapEx (per kWp)</label>
              <span className="text-xs font-bold text-slate-900">
                ₹{settings.costPerKwp?.toLocaleString() || '55,000'} / kWp
              </span>
            </div>
            <input
              type="number"
              step="2500"
              min="35000"
              max="90000"
              value={settings.costPerKwp || 55000}
              onChange={(e) => onSave({ ...settings, costPerKwp: parseFloat(e.target.value) || 55000.0 })}
              className="w-full bg-white border border-slate-300 text-xs text-slate-900 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 shadow-xs"
            />
            <div className="text-[11px] text-slate-500 mt-1">
              Standard commercial & residential turnkey installation in India (~₹50,000 - ₹60,000/kWp)
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-5">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-all shadow-sm"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
}
