/**
 * Region Switcher Block
 * Allows users to switch between different country/regions
 */

// Configuration
const CONFIG = {
  projectName: 'ue-multitenant-root',
  githubOrg: 'comwrapukreply',
  branch: 'region-sel',
  regions: {
    ch: {
      code: 'ch', name: 'CH', flag: '🇨🇭', defaultLanguage: 'de',
    },
    de: {
      code: 'de', name: 'DE', flag: '🇩🇪', defaultLanguage: 'de',
    },
    us: {
      code: 'us', name: 'US', flag: '🇺🇸', defaultLanguage: 'en',
    },
    uk: {
      code: 'uk', name: 'UK', flag: '🇬🇧', defaultLanguage: 'en',
    },
  },
};

// Selectors
const SELECTORS = {
  dropdown: 'region-dropdown',
  button: 'region-current',
  menu: 'region-menu',
  option: 'region-option',
};

// Cache
let currentRegionCache = null;

/**
 * Checks if running in AEM authoring environment
 */
const isAEMAuthoring = () => {
  const { hostname } = window.location;
  return hostname.includes('adobeaemcloud.com') || hostname.includes('author-');
};

/**
 * Detects current region from URL
 */
function detectCurrentRegion() {
  if (currentRegionCache) return currentRegionCache;

  const { hostname, pathname } = window.location;

  // EDS URL pattern: region-sel--ue-multitenant-root-{region}-{lang}--org.aem.page
  const edsMatch = hostname.match(/ue-multitenant-root-([a-z]{2})-([a-z]{2})--/);
  if (edsMatch) {
    currentRegionCache = CONFIG.regions[edsMatch[1]] || null;
    return currentRegionCache;
  }

  // AEM authoring: /content/ue-multitenant-root/{region}/{lang}
  if (isAEMAuthoring()) {
    const aemMatch = pathname.match(/\/content\/ue-multitenant-root\/([a-z]{2})\/([a-z]{2})/);
    if (aemMatch) {
      currentRegionCache = CONFIG.regions[aemMatch[1]] || null;
      return currentRegionCache;
    }
  }

  return null;
}

/**
 * Generates target URL for a region (always homepage)
 */
function generateRegionURL(region) {
  const { code, defaultLanguage } = region;

  if (isAEMAuthoring()) {
    const { protocol, hostname, search } = window.location;
    return `${protocol}//${hostname}/content/${CONFIG.projectName}/${code}/${defaultLanguage}.html${search}`;
  }

  return `https://${CONFIG.branch}--${CONFIG.projectName}-${code}-${defaultLanguage}--${CONFIG.githubOrg}.aem.page`;
}

/**
 * Creates dropdown HTML
 */
function createDropdown(regions, currentRegion, showFlags) {
  const wrapper = document.createElement('div');
  wrapper.className = SELECTORS.dropdown;

  // Button
  const buttonHTML = `
    ${showFlags && currentRegion ? `<span class="flag" aria-hidden="true">${currentRegion.flag}</span>` : ''}
    <span class="label">${currentRegion?.name || 'Region'}</span>
    <span class="arrow" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="chevron-down"><path d="M4.47 6.97a.75.75 0 0 1 1.06 0L8 9.44l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 0-1.06z" fill="currentColor"/></svg></span>
  `;

  const button = document.createElement('button');
  button.className = SELECTORS.button;
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = buttonHTML;

  // Menu
  const menu = document.createElement('ul');
  menu.className = SELECTORS.menu;
  menu.setAttribute('role', 'menu');

  regions.forEach((region) => {
    const isCurrent = currentRegion?.code === region.code;
    const li = document.createElement('li');
    li.innerHTML = `
      <a class="${SELECTORS.option}${isCurrent ? ' current' : ''}" 
         href="${isCurrent ? '#' : generateRegionURL(region)}" 
         role="menuitem"
         ${isCurrent ? 'aria-current="true"' : ''}>
        ${showFlags ? `<span class="flag">${region.flag}</span>` : ''}
        <span class="label">${region.name}</span>
      </a>
    `;

    if (isCurrent) {
      li.querySelector('a').addEventListener('click', (e) => e.preventDefault());
    }

    menu.appendChild(li);
  });

  wrapper.append(button, menu);

  // Toggle menu
  const toggle = (open) => {
    menu.classList.toggle('open', open);
    button.setAttribute('aria-expanded', open);
  };

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle(!menu.classList.contains('open'));
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) toggle(false);
  });

  button.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggle(false);
  });

  return wrapper;
}

/**
 * Block decoration function
 */
export default function decorate(block) {
  // Parse config from block content
  const showFlags = ![...block.querySelectorAll('div')]
    .some((div) => div.textContent.toLowerCase().includes('false'));

  const regions = Object.values(CONFIG.regions);
  const currentRegion = detectCurrentRegion();

  block.textContent = '';

  if (regions.length === 0) return;

  block.appendChild(createDropdown(regions, currentRegion, showFlags));
  block.classList.add('loaded');
}

// Exports
export { detectCurrentRegion, generateRegionURL, CONFIG };
