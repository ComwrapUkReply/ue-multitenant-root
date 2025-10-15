/**
 * Smart Language Switcher for Universal Editor Multisite
 * Handles intelligent URL mapping between different locales
 * Based on the lang-switcher implementation from asthabh23/lang-switcher
 */

// Configuration for supported locales based on your multisite setup
const LOCALES_CONFIG = {
  'ch-de': { path: '/ch/de/', label: 'Deutsch (CH)', flag: '🇨🇭' },
  'ch-fr': { path: '/ch/fr/', label: 'Français (CH)', flag: '🇨🇭' },
  'ch-en': { path: '/ch/en/', label: 'English (CH)', flag: '🇨🇭' },
  'de-en': { path: '/de/en/', label: 'English (DE)', flag: '🇩🇪' },
  'de-de': {
    path: '/de/de/', label: 'Deutsch (DE)', flag: '🇩🇪', default: true,
  },
};

// Cache for language mappings
let languageMappingsCache = null;

/**
 * Detects the current language from the URL path
 * Handles both AEM authoring URLs and published site URLs
 * @returns {string} The detected language code (e.g., 'ch-de', 'de-de')
 */
export function getLanguage() {
  const { pathname } = window.location;

  // Check if we're in AEM authoring environment
  const isAEMAuthoring = pathname.includes('/content/ue-multitenant-root/');

  if (isAEMAuthoring) {
    // Handle AEM authoring URLs like /content/ue-multitenant-root/ch/de/index.html
    const match = pathname.match(/\/content\/ue-multitenant-root\/([^/]+)\/([^/]+)/);
    if (match) {
      const [, country, language] = match;
      const localeCode = `${country}-${language}`;
      if (LOCALES_CONFIG[localeCode]) {
        return localeCode;
      }
    }
  } else {
    // Handle published site URLs like /ch/de/
    const locales = Object.entries(LOCALES_CONFIG);
    // eslint-disable-next-line no-restricted-syntax
    for (const [localeCode, config] of locales) {
      if (pathname.startsWith(config.path)) {
        return localeCode;
      }
    }
  }

  // Return default locale if no match found
  const defaultLocale = Object.entries(LOCALES_CONFIG)
    .find(([, config]) => config.default);
  return defaultLocale ? defaultLocale[0] : 'de-de';
}

/**
 * Gets the current page path without the language prefix
 * Handles both AEM authoring URLs and published site URLs
 * @returns {string} The page path without language prefix
 */
export function getCurrentPagePath() {
  const { pathname } = window.location;
  const currentLang = getLanguage();
  const langConfig = LOCALES_CONFIG[currentLang];

  // Check if we're in AEM authoring environment
  const isAEMAuthoring = pathname.includes('/content/ue-multitenant-root/');

  if (isAEMAuthoring) {
    // Handle AEM authoring URLs like /content/ue-multitenant-root/ch/de/page-name.html
    const match = pathname.match(/\/content\/ue-multitenant-root\/[^/]+\/[^/]+\/(.*)$/);
    if (match) {
      let pagePath = match[1];
      // Remove .html extension and handle index pages
      if (pagePath.endsWith('.html')) {
        pagePath = pagePath.substring(0, pagePath.length - 5);
      }
      if (pagePath === 'index' || pagePath === '') {
        return '';
      }
      return pagePath;
    }
    return '';
  }
  // Handle published site URLs like /ch/de/page-name
  if (langConfig && pathname.startsWith(langConfig.path)) {
    const pagePath = pathname.substring(langConfig.path.length);
    return pagePath || '';
  }
  return pathname.substring(1); // Remove leading slash
}

/**
 * Fetches language mappings from placeholders.json
 * @returns {Promise<Object>} The language mappings object
 */
async function fetchLanguageMappings() {
  if (languageMappingsCache) {
    return languageMappingsCache;
  }

  try {
    // Determine the correct placeholders URL based on environment
    const { pathname } = window.location;
    const isAEMAuthoring = pathname.includes('/content/ue-multitenant-root/');

    const placeholdersUrl = isAEMAuthoring
      ? '/content/ue-multitenant-root/placeholders.json'
      : '/placeholders.json';

    // eslint-disable-next-line no-console
    console.log('Fetching language mappings from:', placeholdersUrl);

    const response = await fetch(placeholdersUrl);
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.warn(`Language mappings not found at ${placeholdersUrl}, using fallback logic`);
      return {};
    }

    const data = await response.json();
    const mappings = {};

    // Convert the data structure to a more usable format
    if (data.data) {
      data.data.forEach((row) => {
        // Handle 'source/target'
        const { source, target } = row;
        if (source && target) {
          mappings[source] = target;
        }
      });
    }

    // eslint-disable-next-line no-console
    console.log('Loaded language mappings:', Object.keys(mappings).length, 'entries');
    // eslint-disable-next-line no-console
    console.log('Sample mappings:', Object.entries(mappings).slice(0, 3));

    languageMappingsCache = mappings;
    return mappings;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching language mappings:', error);
    return {};
  }
}

