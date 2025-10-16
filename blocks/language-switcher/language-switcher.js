/**
 * Language Switcher Block
 * Provides navigation between different locale versions of the same page
 * Supports automatic locale detection and intelligent page mapping
 */

import { PAGE_MAPPINGS } from './page-mappings.js';

// Configuration for the multitenant setup
const CONFIG = {
  projectName: 'ue-multitenant-root',
  githubOrg: 'comwrapukreply',
  locales: [
    {
      code: 'ch-de',
      path: '/ch/de/',
      label: 'Schweiz (Deutsch)',
      flag: '🇨🇭',
      country: 'ch',
      language: 'de',
    },
    {
      code: 'ch-fr',
      path: '/ch/fr/',
      label: 'Suisse (Français)',
      flag: '🇨🇭',
      country: 'ch',
      language: 'fr',
    },
    {
      code: 'ch-en',
      path: '/ch/en/',
      label: 'Switzerland (English)',
      flag: '🇨🇭',
      country: 'ch',
      language: 'en',
    },
    {
      code: 'de-de',
      path: '/de/de/',
      label: 'Deutschland (Deutsch)',
      flag: '🇩🇪',
      country: 'de',
      language: 'de',
      default: true,
    },
    {
      code: 'de-en',
      path: '/de/en/',
      label: 'Germany (English)',
      flag: '🇩🇪',
      country: 'de',
      language: 'en',
    },
  ],
};

// Cache for performance optimization
const cache = {
  currentLocale: null,
  currentPagePath: null,
  isAEMAuthoring: null,
};

/**
 * Gets AEM content path from URL or referrer
 * @returns {string|null} Content path or null
 */
function getAEMContentPath() {
  const { pathname, search } = window.location;

  // Check if path contains content path
  if (pathname.includes('/content/')) {
    return pathname;
  }

  // Check URL parameters for content path
  const urlParams = new URLSearchParams(search);
  const contentParam = urlParams.get('contentPath') || urlParams.get('path');
  if (contentParam) {
    return contentParam;
  }

  // Check referrer
  if (document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      if (referrerUrl.pathname.includes('/content/')) {
        return referrerUrl.pathname;
      }
    } catch {
      // Ignore invalid referrer URLs
    }
  }

  return null;
}

/**
 * Checks if we're in AEM authoring mode (cached)
 * @returns {boolean} True if in AEM authoring mode
 */
function isAEMAuthoring() {
  if (cache.isAEMAuthoring === null) {
    const { hostname } = window.location;
    cache.isAEMAuthoring = hostname.includes('adobeaemcloud.com') || hostname.includes('author-');
  }
  return cache.isAEMAuthoring;
}

/**
 * Detects the current locale from the URL (cached)
 * @returns {Object|null} Current locale object or null if not detected
 */
function detectCurrentLocale() {
  if (cache.currentLocale) {
    return cache.currentLocale;
  }

  const { hostname } = window.location;

  // Check if we're on an Edge Delivery Services site
  const siteMatch = hostname.match(
    /multi-lang--ue-multitenant-root-([^-]+)-([^-]+)--comwrapukreply\.aem\.page/,
  );

  if (siteMatch) {
    const [, country, language] = siteMatch;
    const localeCode = `${country}-${language}`;
    cache.currentLocale = CONFIG.locales.find((locale) => locale.code === localeCode);
    return cache.currentLocale;
  }

  // Check if we're on AEM authoring (for Universal Editor)
  if (isAEMAuthoring()) {
    // Parse AEM content path from URL or referrer
    const contentPath = getAEMContentPath();
    if (contentPath) {
      const pathMatch = contentPath.match(
        /\/content\/ue-multitenant-root\/([^/]+)\/([^/]+)/,
      );
      if (pathMatch) {
        const [, country, language] = pathMatch;
        const localeCode = `${country}-${language}`;
        cache.currentLocale = CONFIG.locales.find((locale) => locale.code === localeCode);
        return cache.currentLocale;
      }
    }
  }

  // Fallback to default locale
  cache.currentLocale = CONFIG.locales.find((locale) => locale.default) || CONFIG.locales[0];
  return cache.currentLocale;
}

/**
 * Gets the current page path relative to the locale (cached)
 * @param {Object} currentLocale Current locale object
 * @returns {string} Page path
 */
