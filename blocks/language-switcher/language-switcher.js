/**
 * Language Switcher Block
 * Provides navigation between different locale versions of the same page
 * Supports automatic locale detection and intelligent page mapping
 */

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
    const referrerUrl = new URL(document.referrer);
    if (referrerUrl.pathname.includes('/content/')) {
      return referrerUrl.pathname;
    }
  }

  return null;
}

/**
 * Detects the current locale from the URL
 * @returns {Object|null} Current locale object or null if not detected
 */
function detectCurrentLocale() {
  const { hostname } = window.location;

  // Check if we're on an Edge Delivery Services site
  const siteMatch = hostname.match(
    /main--ue-multitenant-root-([^-]+)-([^-]+)--comwrapukreply\.aem\.page/,
  );

  if (siteMatch) {
    const [, country, language] = siteMatch;
    const localeCode = `${country}-${language}`;
    return CONFIG.locales.find((locale) => locale.code === localeCode);
  }

  // Check if we're on AEM authoring (for Universal Editor)
  if (hostname.includes('adobeaemcloud.com')) {
    // Parse AEM content path from URL or referrer
    const contentPath = getAEMContentPath();
    if (contentPath) {
      const pathMatch = contentPath.match(
        /\/content\/ue-multitenant-root\/([^/]+)\/([^/]+)/,
      );
      if (pathMatch) {
        const [, country, language] = pathMatch;
        const localeCode = `${country}-${language}`;
        return CONFIG.locales.find((locale) => locale.code === localeCode);
      }
    }
  }

  // Fallback to default locale
  return CONFIG.locales.find((locale) => locale.default) || CONFIG.locales[0];
}

/**
 * Gets the current page path relative to the locale
 * @param {Object} currentLocale Current locale object
 * @returns {string} Page path
 */
function getCurrentPagePath(currentLocale) {
  const { pathname } = window.location;

  // For Edge Delivery Services sites, the path is already relative
  if (window.location.hostname.includes('.aem.page')) {
    return pathname === '/' ? '' : pathname;
  }

  // For AEM authoring, extract from content path
  const contentPath = getAEMContentPath();
  if (contentPath && currentLocale) {
    const basePath = `/content/ue-multitenant-root${currentLocale.path}`;
    if (contentPath.startsWith(basePath)) {
      const relativePath = contentPath.substring(basePath.length);
      return relativePath.replace(/\.html$/, '');
    }
  }

  return '';
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

  // Check custom mapping first
  if (customMapping[currentLocale.code] && customMapping[currentLocale.code][cleanPath]) {
    const mappedPath = customMapping[currentLocale.code][cleanPath];
    if (mappedPath[targetLocale.code]) {
      return mappedPath[targetLocale.code];
    }
  }

  // Default mapping logic - try to find equivalent page
  // This is where you would implement more sophisticated mapping logic
  // For now, we'll use the same path and let the target site handle 404s
  return cleanPath;
}

/**
 * Generates the target URL for a specific locale
 * @param {Object} targetLocale Target locale object
 * @param {string} pagePath Page path
 * @returns {string} Complete target URL
 */
function generateTargetURL(targetLocale, pagePath) {
  const baseURL = `https://multi-lang--${CONFIG.projectName}-${targetLocale.code}--${CONFIG.githubOrg}.aem.page`;

  if (!pagePath || pagePath === '') {
    return baseURL;
  }

  const cleanPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  return `${baseURL}${cleanPath}`;
}

/**
 * Creates dropdown style language switcher
 */
