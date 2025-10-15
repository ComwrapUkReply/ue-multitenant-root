import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { createLanguageSwitcher } from '../../scripts/language-switcher.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Creates a language switcher for the header using the block's implementation
 * @returns {Promise<HTMLElement|null>} The language switcher element
 */
async function createHeaderLanguageSwitcher() {
  try {
    // Dynamically import the language switcher utilities
    const {
      switchToLanguage,
      getAvailableLanguages,
    } = await import('../../scripts/language-switcher.js');

    const availableLanguages = getAvailableLanguages();

    // Default configuration for header
    const config = {
      supportedLocales: ['ch-de', 'ch-fr', 'ch-en', 'de-de', 'de-en'],
      displayStyle: 'dropdown',
      fallbackLocale: 'de-de',
      showCountryFlags: true,
      preservePath: true,
    };

    const filteredLanguages = availableLanguages.filter((lang) =>
      config.supportedLocales.includes(lang.code));

    const currentLanguage = filteredLanguages.find((lang) => lang.isCurrent)
      || filteredLanguages.find((lang) => lang.code === config.fallbackLocale)
      || filteredLanguages[0];

    if (!currentLanguage) {
      // eslint-disable-next-line no-console
      console.warn('No current language found for language switcher');
      return null;
    }

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

    filteredLanguages.forEach(async (lang) => {
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
      const isOpen = open !== undefined ? open
        : currentButton.getAttribute('aria-expanded') === 'false';

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

    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && switcher.classList.contains('open')) {
        toggleDropdown(false);
        currentButton.focus();
      }
    });

    switcher.appendChild(currentButton);
    switcher.appendChild(dropdown);

    return switcher;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create language switcher:', error);
    return null;
  }
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  // Initialize language switcher in nav-tools
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    // Check if language switcher should be added automatically
    // Look for a placeholder paragraph or specific content that indicates language switcher
    const languagePlaceholder = navTools.querySelector('p');
    if (languagePlaceholder
        && (languagePlaceholder.textContent.toLowerCase().includes('language')
         || languagePlaceholder.textContent.toLowerCase().includes('lang'))) {
      // Replace the placeholder with the actual language switcher
      const languageSwitcher = await createHeaderLanguageSwitcher();
      if (languageSwitcher) {
        languagePlaceholder.replaceWith(languageSwitcher);
      }
    } else if (!navTools.querySelector('.language-switcher')) {
      // Add language switcher if not already present and no specific placeholder
      const languageSwitcher = await createHeaderLanguageSwitcher();
      if (languageSwitcher) {
        navTools.appendChild(languageSwitcher);
      }
    }
  }

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
