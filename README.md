# HealthPulse / CodeAstra — Intelligent Health Outbreak Detection & Early Warning System

## 1. Project Overview
**HealthPulse** (Command Center: *CodeAstra Health Intelligence*) is an end-to-end, multi-tier epidemiological surveillance and early outbreak detection platform. The system ingests multi-dimensional health datasets, monitors disease trajectories, detects spatial and statistical anomalies, calculates an Early Warning Score (EWS), predicts near-future outbreak probabilities using machine learning, and provides dedicated role-based portals for both public citizens and healthcare surveillance professionals.

---

## 2. Problem Statement
Public health authorities, medical professionals, and local communities frequently face delays in receiving actionable, localized intelligence regarding disease surges. Conventional reporting mechanisms often lag by days or weeks, missing critical early intervention windows. HealthPulse bridges this gap by unifying statistical anomaly detection, supervised machine learning, and intuitive geospatial visualization into an interactive early warning ecosystem.

---

## 3. Core Objectives
* **Ingest & Preprocess Multi-Dimensional Data:** Clean, normalize, and impute health surveillance records (cases, hospitalizations, locations, dates).
* **Statistical Anomaly & Outbreak Detection:** Identify sudden spikes via a 4-week rolling Z-score algorithm ($Z > 2.0$).
* **Geospatial Hotspot Mapping:** Calculate normalized case density per 100,000 population and render live interactive maps using OpenStreetMap.
* **Risk Classification & Early Warning Score (EWS):** Transparent 0–100 composite risk scoring mapped to `LOW`, `MODERATE`, `HIGH`, and `CRITICAL`.
* **Predictive ML Modeling:** Forecast near-future outbreak likelihood using Random Forest classification and damped linear trend projections.
* **Role-Based Experience:** 
  * **Public Citizen Portal (HealthPulse):** Clear, localized risk advisories, safety precautions, and active outbreak alerts.
  * **Professional Command Center (CodeAstra):** Deep multi-page analytical dashboard with hotspot maps, ML forecast curves, historical trend comparisons, and AI-driven operational directives.

---

## 4. System Architecture

```
                                  [ Raw / Synthetic Health Data ]
                                                 │
                                                 ▼
                                     [ Data Preprocessing Pipeline ]
                                      (Deduplication, Imputation)
                                                 │
                                                 ▼
                     ┌───────────────────────────┴───────────────────────────┐
                     ▼                                                       ▼
        [ Statistical Analytics Engine ]                            [ Machine Learning Engine ]
   • 4-Week Rolling Z-score ($Z > 2.0$)                      • Random Forest Classifier (Next-Week Risk)
   • Multi-Source EWS Composite (0–100)                      • Short-Term Case Projection Extrapolations
   • Geospatial Hotspot Case Density                         • Explainable AI Risk Driver Extraction
                     │                                                       │
                     └───────────────────────────┬───────────────────────────┘
                                                 ▼
                                     [ FastAPI REST Backend ]
                                 (Serves /api/dashboard & Analytics)
                                                 │
                     ┌───────────────────────────┴───────────────────────────┐
                     ▼                                                       ▼
        [ Public Portal (HealthPulse) ]                     [ Command Center (CodeAstra Pro) ]
   • Interactive 3D Health Core Hero                     • Multi-Page Surveillance Suite (10 Subpages)
   • Citizen Risk Map & Prevention Guidelines            • Leaflet / OpenStreetMap Hotspot Visualizer
   • Localized Community Insights                        • ECharts Analytics, Predictions & Historical
```

---

## 5. Feature Breakdown

### Core Features (PS)
* [x] **F1 — Health Data Collection:** Multi-attribute records containing disease names, symptoms, confirmed cases, dates, population, and locations.
* [x] **F2 — Data Preprocessing:** Missing-value imputation, duplicate removal, date normalization, and logical validation checks.
* [x] **F3 — Disease & Case Monitoring:** Total case tracking, top pathogen distributions, and week-over-week growth rates.
* [x] **F4 — Statistical Outbreak Detection:** 4-week rolling mean & standard deviation anomaly detection ($Z > 2.0$).
* [x] **F5 — Geographic Hotspot Detection:** Normalized infection rates per 100k capita with interactive Leaflet/OpenStreetMap coordinates.
* [x] **F6 — Risk Classification:** Multi-factor classification into `LOW`, `MODERATE`, `HIGH`, and `CRITICAL`.
* [x] **F7 — Outbreak Prediction:** Supervised Random Forest Classifier forecasting next-week outbreak probabilities.
* [x] **F8 — Real-Time Alert System:** Automated threshold-based alert generation for public health authorities.
* [x] **F9 — Professional Dashboard:** Modern glassmorphism UI with real-time simulated telemetry and synchronized ECharts visualizations.
* [x] **F10 — Historical Comparison:** Dedicated historical analysis page comparing multi-year trajectories, peak infection windows, and seasonal baselines.

### Novelty & Advanced Features (N1–N5)
* [x] **N1 — Multi-Source Data Fusion:** Synthesis of confirmed case counts, hospital admission ratios, growth velocity, and active outbreak flags.
* [x] **N2 — Early Warning Score (EWS):** Transparent 0–100 composite risk indicator calculated as:
  $$\text{EWS} = \text{Case Rate Weight (30)} + \text{Growth Velocity (40)} + \text{Hospitalization Ratio (20)} + \text{Active Anomaly (10)}$$
* [x] **N3 — Explainable AI (XAI):** Natural-language risk driver decomposition identifying the exact epidemiological factors behind elevated risk levels.
* [x] **N4 — Short-Term Case Projection:** Damped week-over-week growth extrapolation projecting estimated case volumes for upcoming cycles.
* [x] **N5 — Action & Resource Allocation Directives:** Automated operational and logistical guidance (e.g., ICU readiness, targeted testing, public advisories) based on regional severity.

