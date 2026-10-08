/**
 * HealthPulse — Health Intelligence Platform
 * File: js/map.js
 * Description: Real Interactive Leaflet.js Geographic Risk Surveillance Map with OpenStreetMap.
 * Features: OpenStreetMap tile provider (no API key required), dynamic risk overlays,
 * case-burden scaling, pulsing hotspots, and live health-data stream updates.
 */

window.HealthPulseMap = (() => {
  let map = null;
  let markers = {};
  let currentRegionsData = [];
  let mapFilterState = {
    disease: 'All Diseases',
    risk: 'All Risk Levels',
    metric: 'Cases'
  };

  /**
   * Initializes the Leaflet map.
   */
  async function init(regions) {
    const mapDom = document.getElementById('leaflet-risk-map');
    if (!mapDom) return;

    if (typeof L === 'undefined') {
      console.error('[HealthPulse] Leaflet library not found.');
      return;
    }

    currentRegionsData = regions || [];

    // Configuration lookup
    const config = (typeof HEALTHPULSE_CONFIG !== 'undefined') ? HEALTHPULSE_CONFIG : (typeof CODEASTRA_CONFIG !== 'undefined' ? CODEASTRA_CONFIG : {
      MAP_PROVIDER: "OpenStreetMap",
      OSM_TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      OSM_ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      DEFAULT_MAP_CENTER: [40.72, -74.00],
      DEFAULT_MAP_ZOOM: 10,
      REGION_COORDINATES: {
        "Gotham": [40.78, -74.02],
        "Metropolis": [40.68, -74.04],
        "Star City": [40.85, -74.15],
        "Central City": [40.62, -73.96],
        "Coast City": [40.58, -73.85]
      }
    };

    // 1. Initialize Map instance
    map = L.map('leaflet-risk-map', {
      center: config.DEFAULT_MAP_CENTER,
      zoom: config.DEFAULT_MAP_ZOOM,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true
    });

    // 2. OpenStreetMap Tile Layer (No API Key Required)
    const tileUrl = (config && config.OSM_TILE_URL) ? config.OSM_TILE_URL : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attributionText = (config && config.OSM_ATTRIBUTION) ? config.OSM_ATTRIBUTION : '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

    console.log('[HealthPulse Map] Loading OpenStreetMap tile layer...');

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: attributionText
    }).addTo(map);

    // 3. Render Health Risk Overlays
    renderRegionMarkers(currentRegionsData);

    // 4. Setup Map Control Events (Filters & View Reset)
    setupMapControls();

    // 5. Invalidate size after layout stabilization
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 200);
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 800);
  }

  /**
   * Renders the HealthPulse health-risk markers and pulse halos onto the map.
   */
  function renderRegionMarkers(regions) {
    if (!map) return;

    const coordsMap = (typeof HEALTHPULSE_CONFIG !== 'undefined' && HEALTHPULSE_CONFIG.REGION_COORDINATES)
      ? HEALTHPULSE_CONFIG.REGION_COORDINATES
      : ((typeof CODEASTRA_CONFIG !== 'undefined' && CODEASTRA_CONFIG.REGION_COORDINATES) ? CODEASTRA_CONFIG.REGION_COORDINATES : {});

    regions.forEach(region => {
      const coords = coordsMap[region.name] || region.coordinates || [40.72, -74.00];
      const markerSize = calculateMarkerSize(region.cases);
      const colorHex = getRiskColor(region.riskLevel);
      const isCritical = region.riskLevel === 'CRITICAL';
      const isHigh = region.riskLevel === 'HIGH';

      // Pulse class
      let pulseClass = 'pulse-static';
      if (isCritical) pulseClass = 'pulse-critical';
      else if (isHigh) pulseClass = 'pulse-high';

      // Custom HTML Marker Element
      const markerHtml = `
        <div class="custom-map-marker ${pulseClass}" id="marker-${region.id || region.name.toLowerCase()}">
          <div class="marker-halo" style="background-color: ${colorHex}; width: ${markerSize + 16}px; height: ${markerSize + 16}px;"></div>
          <div class="marker-core" style="background-color: ${colorHex}; width: ${markerSize}px; height: ${markerSize}px;">
            <span class="marker-core-val">${formatMetricLabel(region)}</span>
          </div>
          <div class="marker-label-badge" style="border-left: 3px solid ${colorHex};">
            <span style="font-weight: 800; color: #0f172a;">${region.name}</span>
            <span style="font-size: 0.65rem; color: ${colorHex}; font-weight: 800; margin-left: 3px;">${region.riskLevel}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-icon-container',
        html: markerHtml,
        iconSize: [markerSize + 20, markerSize + 20],
        iconAnchor: [(markerSize + 20) / 2, (markerSize + 20) / 2]
      });

      // If marker already exists, update position/icon, else create
      if (markers[region.name]) {
        markers[region.name].setIcon(customIcon);
        markers[region.name].setPopupContent(buildPopupHtml(region, colorHex));
      } else {
        const marker = L.marker(coords, { icon: customIcon }).addTo(map);
        marker.bindPopup(buildPopupHtml(region, colorHex), {
          offset: [0, -18],
          closeButton: true,
          className: 'healthpulse-popup'
        });
        markers[region.name] = marker;
      }
    });
  }

  /**
   * Builds the rich clinical popup card HTML.
   */
  function buildPopupHtml(region, colorHex) {
    return `
      <div class="custom-popup-box">
        <div class="popup-city-header">
          <span class="popup-city-name">${region.name}</span>
          <span class="risk-level-badge ${region.badgeClass || region.riskLevel.toLowerCase()}">${region.riskLevel}</span>
        </div>
        <div class="popup-stat-row">
          <span>Early Warning Score:</span>
          <span class="popup-stat-val" style="color: ${colorHex}; font-weight:800;">${region.ewsScore} / 100</span>
        </div>
        <div class="popup-stat-row">
          <span>Total Cases:</span>
          <span class="popup-stat-val">${(region.cases || 0).toLocaleString()}</span>
        </div>
        <div class="popup-stat-row">
          <span>Weekly Growth:</span>
          <span class="popup-stat-val" style="color: ${region.growthRate > 15 ? 'var(--risk-critical)' : 'var(--risk-low)'};">↑ ${region.growthRate}%</span>
        </div>
        <div class="popup-stat-row">
          <span>Hospitalization Ratio:</span>
          <span class="popup-stat-val">${region.hospitalizationRate || '12.4'}%</span>
        </div>
        <div class="popup-stat-row">
          <span>Dominant Disease:</span>
          <span class="popup-stat-val" style="font-weight:700;">${region.dominantDisease || 'Dengue'}</span>
        </div>
        ${region.hasActiveOutbreak ? '<div class="popup-outbreak-tag">⚠️ OUTBREAK DETECTED</div>' : ''}
        <button class="popup-action-btn" onclick="(window.HealthPulseMap || window.CodeAstraMap) && (window.HealthPulseMap || window.CodeAstraMap).focusAnalysis('${region.name}')">
          View Analysis →
        </button>
      </div>
    `;
  }

  /**
   * Updates health overlay values dynamically without reloading the map or tiles.
   */
  function updateHealthMap(regionsData) {
    if (!map || !regionsData) return;
    currentRegionsData = regionsData;

    renderRegionMarkers(currentRegionsData);
    applyFilters();

    // Update live status overlay
    const timerEl = document.getElementById('map-live-status-timer');
    if (timerEl) {
      timerEl.innerText = 'Just now';
    }
  }

  /**
   * Triggers emergency pulse animation on a specific region when an anomaly occurs.
   */
  function triggerAnomalyPulse(regionName) {
    const markerObj = markers[regionName];
    if (!markerObj) return;

    const el = markerObj.getElement();
    if (el) {
      el.classList.add('anomaly-pulse-active');
      setTimeout(() => {
        el.classList.remove('anomaly-pulse-active');
      }, 6000);
    }
  }

  /**
   * Pans to region smoothly without aggressive zoom jumping.
   */
  function panToRegion(coords, regionName) {
    if (!map) return;
    map.flyTo(coords, 11, {
      duration: 1.0,
      easeLinearity: 0.25
    });

    if (markers[regionName]) {
      setTimeout(() => {
        markers[regionName].openPopup();
      }, 1000);
    }
  }

  function focusAnalysis(regionName) {
    const region = currentRegionsData.find(r => r.name === regionName);
    if (region && typeof showToast === 'function') {
      showToast(`Surveillance focused on ${regionName} (${region.riskLevel} Risk, EWS ${region.ewsScore}/100)`);
    }
    const explainModal = document.getElementById('explainability-modal');
    if (explainModal) {
      explainModal.classList.add('active');
    }
  }

  /**
   * Filters map markers by Disease, Risk Level, and Metric representation.
   */
  function applyFilters() {
    currentRegionsData.forEach(region => {
      const marker = markers[region.name];
      if (!marker) return;

      const el = marker.getElement();
      if (!el) return;

      let matchesDisease = mapFilterState.disease === 'All Diseases' || region.dominantDisease === mapFilterState.disease;
      let matchesRisk = mapFilterState.risk === 'All Risk Levels' || region.riskLevel === mapFilterState.risk.toUpperCase();

      if (matchesDisease && matchesRisk) {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
        el.style.transform = 'scale(1)';
      } else {
        el.style.opacity = '0.2';
        el.style.pointerEvents = 'none';
        el.style.transform = 'scale(0.85)';
      }
    });
  }

  function setupMapControls() {
    const diseaseFilter = document.getElementById('map-disease-filter');
    const riskFilter = document.getElementById('map-risk-filter');
    const metricFilter = document.getElementById('map-metric-filter');

    if (diseaseFilter) {
      diseaseFilter.addEventListener('change', (e) => {
        mapFilterState.disease = e.target.value;
        applyFilters();
      });
    }

    if (riskFilter) {
      riskFilter.addEventListener('change', (e) => {
        mapFilterState.risk = e.target.value;
        applyFilters();
      });
    }

    if (metricFilter) {
      metricFilter.addEventListener('change', (e) => {
        mapFilterState.metric = e.target.value;
        renderRegionMarkers(currentRegionsData);
        applyFilters();
      });
    }
  }

  function calculateMarkerSize(cases) {
    const c = cases || 200;
    // Scale between 22px and 42px
    return Math.max(22, Math.min(42, Math.round(18 + Math.sqrt(c) * 0.55)));
  }

  function formatMetricLabel(region) {
    if (mapFilterState.metric === 'EWS') {
      return region.ewsScore;
    } else if (mapFilterState.metric === 'Outbreaks') {
      return region.hasActiveOutbreak ? '⚠️' : '✓';
    } else {
      // Default: Cases in 'k' or raw
      return region.cases > 999 ? (region.cases / 1000).toFixed(1) + 'k' : region.cases;
    }
  }

  function getRiskColor(level) {
    switch (level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MODERATE': return '#eab308';
      case 'LOW': return '#10b981';
      default: return '#3b82f6';
    }
  }

  return {
    init,
    updateHealthMap,
    triggerAnomalyPulse,
    panToRegion,
    focusAnalysis,
    map
  };
})();

window.CodeAstraMap = window.HealthPulseMap;
