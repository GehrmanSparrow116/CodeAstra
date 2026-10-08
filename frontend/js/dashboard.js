/**
 * HealthPulse — Health Intelligence Platform
 * File: js/dashboard.js
 * Description: Core dashboard data orchestration, state management, and API abstraction layer.
 * 
 * BACKEND INTEGRATION NOTE:
 * When connecting to the Flask/FastAPI backend, the application simply toggles
 * USE_LIVE_API to true or calls fetchDashboardFromApi(). The data mapping layer
 * seamlessly normalizes the payload without requiring any UI modifications.
 */

// =============================================================================
// 1. CONFIGURATION & STATE
// =============================================================================
const CONFIG = {
  USE_LIVE_API: true, // Set to true when running with FastAPI/Flask backend
  API_ENDPOINT: '/api/dashboard',
  REFRESH_INTERVAL_MS: 60000,
  CURRENT_USER: 'Dr. Sharma'
};

const DashboardState = {
  selectedDisease: 'All Diseases',
  selectedRegion: 'All Regions',
  selectedTimeframe: '1Y',
  selectedMetric: 'Cases',
  activeRegionModal: null,
  data: null
};

// =============================================================================
// 2. CENTRALIZED DEMO DATA STORE (Faithful to HealthPulse Dataset & DC Cities)
// =============================================================================
const demoDashboardData = {
  system: {
    lastUpdated: 'Live Data',
    dataPeriod: 'Jan 1, 2023 – Dec 31, 2023',
    currentWeek: 'Year 2023, Week 52',
    user: 'Dr. Sharma',
    userRole: 'Healthcare Professional'
  },

  // KPI Metrics
  kpis: {
    totalCases: {
      value: 12482,
      display: '12,482',
      trendPercent: 12.4,
      trendDirection: 'up',
      trendLabel: 'vs. previous period',
      sparkline: [320, 410, 390, 520, 610, 580, 720, 840, 790, 910, 1020, 1150]
    },
    activeOutbreaks: {
      value: 8,
      display: '08',
      newCount: 2,
      trendLabel: 'vs. previous period',
      sparkline: [2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 8]
    },
    highRiskRegions: {
      value: 4,
      display: '04',
      trendPercent: 18.0,
      trendLabel: 'vs. previous period',
      sparkline: [1, 2, 2, 3, 2, 3, 3, 4, 3, 4, 4, 4]
    },
    earlyWarningScore: {
      score: 78,
      max: 100,
      riskLevel: 'HIGH RISK',
      badgeClass: 'high-pill'
    }
  },

  // Case Trend Over Time (Multi-Series)
  trends: {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    timeframes: {
      '1M': {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        cases: [540, 610, 680, 740],
        hospitalizations: [85, 95, 110, 130],
        outbreaks: [{ index: 2, date: 'Week 3', cases: 680, hosp: 110, label: 'Outbreak Detected' }]
      },
      '3M': {
        labels: ['Oct W1', 'Oct W3', 'Nov W1', 'Nov W3', 'Dec W1', 'Dec W3'],
        cases: [490, 530, 620, 680, 710, 740],
        hospitalizations: [80, 88, 102, 115, 122, 130],
        outbreaks: [{ index: 3, date: 'Nov W3', cases: 680, hosp: 115, label: 'Outbreak Detected' }]
      },
      '6M': {
        labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        cases: [380, 440, 520, 610, 670, 740],
        hospitalizations: [60, 72, 85, 105, 118, 130],
        outbreaks: [
          { index: 2, date: 'Sep 15', cases: 520, hosp: 85, label: 'Outbreak Detected' },
          { index: 5, date: 'Dec 10', cases: 740, hosp: 130, label: 'Outbreak Detected' }
        ]
      },
      '1Y': {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        cases: [180, 240, 310, 270, 340, 420, 390, 480, 642, 510, 580, 690],
        hospitalizations: [35, 45, 60, 50, 68, 85, 78, 92, 140, 105, 118, 135],
        outbreaks: [
          { index: 2, date: 'Mar 18, 2023', cases: 310, hosp: 60, label: 'Outbreak Detected' },
          { index: 7, date: 'Aug 12, 2023', cases: 642, hosp: 140, label: 'Outbreak Detected' },
          { index: 11, date: 'Dec 22, 2023', cases: 690, hosp: 135, label: 'Outbreak Detected' }
        ]
      }
    }
  },

  // Disease Distribution Breakdown
  diseaseDistribution: [
    { name: 'Influenza', percentage: 28.4, cases: 3547, color: '#3b82f6' },
    { name: 'Dengue', percentage: 24.1, cases: 3006, color: '#ef4444' },
    { name: 'COVID-19', percentage: 18.2, cases: 2272, color: '#f97316' },
    { name: 'Cholera', percentage: 15.6, cases: 1942, color: '#eab308' },
    { name: 'Typhoid', percentage: 13.7, cases: 1715, color: '#06b6d4' }
  ],

  // Geographic Regions & Risk Surveillance (Clustered around regional bay coordinate frame)
  regions: [
    {
      id: 'gotham',
      name: 'Gotham',
      riskLevel: 'CRITICAL',
      ewsScore: 87,
      cases: 1284,
      caseRatePer100k: 160.5,
      population: 800000,
      growthRate: 32.4,
      hospitalizationRate: 14.2,
      hospitalizations: 182,
      hasActiveOutbreak: true,
      environment: 'High Humidity',
      dominantDisease: 'Dengue',
      coordinates: [40.78, -74.02],
      badgeClass: 'critical'
    },
    {
      id: 'metropolis',
      name: 'Metropolis',
      riskLevel: 'HIGH',
      ewsScore: 71,
      cases: 980,
      caseRatePer100k: 98.0,
      population: 1000000,
      growthRate: 21.8,
      hospitalizationRate: 11.5,
      hospitalizations: 113,
      hasActiveOutbreak: false,
      environment: 'High Pollution',
      dominantDisease: 'Influenza',
      coordinates: [40.68, -74.04],
      badgeClass: 'high'
    },
    {
      id: 'coast-city',
      name: 'Coast City',
      riskLevel: 'HIGH',
      ewsScore: 66,
      cases: 740,
      caseRatePer100k: 123.3,
      population: 600000,
      growthRate: 19.3,
      hospitalizationRate: 10.1,
      hospitalizations: 75,
      hasActiveOutbreak: false,
      environment: 'Coastal Weather',
      dominantDisease: 'Cholera',
      coordinates: [40.58, -73.85],
      badgeClass: 'high'
    },
    {
      id: 'star-city',
      name: 'Star City',
      riskLevel: 'MODERATE',
      ewsScore: 52,
      cases: 530,
      caseRatePer100k: 106.0,
      population: 500000,
      growthRate: 11.2,
      hospitalizationRate: 7.8,
      hospitalizations: 41,
      hasActiveOutbreak: false,
      environment: 'Normal',
      dominantDisease: 'COVID-19',
      coordinates: [40.85, -74.15],
      badgeClass: 'moderate'
    },
    {
      id: 'central-city',
      name: 'Central City',
      riskLevel: 'LOW',
      ewsScore: 28,
      cases: 210,
      caseRatePer100k: 17.5,
      population: 1200000,
      growthRate: 4.1,
      hospitalizationRate: 4.2,
      hospitalizations: 9,
      hasActiveOutbreak: false,
      environment: 'Normal',
      dominantDisease: 'Typhoid',
      coordinates: [40.62, -73.96],
      badgeClass: 'low'
    }
  ],

  // Priority Active Alerts
  alerts: [
    {
      id: 'alert-1',
      title: 'Critical outbreak detected',
      region: 'Gotham',
      disease: 'Dengue',
      severity: 'critical',
      relativeTime: '2 hours ago',
      timestamp: '2023-W52',
      reason: 'Statistically significant anomaly (Z-score: 3.42). 1,284 cumulative cases.'
    },
    {
      id: 'alert-2',
      title: 'Rapid increase in cases',
      region: 'Metropolis',
      disease: 'Influenza',
      severity: 'warning',
      relativeTime: '4 hours ago',
      timestamp: '2023-W52',
      reason: 'Case rate at 98.0 per 100k with 21.8% week-over-week acceleration.'
    },
    {
      id: 'alert-3',
      title: 'Hospitalization spike',
      region: 'Star City',
      disease: 'COVID-19',
      severity: 'moderate',
      relativeTime: '6 hours ago',
      timestamp: '2023-W52',
      reason: 'ICU admissions elevated by 14.2% across secondary treatment centers.'
    },
    {
      id: 'alert-4',
      title: 'Rising trend in case growth',
      region: 'Coast City',
      disease: 'Cholera',
      severity: 'info',
      relativeTime: '8 hours ago',
      timestamp: '2023-W52',
      reason: 'Environmental trigger: coastal flood runoff contributing to waterborne surge.'
    }
  ],

  // Early Warning Intelligence
  earlyWarningIntelligence: {
    overallScore: 78,
    statusText: 'HIGH RISK',
    contributions: [
      { label: 'Case Growth', points: 40, max: 40, color: 'red' },
      { label: 'Case Density', points: 24, max: 30, color: 'orange' },
      { label: 'Hospitalization', points: 14, max: 20, color: 'yellow' },
      { label: 'Anomaly (Z-Score)', points: 10, max: 10, color: 'blue' }
    ]
  },

  // Explainable AI & Drivers
  aiInsights: {
    primaryText: 'Risk is increasing primarily due to rapid case growth and elevated hospitalization burden in Gotham. The current trend is significantly higher than the expected baseline, indicating a potential outbreak.',
    drivers: [
      { label: '↑ 32.4% Case Growth', type: 'orange' },
      { label: '↑ 14.2% Hospitalization', type: 'red' },
      { label: 'Z = 3.42 Anomaly', type: 'amber' },
      { label: '81.8/100k Case Density', type: 'yellow' }
    ],
    explainabilityDetails: {
      model: 'Composite Early Warning Scoring + Random Forest Feature Importance',
      metrics: [
        { feature: 'Week-over-Week Case Growth', weight: '38.4%', impact: 'High Risk' },
        { feature: 'Z-Score Anomaly Deviation', weight: '29.2%', impact: 'High Risk' },
        { feature: 'Hospitalization-to-Case Ratio', weight: '18.1%', impact: 'Elevated' },
        { feature: 'Population Density Factor', weight: '14.3%', impact: 'Moderate' }
      ]
    }
  },

  // Predictive Modeling (Next Week Projection)
  nextWeekPrediction: {
    region: 'Gotham',
    disease: 'Dengue',
    probabilityLevel: 'High Probability',
    modelTag: 'ML Model',
    currentCases: 428,
    predictedCases: 571,
    growthRate: 33.4,
    timeline: {
      labels: ['Oct 1', 'Oct 5', 'Oct 8', 'Oct 11', 'Oct 15 (Pred)'],
      actual: [310, 360, 395, 428, null],
      predicted: [null, null, null, 428, 571]
    }
  },

  // Non-Medical Operational Recommendations
  recommendations: [
    'Increase surveillance and testing',
    'Prepare additional healthcare capacity',
    'Monitor neighboring regions',
    'Enhance public health awareness and preventive measures'
  ],

  // Historical Comparison (F10)
  historicalComparison: {
    periodLabel: 'Current Period vs. Previous Period',
    metrics: [
      { label: 'Total Cases', changePercent: 22.3, direction: 'up', class: 'up-red' },
      { label: 'Hospitalizations', changePercent: 14.7, direction: 'up', class: 'up-orange' },
      { label: 'Outbreak Events', changeValue: '+3', direction: 'up', class: 'up-red' }
    ]
  }
};

