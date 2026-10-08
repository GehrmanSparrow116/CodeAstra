/**
 * CodeAstra — Health Intelligence Platform
 * File: js/landing.js
 * Description: Landing page coordinator: GSAP hero entrance timeline, animated platform statistics,
 * interactive pipeline stepper, and 3D visual initialization.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Initialize Three.js 3D Hero Visual
  if (window.CodeAstraHero3D) {
    window.CodeAstraHero3D.init();
  }

  // 3. GSAP Entrance Timeline (Respects Reduced Motion)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });

    tl.from('.landing-header', { y: -30, opacity: 0, duration: 0.6 })
      .from('.hero-badge-pill', { y: 15, opacity: 0, duration: 0.5 }, '-=0.2')
      .from('.hero-heading', { y: 25, opacity: 0, duration: 0.7 }, '-=0.3')
      .from('.hero-subtext', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
      .from('.hero-btn-group', { y: 15, opacity: 0, duration: 0.5 }, '-=0.3')
      .from('.hero-3d-stage', { scale: 0.94, opacity: 0, duration: 0.9 }, '-=0.5')
      .from('.hero-floating-card', { y: 15, opacity: 0, stagger: 0.15, duration: 0.6 }, '-=0.4')
      .from('.stat-metric-card', { y: 20, opacity: 0, stagger: 0.1, duration: 0.5 }, '-=0.2');
  }

  // 4. Animated Statistics Count-Up
  initStatisticsCountUp();

  // 5. Interactive Pipeline Stepper Loop
  initPipelineStepper();
});

// Platform Statistics Count-Up
function initStatisticsCountUp() {
  const statElements = document.querySelectorAll('[data-countup]');
  if (!statElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetVal = parseFloat(el.getAttribute('data-countup'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const isLocale = el.getAttribute('data-format') === 'locale';

        let current = 0;
        const duration = 1600;
        const startTime = performance.now();

        function step(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          current = Math.floor(targetVal * easeOut);

          el.textContent = `${prefix}${isLocale ? current.toLocaleString() : current}${suffix}`;

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = `${prefix}${isLocale ? targetVal.toLocaleString() : targetVal}${suffix}`;
          }
        }

        requestAnimationFrame(step);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  statElements.forEach(el => observer.observe(el));
}

// "How CodeAstra Works" Pipeline Animation Stepper
function initPipelineStepper() {
  const nodes = document.querySelectorAll('.pipeline-node-box');
  if (!nodes.length) return;

  let activeIdx = 0;
  setInterval(() => {
    nodes.forEach(n => {
      n.classList.remove('active-step');
      n.style.borderColor = 'var(--landing-border)';
      n.style.background = '#ffffff';
    });

    const activeNode = nodes[activeIdx];
    if (activeNode) {
      activeNode.classList.add('active-step');
      activeNode.style.borderColor = 'var(--landing-blue)';
      activeNode.style.background = '#eff6ff';
    }

    activeIdx = (activeIdx + 1) % nodes.length;
  }, 2200);
}
