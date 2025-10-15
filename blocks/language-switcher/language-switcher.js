/**
 * Language Switcher Block Implementation
 * Provides a configurable language switching component for Universal Editor
 */

import {
  getLanguage,
  switchToLanguage,
  getAvailableLanguages,
} from '../../scripts/language-switcher.js';

/**
 * Extracts configuration from block content
 * @param {HTMLElement} block - The block DOM element
 * @returns {Object} Configuration object
 */
function extractBlockConfig(block) {
  const config = {
    supportedLocales: ['ch-de', 'ch-fr', 'ch-en', 'de-de', 'de-en'],
    displayStyle: 'dropdown',
    fallbackLocale: 'de-de',
    showCountryFlags: true,
    preservePath: true,
  };

  // Extract configuration from block content if available
  const configRows = block.querySelectorAll(':scope > div');
  configRows.forEach((row) => {
    const cells = row.querySelectorAll('div');
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim();
      const value = cells[1].textContent.trim();

      switch (key.toLowerCase()) {
        case 'supportedlocales':
          config.supportedLocales = value.split(',').map((s) => s.trim());
          break;
        case 'displaystyle':
          config.displayStyle = value;
          break;
        case 'fallbacklocale':
          config.fallbackLocale = value;
          break;
        case 'showcountryflags':
          config.showCountryFlags = value.toLowerCase() === 'true';
          break;
        case 'preservepath':
          config.preservePath = value.toLowerCase() === 'true';
          break;
        default:
          // No action needed for unknown keys
          break;
      }
    }
  });

  return config;
}

/**
 * Creates a dropdown-style language switcher
 * @param {Object} config - Configuration object
 * @returns {HTMLElement} The dropdown switcher element
 */
function createDropdownSwitcher(config) {
  const availableLanguages = getAvailableLanguages()
    .filter((lang) => config.supportedLocales.includes(lang.code));

  const currentLanguage = availableLanguages.find((lang) => lang.isCurrent)
    || availableLanguages.find((lang) => lang.code === config.fallbackLocale)
    || availableLanguages[0];

  const switcher = document.createElement('div');
  switcher.className = 'language-switcher-dropdown-container';

  // Current language button
  const currentButton = document.createElement('button');
  currentButton.className = 'language-switcher-current';
  currentButton.setAttribute('aria-expanded', 'false');
  currentButton.setAttribute('aria-haspopup', 'true');
  
  const buttonContent = [];
  if (config.showCountryFlags) {
    buttonContent.push(`<span class="language-flag">${currentLanguage.flag}</span>`);
  }
  buttonContent.push(`<span class="language-label">${currentLanguage.label}</span>`);
  buttonContent.push('<span class="language-arrow" aria-hidden="true">▼</span>');
  
  currentButton.innerHTML = buttonContent.join('');

  // Dropdown menu
  const dropdown = document.createElement('ul');
  dropdown.className = 'language-switcher-dropdown';
  dropdown.setAttribute('role', 'menu');
  dropdown.setAttribute('aria-hidden', 'true');

  availableLanguages.forEach((lang) => {
    if (!lang.isCurrent) {
      const listItem = document.createElement('li');
      listItem.setAttribute('role', 'none');

      const option = document.createElement('a');
      option.className = 'language-switcher-option';
      option.setAttribute('role', 'menuitem');
      option.setAttribute('aria-label', `Switch to ${lang.label}`);
      option.href = '#'; // Temporary href to make it focusable

      const optionContent = [];
      if (config.showCountryFlags) {
        optionContent.push(`<span class="language-flag">${lang.flag}</span>`);
      }
      optionContent.push(`<span class="language-label">${lang.label}</span>`);

      option.innerHTML = optionContent.join('');

      option.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await switchToLanguage(lang.code);
      });

      listItem.appendChild(option);
      dropdown.appendChild(listItem);
    }
  });

  // Toggle functionality
  const toggleDropdown = (open) => {
    const isOpen = open !== undefined ? open : currentButton.getAttribute('aria-expanded') === 'false';

    // Update ARIA attributes
    currentButton.setAttribute('aria-expanded', isOpen.toString());
    dropdown.setAttribute('aria-hidden', (!isOpen).toString());

    // Toggle the open class on the container
    if (isOpen) {
      switcher.classList.add('open');
    } else {
      switcher.classList.remove('open');
    }
  };

  currentButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleDropdown();
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!switcher.contains(e.target)) {
      toggleDropdown(false);
    }
  });

  // Keyboard navigation
  currentButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown();
    } else if (e.key === 'Escape') {
      toggleDropdown(false);
    }
  });

  switcher.appendChild(currentButton);
  switcher.appendChild(dropdown);

  return switcher;
}

/**
 * Creates an inline-style language switcher
 * @param {Object} config - Configuration object
 * @returns {HTMLElement} The inline switcher element
 */
