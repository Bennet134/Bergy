/* ═══════════════════════════════════════════════════════════════
   BERGHOFF GMBH – MAIN SCRIPT
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── Language detection ──────────────────────────────────────── */
  const SUPPORTED  = ['de', 'en'];
  const STORAGE_KEY = 'berghoff_lang';

  function detectLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
    const browser = (navigator.language || 'en').split('-')[0].toLowerCase();
    return SUPPORTED.includes(browser) ? browser : 'en';
  }

  let currentLang = detectLang();

  /* ─── Apply translations ──────────────────────────────────────── */
  function applyTranslations(lang) {
    const t = window.TRANSLATIONS[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] === undefined) return;
      const val = t[key];
      if (/[<\n]/.test(val)) {
        el.innerHTML = val.replace(/\n/g, '<br>');
      } else {
        el.textContent = val;
      }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (t[key] !== undefined) el.placeholder = t[key];
    });

    document.querySelectorAll('[data-i18n-list]').forEach(ul => {
      const key  = ul.getAttribute('data-i18n-list');
      const items = t[key];
      if (!Array.isArray(items)) return;
      ul.innerHTML = items.map(item => `<li>${item}</li>`).join('');
    });

    document.querySelectorAll('[data-i18n-tags]').forEach(container => {
      const key  = container.getAttribute('data-i18n-tags');
      const tags = t[key];
      if (!Array.isArray(tags)) return;
      const cls = container.classList.contains('ind-tags') ? ' class="ind-tag"' : '';
      container.innerHTML = tags.map(tag => `<span${cls}>${tag}</span>`).join('');
    });

    document.querySelectorAll('select option[data-i18n]').forEach(opt => {
      const key = opt.getAttribute('data-i18n');
      if (t[key] !== undefined) opt.textContent = t[key];
    });

    // Also update table headers that use data-i18n
    document.querySelectorAll('th[data-i18n]').forEach(th => {
      const key = th.getAttribute('data-i18n');
      if (t[key] !== undefined) th.textContent = t[key];
    });

    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations(lang);
  }

  /* ─── Language switcher ───────────────────────────────────────── */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  /* ─── Header scroll behaviour ─────────────────────────────────── */
  const header = document.getElementById('site-header');

  // Subpages start with .scrolled already on the element;
  // only add scroll-detection on homepage (where hero exists)
  const hasHero = document.querySelector('.hero');

  function onScroll() {
    if (!hasHero) return;  // subpages stay scrolled
    header.classList.toggle('scrolled', window.scrollY > 40);
  }

  if (hasHero) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── Mobile navigation ───────────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mainNav   = document.getElementById('main-nav');

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', e => {
      if (!mainNav.contains(e.target) && !hamburger.contains(e.target)) {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  }

  /* ─── Contact form (homepage) ─────────────────────────────────── */
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');

  if (form && success) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        field.classList.remove('field-error');
        field.closest('.form-group') && field.closest('.form-group').classList.remove('field-error');
        if (field.type === 'checkbox' && !field.checked) {
          valid = false;
          field.closest('.form-group').classList.add('field-error');
        } else if (field.type !== 'checkbox' && !field.value.trim()) {
          valid = false;
          field.classList.add('field-error');
        }
      });

      if (!valid) return;

      const btn = form.querySelector('[type="submit"]');
      const origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = currentLang === 'de' ? 'Wird gesendet …' : 'Sending …';

      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = origText;
        success.hidden = false;
        form.reset();
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 900);
    });

    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('input', () => {
        field.classList.remove('field-error');
        field.closest && field.closest('.form-group') &&
          field.closest('.form-group').classList.remove('field-error');
      });
    });
  }

  /* ─── Active nav section highlight (homepage) ─────────────────── */
  if (hasHero) {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('nav-active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  /* ─── Scroll-reveal animations ────────────────────────────────── */
  const revealEls = document.querySelectorAll(
    '.cap-card, .ind-card, .why-card, .process-step, .qual-cert,' +
    '.career-tile, .stat, .teaser-card, .unt-pillar, .job-card,' +
    '.ausb-card, .benefit-item, .qltc-card, .cert-req-card, .doc-card,' +
    '.measure-card, .mach-fact'
  );

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${(i % 4) * 55}ms`;
      revealObs.observe(el);
    });
  }

  /* ─── Init ────────────────────────────────────────────────────── */
  applyTranslations(currentLang);

})();
