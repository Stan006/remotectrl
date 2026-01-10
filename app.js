/* ==========================================================
   GLOBAL CONSTANTS & APP NAMESPACE
========================================================== */
const App = (() => {
  const CONFIG = {
    REVEAL_THRESHOLD: 0.15,
    REVEAL_STAGGER: 100,
    GRID_CELL_SIZE: 40,
    TOAST_DURATION: 2200,
    COOKIE_KEY: 'remotepc_cookie_consent',
    GA_ID: 'G-2FD0X1BBMS'
  };

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     UTIL
  ========================================================== */
  function debounce(fn, delay) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  function safeLocalStorageGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function safeLocalStorageSet(key, value) {
    try { localStorage.setItem(key, value); } catch {}
  }

  /* ==========================================================
     REVEAL ON SCROLL (SINGLE OBSERVER, STABLE STAGGER)
  ========================================================== */
  function initRevealObserver() {
  if (prefersReducedMotion) return;

  const elements = document.querySelectorAll('[data-animate], .card, .feature-item, .req-column');
  if (!elements.length) return;

  const revealNow = (el) => {
    el.classList.add('is-visible');
    el.classList.remove('reveal-init');
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      revealNow(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.50,
    rootMargin: '0px 0px -10% 0px'
  });

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();

    // 🔑 IF ALREADY ON SCREEN → SHOW IMMEDIATELY
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      revealNow(el);
    } else {
      el.classList.add('reveal-init');
      observer.observe(el);
    }
  });
}


  /* ==========================================================
     NAV TOGGLE
  ========================================================== */
  function initNav() {
    const btn = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-nav');
    if (!btn || !nav) return;

    const setState = (open) => {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(!!open));
      document.body.classList.toggle('nav-open', open);
      // prevent background scroll when nav open (mobile)
      document.body.style.overflow = open ? 'hidden' : '';
    };

    btn.addEventListener('click', () => setState(!nav.classList.contains('open')));

    // close when any link inside nav is clicked (event delegation)
    nav.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a');
      if (a) setState(false);
    });
  }

  /* ==========================================================
     COOKIE CONSENT + ANALYTICS
  ========================================================== */
  function initCookieConsent() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;

    const loadAnalytics = () => {
      if (window.__analyticsLoaded) return;
      window.__analyticsLoaded = true;

      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_ID}`;
      document.head.appendChild(s);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', CONFIG.GA_ID, { anonymize_ip: true });
    };

    const consent = safeLocalStorageGet(CONFIG.COOKIE_KEY);
    if (consent === 'all') loadAnalytics();
    if (!consent) setTimeout(() => banner.classList.add('visible'), 1500);

    // event delegation on banner for buttons
    banner.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('button, a');
      if (!btn) return;
      if (btn.id === 'cookie-essential') {
        safeLocalStorageSet(CONFIG.COOKIE_KEY, 'essential');
        banner.classList.remove('visible');
      } else if (btn.id === 'cookie-all') {
        safeLocalStorageSet(CONFIG.COOKIE_KEY, 'all');
        loadAnalytics();
        banner.classList.remove('visible');
      }
    });
  }

  /* ==========================================================
     DOWNLOAD BUTTON EFFECTS (DELEGATED)
  ========================================================== */
  function initDownloadButtons() {
    const container = document.body; // delegation root
    const toast = document.getElementById('download-toast');
    if (!toast) return;

    let timeout;
    const showToast = (text) => {
      toast.textContent = text;
      toast.classList.add('visible');
      clearTimeout(timeout);
      timeout = setTimeout(() => toast.classList.remove('visible'), CONFIG.TOAST_DURATION);
    };

    // delegate clicks to .download-btn
    container.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('.download-btn');
      if (!btn) return;

      // ripple position (works when button is positioned)
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      btn.style.setProperty('--ripple-x', `${x}px`);
      btn.style.setProperty('--ripple-y', `${y}px`);

      // press animation restart
      btn.classList.remove('is-pressed');
      // force reflow
      // eslint-disable-next-line no-unused-expressions
      btn.offsetWidth;
      btn.classList.add('is-pressed');

      showToast(`Download started – ${btn.dataset.platform || btn.textContent.trim()}`);
    });
  }

  /* ==========================================================
     GLOW GRID (build + resize)
  ========================================================== */
  function initGlowGrid() {
    const grid = document.getElementById('glow-grid');
    if (!grid) return;

    const buildGrid = () => {
      // avoid layout thrash by measuring only once and using local vars
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cols = Math.ceil(w / CONFIG.GRID_CELL_SIZE);
      const rows = Math.ceil(h / CONFIG.GRID_CELL_SIZE);
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

      const total = cols * rows;
      // reuse fragment for better perf
      const frag = document.createDocumentFragment();
      for (let i = 0; i < total; i++) {
        const div = document.createElement('div');
        div.className = 'grid-cube';
        frag.appendChild(div);
      }
      grid.innerHTML = '';
      grid.appendChild(frag);
    };

    buildGrid();
    window.addEventListener('resize', debounce(() => requestAnimationFrame(buildGrid), 250));
  }

  /* ==========================================================
     CARD HOVER EFFECTS (pointer + rAF)
  ========================================================== */
  function initCardsHover() {
    const cards = document.querySelectorAll('.card');
    if (!cards.length) return;

    cards.forEach(card => {
      let raf = null;
      const onPointerMove = (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--x', `${e.clientX - r.left}px`);
          card.style.setProperty('--y', `${e.clientY - r.top}px`);
          raf = null;
        });
      };
      card.addEventListener('pointermove', onPointerMove);
    });
  }

  /* ==========================================================
     FAQ ACCORDION (single-open)
  ========================================================== */
  function initFAQ() {
    const root = document.body;
    root.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('.faq-question');
      if (!btn) return;

      // close all first
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-answer')?.style.removeProperty('max-height');
      });

      const item = btn.closest('.faq-item');
      const answer = item?.querySelector('.faq-answer');
      if (!item || !answer) return;

      item.classList.add('active');
      // trigger reflow for CSS transitions to calculate height
      answer.style.maxHeight = answer.scrollHeight + 'px';
    });
  }

  /* ==========================================================
     REQUIREMENT STAGGER
  ========================================================== */
  function initRequirementStagger() {
    if (prefersReducedMotion) return;

    const cols = document.querySelectorAll('.req-column');
    const container = document.querySelector('.requirements-dashboard');
    if (!cols.length || !container) return;

    cols.forEach(c => {
      c.style.opacity = 0;
      c.style.transform = 'translateY(20px)';
    });

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0] || !entries[0].isIntersecting) return;
      cols.forEach((c, i) => {
        setTimeout(() => {
          c.style.opacity = 1;
          c.style.transform = 'translateY(0)';
        }, i * 150);
      });
      observer.disconnect();
    }, { threshold: 0.2 });

    observer.observe(container);
  }

  /* ==========================================================
     SECURITY SCAN
  ========================================================== */
  function initSecurityScan() {
    const card = document.querySelector('.security-card');
    if (card && !card.querySelector('.scan-line')) {
      const div = document.createElement('div');
      div.className = 'scan-line';
      card.appendChild(div);
    }
  }

  /* ==========================================================
     TERMINAL TYPE EFFECT (fixed observer usage)
  ========================================================== */
  function initSupportTerminal() {
    const title = document.querySelector('.terminal-title');
    if (!title) return;
    if (prefersReducedMotion) { /* reveal text immediately */ return; }

    const text = title.textContent;
    title.textContent = '';
    let i = 0;

    const type = () => {
      if (i < text.length) {
        title.textContent += text[i++];
        setTimeout(type, 100);
      }
    };

    const io = new IntersectionObserver((entries, obs) => {
      const e = entries[0];
      if (e && e.isIntersecting) {
        type();
        obs.unobserve(title);
      }
    }, { threshold: 0.5 });

    io.observe(title);
  }

  /* ==========================================================
     LEGAL TOC (highlight currently visible section)
  ========================================================== */
  function initLegalTOC() {
    const toc = document.querySelector('.legal-toc');
    if (!toc) return;
    const links = toc.querySelectorAll('a');
    const sections = document.querySelectorAll('.legal-content .card');
    if (!sections.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`);
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  /* ==========================================================
     SYSTEM STATS SIMULATION
  ========================================================== */
  function initSystemStats() {
    const cpu = document.getElementById('cpu-fill');
    const cpuText = document.getElementById('cpu-text');
    if (!cpu || !cpuText) return;

    setInterval(() => {
      const v = Math.floor(Math.random() * 40) + 10;
      cpu.style.width = v + '%';
      cpuText.textContent = v + '%';
      cpu.classList.toggle('high-usage', v > 45);
    }, 2000);
  }

  /* ==========================================================
     THROTTLED MOUSE EFFECTS (single rAF loop)
  ========================================================== */
  function initMouseEffects() {
    const screen = document.querySelector('.screen-wrapper');
    const grid = document.getElementById('glow-grid');

    let ticking = false;
    window.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (screen) {
          screen.style.transform =
            `rotateY(${(e.clientX - window.innerWidth / 2) / 50}deg)
             rotateX(${-(e.clientY - window.innerHeight / 2) / 50}deg)`;
        }

        if (grid) {
          const r = grid.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          grid.style.setProperty('--mouse-x', `${x}%`);
          grid.style.setProperty('--grid-color-dynamic', `hsl(${180 + x},80%,70%)`);
        }

        ticking = false;
      });
    }, { passive: true });
  }

  /* ==========================================================
     ENTRY (init everything)
  ========================================================== */
  function init() {
    initRevealObserver();
    initNav();
    initCookieConsent();
    initDownloadButtons();
    initGlowGrid();
    initCardsHover();
    initFAQ();
    initRequirementStagger();
    initSecurityScan();
    initSupportTerminal();
    initLegalTOC();
    initSystemStats();
    initMouseEffects();
    // keep this last in case it depends on layout
    const mega = document.getElementById('mega-grid');
    if (mega) {
      // if you have a separate initMegaGrid implementation keep it; otherwise reuse glow-grid
      // initMegaGrid(); // uncomment if you have a function elsewhere
    }
  }

  return { init };
})();

/* ==========================================================
   BOOT
========================================================== */
document.addEventListener('DOMContentLoaded', App.init);
