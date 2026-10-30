import React, { useRef } from 'react';
import {
  Sun, ArrowDown, Zap, Leaf, Cpu, Globe2, BarChart3,
  Database, Satellite, MapPin, TrendingUp, CheckCircle, ArrowRight
} from 'lucide-react';

/* ─── tiny helper ─── */
const Tag = ({ children, color = 'slate' }) => {
  const palettes = {
    slate:   'bg-slate-100 text-slate-700 border-slate-200',
    blue:    'bg-blue-50  text-blue-700  border-blue-200',
    amber:   'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border ${palettes[color]}`}>
      {children}
    </span>
  );
};

const SectionLabel = ({ n, label }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{String(n).padStart(2,'0')}</span>
    <div className="h-px w-8 bg-slate-300" />
    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600">{label}</span>
  </div>
);

export default function ProjectHero({ onLaunchMap, onOpenReport }) {
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  /* ── NAV LINKS ── */
  const navLinks = [
    { id: 'sec-abstract',     label: 'Abstract'     },
    { id: 'sec-problem',      label: 'Problem'      },
    { id: 'sec-pipeline',     label: 'Pipeline'     },
    { id: 'sec-formulas',     label: 'Formulations' },
    { id: 'sec-benchmark',    label: 'Benchmark'    },
  ];

  return (
    <div className="w-full text-slate-900" style={{ fontFamily: "'Roboto', sans-serif" }}>

      {/* ════════════════════════════════════════
          NAV
      ════════════════════════════════════════ */}
      <nav className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Sun className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-900 hidden sm:block leading-tight">
              Solar Rooftop Estimator
            </span>
          </div>

          {/* Jump links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map(l => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-[12px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onLaunchMap}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
          >
            Launch Workspace
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>
      </nav>

      {/* ════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════ */}
      <section
        id="sec-abstract"
        className="relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 92% -10%, rgba(251,191,36,0.13) 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 5%  110%, rgba(59,130,246,0.08) 0%, transparent 55%),
            #ffffff
          `
        }}
      >
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-20 pb-24">

          {/* Meta tags */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Tag color="blue">Dept. of Artificial Intelligence</Tag>
            <Tag color="amber">Academic Year 2026–2027</Tag>
            <Tag color="slate">VJIT (Autonomous) · Hyderabad</Tag>
            <Tag color="emerald">Major Project</Tag>
          </div>

          {/* Big editorial headline */}
          <h1
            className="font-black leading-[1.05] tracking-[-0.03em] text-slate-900 max-w-4xl"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}
          >
            High-Resolution{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Solar Rooftop
            </span>{' '}
            <br className="hidden md:block" />
            Energy Potential{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Estimator
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="mt-6 text-base md:text-lg text-slate-500 max-w-3xl leading-relaxed font-normal">
            An open-access geospatial platform replacing expensive on-site solar surveys with
            sub-meter satellite imagery (0.07–0.28 m/px), automated GrabCut roof segmentation,
            vector CAD engine, and NASA POWER irradiance models — producing 25-year financial
            &amp; carbon projections.
          </p>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {[
              {
                label: 'Spatial Resolution',
                value: '0.07 – 0.28',
                unit: 'm / px',
                accent: '#f59e0b',
                bg: '#fffbeb',
                border: '#fde68a',
                icon: <Satellite className="w-4 h-4" style={{ color: '#f59e0b' }} />,
                sub: 'Sub-meter native tile pyramid',
              },
              {
                label: 'Irradiance Source',
                value: 'NASA POWER',
                unit: 'Climatology API',
                accent: '#2563eb',
                bg: '#eff6ff',
                border: '#bfdbfe',
                icon: <Database className="w-4 h-4" style={{ color: '#2563eb' }} />,
                sub: 'Satellite-derived all-sky GHI',
              },
              {
                label: 'CAD Engine',
                value: '100%',
                unit: 'Vector Polygon',
                accent: '#0f172a',
                bg: '#f8fafc',
                border: '#e2e8f0',
                icon: <Cpu className="w-4 h-4" style={{ color: '#0f172a' }} />,
                sub: 'Draggable vertex nodes, client-side',
              },
              {
                label: 'Emission Baseline',
                value: 'CEA v20',
                unit: 'Database',
                accent: '#059669',
                bg: '#ecfdf5',
                border: '#a7f3d0',
                icon: <Leaf className="w-4 h-4" style={{ color: '#059669' }} />,
                sub: 'State-level CO₂ grid factors',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${s.accent}18` }}
                  >
                    {s.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    {s.label}
                  </span>
                </div>
                <div>
                  <div className="font-black text-xl leading-none" style={{ color: s.accent }}>
                    {s.value}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">{s.unit}</div>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 mt-10">
            <button
              onClick={onLaunchMap}
              className="flex items-center gap-2 text-sm font-bold px-6 py-3.5 rounded-xl text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
            >
              <Zap className="w-4 h-4" />
              Launch Interactive Workspace
              <ArrowDown className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={onOpenReport}
              className="flex items-center gap-2 text-sm font-medium px-6 py-3.5 rounded-xl text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
              Technical Specification
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════
          PROBLEM STATEMENT
      ════════════════════════════════════════ */}
      <section id="sec-problem" className="bg-[#f8fafc] py-20 px-4 md:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">

          <SectionLabel n={1} label="Engineering Motivation" />
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight max-w-2xl leading-tight mb-4">
            The Problem{' '}
            <span style={{ color: '#dc2626' }}>Solar Planning</span>{' '}
            Has Today
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl mb-12 leading-relaxed">
            Commercial tools like Helioscope and Aurora Solar cost thousands per project. Manual surveys are
            time-consuming and inaccessible to small-scale adopters across India's distributed rooftop market.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                n: '01',
                title: 'Off-Nadir Skew & Facade Bleeding',
                body: 'Sub-meter satellite cameras captured from non-vertical angles introduce lateral geometric distortion — rooftop boundaries bleed into adjacent wall facades, causing 10–30% area overestimation.',
                accent: '#dc2626',
                bg: '#fff5f5',
              },
              {
                n: '02',
                title: 'Irregular Indian Rooftop Geometry',
                body: 'Indian residential roofs feature non-rectangular multi-wing layouts, parapets, water tanks, and AC units. Standard bounding-box tools overestimate usable area by 20–45%.',
                accent: '#d97706',
                bg: '#fffbeb',
              },
              {
                n: '03',
                title: 'Climatological Data Gap',
                body: 'Most tools use generic irradiance tables. GHI varies ±18% across Indian states. Without calibrated multi-year NASA POWER data, payback models are financially unreliable.',
                accent: '#7c3aed',
                bg: '#f5f3ff',
              },
              {
                n: '04',
                title: 'Carbon Offset Inaccuracy',
                body: 'State-specific CO₂ emission factors (0.49–1.12 kg CO₂/kWh) differ by 2×. Applying national averages systematically underestimates decarbonization impact for green-bond underwriting.',
                accent: '#0369a1',
                bg: '#f0f9ff',
              },
            ].map((c, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 flex gap-4 transition-all hover:shadow-md"
                style={{ background: c.bg, border: `1px solid ${c.accent}22` }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                  style={{ background: `${c.accent}18`, color: c.accent }}
                >
                  {c.n}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">{c.title}</h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════
          SYSTEM PIPELINE
      ════════════════════════════════════════ */}
      <section id="sec-pipeline" className="bg-white py-20 px-4 md:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">

          <SectionLabel n={2} label="System Architecture" />
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight max-w-2xl leading-tight mb-4">
            Four-Stage{' '}
            <span style={{
              background: 'linear-gradient(135deg,#2563eb,#0891b2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Processing Pipeline
            </span>
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl mb-14 leading-relaxed">
            From raw satellite tile to a finalized energy report — every stage is
            deterministic, reproducible, and runs client-side without cloud compute.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: '01',
                title: 'Earth Observation Ingestion',
                desc: 'XYZ tile-server streams sub-meter GeoTIFF imagery. Adaptive tile-fetching by zoom level; off-nadir correction matrix applied.',
                icon: <Globe2 className="w-5 h-5" />,
                accent: '#2563eb',
                bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
              },
              {
                step: '02',
                title: 'Rooftop Segmentation',
                desc: 'Target-seeded GrabCut with iterative refinement. Morphological cleaning removes chimneys, HVAC units, and water tanks.',
                icon: <MapPin className="w-5 h-5" />,
                accent: '#d97706',
                bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
              },
              {
                step: '03',
                title: 'Geodesic CAD Overlay',
                desc: 'Auto-generated SVG polygon snapped to WGS-84 boundary. Draggable vertex editor for manual refinement. Area computed via Shoelace formula.',
                icon: <Cpu className="w-5 h-5" />,
                accent: '#7c3aed',
                bg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)',
              },
              {
                step: '04',
                title: 'Irradiance & Financial Modelling',
                desc: 'NASA POWER multi-year GHI × panel efficiency × area. CEA state emission factor → 25-year CO₂ offset and INR payback schedule.',
                icon: <TrendingUp className="w-5 h-5" />,
                accent: '#059669',
                bg: 'linear-gradient(135deg,#ecfdf5,#d1fae5)',
              },
            ].map((s, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5"
                style={{ background: s.bg, border: `1px solid ${s.accent}30` }}
              >
                {/* big step number watermark */}
                <span
                  className="absolute -bottom-3 -right-1 font-black text-7xl leading-none select-none pointer-events-none"
                  style={{ color: `${s.accent}12` }}
                >
                  {s.step}
                </span>

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.accent}18`, color: s.accent }}
                >
                  {s.icon}
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: s.accent }}>
                    Stage {s.step}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-[12px] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════
          MATHEMATICAL FORMULATIONS
      ════════════════════════════════════════ */}
      <section id="sec-formulas" className="bg-[#f8fafc] py-20 px-4 md:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">

          <SectionLabel n={3} label="Core Mathematics" />
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight max-w-2xl leading-tight mb-4">
            Mathematical{' '}
            <span style={{ color: '#7c3aed' }}>Formulations</span>
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl mb-12 leading-relaxed">
            Every output metric is derived from peer-reviewed equations — no black-box ML inference,
            full audit trail.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                label: 'Energy Yield',
                accent: '#2563eb',
                formula: 'E = A_roof × η_panel × GHI_annual × PR',
                note: 'where PR = performance ratio (0.75–0.85), η = panel efficiency (0.18–0.22), GHI from NASA POWER',
              },
              {
                label: 'Shoelace Area',
                accent: '#d97706',
                formula: 'A = ½ |Σᵢ (xᵢyᵢ₊₁ - xᵢ₊₁yᵢ)|',
                note: 'Applied to WGS-84 projected polygon vertices after Mercator correction for geodesic accuracy',
              },
              {
                label: 'Carbon Offset',
                accent: '#059669',
                formula: 'CO₂_saved = E_annual × EF_state  [kg/yr]',
                note: 'EF_state from CEA National Electricity Plan v20 (2022); ranges 0.49–1.12 kg CO₂/kWh',
              },
              {
                label: 'Simple Payback',
                accent: '#7c3aed',
                formula: 'PBP = CapEx / (E_annual × Tariff_INR)',
                note: 'Tariff sourced from DISCOM state-wise grid data; CapEx = INR 45,000–55,000 per kWp installed',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${f.accent}25` }}
              >
                {/* colored header strip */}
                <div
                  className="px-5 py-3 flex items-center gap-2"
                  style={{ background: `${f.accent}12` }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: f.accent }}
                  />
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: f.accent }}
                  >
                    {f.label}
                  </span>
                </div>
                <div className="bg-[#0f172a] px-5 py-4">
                  <code
                    className="text-sm font-mono text-[#e2e8f0] block leading-relaxed"
                    style={{ wordBreak: 'break-all' }}
                  >
                    {f.formula}
                  </code>
                </div>
                <div className="bg-white px-5 py-3.5">
                  <p className="text-[12px] text-slate-500 leading-relaxed">{f.note}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════
          BENCHMARK TABLE
      ════════════════════════════════════════ */}
      <section id="sec-benchmark" className="bg-white py-20 px-4 md:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">

          <SectionLabel n={4} label="Comparative Analysis" />
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight max-w-2xl leading-tight mb-4">
            How We Compare{' '}
            <span style={{ color: '#059669' }}>Against Alternatives</span>
          </h2>
          <p className="text-slate-500 text-sm max-w-2xl mb-12 leading-relaxed">
            Side-by-side evaluation against commercial leaders and traditional survey methods
            across six critical dimensions.
          </p>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="w-full text-sm border-collapse min-w-[700px]">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)' }}>
                  {['Dimension', 'This Platform', 'Helioscope', 'Aurora Solar', 'Manual Survey'].map((h, i) => (
                    <th
                      key={i}
                      className={`px-5 py-4 text-left font-bold text-xs uppercase tracking-widest
                        ${i === 0 ? 'text-slate-400' : i === 1 ? 'text-amber-400' : 'text-slate-400'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Cost',            'Open-source / Free', '$150–400/mo', '$300–900/mo', 'INR 15,000–50,000'],
                  ['GSD Resolution',  '0.07–0.28 m/px',    '0.3–1.0 m/px','0.15–0.5 m/px','N/A (manual)'],
                  ['Polygon CAD',     'Client-side SVG',   'Server-side', 'Proprietary',  'AutoCAD/manual'],
                  ['Irradiance Data', 'NASA POWER (free)', 'NREL TMY3',   'Solargis',     'Pyranometer'],
                  ['CO₂ Offset',      'CEA State-level',   'EGRID only',  'Regional avg', 'Not computed'],
                  ['Offline Mode',    'Full (WebGL)',       'None',        'None',          'N/A'],
                ].map((row, ri) => (
                  <tr
                    key={ri}
                    className={`border-b border-slate-100 transition-colors ${ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} hover:bg-blue-50/40`}
                  >
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`px-5 py-3.5 ${ci === 0 ? 'font-semibold text-slate-700 text-xs uppercase tracking-wide' : 'text-slate-600 text-[13px]'}
                          ${ci === 1 ? 'font-bold' : ''}`}
                        style={ci === 1 ? { color: '#059669' } : {}}
                      >
                        {ci === 1 && (
                          <span className="mr-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mb-0.5 align-middle" />
                        )}
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════
          FEATURE HIGHLIGHTS STRIP
      ════════════════════════════════════════ */}
      <section className="bg-[#f8fafc] py-16 px-4 md:px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: <Satellite className="w-5 h-5" />, label: 'Sub-meter GSD', accent: '#f59e0b' },
              { icon: <Cpu className="w-5 h-5" />,       label: 'GrabCut AI',    accent: '#2563eb' },
              { icon: <Globe2 className="w-5 h-5" />,    label: '3D Globe View', accent: '#0891b2' },
              { icon: <BarChart3 className="w-5 h-5" />, label: '25-yr Forecast', accent: '#7c3aed' },
              { icon: <Leaf className="w-5 h-5" />,      label: 'CO₂ Tracking',  accent: '#059669' },
              { icon: <Database className="w-5 h-5" />,  label: 'NASA POWER',    accent: '#dc2626' },
            ].map((f, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all text-center"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${f.accent}14`, color: f.accent }}
                >
                  {f.icon}
                </div>
                <span className="text-[12px] font-semibold text-slate-700 leading-tight">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          LAUNCH CTA STRIP
      ════════════════════════════════════════ */}
      <section className="px-4 md:px-8 py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div
            className="rounded-3xl px-8 md:px-14 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 60%, #1e3a5f 100%)',
            }}
          >
            {/* Left */}
            <div className="flex-1 max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                  Ready to Use
                </span>
              </div>
              <h2
                className="font-black text-white leading-tight mb-3"
                style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)' }}
              >
                Launch the{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg,#f59e0b,#ea580c)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  CAD Workspace
                </span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                Navigate the interactive globe, zoom into any rooftop in India, auto-segment
                with GrabCut, then instantly get energy yield, financial payback, and CO₂ offset.
              </p>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-3 shrink-0">
              <button
                onClick={onLaunchMap}
                className="flex items-center gap-2 font-bold text-sm px-7 py-4 rounded-xl text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl active:translate-y-0"
                style={{ background: 'linear-gradient(135deg,#f59e0b,#ea580c)' }}
              >
                <Zap className="w-4 h-4" />
                Launch CAD Workspace
                <ArrowDown className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                No install required · Runs in browser
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
