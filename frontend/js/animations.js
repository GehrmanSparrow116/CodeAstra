/**
 * CodeAstra — Health Intelligence Platform
 * File: js/animations.js
 * Description: GSAP entrance animations, CountUp number interpolation, and micro-interactions.
 */

window.CodeAstraAnimations = (() => {
  function init() {
    // 1. Initialize Lucide Icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // 2. Run CountUp animation on key KPI numbers
    animateNumbers();

    // 3. Animate EWS contribution bars
    animateContributionBars();

    // 4. GSAP Page Entrance Sequences
    if (typeof gsap !== 'undefined') {
      runGsapEntranceTimeline();
    }
  }

  /**
   * GSAP Orchestrated Entrance Timeline
   */
  function runGsapEntranceTimeline() {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out', duration: 0.55 } });

    tl.from('.top-header', {
      y: -20,
      opacity: 0,
      duration: 0.45
    })
    .from('.hero-welcome-section', {
      y: 15,
      opacity: 0,
      duration: 0.4
    }, '-=0.2')
    .from('.kpi-card', {
      y: 20,
      opacity: 0,
      stagger: 0.08,
      duration: 0.5
    }, '-=0.15')
    // NOTE: Chart cards are NOT animated with opacity to avoid ECharts blank canvas.
    // Charts need fully visible containers to measure width/height on init.
    .from('.pipeline-tracker-card', {
      y: 12,
      opacity: 0,
      duration: 0.4
    }, '-=0.2')
    .from('.surveillance-middle-grid > *', {
      y: 20,
      opacity: 0,
      stagger: 0.09,
      duration: 0.5
    }, '-=0.1')
    .from('.intelligence-bottom-grid > *', {
      y: 20,
      opacity: 0,
      stagger: 0.09,
      duration: 0.5
    }, '-=0.2')
    .from('.historical-comparison-card', {
      y: 15,
      opacity: 0,
      duration: 0.45
    }, '-=0.2');
  }


  /**
   * Smooth CountUp interpolation for numbers
   */
  function animateNumbers() {
    const numberElements = document.querySelectorAll('[data-countup]');
    numberElements.forEach(el => {
      const targetVal = parseFloat(el.getAttribute('data-countup'));
      const formatAsLocale = el.getAttribute('data-format') === 'locale';
      const padZero = el.getAttribute('data-pad') === 'true';

      if (isNaN(targetVal)) return;

      const duration = 1200; // ms
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(easeOut * targetVal);

        if (formatAsLocale) {
          el.innerText = currentVal.toLocaleString();
        } else if (padZero && currentVal < 10) {
          el.innerText = `0${currentVal}`;
        } else {
          el.innerText = currentVal;
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          if (formatAsLocale) {
            el.innerText = targetVal.toLocaleString();
          } else if (padZero && targetVal < 10) {
            el.innerText = `0${targetVal}`;
          } else {
            el.innerText = targetVal;
          }
        }
      }

      requestAnimationFrame(update);
    });
  }

  /**
   * Animates Risk Contribution Fill Tracks
   */
  function animateContributionBars() {
    const fills = document.querySelectorAll('.contribution-fill');
    fills.forEach(fill => {
      const targetWidth = fill.getAttribute('data-width');
      if (targetWidth) {
        fill.style.width = '0%';
        setTimeout(() => {
          fill.style.width = targetWidth;
        }, 300);
      }
    });
  }

  return {
    init,
    animateNumbers
  };
})();
