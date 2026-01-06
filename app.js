// SINGLE UNIFIED REVEAL SYSTEM
(function() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add('is-visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  // Select everything that needs to animate
  document.querySelectorAll('[data-animate], .card, .req-column').forEach(el => {
    el.classList.add('reveal-prepare'); // Add base styles via class instead of inline JS
    observer.observe(el);
  });
})();

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

(() => {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  const icon = document.getElementById("theme-icon");
  const mql = window.matchMedia("(prefers-color-scheme: dark)");

  if (!btn || !icon) return;

  const getSaved = () => localStorage.getItem("theme") || "system";
  const setSaved = (mode) => localStorage.setItem("theme", mode);

  function apply(mode){
    root.classList.remove("light", "dark");

    if (mode === "light") root.classList.add("light");
    if (mode === "dark")  root.classList.add("dark");

    const effectiveDark = mode === "dark" || (mode === "system" && mql.matches);

    icon.textContent = effectiveDark
      ? "☀️" 
      : (mode === "system" ? "🖥️" : "🌙");

    btn.setAttribute("title", `Theme: ${mode[0].toUpperCase()+mode.slice(1)} (click to change)`);
    btn.setAttribute("aria-label", `Toggle theme (current: ${mode})`);
  }

  mql.addEventListener?.("change", () => {
    if (getSaved() === "system") apply("system");
  });

  function next(mode){
    if (mode === "light") return "dark";
    if (mode === "dark")  return "system";
    return "light";
  }

  let mode = getSaved();
  apply(mode);

  btn.addEventListener("click", () => {
    mode = next(mode);
    setSaved(mode);
    apply(mode);
  });
})();


(function () {
  const CONSENT_KEY = 'remotepc_cookie_consent';

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


  function loadAnalytics() {
    if (window.__rp_analytics_loaded) return;
    window.__rp_analytics_loaded = true;

    const GA_ID = 'G-2FD0X1BBMS';


    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_ID, {
      anonymize_ip: true
    });
  }

  function initCookieBanner() {
  const banner = document.getElementById('cookie-banner');
  const consent = getConsent(); // Assumes your getConsent() helper exists

  // Function to show the banner with a smooth slide-in
  const showBanner = () => {
    if (!banner) return;
    // Delay the appearance so it doesn't interrupt the hero animation
    setTimeout(() => {
      banner.classList.add('visible');
    }, 1500); 
  };

  const hideBanner = () => {
    if (!banner) return;
    banner.classList.remove('visible');
    // Optional: remove from DOM after transition finishes
    setTimeout(() => { banner.style.display = 'none'; }, 600);
  };

  // Logic Check
  if (consent === 'all') {
    loadAnalytics();
  } else if (consent !== 'essential') {
    showBanner();
  }

  // Event Listeners
  const btnEssential = document.getElementById('cookie-essential');
  const btnAll = document.getElementById('cookie-all');

  if (btnEssential) {
    btnEssential.addEventListener('click', function () {
      setConsent('essential'); // Assumes your setConsent() helper exists
      hideBanner();
    });
  }

  if (btnAll) {
    btnAll.addEventListener('click', function () {
      setConsent('all');
      if (typeof loadAnalytics === 'function') loadAnalytics();
      hideBanner();
    });
  }
}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
  } else {
    initCookieBanner();
  }
})();

(function () {
  function initDownloadButtonEffects() {
    const buttons = document.querySelectorAll('.download-btn');
    const toast = document.getElementById('download-toast');
    if (!buttons.length) return;

    let toastTimeout = null;

    function showToast(message) {
      if (!toast) return;
      toast.textContent = message;

      toast.classList.add('visible');

      if (toastTimeout) {
        clearTimeout(toastTimeout);
      }

      toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
      }, 2200);
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', function (e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        btn.style.setProperty('--ripple-x', x + 'px');
        btn.style.setProperty('--ripple-y', y + 'px');

        btn.classList.remove('is-pressed');
        void btn.offsetWidth;
        btn.classList.add('is-pressed');

        const platform =
          btn.getAttribute('data-platform') ||
          btn.getAttribute('title') ||
          btn.textContent.trim() ||
          'download';

        showToast('Download started – ' + platform);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDownloadButtonEffects);
  } else {
    initDownloadButtonEffects();
  }
})();

// Enhanced Reveal Animation
const revealOnScroll = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Add a slight delay based on index for staggered effect
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, index * 100); 
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.card, .feature-item, .hero-content').forEach(el => {
    el.classList.add('reveal-init');
    observer.observe(el);
  });
};

(function initEnhancedGrid() {
  const gridContainer = document.getElementById('glow-grid');
  if (!gridContainer) return;

  function buildGrid() {
    gridContainer.innerHTML = ''; // Clear old cubes
    const cols = Math.ceil(document.documentElement.clientWidth / 40);
    const rows = Math.ceil(window.innerHeight / 40);
    const totalCubes = rows * cols;

    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < totalCubes; i++) {
      const cube = document.createElement('div');
      cube.classList.add('grid-cube');
      fragment.appendChild(cube);
    }
    gridContainer.appendChild(fragment);
  }

  buildGrid();
  
  // Re-build grid when window size changes
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildGrid, 250);
  });
})();

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
  });
});

window.addEventListener('scroll', () => {
  const container = document.querySelector('.steps-container');
  const fill = document.querySelector('.step-line-fill');
  
  if (container && fill) {
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate how much of the container is visible
    // 0 = just started, 1 = reached the bottom
    const progress = Math.max(0, Math.min(1, (windowHeight / 2 - rect.top) / rect.height));
    
    fill.style.height = `${progress * 100}%`;
  }
});

