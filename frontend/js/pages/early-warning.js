/**
 * HealthPulse — Health Intelligence Platform
 * File: js/pages/early-warning.js
 * Description: Dedicated page controller for Early Warning Score (EWS) Intelligence & Risk Weighting.
 */

(function () {
  'use strict';

  let gaugeChart = null;

  function initGaugeChart() {
    const el = document.getElementById('large-ews-gauge');
    if (!el || typeof echarts === 'undefined') return;

    gaugeChart = echarts.init(el);

    const option = {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 5,
          radius: '95%',
          center: ['50%', '70%'],
          itemStyle: {
            color: '#ef4444'
          },
          progress: {
            show: true,
            roundCap: true,
            width: 18
          },
          pointer: {
            length: '55%',
            width: 5,
            itemStyle: { color: '#0f172a' }
          },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 18,
              color: [
                [0.30, '#10b981'],
                [0.60, '#eab308'],
                [0.80, '#f97316'],
                [1.00, '#ef4444']
              ]
            }
          },
          axisTick: { show: false },
          splitLine: { length: 8, lineStyle: { width: 2, color: '#94a3b8' } },
          axisLabel: {
            distance: 22,
            color: '#64748b',
            fontSize: 11,
            fontWeight: 600
          },
          title: { show: false },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '-15%'],
            fontSize: 36,
            fontWeight: 800,
            formatter: '{value}',
            color: '#0f172a'
          },
          data: [{ value: 78, name: 'EWS Score' }]
        }
      ]
    };

    gaugeChart.setOption(option);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initGaugeChart();

    window.addEventListener('resize', () => {
      if (gaugeChart) gaugeChart.resize();
    });

    setTimeout(() => {
      if (gaugeChart) gaugeChart.resize();
    }, 200);
  });

})();
