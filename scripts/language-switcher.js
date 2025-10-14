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
  'de-de': { path: '/de/de/', label: 'Deutsch (DE)', flag: '🇩🇪', default: true }
};

// Cache for language mappings
let languageMappingsCache = null;

/**
 * Detects the current language from the URL path
 * @returns {string} The detected language code (e.g., 'ch-de', 'de-de')
 */
export function getLanguage() {
  const { pathname } = window.location;
  
  // Check each locale configuration
  for (const [localeCode, config] of Object.entries(LOCALES_CONFIG)) {
    if (pathname.startsWith(config.path)) {
      return localeCode;
    }
  }
  
  // Return default locale if no match found
  const defaultLocale = Object.entries(LOCALES_CONFIG)
    .find(([, config]) => config.default);
  return defaultLocale ? defaultLocale[0] : 'de-de';
}

/**
 * Gets the current page path without the language prefix
 * @returns {string} The page path without language prefix
 */
export function getCurrentPagePath() {
  const { pathname } = window.location;
  const currentLang = getLanguage();
  const langConfig = LOCALES_CONFIG[currentLang];
  
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
    const response = await fetch('/placeholders.json?sheet=language-switcher');
    if (!response.ok) {
      console.warn('Language mappings not found, using fallback logic');
      return {};
    }
    
    const data = await response.json();
    const mappings = {};
    
    // Convert the data structure to a more usable format
    if (data.data) {
      data.data.forEach(row => {
        if (row.source && row.target) {
          mappings[row.source] = row.target;
        }
      });
    }
    
    languageMappingsCache = mappings;
    return mappings;
  } catch (error) {
    console.warn('Error fetching language mappings:', error);
    return {};
  }
}

/**
 * Finds the mapped URL for a given source URL and target language
 * @param {string} sourceUrl - The source URL to map
 * @param {string} targetLang - The target language code
 * @param {Object} mappings - The language mappings object
 * @returns {string|null} The mapped URL or null if not found
 */
function findMappedUrl(sourceUrl, targetLang, mappings) {
  const currentLang = getLanguage();
  const currentPath = getCurrentPagePath();
  const currentFullPath = LOCALES_CONFIG[currentLang]?.path + currentPath;
  
  // Look for exact match in mappings
  for (const [source, target] of Object.entries(mappings)) {
    if (source === currentFullPath || source === sourceUrl) {
      return target;
    }
  }
  
  // Look for reverse mapping (if we're on a target page, find the source)
  for (const [source, target] of Object.entries(mappings)) {
    if (target === currentFullPath || target === sourceUrl) {
      // Find the corresponding mapping for the target language
      const targetPath = LOCALES_CONFIG[targetLang]?.path;
      if (targetPath) {
        // Try to find a mapping that starts with the target language path
        for (const [mapSource, mapTarget] of Object.entries(mappings)) {
          if (mapSource.startsWith(targetPath) && mapTarget === source) {
            return mapSource;
          }
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
    console.error(`Unsupported language: ${targetLang}`);
    return;
  }
  
  const currentLang = getLanguage();
  if (currentLang === targetLang) {
    return; // Already on the target language
  }
  
  const mappings = await fetchLanguageMappings();
  const currentPath = getCurrentPagePath();
  const currentFullPath = LOCALES_CONFIG[currentLang]?.path + currentPath;
  
  // Try to find a mapped URL
  const mappedUrl = findMappedUrl(currentFullPath, targetLang, mappings);
  
  let targetUrl;
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
    isDefault: config.default || false
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
  
  availableLanguages.forEach(lang => {
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