function createDropdownSwitcher(container, currentLocale, availableLocales, options) {
  const dropdown = document.createElement('div');
  dropdown.className = 'language-dropdown';

  // Current language button
  const currentButton = document.createElement('button');
  currentButton.className = 'language-current';
  currentButton.setAttribute('aria-haspopup', 'true');
  currentButton.setAttribute('aria-expanded', 'false');

  const currentLabel = options.customLabels[currentLocale.code] || currentLocale.label;
  currentButton.innerHTML = `
    ${options.showFlags ? `<span class="flag">${currentLocale.flag}</span>` : ''}
    <span class="label">${currentLabel}</span>
    <span class="arrow">▼</span>
  `;

  // Dropdown menu
  const menu = document.createElement('ul');
  menu.className = 'language-menu';
  menu.setAttribute('role', 'menu');
  menu.style.display = 'none';

  availableLocales.forEach((locale) => {
    if (locale.code === currentLocale.code) return;

    const item = document.createElement('li');
    item.setAttribute('role', 'none');

    const link = document.createElement('a');
    link.className = 'language-option';
    link.setAttribute('role', 'menuitem');
    link.href = generateTargetURL(
      locale,
      mapPagePath(options.currentPagePath, currentLocale, locale, options.pageMapping),
    );

    const label = options.customLabels[locale.code] || locale.label;
    link.innerHTML = `
      ${options.showFlags ? `<span class="flag">${locale.flag}</span>` : ''}
      <span class="label">${label}</span>
    `;

    item.appendChild(link);
    menu.appendChild(item);
  });

  // Toggle functionality
  currentButton.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = menu.style.display !== 'none';
    menu.style.display = isOpen ? 'none' : 'block';
    currentButton.setAttribute('aria-expanded', !isOpen);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
      menu.style.display = 'none';
      currentButton.setAttribute('aria-expanded', 'false');
    }
  });

  // Keyboard navigation
  currentButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      currentButton.click();
    }
  });

  dropdown.appendChild(currentButton);
  dropdown.appendChild(menu);
  container.appendChild(dropdown);
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
    item.setAttribute('role', 'listitem');

    if (locale.code === currentLocale.code) {
      item.className = 'language-item current';
      const span = document.createElement('span');
      span.className = 'language-current';

      const label = options.customLabels[locale.code] || locale.label;
      span.innerHTML = `
        ${options.showFlags ? `<span class="flag">${locale.flag}</span>` : ''}
        <span class="label">${label}</span>
      `;

      item.appendChild(span);
    } else {
      item.className = 'language-item';
      const link = document.createElement('a');
      link.className = 'language-option';
      link.href = generateTargetURL(
        locale,
        mapPagePath(options.currentPagePath, currentLocale, locale, options.pageMapping),
      );

      const label = options.customLabels[locale.code] || locale.label;
      link.innerHTML = `
        ${options.showFlags ? `<span class="flag">${locale.flag}</span>` : ''}
        <span class="label">${label}</span>
      `;

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
    item.className = locale.code === currentLocale.code ? 'language-item current' : 'language-item';
    item.setAttribute('role', 'listitem');

    if (locale.code === currentLocale.code) {
      const span = document.createElement('span');
      span.className = 'language-current flag-only';
      span.title = options.customLabels[locale.code] || locale.label;
      span.innerHTML = `<span class="flag">${locale.flag}</span>`;
      item.appendChild(span);
    } else {
      const link = document.createElement('a');
      link.className = 'language-option flag-only';
      link.href = generateTargetURL(
        locale,
        mapPagePath(options.currentPagePath, currentLocale, locale, options.pageMapping),
      );
      link.title = options.customLabels[locale.code] || locale.label;
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
    pageMapping = {},
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

  if (displayStyle === 'dropdown') {
    createDropdownSwitcher(container, currentLocale, availableLocales, switcherOptions);
  } else if (displayStyle === 'horizontal') {
    createHorizontalSwitcher(container, currentLocale, availableLocales, switcherOptions);
  } else if (displayStyle === 'flags') {
    createFlagSwitcher(container, currentLocale, availableLocales, switcherOptions);
  }

  block.appendChild(container);
}

/**
 * Parses JSON configuration from block content
 * @param {string} jsonString JSON string from rich text field
 * @returns {Object} Parsed object or empty object
 */
function parseJSONConfig(jsonString) {
  if (!jsonString || jsonString.trim() === '') {
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

  // Extract configuration from block children
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase().replace(/\s+/g, '');
      const value = cells[1].textContent.trim();

      switch (key) {
        case 'displaystyle':
          config.displayStyle = value;
          break;
        case 'showflags':
          config.showFlags = value;
          break;
        case 'customlabels':
          config.customLabels = parseJSONConfig(value);
          break;
        case 'pagemapping':
          config.pageMapping = parseJSONConfig(value);
          break;
        case 'excludelocales':
          config.excludeLocales = value.split(',').map((s) => s.trim()).filter((s) => s);
          break;
        case 'fallbackpage':
          config.fallbackPage = value;
          break;
        default:
          // No default case needed
          break;
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
 * Main decoration function
 * @param {HTMLElement} block The block DOM element
 */
export default function decorate(block) {
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

  if (config.excludeLocales && config.excludeLocales.length > 0) {
    availableLocales = availableLocales.filter(
      (locale) => !config.excludeLocales.includes(locale.code),
    );
  }

  // Clear block content
  block.innerHTML = '';

  // Add semantic classes
  block.classList.add('language-switcher-block');

  // Create language switcher
  createLanguageSwitcher(block, currentLocale, availableLocales, config);

  // Add analytics tracking
  addAnalyticsTracking(block);
}