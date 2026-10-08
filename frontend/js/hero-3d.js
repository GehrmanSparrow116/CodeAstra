/**
 * CodeAstra — Health Intelligence Platform
 * File: js/hero-3d.js
 * Description: Interactive Three.js 3D Health Intelligence Engine.
 * Features: Central glowing core with gyroscopic rings, 6 floating orbital health nodes,
 * connecting bezier data paths, animated stream particles, mouse parallax, and HTML badge projection.
 */

window.CodeAstraHero3D = (() => {
  'use strict';

  let scene, camera, renderer, container;
  let coreGroup, innerSphere, outerLattice, ring1, ring2, ring3, ecgLine;
  let nodes = [];
  let connectionCurves = [];
  let dataParticles = [];
  let isRunning = true;
  let isVisible = true;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let clock = new THREE.Clock();

  // Configuration of 6 orbital health nodes
  const NODE_CONFIGS = [
    {
      key: 'disease',
      label: 'Disease Activity',
      val: 'DENGUE ↑ 18.4%',
      icon: 'virus',
      pillClass: 'red',
      color: 0xef4444,
      pos: new THREE.Vector3(-5.2, 2.6, 0.5),
      detail: { title: 'Dengue Outbreak Signal', body: 'Transmission velocity increasing in 3 monitored sectors with rising outpatient positivity.' }
    },
    {
      key: 'trends',
      label: 'Case Trends',
      val: 'CASES ↑ 12.4%',
      icon: 'trending-up',
      pillClass: 'blue',
      color: 0x2563eb,
      pos: new THREE.Vector3(5.2, 2.8, -0.4),
      detail: { title: 'Case Growth Trajectory', body: '12,482 monitored cases across 5 cities showing positive week-over-week momentum.' }
    },
    {
      key: 'region',
      label: 'Regional Risk',
      val: 'RISK: HIGH (3 Cities)',
      icon: 'map-pin',
      pillClass: 'orange',
      color: 0xf97316,
      pos: new THREE.Vector3(-5.8, -1.4, -0.2),
      detail: { title: 'Municipal Risk Classification', body: 'Gotham & Metropolis classified under High / Critical epidemic watch.' }
    },
    {
      key: 'hospital',
      label: 'Hospitalization',
      val: 'BURDEN: 14.7%',
      icon: 'hospital',
      pillClass: 'purple',
      color: 0x7c3aed,
      pos: new THREE.Vector3(5.6, -1.2, 0.3),
      detail: { title: 'Acute Care Admissions', body: '1,840 hospital admissions recorded with ICU bed capacity at 76%.' }
    },
    {
      key: 'outbreak',
      label: 'Anomaly Detection',
      val: 'Z-SCORE = 3.42',
      icon: 'alert-triangle',
      pillClass: 'yellow',
      color: 0xca8a04,
      pos: new THREE.Vector3(-2.6, -3.8, 0.4),
      detail: { title: 'Statistical Anomaly Scan', body: 'Z-Score deviation of 3.42 exceeds the 99th percentile epidemic baseline.' }
    },
    {
      key: 'ews',
      label: 'Early Warning',
      val: 'EWS 78 / 100',
      icon: 'shield-check',
      pillClass: 'teal',
      color: 0x059669,
      pos: new THREE.Vector3(2.8, -3.8, -0.3),
      detail: { title: 'Early Warning Score', body: 'Composite threshold trigger dispatching automated healthcare advisories.' }
    }
  ];

  // Detect WebGL Support
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  function init() {
    container = document.getElementById('hero-three-canvas-container');
    if (!container) return;

    if (!isWebGLAvailable() || typeof THREE === 'undefined') {
      showFallback();
      return;
    }

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 520;

    // 1. Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    // 2. Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x2563eb, 2.5, 25);
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    const secondaryLight = new THREE.PointLight(0x06b6d4, 1.8, 20);
    secondaryLight.position.set(-4, 3, 4);
    scene.add(secondaryLight);

    // 4. Build Core, Nodes, Curves & Particles
    createCore();
    createNodesAndConnections();
    createDataParticles();
    createEcgRing();
    createHtmlOverlays();

    // 5. Event Listeners
    setupEvents();

    // 6. Connect to Causal Health Simulation
    if (window.CodeAstraHeroSimulation) {
      window.CodeAstraHeroSimulation.subscribe(handleSimulationEvent);
      window.CodeAstraHeroSimulation.start();
    }

    // 7. Start Animation Loop
    animate();
  }

  // Create Central Intelligence Core
  function createCore() {
    coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner Glowing Core Sphere
    const innerGeo = new THREE.SphereGeometry(1.3, 32, 32);
    const innerMat = new THREE.MeshPhongMaterial({
      color: 0x1d4ed8,
      emissive: 0x2563eb,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.88,
      shininess: 90
    });
    innerSphere = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerSphere);

    // Outer Translucent Wireframe Lattice
    const outerGeo = new THREE.IcosahedronGeometry(1.7, 2);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    outerLattice = new THREE.Mesh(outerGeo, outerMat);
    coreGroup.add(outerLattice);

    // Gyroscopic Ring 1
    const ringGeo1 = new THREE.TorusGeometry(2.1, 0.025, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.7 });
    ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    // Gyroscopic Ring 2
    const ringGeo2 = new THREE.TorusGeometry(2.4, 0.02, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.6 });
    ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    coreGroup.add(ring2);

    // Gyroscopic Ring 3 (Outer Orbit Ring)
    const ringGeo3 = new THREE.TorusGeometry(2.7, 0.015, 16, 100);
    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.4 });
    ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.z = Math.PI / 5;
    coreGroup.add(ring3);
  }

  // Create ECG Sine Wave Ring
  function createEcgRing() {
    const points = [];
    const segments = 120;
    const radius = 2.9;

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      let r = radius;
      // Add ECG pulse spikes at specific intervals
      if (i > 25 && i < 35) {
        const offset = Math.sin((i - 25) * Math.PI * 0.2);
        r += offset * (i % 2 === 0 ? 0.45 : -0.3);
      }
      points.push(new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta) * r, 0));
    }

    const ecgGeo = new THREE.BufferGeometry().setFromPoints(points);
    const ecgMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
    ecgLine = new THREE.Line(ecgGeo, ecgMat);
    coreGroup.add(ecgLine);
  }

  // Create 6 Orbital Nodes and Connecting Curves
  function createNodesAndConnections() {
    NODE_CONFIGS.forEach((cfg) => {
      // 3D Node Mesh
      const nodeGroup = new THREE.Group();
      nodeGroup.position.copy(cfg.pos);

      // Node Sphere
      const sphereGeo = new THREE.SphereGeometry(0.35, 24, 24);
      const sphereMat = new THREE.MeshPhongMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.5,
        shininess: 80
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      nodeGroup.add(sphere);

      // Outer Halo Ring
      const haloGeo = new THREE.RingGeometry(0.45, 0.52, 32);
      const haloMat = new THREE.MeshBasicMaterial({ color: cfg.color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      nodeGroup.add(halo);

      scene.add(nodeGroup);
      nodes.push({ mesh: nodeGroup, config: cfg, sphere, halo, initialPos: cfg.pos.clone() });

      // Curved Connection between Node and Core Center (0,0,0)
      const midPoint = new THREE.Vector3()
        .addVectors(cfg.pos, new THREE.Vector3(0, 0, 0))
        .multiplyScalar(0.5);
      midPoint.z += (Math.random() - 0.5) * 1.5;

      const curve = new THREE.CatmullRomCurve3([cfg.pos, midPoint, new THREE.Vector3(0, 0, 0)]);
      connectionCurves.push({ curve, nodeKey: cfg.key });

      // Render Connection Line
      const points = curve.getPoints(40);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.28 });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
    });
  }

  // Create Animated Stream Particles traveling along the curves
  function createDataParticles() {
    connectionCurves.forEach((item, idx) => {
      // 2-3 particles per curve with staggered progress
      for (let p = 0; p < 2; p++) {
        const pGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const pMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        scene.add(pMesh);

        dataParticles.push({
          mesh: pMesh,
          curve: item.curve,
          nodeKey: item.nodeKey,
          progress: (p * 0.5 + idx * 0.15) % 1.0,
          speed: 0.0035 + Math.random() * 0.002
        });
      }
    });
  }

  // Generate 2D HTML Floating Badges and Central Label
  function createHtmlOverlays() {
    const stage = document.querySelector('.hero-3d-stage');
    if (!stage) return;

    // Remove existing badges if any
    stage.querySelectorAll('.hero-node-badge, .hero-core-label, .node-detail-panel').forEach(el => el.remove());

    // 1. Central Core Interactive Button
    const coreLabel = document.createElement('div');
    coreLabel.className = 'hero-core-label';
    coreLabel.innerHTML = `
      <div class="core-brand-name">
        <i data-lucide="cpu" style="width:14px; height:14px;"></i>
        <span>HEALTHPULSE</span>
      </div>
      <div class="core-subtitle">Health Intelligence Core</div>
      <div class="core-pulse-hint">Click to recalibrate</div>
    `;
    coreLabel.addEventListener('click', () => {
      if (window.CodeAstraHeroSimulation) {
        window.CodeAstraHeroSimulation.triggerManualAnalysis();
      }
      pulseCoreVisual();
    });
    stage.appendChild(coreLabel);

    // 2. Six Floating Orbital Badges
    NODE_CONFIGS.forEach(cfg => {
      const badge = document.createElement('div');
      badge.className = 'hero-node-badge';
      badge.id = `badge-${cfg.key}`;
      badge.innerHTML = `
        <div class="node-icon-pill ${cfg.pillClass}">
          <i data-lucide="${cfg.icon}"></i>
        </div>
        <div class="node-text-group">
          <span class="node-label">${cfg.label}</span>
          <span class="node-value" id="val-${cfg.key}">${cfg.val}</span>
        </div>
      `;

      badge.addEventListener('click', () => {
        showNodeDetail(cfg);
        pulseNodeVisual(cfg.key);
      });

      stage.appendChild(badge);
    });

    // 3. Inspection Panel Modal
    const panel = document.createElement('div');
    panel.className = 'node-detail-panel';
    panel.id = 'node-detail-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <div class="panel-title" id="panel-title">Node Inspection</div>
        <button class="panel-close-btn" onclick="document.getElementById('node-detail-panel').classList.remove('visible')">
          <i data-lucide="x" style="width:14px; height:14px;"></i>
        </button>
      </div>
      <div class="panel-body-text" id="panel-body">Details</div>
      <div class="panel-stats-row">
        <span style="color:var(--landing-text-muted);">Status: <strong style="color:var(--landing-blue);" id="panel-status">Active Telemetry</strong></span>
        <span style="font-weight:700; color:var(--landing-navy);" id="panel-metric">Sync: 100%</span>
      </div>
    `;
    stage.appendChild(panel);

    if (window.lucide) window.lucide.createIcons();
  }

  function showNodeDetail(cfg) {
    const panel = document.getElementById('node-detail-panel');
    const title = document.getElementById('panel-title');
    const body = document.getElementById('panel-body');
    const metric = document.getElementById('panel-metric');

    if (panel && title && body && metric) {
      title.textContent = cfg.detail.title;
      body.textContent = cfg.detail.body;
      metric.textContent = cfg.val;
      panel.classList.add('visible');
    }
  }

  // Handle Causal Events from Hero Simulation
  function handleSimulationEvent(event, state) {
    if (event.type === 'node_pulse') {
      pulseNodeVisual(event.nodeKey);
      updateBadgeValues(state);
    } else if (event.type === 'core_process' || event.type === 'core_burst') {
      pulseCoreVisual();
    }
  }

  function updateBadgeValues(state) {
    const dengueEl = document.getElementById('val-disease');
    if (dengueEl) dengueEl.textContent = `DENGUE ↑ ${state.dengue.trend}%`;

    const ewsEl = document.getElementById('val-ews');
    if (ewsEl) ewsEl.textContent = `EWS ${state.ews.score} / 100`;

    const hospEl = document.getElementById('val-hospital');
    if (hospEl) hospEl.textContent = `BURDEN: ${state.hospitalization.rate}%`;

    const outEl = document.getElementById('val-outbreak');
    if (outEl) outEl.textContent = `Z-SCORE = ${state.outbreakSignal.zScore}`;
  }

  function pulseNodeVisual(nodeKey) {
    const node = nodes.find(n => n.config.key === nodeKey);
    const badge = document.getElementById(`badge-${nodeKey}`);

    if (badge) {
      badge.classList.remove('active-pulse');
      void badge.offsetWidth;
      badge.classList.add('active-pulse');
    }

    if (node && typeof gsap !== 'undefined') {
      gsap.to(node.sphere.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 0.25, yoyo: true, repeat: 1 });
    }
  }

  function pulseCoreVisual() {
    if (typeof gsap !== 'undefined' && innerSphere) {
      gsap.to(innerSphere.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.35, yoyo: true, repeat: 1, ease: 'power2.out' });
      gsap.to(outerLattice.rotation, { y: outerLattice.rotation.y + 0.8, duration: 0.6 });
    }
  }

  // Sync 2D HTML Badges to 3D Coordinates
  function updateHtmlBadgePositions() {
    if (!camera || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const widthHalf = width / 2;
    const heightHalf = height / 2;

    nodes.forEach(node => {
      const badge = document.getElementById(`badge-${node.config.key}`);
      if (!badge) return;

      const vector = new THREE.Vector3();
      node.mesh.getWorldPosition(vector);
      vector.project(camera);

      const x = (vector.x * widthHalf) + widthHalf;
      const y = -(vector.y * heightHalf) + heightHalf;

      badge.style.left = `${x}px`;
      badge.style.top = `${y}px`;
    });
  }

  function setupEvents() {
    window.addEventListener('resize', onResize);

    window.addEventListener('pointermove', (e) => {
      const rect = container ? container.getBoundingClientRect() : null;
      if (!rect) return;
      mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    });

    // Pause when scrolled out of viewport
    if (typeof IntersectionObserver !== 'undefined' && container) {
      const observer = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
      }, { threshold: 0.1 });
      observer.observe(container);
    }

    // Pause when tab is inactive
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
    });
  }

  function onResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth || 560;
    const height = container.clientHeight || 520;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function showFallback() {
    const stage = document.querySelector('.hero-3d-stage');
    if (stage) {
      stage.innerHTML = `
        <div style="text-align:center; padding:2rem;">
          <div style="width:80px; height:80px; border-radius:50%; background:#eff6ff; color:#2563eb; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; font-size:2rem;">🛡️</div>
          <h3 style="color:#0f172a; font-weight:800; margin-bottom:0.5rem;">HealthPulse Intelligence Engine</h3>
          <p style="color:#64748b; font-size:0.9rem; max-width:320px; margin:0 auto;">Real-time continuous health surveillance & anomaly detection network.</p>
        </div>
      `;
    }
  }

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    if (!isRunning || !isVisible) return;

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Smooth Mouse Camera Parallax
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    camera.position.x = mouse.x * 1.2;
    camera.position.y = mouse.y * 1.0;
    camera.lookAt(0, 0, 0);

    // Rotate Core Components
    if (coreGroup) {
      innerSphere.rotation.y += 0.008;
      outerLattice.rotation.y -= 0.005;
      outerLattice.rotation.x += 0.003;
      ring1.rotation.z += 0.012;
      ring2.rotation.y += 0.009;
      ring3.rotation.x -= 0.007;
      if (ecgLine) ecgLine.rotation.z -= 0.01;
    }

    // Node Gentle Orbital Floating
    nodes.forEach((node, i) => {
      const floatOffset = Math.sin(elapsedTime * 1.5 + i) * 0.12;
      node.mesh.position.y = node.initialPos.y + floatOffset;
      node.halo.rotation.z += 0.015;
    });

    // Animate Flowing Data Particles
    dataParticles.forEach(p => {
      p.progress += p.speed;
      if (p.progress >= 1.0) {
        p.progress = 0;
      }
      const pt = p.curve.getPoint(p.progress);
      p.mesh.position.copy(pt);
    });

    // Update 2D Floating Badge HTML Coordinates
    updateHtmlBadgePositions();

    // Render Scene
    renderer.render(scene, camera);
  }

  return { init };
})();
