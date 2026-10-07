import pandas as pd
import numpy as np
import os

def load_clean_data(filepath='data/processed/clean_health_data.csv'):
    df = pd.read_csv(filepath)
    df['date'] = pd.to_datetime(df['date'])
    return df

def get_overall_stats(df):
    """F3: Track total cases, cases by disease, cases by location"""
    total_cases = df['cases'].sum()
    cases_by_disease = df.groupby('disease')['cases'].sum().to_dict()
    cases_by_location = df.groupby('location')['cases'].sum().to_dict()
    
    return {
        'total_cases': int(total_cases),
        'cases_by_disease': cases_by_disease,
        'cases_by_location': cases_by_location
    }

def calculate_weekly_trends(df):
    """F3: Track weekly trends and growth rates"""
    # Group by week and disease
    weekly = df.groupby(['year', 'week', 'disease'])['cases'].sum().reset_index()
    
    # Sort for percentage change calculation
    weekly = weekly.sort_values(by=['disease', 'year', 'week'])
    
    # Calculate weekly growth rate per disease
    weekly['prev_week_cases'] = weekly.groupby('disease')['cases'].shift(1)
    weekly['growth_rate'] = ((weekly['cases'] - weekly['prev_week_cases']) / (weekly['prev_week_cases'] + 1e-5)) * 100
    weekly['growth_rate'] = weekly['growth_rate'].fillna(0).round(2)
    
    return weekly

def detect_outbreaks(df, z_threshold=2.0):
    """
    F4: Detect outbreaks using Z-score on weekly cases per location and disease.
    If weekly cases > mean + z_threshold * std_dev, flag as outbreak.
    """
    # Group by location, disease, week
    weekly = df.groupby(['location', 'disease', 'year', 'week'])['cases'].sum().reset_index()
    weekly = weekly.sort_values(['location', 'disease', 'year', 'week'])
    
    # Calculate rolling mean and std dev (e.g., past 4 weeks) excluding current week
    weekly['rolling_mean'] = weekly.groupby(['location', 'disease'])['cases'].transform(
        lambda x: x.shift(1).rolling(4, min_periods=1).mean()
    )
    weekly['rolling_std'] = weekly.groupby(['location', 'disease'])['cases'].transform(
        lambda x: x.shift(1).rolling(4, min_periods=1).std()
    )
    
    # Handle NaN in std dev (e.g., first week)
    weekly['rolling_std'] = weekly['rolling_std'].fillna(0)
    
    # Calculate Z-score (add small epsilon to avoid division by zero)
    weekly['z_score'] = (weekly['cases'] - weekly['rolling_mean']) / (weekly['rolling_std'] + 1e-5)
    
    # Flag outbreaks
    weekly['is_outbreak'] = (weekly['z_score'] > z_threshold).astype(int)
    
    outbreaks = weekly[weekly['is_outbreak'] == 1].copy()
    return weekly, outbreaks

def detect_hotspots(df, current_year, current_week, weekly_stats):
    """
    F5: Geographic Hotspot Detection.
    Identifies locations with high normalized case rates and rapid growth for the current week.
    Returns a dataframe of locations with their hotspot metrics.
    """
    # Filter for the current week
    current_data = df[(df['year'] == current_year) & (df['week'] == current_week)].copy()
    
    # Aggregate cases and hospitalizations by location
    loc_cases = current_data.groupby(['location', 'population'])[['cases', 'hospitalizations']].sum().reset_index()
    
    # Calculate cases per 100k population
    loc_cases['case_rate_per_100k'] = (loc_cases['cases'] / loc_cases['population']) * 100000
    
    # Check for active outbreaks in this location this week
    loc_outbreaks = weekly_stats[(weekly_stats['year'] == current_year) & 
                                 (weekly_stats['week'] == current_week) & 
                                 (weekly_stats['is_outbreak'] == 1)]
    active_outbreak_locs = loc_outbreaks['location'].unique()
    
    loc_cases['has_active_outbreak'] = loc_cases['location'].isin(active_outbreak_locs).astype(int)
    
    return loc_cases

def classify_risk(hotspot_df):
    """
    F6: Risk Classification.
    Classify risk into LOW, MODERATE, HIGH, CRITICAL based on active outbreaks and case rates.
    """
    def get_risk_level(row):
        score = 0
        if row['has_active_outbreak']:
            score += 50
            
        rate = row['case_rate_per_100k']
        if rate > 50:
            score += 50
        elif rate > 20:
            score += 30
        elif rate > 5:
            score += 10
            
        if score >= 80:
            return 'CRITICAL'
        elif score >= 50:
            return 'HIGH'
        elif score >= 30:
            return 'MODERATE'
        else:
            return 'LOW'
            
    hotspot_df['risk_level'] = hotspot_df.apply(get_risk_level, axis=1)
    return hotspot_df

def main():
    if not os.path.exists('data/processed/clean_health_data.csv'):
        print("Error: clean_health_data.csv not found. Run preprocessing first.")
        return
        
    df = load_clean_data()
    
    # Test F3
    print("--- F3: Overall Stats ---")
    stats = get_overall_stats(df)
    print(f"Total Cases: {stats['total_cases']}")
    print(f"Top Disease: {max(stats['cases_by_disease'], key=stats['cases_by_disease'].get)}")
    
    print("\n--- F3: Trend Analysis ---")
    trends = calculate_weekly_trends(df)
    print(trends.tail(5).to_string(index=False))
    
    # Test F4
    print("\n--- F4: Outbreak Detection ---")
    weekly_stats, outbreaks = detect_outbreaks(df, z_threshold=2.0)
    print(f"Total outbreak events detected (Z > 2.0): {len(outbreaks)}")
    if len(outbreaks) > 0:
        print("\nSample detected outbreaks:")
        print(outbreaks[['location', 'disease', 'year', 'week', 'cases', 'z_score']].head().to_string(index=False))

    # Test F5 & F6 for the most recent week in the dataset
    recent_year = df['year'].max()
    recent_week = df[df['year'] == recent_year]['week'].max()
    
    print(f"\n--- F5 & F6: Hotspot & Risk for Year {recent_year} Week {recent_week} ---")
    hotspots = detect_hotspots(df, recent_year, recent_week, weekly_stats)
    risk_assessment = classify_risk(hotspots)
    print(risk_assessment[['location', 'case_rate_per_100k', 'has_active_outbreak', 'risk_level']].to_string(index=False))

if __name__ == "__main__":
    main()
