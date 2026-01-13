/**
 * Language Switcher Block
 * Switches languages within the same region
 */

import { PAGE_MAPPINGS } from './page-mappings.js';

// Configuration
const CONFIG = {
  projectName: 'ue-multitenant-root',
  githubOrg: 'comwrapukreply',
  branch: 'main',
  locales: [
    {
      code: 'ch-de', path: '/ch/de/', label: 'DE', flag: '🇨🇭', country: 'ch',
    },
    {
      code: 'ch-fr', path: '/ch/fr/', label: 'FR', flag: '🇨🇭', country: 'ch',
    },
    {
      code: 'ch-en', path: '/ch/en/', label: 'EN', flag: '🇨🇭', country: 'ch',
    },
    {
      code: 'de-de', path: '/de/de/', label: 'DE', flag: '🇩🇪', country: 'de', default: true,
    },
    {
      code: 'de-en', path: '/de/en/', label: 'EN', flag: '🇩🇪', country: 'de',
    },
  ],
};

// Cache
const cache = {
  locale: null,
  pagePath: null,
  mappings: null,
  mappingsPromise: null,
};

// Helpers
const isAEMAuthoring = () => {
  const { hostname } = window.location;
  return hostname.includes('adobeaemcloud.com') || hostname.includes('author-');
};

const getContentPath = () => {
  const { pathname, search } = window.location;
  if (pathname.includes('/content/')) return pathname;
  const param = new URLSearchParams(search).get('contentPath') || new URLSearchParams(search).get('path');
  if (param) return param;
  try {
    const ref = new URL(document.referrer);
    if (ref.pathname.includes('/content/')) return ref.pathname;
  } catch { /* ignore */ }
  return null;
};

/**
 * Fetches placeholders.json mappings
 */
