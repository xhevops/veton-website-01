/**
 * Helvetic Dynamics AG – Main JavaScript v2
 * i18n, navigation, language switcher, scroll effects, form, animations, parallax.
 */

document.addEventListener('DOMContentLoaded', async () => {
  initLoadingScreen();
  const lang = await I18n.init();
  initLanguageSwitcher(lang);
  initHeaderScroll();
  initMobileMenu();
  initServicesDropdown();
  initBackToTop();
  initContactForm();
  initScrollAnimations();
  initSmoothScroll();
  initParallax();
});

/* ==========================================
   Loading Screen
   ========================================== */
function initLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingText = document.getElementById('loadingText');
  const headerLogo = document.querySelector('.header__logo');
  const lottieContainer = document.getElementById('lottieContainer');

  if (!loadingScreen || !loadingText || !headerLogo) return;

  // Prevent body scroll during loading
  document.body.classList.add('loading');

  // Initialize Lottie animation
  if (lottieContainer) {
    const initLottie = () => {
      if (typeof lottie !== 'undefined') {
        try {
          // Try loading the extracted JSON file from .lottie
          const anim = lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'assets/icons/animations/ba0272ba-0135-4cf7-b26d-b2510f8179bb.json',
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid meet'
            }
          });

          // Set animation size (bigger - 40% larger)
          lottieContainer.style.width = '280px';
          lottieContainer.style.height = '168px';

          // Apply subtle red tint after animation loads
          anim.addEventListener('DOMLoaded', () => {
            const svg = lottieContainer.querySelector('svg');
            if (svg) {
              // Apply subtle red tint while preserving form/details
              svg.style.filter = 'hue-rotate(-10deg) saturate(1.3) brightness(0.95)';
            }
          });

          // Handle animation loaded
          anim.addEventListener('DOMLoaded', () => {
            console.log('Lottie animation DOM loaded');
          });

          // Handle animation errors
          anim.addEventListener('data_failed', (e) => {
            console.error('Lottie animation failed to load:', e);
            // Fallback: show error or use alternative
            lottieContainer.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">Loading...</div>';
          });

          // Store animation reference for cleanup if needed
          window.loadingAnimation = anim;
        } catch (error) {
          console.error('Error initializing Lottie animation:', error);
          // Fallback display
          lottieContainer.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">Loading...</div>';
        }
      } else {
        // Retry after a short delay if lottie is not yet loaded
        setTimeout(initLottie, 100);
      }
    };

    // Wait a bit for lottie library to fully load
    setTimeout(initLottie, 100);
  }

  // After text appears and underline expands, show logo text at center, then reveal page
  setTimeout(() => {
    const logoText = document.getElementById('headerLogoText');
    if (!logoText) return;

    // Hide loading text
    loadingText.style.opacity = '0';

    // Create and show logo text at center position
    const centerLogoText = document.createElement('span');
    centerLogoText.className = 'header__logo-text';
    centerLogoText.textContent = 'HELVETIC DYNAMICS AG';
    centerLogoText.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      visibility: visible;
      transition: opacity 0.4s ease-in;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--gray-900);
      white-space: nowrap;
      z-index: 10000;
    `;

    loadingScreen.appendChild(centerLogoText);

    // Fade in the center logo text
    setTimeout(() => {
      centerLogoText.style.opacity = '1';
    }, 100);

    // After showing logo text, fade out loading screen and show page
    setTimeout(() => {
      loadingScreen.classList.add('loading-screen--hidden');
      document.body.classList.remove('loading');

      // Show the actual logo text in navbar
      logoText.style.opacity = '1';
      logoText.style.visibility = 'visible';
      logoText.style.transition = 'opacity 0.4s ease-in';

      // Remove loading screen after transition
      setTimeout(() => {
        loadingScreen.remove();
      }, 600);
    }, 800);
  }, 3900); // 2.5s truck + 0.8s text fade + 0.6s underline = 3.9s
}

/* ==========================================
   Language Switcher
   ========================================== */
function initLanguageSwitcher(activeLang) {
  // Initialize desktop language switcher
  const switcher = document.getElementById('langSwitcher');
  if (switcher) {
    initSingleLanguageSwitcher(switcher, activeLang);
  }

  // Initialize mobile language switcher
  const mobileSwitcher = document.getElementById('langSwitcherMobile');
  if (mobileSwitcher) {
    initSingleLanguageSwitcher(mobileSwitcher, activeLang);
  }
}

function initSingleLanguageSwitcher(switcher, activeLang) {
  const btn = switcher.querySelector('.lang-switcher__btn');
  const dropdown = switcher.querySelector('.lang-switcher__dropdown');
  const currentLabel = switcher.querySelector('.lang-switcher__current');
  const options = switcher.querySelectorAll('.lang-switcher__option');

  if (!btn || !dropdown || !currentLabel) return;

  currentLabel.textContent = activeLang.toUpperCase();
  updateActiveOption(activeLang, options);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown(btn.getAttribute('aria-expanded') !== 'true');
  });

  options.forEach((option) => {
    option.addEventListener('click', async () => {
      const lang = option.dataset.lang;
      // Update both switchers
      document.querySelectorAll('.lang-switcher__current').forEach((label) => {
        label.textContent = lang.toUpperCase();
      });
      document.querySelectorAll('.lang-switcher__option').forEach((opt) => {
        const li = opt.closest('[role="option"]');
        if (li) li.setAttribute('aria-selected', opt.dataset.lang === lang);
      });
      toggleDropdown(false);
      await I18n.setLanguage(lang);
    });
  });

  document.addEventListener('click', (e) => {
    if (!switcher.contains(e.target)) {
      toggleDropdown(false);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggleDropdown(false);
  });

  window.addEventListener('languageChanged', (e) => {
    currentLabel.textContent = e.detail.lang.toUpperCase();
    updateActiveOption(e.detail.lang, options);
  });

  function toggleDropdown(open) {
    btn.setAttribute('aria-expanded', open);
    dropdown.classList.toggle('lang-switcher__dropdown--open', open);
  }

  function updateActiveOption(lang, opts) {
    opts.forEach((opt) => {
      const li = opt.closest('[role="option"]');
      if (li) li.setAttribute('aria-selected', opt.dataset.lang === lang);
    });
  }
}

/* ==========================================
   Header Scroll Effect
   ========================================== */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        header.classList.toggle('header--scrolled', window.scrollY > 10);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ==========================================
   Mobile Menu
   ========================================== */
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isOpen);
    nav.classList.toggle('header__nav--open', !isOpen);
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  });

  nav.querySelectorAll('.header__nav-link:not(.header__nav-link--dropdown)').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('header__nav--open');
      document.body.style.overflow = '';
    });
  });
}

/* ==========================================
   Services Dropdown
   ========================================== */
function initServicesDropdown() {
  const dropdownBtn = document.getElementById('servicesDropdown');
  if (!dropdownBtn) return;

  const dropdown = dropdownBtn.nextElementSibling;
  if (!dropdown) return;

  dropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdownBtn.getAttribute('aria-expanded') === 'true';
    dropdownBtn.setAttribute('aria-expanded', !isOpen);
    dropdown.classList.toggle('nav-dropdown__menu--open', !isOpen);
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdownBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdownBtn.setAttribute('aria-expanded', 'false');
      dropdown.classList.remove('nav-dropdown__menu--open');
    }
  });

  // Close dropdown on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdownBtn.setAttribute('aria-expanded', 'false');
      dropdown.classList.remove('nav-dropdown__menu--open');
    }
  });

  // Close dropdown when clicking on a link
  dropdown.querySelectorAll('.nav-dropdown__link').forEach((link) => {
    link.addEventListener('click', () => {
      dropdownBtn.setAttribute('aria-expanded', 'false');
      dropdown.classList.remove('nav-dropdown__menu--open');
    });
  });
}

/* ==========================================
   Back to Top
   ========================================== */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        btn.hidden = window.scrollY < 500;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================
   Contact Form
   ========================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const feedback = document.getElementById('formFeedback');
  if (!form || !feedback) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const message = form.querySelector('#message');

    if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
      showFeedback(I18n.t('contact.form.error'), 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showFeedback(I18n.t('contact.form.error'), 'error');
      return;
    }

    // Static site – show success. Connect a backend (Formspree, Netlify Forms) in production.
    showFeedback(I18n.t('contact.form.success'), 'success');
    form.reset();
  });

  function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className = `form-feedback form-feedback--${type}`;
    feedback.hidden = false;
    setTimeout(() => { feedback.hidden = true; }, 5000);
  }
}

/* ==========================================
   Scroll Animations (Intersection Observer)
   ========================================== */
function initScrollAnimations() {
  const animatable = document.querySelectorAll('.anim-fade-up:not(.hero .anim-fade-up), .anim-slide-right');

  if (!('IntersectionObserver' in window)) {
    animatable.forEach((el) => el.classList.add('is-visible'));
    // Also show service cards
    document.querySelectorAll('.service-card').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
  );

  animatable.forEach((el) => observer.observe(el));

  // Enhanced service cards animation with staggered delays
  initServiceCardsAnimation();

  // Enhanced advantage cards animation with staggered delays
  initAdvantageCardsAnimation();
}

/* ==========================================
   Service Cards Staggered Animation
   ========================================== */
function initServiceCardsAnimation() {
  const serviceCards = document.querySelectorAll('.service-card');
  if (serviceCards.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cards = Array.from(entry.target.parentElement.querySelectorAll('.service-card'));
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('is-visible');
            }, index * 100); // Stagger by 100ms
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
  );

  // Observe the services grid container
  const servicesGrid = document.querySelector('.services__grid');
  if (servicesGrid) {
    observer.observe(servicesGrid);
  }
}

/* ==========================================
   Advantage Cards Staggered Animation
   ========================================== */
function initAdvantageCardsAnimation() {
  const advantageCards = document.querySelectorAll('.advantage-card');
  if (advantageCards.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cards = Array.from(entry.target.parentElement.querySelectorAll('.advantage-card'));
          cards.forEach((card, index) => {
            const delay = card.dataset.animDelay || index * 100;
            setTimeout(() => {
              card.classList.add('is-visible');
            }, parseInt(delay));
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
  );

  // Observe the advantages grid container
  const advantagesGrid = document.querySelector('.advantages__grid');
  if (advantagesGrid) {
    observer.observe(advantagesGrid);
  }
}

/* ==========================================
   Smooth Scroll
   ========================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================
   Parallax – subtle hero background movement
   ========================================== */
function initParallax() {
  const heroImg = document.querySelector('.hero__bg-img');
  if (!heroImg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight) {
          heroImg.style.transform = `translateY(${scrolled * 0.3}px) scale(1.05)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}
