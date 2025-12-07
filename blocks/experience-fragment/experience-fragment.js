/**
 * Experience Fragment Block
 * Include content from an experience fragment page.
 * Unlike the standard fragment block, this loads ALL sections from the fragment.
 * Fragments with names starting with 'nav' can replace the header navigation.
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Configuration for experience fragment block
 * @type {Object}
 */
const CONFIG = {
  selectors: {
    link: 'a',
    section: ':scope .section',
  },
  patterns: {
    htmlExtension: /(\.plain)?\.html/,
    mediaPath: './media_',
  },
};

/**
 * Resets the base path for media elements within a container
 * @param {HTMLElement} container - The container element
 * @param {string} tag - HTML tag to select
 * @param {string} attr - Attribute containing the path
 * @param {string} basePath - Base path for relative URLs
 */
function resetAttributeBase(container, tag, attr, basePath) {
  container.querySelectorAll(`${tag}[${attr}^="${CONFIG.patterns.mediaPath}"]`).forEach((elem) => {
    const attrValue = elem.getAttribute(attr);
    if (attrValue) {
      elem[attr] = new URL(attrValue, new URL(basePath, window.location)).href;
    }
  });
}

/**
 * Loads an experience fragment with all its sections.
 * @param {string} path - The path to the fragment
 * @returns {Promise<HTMLElement|null>} The root element of the fragment or null
 */
export async function loadExperienceFragment(path) {
  if (!path || !path.startsWith('/')) {
    return null;
  }

  // Clean path by removing any .html extension
  const cleanPath = path.replace(CONFIG.patterns.htmlExtension, '');

  try {
    const resp = await fetch(`${cleanPath}.plain.html`);
    if (!resp.ok) {
      return null;
    }

    const main = document.createElement('main');
    main.innerHTML = await resp.text();

    // Reset base path for media to fragment base
    resetAttributeBase(main, 'img', 'src', cleanPath);
    resetAttributeBase(main, 'source', 'srcset', cleanPath);

    decorateMain(main);
    await loadSections(main);
    return main;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to load experience fragment:', error);
    return null;
  }
}

/**
 * Checks if a fragment path indicates a navigation fragment
 * @param {string} path - The fragment path
 * @returns {boolean} True if the fragment name starts with 'nav'
 */
export function isNavFragment(path) {
  if (!path) {
    return false;
  }
  const fragmentName = path.split('/').pop();
  return fragmentName?.toLowerCase().startsWith('nav');
}

/**
 * Extracts the fragment path from the block
 * @param {HTMLElement} block - The block element
 * @returns {string|null} The fragment path or null
 */
function getFragmentPath(block) {
  const link = block.querySelector(CONFIG.selectors.link);
  if (link) {
    return link.getAttribute('href');
  }
  const textContent = block.textContent.trim();
  return textContent || null;
}

/**
 * Decorates the experience fragment block.
 * @param {HTMLElement} block - The block element
 */
export default async function decorate(block) {
  const path = getFragmentPath(block);
  if (!path) {
    return;
  }

  const fragment = await loadExperienceFragment(path);
  if (!fragment) {
    return;
  }

  // Get all sections from the fragment
  const fragmentSections = fragment.querySelectorAll(CONFIG.selectors.section);
  if (fragmentSections.length === 0) {
    return;
  }

  // Clear the block and add all sections
  block.textContent = '';

  fragmentSections.forEach((section) => {
    // Clone section classes to block if it's the first section
    if (section === fragmentSections[0]) {
      block.classList.add(...section.classList);
      block.classList.remove('section');
    }

    // Create a wrapper for each section's content
    const sectionWrapper = document.createElement('div');
    sectionWrapper.className = 'experience-fragment-section';
    sectionWrapper.append(...section.childNodes);
    block.append(sectionWrapper);
  });
}