---

## 6. Technology Stack

### Backend & Machine Learning
* **Language:** Python 3.10+
* **Framework:** FastAPI / Uvicorn
* **Data Processing:** Pandas, NumPy
* **Machine Learning:** Scikit-Learn (Random Forest Classifier)

### Frontend & Data Visualization
* **Architecture:** Modular Vanilla HTML5, CSS3, ES6 JavaScript (No heavyweight framework runtime required)
* **3D Visualizations:** Three.js (Interactive Real-Time Health Intelligence Hero Simulation)
* **Interactive Mapping:** Leaflet.js with OpenStreetMap Tile Integration (No API key needed)
* **Data Charting:** Apache ECharts & Chart.js
* **Micro-Animations & Icons:** GSAP (GreenSock), Lucide Icons

---

## 7. Dataset Details
* **Source:** Synthetic Epidemiological Dataset generated via `src/data_generator.py`.
* **Volume:** 5,050 records across 5 geographic regions (*Metropolis*, *Gotham*, *Star City*, *Central City*, *Coast City*).
* **Attributes:** `date`, `location`, `population`, `environment`, `disease`, `symptoms`, `cases`, `hospitalizations`.
* **Preprocessing Output:** `data/processed/clean_health_data.csv` (Deduplicated, normalized datetime index, 0-imputed missing metrics).

---

## 8. Machine Learning Model Performance
* **Model:** Random Forest Classifier (`src/prediction.py`)
* **Task:** Binary classification predicting `target_outbreak_next_week` (shifted weekly window).
* **Features:** `cases`, `rolling_mean`, `rolling_std`, `z_score`, `growth_rate`, `hospitalizations`.
* **Metrics:**
  * **ROC-AUC:** ~65.3%
  * **Recall:** 46.3% (Prioritizing early detection of true positives in imbalanced outbreak events)
  * **Accuracy:** 61.8%

---

## 9. Application Structure & Navigation

### 1. Common Landing Page (`/index.html`)
* Continuous Three.js animated 3D health surveillance core.
* Interactive 5-step data intelligence pipeline (`Data Ingestion` → `Data Cleaning` → `Anomaly Detection` → `Risk Scoring` → `Action Alerts`).
* Platform capability highlights and quick navigation.

### 2. Role-Based Login (`/login.html`)
* Toggle between **Public Citizen** and **Healthcare Professional** credentials.

### 3. Public Citizen Portal (`/public/`)
* [`public/index.html`](frontend/public/index.html) — Localized community safety index and regional summary.
* [`public/disease-outbreaks.html`](frontend/public/disease-outbreaks.html) — Active outbreak alerts and trend summaries.
* [`public/health-risk-map.html`](frontend/public/health-risk-map.html) — Interactive citizen risk map with safety badges.
* [`public/health-insights.html`](frontend/public/health-insights.html) — Simple, jargon-free health updates.
* [`public/prevention.html`](frontend/public/prevention.html) — Evidence-based citizen prevention and symptom guides.
* [`public/how-it-works.html`](frontend/public/how-it-works.html) — Transparent guide explaining the HealthPulse detection network.

### 4. Professional Command Center (`/pages/` & `/admin-overview.html`)
* [`admin-overview.html`](frontend/admin-overview.html) — Executive surveillance command center with live simulation stream.
* [`pages/disease-trends.html`](frontend/pages/disease-trends.html) — Deep multi-disease timeline curves and growth velocities.
* [`pages/outbreaks.html`](frontend/pages/outbreaks.html) — Active statistical outbreak log and Z-score metrics.
* [`pages/hotspots.html`](frontend/pages/hotspots.html) — Fullscreen OpenStreetMap hotspot analysis with regional overlays.
* [`pages/predictions.html`](frontend/pages/predictions.html) — Machine learning forecast models with confidence intervals.
* [`pages/early-warning.html`](frontend/pages/early-warning.html) — Multi-source Early Warning Score (EWS) matrix.
* [`pages/ai-insights.html`](frontend/pages/ai-insights.html) — Explainable AI risk driver breakdown and action directives.
* [`pages/data-explorer.html`](frontend/pages/data-explorer.html) — Raw and processed data table explorer with instant filtering.
* [`pages/historical.html`](frontend/pages/historical.html) — Multi-season trend and baseline comparison.
* [`pages/settings.html`](frontend/pages/settings.html) & [`pages/profile.html`](frontend/pages/profile.html) — Surveillance threshold configuration and user profile.

---

## 10. How to Run Locally

### Prerequisites
* Python 3.10 or above installed.

### Step 1: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Generate & Preprocess Data (Optional / First Run)
```bash
python src/data_generator.py
python src/data_preprocessing.py
```

### Step 3: Start the Backend API (FastAPI)
```bash
python src/api.py
```
*API will run at:* `http://localhost:8000` *(Interactive docs: `http://localhost:8000/docs`)*

### Step 4: Launch the Frontend Web Server
In a new terminal window:
```bash
python -m http.server 3000 --directory frontend
```
*Open your browser and navigate to:* **`http://localhost:3000`**

---

## 11. Demo Login Credentials

| Role | Username | Password | Target Portal |
| :--- | :--- | :--- | :--- |
| **Public Citizen** | `vinanti` | `pass@123` | **HealthPulse Citizen Portal** (`/public/index.html`) |
| **Healthcare Professional** | `drsharma` | `doctor@123` | **CodeAstra Command Center** (`/admin-overview.html`) |

---

## 12. Disclaimer
*This platform is developed as a research and educational prototype for health intelligence and outbreak surveillance demonstration. It is not intended for direct clinical diagnosis.*
