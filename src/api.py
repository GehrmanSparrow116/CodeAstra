import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import pandas as pd
from analytics import load_clean_data, get_overall_stats, calculate_weekly_trends, detect_outbreaks, detect_hotspots, classify_risk
from prediction import prepare_prediction_dataset, train_outbreak_model
from novelty import calculate_ews, get_explainable_ai, get_recommendations, predict_short_term_cases


app = FastAPI(title="Health Outbreak Early Warning System API")

# Ensure static folder exists
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_index():
    with open("static/index.html", "r") as f:
        return f.read()

@app.get("/api/dashboard")
async def get_dashboard_data():
    """F8 & F9: Provides data for the dashboard and alerts."""
    df = load_clean_data()
    
    # F3: Overall stats
    stats = get_overall_stats(df)
    
    # F4: Weekly stats and outbreaks
    weekly_stats, outbreaks = detect_outbreaks(df, z_threshold=2.0)
    
    # Filter outbreaks for the most recent week to generate alerts (F8)
    recent_year = df['year'].max()
    recent_week = df[df['year'] == recent_year]['week'].max()
    recent_outbreaks = outbreaks[(outbreaks['year'] == recent_year) & (outbreaks['week'] == recent_week)]
    
    # F5 & F6: Hotspots and Risk Classification
    hotspots = detect_hotspots(df, recent_year, recent_week, weekly_stats)
    
    # Calculate simple location growth rate for N2 EWS
    prev_week = recent_week - 1 if recent_week > 1 else 52
    prev_year = recent_year if recent_week > 1 else recent_year - 1
    prev_hotspots = detect_hotspots(df, prev_year, prev_week, weekly_stats)
    
    # Merge previous cases to get growth
    hotspots = pd.merge(hotspots, prev_hotspots[['location', 'cases']], on='location', suffixes=('', '_prev'), how='left')
    hotspots['growth_rate'] = ((hotspots['cases'] - hotspots['cases_prev']) / (hotspots['cases_prev'] + 1e-5)) * 100
    hotspots['growth_rate'] = hotspots['growth_rate'].fillna(0)
    
    risk_assessment = classify_risk(hotspots)
    
    # N1-N5 Novelty Integrations
    novelty_data = []
    for _, row in risk_assessment.iterrows():
        ews = calculate_ews(row)
        explanations = get_explainable_ai(row)
        recs = get_recommendations(row['risk_level'])
        predicted_cases = predict_short_term_cases(row['cases'], row['growth_rate'])
        
        novelty_data.append({
            "location": row['location'],
            "case_rate_per_100k": row['case_rate_per_100k'],
            "has_active_outbreak": row['has_active_outbreak'],
            "risk_level": row['risk_level'],
            "ews_score": ews,
            "explanations": explanations,
            "recommendations": recs,
            "predicted_cases_next_week": predicted_cases
        })
    
    # Formatting alerts (F8)
    alerts = []
    for _, row in risk_assessment.iterrows():
        if row['risk_level'] in ['HIGH', 'CRITICAL']:
            alerts.append({
                "location": row['location'],
                "disease": "Multiple/Unknown" if row['has_active_outbreak'] == 1 else "Elevated Risk",
                "risk_level": row['risk_level'],
                "reason": f"Case rate is {row['case_rate_per_100k']:.1f} per 100k." + (" Active outbreak detected." if row['has_active_outbreak'] else ""),
                "timestamp": f"{recent_year}-W{recent_week}"
            })
            
    # Add specific disease alerts
    for _, row in recent_outbreaks.iterrows():
        alerts.append({
            "location": row['location'],
            "disease": row['disease'],
            "risk_level": "CRITICAL",
            "reason": f"Statistically significant outbreak detected (Z-score: {row['z_score']:.2f}). {row['cases']} cases.",
            "timestamp": f"{recent_year}-W{recent_week}"
        })
    
    return JSONResponse(content={
        "summary": stats,
        "risk_assessment": novelty_data,
        "alerts": alerts,
        "current_period": f"Year {recent_year}, Week {recent_week}"
    })

@app.get("/api/config")
async def get_config():
    api_key = os.environ.get("GOOGLE_MAP_API_KEY", "")
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    if not api_key and os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('GOOGLE_MAP_API_KEY='):
                    api_key = line.strip().split('=', 1)[1]
                    break
    return {"GOOGLE_MAP_API_KEY": api_key}


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