/**
 * Finds the mapped URL for a given source URL and target language
 * @param {string} sourceUrl - The source URL to map (can be authoring or published)
 * @param {string} targetLang - The target language code
 * @param {Object} mappings - The language mappings object
 * @returns {string|null} The mapped URL or null if not found
 */
function findMappedUrl(sourceUrl, targetLang, mappings) {
  // Look for exact match in mappings - sourceUrl is already the full path
  const mappingEntries = Object.entries(mappings);

  // eslint-disable-next-line no-restricted-syntax
  for (const [source, target] of mappingEntries) {
    if (source === sourceUrl) {
      return target;
    }
  }

  // Look for reverse mapping (if we're on a target page, find the source)
  // eslint-disable-next-line no-restricted-syntax
  for (const [source, target] of mappingEntries) {
    if (target === sourceUrl) {
      // Find the corresponding mapping for the target language
      const [targetCountry, targetLanguage] = targetLang.split('-');
      const targetPrefix = `/content/ue-multitenant-root/${targetCountry}/${targetLanguage}/`;
      const targetPrefixPublished = `/${targetCountry}/${targetLanguage}/`;

      // Try to find a mapping that starts with the target language path
      // eslint-disable-next-line no-restricted-syntax
      for (const [mapSource, mapTarget] of mappingEntries) {
        if ((mapSource.startsWith(targetPrefix) || mapSource.startsWith(targetPrefixPublished))
            && mapTarget === source) {
          return mapSource;
        }
      }
    }
  }

  return null;
}

/**
 * Switches to the specified language
 * @param {string} targetLang - The target language code
 * @returns {Promise<void>}
 */
