/**
 * HealthPulse — Public / End-User Health Portal
 * File: js/public/prevention.js
 * Description: Controller for Prevention & Precautions — Disease tabs, symptoms checklist, Do/Don't cards & guidance.
 */

window.HealthPulsePrevention = (() => {
  const PREVENTION_DATA = {
    dengue: {
      name: "Dengue Fever",
      icon: "🦟",
      about: "Dengue is a mosquito-borne viral infection transmitted by Aedes mosquitoes. Prevention relies primarily on eliminating vector breeding environments.",
      spread: "Transmitted through bites of infected female Aedes mosquitoes (primarily Aedes aegypti) that bite mainly during early morning and late afternoon.",
      symptoms: ["High fever (104°F / 40°C)", "Severe headache & retro-orbital pain", "Joint and muscle aches ('breakbone fever')", "Mild skin rash & fatigue"],
      steps: [
        { title: "01. Remove Standing Water", desc: "Empty, scrub, cover, or throw out any items that hold water weekly (vases, buckets, tires)." },
        { title: "02. Keep Water Containers Sealed", desc: "Ensure domestic water storage tanks and barrels have tight-fitting lids or screens." },
        { title: "03. Use Mosquito Defense", desc: "Apply EPA-registered insect repellent containing DEET or Picaridin and wear light-colored long clothing." },
        { title: "04. Secure Windows & Doors", desc: "Install intact window screens and use air conditioning or mosquito netting while sleeping." }
      ],
      dos: [
        "Empty water containers at least once a week",
        "Apply mosquito repellent before going outdoors",
        "Wear long-sleeved shirts and long pants",
        "Seek medical evaluation if fever persists past 48 hours"
      ],
      donts: [
        "Don't leave water collecting in flower pots or trash",
        "Don't ignore severe abdominal pain or bleeding gums",
        "Don't take aspirin or ibuprofen for fever without medical advice (use paracetamol/acetaminophen if advised)"
      ],
      seekCare: "Seek emergency care immediately if experiencing persistent vomiting, severe belly pain, mucosal bleeding, or extreme exhaustion."
    },

    influenza: {
      name: "Seasonal Influenza",
      icon: "🤧",
      about: "Influenza is a contagious respiratory illness caused by influenza viruses. Annual vaccination and respiratory hygiene are key protection measures.",
      spread: "Spreads primarily via respiratory droplets when infected individuals cough, sneeze, or speak within close proximity (approx 6 feet).",
      symptoms: ["Fever or feeling feverish", "Cough & sore throat", "Runny or stuffy nose", "Body aches & headache", "Fatigue & exhaustion"],
      steps: [
        { title: "01. Annual Flu Vaccine", desc: "Get an annual flu vaccine to reduce risk of severe disease and hospitalization." },
        { title: "02. Practice Hand Hygiene", desc: "Wash hands frequently with soap and water for at least 20 seconds, or use alcohol sanitizer." },
        { title: "03. Cover Coughs & Sneezes", desc: "Use a tissue or your elbow when coughing or sneezing, and dispose of tissues immediately." },
        { title: "04. Stay Home When Unwell", desc: "Isolate at home when symptomatic to protect family, colleagues, and schoolmates." }
      ],
      dos: [
        "Get your seasonal flu vaccination early",
        "Clean and disinfect frequently touched surfaces",
        "Stay hydrated and rest adequately if sick",
        "Consult healthcare providers if at high risk of complications"
      ],
      donts: [
        "Don't attend school or work with active fever",
        "Don't touch your eyes, nose, or mouth with unwashed hands",
        "Don't demand antibiotics for viral influenza infections"
      ],
      seekCare: "Seek emergency care for difficulty breathing, shortness of breath, persistent chest pain, confusion, or severe muscle pain."
    },

    covid19: {
      name: "COVID-19",
      icon: "🦠",
      about: "COVID-19 is a respiratory disease caused by SARS-CoV-2. Combining vaccination, ventilation, and hygiene minimizes exposure risk.",
      spread: "Spreads mainly through airborne respiratory droplets and smaller aerosols produced during speaking, coughing, or singing.",
      symptoms: ["Fever or chills", "Dry cough & loss of taste or smell", "Shortness of breath", "Fatigue & sore throat"],
      steps: [
        { title: "01. Stay Current on Vaccines", desc: "Ensure updated booster vaccines are received according to public health guidelines." },
        { title: "02. Ensure Fresh Air Ventilation", desc: "Improve indoor ventilation by opening windows, using exhaust fans, or running HEPA air purifiers." },
        { title: "03. Mask in High-Risk Settings", desc: "Wear well-fitting N95/KN95 masks in crowded or poorly ventilated indoor spaces during local surges." },
        { title: "04. Self-Test & Isolate", desc: "Use rapid antigen tests if symptoms develop and isolate to prevent household transmission." }
      ],
      dos: [
        "Keep indoor spaces well ventilated",
        "Wear masks if around vulnerable individuals",
        "Test promptly if respiratory symptoms begin",
        "Follow isolation guidance until fever-free for 24 hours"
      ],
      donts: [
        "Don't ignore mild respiratory symptoms as 'just allergies'",
        "Don't visit elderly or immunocompromised relatives while sick",
        "Don't share personal utensils or uncleaned surfaces when ill"
      ],
      seekCare: "Seek emergency care for persistent chest tightness, bluish skin/lips, sudden confusion, or severe breathing distress."
    },

    cholera: {
      name: "Cholera",
      icon: "💧",
      about: "Cholera is an acute diarrheal infection caused by ingestion of contaminated water or food. Safe water and sanitation prevent outbreaks.",
      spread: "Transmitted via the fecal-oral route through contaminated drinking water, unwashed produce, or undercooked seafood.",
      symptoms: ["Sudden profuse watery diarrhea", "Vomiting", "Rapid dehydration", "Muscle cramps & thirst"],
      steps: [
        { title: "01. Drink Safe Water Only", desc: "Boil water for 1 full minute or use bottled/chlorinated water for drinking and tooth brushing." },
        { title: "02. Eat Hot, Cooked Food", desc: "Eat food that is thoroughly cooked and served hot; avoid raw or uncooked seafood." },
        { title: "03. Wash Fruits & Vegetables", desc: "Peel fruits and wash produce thoroughly with clean, disinfected water." },
        { title: "04. Strict Hand Sanitation", desc: "Wash hands with safe water and soap after using the toilet and before preparing food." }
      ],
      dos: [
        "Drink boiled or certified bottled water",
        "Wash hands thoroughly before eating or preparing meals",
        "Use oral rehydration salts (ORS) immediately if diarrhea begins",
        "Seek immediate health clinic care for severe fluid loss"
      ],
      donts: [
        "Don't drink untreated tap or surface water in alert zones",
        "Don't eat raw or undercooked shellfish and street food",
        "Don't delay seeking rehydration treatment for watery diarrhea"
      ],
      seekCare: "Immediate emergency medical evaluation is required at the first sign of severe watery diarrhea to prevent rapid dehydration."
    }
  };

  function init() {
    console.log('[HealthPulse Prevention] Initializing Prevention & Precautions Controller...');

    // 1. Check URL parameters for pre-selected disease (e.g., ?disease=Dengue)
    const urlParams = new URLSearchParams(window.location.search);
    const paramDisease = (urlParams.get('disease') || '').toLowerCase();
    const activeKey = Object.keys(PREVENTION_DATA).find(k => k === paramDisease || PREVENTION_DATA[k].name.toLowerCase().includes(paramDisease)) || 'dengue';

    // 2. Setup Tabs
    setupTabs(activeKey);

    // 3. Render content for active key
    renderPreventionContent(activeKey);
  }

  function setupTabs(defaultKey) {
    const tabs = document.querySelectorAll('.prevention-tab-btn');
    tabs.forEach(tab => {
      const key = tab.getAttribute('data-key');
      if (key === defaultKey) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }

      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderPreventionContent(key);
      });
    });
  }

  function renderPreventionContent(key) {
    const data = PREVENTION_DATA[key] || PREVENTION_DATA.dengue;

    // About & Spread
    const titleEl = document.getElementById('prev-disease-title');
    const aboutEl = document.getElementById('prev-disease-about');
    const spreadEl = document.getElementById('prev-disease-spread');
    const seekEl = document.getElementById('prev-disease-seek');

    if (titleEl) titleEl.innerHTML = `<span style="font-size:1.75rem; margin-right:0.5rem;">${data.icon}</span> ${data.name} Prevention Guidelines`;
    if (aboutEl) aboutEl.innerText = data.about;
    if (spreadEl) spreadEl.innerText = data.spread;
    if (seekEl) seekEl.innerText = data.seekCare;

    // Symptoms List
    const symptomsContainer = document.getElementById('prev-symptoms-list');
    if (symptomsContainer) {
      symptomsContainer.innerHTML = data.symptoms.map(s => `
        <div style="background:#ffffff; padding:0.85rem 1rem; border:1px solid var(--border-light); border-radius:var(--radius-md); display:flex; align-items:center; gap:0.6rem;">
          <i data-lucide="check-circle-2" style="color:var(--brand-blue); width:18px; height:18px; flex-shrink:0;"></i>
          <span style="font-size:0.925rem; font-weight:600; color:var(--text-heading);">${s}</span>
        </div>
      `).join('');
    }

    // Prevention Steps
    const stepsContainer = document.getElementById('prev-steps-grid');
    if (stepsContainer) {
      stepsContainer.innerHTML = data.steps.map((st, idx) => `
        <div class="prevention-step-card">
          <div class="step-number-badge">${(idx + 1).toString().padStart(2, '0')}</div>
          <h3>${st.title}</h3>
          <p>${st.desc}</p>
        </div>
      `).join('');
    }

    // Do / Don't Column lists
    const dosContainer = document.getElementById('prev-dos-list');
    const dontsContainer = document.getElementById('prev-donts-list');

    if (dosContainer) {
      dosContainer.innerHTML = data.dos.map(d => `
        <li class="dodont-item">
          <i data-lucide="check" style="width:18px; height:18px;"></i>
          <span>${d}</span>
        </li>
      `).join('');
    }

    if (dontsContainer) {
      dontsContainer.innerHTML = data.donts.map(d => `
        <li class="dodont-item">
          <i data-lucide="x" style="width:18px; height:18px;"></i>
          <span>${d}</span>
        </li>
      `).join('');
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  return { init };
})();

window.CodeAstraPrevention = window.HealthPulsePrevention;

document.addEventListener('DOMContentLoaded', () => {
  (window.HealthPulsePrevention || window.CodeAstraPrevention).init();
});