function getCurrentPagePath(currentLocale) {
  if (cache.currentPagePath !== null) {
    return cache.currentPagePath;
  }

  const { pathname } = window.location;

  // For Edge Delivery Services sites, the path is already relative
  if (window.location.hostname.includes('.aem.page')) {
    if (pathname === '/') {
      cache.currentPagePath = '';
    } else {
      // Remove leading slash for consistency with page mappings
      cache.currentPagePath = pathname.startsWith('/') ? pathname.substring(1) : pathname;
    }
    return cache.currentPagePath;
  }

  // For AEM authoring, extract from content path
  if (isAEMAuthoring()) {
    const contentPath = getAEMContentPath();
    if (contentPath && currentLocale) {
      const basePath = `/content/ue-multitenant-root${currentLocale.path}`;
      if (contentPath.startsWith(basePath)) {
        const relativePath = contentPath.substring(basePath.length);
        const cleanPath = relativePath.replace(/\.html$/, '');
        // Remove leading slash for consistency with page mappings
        cache.currentPagePath = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
        return cache.currentPagePath;
      }
    }
  }

  cache.currentPagePath = '';
  return cache.currentPagePath;
}

/**
 * Maps a page path to equivalent paths in other locales
 * @param {string} currentPath Current page path
 * @param {Object} currentLocale Current locale
 * @param {Object} targetLocale Target locale
 * @param {Object} customMapping Custom page mappings from block configuration
 * @returns {string} Mapped path for target locale
 */
function mapPagePath(currentPath, currentLocale, targetLocale, customMapping = {}) {
  // If no path, return root
  if (!currentPath || currentPath === '/') {
    return '';
  }

  // Remove leading slash for consistency
  const cleanPath = currentPath.startsWith('/') ? currentPath.substring(1) : currentPath;

  // Use PAGE_MAPPINGS as fallback if no custom mapping provided
  const mappingToUse = Object.keys(customMapping).length > 0 ? customMapping : PAGE_MAPPINGS;

  // Check mapping
  if (mappingToUse[currentLocale.code]?.[cleanPath]?.[targetLocale.code]) {
    return mappingToUse[currentLocale.code][cleanPath][targetLocale.code];
  }

  // Default mapping logic - use the same path
  return cleanPath;
}

/**
 * Generates the target URL for a specific locale
 * @param {Object} targetLocale Target locale object
 * @param {string} pagePath Page path
 * @returns {string} Complete target URL
 */
function generateTargetURL(targetLocale, pagePath) {
  if (isAEMAuthoring()) {
    // Generate AEM authoring URL
    const pagePathPart = pagePath ? `/${pagePath}` : '';
    const contentPath = `/content/ue-multitenant-root${targetLocale.path}${pagePathPart}`;
    const { protocol, hostname, search } = window.location;
    return `${protocol}//${hostname}${contentPath}.html${search}`;
  }

  // Generate Edge Delivery Services URL
  const baseURL = `https://multi-lang--${CONFIG.projectName}-${targetLocale.code}--${CONFIG.githubOrg}.aem.page`;

  if (!pagePath) {
    return baseURL;
  }

  const cleanPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  return `${baseURL}${cleanPath}`;
}

/**
 * Creates a language option element
 * @param {Object} locale Locale object
 * @param {Object} options Switcher options
 * @param {string} href Target URL
 * @param {boolean} isCurrent Whether this is the current locale
 * @returns {HTMLElement} Language option element
 */
function createLanguageOption(locale, options, href, isCurrent = false) {
  const element = document.createElement(isCurrent ? 'span' : 'a');
  element.className = isCurrent ? 'language-current' : 'language-option';

  if (!isCurrent) {
    element.href = href;
    element.setAttribute('role', 'menuitem');
  }

  const label = options.customLabels[locale.code] || locale.label;
  element.innerHTML = `
    ${options.showFlags ? `<span class="flag">${locale.flag}</span>` : ''}
    <span class="label">${label}</span>
  `;

  return element;
}

/**
 * Creates dropdown style language switcher
 */
