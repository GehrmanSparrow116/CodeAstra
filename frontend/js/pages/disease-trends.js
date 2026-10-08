/**
 * HealthPulse — Health Intelligence Platform
 * File: js/pages/disease-trends.js
 * Description: Dedicated page controller for Disease Trends & Time-Series Analytics.
 */

(function () {
  'use strict';

  let trendChart = null;
  let distChart = null;
  let hospChart = null;
  let growthChart = null;

  let currentTimeframe = '1Y';
  let currentDisease = 'All Diseases';
  let currentRegion = 'All Regions';

  // Demo data store for disease trends
  const trendData = {
    '1M': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      cases: [540, 610, 680, 740],
      hosp: [85, 95, 110, 130],
      events: [{ index: 2, label: 'Spike' }]
    },
    '3M': {
      labels: ['Oct W1', 'Oct W3', 'Nov W1', 'Nov W3', 'Dec W1', 'Dec W3'],
      cases: [490, 530, 620, 680, 710, 740],
      hosp: [80, 88, 102, 115, 122, 130],
      events: [{ index: 3, label: 'Spike' }]
    },
    '6M': {
      labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      cases: [380, 440, 520, 610, 670, 740],
      hosp: [60, 72, 85, 105, 118, 130],
      events: [{ index: 2, label: 'Outbreak' }, { index: 5, label: 'Outbreak' }]
    },
    '1Y': {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      cases: [210, 240, 290, 340, 410, 480, 530, 610, 670, 710, 780, 890],
      hosp: [35, 40, 48, 55, 68, 80, 88, 102, 112, 120, 135, 155],
      events: [
        { index: 4, label: 'Wave 1' },
        { index: 8, label: 'Vector Surge' },
        { index: 11, label: 'Winter Peak' }
      ]
    }
  };

  const diseaseBreakdown = [
    { name: 'Influenza', value: 3547, percent: '28.4%', color: '#3b82f6', growth: '+14.2%' },
    { name: 'Dengue', value: 3006, percent: '24.1%', color: '#ef4444', growth: '+32.4%' },
    { name: 'COVID-19', value: 2272, percent: '18.2%', color: '#f97316', growth: '+8.1%' },
    { name: 'Cholera', value: 1942, percent: '15.6%', color: '#eab308', growth: '+19.3%' },
    { name: 'Typhoid', value: 1715, percent: '13.7%', color: '#06b6d4', growth: '+6.5%' }
  ];

  function initMainTrendChart() {
    const el = document.getElementById('main-disease-trend-chart');
    if (!el || typeof echarts === 'undefined') return;

    trendChart = echarts.init(el);
    renderMainTrend();
  }

  function renderMainTrend() {
    if (!trendChart) return;
    const tf = trendData[currentTimeframe] || trendData['1Y'];

    const option = {
      animationDuration: 700,
      grid: { top: 35, right: 25, bottom: 35, left: 45, containLabel: true },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#0f172a', fontSize: 12, fontFamily: 'Inter, sans-serif' },
        axisPointer: { type: 'line', lineStyle: { color: '#94a3b8', type: 'dashed' } }
      },
      legend: { show: false },
      xAxis: {
        type: 'category',
        data: tf.labels,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: { color: '#64748b', fontSize: 11, fontWeight: 600 }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#64748b', fontSize: 11 }
      },
      series: [
        {
          name: 'Total Cases',
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbolSize: 6,
          itemStyle: { color: '#2563eb' },
          lineStyle: { width: 3, color: '#2563eb' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(37, 99, 235, 0.25)' },
              { offset: 1, color: 'rgba(37, 99, 235, 0.01)' }
            ])
          },
          data: tf.cases
        },
        {
          name: 'Hospitalizations',
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbolSize: 6,
          itemStyle: { color: '#ef4444' },
          lineStyle: { width: 2.5, color: '#ef4444', type: 'solid' },
          data: tf.hosp
        }
      ]
    };

    trendChart.setOption(option);
  }

  function initDonutChart() {
    const el = document.getElementById('disease-dist-donut');
    if (!el || typeof echarts === 'undefined') return;

    distChart = echarts.init(el);
    const option = {
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      series: [
        {
          name: 'Cases',
          type: 'pie',
          radius: ['55%', '82%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 6, borderColor: '#ffffff', borderWidth: 2 },
          label: { show: false },
          data: diseaseBreakdown.map(d => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: d.color }
          }))
        }
      ]
    };
    distChart.setOption(option);
  }

  function initHospitalizationChart() {
    const el = document.getElementById('hosp-trend-chart');
    if (!el || typeof echarts === 'undefined') return;

    hospChart = echarts.init(el);
    const option = {
      grid: { top: 25, right: 20, bottom: 25, left: 35, containLabel: true },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisLine: { lineStyle: { color: '#cbd5e1' } }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }
      },
      series: [
        {
          name: 'ICU Admissions',
          type: 'bar',
          stack: 'hosp',
          itemStyle: { color: '#ef4444', borderRadius: [0, 0, 0, 0] },
          data: [15, 22, 28, 35, 42, 54]
        },
        {
          name: 'General Ward',
          type: 'bar',
          stack: 'hosp',
          itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
          data: [45, 50, 57, 70, 76, 81]
        }
      ]
    };
    hospChart.setOption(option);
  }

  function initGrowthRateChart() {
    const el = document.getElementById('growth-rate-bar-chart');
    if (!el || typeof echarts === 'undefined') return;

    growthChart = echarts.init(el);
    const option = {
      grid: { top: 25, right: 20, bottom: 25, left: 55, containLabel: true },
      tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
      xAxis: {
        type: 'value',
        axisLabel: { formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      yAxis: {
        type: 'category',
        data: ['Typhoid', 'COVID-19', 'Influenza', 'Cholera', 'Dengue'],
        axisLine: { lineStyle: { color: '#cbd5e1' } }
      },
      series: [
        {
          name: 'Growth Rate',
          type: 'bar',
          barWidth: 16,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: (params) => {
              const colors = ['#06b6d4', '#f97316', '#3b82f6', '#eab308', '#ef4444'];
              return colors[params.dataIndex];
            }
          },
          data: [6.5, 8.1, 14.2, 19.3, 32.4]
        }
      ]
    };
    growthChart.setOption(option);
  }

  function setupControls() {
    const timeBtns = document.querySelectorAll('.time-btn');
    timeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        timeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTimeframe = btn.getAttribute('data-timeframe');
        renderMainTrend();
      });
    });

    const diseaseSelect = document.getElementById('disease-filter-select');
    if (diseaseSelect) {
      diseaseSelect.addEventListener('change', (e) => {
        currentDisease = e.target.value;
        renderMainTrend();
      });
    }

    const regionSelect = document.getElementById('region-filter-select');
    if (regionSelect) {
      regionSelect.addEventListener('change', (e) => {
        currentRegion = e.target.value;
        renderMainTrend();
      });
    }

    window.addEventListener('resize', () => {
      if (trendChart) trendChart.resize();
      if (distChart) distChart.resize();
      if (hospChart) hospChart.resize();
      if (growthChart) growthChart.resize();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMainTrendChart();
    initDonutChart();
    initHospitalizationChart();
    initGrowthRateChart();
    setupControls();

    setTimeout(() => {
      if (trendChart) trendChart.resize();
      if (distChart) distChart.resize();
      if (hospChart) hospChart.resize();
      if (growthChart) growthChart.resize();
    }, 200);
  });

})();