async function fetchMappings() {
  if (cache.mappings) return cache.mappings;
  if (cache.mappingsPromise) return cache.mappingsPromise;

  cache.mappingsPromise = (async () => {
    try {
      const url = `https://${CONFIG.branch}--${CONFIG.projectName}--${CONFIG.githubOrg}.aem.page/placeholders.json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const mappings = {};

      (data.data || []).forEach((item) => {
        if (!item.source || !item.target || item.type !== 'page') return;

        const srcMatch = item.source.match(/^\/([^/]+)\/([^/]+)\/(.+)$/);
        const tgtMatch = item.target.match(/^\/([^/]+)\/([^/]+)\/(.+)$/);
        if (!srcMatch || !tgtMatch) return;

        const srcLocale = `${srcMatch[1]}-${srcMatch[2]}`;
        const tgtLocale = `${tgtMatch[1]}-${tgtMatch[2]}`;
        const srcPath = srcMatch[3].replace(/^\/+|\/+$/g, '');
        const tgtPath = tgtMatch[3].replace(/^\/+|\/+$/g, '');

        mappings[srcLocale] = mappings[srcLocale] || {};
        mappings[srcLocale][srcPath] = mappings[srcLocale][srcPath] || {};
        mappings[srcLocale][srcPath][tgtLocale] = tgtPath;
      });

      cache.mappings = mappings;
      return mappings;
    } catch {
      return {};
    } finally {
      cache.mappingsPromise = null;
    }
  })();

  return cache.mappingsPromise;
}

/**
 * Detects current locale from URL
 */
function detectLocale() {
  if (cache.locale) return cache.locale;

  const { hostname, pathname } = window.location;

  // EDS URL
  const edsMatch = hostname.match(/ue-multitenant-root-([^-]+)-([^-]+)--/);
  if (edsMatch) {
    cache.locale = CONFIG.locales.find((l) => l.code === `${edsMatch[1]}-${edsMatch[2]}`);
    return cache.locale;
  }

  // AEM authoring
  if (isAEMAuthoring()) {
    const path = getContentPath() || pathname;
    const aemMatch = path.match(/\/content\/ue-multitenant-root\/([^/]+)\/([^/]+)/);
    if (aemMatch) {
      cache.locale = CONFIG.locales.find((l) => l.code === `${aemMatch[1]}-${aemMatch[2]}`);
      return cache.locale;
    }
  }

  cache.locale = CONFIG.locales.find((l) => l.default) || CONFIG.locales[0];
  return cache.locale;
}

/**
 * Gets current page path
 */
function getPagePath(locale) {
  if (cache.pagePath !== null) return cache.pagePath;

  const { pathname, hostname } = window.location;

  if (hostname.includes('.aem.page')) {
    cache.pagePath = pathname === '/' ? '' : pathname.replace(/^\//, '');
    return cache.pagePath;
  }

  if (isAEMAuthoring() && locale) {
    const content = getContentPath();
    const base = `/content/ue-multitenant-root${locale.path}`;
    if (content?.startsWith(base)) {
      cache.pagePath = content.substring(base.length).replace(/\.html$/, '').replace(/^\//, '');
      return cache.pagePath;
    }
  }

  cache.pagePath = '';
  return cache.pagePath;
}

/**
 * Maps page path to target locale (falls back to homepage)
 */
function mapPath(path, fromLocale, toLocale, customMap, dynamicMap) {
  if (!path || path === '/') return '';

  const clean = path.replace(/^\//, '');

  // Check mappings in priority order
  const sources = [customMap, dynamicMap, PAGE_MAPPINGS];
  const found = sources.find((src) => src?.[fromLocale.code]?.[clean]?.[toLocale.code]);
  if (found) return found[fromLocale.code][clean][toLocale.code];

  return ''; // Fallback to homepage
}

/**
 * Generates target URL
 */
function generateURL(locale, path) {
  if (isAEMAuthoring()) {
    const { protocol, hostname, search } = window.location;
    const pagePath = path ? `/${path}` : '';
    return `${protocol}//${hostname}/content/ue-multitenant-root${locale.path}${pagePath}.html${search}`;
  }

  const base = `https://${CONFIG.branch}--${CONFIG.projectName}-${locale.code}--${CONFIG.githubOrg}.aem.page`;
  return path ? `${base}/${path}` : base;
}

/**
 * Creates language option element
 */
function createOption(locale, opts, href, isCurrent = false) {
  const el = document.createElement(isCurrent ? 'span' : 'a');
  el.className = isCurrent ? 'language-current' : 'language-option';
  if (!isCurrent) {
    el.href = href;
    el.setAttribute('role', 'menuitem');
  }
  const label = opts.customLabels?.[locale.code] || locale.label;
  el.innerHTML = `
    ${opts.showFlags ? `<span class="flag">${locale.flag}</span>` : ''}
    <span class="label">${label}</span>
  `;
  return el;
}

/**
 * Creates dropdown switcher
 */
function createDropdown(container, current, locales, opts) {
  const wrapper = document.createElement('div');
  wrapper.className = 'language-dropdown';

  const btn = createOption(current, opts, '', true);
  btn.setAttribute('aria-haspopup', 'true');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML += '<span class="arrow" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="chevron-down"><path d="M4.47 6.97a.75.75 0 0 1 1.06 0L8 9.44l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06z" fill="currentColor"/></svg></span>';

  const menu = document.createElement('ul');
  menu.className = 'language-menu';
  menu.setAttribute('role', 'menu');

  locales.filter((l) => l.code !== current.code).forEach((locale) => {
    const li = document.createElement('li');
    const path = mapPath(opts.pagePath, current, locale, opts.customMap, opts.dynamicMap);
    const link = createOption(locale, opts, generateURL(locale, path));
    li.appendChild(link);
    menu.appendChild(li);
  });

  wrapper.append(btn, menu);

  // Toggle
  const toggle = (open) => {
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  };

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    toggle(!menu.classList.contains('open'));
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) toggle(false);
  });

  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggle(false);
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(!menu.classList.contains('open'));
    }
  });

  container.appendChild(wrapper);
}

/**
 * Creates horizontal list switcher
 */