function createDropdownSwitcher(container, currentLocale, availableLocales, options) {
  const dropdown = document.createElement('div');
  dropdown.className = 'language-dropdown';

  // Current language button
  const currentButton = createLanguageOption(currentLocale, options, '', true);
  currentButton.className = 'language-current';
  currentButton.setAttribute('aria-haspopup', 'true');
  currentButton.setAttribute('aria-expanded', 'false');

  // Add arrow to current button
  const arrow = document.createElement('span');
  arrow.className = 'arrow';
  arrow.textContent = '▼';
  currentButton.appendChild(arrow);

  // Dropdown menu
  const menu = document.createElement('ul');
  menu.className = 'language-menu';
  menu.setAttribute('role', 'menu');
  menu.style.display = 'none';

  // Create menu items for other locales
  availableLocales
    .filter((locale) => locale.code !== currentLocale.code)
    .forEach((locale) => {
      const item = document.createElement('li');
      item.setAttribute('role', 'none');

      const mappedPath = mapPagePath(
        options.currentPagePath,
        currentLocale,
        locale,
        options.pageMapping,
      );
      const href = generateTargetURL(locale, mappedPath);
      const link = createLanguageOption(locale, options, href);

      item.appendChild(link);
      menu.appendChild(item);
    });

  // Toggle functionality
  const toggleMenu = (show) => {
    menu.style.display = show ? 'block' : 'none';
    currentButton.setAttribute('aria-expanded', show);
  };

  currentButton.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu(menu.style.display === 'none');
  });

  // Close on outside click
  const closeOnOutsideClick = (e) => {
    if (!dropdown.contains(e.target)) {
      toggleMenu(false);
    }
  };

  document.addEventListener('click', closeOnOutsideClick);

  // Keyboard navigation
  currentButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu(menu.style.display === 'none');
    } else if (e.key === 'Escape') {
      toggleMenu(false);
    }
  });

  dropdown.appendChild(currentButton);
  dropdown.appendChild(menu);
  container.appendChild(dropdown);

  // Store cleanup function for memory management
  dropdown.cleanupFunction = () => {
    document.removeEventListener('click', closeOnOutsideClick);
  };
}

/**
 * Creates horizontal list style language switcher
 */
function createHorizontalSwitcher(container, currentLocale, availableLocales, options) {
  const list = document.createElement('ul');
  list.className = 'language-list horizontal';
  list.setAttribute('role', 'list');

  availableLocales.forEach((locale) => {
    const item = document.createElement('li');
    item.className = `language-item ${locale.code === currentLocale.code ? 'current' : ''}`;
    item.setAttribute('role', 'listitem');

    if (locale.code === currentLocale.code) {
      const current = createLanguageOption(locale, options, '', true);
      item.appendChild(current);
    } else {
      const mappedPath = mapPagePath(
        options.currentPagePath,
        currentLocale,
        locale,
        options.pageMapping,
      );
      const href = generateTargetURL(locale, mappedPath);
      const link = createLanguageOption(locale, options, href);
      item.appendChild(link);
    }

    list.appendChild(item);
  });

  container.appendChild(list);
}

/**
 * Creates flag-only style language switcher
 */
function createFlagSwitcher(container, currentLocale, availableLocales, options) {
  const list = document.createElement('ul');
  list.className = 'language-list flags';
  list.setAttribute('role', 'list');

  availableLocales.forEach((locale) => {
    const item = document.createElement('li');
    item.className = `language-item ${locale.code === currentLocale.code ? 'current' : ''}`;
    item.setAttribute('role', 'listitem');

    const label = options.customLabels[locale.code] || locale.label;

    if (locale.code === currentLocale.code) {
      const current = document.createElement('span');
      current.className = 'language-current flag-only';
      current.title = label;
      current.innerHTML = `<span class="flag">${locale.flag}</span>`;
      item.appendChild(current);
    } else {
      const mappedPath = mapPagePath(
        options.currentPagePath,
        currentLocale,
        locale,
        options.pageMapping,
      );
      const href = generateTargetURL(locale, mappedPath);
      const link = document.createElement('a');
      link.className = 'language-option flag-only';
      link.href = href;
      link.title = label;
      link.innerHTML = `<span class="flag">${locale.flag}</span>`;
      item.appendChild(link);
    }

    list.appendChild(item);
  });

  container.appendChild(list);
}

/**
 * Creates the language switcher UI
 * @param {HTMLElement} block Block element
 * @param {Object} currentLocale Current locale
 * @param {Array} availableLocales Available locales
 * @param {Object} config Block configuration
 */
