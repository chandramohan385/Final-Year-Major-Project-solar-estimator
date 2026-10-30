# High-Resolution Solar Rooftop Energy Potential Estimator
### Tactical Architectural HUD & Deep Learning Geospatial Engine

An end-to-end full-stack geospatial platform that segments rooftops from satellite and aerial imagery using deep learning, calculates physical usable surface areas, and computes annual solar generation potential ($kWh$), payback periods, financial ROI, and carbon offset metrics.

---

## 🏗️ Architecture & Tech Stack

```
solar-estimator/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI Entrypoint & CORS setup
│   │   ├── api/                 # Endpoints (/predict, /estimate, /segment-image, /reports)
│   │   ├── core/                # Config, Supabase client & SQLite persistent cache
│   │   ├── services/            # Esri imagery download & Geospatial Math Engine
│   │   └── ml/                  # PyTorch U-Net segmentation pipeline
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # MapHUD, CommandBar, MetricsPanel, Modals
│   │   ├── hooks/               # useSolarAPI hook
│   │   ├── App.jsx              # Main HUD state orchestrator
│   │   ├── main.jsx             # React entrypoint
│   │   └── index.css            # Tailwind & Cyber HUD Glassmorphic styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
```

### Backend
- **Framework**: Python 3.11, [FastAPI](https://fastapi.tiangolo.com/), Uvicorn
- **ML & Computer Vision**: PyTorch U-Net architecture (`backend/app/ml/segmentation.py` & `backend/app/ml/unet_model.py`) pre-trained on the Massachusetts Buildings Dataset / Inria Aerial Image Dataset standards.
- **Geospatial Math**: [Shapely](https://shapely.readthedocs.io/) geometry manipulation, Web Mercator pixel resolution projection, NASA/NREL solar irradiance modeling.
- **Data Persistence**: [Supabase](https://supabase.com/) client with built-in persistent SQLite cache fallback for instant offline/local execution.

### Frontend
- **Framework**: React 18, [Vite](https://vitejs.dev/)
- **Styling**: Tailwind CSS with custom HUD themes (Cyberpunk Green `#00F5D4`, Volt Yellow `#FEE440`, Radar Cyan `#06B6D4`, Obsidian `#030712`)
- **Map & Canvas**: Leaflet with high-resolution **Esri World Imagery** satellite tiles, custom dynamic targeting reticles, radar sweep animations, and vector polygon overlays.
- **Icons**: Lucide React

---

## 📐 Mathematical Formulation

### 1. Ground Sample Distance (GSD) & Usable Area
At latitude $\phi$ and zoom level $z$ (default $z=18$):
$$\text{Resolution (m/px)} = \frac{156543.03392 \times \cos\left(\frac{\phi \cdot \pi}{180}\right)}{2^z}$$

$$\text{Gross Area } (m^2) = \text{Total Building Pixels} \times \left(\text{Resolution}\right)^2$$

$$\text{Usable Area } (m^2) = \text{Gross Area} \times \text{Usable Fraction } (75\%)$$

### 2. Photovoltaic Energy Yield
$$\text{Annual Energy } (kWh) = \text{Usable Area } (m^2) \times \text{Solar Irradiance } (kWh/m^2/yr) \times \eta_{panel} \times PR$$
- $\eta_{panel}$: Module efficiency (default $20\%$)
- $PR$: Performance ratio / system derate (default $0.75$)

### 3. Decarbonization & Economic Amortization
$$\text{Carbon Offset (Metric Tons/yr)} = \frac{\text{Annual Energy } (kWh) \times 0.82 \text{ kg CO}_2/kWh}{1000}$$

$$\text{Estimated CapEx} = \text{Usable Area} \times \text{Cost per } m^2$$

$$\text{Simple Payback (Years)} = \frac{\text{CapEx}}{\text{Annual Electricity Bill Savings}}$$

$$\text{25-Year ROI } (\%) = \frac{(\text{Savings} \times 25) - \text{CapEx}}{\text{CapEx}} \times 100$$

---

## 🚀 Quickstart Guide

### 1. Launch Backend (FastAPI)
```bash
cd solar-estimator/backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Docs available at: `http://localhost:8000/docs`

### 2. Launch Frontend (Vite React)
```bash
cd solar-estimator/frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🕹️ Interactive HUD Features

1. **Floating Command Bar**:
   - Geocoding address search (OpenStreetMap Nominatim) or manual coordinates (`lat, lng`).
   - Quick City Presets (Hyderabad, San Francisco, Dubai, Tokyo, Sydney, Berlin).
   - "Scan Roof" triggers the architectural radar sweep and deep learning inference.
2. **Tactile Targeting Reticle**:
   - High-tech heads-up display crosshairs, compass bearings (N, S, E, W), live coordinates readout, and click-to-reposition reticle anywhere on Earth.
3. **Interactive Vector Polygon Overlays**:
   - Visualizes segmented roof facets directly on satellite tiles.
   - Click individual facets on the map or bottom drawer to **toggle panels ON/OFF**; all metrics dynamically update in real time!
4. **Aerial Image Segmentation Lab**:
   - Upload drone or satellite photos (JPG, PNG) to run the U-Net inference, view the side-by-side mask overlay, and calculate instantaneous solar outputs.
5. **Solar Audit Specifications & Caching**:
   - Detailed engineering report with printable layout (`window.print()`) and JSON export.
   - Real-time persistent caching of scanned coordinates.
