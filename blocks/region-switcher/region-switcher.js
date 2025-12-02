/**
 * Region Switcher Block
 * Allows users to switch between different country/regions
 * Fetches region data from placeholders.json
 * Each region uses its default language - no cross-language mapping
 */

import { getMetadata } from '../../scripts/aem.js';

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  placeholdersUrl: '/placeholders.json',
  projectName: 'ue-multitenant-root',
  githubOrg: 'comwrapukreply',
  branch: 'multi-lang',
  // Region definitions with default languages and metadata
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
  },
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
};

// =============================================================================
// CACHE
// =============================================================================

const cache = {
  placeholders: null,
  placeholdersTimestamp: 0,
  currentRegion: null,
  currentLanguage: null,
  availableRegions: null,
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
  if (pathname.startsWith('/content/')) {
    return pathname.replace(/\.html$/, '');
  }
  return null;
}

/**
 * Fetches placeholders data from JSON endpoint
 * @returns {Promise<Array>} Array of placeholder mappings
 */
async function fetchPlaceholders() {
  const now = Date.now();

  // Return cached data if still valid
  if (cache.placeholders && (now - cache.placeholdersTimestamp) < CONFIG.cacheTimeout) {
    return cache.placeholders;
  }

  try {
    // Determine the correct URL based on environment
    let placeholdersUrl = CONFIG.placeholdersUrl;

    if (!isAEMAuthoring()) {
      // For EDS, fetch from the main branch
      placeholdersUrl = `https://${CONFIG.branch}--${CONFIG.projectName}--${CONFIG.githubOrg}.aem.page${CONFIG.placeholdersUrl}`;
    }

    const response = await fetch(placeholdersUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch placeholders: ${response.status}`);
    }

    const data = await response.json();
    cache.placeholders = data.data || [];
    cache.placeholdersTimestamp = now;

    return cache.placeholders;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Region Switcher: Failed to fetch placeholders, using defaults', error);
    return [];
  }
}

/**
 * Extracts unique regions from placeholders data
 * @param {Array} placeholders Placeholders data array
 * @returns {Array} Array of unique region objects
 */
function extractRegionsFromPlaceholders(placeholders) {
  const regionSet = new Set();

  placeholders.forEach((item) => {
    // Extract region code from source path (e.g., /ch/de/ -> ch)
    const sourceMatch = item.source?.match(/^\/?([a-z]{2})\//);
    if (sourceMatch) {
      regionSet.add(sourceMatch[1]);
    }

    // Extract region code from target path
    const targetMatch = item.target?.match(/^\/?([a-z]{2})\//);
    if (targetMatch) {
      regionSet.add(targetMatch[1]);
    }
  });

  // Map region codes to full region objects
  return Array.from(regionSet)
    .map((code) => CONFIG.regions[code])
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Gets available regions, either from placeholders or config
 * @returns {Promise<Array>} Array of region objects
 */
async function getAvailableRegions() {
  if (cache.availableRegions) {
    return cache.availableRegions;
  }

  const placeholders = await fetchPlaceholders();

  if (placeholders.length > 0) {
    cache.availableRegions = extractRegionsFromPlaceholders(placeholders);
  } else {
    // Fallback to config regions
    cache.availableRegions = Object.values(CONFIG.regions);
  }

  return cache.availableRegions;
}

// =============================================================================
// DETECTION FUNCTIONS
// =============================================================================

/**
 * Detects the current region from the URL
 * @returns {Object|null} Current region object or null
 */
function detectCurrentRegion() {
  if (cache.currentRegion !== null) {
    return cache.currentRegion;
  }

  const { hostname, pathname } = window.location;

  // Check EDS URL pattern: multi-lang--ue-multitenant-root-{region}-{lang}--comwrapukreply.aem.page
  const edsMatch = hostname.match(
    /multi-lang--ue-multitenant-root-([a-z]{2})-([a-z]{2})--comwrapukreply\.aem\.page/,
  );

  if (edsMatch) {
    const [, regionCode, langCode] = edsMatch;
    cache.currentRegion = CONFIG.regions[regionCode] || null;
    cache.currentLanguage = langCode;
    return cache.currentRegion;
  }

  // Check AEM authoring URL pattern: /content/ue-multitenant-root/{region}/{lang}/
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

  cache.currentRegion = null;
  return null;
}

/**
 * Gets the current language code
 * @returns {string|null} Current language code
 */
function getCurrentLanguage() {
  if (cache.currentLanguage) {
    return cache.currentLanguage;
  }

  // Trigger region detection which also sets language
  detectCurrentRegion();
  return cache.currentLanguage;
}

/**
 * Gets the current page path (without locale prefix)
 * @returns {string} Current page path
 */
function getCurrentPagePath() {
  const { pathname } = window.location;
  const currentRegion = detectCurrentRegion();
  const currentLang = getCurrentLanguage();

  if (!currentRegion || !currentLang) {
    return '';
  }

  // For EDS URLs, pathname is already the page path
  if (!isAEMAuthoring()) {
    // Remove leading slash
    return pathname.startsWith('/') ? pathname.substring(1) : pathname;
  }

  // For AEM authoring, extract page path from content path
  const contentPath = getAEMContentPath();
  if (contentPath) {
    const basePath = `/content/ue-multitenant-root/${currentRegion.code}/${currentLang}`;
    if (contentPath.startsWith(basePath)) {
      const relativePath = contentPath.substring(basePath.length);
      const cleanPath = relativePath.replace(/\.html$/, '');
      return cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
    }
  }

  return '';
}

// =============================================================================
// URL GENERATION
// =============================================================================

/**
 * Generates the target URL for a region
 * @param {Object} targetRegion Target region object
 * @param {string} targetLanguage Target language code (optional, uses default)
 * @param {string} pagePath Page path (optional)
 * @returns {string} Target URL
 */
function generateRegionURL(targetRegion, targetLanguage = null, pagePath = '') {
  const lang = targetLanguage || targetRegion.defaultLanguage;
  const { hostname, search } = window.location;

  // AEM Authoring environment
  if (isAEMAuthoring()) {
    const pagePathPart = pagePath ? `/${pagePath}` : '';
    const contentPath = `/content/ue-multitenant-root/${targetRegion.code}/${lang}${pagePathPart}`;
    return `${window.location.protocol}//${hostname}${contentPath}.html${search}`;
  }

  // Edge Delivery Services
  const baseURL = `https://${CONFIG.branch}--${CONFIG.projectName}-${targetRegion.code}-${lang}--${CONFIG.githubOrg}.aem.page`;

  if (!pagePath) {
    return baseURL;
  }

  const cleanPath = pagePath.startsWith('/') ? pagePath : `/${pagePath}`;
  return `${baseURL}${cleanPath}`;
}

// =============================================================================
// UI CREATION FUNCTIONS
// =============================================================================

/**
 * Creates a region option element
 * @param {Object} region Region object
 * @param {boolean} showFlag Whether to show flag
 * @param {boolean} isCurrent Whether this is the current region
 * @param {string} pagePath Current page path
 * @returns {HTMLElement} Region option element
 */
function createRegionOption(region, showFlag, isCurrent, pagePath) {
  const link = document.createElement('a');
  link.className = `region-option${isCurrent ? ' current' : ''}`;
  link.href = isCurrent ? '#' : generateRegionURL(region, null, pagePath);
  link.setAttribute('role', 'menuitem');

  if (isCurrent) {
    link.setAttribute('aria-current', 'true');
    link.addEventListener('click', (e) => e.preventDefault());
  }

  // Flag element
  if (showFlag) {
    const flagSpan = document.createElement('span');
    flagSpan.className = 'flag';
    flagSpan.textContent = region.flag;
    flagSpan.setAttribute('aria-hidden', 'true');
    link.appendChild(flagSpan);
  }

  // Label element
  const labelSpan = document.createElement('span');
  labelSpan.className = 'label';
  labelSpan.textContent = region.name;
  link.appendChild(labelSpan);

  return link;
}

/**
 * Creates dropdown style region switcher
 * @param {Array} regions Available regions
 * @param {Object} currentRegion Current region
 * @param {boolean} showFlags Whether to show flags
 * @param {string} pagePath Current page path
 * @returns {HTMLElement} Dropdown element
 */
function createDropdownSwitcher(regions, currentRegion, showFlags, pagePath) {
  const wrapper = document.createElement('div');
  wrapper.className = 'region-switcher-dropdown';

  // Current region button
  const button = document.createElement('button');
  button.className = 'region-current';
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-label', `Current region: ${currentRegion?.name || 'Select region'}. Click to change.`);

  if (showFlags && currentRegion) {
    const flagSpan = document.createElement('span');
    flagSpan.className = 'flag';
    flagSpan.textContent = currentRegion.flag;
    flagSpan.setAttribute('aria-hidden', 'true');
    button.appendChild(flagSpan);
  }

  const labelSpan = document.createElement('span');
  labelSpan.className = 'label';
  labelSpan.textContent = currentRegion?.name || 'Select Region';
  button.appendChild(labelSpan);

  // Dropdown arrow
  const arrow = document.createElement('span');
  arrow.className = 'arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '▼';
  button.appendChild(arrow);

  wrapper.appendChild(button);

  // Dropdown menu
  const menu = document.createElement('ul');
  menu.className = 'region-menu';
  menu.setAttribute('role', 'menu');
  menu.style.display = 'none';

  regions.forEach((region) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');

    const isCurrent = currentRegion?.code === region.code;
    const option = createRegionOption(region, showFlags, isCurrent, pagePath);
    li.appendChild(option);
    menu.appendChild(li);
  });

  wrapper.appendChild(menu);

  // Toggle functionality
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', !isExpanded);
    menu.style.display = isExpanded ? 'none' : 'block';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      button.setAttribute('aria-expanded', 'false');
      menu.style.display = 'none';
    }
  });

  // Keyboard navigation
  button.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      button.setAttribute('aria-expanded', 'false');
      menu.style.display = 'none';
    }
  });

  return wrapper;
}

