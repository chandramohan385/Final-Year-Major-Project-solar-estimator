import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure app package is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.api.predict import router as predict_router
from app.api.analytics import router as analytics_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-Resolution Solar Rooftop Energy Potential Estimator with Deep Learning Segmentation and Geospatial Math Engine."
)

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(predict_router, prefix="/api/v1", tags=["Prediction & Estimation"])
app.include_router(analytics_router, prefix="/api/v1", tags=["Analytics & Caching"])

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "endpoints": {
            "estimate": "/api/v1/estimate",
            "predict": "/api/v1/predict",
            "segment_image": "/api/v1/segment-image",
            "reports": "/api/v1/reports",
            "cached_scans": "/api/v1/cached-scans",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
