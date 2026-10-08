/**
 * HealthPulse — Health Intelligence Platform
 * File: js/shared.js
 * Description: Shared application chrome utilities, automatic active navigation routing,
 * sidebar collapsing, modal management, and live header clock ticker.
 */

(function () {
  'use strict';

  // 1. Automatic Active Navigation Highlight based on current URL
  function initActiveNavigation() {
    const currentPath = window.location.pathname.toLowerCase();
    const navItems = document.querySelectorAll('.sidebar-nav-content .nav-item');

    navItems.forEach(item => {
      item.classList.remove('active');
      const href = item.getAttribute('href') || item.getAttribute('data-href');
      if (!href) return;

      const cleanHref = href.toLowerCase().replace(/^\.\.\//, '').replace(/^\.\//, '');
      
      // Exact or page-match checks
      if (
        (currentPath.endsWith('/') || currentPath.endsWith('index.html') || currentPath.endsWith('frontend/')) &&
        (cleanHref === 'index.html' || cleanHref === './index.html' || cleanHref === '../index.html')
      ) {
        item.classList.add('active');
      } else if (cleanHref.length > 0 && cleanHref !== 'index.html' && currentPath.includes(cleanHref.replace('.html', '').replace('pages/', ''))) {
        item.classList.add('active');
      }
    });
  }

  // 2. Sidebar Collapse / Expand Toggle
  function initSidebar() {
    const collapseBtn = document.getElementById('sidebar-collapse-btn');
    const sidebar = document.getElementById('sidebar');
    if (collapseBtn && sidebar) {
      collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }
  }

  // 3. Live Header Clock Ticker
  function initLiveClock() {
    const tickerEl = document.getElementById('live-time-ticker');
    if (!tickerEl) return;

    function updateClock() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      tickerEl.textContent = `${hours}:${mins}:${secs}`;
    }

    updateClock();
    setInterval(updateClock, 1000);
  }

  // 4. Global Search Keyboard Shortcut (Ctrl + K / Cmd + K)
  function initGlobalSearch() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    });
  }

  // 5. Shared Explainability Modal Handlers
  function initModals() {
    const openBtn = document.getElementById('open-explainability-btn');
    const modal = document.getElementById('explainability-modal');
    const closeBtn = document.getElementById('close-modal-btn');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        modal.classList.add('active');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }
  }

  // 6. Global Toast Notification Helper
  window.showToast = function (message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let iconName = 'info';
    if (type === 'critical' || type === 'error') iconName = 'alert-octagon';
    else if (type === 'warning') iconName = 'alert-triangle';
    else if (type === 'success') iconName = 'check-circle-2';

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // 7. Initialize Shared Capabilities on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    initActiveNavigation();
    initSidebar();
    initLiveClock();
    initGlobalSearch();
    initModals();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

})();