/**
 * Creates horizontal list style region switcher
 * @param {Array} regions Available regions
 * @param {Object} currentRegion Current region
 * @param {boolean} showFlags Whether to show flags
 * @param {string} pagePath Current page path
 * @returns {HTMLElement} Horizontal list element
 */
function createHorizontalSwitcher(regions, currentRegion, showFlags, pagePath) {
  const wrapper = document.createElement('nav');
  wrapper.className = 'region-switcher-horizontal';
  wrapper.setAttribute('aria-label', 'Region selection');

  const list = document.createElement('ul');
  list.className = 'region-list';
  list.setAttribute('role', 'menubar');

  regions.forEach((region) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');

    const isCurrent = currentRegion?.code === region.code;
    const option = createRegionOption(region, showFlags, isCurrent, pagePath);
    option.setAttribute('role', 'menuitem');
    li.appendChild(option);
    list.appendChild(li);
  });

  wrapper.appendChild(list);
  return wrapper;
}

/**
 * Creates flag icons only style region switcher
 * @param {Array} regions Available regions
 * @param {Object} currentRegion Current region
 * @param {string} pagePath Current page path
 * @returns {HTMLElement} Flags element
 */
function createFlagsSwitcher(regions, currentRegion, pagePath) {
  const wrapper = document.createElement('nav');
  wrapper.className = 'region-switcher-flags';
  wrapper.setAttribute('aria-label', 'Region selection');

  const list = document.createElement('ul');
  list.className = 'region-flags';
  list.setAttribute('role', 'menubar');

  regions.forEach((region) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'none');

    const isCurrent = currentRegion?.code === region.code;
    const link = document.createElement('a');
    link.className = `region-flag${isCurrent ? ' current' : ''}`;
    link.href = isCurrent ? '#' : generateRegionURL(region, null, pagePath);
    link.setAttribute('role', 'menuitem');
    link.setAttribute('aria-label', region.name);
    link.setAttribute('title', region.name);

    if (isCurrent) {
      link.setAttribute('aria-current', 'true');
      link.addEventListener('click', (e) => e.preventDefault());
    }

    const flagSpan = document.createElement('span');
    flagSpan.className = 'flag';
    flagSpan.textContent = region.flag;
    flagSpan.setAttribute('aria-hidden', 'true');
    link.appendChild(flagSpan);

    li.appendChild(link);
    list.appendChild(li);
  });

  wrapper.appendChild(list);
  return wrapper;
}

