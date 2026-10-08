/**
 * HealthPulse — Health Intelligence Platform
 * File: js/pages/ai-insights.js
 * Description: Dedicated page controller for Explainable AI (XAI) & Clinical Intelligence Insights.
 */

(function () {
  'use strict';

  let featureChart = null;

  function initFeatureImportanceChart() {
    const el = document.getElementById('feature-importance-chart');
    if (!el || typeof echarts === 'undefined') return;

    featureChart = echarts.init(el);

    const option = {
      grid: { top: 25, right: 30, bottom: 25, left: 160, containLabel: true },
      tooltip: { trigger: 'axis', formatter: '{b}: {c}% attribution' },
      xAxis: {
        type: 'value',
        axisLabel: { formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      yAxis: {
        type: 'category',
        data: [
          'Environmental Humidity',
          'Historical Seasonality',
          'Population Density Index',
          'Hospitalization Surge Ratio',
          'Anomaly Z-Score Deviation',
          'Case Growth Velocity (WoW)'
        ],
        axisLine: { lineStyle: { color: '#cbd5e1' } }
      },
      series: [
        {
          name: 'Feature Weight',
          type: 'bar',
          barWidth: 16,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: (params) => {
              const colors = ['#94a3b8', '#64748b', '#3b82f6', '#f97316', '#ef4444', '#dc2626'];
              return colors[params.dataIndex];
            }
          },
          data: [4.2, 8.8, 14.3, 18.1, 29.2, 38.4]
        }
      ]
    };

    featureChart.setOption(option);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initFeatureImportanceChart();

    window.addEventListener('resize', () => {
      if (featureChart) featureChart.resize();
    });

    setTimeout(() => {
      if (featureChart) featureChart.resize();
    }, 200);
  });

})();
