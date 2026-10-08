/**
 * HealthPulse — Public / End-User Health Portal
 * File: js/public/home.js
 * Description: Homepage controller — Location checker, status cards, disease trends chart, and GSAP animations.
 */

window.HealthPulseHome = (() => {
  let chartInstance = null;

  function init() {
    console.log('[HealthPulse Home] Initializing Homepage Logic & Visualizations...');

    // 1. Setup Location Checker Selector
    setupLocationChecker();

    // 2. Initialize Apache ECharts Line Chart
    initRecentActivityChart();

    // 3. GSAP Hero & Section Entrance Animations
    initGSAPAnimations();

    // 4. Listen for Region Changes
    const updateCb = (e) => updateLocationCheckerCard(e.detail);
    window.addEventListener('healthpulse:regionChanged', updateCb);
    window.addEventListener('codeastra:regionChanged', updateCb);
  }

  function setupLocationChecker() {
    const select = document.getElementById('home-region-select');
    if (!select) return;

    // Populate options
    const pubObj = window.HealthPulsePublic || window.CodeAstraPublic;
    const regions = pubObj ? pubObj.DEMO_REGIONS : [];
    select.innerHTML = regions.map(r => `
      <option value="${r.name}">${r.name}</option>
    `).join('');

    const initialRegion = pubObj ? pubObj.getRegionData() : regions[0];
    if (initialRegion) {
      select.value = initialRegion.name;
      updateLocationCheckerCard(initialRegion);
    }

    select.addEventListener('change', (e) => {
      const selectedName = e.target.value;
      if (pubObj) {
        pubObj.setSelectedRegion(selectedName);
      }
    });
  }

  function updateLocationCheckerCard(regionData) {
    if (!regionData) return;
    const riskBadge = document.getElementById('checker-risk-badge');
    const diseaseVal = document.getElementById('checker-disease-val');
    const trendVal = document.getElementById('checker-trend-val');
    const precautionVal = document.getElementById('checker-precaution-val');

    if (riskBadge) {
      riskBadge.className = `risk-badge ${regionData.risk.toLowerCase()}`;
      riskBadge.innerText = `${regionData.risk} RISK`;
    }

    if (diseaseVal) {
      diseaseVal.innerHTML = `<i data-lucide="activity" style="width:18px; color:var(--brand-blue);"></i> ${regionData.disease}`;
    }

    if (trendVal) {
      const isUp = regionData.trend.includes('↑');
      const colorClass = isUp ? 'trend-up' : 'trend-down';
      trendVal.innerHTML = `<span class="${colorClass}">${regionData.trend}</span>`;
    }

    if (precautionVal) {
      precautionVal.innerText = regionData.alert || "Follow standard preventive guidelines.";
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function initRecentActivityChart() {
    const chartDom = document.getElementById('home-activity-chart');
    if (!chartDom || typeof echarts === 'undefined') return;

    chartInstance = echarts.init(chartDom);

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        textStyle: { color: '#0f172a', fontFamily: 'Inter' },
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
      },
      legend: {
        top: '0%',
        right: '0%',
        textStyle: { color: '#475569', fontWeight: 600 }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '18%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Current Week'],
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b' }
      },
      yAxis: {
        type: 'value',
        name: 'Reported Cases (Simulated)',
        nameTextStyle: { color: '#64748b', fontSize: 12 },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLabel: { color: '#64748b' }
      },
      series: [
        {
          name: 'Dengue',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 3, color: '#f97316' },
          itemStyle: { color: '#f97316' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(249, 115, 22, 0.25)' },
              { offset: 1, color: 'rgba(249, 115, 22, 0.0)' }
            ])
          },
          data: [1200, 1350, 1600, 2100, 2450, 2800, 3035]
        },
        {
          name: 'Influenza',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 3, color: '#2563eb' },
          itemStyle: { color: '#2563eb' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(37, 99, 235, 0.2)' },
              { offset: 1, color: 'rgba(37, 99, 235, 0.0)' }
            ])
          },
          data: [2800, 2900, 3100, 3300, 3500, 3900, 4120]
        },
        {
          name: 'COVID-19',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 3, color: '#10b981' },
          itemStyle: { color: '#10b981' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.15)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.0)' }
            ])
          },
          data: [2400, 2200, 2100, 1950, 1900, 1860, 1840]
        }
      ]
    };

    chartInstance.setOption(option);

    window.addEventListener('resize', () => {
      if (chartInstance) chartInstance.resize();
    });
  }

  function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tl = gsap.timeline();
    tl.from('.hero-tag', { opacity: 0, y: 15, duration: 0.5, ease: 'power2.out' })
      .from('.hero-title', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .from('.hero-ctas', { opacity: 0, y: 15, duration: 0.5, ease: 'power2.out' }, '-=0.4')
      .from('.hero-card-visual', { opacity: 0, scale: 0.95, duration: 0.7, ease: 'power2.out' }, '-=0.5');

    gsap.from('.location-checker-section', {
      scrollTrigger: { trigger: '.location-checker-section', start: 'top 85%' },
      opacity: 0,
      y: 30,
      duration: 0.6
    });

    gsap.from('.public-metric-card', {
      scrollTrigger: { trigger: '.public-card-grid-4', start: 'top 85%' },
      opacity: 0,
      y: 25,
      stagger: 0.1,
      duration: 0.6
    });
  }

  return { init };
})();

window.CodeAstraHome = window.HealthPulseHome;

document.addEventListener('DOMContentLoaded', () => {
  (window.HealthPulseHome || window.CodeAstraHome).init();
});
