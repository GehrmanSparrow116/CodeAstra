/**
 * HealthPulse — Health Intelligence Platform
 * File: js/charts.js
 * Description: Apache ECharts configurations, rendering logic, and reactive updates.
 */

window.HealthPulseCharts = (() => {
  let caseTrendChart = null;
  let diseaseDonutChart = null;
  let ewsGaugeChart = null;
  let predictionChart = null;
  let kpiSparklines = [];

  /**
   * Initializes all ECharts instances on the dashboard.
   */
  function initAll(data) {
    if (typeof echarts === 'undefined') {
      console.error('[HealthPulse] Apache ECharts library not found.');
      return;
    }

    try {
      console.log('[HealthPulse] Initializing all ECharts visualizations...');
      initCaseTrend(data.trends);
      initDiseaseDistribution(data.diseaseDistribution, data.kpis.totalCases.display);
      initEwsGauge(data.earlyWarningIntelligence.overallScore);
      initPredictionMiniChart(data.nextWeekPrediction);
      initKpiMicroCharts(data.kpis);

      // Attach responsive resize observer
      window.addEventListener('resize', debounceResize);

      // Automatic ResizeObserver for container dimensional changes
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => debounceResize());
        const containers = ['case-trend-chart', 'disease-donut-chart', 'ews-gauge-chart', 'prediction-mini-echart'];
        containers.forEach(id => {
          const el = document.getElementById(id);
          if (el) ro.observe(el);
        });
      }

      // Multi-pass resize triggers:
      // 60ms  → after first browser paint
      // 300ms → after CSS transitions
      // 700ms → after GSAP entrance animations (they run ~600ms total)
      // 1500ms → safety net after all animations complete
      setTimeout(resizeAll, 60);
      setTimeout(resizeAll, 300);
      setTimeout(resizeAll, 700);
      setTimeout(() => {
        resizeAll();
        console.log('[HealthPulse] Final chart resize completed.');
      }, 1500);

      // RAF-based check to ensure DOM has valid dimensions before trusting initial render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resizeAll();
        });
      });

    } catch (err) {
      console.error('[HealthPulse] Error during chart initialization:', err);
    }
  }

  // ===========================================================================
  // 1. CASE TREND TIME-SERIES CHART
  // ===========================================================================
  function initCaseTrend(trendsData) {
    const chartDom = document.getElementById('case-trend-chart');
    if (!chartDom) {
      console.error('[HealthPulse] Case trend container #case-trend-chart not found.');
      return;
    }

    if (caseTrendChart) {
      caseTrendChart.dispose();
    }
    caseTrendChart = echarts.init(chartDom);
    const initialTimeframe = trendsData?.timeframes?.['1Y'] || trendsData;
    renderCaseTrendSeries(initialTimeframe);
  }

  function renderCaseTrendSeries(timeframeData) {
    if (!caseTrendChart) return;

    // Build outbreak scatter points
    const outbreakScatterData = timeframeData.outbreaks.map(item => [
      item.index,
      item.cases,
      item.label,
      item.hosp,
      item.date
    ]);

    const option = {
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: [12, 16],
        textStyle: { color: '#0f172a', fontFamily: 'Outfit, sans-serif' },
        extraCssText: 'box-shadow: 0 10px 25px -5px rgba(15,23,42,0.1); border-radius: 10px;',
        formatter: function (params) {
          const dataIndex = params[0].dataIndex;
          const monthLabel = timeframeData.labels[dataIndex];
          const casesVal = params[0]?.value || 0;
          const hospVal = params[1]?.value || 0;
          const isOutbreak = timeframeData.outbreaks.find(o => o.index === dataIndex);

          let html = `
            <div style="font-weight: 800; font-size: 0.85rem; margin-bottom: 6px; color: #0f172a;">
              ${isOutbreak ? isOutbreak.date : monthLabel}
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; font-size:0.8rem; margin-bottom:4px;">
              <span style="display:flex; align-items:center; gap:6px;">
                <span style="width:8px; height:8px; border-radius:50%; background:#2563eb;"></span>
                <span style="color:#64748b;">Cases:</span>
              </span>
              <span style="font-weight:800; color:#0f172a;">${casesVal.toLocaleString()}</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; font-size:0.8rem; margin-bottom:4px;">
              <span style="display:flex; align-items:center; gap:6px;">
                <span style="width:8px; height:8px; border-radius:50%; background:#ef4444;"></span>
                <span style="color:#64748b;">Hospitalizations:</span>
              </span>
              <span style="font-weight:800; color:#0f172a;">${hospVal.toLocaleString()}</span>
            </div>
          `;

          if (isOutbreak) {
            html += `
              <div style="margin-top:6px; padding:3px 6px; border-radius:4px; background:#fee2e2; color:#b91c1c; font-size:0.72rem; font-weight:800; text-align:center;">
                ⚠️ ${isOutbreak.label}
              </div>
            `;
          }

          return html;
        }
      },
      axisPointer: {
        lineStyle: { color: '#cbd5e1', type: 'dashed' }
      },
      grid: {
        top: 25,
        right: 15,
        bottom: 30,
        left: 45
      },
      xAxis: {
        type: 'category',
        data: timeframeData.labels,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#64748b',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'solid' } },
        axisLabel: {
          color: '#94a3b8',
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 600,
          fontSize: 11
        }
      },
      series: [
        // Series 1: Total Cases
        {
          name: 'Total Cases',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: timeframeData.cases,
          lineStyle: { width: 3, color: '#2563eb' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(37, 99, 235, 0.22)' },
              { offset: 1, color: 'rgba(37, 99, 235, 0.01)' }
            ])
          }
        },
        // Series 2: Hospitalizations
        {
          name: 'Hospitalizations',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: timeframeData.hospitalizations,
          lineStyle: { width: 2, color: '#ef4444' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(239, 68, 68, 0.15)' },
              { offset: 1, color: 'rgba(239, 68, 68, 0.01)' }
            ])
          }
        },
        // Series 3: Outbreak Event Scatter Points
        {
          name: 'Outbreak Events',
          type: 'scatter',
          coordinateSystem: 'cartesian2d',
          data: outbreakScatterData,
          symbolSize: 14,
          itemStyle: {
            color: '#f97316',
            borderColor: '#ffffff',
            borderWidth: 2,
            shadowColor: 'rgba(249, 115, 22, 0.5)',
            shadowBlur: 6
          },
          z: 10
        }
      ]
    };

    caseTrendChart.setOption(option, true);
  }

  function updateCaseTrend(timeframeKey, diseaseKey) {
    if (!caseTrendChart || !DashboardState.data) return;

    let baseData = DashboardState.data.trends.timeframes[timeframeKey] || DashboardState.data.trends.timeframes['1Y'];

    // If specific disease is selected, scale metrics dynamically for demonstration
    if (diseaseKey && diseaseKey !== 'All Diseases') {
      const scaleMultiplier = diseaseKey === 'Influenza' ? 0.35 :
                              diseaseKey === 'Dengue' ? 0.28 :
                              diseaseKey === 'COVID-19' ? 0.20 :
                              diseaseKey === 'Cholera' ? 0.12 : 0.08;

      baseData = {
        labels: baseData.labels,
        cases: baseData.cases.map(v => Math.round(v * scaleMultiplier)),
        hospitalizations: baseData.hospitalizations.map(v => Math.round(v * scaleMultiplier)),
        outbreaks: baseData.outbreaks.map(o => ({
          ...o,
          cases: Math.round(o.cases * scaleMultiplier),
          hosp: Math.round(o.hosp * scaleMultiplier)
        }))
      };
    }

    renderCaseTrendSeries(baseData);
  }

  // ===========================================================================
  // 2. DISEASE DISTRIBUTION DONUT CHART
  // ===========================================================================
  function initDiseaseDistribution(distributionList, totalCasesDisplay) {
    const chartDom = document.getElementById('disease-donut-chart');
    if (!chartDom) return;

    diseaseDonutChart = echarts.init(chartDom);

    const seriesData = distributionList.map(item => ({
      name: item.name,
      value: item.cases,
      percentage: item.percentage,
      itemStyle: { color: item.color }
    }));

    const option = {
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        padding: [8, 12],
        textStyle: { color: '#0f172a', fontFamily: 'Outfit, sans-serif' },
        extraCssText: 'box-shadow: 0 8px 20px rgba(0,0,0,0.08); border-radius: 8px;',
        formatter: (params) => {
          return `
            <div style="font-weight: 800; font-size: 0.85rem; color: #0f172a;">${params.name}</div>
            <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;">
              ${params.value.toLocaleString()} cases (${params.data.percentage}%)
            </div>
          `;
        }
      },
      series: [
        {
          name: 'Diseases',
          type: 'pie',
          radius: ['62%', '84%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#ffffff',
            borderWidth: 3
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            scale: true,
            scaleSize: 6,
            label: {
              show: false
            }
          },
          labelLine: { show: false },
          data: seriesData
        }
      ],
      // Center Text Representation
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '42%',
          style: {
            text: totalCasesDisplay,
            fill: '#0f172a',
            fontSize: 20,
            fontWeight: 800,
            fontFamily: 'Outfit, sans-serif'
          }
        },
        {
          type: 'text',
          left: 'center',
          top: '55%',
          style: {
            text: 'Total Cases',
            fill: '#64748b',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'Outfit, sans-serif'
          }
        }
      ]
    };

    diseaseDonutChart.setOption(option);
  }

  function updateDiseaseDistribution(distributionList, totalCasesDisplay) {
    if (!diseaseDonutChart) return;
    try {
      const seriesData = distributionList.map(item => ({
        name: item.name,
        value: item.cases,
        percentage: item.percentage,
        itemStyle: { color: item.color }
      }));

      const updateObj = {
        series: [{ data: seriesData }]
      };

      if (totalCasesDisplay) {
        updateObj.graphic = [
          {
            type: 'text',
            left: 'center',
            top: '42%',
            style: {
              text: totalCasesDisplay,
              fill: '#0f172a',
              fontSize: 20,
              fontWeight: 800,
              fontFamily: 'Outfit, sans-serif'
            }
          },
          {
            type: 'text',
            left: 'center',
            top: '55%',
            style: {
              text: 'Total Cases',
              fill: '#64748b',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'Outfit, sans-serif'
            }
          }
        ];
      }

      diseaseDonutChart.setOption(updateObj);
    } catch (e) {
      console.warn('[HealthPulse] Error updating disease donut chart:', e);
    }
  }

  // ===========================================================================
  // 3. EARLY WARNING SCORE RADIAL GAUGE
  // ===========================================================================
  function initEwsGauge(score) {
    const chartDom = document.getElementById('ews-gauge-chart');
    if (!chartDom) return;

    ewsGaugeChart = echarts.init(chartDom);

    const option = {
      series: [
        {
          type: 'gauge',
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 100,
          splitNumber: 5,
          radius: '95%',
          center: ['50%', '55%'],
          itemStyle: {
            color: '#ef4444' // High Risk red
          },
          progress: {
            show: true,
            width: 10,
            roundCap: true,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#f59e0b' },
                { offset: 0.6, color: '#f97316' },
                { offset: 1, color: '#ef4444' }
              ])
            }
          },
          pointer: { show: false },
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 10,
              color: [[1, '#f1f5f9']]
            }
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: { show: false },
          data: [{ value: score }]
        }
      ]
    };

    ewsGaugeChart.setOption(option);
  }

  // ===========================================================================
  // 4. NEXT-WEEK PREDICTION MINI CHART
  // ===========================================================================
  function initPredictionMiniChart(predData) {
    const chartDom = document.getElementById('prediction-mini-echart');
    if (!chartDom) return;

    predictionChart = echarts.init(chartDom);

    const option = {
      grid: { top: 10, right: 10, bottom: 20, left: 25 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#ffffff',
        borderColor: '#e2e8f0',
        padding: [4, 8],
        textStyle: { fontSize: 11, fontFamily: 'Outfit, sans-serif' }
      },
      xAxis: {
        type: 'category',
        data: predData.timeline.labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 9,
          fontWeight: 600,
          interval: 1
        }
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [
        {
          name: 'Actual Cases',
          type: 'line',
          smooth: true,
          data: predData.timeline.actual,
          symbolSize: 4,
          lineStyle: { width: 2, color: '#2563eb' },
          itemStyle: { color: '#2563eb' }
        },
        {
          name: 'Predicted Cases',
          type: 'line',
          smooth: true,
          data: predData.timeline.predicted,
          symbolSize: 6,
          lineStyle: { width: 2, color: '#ef4444', type: 'dashed' },
          itemStyle: { color: '#ef4444' }
        }
      ]
    };

    predictionChart.setOption(option);
  }

  // ===========================================================================
  // 5. MICRO KPI SPARKLINES
  // ===========================================================================
  function initKpiMicroCharts(kpis) {
    // 1. Cases Wave Line
    const casesSparkDom = document.getElementById('kpi-sparkline-cases');
    if (casesSparkDom) {
      const chart = echarts.init(casesSparkDom);
      chart.setOption({
        grid: { top: 2, right: 2, bottom: 2, left: 2 },
        xAxis: { type: 'category', show: false, data: kpis.totalCases.sparkline },
        yAxis: { type: 'value', show: false },
        series: [{
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: kpis.totalCases.sparkline,
          lineStyle: { width: 2, color: '#38bdf8' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(56, 189, 248, 0.4)' },
              { offset: 1, color: 'rgba(56, 189, 248, 0.0)' }
            ])
          }
        }]
      });
      kpiSparklines.push(chart);
    }

    // 2. Outbreaks Bar Chart
    const outbreaksSparkDom = document.getElementById('kpi-sparkline-outbreaks');
    if (outbreaksSparkDom) {
      const chart = echarts.init(outbreaksSparkDom);
      chart.setOption({
        grid: { top: 2, right: 2, bottom: 2, left: 2 },
        xAxis: { type: 'category', show: false, data: kpis.activeOutbreaks.sparkline },
        yAxis: { type: 'value', show: false },
        series: [{
          type: 'bar',
          data: kpis.activeOutbreaks.sparkline,
          itemStyle: { color: '#f87171', borderRadius: [2, 2, 0, 0] },
          barWidth: 4
        }]
      });
      kpiSparklines.push(chart);
    }

    // 3. High Risk Regions Bar Chart
    const regionsSparkDom = document.getElementById('kpi-sparkline-regions');
    if (regionsSparkDom) {
      const chart = echarts.init(regionsSparkDom);
      chart.setOption({
        grid: { top: 2, right: 2, bottom: 2, left: 2 },
        xAxis: { type: 'category', show: false, data: kpis.highRiskRegions.sparkline },
        yAxis: { type: 'value', show: false },
        series: [{
          type: 'bar',
          data: kpis.highRiskRegions.sparkline,
          itemStyle: { color: '#fb923c', borderRadius: [2, 2, 0, 0] },
          barWidth: 4
        }]
      });
      kpiSparklines.push(chart);
    }
  }

  // ===========================================================================
  // REAL-TIME STREAM UPDATE METHODS
  // ===========================================================================
  function appendStreamPoint(newLabel, casesValue, hospValue, isOutbreak) {
    if (!caseTrendChart) return;

    try {
      const option = caseTrendChart.getOption();
      if (!option || !option.xAxis || !option.xAxis[0]) return;

      const labels = option.xAxis[0].data || [];
      const casesData = option.series[0].data || [];
      const hospData = option.series[1].data || [];
      let scatterData = option.series[2]?.data || [];

      // Append new data
      labels.push(newLabel);
      casesData.push(casesValue);
      hospData.push(hospValue);

      // Keep window manageable (max 16 points for smooth sliding)
      if (labels.length > 15) {
        labels.shift();
        casesData.shift();
        hospData.shift();
        // Shift scatter indices
        scatterData = scatterData
          .map(pt => [pt[0] - 1, pt[1], pt[2], pt[3], pt[4]])
          .filter(pt => pt[0] >= 0);
      }

      if (isOutbreak) {
        scatterData.push([
          labels.length - 1,
          casesValue,
          'Outbreak Detected',
          hospValue,
          newLabel
        ]);
      }

      // Smoothly update ECharts with animation
      caseTrendChart.setOption({
        xAxis: [{ data: labels }],
        series: [
          { data: casesData },
          { data: hospData },
          { data: scatterData }
        ]
      }, false, false);
    } catch (e) {
      console.warn('[HealthPulse] Error appending stream point to Case Trend:', e);
    }
  }

  function updateEwsGauge(score) {
    if (!ewsGaugeChart) return;
    ewsGaugeChart.setOption({
      series: [
        {
          data: [{ value: score }]
        }
      ]
    });
  }

  function updatePredictionValue(predictedCases, timelineLabels, actualArr, predictedArr) {
    if (!predictionChart) return;
    try {
      const updateObj = {
        series: [
          { data: actualArr },
          { data: predictedArr }
        ]
      };
      if (timelineLabels && timelineLabels.length > 0) {
        updateObj.xAxis = { data: timelineLabels };
      }
      predictionChart.setOption(updateObj);
    } catch (e) {
      console.warn('[HealthPulse] Error updating prediction chart:', e);
    }
  }

  // ===========================================================================
  // RESIZE HANDLER
  // ===========================================================================
  let resizeTimeout = null;
  function debounceResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeAll, 100);
  }

  function resizeAll() {
    try {
      if (caseTrendChart) caseTrendChart.resize();
      if (diseaseDonutChart) diseaseDonutChart.resize();
      if (ewsGaugeChart) ewsGaugeChart.resize();
      if (predictionChart) predictionChart.resize();
      kpiSparklines.forEach(s => s && s.resize());
    } catch (e) {
      console.warn('[HealthPulse] Resize warning:', e);
    }
  }

  function getChartInstances() {
    return {
      caseTrendChart,
      diseaseDonutChart,
      ewsGaugeChart,
      predictionChart
    };
  }

  return {
    initAll,
    updateCaseTrend,
    updateDiseaseDistribution,
    resizeAll,
    appendStreamPoint,
    updateEwsGauge,
    updatePredictionValue,
    getChartInstances
  };
})();

window.CodeAstraCharts = window.HealthPulseCharts;
