/**
 * HealthPulse — Health Intelligence Platform
 * File: js/pages/historical.js
 * Description: Dedicated page controller for Historical Comparison & Multi-Year Seasonality Analytics.
 */

(function () {
  'use strict';

  let histCompChart = null;
  let seasonalityChart = null;

  const diseases = ['Influenza', 'Dengue', 'COVID-19', 'Cholera', 'Typhoid'];
  const data2022 = [2850, 1920, 2640, 1420, 1530];
  const data2023 = [3547, 3006, 2272, 1942, 1715];

  function initComparisonChart() {
    const el = document.getElementById('hist-comparison-barchart');
    if (!el || typeof echarts === 'undefined') return;

    histCompChart = echarts.init(el);

    const option = {
      grid: { top: 40, right: 30, bottom: 35, left: 45, containLabel: true },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: {
        data: ['2022 Baseline (Historical Baseline)', '2023 Surveillance Cycle (Current Year)'],
        top: 0,
        textStyle: { color: '#64748b', fontSize: 11, fontWeight: 600 }
      },
      xAxis: {
        type: 'category',
        data: diseases,
        axisLine: { lineStyle: { color: '#cbd5e1' } }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }
      },
      series: [
        {
          name: '2022 Baseline (Historical Baseline)',
          type: 'bar',
          barWidth: 20,
          itemStyle: { color: '#94a3b8', borderRadius: [4, 4, 0, 0] },
          data: data2022
        },
        {
          name: '2023 Surveillance Cycle (Current Year)',
          type: 'bar',
          barWidth: 20,
          itemStyle: { color: '#2563eb', borderRadius: [4, 4, 0, 0] },
          data: data2023
        }
      ]
    };

    histCompChart.setOption(option);
  }

  function initSeasonalityChart() {
    const el = document.getElementById('hist-seasonality-chart');
    if (!el || typeof echarts === 'undefined') return;

    seasonalityChart = echarts.init(el);

    const option = {
      grid: { top: 30, right: 20, bottom: 30, left: 40, containLabel: true },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisLine: { lineStyle: { color: '#cbd5e1' } }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      series: [
        {
          name: '2022 Trend',
          type: 'line',
          smooth: true,
          itemStyle: { color: '#94a3b8' },
          lineStyle: { width: 2, type: 'dashed' },
          data: [180, 200, 230, 270, 320, 360, 400, 450, 490, 520, 560, 610]
        },
        {
          name: '2023 Trend',
          type: 'line',
          smooth: true,
          itemStyle: { color: '#2563eb' },
          lineStyle: { width: 3 },
          areaStyle: { color: 'rgba(37, 99, 235, 0.1)' },
          data: [210, 240, 290, 340, 410, 480, 530, 610, 670, 710, 780, 890]
        }
      ]
    };

    seasonalityChart.setOption(option);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initComparisonChart();
    initSeasonalityChart();

    window.addEventListener('resize', () => {
      if (histCompChart) histCompChart.resize();
      if (seasonalityChart) seasonalityChart.resize();
    });

    setTimeout(() => {
      if (histCompChart) histCompChart.resize();
      if (seasonalityChart) seasonalityChart.resize();
    }, 200);
  });

})();
