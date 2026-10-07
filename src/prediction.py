import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from analytics import load_clean_data, calculate_weekly_trends, detect_outbreaks

def prepare_prediction_dataset(df):
    """
    Creates a supervised learning dataset to predict if an outbreak will happen NEXT week.
    Features: Current cases, growth rate, rolling mean, rolling std, z_score.
    Target: is_outbreak for week + 1
    """
    # Get weekly stats with outbreaks (this dataframe already has year, week, location, disease, cases, rolling_mean, rolling_std, z_score, is_outbreak)
    weekly_stats, _ = detect_outbreaks(df, z_threshold=2.0)
    
    # Calculate location-specific growth rate
    model_df = weekly_stats.copy()
    model_df = model_df.sort_values(by=['location', 'disease', 'year', 'week'])
    model_df['prev_week_cases'] = model_df.groupby(['location', 'disease'])['cases'].shift(1)
    model_df['growth_rate'] = ((model_df['cases'] - model_df['prev_week_cases']) / (model_df['prev_week_cases'] + 1e-5)) * 100
    model_df['growth_rate'] = model_df['growth_rate'].fillna(0)
    
    # Target: Will there be an outbreak NEXT week?
    # Shift by -1 within each location and disease
    model_df['target_outbreak_next_week'] = model_df.groupby(['location', 'disease'])['is_outbreak'].shift(-1)
    
    # Drop rows where target is NaN (the last week for each group)
    model_df = model_df.dropna(subset=['target_outbreak_next_week'])
    model_df['target_outbreak_next_week'] = model_df['target_outbreak_next_week'].astype(int)
    
    # Fill any remaining NaNs in features
    model_df = model_df.fillna(0)
    
    return model_df

def train_outbreak_model(model_df):
    """
    Train a Random Forest model to predict outbreaks.
    Returns the model and evaluation metrics.
    """
    features = ['cases', 'rolling_mean', 'rolling_std', 'z_score', 'growth_rate']
    X = model_df[features]
    y = model_df['target_outbreak_next_week']
    
    # Train-test split (chronological split is better, but random is fine for prototype baseline)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42, class_weight='balanced')
    model.fit(X_train, y_train)
    
    # Predict
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred, zero_division=0),
        'recall': recall_score(y_test, y_pred, zero_division=0),
        'f1': f1_score(y_test, y_pred, zero_division=0),
        'roc_auc': roc_auc_score(y_test, y_prob)
    }
    
    return model, metrics, features

def main():
    if not os.path.exists('data/processed/clean_health_data.csv'):
        print("Error: clean_health_data.csv not found.")
        return
        
    print("--- F7: Outbreak Prediction (Baseline Model) ---")
    df = load_clean_data()
    
    print("Preparing dataset for machine learning...")
    model_df = prepare_prediction_dataset(df)
    
    print(f"Total samples for training/testing: {len(model_df)}")
    print(f"Positive outbreak class ratio: {model_df['target_outbreak_next_week'].mean():.2%}")
    
    print("\nTraining Random Forest Classifier...")
    model, metrics, features = train_outbreak_model(model_df)
    
    print("\nModel Evaluation Metrics:")
    for k, v in metrics.items():
        print(f"  {k.capitalize():>10}: {v:.4f}")
        
    print("\nFeature Importances:")
    importances = model.feature_importances_
    for f, imp in zip(features, importances):
        print(f"  {f:>15}: {imp:.4f}")

if __name__ == "__main__":
    main()