function createList(container, current, locales, opts, flagsOnly = false) {
  const list = document.createElement('ul');
  list.className = `language-list ${flagsOnly ? 'flags' : 'horizontal'}`;
  list.setAttribute('role', 'list');

  locales.forEach((locale) => {
    const li = document.createElement('li');
    li.className = `language-item${locale.code === current.code ? ' current' : ''}`;

    if (locale.code === current.code) {
      const el = document.createElement('span');
      el.className = `language-current${flagsOnly ? ' flag-only' : ''}`;
      if (flagsOnly) {
        el.title = opts.customLabels?.[locale.code] || locale.label;
        el.innerHTML = `<span class="flag">${locale.flag}</span>`;
      } else {
        el.innerHTML = `
          ${opts.showFlags ? `<span class="flag">${locale.flag}</span>` : ''}
          <span class="label">${opts.customLabels?.[locale.code] || locale.label}</span>
        `;
      }
      li.appendChild(el);
    } else {
      const path = mapPath(opts.pagePath, current, locale, opts.customMap, opts.dynamicMap);
      const link = document.createElement('a');
      link.className = `language-option${flagsOnly ? ' flag-only' : ''}`;
      link.href = generateURL(locale, path);
      if (flagsOnly) {
        link.title = opts.customLabels?.[locale.code] || locale.label;
        link.innerHTML = `<span class="flag">${locale.flag}</span>`;
      } else {
        link.innerHTML = `
          ${opts.showFlags ? `<span class="flag">${locale.flag}</span>` : ''}
          <span class="label">${opts.customLabels?.[locale.code] || locale.label}</span>
        `;
      }
      li.appendChild(link);
    }

    list.appendChild(li);
  });

  container.appendChild(list);
}

/**
 * Parses block configuration
 */
function parseConfig(block) {
  const config = {};

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const key = cells[0].textContent.trim().toLowerCase().replace(/\s+/g, '');
    const value = cells[1].textContent.trim();

    if (key === 'displaystyle') config.displayStyle = value;
    if (key === 'excludelocales') {
      config.excludeLocales = value.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (key === 'advancedconfig') {
      try {
        const adv = JSON.parse(value.replace(/<[^>]*>/g, ''));
        config.showFlags = adv.showFlags !== false;
        config.customLabels = adv.customLabels || {};
        config.customMap = adv.pageMapping || null;
      } catch { /* ignore */ }
    }
  });

  return config;
}

/**
 * Adds analytics tracking
 */
function addAnalytics(block) {
  block.querySelectorAll('.language-option').forEach((link) => {
    link.addEventListener('click', () => {
      const match = link.href?.match(/ue-multitenant-root-([^-]+)-([^-]+)--/);
      if (match && window.dataLayer) {
        window.dataLayer.push({
          event: 'language_switch',
          language_from: detectLocale()?.code,
          language_to: `${match[1]}-${match[2]}`,
          page_path: window.location.pathname,
        });
      }
    });
  });
}

/**
 * Main decoration function
 */
export default async function decorate(block) {
  try {
    const config = parseConfig(block);
    const locale = detectLocale();

    if (!locale) {
      block.innerHTML = '<p>Language switcher not available</p>';
      return;
    }

    // Get locales for current region
    let locales = CONFIG.locales.filter((l) => l.country === locale.country);
    if (config.excludeLocales?.length) {
      locales = locales.filter((l) => !config.excludeLocales.includes(l.code));
    }

    if (locales.length <= 1) {
      block.style.display = 'none';
      return;
    }

    block.textContent = '';
    block.classList.add('language-switcher-block');

    const dynamicMap = await fetchMappings().catch(() => null);
    const container = document.createElement('div');
    container.className = 'language-switcher-container';

    const opts = {
      showFlags: config.showFlags !== false,
      customLabels: config.customLabels || {},
      customMap: config.customMap,
      dynamicMap,
      pagePath: getPagePath(locale),
    };

    const style = config.displayStyle || 'dropdown';
    if (style === 'horizontal') createList(container, locale, locales, opts);
    else if (style === 'flags') createList(container, locale, locales, opts, true);
    else createDropdown(container, locale, locales, opts);

    block.appendChild(container);
    addAnalytics(block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Language Switcher error:', error);
    block.innerHTML = '<p>Language switcher unavailable</p>';
  }
}

// Exports
export { detectLocale, CONFIG };