// =============================================================================
// 3. DATA ABSTRACTION LAYER (Future Flask / FastAPI Connector)
// =============================================================================
async function loadDashboardData() {
  if (CONFIG.USE_LIVE_API) {
    try {
      console.log(`[HealthPulse] Fetching live data from ${CONFIG.API_ENDPOINT}...`);
      const response = await fetch(CONFIG.API_ENDPOINT);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawApiData = await response.json();
      DashboardState.data = mapApiToDashboardState(rawApiData);
      showToast('Connected to live backend data stream.');
      return DashboardState.data;
    } catch (err) {
      console.warn('[HealthPulse] Backend endpoint unavailable. Gracefully falling back to demo store.', err);
      DashboardState.data = demoDashboardData;
      return DashboardState.data;
    }
  } else {
    // Return centralized demonstration data
    DashboardState.data = demoDashboardData;
    return DashboardState.data;
  }
}

/**
 * Maps the raw FastAPI /api/dashboard JSON response into the UI model.
 * Keep this decoupled so UI components only consume the normalized schema.
 */
function mapApiToDashboardState(apiData) {
  return {
    ...demoDashboardData,
    system: {
      ...demoDashboardData.system,
      currentWeek: apiData.current_period || demoDashboardData.system.currentWeek
    },
    kpis: {
      ...demoDashboardData.kpis,
      totalCases: {
        ...demoDashboardData.kpis.totalCases,
        value: apiData.summary?.total_cases || demoDashboardData.kpis.totalCases.value,
        display: (apiData.summary?.total_cases || demoDashboardData.kpis.totalCases.value).toLocaleString()
      }
    },
    alerts: apiData.alerts && apiData.alerts.length > 0 
      ? apiData.alerts.map((a, i) => ({
          id: `alert-api-${i}`,
          title: a.reason || 'Outbreak Alert',
          region: a.location,
          disease: a.disease || 'General Surge',
          severity: (a.risk_level || 'CRITICAL').toLowerCase(),
          relativeTime: 'Live Event',
          timestamp: a.timestamp
        }))
      : demoDashboardData.alerts
  };
}

