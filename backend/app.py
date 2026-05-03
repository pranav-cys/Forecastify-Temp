from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os

from model_pipeline import run_pipeline

app = FastAPI()

# ✅ Enable frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# HEALTH CHECK
# =========================
@app.get("/")
def home():
    return {"message": "🚀 Sales Forecast API Running"}

# =========================
# FORECAST ENDPOINT
# =========================
@app.post("/forecast")
async def forecast(file: UploadFile = File(...)):
    try:
        # Save uploaded file
        file_location = f"temp_{file.filename}"

        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run pipeline
        result = run_pipeline(file_location)

        # Delete temp file
        os.remove(file_location)

        # ✅ ALWAYS return required fields
        return {
            "best_model": result.get("best_model", "Unknown"),
            "dates": [str(d) for d in result.get("dates", [])],
            "forecast": [float(x) for x in result.get("forecast", [])],
            "actual_dates": [str(d) for d in result.get("actual_dates", [])],
            "actual_values": [float(x) for x in result.get("actual_values", [])],
            "dashboard_metrics": result.get("dashboard_metrics", {})
        }

    except Exception as e:
        # ❗ NEVER break frontend
        return {
            "best_model": "Error",
            "error": str(e),
            "dates": [],
            "forecast": [],
            "actual_dates": [],
            "actual_values": []
        }