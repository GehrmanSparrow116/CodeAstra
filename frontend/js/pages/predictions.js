/**
 * HealthPulse — Health Intelligence Platform
 * File: js/pages/predictions.js
 * Description: Dedicated page controller for ML-Driven Outbreak Forecasting & Predictive Analytics.
 */

(function () {
  'use strict';

  let forecastChart = null;
  let regionalPredChart = null;

  function initForecastChart() {
    const el = document.getElementById('main-forecast-chart');
    if (!el || typeof echarts === 'undefined') return;

    forecastChart = echarts.init(el);

    const historicalWeeks = ['W46', 'W47', 'W48', 'W49', 'W50', 'W51', 'W52'];
    const forecastWeeks = ['W52+1 (Pred)', 'W52+2 (Pred)', 'W52+3 (Pred)', 'W52+4 (Pred)'];
    const allLabels = [...historicalWeeks, ...forecastWeeks];

    const historicalData = [240, 275, 310, 360, 395, 410, 428, null, null, null, null];
    const predictedData = [null, null, null, null, null, null, 428, 510, 571, 620, 665];
    const upperConfidence = [null, null, null, null, null, null, 428, 545, 620, 680, 735];
    const lowerConfidence = [null, null, null, null, null, null, 428, 475, 522, 560, 595];

    const option = {
      grid: { top: 40, right: 30, bottom: 35, left: 45, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      legend: {
        data: ['Historical Cases', 'ML Predicted Trajectory', '95% Confidence Interval'],
        top: 0,
        textStyle: { color: '#64748b', fontSize: 11, fontWeight: 600 }
      },
      xAxis: {
        type: 'category',
        data: allLabels,
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisLabel: {
          color: (value) => value.includes('Pred') ? '#7c3aed' : '#64748b',
          fontWeight: (value) => value.includes('Pred') ? 700 : 500
        }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }
      },
      series: [
        {
          name: 'Historical Cases',
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbolSize: 6,
          itemStyle: { color: '#2563eb' },
          lineStyle: { width: 3, color: '#2563eb' },
          data: historicalData
        },
        {
          name: 'ML Predicted Trajectory',
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbolSize: 6,
          itemStyle: { color: '#7c3aed' },
          lineStyle: { width: 3, color: '#7c3aed', type: 'dashed' },
          data: predictedData
        },
        {
          name: '95% Confidence Interval',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { opacity: 0 },
          stack: 'confidence-band',
          data: lowerConfidence
        },
        {
          name: '95% Confidence Interval',
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { opacity: 0 },
          areaStyle: { color: 'rgba(124, 58, 237, 0.12)' },
          stack: 'confidence-band',
          data: upperConfidence.map((v, i) => v && lowerConfidence[i] ? v - lowerConfidence[i] : null)
        }
      ]
    };

    forecastChart.setOption(option);
  }

  function initRegionalPredChart() {
    const el = document.getElementById('regional-pred-chart');
    if (!el || typeof echarts === 'undefined') return;

    regionalPredChart = echarts.init(el);
    const option = {
      grid: { top: 25, right: 20, bottom: 25, left: 65, containLabel: true },
      tooltip: { trigger: 'axis', formatter: '{b}: {c}% outbreak risk' },
      xAxis: {
        type: 'value',
        axisLabel: { formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      yAxis: {
        type: 'category',
        data: ['Central City', 'Star City', 'Coast City', 'Metropolis', 'Gotham'],
        axisLine: { lineStyle: { color: '#cbd5e1' } }
      },
      series: [
        {
          name: 'Outbreak Probability',
          type: 'bar',
          barWidth: 16,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: (params) => {
              const colors = ['#10b981', '#eab308', '#f97316', '#f97316', '#ef4444'];
              return colors[params.dataIndex];
            }
          },
          data: [12, 44, 76, 82, 94]
        }
      ]
    };
    regionalPredChart.setOption(option);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initForecastChart();
    initRegionalPredChart();

    window.addEventListener('resize', () => {
      if (forecastChart) forecastChart.resize();
      if (regionalPredChart) regionalPredChart.resize();
    });

    setTimeout(() => {
      if (forecastChart) forecastChart.resize();
      if (regionalPredChart) regionalPredChart.resize();
    }, 200);
  });

})();