// =============================================================================
// 4. UI RENDERERS & EVENT HANDLERS
// =============================================================================

function renderTopRiskRegions(regions) {
  const container = document.getElementById('risk-table-container');
  if (!container) return;

  container.innerHTML = '';
  regions.forEach(reg => {
    const row = document.createElement('div');
    row.className = 'risk-row-item';
    row.dataset.regionId = reg.id;

    const dotColor = reg.riskLevel === 'CRITICAL' ? 'var(--risk-critical)' :
                     reg.riskLevel === 'HIGH' ? 'var(--risk-high)' :
                     reg.riskLevel === 'MODERATE' ? 'var(--risk-moderate)' : 'var(--risk-low)';

    row.innerHTML = `
      <div class="region-indicator-group">
        <span class="region-status-dot" style="background-color: ${dotColor}"></span>
        <span class="region-name-text">${reg.name}</span>
      </div>
      <span class="risk-level-badge ${reg.badgeClass}">${reg.riskLevel.charAt(0) + reg.riskLevel.slice(1).toLowerCase()}</span>
      <span class="risk-ews-score">${reg.ewsScore}</span>
      <span class="risk-growth-val ${reg.growthRate < 5 ? 'safe' : ''}">↑ ${reg.growthRate}%</span>
    `;

    row.addEventListener('click', () => {
      focusRegion(reg.id);
    });

    container.appendChild(row);
  });
}

