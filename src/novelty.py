import pandas as pd
import numpy as np

def calculate_ews(row):
    """
    N2: Early Warning Score (0-100)
    Uses N1 (Multi-Source Data Fusion) by combining cases, hospitalizations, and environmental factors.
    """
    score = 0
    
    # 1. Growth Rate Factor (max 40 pts)
    growth = row.get('growth_rate', 0)
    if growth > 50: score += 40
    elif growth > 20: score += 25
    elif growth > 0: score += 10
        
    # 2. Case Rate Factor (max 30 pts)
    rate = row.get('case_rate_per_100k', 0)
    if rate > 50: score += 30
    elif rate > 20: score += 20
    elif rate > 5: score += 10
        
    # 3. Hospitalization Ratio (max 20 pts)
    cases = row.get('cases', 1)
    hosp = row.get('hospitalizations', 0)
    hosp_ratio = (hosp / max(cases, 1))
    if hosp_ratio > 0.2: score += 20
    elif hosp_ratio > 0.1: score += 10
        
    # 4. Active Outbreak Flag (max 10 pts)
    if row.get('has_active_outbreak', 0) == 1:
        score += 10
        
    return min(100, score)

def get_explainable_ai(row):
    """
    N3: Explainable AI
    Returns a dictionary of factors contributing to the risk/prediction.
    """
    explanations = []
    
    if row.get('growth_rate', 0) > 20:
        explanations.append(f"High case growth (+{row['growth_rate']:.1f}%)")
    if row.get('case_rate_per_100k', 0) > 30:
        explanations.append(f"High case density ({row['case_rate_per_100k']:.1f}/100k)")
    if (row.get('hospitalizations', 0) / max(row.get('cases', 1), 1)) > 0.15:
        explanations.append(f"Elevated hospitalization rate")
    if row.get('has_active_outbreak', 0) == 1:
        explanations.append(f"Statistical anomaly detected")
        
    if not explanations:
        explanations.append("Stable indicators")
        
    return explanations

def get_recommendations(risk_level):
    """
    N5: Action / Resource Recommendation
    Provides non-medical operational recommendations based on risk.
    """
    if risk_level == 'CRITICAL':
        return [
            "Activate emergency response protocols.",
            "Deploy additional hospital beds and testing kits.",
            "Issue immediate public health warnings."
        ]
    elif risk_level == 'HIGH':
        return [
            "Increase monitoring frequency to daily.",
            "Prepare regional health facilities for influx.",
            "Start targeted awareness campaigns."
        ]
    elif risk_level == 'MODERATE':
        return [
            "Review stock of medical supplies.",
            "Monitor trends weekly."
        ]
    else:
        return ["Maintain standard surveillance."]

def predict_short_term_cases(current_cases, growth_rate):
    """
    N4: Short-Term Case Prediction
    Simple extrapolation baseline predicting expected cases next week.
    """
    # Dampen extreme growth for prediction realism
    damped_growth = min(growth_rate, 100) / 100.0
    if damped_growth < -0.5: damped_growth = -0.5
    
    predicted = current_cases * (1 + damped_growth)
    return int(predicted)
