/**
 * HealthPulse — Public / End-User Health Portal
 * File: js/public/how-it-works.js
 * Description: Controller for How HealthPulse Works — Sequential GSAP pipeline animations and platform architecture.
 */

window.HealthPulseHowItWorks = (() => {
  function init() {
    console.log('[HealthPulse HowItWorks] Initializing Pipeline Animations & Content...');

    // 1. GSAP Pipeline Animation
    initPipelineAnimations();
  }

  function initPipelineAnimations() {
    if (typeof gsap === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Timeline for pipeline step rows
    gsap.from('.pipeline-step-row', {
      scrollTrigger: {
        trigger: '.pipeline-flow-container',
        start: 'top 80%'
      },
      opacity: 0,
      x: -30,
      stagger: 0.15,
      duration: 0.6,
      ease: 'power2.out'
    });

    gsap.from('.pro-vs-public-card', {
      scrollTrigger: {
        trigger: '.pro-vs-public-grid',
        start: 'top 80%'
      },
      opacity: 0,
      y: 30,
      stagger: 0.2,
      duration: 0.7,
      ease: 'power2.out'
    });
  }

  return { init };
})();

window.CodeAstraHowItWorks = window.HealthPulseHowItWorks;

document.addEventListener('DOMContentLoaded', () => {
  (window.HealthPulseHowItWorks || window.CodeAstraHowItWorks).init();
});

