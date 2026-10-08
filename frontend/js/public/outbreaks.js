/**
 * HealthPulse — Public / End-User Health Portal
 * File: js/public/outbreaks.js
 * Description: Controller for Disease Outbreaks page — Filter controls, interactive cards & detail drawer.
 */

window.HealthPulseOutbreaks = (() => {
  const OUTBREAK_DATA = [
    {
      id: "dengue",
      name: "Dengue Fever",
      icon: "🦟",
      status: "High Activity",
      risk: "HIGH",
      trend: "↑ Increasing (+18.4%)",
      cases: 3035,
      regions: ["Metropolis", "Coast City", "Gotham"],
      summary: "Mosquito-borne viral infection showing increased transmission in urban and coastal districts.",
      symptoms: ["High fever & sudden chills", "Severe headache & pain behind eyes", "Joint and muscle aches ('breakbone fever')", "Fatigue & mild nausea"],
      transmission: "Transmitted primarily by infected female Aedes mosquitoes. Standing water in containers provides breeding grounds.",
      prevention: "Remove standing water weekly, wear long sleeves, use insect repellent containing DEET, and keep windows screened.",
      whenToSeekHelp: "Seek emergency medical care if you experience severe abdominal pain, persistent vomiting, mucosal bleeding, or severe lethargy."
    },
    {
      id: "influenza",
      name: "Seasonal Influenza",
      icon: "🤧",
      status: "Critical Activity",
      risk: "CRITICAL",
      trend: "↑ High Spike (+24.1%)",
      cases: 4120,
      regions: ["Gotham", "Central City", "Star City"],
      summary: "Contagious respiratory illness experiencing a sharp seasonal surge in crowded municipal sectors.",
      symptoms: ["Fever or feeling feverish/chills", "Cough & sore throat", "Runny or stuffy nose", "Body aches & headache", "Fatigue"],
      transmission: "Spreads mainly by droplets made when people with flu cough, sneeze, or talk.",
      prevention: "Get vaccinated annually, wash hands frequently with soap, avoid touching eyes/nose, and stay home when feeling unwell.",
      whenToSeekHelp: "Consult a doctor immediately if experiencing shortness of breath, chest pressure, persistent dizziness, or confusion."
    },
    {
      id: "covid19",
      name: "COVID-19 (Sub-variant)",
      icon: "🦠",
      status: "Low Activity",
      risk: "LOW",
      trend: "↓ Decreasing (-4.2%)",
      cases: 1840,
      regions: ["Star City", "Metropolis"],
      summary: "Respiratory viral activity remains low to moderate across monitored urban surveillance zones.",
      symptoms: ["Fever or chills", "Dry cough & loss of taste/smell", "Fatigue & muscle aches", "Sore throat & congestion"],
      transmission: "Spreads through airborne droplets and small particles when an infected person breathes, coughs, or speaks.",
      prevention: "Maintain good indoor ventilation, stay up to date with booster vaccines, and wear high-efficiency masks in crowded indoor spaces.",
      whenToSeekHelp: "Seek urgent care for trouble breathing, persistent chest pain, pale/blue lips, or inability to stay awake."
    },
    {
      id: "cholera",
      name: "Cholera",
      icon: "💧",
      status: "Moderate Activity",
      risk: "MODERATE",
      trend: "↑ Slight Increase (+4.8%)",
      cases: 1250,
      regions: ["Coast City", "Central City"],
      summary: "Acute diarrheal infection tied to localized water quality monitoring in coastal regions.",
      symptoms: ["Profuse watery diarrhea", "Vomiting", "Rapid dehydration", "Leg cramps"],
      transmission: "Ingestion of food or water contaminated with the bacterium Vibrio cholerae.",
      prevention: "Drink safe, boiled, or bottled water, cook food thoroughly, eat hot meals, and practice strict hand hygiene.",
      whenToSeekHelp: "Immediate emergency hydration and medical attention are required at the first sign of severe watery diarrhea."
    }
  ];

  function init() {
    console.log('[HealthPulse Outbreaks] Initializing Disease Outbreaks View...');

    // 1. Render initial disease cards
    renderOutbreakCards(OUTBREAK_DATA);

    // 2. Setup Filter Controls
    setupFilters();
  }

  function setupFilters() {
    const diseaseFilter = document.getElementById('filter-disease');
    const regionFilter = document.getElementById('filter-region');
    const riskFilter = document.getElementById('filter-risk');
    const statusFilter = document.getElementById('filter-status');

    function applyFilters() {
      const dVal = diseaseFilter ? diseaseFilter.value : 'all';
      const rVal = regionFilter ? regionFilter.value : 'all';
      const kVal = riskFilter ? riskFilter.value : 'all';
      const sVal = statusFilter ? statusFilter.value : 'all';

      const filtered = OUTBREAK_DATA.filter(item => {
        if (dVal !== 'all' && item.id !== dVal) return false;
        if (rVal !== 'all' && !item.regions.includes(rVal)) return false;
        if (kVal !== 'all' && item.risk.toLowerCase() !== kVal.toLowerCase()) return false;
        if (sVal !== 'all') {
          if (sVal === 'increasing' && !item.trend.includes('↑')) return false;
          if (sVal === 'stable' && !item.trend.includes('→')) return false;
          if (sVal === 'decreasing' && !item.trend.includes('↓')) return false;
        }
        return true;
      });

      renderOutbreakCards(filtered);
    }

    [diseaseFilter, regionFilter, riskFilter, statusFilter].forEach(el => {
      if (el) el.addEventListener('change', applyFilters);
    });
  }

  function renderOutbreakCards(data) {
    const container = document.getElementById('outbreaks-card-grid');
    if (!container) return;

    if (data.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; background: #ffffff; border: 1px solid var(--border-light); border-radius: var(--radius-lg);">
          <i data-lucide="search-x" style="width: 48px; height: 48px; color: var(--text-light); margin-bottom: 1rem;"></i>
          <h3 style="color: var(--primary-navy); margin-bottom: 0.5rem;">No matching outbreaks found</h3>
          <p style="color: var(--text-muted);">Try loosening your filter selection to view active monitored diseases.</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    container.innerHTML = data.map(item => `
      <div class="disease-public-card" id="disease-card-${item.id}">
        <div>
          <div class="disease-card-header">
            <div class="disease-card-title">
              <div class="disease-icon-box">${item.icon}</div>
              <div>
                <h3>${item.name}</h3>
                <span style="font-size:0.8rem; color:var(--text-muted); font-weight:500;">${item.status}</span>
              </div>
            </div>
            <span class="risk-badge ${item.risk.toLowerCase()}">${item.risk}</span>
          </div>

          <div class="disease-card-body">
            <div class="disease-trend-row ${item.trend.includes('↑') ? 'trend-up' : (item.trend.includes('↓') ? 'trend-down' : 'trend-stable')}">
              <i data-lucide="${item.trend.includes('↑') ? 'trending-up' : (item.trend.includes('↓') ? 'trending-down' : 'minus')}"></i>
              <span>${item.trend}</span>
            </div>
            <p class="disease-summary-txt">${item.summary}</p>
          </div>
        </div>

        <div>
          <div class="disease-meta-stats" style="margin-bottom: 1.25rem;">
            <div class="disease-meta-item">
              <span>Simulated Cases</span>
              <strong>${item.cases.toLocaleString()}</strong>
            </div>
            <div class="disease-meta-item">
              <span>Monitored Regions</span>
              <strong>${item.regions.length} Cities</strong>
            </div>
          </div>

          <button class="btn-secondary-public view-disease-detail-btn" data-id="${item.id}" style="width:100%; justify-content:center;">
            View Outbreak Details <i data-lucide="arrow-right"></i>
          </button>
        </div>
      </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Bind Detail Modal Click Listeners
    container.querySelectorAll('.view-disease-detail-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDiseaseDetailModal(id);
      });
    });
  }

  function openDiseaseDetailModal(diseaseId) {
    const item = OUTBREAK_DATA.find(d => d.id === diseaseId);
    if (!item) return;

    let backdrop = document.getElementById('disease-detail-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'disease-detail-backdrop';
      backdrop.className = 'public-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    backdrop.innerHTML = `
      <div class="public-modal-dialog" style="max-width: 680px;">
        <div class="modal-header-row">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <span style="font-size:2rem;">${item.icon}</span>
            <div>
              <h3 style="font-size:1.35rem; color:var(--primary-navy);">${item.name}</h3>
              <div style="display:flex; align-items:center; gap:0.5rem; margin-top:2px;">
                <span class="risk-badge ${item.risk.toLowerCase()}">${item.risk} RISK</span>
                <span style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">${item.status}</span>
              </div>
            </div>
          </div>
          <button class="modal-close-btn" id="close-disease-detail-btn"><i data-lucide="x"></i></button>
        </div>

        <div style="display:flex; flex-direction:column; gap:1.5rem;">
          <div style="background:var(--bg-subtle); padding:1rem 1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-light);">
            <div style="font-size:0.8rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Monitored Affected Regions</div>
            <div style="font-size:0.95rem; font-weight:600; color:var(--primary-navy);">${item.regions.join(', ')}</div>
          </div>

          <div>
            <h4 style="font-size:1.05rem; color:var(--primary-navy); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
              <i data-lucide="activity" style="color:var(--brand-blue); width:18px;"></i> Recent Activity Overview
            </h4>
            <p style="font-size:0.925rem; color:var(--text-body); line-height:1.6;">${item.summary} Current surveillance indicates recent case trajectory is <strong>${item.trend}</strong> across primary monitored districts.</p>
          </div>

          <div>
            <h4 style="font-size:1.05rem; color:var(--primary-navy); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
              <i data-lucide="thermometer" style="color:var(--brand-blue); width:18px;"></i> Common Symptoms
            </h4>
            <ul style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; list-style:none; padding:0;">
              ${item.symptoms.map(s => `
                <li style="font-size:0.875rem; color:var(--text-body); display:flex; align-items:center; gap:0.4rem; background:#ffffff; padding:0.4rem 0.75rem; border:1px solid var(--border-light); border-radius:var(--radius-sm);">
                  <i data-lucide="check-circle-2" style="width:14px; color:var(--brand-blue); flex-shrink:0;"></i> ${s}
                </li>
              `).join('')}
            </ul>
          </div>

          <div>
            <h4 style="font-size:1.05rem; color:var(--primary-navy); margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
              <i data-lucide="shield-alert" style="color:var(--brand-blue); width:18px;"></i> How It Spreads
            </h4>
            <p style="font-size:0.9rem; color:var(--text-muted);">${item.transmission}</p>
          </div>

          <div>
            <h4 style="font-size:1.05rem; color:var(--primary-navy); margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
              <i data-lucide="shield-check" style="color:var(--risk-low); width:18px;"></i> What You Can Do
            </h4>
            <p style="font-size:0.9rem; color:var(--text-body); background:var(--risk-low-bg); padding:0.85rem 1rem; border-radius:var(--radius-md); border:1px solid var(--risk-low-border);">${item.prevention}</p>
          </div>

          <div style="background:var(--risk-critical-bg); border:1px solid var(--risk-critical-border); padding:1rem 1.25rem; border-radius:var(--radius-md);">
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--risk-critical); margin-bottom:0.25rem; display:flex; align-items:center; gap:0.4rem;">
              <i data-lucide="alert-triangle" style="width:16px;"></i> When to Seek Immediate Medical Help
            </h4>
            <p style="font-size:0.875rem; color:#991b1b; line-height:1.5;">${item.whenToSeekHelp}</p>
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();

    document.getElementById('close-disease-detail-btn').addEventListener('click', () => {
      backdrop.classList.remove('open');
    });

    setTimeout(() => backdrop.classList.add('open'), 10);
  }

  return { init };
})();

window.CodeAstraOutbreaks = window.HealthPulseOutbreaks;

document.addEventListener('DOMContentLoaded', () => {
  (window.HealthPulseOutbreaks || window.CodeAstraOutbreaks).init();
});
