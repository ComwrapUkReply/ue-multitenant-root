/**
 * Debug utility for testing language switcher functionality
 * Add this script to any page to test language detection and switching
 */

import { getLanguage, getCurrentPagePath, getAvailableLanguages } from './scripts/language-switcher.js';

// Debug function to test language detection
window.debugLanguageSwitcher = function() {
  console.group('🌍 Language Switcher Debug');
  
  const currentUrl = window.location.href;
  const pathname = window.location.pathname;
  const detectedLanguage = getLanguage();
  const currentPath = getCurrentPagePath();
  const availableLanguages = getAvailableLanguages();
  const isAEMAuthoring = pathname.includes('/content/ue-multitenant-root/');
  
  console.log('📍 Current URL:', currentUrl);
  console.log('📍 Pathname:', pathname);
  console.log('🏷️ Is AEM Authoring:', isAEMAuthoring);
  console.log('🌐 Detected Language:', detectedLanguage);
  console.log('📄 Current Page Path:', currentPath);
  console.log('🗣️ Available Languages:', availableLanguages);
  
  // Test URL patterns
  console.group('🔍 URL Pattern Analysis');
  if (isAEMAuthoring) {
    const match = pathname.match(/\/content\/ue-multitenant-root\/([^\/]+)\/([^\/]+)/);
    if (match) {
      const [, country, language] = match;
      console.log('✅ AEM Pattern Match:', { country, language, combined: `${country}-${language}` });
    } else {
      console.log('❌ AEM Pattern No Match');
    }
  } else {
    console.log('📝 Published Site Pattern');
    const localeConfigs = {
      'ch-de': { path: '/ch/de/' },
      'ch-fr': { path: '/ch/fr/' },
      'ch-en': { path: '/ch/en/' },
      'de-en': { path: '/de/en/' },
      'de-de': { path: '/de/de/' }
    };
    
    for (const [code, config] of Object.entries(localeConfigs)) {
      if (pathname.startsWith(config.path)) {
        console.log('✅ Published Pattern Match:', { code, path: config.path });
        break;
      }
    }
  }
  console.groupEnd();
  
  // Test switching URLs
  console.group('🔄 Switch URL Generation');
  availableLanguages.forEach(lang => {
    if (!lang.isCurrent) {
      const [targetCountry, targetLanguage] = lang.code.split('-');
      let targetUrl;
      
      if (isAEMAuthoring) {
        const basePath = `/content/ue-multitenant-root/${targetCountry}/${targetLanguage}`;
        if (currentPath === '' || currentPath === 'index') {
          targetUrl = `${basePath}/index.html`;
        } else {
          targetUrl = `${basePath}/${currentPath}.html`;
        }
      } else {
        targetUrl = lang.path + currentPath;
      }
      
      console.log(`🔗 ${lang.code} (${lang.label}):`, targetUrl);
    }
  });
  console.groupEnd();
  
  console.groupEnd();
  
  return {
    currentUrl,
    pathname,
    isAEMAuthoring,
    detectedLanguage,
    currentPath,
    availableLanguages
  };
};

// Auto-run debug on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Language Switcher Debug Loaded - Run debugLanguageSwitcher() to test');
});

// Export for manual testing
export { debugLanguageSwitcher };
