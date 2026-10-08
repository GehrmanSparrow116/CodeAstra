/**
 * HealthPulse — Public / End-User Health Portal
 * File: js/public/health-insights.js
 * Description: Controller for Health Insights — Apache ECharts charts, trend summaries, plain-language insights.
 */

window.HealthPulseInsights = (() => {
  let lineChart = null;
  let activeBarChart = null;
  let regionBarChart = null;

  function init() {
    console.log('[HealthPulse Insights] Initializing Health Insights Visualizations...');

    // 1. Initialize ECharts Line Chart (Time Series)
    initTimeSeriesChart();

    // 2. Initialize Most Active Diseases Horizontal Bar Chart
    initMostActiveChart();

    // 3. Initialize Regional Activity Bar Chart
    initRegionalChart();

    // 4. Setup Time Selector Buttons (1M, 3M, 6M, 1Y)
    setupTimeSelectorButtons();

    // 5. Update Plain-Language "What Does This Mean?" Section
    updatePlainLanguageText('3M');
  }

  function initTimeSeriesChart() {
    const container = document.getElementById('insights-line-chart');
    if (!container || typeof echarts === 'undefined') return;

    lineChart = echarts.init(container);
    renderTimeSeriesData('3M');

    window.addEventListener('resize', () => {
      if (lineChart) lineChart.resize();
    });
  }

  function renderTimeSeriesData(range) {
    if (!lineChart) return;

    let categories = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Current Week'];
    let dengueData = [1100, 1250, 1400, 1550, 1800, 2100, 2300, 2500, 2700, 2850, 2950, 3035];
    let fluData = [2100, 2300, 2500, 2800, 3100, 3400, 3600, 3800, 3950, 4050, 4100, 4120];
    let covidData = [3200, 3000, 2800, 2600, 2400, 2200, 2100, 2000, 1950, 1900, 1860, 1840];

    if (range === '1M') {
      categories = ['Week 1', 'Week 2', 'Week 3', 'Current Week'];
      dengueData = [2450, 2700, 2850, 3035];
      fluData = [3800, 3950, 4050, 4120];
      covidData = [2000, 1950, 1900, 1840];
    } else if (range === '6M') {
      categories = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Current Month'];
      dengueData = [800, 1200, 1800, 2200, 2700, 3035];
      fluData = [1500, 2100, 2900, 3500, 3900, 4120];
      covidData = [4500, 3800, 3000, 2400, 2000, 1840];
    } else if (range === '1Y') {
      categories = ['Q1', 'Q2', 'Q3', 'Current Q4'];
      dengueData = [600, 1400, 2400, 3035];
      fluData = [1200, 2200, 3400, 4120];
      covidData = [5800, 4200, 2600, 1840];
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        textStyle: { color: '#0f172a', fontFamily: 'Inter' }
      },
      legend: {
        top: '0%',
        right: '0%',
        textStyle: { color: '#475569', fontWeight: 600 }
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b' }
      },
      yAxis: {
        type: 'value',
        name: 'Reported Cases',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLabel: { color: '#64748b' }
      },
      series: [
        {
          name: 'Dengue',
          type: 'line',
          smooth: true,
          lineStyle: { width: 3, color: '#f97316' },
          itemStyle: { color: '#f97316' },
          data: dengueData
        },
        {
          name: 'Influenza',
          type: 'line',
          smooth: true,
          lineStyle: { width: 3, color: '#2563eb' },
          itemStyle: { color: '#2563eb' },
          data: fluData
        },
        {
          name: 'COVID-19',
          type: 'line',
          smooth: true,
          lineStyle: { width: 3, color: '#10b981' },
          itemStyle: { color: '#10b981' },
          data: covidData
        }
      ]
    };

    lineChart.setOption(option);
  }

  function initMostActiveChart() {
    const container = document.getElementById('insights-active-diseases-chart');
    if (!container || typeof echarts === 'undefined') return;

    activeBarChart = echarts.init(container);

    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '5%', bottom: '3%', top: '5%', containLabel: true },
      xAxis: { type: 'value', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
      yAxis: {
        type: 'category',
        data: ['Cholera', 'COVID-19', 'Dengue', 'Influenza'],
        axisLabel: { color: '#0f172a', fontWeight: 600 }
      },
      series: [
        {
          name: 'Active Cases',
          type: 'bar',
          data: [
            { value: 1250, itemStyle: { color: '#0891b2', borderRadius: [0, 8, 8, 0] } },
            { value: 1840, itemStyle: { color: '#10b981', borderRadius: [0, 8, 8, 0] } },
            { value: 3035, itemStyle: { color: '#f97316', borderRadius: [0, 8, 8, 0] } },
            { value: 4120, itemStyle: { color: '#ef4444', borderRadius: [0, 8, 8, 0] } }
          ]
        }
      ]
    };

    activeBarChart.setOption(option);

    window.addEventListener('resize', () => {
      if (activeBarChart) activeBarChart.resize();
    });
  }

  function initRegionalChart() {
    const container = document.getElementById('insights-regional-chart');
    if (!container || typeof echarts === 'undefined') return;

    regionBarChart = echarts.init(container);

    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        data: ['Central City', 'Coast City', 'Star City', 'Metropolis', 'Gotham'],
        axisLabel: { color: '#0f172a', fontWeight: 600 }
      },
      yAxis: { type: 'value', name: 'Combined Burden', axisLabel: { color: '#64748b' }, splitLine: { lineStyle: { color: '#f1f5f9' } } },
      series: [
        {
          name: 'Health Activity Burden',
          type: 'bar',
          barWidth: '45%',
          data: [
            { value: 920, itemStyle: { color: '#10b981', borderRadius: [8, 8, 0, 0] } },
            { value: 1250, itemStyle: { color: '#f59e0b', borderRadius: [8, 8, 0, 0] } },
            { value: 1840, itemStyle: { color: '#f59e0b', borderRadius: [8, 8, 0, 0] } },
            { value: 3035, itemStyle: { color: '#f97316', borderRadius: [8, 8, 0, 0] } },
            { value: 4120, itemStyle: { color: '#ef4444', borderRadius: [8, 8, 0, 0] } }
          ]
        }
      ]
    };

    regionBarChart.setOption(option);

    window.addEventListener('resize', () => {
      if (regionBarChart) regionBarChart.resize();
    });
  }

  function setupTimeSelectorButtons() {
    const btns = document.querySelectorAll('.chart-time-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const range = btn.getAttribute('data-range');
        renderTimeSeriesData(range);
        updatePlainLanguageText(range);
      });
    });
  }

  function updatePlainLanguageText(range) {
    const boxText = document.getElementById('plain-language-dynamic-txt');
    if (!boxText) return;

    if (range === '1M') {
      boxText.innerText = "Over the past 4 weeks, Dengue activity has shown an upward trajectory across Metropolis and Coast City (+18.4%), while Influenza remains at peak seasonal levels in Gotham. COVID-19 continues to decline steadily.";
    } else if (range === '6M') {
      boxText.innerText = "Over the past 6 months, respiratory disease patterns shifted from winter peak spikes into vector-borne summer increases. Dengue activity expanded steadily across coastal and metropolitan districts.";
    } else if (range === '1Y') {
      boxText.innerText = "Annual surveillance demonstrates clear seasonal periodicity. Influenza peaks in early winter quarters, whereas Dengue vector activity surges during post-monsoon humid cycles.";
    } else {
      boxText.innerText = "During the recent 3-month surveillance window, Dengue activity has increased significantly in monitored urban zones. Residents in high-risk regions should consider following vector control precautions.";
    }
  }

  return { init };
})();

window.CodeAstraInsights = window.HealthPulseInsights;

document.addEventListener('DOMContentLoaded', () => {
  (window.HealthPulseInsights || window.CodeAstraInsights).init();
});
