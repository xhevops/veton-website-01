/**
 * Helvetic Dynamics AG – i18n (Internationalization) Module
 * Lightweight translation system for static sites.
 * Primary language: de (Swiss German)
 * Extensible: add new JSON files in /i18n/ and register in SUPPORTED_LANGS.
 */

const I18n = (() => {
  const SUPPORTED_LANGS = {
    de: { label: 'Deutsch', file: 'i18n/de.json' },
    en: { label: 'English', file: 'i18n/en.json' },
    fr: { label: 'Français', file: 'i18n/fr.json' },
    it: { label: 'Italiano', file: 'i18n/it.json' },
  };

  const DEFAULT_LANG = 'de';
  const STORAGE_KEY = 'hd_lang';

  let currentLang = DEFAULT_LANG;
  let translations = {};
  let cache = {};

  /**
   * Resolve a nested key like "nav.home" from a translations object.
   */
  function resolve(obj, path) {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
  }

  /**
   * Get the correct path to translation files based on current page location.
   */
  function getTranslationPath(file) {
    // Check if we're in a subdirectory (like services/)
    const path = window.location.pathname;
    
    // If path contains /services/ or has more than 2 segments (/, /page.html), we're in a subdirectory
    if (path.includes('/services/') || path.split('/').filter(s => s).length > 1) {
      return '../' + file;
    }
    
    return file;
  }

  /**
   * Load translations JSON for a given language code.
   */
  async function loadTranslations(lang) {
    if (cache[lang]) {
      translations = cache[lang];
      return;
    }

    const config = SUPPORTED_LANGS[lang];
    if (!config) {
      console.warn(`[i18n] Language "${lang}" is not supported.`);
      return;
    }

    try {
      const filePath = getTranslationPath(config.file);
      const res = await fetch(filePath);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cache[lang] = data;
      translations = data;
    } catch (err) {
      console.error(`[i18n] Failed to load "${config.file}":`, err);
      // Fallback to default language
      if (lang !== DEFAULT_LANG && cache[DEFAULT_LANG]) {
        translations = cache[DEFAULT_LANG];
      }
    }
  }

  /**
   * Apply translations to all elements with [data-i18n] attribute.
   */
  function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = resolve(translations, key);
      if (value === null) return;

      // For input placeholders
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = value;
      } else {
        el.textContent = value;
      }
    });

    // Update <html lang>
    document.documentElement.lang = currentLang;

    // Update meta tags
    updateMeta();
  }

  /**
   * Update SEO meta tags with translated content.
   */
  function updateMeta() {
    const meta = translations.meta;
    if (!meta) return;

    if (meta.title) document.title = meta.title;

    const descTag = document.querySelector('meta[name="description"]');
    if (descTag && meta.description) descTag.content = meta.description;

    const kwTag = document.querySelector('meta[name="keywords"]');
    if (kwTag && meta.keywords) kwTag.content = meta.keywords;

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && meta.title) ogTitle.content = meta.title;

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && meta.description) ogDesc.content = meta.description;
  }

  /**
   * Set and apply a language.
   */
  async function setLanguage(lang) {
    if (!SUPPORTED_LANGS[lang]) {
      console.warn(`[i18n] Language "${lang}" is not supported.`);
      return;
    }

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    await loadTranslations(lang);
    applyTranslations();

    // Update URL parameter without reload
    const url = new URL(window.location);
    if (lang === DEFAULT_LANG) {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', lang);
    }
    window.history.replaceState({}, '', url);

    // Dispatch event for other modules
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  /**
   * Detect initial language from URL param or localStorage.
   * Swiss German (de) is always the default – browser language is NOT used
   * to ensure Swiss visitors always see German first.
   */
  function detectLanguage() {
    // 1. URL parameter (highest priority)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && SUPPORTED_LANGS[urlLang]) return urlLang;

    // 2. Stored user preference (only if user explicitly switched before)
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS[stored]) return stored;

    // 3. Always default to Swiss German
    return DEFAULT_LANG;
  }

  /**
   * Initialize the i18n system.
   */
  async function init() {
    const lang = detectLanguage();
    await setLanguage(lang);
    return lang;
  }

  return {
    init,
    setLanguage,
    getLanguage: () => currentLang,
    getSupportedLanguages: () => ({ ...SUPPORTED_LANGS }),
    t: (key) => resolve(translations, key) || key,
  };
})();
