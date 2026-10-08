/**
 * HealthPulse — Public / End-User Health Portal
 * File: js/public/public-common.js
 * Description: Shared public navigation, footer, Lucide icon initialization, location selector, and session state.
 */

window.HealthPulsePublic = (() => {
  // Monitored Demo Regions
  const DEMO_REGIONS = [
    { name: "Metropolis", risk: "HIGH", disease: "Dengue", trend: "↑ Increasing", trendVal: "+18.4%", cases: 3035, alert: "High mosquito vector density reported in suburban zones." },
    { name: "Gotham", risk: "CRITICAL", disease: "Influenza", trend: "↑ High Spike", trendVal: "+24.1%", cases: 4120, alert: "Respiratory clinic admissions elevating in industrial sector." },
    { name: "Star City", risk: "MODERATE", disease: "COVID-19", trend: "→ Stable", trendVal: "+1.2%", cases: 1840, alert: "Sub-variant activity remaining steady under surveillance." },
    { name: "Central City", risk: "LOW", disease: "Dengue", trend: "↓ Decreasing", trendVal: "-8.5%", cases: 920, alert: "Community vector control campaigns yielding positive results." },
    { name: "Coast City", risk: "MODERATE", disease: "Cholera", trend: "↑ Slight Increase", trendVal: "+4.8%", cases: 1250, alert: "Coastal water quality testing active following rainfall." }
  ];

  let selectedRegion = sessionStorage.getItem('healthpulse_public_region') || sessionStorage.getItem('codeastra_public_region') || 'Metropolis';

  function init() {
    console.log('[HealthPulse Public] Initializing Public Navigation & Services...');
    
    // 1. Highlight Active Nav Link
    highlightActiveNavLink();

    // 2. Setup Auth Action Button (Sign In / Logout)
    setupAuthButton();

    // 3. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // 4. Setup Mobile Hamburger Drawer
    setupMobileNav();
  }

  function highlightActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links-public a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function setupAuthButton() {
    const btn = document.getElementById('public-nav-auth-btn');
    if (!btn) return;

    let session = null;
    const authObj = window.HealthPulseAuth || window.CodeAstraAuth;
    if (authObj) {
      session = authObj.getSession();
    }

    if (session && session.isLoggedIn) {
      btn.innerText = "Logout";
      btn.href = "javascript:void(0);";
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (authObj) {
          authObj.logout('../');
        } else {
          sessionStorage.clear();
          window.location.href = "../index.html";
        }
      });
    } else {
      btn.innerText = "Sign In";
      btn.href = "../login.html";
    }
  }

  function getRegionData(regionName) {
    return DEMO_REGIONS.find(r => r.name.toLowerCase() === (regionName || selectedRegion).toLowerCase()) || DEMO_REGIONS[0];
  }

  function setSelectedRegion(regionName) {
    selectedRegion = regionName;
    sessionStorage.setItem('healthpulse_public_region', regionName);

    // Dispatch event so active page can update UI
    const data = getRegionData(regionName);
    window.dispatchEvent(new CustomEvent('healthpulse:regionChanged', { detail: data }));
    window.dispatchEvent(new CustomEvent('codeastra:regionChanged', { detail: data }));
  }

  function setupMobileNav() {
    const toggle = document.getElementById('mobile-nav-toggle');
    const links = document.getElementById('nav-links-public');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('mobile-open');
      });
    }
  }

  return {
    init,
    getRegionData,
    setSelectedRegion,
    DEMO_REGIONS
  };
})();

window.CodeAstraPublic = window.HealthPulsePublic;

document.addEventListener('DOMContentLoaded', () => {
  (window.HealthPulsePublic || window.CodeAstraPublic).init();
});

