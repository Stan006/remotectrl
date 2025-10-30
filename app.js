
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
