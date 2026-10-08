/**
 * HealthPulse — Health Intelligence Platform
 * File: js/pages/data-explorer.js
 * Description: Dedicated page controller for Dataset Exploration, Multi-Filter Querying & Pagination.
 */

(function () {
  'use strict';

  // Demo synthetic health dataset rows faithful to HealthPulse schema
  const datasetRows = [
    { date: '2023-12-28', region: 'Gotham', population: '10.2M', env: 'Urban High-Density', disease: 'Dengue', symptoms: 'High Fever, Myalgia, Rash', cases: 428, hosp: 74, risk: 'CRITICAL', ews: 87 },
    { date: '2023-12-28', region: 'Metropolis', population: '14.8M', env: 'Coastal Mega-City', disease: 'Influenza', symptoms: 'Fever, Cough, Dyspnea', cases: 312, hosp: 42, risk: 'HIGH', ews: 71 },
    { date: '2023-12-27', region: 'Coast City', population: '5.6M', env: 'Coastal Tropical', disease: 'Cholera', symptoms: 'Acute Diarrhea, Dehydration', cases: 198, hosp: 38, risk: 'HIGH', ews: 66 },
    { date: '2023-12-26', region: 'Star City', population: '8.4M', env: 'Temperate Urban', disease: 'COVID-19', symptoms: 'Anosmia, Fatigue, Fever', cases: 245, hosp: 28, risk: 'MODERATE', ews: 52 },
    { date: '2023-12-25', region: 'Central City', population: '6.1M', env: 'Inland Plains', disease: 'Typhoid', symptoms: 'Sustained Fever, Abdominal Pain', cases: 114, hosp: 12, risk: 'LOW', ews: 28 },
    { date: '2023-12-21', region: 'Gotham', population: '10.2M', env: 'Urban High-Density', disease: 'Dengue', symptoms: 'High Fever, Retro-orbital Pain', cases: 395, hosp: 68, risk: 'CRITICAL', ews: 84 },
    { date: '2023-12-20', region: 'Metropolis', population: '14.8M', env: 'Coastal Mega-City', disease: 'Influenza', symptoms: 'Fever, Sore Throat', cases: 288, hosp: 39, risk: 'HIGH', ews: 68 },
    { date: '2023-12-19', region: 'Coast City', population: '5.6M', env: 'Coastal Tropical', disease: 'Cholera', symptoms: 'Severe Watery Diarrhea', cases: 175, hosp: 32, risk: 'HIGH', ews: 64 },
    { date: '2023-12-18', region: 'Star City', population: '8.4M', env: 'Temperate Urban', disease: 'COVID-19', symptoms: 'Cough, Headache, Fever', cases: 220, hosp: 24, risk: 'MODERATE', ews: 48 },
    { date: '2023-12-17', region: 'Central City', population: '6.1M', env: 'Inland Plains', disease: 'Typhoid', symptoms: 'Headache, Constipation', cases: 108, hosp: 10, risk: 'LOW', ews: 26 },
    { date: '2023-12-14', region: 'Gotham', population: '10.2M', env: 'Urban High-Density', disease: 'Dengue', symptoms: 'High Fever, Arthralgia', cases: 360, hosp: 60, risk: 'HIGH', ews: 79 },
    { date: '2023-12-13', region: 'Metropolis', population: '14.8M', env: 'Coastal Mega-City', disease: 'Influenza', symptoms: 'Dry Cough, Chills', cases: 260, hosp: 34, risk: 'HIGH', ews: 64 }
  ];

  let currentPage = 1;
  const rowsPerPage = 6;
  let currentFilteredRows = [...datasetRows];

  function getBadgeHtml(risk) {
    const cls = risk.toLowerCase();
    return `<span class="risk-level-badge ${cls}">${risk}</span>`;
  }

  function renderTable() {
    const tbody = document.getElementById('explorer-table-body');
    if (!tbody) return;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageRows = currentFilteredRows.slice(startIdx, startIdx + rowsPerPage);

    if (pageRows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:var(--text-muted);">No matching surveillance records found.</td></tr>`;
    } else {
      tbody.innerHTML = pageRows.map(r => `
        <tr>
          <td style="font-weight:600; color:var(--text-primary); font-family:monospace;">${r.date}</td>
          <td style="font-weight:700;">${r.region}</td>
          <td>${r.population}</td>
          <td style="font-size:0.75rem; color:var(--text-muted);">${r.env}</td>
          <td style="font-weight:700; color:var(--primary-blue);">${r.disease}</td>
          <td style="font-size:0.75rem; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${r.symptoms}</td>
          <td style="font-weight:700; color:var(--text-primary);">${r.cases.toLocaleString()}</td>
          <td>${r.hosp}</td>
          <td>${getBadgeHtml(r.risk)}</td>
          <td style="font-weight:800; color:var(--text-primary);">${r.ews}</td>
        </tr>
      `).join('');
    }

    renderPagination();
  }

  function renderPagination() {
    const infoEl = document.getElementById('pagination-info');
    const totalPages = Math.ceil(currentFilteredRows.length / rowsPerPage) || 1;
    if (infoEl) {
      const start = currentFilteredRows.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
      const end = Math.min(currentPage * rowsPerPage, currentFilteredRows.length);
      infoEl.textContent = `Showing ${start} – ${end} of ${currentFilteredRows.length} records`;
    }

    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
  }

  function applyFilters() {
    const searchVal = (document.getElementById('table-search-input')?.value || '').toLowerCase();
    const regionVal = document.getElementById('filter-region-select')?.value || 'All Regions';
    const diseaseVal = document.getElementById('filter-disease-select')?.value || 'All Diseases';
    const riskVal = document.getElementById('filter-risk-select')?.value || 'All Risk Levels';

    currentFilteredRows = datasetRows.filter(r => {
      const matchSearch = !searchVal || 
        r.region.toLowerCase().includes(searchVal) ||
        r.disease.toLowerCase().includes(searchVal) ||
        r.symptoms.toLowerCase().includes(searchVal);

      const matchRegion = regionVal === 'All Regions' || r.region === regionVal;
      const matchDisease = diseaseVal === 'All Diseases' || r.disease === diseaseVal;
      const matchRisk = riskVal === 'All Risk Levels' || r.risk === riskVal.toUpperCase();

      return matchSearch && matchRegion && matchDisease && matchRisk;
    });

    currentPage = 1;
    renderTable();
  }

  window.exportCsv = function () {
    const headers = ['Date', 'Region', 'Population', 'Environment', 'Disease', 'Symptoms', 'Cases', 'Hospitalizations', 'Risk', 'EWS'];
    const csvContent = [
      headers.join(','),
      ...currentFilteredRows.map(r => `"${r.date}","${r.region}","${r.population}","${r.env}","${r.disease}","${r.symptoms}",${r.cases},${r.hosp},"${r.risk}",${r.ews}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'HealthPulse_Health_Surveillance_Data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (window.showToast) window.showToast('Dataset exported to CSV successfully.', 'success');
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderTable();

    document.getElementById('table-search-input')?.addEventListener('input', applyFilters);
    document.getElementById('filter-region-select')?.addEventListener('change', applyFilters);
    document.getElementById('filter-disease-select')?.addEventListener('change', applyFilters);
    document.getElementById('filter-risk-select')?.addEventListener('change', applyFilters);

    document.getElementById('prev-page-btn')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });

    document.getElementById('next-page-btn')?.addEventListener('click', () => {
      const totalPages = Math.ceil(currentFilteredRows.length / rowsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });
  });

})();