function createLanguageSwitcher(block, currentLocale, availableLocales, config) {
  const {
    displayStyle = 'dropdown',
    showFlags = 'true',
    customLabels = {},
    pageMapping = PAGE_MAPPINGS,
    fallbackPage = '/',
  } = config;

  const currentPagePath = getCurrentPagePath(currentLocale);

  // Create container
  const container = document.createElement('div');
  container.className = 'language-switcher-container';

  const switcherOptions = {
    showFlags: showFlags === 'true',
    customLabels,
    pageMapping,
    currentPagePath,
    fallbackPage,
  };

  // Create appropriate switcher type
  const switcherCreators = {
    dropdown: createDropdownSwitcher,
    horizontal: createHorizontalSwitcher,
    flags: createFlagSwitcher,
  };

  const createSwitcher = switcherCreators[displayStyle] || switcherCreators.dropdown;
  createSwitcher(container, currentLocale, availableLocales, switcherOptions);

  block.appendChild(container);
}

/**
 * Parses JSON configuration from block content
 * @param {string} jsonString JSON string from rich text field
 * @returns {Object} Parsed object or empty object
 */
function parseJSONConfig(jsonString) {
  if (!jsonString?.trim()) {
    return {};
  }

  try {
    // Remove HTML tags if present
    const cleanJson = jsonString.replace(/<[^>]*>/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Language Switcher: Invalid JSON configuration', error);
    return {};
  }
}

/**
 * Extracts configuration from block content
 * @param {HTMLElement} block Block element
 * @returns {Object} Configuration object
 */
function extractBlockConfig(block) {
  const config = {};
  const rows = [...block.children];

  const configMap = {
    displaystyle: 'displayStyle',
    showflags: 'showFlags',
    customlabels: (value) => ({ customLabels: parseJSONConfig(value) }),
    pagemapping: (value) => ({ pageMapping: parseJSONConfig(value) }),
    excludelocales: (value) => ({
      excludeLocales: value.split(',').map((s) => s.trim()).filter(Boolean),
    }),
    fallbackpage: 'fallbackPage',
  };

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase().replace(/\s+/g, '');
      const value = cells[1].textContent.trim();
      const mapping = configMap[key];

      if (mapping) {
        if (typeof mapping === 'string') {
          config[mapping] = value;
        } else if (typeof mapping === 'function') {
          Object.assign(config, mapping(value));
        }
      }
    }
  });

  return config;
}

/**
 * Adds analytics tracking for language switcher interactions
 * @param {HTMLElement} block Block element
 */
function addAnalyticsTracking(block) {
  const links = block.querySelectorAll('.language-option');

  links.forEach((link) => {
    link.addEventListener('click', () => {
      const targetLocale = link.href.match(/--ue-multitenant-root-([^-]+)-([^-]+)--/);

      if (targetLocale && window.dataLayer) {
        window.dataLayer.push({
          event: 'language_switch',
          language_from: detectCurrentLocale()?.code,
          language_to: `${targetLocale[1]}-${targetLocale[2]}`,
          page_path: window.location.pathname,
        });
      }
    });
  });
}

/**
 * Cleanup function for memory management
 * @param {HTMLElement} block Block element
 */
function cleanup(block) {
  // Clean up event listeners
  const dropdown = block.querySelector('.language-dropdown');
  if (dropdown?.cleanupFunction) {
    dropdown.cleanupFunction();
  }

  // Clear cache
  Object.keys(cache).forEach((key) => {
    cache[key] = null;
  });
}

/**
 * Main decoration function
 * @param {HTMLElement} block The block DOM element
 */
export default function decorate(block) {
  try {
    // Extract configuration from block content
    const config = extractBlockConfig(block);

    // Detect current locale
    const currentLocale = detectCurrentLocale();

    if (!currentLocale) {
      // eslint-disable-next-line no-console
      console.warn('Language Switcher: Could not detect current locale');
      block.innerHTML = '<p>Language switcher not available</p>';
      return;
    }

    // Filter available locales based on configuration
    let availableLocales = CONFIG.locales;

    if (config.excludeLocales?.length > 0) {
      availableLocales = availableLocales.filter(
        (locale) => !config.excludeLocales.includes(locale.code),
      );
    }

    // Clear block content
    block.innerHTML = '';

    // Add semantic classes
    block.classList.add('language-switcher-block');

    // Store cleanup function on block for later use
    block.cleanupFunction = () => cleanup(block);

    // Create language switcher
    createLanguageSwitcher(block, currentLocale, availableLocales, config);

    // Add analytics tracking
    addAnalyticsTracking(block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Language Switcher: Failed to initialize', error);
    block.innerHTML = '<p>Language switcher unavailable</p>';
  }
}