function createInlineSwitcher(config) {
  const availableLanguages = getAvailableLanguages()
    .filter(lang => config.supportedLocales.includes(lang.code));

  const switcher = document.createElement('div');
  switcher.className = 'language-switcher-inline-container';

  const list = document.createElement('ul');
  list.className = 'language-switcher-inline';
  list.setAttribute('role', 'list');

  availableLanguages.forEach((lang, index) => {
    const listItem = document.createElement('li');
    listItem.setAttribute('role', 'listitem');
    
    if (lang.isCurrent) {
      const currentSpan = document.createElement('span');
      currentSpan.className = 'language-switcher-current-inline';
      currentSpan.setAttribute('aria-current', 'page');
      
      const content = [];
      if (config.showCountryFlags) {
        content.push(`<span class="language-flag">${lang.flag}</span>`);
      }
      content.push(`<span class="language-label">${lang.label}</span>`);
      
      currentSpan.innerHTML = content.join('');
      listItem.appendChild(currentSpan);
    } else {
      const link = document.createElement('button');
      link.className = 'language-switcher-link';
      link.setAttribute('aria-label', `Switch to ${lang.label}`);
      
      const content = [];
      if (config.showCountryFlags) {
        content.push(`<span class="language-flag">${lang.flag}</span>`);
      }
      content.push(`<span class="language-label">${lang.label}</span>`);
      
      link.innerHTML = content.join('');
      
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        await switchToLanguage(lang.code);
      });
      
      listItem.appendChild(link);
    }

    // Add separator between items (except for the last item)
    if (index < availableLanguages.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'language-separator';
      separator.setAttribute('aria-hidden', 'true');
      separator.textContent = '|';
      listItem.appendChild(separator);
    }

    list.appendChild(listItem);
  });

  switcher.appendChild(list);
  return switcher;
}

/**
 * Creates a flag-only style language switcher
 * @param {Object} config - Configuration object
 * @returns {HTMLElement} The flags switcher element
 */
function createFlagsSwitcher(config) {
  const availableLanguages = getAvailableLanguages()
    .filter(lang => config.supportedLocales.includes(lang.code));

  const switcher = document.createElement('div');
  switcher.className = 'language-switcher-flags-container';

  const list = document.createElement('ul');
  list.className = 'language-switcher-flags';
  list.setAttribute('role', 'list');

  availableLanguages.forEach(lang => {
    const listItem = document.createElement('li');
    listItem.setAttribute('role', 'listitem');
    
    if (lang.isCurrent) {
      const currentSpan = document.createElement('span');
      currentSpan.className = 'language-switcher-flag-current';
      currentSpan.setAttribute('aria-current', 'page');
      currentSpan.setAttribute('aria-label', `Current language: ${lang.label}`);
      currentSpan.innerHTML = `<span class="language-flag">${lang.flag}</span>`;
      listItem.appendChild(currentSpan);
    } else {
      const button = document.createElement('button');
      button.className = 'language-switcher-flag-button';
      button.setAttribute('aria-label', `Switch to ${lang.label}`);
      button.innerHTML = `<span class="language-flag">${lang.flag}</span>`;
      
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        await switchToLanguage(lang.code);
      });
      
      listItem.appendChild(button);
    }

    list.appendChild(listItem);
  });

  switcher.appendChild(list);
  return switcher;
}

/**
 * Main decoration function for the language switcher block
 * @param {HTMLElement} block - The block DOM element
 */
export default function decorate(block) {
  // Extract configuration from block content
  const config = extractBlockConfig(block);
  
  // Clear the block content
  block.innerHTML = '';
  
  // Add semantic classes
  block.classList.add('language-switcher-block');
  
  // Create the appropriate switcher based on display style
  let switcher;
  switch (config.displayStyle) {
    case 'inline':
      switcher = createInlineSwitcher(config);
      break;
    case 'flags':
      switcher = createFlagsSwitcher(config);
      break;
    case 'dropdown':
    default:
      switcher = createDropdownSwitcher(config);
      break;
  }
  
  // Apply additional classes from block options
  const blockOptions = [...block.classList].filter(cls => 
    !['block', 'language-switcher', 'language-switcher-block'].includes(cls)
  );
  
  blockOptions.forEach(option => {
    switcher.classList.add(option);
  });
  
  // Add the switcher to the block
  block.appendChild(switcher);
  
  // Add accessibility enhancements
  block.setAttribute('role', 'navigation');
  block.setAttribute('aria-label', 'Language switcher');
  
  // Add debug function for testing
  if (window.location.hostname.includes('localhost') || window.location.hostname.includes('aem.page')) {
    window.testLanguageSwitcherDropdown = () => {
      const button = switcher.querySelector('.language-switcher-current');
      const dropdown = switcher.querySelector('.language-switcher-dropdown');
      const container = switcher.closest('.language-switcher-dropdown-container');

      // eslint-disable-next-line no-console
      console.group('🔧 Language Switcher Dropdown Debug');
      // eslint-disable-next-line no-console
      console.log('Button element:', button);
      // eslint-disable-next-line no-console
      console.log('Dropdown element:', dropdown);
      // eslint-disable-next-line no-console
      console.log('Container element:', container);
      // eslint-disable-next-line no-console
      console.log('Container has open class:', container?.classList.contains('open'));
      // eslint-disable-next-line no-console
      console.log('Button aria-expanded:', button?.getAttribute('aria-expanded'));
      // eslint-disable-next-line no-console
      console.log('Dropdown aria-hidden:', dropdown?.getAttribute('aria-hidden'));

      if (button) {
        // eslint-disable-next-line no-console
        console.log('Triggering button click...');
        button.click();

        setTimeout(() => {
          // eslint-disable-next-line no-console
          console.log('After click - Container has open class:', container?.classList.contains('open'));
          // eslint-disable-next-line no-console
          console.log('After click - Button aria-expanded:', button?.getAttribute('aria-expanded'));
          // eslint-disable-next-line no-console
          console.log('After click - Dropdown aria-hidden:', dropdown?.getAttribute('aria-hidden'));
          // eslint-disable-next-line no-console
          console.log('After click - Dropdown computed visibility:', getComputedStyle(dropdown).visibility);
          // eslint-disable-next-line no-console
          console.log('After click - Dropdown computed opacity:', getComputedStyle(dropdown).opacity);
        }, 100);
      }
      // eslint-disable-next-line no-console
      console.groupEnd();
    };
  }
}
