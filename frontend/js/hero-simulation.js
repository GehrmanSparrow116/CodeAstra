/**
 * CodeAstra — Health Intelligence Platform
 * File: js/hero-simulation.js
 * Description: Centralized frontend simulation for the interactive Landing Page Hero.
 * Implements a causal health intelligence loop:
 * Disease Signal -> Core Ingestion -> Analytical Scan -> Risk Calculation -> Early Warning.
 */

window.CodeAstraHeroSimulation = (() => {
  'use strict';

  // Centralized Health Intelligence State
  const healthState = {
    dengue: { trend: 18.4, status: 'Increasing', cases: 3006 },
    influenza: { trend: 12.4, status: 'Active', cases: 3547 },
    regionalRisk: { level: 'HIGH', regions: 3, city: 'Gotham' },
    hospitalization: { rate: 14.7, surge: '+2.1%', admissions: 1840 },
    outbreakSignal: { active: true, zScore: 3.42, detected: 'Dengue Surge' },
    ews: { score: 78, max: 100, classification: 'HIGH RISK' }
  };

  const listeners = [];
  let simulationTimer = null;
  let isPaused = false;

  function subscribe(fn) {
    listeners.push(fn);
  }

  function notify(event) {
    listeners.forEach(fn => {
      try { fn(event, healthState); } catch (e) { console.error(e); }
    });
  }

  // Execute Causal Step in Simulation
  function triggerCausalCycle() {
    if (isPaused) return;

    // Step 1: Disease activity anomaly triggers
    const dengueDelta = (Math.random() * 0.8 - 0.2).toFixed(1);
    healthState.dengue.trend = parseFloat((healthState.dengue.trend + parseFloat(dengueDelta)).toFixed(1));
    healthState.dengue.cases += Math.floor(Math.random() * 8) + 2;

    notify({ type: 'node_pulse', nodeKey: 'disease', data: healthState.dengue });

    // Step 2: Signal reaches Core (after 800ms)
    setTimeout(() => {
      if (isPaused) return;
      notify({ type: 'core_process', message: 'Analyzing epidemiological signal...' });

      // Step 3: Outbreak Anomaly recalculates (after 1400ms)
      setTimeout(() => {
        if (isPaused) return;
        healthState.outbreakSignal.zScore = (3.2 + Math.random() * 0.4).toFixed(2);
        notify({ type: 'node_pulse', nodeKey: 'outbreak', data: healthState.outbreakSignal });

        // Step 4: Hospitalization & Regional Risk adjust (after 2000ms)
        setTimeout(() => {
          if (isPaused) return;
          healthState.hospitalization.rate = parseFloat((14.5 + Math.random() * 0.6).toFixed(1));
          notify({ type: 'node_pulse', nodeKey: 'hospital', data: healthState.hospitalization });
          notify({ type: 'node_pulse', nodeKey: 'region', data: healthState.regionalRisk });

          // Step 5: Early Warning Score updates (after 2600ms)
          setTimeout(() => {
            if (isPaused) return;
            const ewsDrift = Math.random() > 0.5 ? 1 : (Math.random() > 0.5 ? -1 : 0);
            healthState.ews.score = Math.max(76, Math.min(81, healthState.ews.score + ewsDrift));
            notify({ type: 'node_pulse', nodeKey: 'ews', data: healthState.ews });
            notify({ type: 'cycle_complete' });
          }, 600);
        }, 600);
      }, 600);
    }, 800);
  }

  // Manual Trigger when user clicks the 3D Core
  function triggerManualAnalysis() {
    notify({ type: 'core_burst', message: 'Manual Intelligence Recalibration' });
    triggerCausalCycle();
  }

  function start() {
    if (simulationTimer) clearInterval(simulationTimer);
    simulationTimer = setInterval(triggerCausalCycle, 6500);
    // Initial trigger
    setTimeout(triggerCausalCycle, 1200);
  }

  function pause() { isPaused = true; }
  function resume() { isPaused = false; }

  return {
    getState: () => healthState,
    subscribe,
    start,
    pause,
    resume,
    triggerManualAnalysis
  };
})();
