# Final-Year-Major-Project-solar-estimator

## High-Resolution Solar Rooftop Energy Potential Estimator
### Geospatial Earth Observation & Client-Side Vector CAD Platform

An end-to-end full-stack geospatial platform that segments rooftops from sub-meter satellite imagery, calculates geodesic surface areas, and computes annual solar generation potential (kWh), payback periods, financial ROI, and Central Electricity Authority (CEA) calibrated carbon offset metrics.

---

## 🏗️ Project Architecture

- **Frontend**: React 18, Vite, Tailwind CSS, Leaflet, Three.js 3D Earth Globe
- **Backend**: Python 3.11, FastAPI, Uvicorn, OpenCV GrabCut, Shapely, NASA POWER Climatology API
- **Deployment**: Dockerized backend (Render) + Static SPA frontend (Vercel)

---

## 🚀 Quick Start (Local Development)

### 1. Backend
```bash
cd solar-estimator/backend
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend
```bash
cd solar-estimator/frontend
npm install
npm run dev
```
Access at `http://localhost:3000`

