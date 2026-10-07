import pandas as pd
import numpy as np
import os

def load_data(filepath):
    """Load the raw dataset."""
    return pd.read_csv(filepath)

def preprocess_data(df):
    """
    Preprocess the health dataset:
    - Handle missing values
    - Normalize dates
    - Remove duplicates
    - Validate/clean invalid values
    """
    df_clean = df.copy()
    
    print(f"Original records: {len(df_clean)}")
    
    # 1. Remove duplicates
    df_clean.drop_duplicates(inplace=True)
    print(f"Records after dropping duplicates: {len(df_clean)}")
    
    # 2. Date normalization
    # Our data generator injected some d/m/Y dates and Y-m-d dates
    df_clean['date'] = pd.to_datetime(df_clean['date'], format='mixed', dayfirst=False)
    # Sort by date for proper time-series analysis later
    df_clean.sort_values(by=['location', 'disease', 'date'], inplace=True)
    
    # 3. Missing-value handling
    # For 'cases', if missing, we will impute with median of that location+disease 
    # or drop if entirely unavailable. Since it's critical, we'll fill with 0 if unknown.
    missing_cases = df_clean['cases'].isna().sum()
    print(f"Missing cases detected: {missing_cases}")
    df_clean['cases'] = df_clean['cases'].fillna(0).astype(int)
    
    missing_hosp = df_clean['hospitalizations'].isna().sum()
    df_clean['hospitalizations'] = df_clean['hospitalizations'].fillna(0).astype(int)
    
    # 4. Invalid-value detection
    # Ensure cases and hospitalizations are not negative
    df_clean.loc[df_clean['cases'] < 0, 'cases'] = 0
    df_clean.loc[df_clean['hospitalizations'] < 0, 'hospitalizations'] = 0
    
    # Ensure hospitalizations don't exceed cases
    df_clean.loc[df_clean['hospitalizations'] > df_clean['cases'], 'hospitalizations'] = df_clean['cases']
    
    # 5. Feature Engineering / basic validation
    # Extract year, month, week for trend analysis later
    df_clean['year'] = df_clean['date'].dt.year
    df_clean['month'] = df_clean['date'].dt.month
    df_clean['week'] = df_clean['date'].dt.isocalendar().week
    
    print(f"Final records after preprocessing: {len(df_clean)}")
    return df_clean

def save_data(df, filepath):
    """Save the cleaned dataset."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    print(f"Cleaned dataset saved to {filepath}")

def main():
    raw_filepath = 'data/raw/synthetic_health_data.csv'
    processed_filepath = 'data/processed/clean_health_data.csv'
    
    if not os.path.exists(raw_filepath):
        print(f"Error: {raw_filepath} not found.")
        return
        
    df = load_data(raw_filepath)
    df_clean = preprocess_data(df)
    save_data(df_clean, processed_filepath)

if __name__ == "__main__":
    main()
