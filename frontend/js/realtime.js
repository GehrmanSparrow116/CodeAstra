/**
 * HealthPulse — Health Intelligence Platform
 * File: js/realtime.js
 * Description: Real-Time System Simulation & Animation Engine.
 * 
 * Causality Flow:
 * Incoming Signals -> Preprocessing -> Analytics -> Anomaly Detection ->
 * Risk Re-assessment -> Outbreak Alert Generation -> Prediction Recalculation.
 */

window.HealthPulseRealtime = (() => {
  // Centralized Simulation State
  let savedState = null;
  try {
    const raw = sessionStorage.getItem('healthpulse_realtime_state') || sessionStorage.getItem('codeastra_realtime_state');
    if (raw) savedState = JSON.parse(raw);
  } catch (e) {}

  const realtimeState = savedState || {
    isRunning: true,
    totalCases: 12482,
    hospitalizations: 182,
    activeOutbreaks: 8,
    highRiskRegions: 4,
    ewsScore: 78,
    predictedCases: 571,
    currentCases: 428,
    lastSignalSeconds: 0,
    streamIndex: 1,
    streamHour: 10,
    streamMinute: 45,
    pipelinePhase: 0,
    isAnomalyActive: false,
    activityLog: []
  };

  function persistState() {
    try {
      sessionStorage.setItem('healthpulse_realtime_state', JSON.stringify(realtimeState));
    } catch (e) {}
  }

  const PIPELINE_PHASES = [
    { id: 'ingest', label: 'DATA INGESTION', status: 'Receiving health signals...' },
    { id: 'clean', label: 'PREPROCESSING', status: 'Deduplicating & normalizing...' },
    { id: 'analyze', label: 'ANALYTICS', status: 'Recalculating 4-week rolling trends...' },
    { id: 'detect', label: 'ANOMALY DETECTION', status: 'Running Z-Score threshold scans...' },
    { id: 'score', label: 'RISK ASSESSMENT', status: 'Updating EWS regional contributions...' },
    { id: 'predict', label: 'PREDICTION', status: 'Executing short-term inference...' }
  ];

  // Master Timer Handles
  let clockInterval = null;
  let pipelineInterval = null;
  let kpiInterval = null;
  let streamChartInterval = null;
  let riskScoreInterval = null;
  let predictionInterval = null;
  let anomalyInterval = null;

  function init() {
    console.log('[HealthPulse] Starting Real-Time Health Surveillance Simulation Engine...');

    // Populate initial activity feed items
    initActivityFeed();

    // Start Clock & Ticker
    startClockAndSignalTicker();

    // Start Simulation Loops
    startPipelineCycle();
    startKpiUpdates();
    startStreamChartUpdates();
    startRiskScoreFluctuation();
    startPredictionUpdates();
    startAnomalySimulation();

    // Bind Pause / Resume Button
    setupControls();

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      console.log('[CodeAstra] Reduced motion mode active.');
    }
  }

  // ===========================================================================
  // 1. CLOCK & LIVE SIGNAL TICKER (Every 1 second)
  // ===========================================================================
  function startClockAndSignalTicker() {
    clockInterval = setInterval(() => {
      if (!realtimeState.isRunning) return;

      // Update Live Clock Badge
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const clockEl = document.getElementById('live-time-ticker');
      if (clockEl) {
        clockEl.innerText = timeStr;
      }

      // Update "Last signal" counter
      realtimeState.lastSignalSeconds++;
      const lastSignalEl = document.getElementById('last-signal-timer');
      if (lastSignalEl) {
        lastSignalEl.innerText = `${realtimeState.lastSignalSeconds}s ago`;
      }
      const mapTimerEl = document.getElementById('map-live-status-timer');
      if (mapTimerEl) {
        mapTimerEl.innerText = `${realtimeState.lastSignalSeconds}s ago`;
      }

      // Persist state every 3s
      if (realtimeState.lastSignalSeconds % 3 === 0) {
        persistState();
      }
    }, 1000);
  }

  // ===========================================================================
  // 2. PROCESSING PIPELINE CYCLE (Every 3.5 seconds)
  // ===========================================================================
  function startPipelineCycle() {
    pipelineInterval = setInterval(() => {
      if (!realtimeState.isRunning) return;

      // Advance phase
      realtimeState.pipelinePhase = (realtimeState.pipelinePhase + 1) % PIPELINE_PHASES.length;
      const currentPhase = PIPELINE_PHASES[realtimeState.pipelinePhase];

      // Update Live Status Pill Text
      const statusTextEl = document.getElementById('live-status-text');
      const livePill = document.getElementById('live-indicator-pill');
      if (statusTextEl) {
        statusTextEl.innerText = currentPhase.status;
      }
      if (livePill && !realtimeState.isAnomalyActive) {
        livePill.className = 'live-indicator-pill processing';
        setTimeout(() => {
          if (livePill && !realtimeState.isAnomalyActive) livePill.className = 'live-indicator-pill';
        }, 1500);
      }

      // Highlight corresponding pipeline step in DOM
      const stepItems = document.querySelectorAll('.pipeline-step-item');
      stepItems.forEach((item, idx) => {
        if (idx === realtimeState.pipelinePhase) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }, 3500);
  }

  // ===========================================================================
  // 3. KPI LIVE MICRO-UPDATES (Every 6-8 seconds)
  // ===========================================================================
  function startKpiUpdates() {
    kpiInterval = setInterval(() => {
      if (!realtimeState.isRunning) return;

      // Organic small increment (cases += 1 to 4)
      const increment = Math.floor(Math.random() * 4) + 1;
      realtimeState.totalCases += increment;

      // Hospitalizations react with delay (0 to 1 occasionally)
      if (Math.random() > 0.65) {
        realtimeState.hospitalizations += 1;
      }

      // Update Total Cases KPI Card
      const casesEl = document.querySelector('.kpi-card:nth-child(1) .kpi-value');
      if (casesEl) {
        casesEl.innerText = realtimeState.totalCases.toLocaleString();
        casesEl.classList.add('kpi-value-flash');
        setTimeout(() => casesEl.classList.remove('kpi-value-flash'), 600);
      }

      // Reset last signal counter
      realtimeState.lastSignalSeconds = 0;

      // Smoothly update Disease Distribution Donut and Legend values
      if (typeof DashboardState !== 'undefined' && DashboardState.data && DashboardState.data.diseaseDistribution) {
        const targetDisease = Math.random() > 0.5 ? 'Influenza' : 'Dengue';
        const dItem = DashboardState.data.diseaseDistribution.find(d => d.name === targetDisease);
        if (dItem) {
          dItem.cases += increment;
          const total = DashboardState.data.diseaseDistribution.reduce((acc, d) => acc + d.cases, 0);
          DashboardState.data.diseaseDistribution.forEach(d => {
            d.percentage = parseFloat(((d.cases / total) * 100).toFixed(1));
          });

          const chartsObj = window.HealthPulseCharts || window.CodeAstraCharts;
          if (chartsObj && chartsObj.updateDiseaseDistribution) {
            chartsObj.updateDiseaseDistribution(
              DashboardState.data.diseaseDistribution,
              realtimeState.totalCases.toLocaleString()
            );
          }

          const listItems = document.querySelectorAll('.disease-rank-item');
          DashboardState.data.diseaseDistribution.forEach((d, i) => {
            if (listItems[i]) {
              const pctEl = listItems[i].querySelector('.disease-percent');
              const casesEl = listItems[i].querySelector('.disease-cases-count');
              if (pctEl) pctEl.innerText = `${d.percentage}%`;
              if (casesEl) casesEl.innerText = d.cases.toLocaleString();
            }
          });
        }
      }

      // Log to System Activity
      logActivity('success', `Health signal ingested: +${increment} cases recorded`);
    }, 7000);
  }

  // ===========================================================================
  // 4. CASE TREND STREAM UPDATE (Every 5 seconds)
  // ===========================================================================
  function startStreamChartUpdates() {
    streamChartInterval = setInterval(() => {
      if (!realtimeState.isRunning) return;

      // Advance simulated observation time
      realtimeState.streamMinute += 3;
      if (realtimeState.streamMinute >= 60) {
        realtimeState.streamMinute = 0;
        realtimeState.streamHour += 1;
      }
      const timeLabel = `W52+${realtimeState.streamIndex}`;
      realtimeState.streamIndex++;

      // Compute incremental cases & lagging hospitalizations
      const latestCases = 690 + (realtimeState.streamIndex * 8) + Math.floor(Math.random() * 12);
      const latestHosp = 135 + Math.floor(realtimeState.streamIndex * 1.5) + (Math.random() > 0.5 ? 2 : 0);

      const chartsObj = window.HealthPulseCharts || window.CodeAstraCharts;
      if (chartsObj && chartsObj.appendStreamPoint) {
        chartsObj.appendStreamPoint(timeLabel, latestCases, latestHosp, false);
      }

      realtimeState.lastSignalSeconds = 0;
    }, 5000);
  }

  // ===========================================================================
  // 5. RISK SCORE & CONTRIBUTION FLUCTUATION (Every 14 seconds)
  // ===========================================================================
  function startRiskScoreFluctuation() {
    riskScoreInterval = setInterval(() => {
      if (!realtimeState.isRunning || realtimeState.isAnomalyActive) return;

      // Gentle organic drift: 77 to 79
      const delta = (Math.random() > 0.5 ? 1 : -1);
      realtimeState.ewsScore = Math.max(75, Math.min(80, realtimeState.ewsScore + delta));

      // Update EWS Gauge Chart
      const chartsObj = window.HealthPulseCharts || window.CodeAstraCharts;
      if (chartsObj && chartsObj.updateEwsGauge) {
        chartsObj.updateEwsGauge(realtimeState.ewsScore);
      }

      // Update Gauge Text Overlay
      const scoreEl = document.querySelector('.ews-score-display');
      if (scoreEl) {
        scoreEl.innerHTML = `${realtimeState.ewsScore} <span class="ews-score-max">/ 100</span>`;
      }

      // Update Risk Contribution Bars
      const growthBar = document.querySelector('.contribution-fill.red');
      const densityBar = document.querySelector('.contribution-fill.orange');
      if (growthBar && densityBar) {
        const growthWidth = (realtimeState.ewsScore >= 78 ? 100 : 92);
        growthBar.style.width = `${growthWidth}%`;
      }

      logActivity('info', `Surveillance re-assessment: EWS adjusted to ${realtimeState.ewsScore}/100`);
    }, 14000);
  }

  // ===========================================================================
  // 6. PREDICTION MODEL RE-EVALUATION (Every 18 seconds)
  // ===========================================================================
  function startPredictionUpdates() {
    predictionInterval = setInterval(() => {
      if (!realtimeState.isRunning) return;

      // Subtle prediction adjustment (568 to 576)
      const drift = (Math.random() > 0.5 ? 2 : -2);
      realtimeState.predictedCases = Math.max(565, Math.min(580, realtimeState.predictedCases + drift));

      const predValEl = document.querySelector('.pred-metric-box:nth-child(3) .pred-metric-val');
      if (predValEl) {
        predValEl.innerText = realtimeState.predictedCases;
      }

      const growthRateEl = document.querySelector('.pred-growth-rate');
      if (growthRateEl) {
        const growthRate = (((realtimeState.predictedCases - realtimeState.currentCases) / realtimeState.currentCases) * 100).toFixed(1);
        growthRateEl.innerText = `↑ ${growthRate}%`;
      }

      // Update Mini Prediction Chart
      const chartsObj = window.HealthPulseCharts || window.CodeAstraCharts;
      if (chartsObj && chartsObj.updatePredictionValue) {
        const actual = [310, 360, 395, 428, null];
        const predicted = [null, null, null, 428, realtimeState.predictedCases];
        chartsObj.updatePredictionValue(realtimeState.predictedCases, null, actual, predicted);
      }

      logActivity('success', `Inference engine updated: Projected 7-day cases at ~${realtimeState.predictedCases}`);
    }, 18000);
  }

  // ===========================================================================
  // 7. ANOMALY DETECTION & OUTBREAK ALERT SIMULATION (Every 38-50 seconds)
  // ===========================================================================
  function startAnomalySimulation() {
    anomalyInterval = setInterval(() => {
      if (!realtimeState.isRunning || realtimeState.isAnomalyActive) return;

      // Trigger Anomaly Sequence
      realtimeState.isAnomalyActive = true;
      triggerAnomalyEvent();

      // Reset anomaly active state after 15 seconds
      setTimeout(() => {
        realtimeState.isAnomalyActive = false;
        resetToNormalState();
      }, 15000);
    }, 42000);
  }

  function triggerAnomalyEvent() {
    console.log('[HealthPulse] ⚠ Anomaly Detection Triggered: Statistical spike in Gotham');

    // 1. Live Indicator turns Amber/Warning
    const livePill = document.getElementById('live-indicator-pill');
    const statusTextEl = document.getElementById('live-status-text');
    if (livePill) livePill.className = 'live-indicator-pill warning-mode';
    if (statusTextEl) statusTextEl.innerText = '⚠ Outbreak signal detected: Gotham';

    // 2. Processing Pipeline flags Anomaly Step
    const detectStep = document.querySelector('.pipeline-step-item:nth-child(7)'); // Anomaly Detection item
    if (detectStep) detectStep.classList.add('alert-phase');

    // 3. Leaflet Map Anomaly Pulse on Gotham
    const mapObj = window.HealthPulseMap || window.CodeAstraMap;
    if (mapObj && mapObj.triggerAnomalyPulse) {
      mapObj.triggerAnomalyPulse('Gotham');
    }

    // 4. Early Warning Score bumps to 81
    realtimeState.ewsScore = 81;
    const chartsObj2 = window.HealthPulseCharts || window.CodeAstraCharts;
    if (chartsObj2 && chartsObj2.updateEwsGauge) {
      chartsObj2.updateEwsGauge(81);
    }
    const scoreEl = document.querySelector('.ews-score-display');
    if (scoreEl) scoreEl.innerHTML = `81 <span class="ews-score-max">/ 100</span>`;

    // 5. AI Insights panel reacts
    const aiSummaryEl = document.querySelector('.ai-summary-text');
    if (aiSummaryEl) {
      aiSummaryEl.style.transition = 'opacity 0.3s ease';
      aiSummaryEl.style.opacity = '0';
      setTimeout(() => {
        aiSummaryEl.innerText = 'An unusual spike in Dengue cases has been detected in Gotham relative to the 4-week baseline (Z = 3.54). Emergency surveillance protocol triggered.';
        aiSummaryEl.style.opacity = '1';
      }, 300);
    }

    // 6. Generate New Real-Time Alert in Active Alerts Panel
    addNewOutbreakAlert('Gotham', 'Dengue', 'Statistically significant anomaly detected (Z = 3.54). Case velocity accelerating.');

    // 7. Log Activity
    logActivity('danger', '⚠ Anomaly detected: Statistical spike in Gotham (Z = 3.54)');
    logActivity('warning', '🔴 Outbreak alert broadcast: Gotham — Dengue');
  }

  function resetToNormalState() {
    const livePill = document.getElementById('live-indicator-pill');
    const statusTextEl = document.getElementById('live-status-text');
    if (livePill) livePill.className = 'live-indicator-pill';
    if (statusTextEl) statusTextEl.innerText = 'Dashboard synchronized';

    const detectStep = document.querySelector('.pipeline-step-item:nth-child(7)');
    if (detectStep) detectStep.classList.remove('alert-phase');

    const aiSummaryEl = document.querySelector('.ai-summary-text');
    if (aiSummaryEl) {
      aiSummaryEl.innerText = 'Risk is increasing primarily due to rapid case growth and elevated hospitalization burden in Gotham. The current trend is significantly higher than the expected baseline, indicating a potential outbreak.';
    }
  }

  function addNewOutbreakAlert(region, disease, reason) {
    const container = document.getElementById('alerts-list-container');
    if (!container) return;

    const newAlert = document.createElement('div');
    newAlert.className = 'alert-card-item new-arrival';
    newAlert.innerHTML = `
      <div class="alert-icon-wrapper critical">
        <i data-lucide="alert-circle"></i>
      </div>
      <div class="alert-details-content">
        <div class="alert-top-title-row">
          <span class="alert-headline">Critical outbreak detected</span>
          <span class="alert-time-stamp" style="color:var(--risk-critical); font-weight:700;">Just now</span>
        </div>
        <div class="alert-subtitle-row">${region} • ${disease}</div>
      </div>
    `;

    // Insert at the top of the alerts list
    container.insertBefore(newAlert, container.firstChild);

    // Keep only top 4 alerts to prevent overflow
    if (container.children.length > 4) {
      container.removeChild(container.lastChild);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // ===========================================================================
  // 8. SYSTEM ACTIVITY FEED LOGGING
  // ===========================================================================
  function initActivityFeed() {
    const initialEvents = [
      { type: 'success', text: 'Surveillance stream synchronized across 5 regions', time: '10:42:18' },
      { type: 'info', text: '4-week rolling Z-score baseline recalculated', time: '10:42:15' },
      { type: 'warning', text: 'Elevated growth detected — Gotham (+32.4%)', time: '10:42:09' },
      { type: 'success', text: 'Short-term inference model updated for Week 52', time: '10:42:04' },
      { type: 'info', text: 'Early Warning Score weights normalized', time: '10:41:58' }
    ];

    const feedList = document.getElementById('activity-feed-list');
    if (!feedList) return;

    feedList.innerHTML = '';
    initialEvents.forEach(evt => {
      appendActivityItem(feedList, evt.type, evt.text, evt.time, false);
    });
  }

  function logActivity(type, message) {
    const feedList = document.getElementById('activity-feed-list');
    if (!feedList) return;

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    appendActivityItem(feedList, type, message, timeStr, true);
  }

  function appendActivityItem(container, type, message, timeStr, isNew) {
    const item = document.createElement('div');
    item.className = `activity-feed-item ${isNew ? 'new-item' : ''}`;

    let iconText = '✓';
    if (type === 'warning') iconText = '⚠';
    if (type === 'danger') iconText = '🔴';
    if (type === 'info') iconText = 'ℹ';

    item.innerHTML = `
      <span class="activity-time-stamp">${timeStr}</span>
      <span class="activity-icon-bullet ${type}">${iconText}</span>
      <span class="activity-message-text">${message}</span>
    `;

    container.insertBefore(item, container.firstChild);

    // Keep feed trimmed to 6 items
    if (container.children.length > 6) {
      container.removeChild(container.lastChild);
    }
  }

  // ===========================================================================
  // 9. SIMULATION CONTROLS (Pause / Resume)
  // ===========================================================================
  function setupControls() {
    const btn = document.getElementById('sim-toggle-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      if (realtimeState.isRunning) {
        pause();
      } else {
        resume();
      }
    });
  }

  function pause() {
    realtimeState.isRunning = false;
    const btn = document.getElementById('sim-toggle-btn');
    const livePill = document.getElementById('live-indicator-pill');
    const statusTextEl = document.getElementById('live-status-text');

    if (btn) {
      btn.innerHTML = `<i data-lucide="play" style="width:13px; height:13px;"></i><span>Resume</span>`;
      btn.classList.add('paused');
    }
    if (livePill) livePill.className = 'live-indicator-pill paused';
    if (statusTextEl) statusTextEl.innerText = 'Simulation paused';

    if (window.lucide) window.lucide.createIcons();
    console.log('[HealthPulse] Live simulation paused.');
  }

  function resume() {
    realtimeState.isRunning = true;
    const btn = document.getElementById('sim-toggle-btn');
    const livePill = document.getElementById('live-indicator-pill');
    const statusTextEl = document.getElementById('live-status-text');

    if (btn) {
      btn.innerHTML = `<i data-lucide="pause" style="width:13px; height:13px;"></i><span>Pause</span>`;
      btn.classList.remove('paused');
    }
    if (livePill) livePill.className = 'live-indicator-pill';
    if (statusTextEl) statusTextEl.innerText = 'Receiving health signals...';

    if (window.lucide) window.lucide.createIcons();
    console.log('[HealthPulse] Live simulation resumed.');
  }

  return {
    init,
    pause,
    resume,
    getState: () => ({ ...realtimeState })
  };
})();

window.CodeAstraRealtime = window.HealthPulseRealtime;

// Auto-initialize when DOM and other modules are ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    (window.HealthPulseRealtime || window.CodeAstraRealtime).init();
  }, 1000);
});
