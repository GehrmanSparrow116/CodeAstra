/**
 * HealthPulse — Public / End-User Health Portal
 * File: js/public/risk-map.js
 * Description: Controller for Public Health Risk Map — Leaflet + MapTiler/OSM, pulsing markers, popup details & side panel.
 */

window.HealthPulseRiskMap = (() => {
  let leafletMap = null;
  let mapMarkers = {};
  let isRisingOnlyFilter = false;

  const REGION_MAP_DATA = [
    { name: "Metropolis", coords: [40.68, -74.04], risk: "HIGH", disease: "Dengue", cases: 3035, trend: "↑ Increasing (+18.4%)", precaution: "Consider following mosquito-bite prevention measures and eliminating standing water." },
    { name: "Gotham", coords: [40.78, -74.02], risk: "CRITICAL", disease: "Influenza", cases: 4120, trend: "↑ High Spike (+24.1%)", precaution: "Wear masks in crowded indoor public transport and maintain strict hand hygiene." },
    { name: "Star City", coords: [40.85, -74.15], risk: "MODERATE", disease: "COVID-19", cases: 1840, trend: "→ Stable (+1.2%)", precaution: "Ensure proper indoor ventilation and stay updated on vaccinations." },
    { name: "Central City", coords: [40.62, -73.96], risk: "LOW", disease: "Dengue", cases: 920, trend: "↓ Decreasing (-8.5%)", precaution: "Maintain standard community health awareness and clean surroundings." },
    { name: "Coast City", coords: [40.58, -73.85], risk: "MODERATE", disease: "Cholera", cases: 1250, trend: "↑ Slight Increase (+4.8%)", precaution: "Ensure drinking water is boiled or bottled in coastal recreational zones." }
  ];

  function init() {
    console.log('[HealthPulse Risk Map] Initializing Public Geographic Risk Map...');

    // 1. Initialize Map
    initMap();

    // 2. Setup Map Filter Controls & Search
    setupMapControls();

    // 3. Select default region details for side panel
    selectRegionForSidePanel(REGION_MAP_DATA[0]);
  }

  function initMap() {
    const container = document.getElementById('public-leaflet-map');
    if (!container || typeof L === 'undefined') return;

    const config = typeof HEALTHPULSE_CONFIG !== 'undefined' ? HEALTHPULSE_CONFIG : (typeof CODEASTRA_CONFIG !== 'undefined' ? CODEASTRA_CONFIG : {
      DEFAULT_MAP_CENTER: [40.72, -74.00],
      DEFAULT_MAP_ZOOM: 10,
      OSM_TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      OSM_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
    });

    leafletMap = L.map('public-leaflet-map', {
      center: config.DEFAULT_MAP_CENTER,
      zoom: config.DEFAULT_MAP_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Check MapTiler API Key or fallback to OSM
    const maptilerKey = window.MAPTILER_API_KEY || (config && config.MAPTILER_API_KEY);
    let tileUrl = config.OSM_TILE_URL;
    let attribution = config.OSM_ATTRIBUTION;

    if (maptilerKey) {
      tileUrl = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerKey}`;
      attribution = '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';
    }

    L.tileLayer(tileUrl, {
      attribution: attribution,
      maxZoom: 18
    }).addTo(leafletMap);

    // Render Markers
    renderMarkers(REGION_MAP_DATA);
  }

  function renderMarkers(data) {
    if (!leafletMap) return;

    // Clear existing markers
    Object.keys(mapMarkers).forEach(key => {
      leafletMap.removeLayer(mapMarkers[key]);
    });
    mapMarkers = {};

    data.forEach(region => {
      // Filter out if "rising only" is active and trend is decreasing/stable
      if (isRisingOnlyFilter && !region.trend.includes('↑')) {
        return;
      }

      // Compute marker radius based on cases
      const sizePx = Math.max(22, Math.min(42, Math.round(region.cases / 120)));

      const markerHtml = `
        <div class="public-map-marker ${region.risk.toLowerCase()}" style="width:${sizePx}px; height:${sizePx}px;" title="${region.name} - ${region.risk} Risk">
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-div-icon',
        iconSize: [sizePx, sizePx],
        iconAnchor: [sizePx / 2, sizePx / 2]
      });

      const marker = L.marker(region.coords, { icon: customIcon }).addTo(leafletMap);

      // Popup html
      const popupContent = `
        <div style="font-family:Inter, sans-serif; padding:4px;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:6px;">
            <strong style="font-size:1rem; color:#0f172a;">${region.name}</strong>
            <span class="risk-badge ${region.risk.toLowerCase()}">${region.risk}</span>
          </div>
          <div style="font-size:0.85rem; color:#475569; margin-bottom:4px;">Primary Disease: <strong>${region.disease}</strong></div>
          <div style="font-size:0.85rem; color:#475569; margin-bottom:8px;">Trend: <strong>${region.trend}</strong></div>
          <div style="font-size:0.8rem; color:#64748b; background:#f8fafc; padding:6px; border-radius:6px; margin-bottom:8px;">${region.precaution}</div>
          <a href="prevention.html?disease=${encodeURIComponent(region.disease)}" style="display:block; text-align:center; padding:5px 10px; background:#2563eb; color:#ffffff; font-size:0.8rem; font-weight:600; border-radius:6px; text-decoration:none;">View Precautions &rarr;</a>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        selectRegionForSidePanel(region);
      });

      mapMarkers[region.name] = marker;
    });
  }

  function selectRegionForSidePanel(region) {
    if (!region) return;

    const titleEl = document.getElementById('map-panel-region-name');
    const riskBadge = document.getElementById('map-panel-risk-badge');
    const diseaseEl = document.getElementById('map-panel-disease');
    const trendEl = document.getElementById('map-panel-trend');
    const casesEl = document.getElementById('map-panel-cases');
    const precautionEl = document.getElementById('map-panel-precaution');
    const ctaBtn = document.getElementById('map-panel-cta-btn');

    if (titleEl) titleEl.innerText = region.name;
    if (riskBadge) {
      riskBadge.className = `risk-badge ${region.risk.toLowerCase()}`;
      riskBadge.innerText = `${region.risk} RISK`;
    }

    if (diseaseEl) diseaseEl.innerText = region.disease;
    if (trendEl) {
      trendEl.className = region.trend.includes('↑') ? 'trend-up' : 'trend-down';
      trendEl.innerText = region.trend;
    }
    if (casesEl) casesEl.innerText = region.cases.toLocaleString();
    if (precautionEl) precautionEl.innerText = region.precaution;
    if (ctaBtn) {
      ctaBtn.href = `prevention.html?disease=${encodeURIComponent(region.disease)}`;
    }
  }

  function setupMapControls() {
    const diseaseSelect = document.getElementById('map-filter-disease');
    const riskSelect = document.getElementById('map-filter-risk');
    const searchInput = document.getElementById('map-search-input');
    const risingToggle = document.getElementById('map-toggle-rising');

    function applyMapFilters() {
      const dVal = diseaseSelect ? diseaseSelect.value : 'all';
      const rVal = riskSelect ? riskSelect.value : 'all';
      const qVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
      isRisingOnlyFilter = risingToggle ? risingToggle.checked : false;

      const filtered = REGION_MAP_DATA.filter(r => {
        if (dVal !== 'all' && r.disease.toLowerCase() !== dVal.toLowerCase()) return false;
        if (rVal !== 'all' && r.risk.toLowerCase() !== rVal.toLowerCase()) return false;
        if (qVal && !r.name.toLowerCase().includes(qVal)) return false;
        return true;
      });

      renderMarkers(filtered);

      if (filtered.length > 0) {
        selectRegionForSidePanel(filtered[0]);
        if (leafletMap && filtered[0].coords) {
          leafletMap.flyTo(filtered[0].coords, 10, { duration: 1 });
        }
      }
    }

    if (diseaseSelect) diseaseSelect.addEventListener('change', applyMapFilters);
    if (riskSelect) riskSelect.addEventListener('change', applyMapFilters);
    if (risingToggle) risingToggle.addEventListener('change', applyMapFilters);
    if (searchInput) searchInput.addEventListener('input', applyMapFilters);
  }

  return { init };
})();

window.CodeAstraRiskMap = window.HealthPulseRiskMap;

document.addEventListener('DOMContentLoaded', () => {
  (window.HealthPulseRiskMap || window.CodeAstraRiskMap).init();
});