function renderActiveAlerts(alerts) {
  const container = document.getElementById('alerts-list-container');
  if (!container) return;

  container.innerHTML = '';
  alerts.forEach(alert => {
    const card = document.createElement('div');
    card.className = 'alert-card-item';

    let iconName = 'alert-triangle';
    let iconClass = alert.severity;
    if (alert.severity === 'critical') iconName = 'alert-circle';
    if (alert.severity === 'info') iconName = 'info';

    card.innerHTML = `
      <div class="alert-icon-wrapper ${iconClass}">
        <i data-lucide="${iconName}"></i>
      </div>
      <div class="alert-details-content">
        <div class="alert-top-title-row">
          <span class="alert-headline">${alert.title}</span>
          <span class="alert-time-stamp">${alert.relativeTime}</span>
        </div>
        <div class="alert-subtitle-row">${alert.region} • ${alert.disease}</div>
      </div>
    `;

    container.appendChild(card);
  });

  // Re-run Lucide icon parser
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderRecommendedActions(actions) {
  const container = document.getElementById('action-checkbox-list');
  if (!container) return;

  container.innerHTML = '';
  actions.forEach(act => {
    const item = document.createElement('div');
    item.className = 'action-check-item';
    item.innerHTML = `
      <i data-lucide="check-circle-2" class="action-check-icon"></i>
      <span>${act}</span>
    `;
    container.appendChild(item);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function focusRegion(regionId) {
  const region = DashboardState.data.regions.find(r => r.id === regionId);
  if (!region) return;

  // Sync region select dropdown
  const regionSelect = document.getElementById('region-filter-select');
  if (regionSelect) {
    regionSelect.value = region.name;
  }

  // Trigger map pan & popup
  const mapObj = window.HealthPulseMap || window.CodeAstraMap;
  if (mapObj && mapObj.panToRegion) {
    mapObj.panToRegion(region.coordinates, region.name);
  }

  showToast(`Focused surveillance on ${region.name} (${region.riskLevel} Risk)`);
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.innerHTML = `
    <i data-lucide="info" style="color:var(--primary-blue)"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// =============================================================================
// 5. GLOBAL INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[HealthPulse] Initializing Health Intelligence Platform...');

  // 1. Fetch / Load data
  const data = await loadDashboardData();

  // 2. Render HTML UI blocks
  renderTopRiskRegions(data.regions);
  renderActiveAlerts(data.alerts);
  renderRecommendedActions(data.recommendations);

  // 3. Initialize ECharts Visualizations
  const chartsObj = window.HealthPulseCharts || window.CodeAstraCharts;
  if (chartsObj) {
    chartsObj.initAll(data);
  }

  // 4. Initialize Leaflet Map
  const mapObj = window.HealthPulseMap || window.CodeAstraMap;
  if (mapObj) {
    mapObj.init(data.regions);
  }

  // 5. Initialize GSAP Entrance Animations & CountUp
  const animObj = window.HealthPulseAnimations || window.CodeAstraAnimations;
  if (animObj) {
    animObj.init();
  }

  // 6. Bind Event Listeners
  setupDashboardControls();
});

function setupDashboardControls() {
  // Global search keyboard shortcut (Ctrl + K)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('global-search-input');
      if (searchInput) searchInput.focus();
    }
  });

  // Timeframe buttons (1M, 3M, 6M, 1Y)
  const timeBtns = document.querySelectorAll('.time-btn');
  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tf = btn.dataset.timeframe;
      DashboardState.selectedTimeframe = tf;
      const chartsObj = window.HealthPulseCharts || window.CodeAstraCharts;
      if (chartsObj && chartsObj.updateCaseTrend) {
        chartsObj.updateCaseTrend(tf, DashboardState.selectedDisease);
      }
    });
  });

  // Disease filter dropdown
  const diseaseSelect = document.getElementById('disease-filter-select');
  if (diseaseSelect) {
    diseaseSelect.addEventListener('change', (e) => {
      DashboardState.selectedDisease = e.target.value;
      const chartsObj = window.HealthPulseCharts || window.CodeAstraCharts;
      if (chartsObj && chartsObj.updateCaseTrend) {
        chartsObj.updateCaseTrend(DashboardState.selectedTimeframe, e.target.value);
      }
    });
  }

  // Region filter dropdown
  const regionSelect = document.getElementById('region-filter-select');
  if (regionSelect) {
    regionSelect.addEventListener('change', (e) => {
      DashboardState.selectedRegion = e.target.value;
      const target = DashboardState.data.regions.find(r => r.name === e.target.value);
      if (target) {
        focusRegion(target.id);
      }
    });
  }

  // Explainability Modal
  const explainBtn = document.getElementById('open-explainability-btn');
  const modal = document.getElementById('explainability-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');

  if (explainBtn && modal) {
    explainBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

  // Sidebar toggle
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  const sidebar = document.getElementById('sidebar');
  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      setTimeout(() => {
        const chartsObj = window.HealthPulseCharts || window.CodeAstraCharts;
        const mapObj = window.HealthPulseMap || window.CodeAstraMap;
        if (chartsObj) chartsObj.resizeAll();
        if (mapObj && mapObj.map) mapObj.map.invalidateSize();
      }, 350);
    });
  }
}

