/**
 * HealthPulse — Health Intelligence Platform
 * File: js/pages/outbreaks.js
 * Description: Dedicated page controller for Outbreak Monitoring, Active Alerts Feed & Severity Breakdown.
 */

(function () {
  'use strict';

  let severityChart = null;

  const demoAlerts = [
    {
      id: 'alt-1',
      severity: 'critical',
      headline: 'Critical Dengue Surge in Gotham',
      location: 'Gotham &bull; Sector 4',
      time: '12 mins ago',
      cases: '428 (+32.4%)',
      hosp: '74 (17.3%)',
      ews: '87 / 100',
      description: 'Significant anomaly deviation (Z = 3.42). Vector index and positivity rates exceeding critical epidemic threshold.'
    },
    {
      id: 'alt-2',
      severity: 'warning',
      headline: 'Influenza Cluster Detected in Metropolis',
      location: 'Metropolis &bull; North Ward',
      time: '45 mins ago',
      cases: '312 (+21.8%)',
      hosp: '42 (13.5%)',
      ews: '71 / 100',
      description: 'Elevated influenza A positivity with rising primary care visit density.'
    },
    {
      id: 'alt-3',
      severity: 'warning',
      headline: 'Cholera Waterborne Spike in Coast City',
      location: 'Coast City &bull; Coastal Zone',
      time: '2 hours ago',
      cases: '198 (+19.3%)',
      hosp: '38 (19.2%)',
      ews: '66 / 100',
      description: 'Waterborne contamination signal flagged following heavy coastal rainfall.'
    },
    {
      id: 'alt-4',
      severity: 'moderate',
      headline: 'COVID-19 Variant Cluster in Star City',
      location: 'Star City &bull; East District',
      time: '4 hours ago',
      cases: '245 (+11.2%)',
      hosp: '28 (11.4%)',
      ews: '52 / 100',
      description: 'Gradual increase in test positivity rate, ICU capacity remaining stable.'
    },
    {
      id: 'alt-5',
      severity: 'info',
      headline: 'Typhoid Baseline Normalization in Central City',
      location: 'Central City &bull; Metro',
      time: '6 hours ago',
      cases: '114 (+4.1%)',
      hosp: '12 (10.5%)',
      ews: '28 / 100',
      description: 'Outbreak containment protocols effective. New transmission dropping.'
    }
  ];

  function renderAlerts(filter = 'all') {
    const container = document.getElementById('outbreaks-feed-container');
    if (!container) return;

    const filtered = filter === 'all' 
      ? demoAlerts 
      : demoAlerts.filter(a => a.severity.toLowerCase() === filter.toLowerCase());

    container.innerHTML = filtered.map(alert => `
      <div class="outbreak-timeline-item">
        <div class="alert-icon-wrapper ${alert.severity}" style="width:40px; height:40px;">
          <i data-lucide="${alert.severity === 'critical' ? 'alert-octagon' : (alert.severity === 'warning' ? 'alert-triangle' : 'info')}"></i>
        </div>
        <div class="outbreak-item-body">
          <div class="outbreak-item-header">
            <div>
              <div class="outbreak-title">${alert.headline}</div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                ${alert.location} &bull; <span style="font-weight:600;">${alert.time}</span>
              </div>
            </div>
            <span class="risk-level-badge ${alert.severity}">${alert.severity.toUpperCase()}</span>
          </div>
          <p style="font-size:0.82rem; color:var(--text-secondary); line-height:1.45; margin:6px 0;">
            ${alert.description}
          </p>
          <div class="outbreak-stats-grid">
            <div class="outbreak-stat-box">
              <span class="outbreak-stat-label">Active Cases</span>
              <span class="outbreak-stat-val">${alert.cases}</span>
            </div>
            <div class="outbreak-stat-box">
              <span class="outbreak-stat-label">Hospitalizations</span>
              <span class="outbreak-stat-val">${alert.hosp}</span>
            </div>
            <div class="outbreak-stat-box">
              <span class="outbreak-stat-label">EWS Index</span>
              <span class="outbreak-stat-val" style="color:var(--risk-critical);">${alert.ews}</span>
            </div>
            <div class="outbreak-stat-box">
              <span class="outbreak-stat-label">Action Status</span>
              <span class="outbreak-stat-val" style="color:var(--primary-blue);">Surveillance Active</span>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  function initSeverityChart() {
    const el = document.getElementById('outbreak-severity-chart');
    if (!el || typeof echarts === 'undefined') return;

    severityChart = echarts.init(el);
    const option = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      series: [
        {
          name: 'Outbreak Severity',
          type: 'pie',
          radius: ['45%', '75%'],
          itemStyle: { borderRadius: 6, borderColor: '#ffffff', borderWidth: 2 },
          data: [
            { name: 'Critical (EWS > 80)', value: 2, itemStyle: { color: '#ef4444' } },
            { name: 'High / Warning (EWS 61-80)', value: 3, itemStyle: { color: '#f97316' } },
            { name: 'Moderate (EWS 31-60)', value: 2, itemStyle: { color: '#eab308' } },
            { name: 'Low / Contained (EWS < 30)', value: 1, itemStyle: { color: '#10b981' } }
          ]
        }
      ]
    };
    severityChart.setOption(option);
  }

  function setupFilters() {
    const filterBtns = document.querySelectorAll('.severity-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const severity = btn.getAttribute('data-severity');
        renderAlerts(severity);
      });
    });

    window.addEventListener('resize', () => {
      if (severityChart) severityChart.resize();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderAlerts('all');
    initSeverityChart();
    setupFilters();
  });

})();
