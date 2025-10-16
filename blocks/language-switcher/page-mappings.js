/**
 * Page Mappings Configuration for Language Switcher
 * Define how pages map between different locales
 */

export const PAGE_MAPPINGS = {
  // Swiss French (ch-fr) page mappings
  'ch-fr': {
    'a-propos': {
      'de-de': 'ueber-uns-de',
      'de-en': 'about-us',
      'ch-de': 'ueber-uns',
      'ch-en': 'about',
    },
    contact: {
      'de-de': 'kontakt',
      'de-en': 'contact',
      'ch-de': 'kontakt',
      'ch-en': 'contact',
    },
    services: {
      'de-de': 'dienstleistungen',
      'de-en': 'services',
      'ch-de': 'dienstleistungen',
      'ch-en': 'services',
    },
    actualites: {
      'de-de': 'nachrichten',
      'de-en': 'news',
      'ch-de': 'nachrichten',
      'ch-en': 'news',
    },
    produits: {
      'de-de': 'produkte',
      'de-en': 'products',
      'ch-de': 'produkte',
      'ch-en': 'products',
    },
  },

  // Swiss German (ch-de) page mappings
  'ch-de': {
    'ueber-uns': {
      'ch-fr': 'a-propos',
      'de-de': 'ueber-uns-de',
      'de-en': 'about-us',
      'ch-en': 'about-us',
    },
    kontakt: {
      'ch-fr': 'contact',
      'de-de': 'kontakt',
      'de-en': 'contact',
      'ch-en': 'contact',
    },
    dienstleistungen: {
      'ch-fr': 'services',
      'de-de': 'dienstleistungen',
      'de-en': 'services',
      'ch-en': 'services',
    },
    nachrichten: {
      'ch-fr': 'actualites',
      'de-de': 'nachrichten',
      'de-en': 'news',
      'ch-en': 'news',
    },
    produkte: {
      'ch-fr': 'produits',
      'de-de': 'produkte',
      'de-en': 'products',
      'ch-en': 'products',
    },
  },

  // Swiss English (ch-en) page mappings
  'ch-en': {
    'about-us': {
      'ch-fr': 'a-propos',
      'ch-de': 'ueber-uns',
      'de-de': 'ueber-uns-de',
      'de-en': 'about-us',
    },
    contact: {
      'ch-fr': 'contact',
      'ch-de': 'kontakt',
      'de-de': 'kontakt',
      'de-en': 'contact',
    },
    services: {
      'ch-fr': 'services',
      'ch-de': 'dienstleistungen',
      'de-de': 'dienstleistungen',
      'de-en': 'services',
    },
    news: {
      'ch-fr': 'actualites',
      'ch-de': 'nachrichten',
      'de-de': 'nachrichten',
      'de-en': 'news',
    },
    products: {
      'ch-fr': 'produits',
      'ch-de': 'produkte',
      'de-de': 'produkte',
      'de-en': 'products',
    },
  },

  // German German (de-de) page mappings
  'de-de': {
    'ueber-uns-de': {
      'ch-fr': 'a-propos',
      'ch-de': 'ueber-uns',
      'ch-en': 'about-us',
      'de-en': 'about-us',
    },
    kontakt: {
      'ch-fr': 'contact',
      'ch-de': 'kontakt',
      'ch-en': 'contact',
      'de-en': 'contact',
    },
    dienstleistungen: {
      'ch-fr': 'services',
      'ch-de': 'dienstleistungen',
      'ch-en': 'services',
      'de-en': 'services',
    },
    nachrichten: {
      'ch-fr': 'actualites',
      'ch-de': 'nachrichten',
      'ch-en': 'news',
      'de-en': 'news',
    },
    produkte: {
      'ch-fr': 'produits',
      'ch-de': 'produkte',
      'ch-en': 'products',
      'de-en': 'products',
    },
  },

  // German English (de-en) page mappings
  'de-en': {
    'about-us': {
      'ch-fr': 'a-propos',
      'ch-de': 'ueber-uns',
      'ch-en': 'about-us',
      'de-de': 'ueber-uns-de',
    },
    contact: {
      'ch-fr': 'contact',
      'ch-de': 'kontakt',
      'ch-en': 'contact',
      'de-de': 'kontakt',
    },
    services: {
      'ch-fr': 'services',
      'ch-de': 'dienstleistungen',
      'ch-en': 'services',
      'de-de': 'dienstleistungen',
    },
    news: {
      'ch-fr': 'actualites',
      'ch-de': 'nachrichten',
      'ch-en': 'news',
      'de-de': 'nachrichten',
    },
    products: {
      'ch-fr': 'produits',
      'ch-de': 'produkte',
      'ch-en': 'products',
      'de-de': 'produkte',
    },
  },
};

/**
 * Custom labels for locales (optional)
 */
export const CUSTOM_LABELS = {
  'ch-de': 'Schweiz (DE)',
  'ch-fr': 'Suisse (FR)',
  'ch-en': 'Switzerland (EN)',
  'de-de': 'Deutschland (DE)',
  'de-en': 'Germany (EN)',
};

/**
 * Gets page mappings as JSON string for block configuration
 * @returns {string} JSON string of page mappings
 */
export function getPageMappingsJSON() {
  return JSON.stringify(PAGE_MAPPINGS);
}

/**
 * Gets custom labels as JSON string for block configuration
 * @returns {string} JSON string of custom labels
 */
export function getCustomLabelsJSON() {
  return JSON.stringify(CUSTOM_LABELS);
}
