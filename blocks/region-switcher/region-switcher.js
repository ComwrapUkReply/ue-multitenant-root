/**
 * Region Switcher Block
 * Allows users to switch between different country/regions
 * Works with Language Switcher for complete locale selection
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  projectName: 'ue-multitenant-root',
  githubOrg: 'comwrapukreply',
  branch: 'region-sel',
  regions: {
    ch: {
      code: 'ch',
      name: 'Switzerland',
      flag: '🇨🇭',
      defaultLanguage: 'de',
      languages: ['de', 'fr', 'en'],
    },
    de: {
      code: 'de',
      name: 'Germany',
      flag: '🇩🇪',
      defaultLanguage: 'de',
      languages: ['de', 'en'],
    },
    us: {
      code: 'us',
      name: 'United States',
      flag: '🇺🇸',
      defaultLanguage: 'en',
      languages: ['en'],
    },
    uk: {
      code: 'uk',
      name: 'United Kingdom',
      flag: '🇬🇧',
      // defaultLanguage can be omitted - will use fallback mechanism
      languages: ['en'],
    },
  },
  // Default fallback language if region has no defaultLanguage or languages
  defaultFallbackLanguage: 'en',
};

// Cache for performance
const cache = {
  currentRegion: null,
  currentLanguage: null,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Checks if running in AEM authoring environment
 * @returns {boolean} True if in AEM authoring mode
 */
function isAEMAuthoring() {
  const { hostname } = window.location;
  return hostname.includes('adobeaemcloud.com') || hostname.includes('author-');
}

/**
 * Gets the AEM content path from URL
 * @returns {string|null} Content path or null
 */
function getAEMContentPath() {
  const { pathname } = window.location;
  return pathname.startsWith('/content/') ? pathname.replace(/\.html$/, '') : null;
}

/**
 * Detects the current region from the URL
 * @returns {Object|null} Current region object or null
 */
function detectCurrentRegion() {
  if (cache.currentRegion) {
    return cache.currentRegion;
  }

  const { hostname, pathname } = window.location;

  // Check EDS URL pattern
  const edsMatch = hostname.match(
    /region-sel--ue-multitenant-root-([a-z]{2})-([a-z]{2})--comwrapukreply\.aem\.page/,
  );

  if (edsMatch) {
    const [, regionCode, langCode] = edsMatch;
    cache.currentRegion = CONFIG.regions[regionCode] || null;
    cache.currentLanguage = langCode;
    return cache.currentRegion;
  }

  // Check AEM authoring URL pattern
  if (isAEMAuthoring()) {
    const contentPath = getAEMContentPath() || pathname;
    const aemMatch = contentPath.match(/\/content\/ue-multitenant-root\/([a-z]{2})\/([a-z]{2})/);

    if (aemMatch) {
      const [, regionCode, langCode] = aemMatch;
      cache.currentRegion = CONFIG.regions[regionCode] || null;
      cache.currentLanguage = langCode;
      return cache.currentRegion;
    }
  }

  return null;
}

/**
 * Gets the default language for a region with fallback support
 * @param {Object} region Region object
 * @returns {string} Language code to use
 */
function getRegionLanguage(region) {
  if (!region || !region.code) {
    // eslint-disable-next-line no-console
    console.warn('[Region Switcher] Invalid region object provided');
    return CONFIG.defaultFallbackLanguage;
  }

  // Priority 1: Use explicit defaultLanguage if defined
  if (region.defaultLanguage) {
    return region.defaultLanguage;
  }

  // Priority 2: Use first language from languages array if available
  if (region.languages && Array.isArray(region.languages) && region.languages.length > 0) {
    // Log warning to encourage proper configuration (only in non-production)
    const isProduction = window.location.hostname.includes('.aem.live');
    if (!isProduction) {
      // eslint-disable-next-line no-console
      console.warn(
        `[Region Switcher] Region "${region.code}" (${region.name}) does not have defaultLanguage defined. Using first available language: ${region.languages[0]}`,
      );
    }
    return region.languages[0];
  }

  // Priority 3: Use global fallback language
  const isProduction = window.location.hostname.includes('.aem.live');
  if (!isProduction) {
    // eslint-disable-next-line no-console
    console.warn(
      `[Region Switcher] Region "${region.code}" (${region.name}) has no defaultLanguage or languages array. Using fallback: ${CONFIG.defaultFallbackLanguage}`,
    );
  }
  return CONFIG.defaultFallbackLanguage;
}

