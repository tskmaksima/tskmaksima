const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

document.documentElement.classList.add('js');

function initNavigation() {
  const page = location.pathname.split('/').pop() || 'index.html';
  $$('.site-nav a, .mobile-menu a').forEach((link) => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
}

function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (!toggle || !menu) return;
  const close = () => {
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  $$('a', menu).forEach((link) => link.addEventListener('click', close));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
}

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('compact', window.scrollY > 40);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initScrollReveal() {
  const items = $$('.reveal, .image-reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  }), { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
  items.forEach((item) => observer.observe(item));
}

function initCounters() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const target = Number(element.dataset.count);
    const start = performance.now();
    const duration = 1000;
    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      element.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 3))) + (element.dataset.plus || '');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    observer.unobserve(element);
  }), { threshold: 0.35 });
  $$('[data-count]').forEach((element) => observer.observe(element));
}

function initAnniversaryCounter() {
  const output = document.querySelector('[data-anniversary]');
  if (!output) return;
  const founded = new Date('2017-09-01T00:00:00');
  const now = new Date();
  let years = now.getFullYear() - founded.getFullYear();
  let months = now.getMonth() - founded.getMonth();
  let days = now.getDate() - founded.getDate();
  if (days < 0) { months -= 1; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (months < 0) { years -= 1; months += 12; }
  output.textContent = `${years} лет · ${months} мес. · ${days} дн.`;
}

function initGallery() {}

function initLightbox() {
  const items = $$('.gallery button');
  const lightbox = document.querySelector('.lightbox');
  if (!items.length || !lightbox) return;
  const image = lightbox.querySelector('img');
  const closeButton = lightbox.querySelector('.close');
  let index = 0;
  const close = () => { lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true'); };
  const show = (nextIndex) => {
    index = (nextIndex + items.length) % items.length;
    image.src = items[index].querySelector('img').src;
    image.alt = items[index].querySelector('img').alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
  };
  items.forEach((item, itemIndex) => item.addEventListener('click', () => show(itemIndex)));
  closeButton?.addEventListener('click', close);
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
  lightbox.querySelector('.prev')?.addEventListener('click', () => show(index - 1));
  lightbox.querySelector('.next')?.addEventListener('click', () => show(index + 1));
  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowRight') show(index + 1);
    if (event.key === 'ArrowLeft') show(index - 1);
  });
}

function initPageTransitions() {
  $$('a[href$=".html"]').forEach((link) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || link.target) return;
    event.preventDefault();
    document.body.classList.add('is-leaving');
    window.setTimeout(() => { location.href = link.href; }, 440);
  }));
}

function initImageFallbacks() {
  $$('img').forEach((image) => image.addEventListener('error', () => {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.style.display = 'grid';
    image.parentElement.replaceWith(placeholder);
    console.warn('Image failed:', image.src);
  }, { once: true }));
}

function initInteractiveStories() {
  $$('.story').forEach((story) => story.addEventListener('click', () => {
    $$('.story').forEach((item) => item.classList.remove('active'));
    story.classList.add('active');
  }));
}

function initParallax() {
  const images = $$('[data-parallax]');
  if (!images.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  window.addEventListener('scroll', () => images.forEach((image) => {
    image.style.transform = `translateY(${(innerHeight - image.getBoundingClientRect().top) * 0.025}px)`;
  }), { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation(); initMobileMenu(); initHeaderScroll(); initScrollReveal(); initCounters();
  initAnniversaryCounter(); initGallery(); initLightbox(); initPageTransitions();
  initImageFallbacks(); initInteractiveStories(); initParallax();
});
