/**
 * HealthPulse — Health Intelligence Platform
 * File: js/pages/hotspots.js
 * Description: Dedicated page controller for Geographic Risk Hotspots & Spatial Surveillance.
 */

(function () {
  'use strict';

  let map = null;
  let markers = {};

  const demoRegions = [
    {
      id: 'gotham',
      name: 'Gotham',
      coords: [40.78, -74.02],
      riskLevel: 'CRITICAL',
      badgeClass: 'critical',
      ewsScore: 87,
      cases: 428,
      growth: '+32.4%',
      hospitalizations: 74,
      hospRate: '17.3%',
      dominantDisease: 'Dengue',
      status: 'Active Epidemic Surge'
    },
    {
      id: 'metropolis',
      name: 'Metropolis',
      coords: [40.68, -74.04],
      riskLevel: 'HIGH',
      badgeClass: 'high',
      ewsScore: 71,
      cases: 312,
      growth: '+21.8%',
      hospitalizations: 42,
      hospRate: '13.5%',
      dominantDisease: 'Influenza',
      status: 'Cluster Detected'
    },
    {
      id: 'coast-city',
      name: 'Coast City',
      coords: [40.58, -73.85],
      riskLevel: 'HIGH',
      badgeClass: 'high',
      ewsScore: 66,
      cases: 198,
      growth: '+19.3%',
      hospitalizations: 38,
      hospRate: '19.2%',
      dominantDisease: 'Cholera',
      status: 'Waterborne Contamination'
    },
    {
      id: 'star-city',
      name: 'Star City',
      coords: [40.85, -74.15],
      riskLevel: 'MODERATE',
      badgeClass: 'moderate',
      ewsScore: 52,
      cases: 245,
      growth: '+11.2%',
      hospitalizations: 28,
      hospRate: '11.4%',
      dominantDisease: 'COVID-19',
      status: 'Moderate Transmission'
    },
    {
      id: 'central-city',
      name: 'Central City',
      coords: [40.62, -73.96],
      riskLevel: 'LOW',
      badgeClass: 'low',
      ewsScore: 28,
      cases: 114,
      growth: '+4.1%',
      hospitalizations: 12,
      hospRate: '10.5%',
      dominantDisease: 'Typhoid',
      status: 'Baseline Normal'
    }
  ];

  function getRiskColor(level) {
    switch (level.toUpperCase()) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MODERATE': return '#eab308';
      case 'LOW': default: return '#10b981';
    }
  }

  function initMap() {
    const mapDom = document.getElementById('fullscreen-risk-map');
    if (!mapDom || typeof L === 'undefined') return;

    map = L.map('fullscreen-risk-map', {
      center: [40.72, -74.00],
      zoom: 10,
      zoomControl: true,
      attributionControl: true
    });

    const tileUrl = (typeof HEALTHPULSE_CONFIG !== 'undefined' && HEALTHPULSE_CONFIG.OSM_TILE_URL)
      ? HEALTHPULSE_CONFIG.OSM_TILE_URL
      : ((typeof CODEASTRA_CONFIG !== 'undefined' && CODEASTRA_CONFIG.OSM_TILE_URL) ? CODEASTRA_CONFIG.OSM_TILE_URL : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    renderMarkers(demoRegions);

    setTimeout(() => { if (map) map.invalidateSize(); }, 300);
    setTimeout(() => { if (map) map.invalidateSize(); }, 800);
  }

  function renderMarkers(regions) {
    if (!map) return;

    regions.forEach(region => {
      const color = getRiskColor(region.riskLevel);
      const isCritical = region.riskLevel === 'CRITICAL';
      const isHigh = region.riskLevel === 'HIGH';
      const pulseClass = isCritical ? 'pulse-critical' : (isHigh ? 'pulse-high' : 'pulse-static');

      const markerHtml = `
        <div class="custom-map-marker ${pulseClass}">
          <div class="marker-halo" style="background-color: ${color}; width: 34px; height: 34px;"></div>
          <div class="marker-core" style="background-color: ${color}; width: 18px; height: 18px;">
            <span class="marker-core-val">${region.cases}</span>
          </div>
          <div class="marker-label-badge" style="border-left: 3px solid ${color};">
            <span style="font-weight: 800; color: #0f172a;">${region.name}</span>
            <span style="font-size: 0.65rem; color: ${color}; font-weight: 800; margin-left: 3px;">${region.riskLevel}</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-leaflet-icon-container',
        html: markerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const popupHtml = `
        <div class="custom-popup-box">
          <div class="popup-city-header">
            <span class="popup-city-name">${region.name}</span>
            <span class="risk-level-badge ${region.badgeClass}">${region.riskLevel}</span>
          </div>
          <div class="popup-stat-row">
            <span>Early Warning Score:</span>
            <span class="popup-stat-val" style="color:${color};">${region.ewsScore} / 100</span>
          </div>
          <div class="popup-stat-row">
            <span>Active Cases:</span>
            <span class="popup-stat-val">${region.cases} (${region.growth})</span>
          </div>
          <div class="popup-stat-row">
            <span>Hospitalizations:</span>
            <span class="popup-stat-val">${region.hospitalizations} (${region.hospRate})</span>
          </div>
          <div class="popup-stat-row">
            <span>Dominant Pathogen:</span>
            <span class="popup-stat-val" style="color:var(--primary-blue); font-weight:700;">${region.dominantDisease}</span>
          </div>
        </div>
      `;

      const marker = L.marker(region.coords, { icon: icon }).addTo(map);
      marker.bindPopup(popupHtml);
      markers[region.name] = marker;
    });
  }

  function renderTable(regions = demoRegions) {
    const tableBody = document.getElementById('hotspots-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = regions.map(r => `
      <tr style="cursor:pointer;" onclick="window.focusCity('${r.name}')">
        <td style="font-weight:700; color:var(--text-primary);">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="width:8px; height:8px; border-radius:50%; background:${getRiskColor(r.riskLevel)};"></span>
            <span>${r.name}</span>
          </div>
        </td>
        <td style="font-weight:700;">${r.cases.toLocaleString()}</td>
        <td style="font-weight:700; color:${r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH' ? 'var(--risk-critical)' : 'var(--risk-low)'};">${r.growth}</td>
        <td>${r.hospitalizations} (${r.hospRate})</td>
        <td style="font-weight:800;">${r.ewsScore} / 100</td>
        <td><span class="risk-level-badge ${r.badgeClass}">${r.riskLevel}</span></td>
        <td><span style="font-weight:600; color:var(--primary-blue);">${r.dominantDisease}</span></td>
        <td>
          <button class="action-btn-secondary" style="padding:3px 8px; font-size:0.72rem;" onclick="event.stopPropagation(); window.focusCity('${r.name}')">
            <span>Locate</span>
          </button>
        </td>
      </tr>
    `).join('');
  }

  window.focusCity = function (cityName) {
    const region = demoRegions.find(r => r.name.toLowerCase() === cityName.toLowerCase());
    if (region && map) {
      map.flyTo(region.coords, 12, { animate: true, duration: 1.2 });
      if (markers[region.name]) {
        markers[region.name].openPopup();
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    initMap();
    renderTable();

    const diseaseFilter = document.getElementById('map-disease-filter');
    const riskFilter = document.getElementById('map-risk-filter');

    function applyFilters() {
      const dVal = diseaseFilter ? diseaseFilter.value : 'All Diseases';
      const rVal = riskFilter ? riskFilter.value : 'All Risk Levels';

      let filtered = demoRegions;
      if (dVal !== 'All Diseases') {
        filtered = filtered.filter(r => r.dominantDisease.toLowerCase() === dVal.toLowerCase());
      }
      if (rVal !== 'All Risk Levels') {
        filtered = filtered.filter(r => r.riskLevel.toLowerCase() === rVal.toLowerCase());
      }
      renderTable(filtered);
    }

    if (diseaseFilter) diseaseFilter.addEventListener('change', applyFilters);
    if (riskFilter) riskFilter.addEventListener('change', applyFilters);
  });

})();