// =============================================================================
// MAIN FUNCTIONS
// =============================================================================

/**
 * Creates the region switcher UI
 * @param {Object} options Configuration options
 * @returns {Promise<HTMLElement>} Region switcher element
 */
async function createRegionSwitcher(options = {}) {
  const {
    displayStyle = 'dropdown',
    showFlags = true,
  } = options;

  const container = document.createElement('div');
  container.className = 'region-switcher-container';

  // Get available regions
  const regions = await getAvailableRegions();

  if (regions.length === 0) {
    container.innerHTML = '<span class="region-switcher-error">No regions available</span>';
    return container;
  }

  // Detect current region
  const currentRegion = detectCurrentRegion();
  const pagePath = getCurrentPagePath();

  // Create appropriate switcher style
  let switcher;
  switch (displayStyle) {
    case 'horizontal':
      switcher = createHorizontalSwitcher(regions, currentRegion, showFlags, pagePath);
      break;
    case 'flags':
      switcher = createFlagsSwitcher(regions, currentRegion, pagePath);
      break;
    case 'dropdown':
    default:
      switcher = createDropdownSwitcher(regions, currentRegion, showFlags, pagePath);
      break;
  }

  container.appendChild(switcher);
  return container;
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
    defaultLanguages: {},
  };

  // Try to get config from block content
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent?.trim().toLowerCase();
      const value = cells[1].textContent?.trim();

      switch (key) {
        case 'displaystyle':
        case 'display style':
        case 'style':
          config.displayStyle = value || 'dropdown';
          break;
        case 'showflags':
        case 'show flags':
        case 'flags':
          config.showFlags = value?.toLowerCase() !== 'false';
          break;
        case 'defaultlanguages':
        case 'default languages':
          try {
            config.defaultLanguages = JSON.parse(value);
          } catch (e) {
            // Ignore parse errors
          }
          break;
        default:
          break;
      }
    }
  });

  // Check for data attributes
  if (block.dataset.displayStyle) {
    config.displayStyle = block.dataset.displayStyle;
  }
  if (block.dataset.showFlags) {
    config.showFlags = block.dataset.showFlags !== 'false';
  }

  return config;
}

/**
 * Clears the cache
 */
function clearCache() {
  cache.placeholders = null;
  cache.placeholdersTimestamp = 0;
  cache.currentRegion = null;
  cache.currentLanguage = null;
  cache.availableRegions = null;
}

/**
 * Block decoration function - entry point
 * @param {HTMLElement} block Block element to decorate
 */
export default async function decorate(block) {
  // Parse configuration from block
  const config = parseBlockConfig(block);

  // Clear block content
  block.textContent = '';

  // Create and append region switcher
  const switcher = await createRegionSwitcher(config);
  block.appendChild(switcher);

  // Add loaded class for CSS transitions
  block.classList.add('region-switcher-loaded');
}

// Export utilities for external use
export {
  createRegionSwitcher,
  detectCurrentRegion,
  getCurrentLanguage,
  getAvailableRegions,
  generateRegionURL,
  clearCache,
  CONFIG,
};