export async function switchToLanguage(targetLang) {
  if (!LOCALES_CONFIG[targetLang]) {
    // eslint-disable-next-line no-console
    console.error(`Unsupported language: ${targetLang}`);
    return;
  }

  const currentLang = getLanguage();
  if (currentLang === targetLang) {
    return; // Already on the target language
  }

  const { pathname } = window.location;
  const isAEMAuthoring = pathname.includes('/content/ue-multitenant-root/');
  const currentPath = getCurrentPagePath();

  // Fetch mappings for both authoring and published environments
  const mappings = await fetchLanguageMappings();

  let targetUrl;

  if (isAEMAuthoring) {
    // Build AEM authoring URL using placeholders mappings
    const [currentCountry, currentLanguage] = currentLang.split('-');
    const [targetCountry, targetLanguage] = targetLang.split('-');

    // Construct current full authoring path
    let currentFullPath;
    if (currentPath === '' || currentPath === 'index') {
      currentFullPath = `/content/ue-multitenant-root/${currentCountry}/${currentLanguage}/index.html`;
    } else {
      currentFullPath = `/content/ue-multitenant-root/${currentCountry}/${currentLanguage}/${currentPath}.html`;
    }

    // eslint-disable-next-line no-console
    console.log('=== AEM Authoring Language Switch Debug ===');
    // eslint-disable-next-line no-console
    console.log('Current lang:', currentLang);
    // eslint-disable-next-line no-console
    console.log('Target lang:', targetLang);
    // eslint-disable-next-line no-console
    console.log('Current path:', currentPath);
    // eslint-disable-next-line no-console
    console.log('Current full path:', currentFullPath);
    // eslint-disable-next-line no-console
    console.log('Available mappings:', mappings);

    // Try to find mapped URL in placeholders
    const mappedUrl = findMappedUrl(currentFullPath, targetLang, mappings);

    // eslint-disable-next-line no-console
    console.log('Mapped URL found:', mappedUrl);

    if (mappedUrl) {
      // Use the mapped URL from placeholders
      targetUrl = mappedUrl;
    } else {
      // Fallback: construct URL using same page name (may not exist)
      const basePath = `/content/ue-multitenant-root/${targetCountry}/${targetLanguage}`;
      if (currentPath === '' || currentPath === 'index') {
        targetUrl = `${basePath}/index.html`;
      } else {
        targetUrl = `${basePath}/${currentPath}.html`;
      }
      // eslint-disable-next-line no-console
      console.warn(`No mapping found for ${currentFullPath} to ${targetLang}, using fallback: ${targetUrl}`);
    }
  } else {
    // Build published site URL
    const currentLangPath = LOCALES_CONFIG[currentLang]?.path || '/';
    const currentFullPath = currentLangPath + currentPath;

    // Try to find a mapped URL
    const mappedUrl = findMappedUrl(currentFullPath, targetLang, mappings);

    if (mappedUrl) {
      // Use the mapped URL
      targetUrl = mappedUrl;
    } else {
      // Fallback: construct URL using the target language path
      const targetConfig = LOCALES_CONFIG[targetLang];
      targetUrl = targetConfig.path + currentPath;
    }

    // Handle homepage special case
    if (currentPath === '' || currentPath === '/') {
      targetUrl = LOCALES_CONFIG[targetLang].path;
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Switching from ${currentLang} to ${targetLang}:`);
  // eslint-disable-next-line no-console
  console.log(`Current path: ${currentPath}`);
  // eslint-disable-next-line no-console
  console.log(`Target URL: ${targetUrl}`);

  // Navigate to the target URL
  window.location.href = targetUrl;
}

/**
 * Gets all available languages with their configurations
 * @returns {Array} Array of language objects with code, label, flag, and current status
 */
export function getAvailableLanguages() {
  const currentLang = getLanguage();

  return Object.entries(LOCALES_CONFIG).map(([code, config]) => ({
    code,
    label: config.label,
    flag: config.flag,
    path: config.path,
    isCurrent: code === currentLang,
    isDefault: config.default || false,
  }));
}

/**
 * Creates a language switcher dropdown element
 * @param {HTMLElement} container - The container element to append the switcher to
 * @returns {HTMLElement} The created language switcher element
 */
export function createLanguageSwitcher(container) {
  const currentLang = getLanguage();
  const currentConfig = LOCALES_CONFIG[currentLang];
  const availableLanguages = getAvailableLanguages();

  // Create the main switcher container
  const switcher = document.createElement('div');
  switcher.className = 'language-switcher';

  // Create the current language button
  const currentButton = document.createElement('button');
  currentButton.className = 'language-switcher-current';
  currentButton.innerHTML = `
    <span class="flag">${currentConfig.flag}</span>
    <span class="label">${currentConfig.label}</span>
    <span class="arrow">▼</span>
  `;

  // Create the dropdown menu
  const dropdown = document.createElement('div');
  dropdown.className = 'language-switcher-dropdown';

  availableLanguages.forEach((lang) => {
    if (!lang.isCurrent) {
      const option = document.createElement('button');
      option.className = 'language-switcher-option';
      option.innerHTML = `
        <span class="flag">${lang.flag}</span>
        <span class="label">${lang.label}</span>
      `;

      option.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await switchToLanguage(lang.code);
      });

      dropdown.appendChild(option);
    }
  });

  // Toggle dropdown on current button click
  currentButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    switcher.classList.toggle('open');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!switcher.contains(e.target)) {
      switcher.classList.remove('open');
    }
  });

  // Assemble the switcher
  switcher.appendChild(currentButton);
  switcher.appendChild(dropdown);

  if (container) {
    container.appendChild(switcher);
  }

  return switcher;
}

/**
 * Initializes the language switcher in the header
 * This function is called from the header block
 */
export function initializeLanguageSwitcher() {
  // Look for a nav-tools section in the header
  const navTools = document.querySelector('.nav-tools');
  if (!navTools) {
    console.warn('Nav tools section not found, cannot initialize language switcher');
    return;
  }

  // Check if language switcher already exists
  if (navTools.querySelector('.language-switcher')) {
    return; // Already initialized
  }

  // Create and add the language switcher
  const switcher = createLanguageSwitcher();
  navTools.appendChild(switcher);

  console.log('Language switcher initialized successfully');
}

/**
 * Legacy function for compatibility with the original implementation
 * @param {string} targetLanguage - The target language code
 */
export function switchLanguage(targetLanguage) {
  return switchToLanguage(targetLanguage);
}
