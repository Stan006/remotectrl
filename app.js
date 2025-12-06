
// RemotePC site JS
// - Mobile nav toggle
// - Intersection animations
// - Simple carousel buttons

(function(){
  // Fade-in on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.style.transform = 'translateY(0)';
        e.target.style.opacity = '1';
        observer.unobserve(e.target);
      }
    })
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-animate]').forEach(el => {
    el.style.transform = 'translateY(12px)';
    el.style.opacity = '0';
    el.style.transition = 'transform .5s ease, opacity .5s ease';
    observer.observe(el);
  });

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // Simple carousel arrows if present
  document.querySelectorAll('.carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const prev = carousel.querySelector('.prev');
    const next = carousel.querySelector('.next');
    if(!track || !prev || !next) return;
    const step = 380;
    prev.addEventListener('click', ()=> track.scrollBy({left:-step, behavior:'smooth'}));
    next.addEventListener('click', ()=> track.scrollBy({left: step, behavior:'smooth'}));
  });
})();

// Mobile nav toggle
(() => {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
    document.body.classList.toggle('nav-open', !open);
  });
})();

// ===== Theme toggle: light <-> dark <-> system =====
(() => {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  const icon = document.getElementById("theme-icon");
  const mql = window.matchMedia("(prefers-color-scheme: dark)");

  const getSaved = () => localStorage.getItem("theme") || "system";
  const setSaved = (mode) => localStorage.setItem("theme", mode);

  function apply(mode){
    root.classList.remove("light", "dark");
    if(mode === "light") root.classList.add("light");
    if(mode === "dark")  root.classList.add("dark");

    // effective state for icon
    const effectiveDark = mode === "dark" || (mode === "system" && mql.matches);
    icon.textContent = effectiveDark ? "☀️" : (mode === "system" ? "🖥️" : "🌙");
    btn.setAttribute("title", `Theme: ${mode[0].toUpperCase()+mode.slice(1)} (click to change)`);
    btn.setAttribute("aria-label", `Toggle theme (current: ${mode})`);
  }

  // React to system changes when in system mode
  mql.addEventListener?.("change", () => {
    if(getSaved() === "system") apply("system");
  });

  // Cycle modes: light -> dark -> system -> light ...
  function next(mode){
    if(mode === "light") return "dark";
    if(mode === "dark")  return "system";
    return "light"; // system -> light
  }

  // Init + hook
  let mode = getSaved();      // 'light' | 'dark' | 'system'
  apply(mode);
  btn.addEventListener("click", () => {
    mode = next(mode);
    setSaved(mode);
    apply(mode);
  });
})();

(function () {
  const CONSENT_KEY = 'remotepc_cookie_consent'; // 'all' | 'essential'

  function getConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (e) {
      // storage blocked, whatever
    }
  }

  function showBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.classList.add('visible');
    }
  }

  function hideBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.classList.remove('visible');
    }
  }

  // Load Google Analytics only if allowed
  function loadAnalytics() {
    if (window.__rp_analytics_loaded) return;
    window.__rp_analytics_loaded = true;

    // put your GA4 ID here:
    const GA_ID = 'G-2FD0X1BBMS'; // <--- replace with your actual ID

    // base script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);

    // gtag init
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_ID, {
      anonymize_ip: true
    });
  }

  function initCookieBanner() {
    const consent = getConsent();

    if (consent === 'all') {
      loadAnalytics();
      // banner stays hidden
    } else if (consent === 'essential') {
      // no analytics
    } else {
      // no choice yet
      showBanner();
    }

    const btnEssential = document.getElementById('cookie-essential');
    const btnAll = document.getElementById('cookie-all');

    if (btnEssential) {
      btnEssential.addEventListener('click', function () {
        setConsent('essential');
        hideBanner();
        // ensure analytics is NOT loaded
      });
    }

    if (btnAll) {
      btnAll.addEventListener('click', function () {
        setConsent('all');
        loadAnalytics();
        hideBanner();
      });
    }
  }

  // Init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
  } else {
    initCookieBanner();
  }
})();