/**
 * Generates the target URL for a region (always homepage)
 * @param {Object} targetRegion Target region object
 * @returns {string} Target URL (homepage of the region)
 */
function generateRegionURL(targetRegion) {
  // Use fallback mechanism to get language
  const lang = getRegionLanguage(targetRegion);
  const { hostname, search } = window.location;

  // AEM Authoring - redirect to homepage
  if (isAEMAuthoring()) {
    const contentPath = `/content/ue-multitenant-root/${targetRegion.code}/${lang}`;
    return `${window.location.protocol}//${hostname}${contentPath}.html${search}`;
  }

  // Edge Delivery Services - redirect to homepage
  return `https://${CONFIG.branch}--${CONFIG.projectName}-${targetRegion.code}-${lang}--${CONFIG.githubOrg}.aem.page`;
}

// =============================================================================
// UI CREATION
// =============================================================================

/**
 * Creates the dropdown region switcher
 * @param {Array} regions Available regions
 * @param {Object} currentRegion Current region
 * @param {boolean} showFlags Whether to show flags
 * @returns {HTMLElement} Dropdown element
 */
function createDropdownSwitcher(regions, currentRegion, showFlags) {
  const wrapper = document.createElement('div');
  wrapper.className = 'region-dropdown';

  // Current region button
  const button = document.createElement('button');
  button.className = 'region-current';
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');

  if (showFlags && currentRegion) {
    const flag = document.createElement('span');
    flag.className = 'flag';
    flag.textContent = currentRegion.flag;
    flag.setAttribute('aria-hidden', 'true');
    button.appendChild(flag);
  }

  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = currentRegion?.name || 'Region';
  button.appendChild(label);

  const arrow = document.createElement('span');
  arrow.className = 'arrow';
  arrow.textContent = '▼';
  button.appendChild(arrow);

  wrapper.appendChild(button);

  // Dropdown menu
  const menu = document.createElement('ul');
  menu.className = 'region-menu';
  menu.setAttribute('role', 'menu');

  regions.forEach((region) => {
    const li = document.createElement('li');
    const isCurrent = currentRegion?.code === region.code;

    const link = document.createElement('a');
    link.className = `region-option${isCurrent ? ' current' : ''}`;
    // Always redirect to homepage when switching regions
    link.href = isCurrent ? '#' : generateRegionURL(region);
    link.setAttribute('role', 'menuitem');

    if (isCurrent) {
      link.setAttribute('aria-current', 'true');
      link.addEventListener('click', (e) => e.preventDefault());
    }

    if (showFlags) {
      const flag = document.createElement('span');
      flag.className = 'flag';
      flag.textContent = region.flag;
      link.appendChild(flag);
    }

    const labelSpan = document.createElement('span');
    labelSpan.className = 'label';
    labelSpan.textContent = region.name;
    link.appendChild(labelSpan);

    li.appendChild(link);
    menu.appendChild(li);
  });

  wrapper.appendChild(menu);

  // Toggle functionality
  const toggleMenu = (show) => {
    menu.classList.toggle('open', show);
    button.setAttribute('aria-expanded', show);
  };

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(!menu.classList.contains('open'));
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      toggleMenu(false);
    }
  });

  button.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleMenu(false);
    }
  });

  return wrapper;
}

/**
 * Parses block configuration from DOM
 * @param {HTMLElement} block Block element
 * @returns {Object} Configuration object
 */
function parseBlockConfig(block) {
  const config = {
    displayStyle: 'dropdown',
    showFlags: true,
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent?.trim().toLowerCase().replace(/\s+/g, '');
      const value = cells[1].textContent?.trim();

      if (key === 'showflags' || key === 'flags') {
        config.showFlags = value?.toLowerCase() !== 'false';
      }
    }
  });

  return config;
}

/**
 * Block decoration function - entry point
 * @param {HTMLElement} block Block element to decorate
 */
export default async function decorate(block) {
  const config = parseBlockConfig(block);
  const regions = Object.values(CONFIG.regions);
  const currentRegion = detectCurrentRegion();

  // Clear and rebuild
  block.textContent = '';

  if (regions.length === 0) {
    return;
  }

  // Region switcher always redirects to homepage of target region
  const switcher = createDropdownSwitcher(regions, currentRegion, config.showFlags);
  block.appendChild(switcher);
  block.classList.add('loaded');
}

// Export utilities for external use
export {
  detectCurrentRegion,
  generateRegionURL,
  CONFIG,
};