document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const faqItem = button.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    
    // Toggle active class
    const isActive = faqItem.classList.contains('active');
    
    // Close all other items (Optional: remove this if you want multiple open)
    document.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('active');
      item.querySelector('.faq-answer').style.maxHeight = null;
    });

    if (!isActive) {
      faqItem.classList.add('active');
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

const newsCard = document.querySelector('.news-card');
if (newsCard) {
  newsCard.addEventListener('mousemove', (e) => {
    const rect = newsCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (max 2 degrees for subtlety)
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = x - xc;
    const dy = y - yc;
    
    newsCard.style.transform = `perspective(1000px) rotateX(${-dy/40}deg) rotateY(${dx/40}deg) translateY(-5px)`;
  });

  newsCard.addEventListener('mouseleave', () => {
    newsCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
  });
}

// Add this to your existing revealOnScroll or app.js logic
const initRequirementStagger = () => {
  const columns = document.querySelectorAll('.req-column');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        columns.forEach((col, index) => {
          setTimeout(() => {
            col.style.opacity = "1";
            col.style.transform = "translateY(0)";
          }, index * 150); // 150ms delay between each column
        });
      }
    });
  }, { threshold: 0.2 });

  const container = document.querySelector('.requirements-dashboard');
  if (container) {
    columns.forEach(c => {
      c.style.opacity = "0";
      c.style.transform = "translateY(20px)";
      c.style.transition = "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
    });
    observer.observe(container);
  }
};

document.addEventListener('DOMContentLoaded', initRequirementStagger);

(function initSecurityScan() {
  const card = document.querySelector('.security-card');
  if (!card) return;

  const scanLine = document.createElement('div');
  scanLine.className = 'scan-line';
  card.appendChild(scanLine);
})();

const initSupportTerminal = () => {
  const title = document.querySelector('.terminal-title');
  if (!title) return;

  const text = title.textContent;
  title.textContent = '';
  let i = 0;

  const type = () => {
    if (i < text.length) {
      title.textContent += text.charAt(i);
      i++;
      setTimeout(type, 100);
    }
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      type();
      observer.disconnect();
    }
  });

  observer.observe(title);
};

document.addEventListener('DOMContentLoaded', initSupportTerminal);

(() => {
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = nav.classList.contains('open');
    
    // Toggle classes
    nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', !isOpen);
    
    // Prevent scrolling when menu is open
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  // Close menu when clicking a link (especially important for anchor links)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      document.body.style.overflow = '';
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();

document.addEventListener('mousemove', (e) => {
  const visual = document.querySelector('.screen-wrapper');
  if (!visual) return;
  
  const moveX = (e.clientX - window.innerWidth / 2) / 50;
  const moveY = (e.clientY - window.innerHeight / 2) / 50;
  
  visual.style.transform = `rotateY(${moveX}deg) rotateX(${-moveY}deg)`;
});

// Active Link Observer for Legal Page
const initLegalTOC = () => {
  const links = document.querySelectorAll('.toc-list a');
  const sections = document.querySelectorAll('.legal-content .card');
  
  const observerOptions = {
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
};

if (document.querySelector('.legal-toc')) {
  document.addEventListener('DOMContentLoaded', initLegalTOC);
}

function simulateSystemStats() {
    // 1. CPU Logic (Fluctuates like a real PC)
    const cpuFill = document.getElementById('cpu-fill');
    const cpuText = document.getElementById('cpu-text');
    if(cpuFill) {
        const val = Math.floor(Math.random() * 40) + 10; // 10-50%
        cpuFill.style.width = val + "%";
        cpuText.innerText = val + "%";
        // Visual warning if "CPU" gets high
        if(val > 45) cpuFill.classList.add('high-usage');
        else cpuFill.classList.remove('high-usage');
    }

    // 2. Memory Logic (Very steady)
    const memFill = document.getElementById('mem-fill');
    const memText = document.getElementById('mem-text');
    if(memFill) {
        const val = (Math.random() * 0.2 + 4.2).toFixed(1);
        memFill.style.width = (val / 16 * 100) + 30 + "%"; // Mock percentage
        memText.innerText = val + " GB";
    }

    // 3. Battery Logic (Slow drain)
    const batFill = document.getElementById('bat-fill');
    const batText = document.getElementById('bat-text');
    if(batFill) {
        let currentBat = parseInt(batText.innerText);
        if (currentBat <= 5) currentBat = 100; // Reset for demo
        else currentBat -= 1;
        batFill.style.width = currentBat + "%";
        batText.innerText = currentBat + "%";
    }
}

// Update the massive monitor every 2 seconds
setInterval(simulateSystemStats, 2000);

const grid = document.getElementById('glow-grid');

if (grid) {
  window.addEventListener('mousemove', (e) => {
    // 1. Get mouse position relative to the section, not the whole window
    const rect = grid.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to percentage for the CSS mask
    const xPrc = (x / rect.width) * 100;
    const yPrc = (y / rect.height) * 100;

    // 2. Dynamic Color Logic
    // We vary the Hue (0-360) based on X position for a rainbow-neon effect
    // 180 is Cyan, 300 is Purple/Magenta
    const hue = 180 + (xPrc * 1.2); 
    
    // 3. Update CSS Variables
    // We use HSL because it's easier to keep the "vibe" consistent
    grid.style.setProperty('--grid-color-dynamic', `hsl(${hue}, 80%, 70%)`);
    grid.style.setProperty('--mouse-x', `${xPrc}%`);
    grid.style.setProperty('--mouse-y', `${yPrc}%`);
  });
}