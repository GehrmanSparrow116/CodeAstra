import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_synthetic_data(num_records=5000, save_path='data/raw/synthetic_health_data.csv'):
    np.random.seed(42)
    
    locations = [
        {'city': 'Metropolis', 'population': 1000000, 'env_risk': 'High Pollution'},
        {'city': 'Gotham', 'population': 800000, 'env_risk': 'High Humidity'},
        {'city': 'Star City', 'population': 500000, 'env_risk': 'Normal'},
        {'city': 'Central City', 'population': 1200000, 'env_risk': 'Normal'},
        {'city': 'Coast City', 'population': 600000, 'env_risk': 'Coastal Weather'}
    ]
    
    diseases = ['Influenza', 'Dengue', 'Cholera', 'COVID-19', 'Typhoid']
    symptoms_list = [
        'Fever, Cough, Fatigue',
        'High Fever, Joint Pain, Rash',
        'Severe Diarrhea, Dehydration',
        'Fever, Dry Cough, Loss of Taste',
        'High Fever, Abdominal Pain, Weakness'
    ]
    
    start_date = datetime(2023, 1, 1)
    
    records = []
    
    for _ in range(num_records):
        loc = np.random.choice(locations)
        disease_idx = np.random.randint(0, len(diseases))
        disease = diseases[disease_idx]
        symptoms = symptoms_list[disease_idx]
        
        # Simulate dates
        date = start_date + timedelta(days=np.random.randint(0, 365))
        
        # Simulate cases (add some occasional outbreaks)
        base_cases = np.random.poisson(10)
        is_outbreak = np.random.random() < 0.05
        if is_outbreak:
            cases = base_cases * np.random.randint(5, 20)
        else:
            cases = base_cases
            
        # Introduce some missing/dirty data for F2 to clean
        if np.random.random() < 0.02:
            cases = np.nan
        
        hospitalizations = 0 if pd.isna(cases) else int(cases * np.random.uniform(0.05, 0.3))
        
        records.append({
            'date': date.strftime('%Y-%m-%d') if np.random.random() > 0.01 else date.strftime('%d/%m/%Y'), # mixed date formats
            'location': loc['city'],
            'population': loc['population'],
            'environment': loc['env_risk'],
            'disease': disease,
            'symptoms': symptoms,
            'cases': cases,
            'hospitalizations': hospitalizations
        })

    df = pd.DataFrame(records)
    
    # Introduce duplicates
    df = pd.concat([df, df.sample(frac=0.01)], ignore_index=True)
    
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    df.to_csv(save_path, index=False)
    print(f"Synthetic dataset generated and saved to {save_path} with {len(df)} records.")
    return df

if __name__ == "__main__":
    generate_synthetic_data()
