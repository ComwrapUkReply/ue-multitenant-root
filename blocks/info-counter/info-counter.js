/**
 * Info Counter Block
 * Creates an animated counter with number and inline text
 * Animation triggers when block enters viewport and counts from 0 to target
 */

import { isEditorMode as checkEditorMode } from '../../scripts/utils.js';

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  animation: {
    duration: 1000, // Animation duration in milliseconds
    threshold: 0.1, // Intersection Observer threshold (30% visible)
  },
  defaults: {
    targetNumber: 0,
    digit: '0',
  },
};

const SELECTORS = {
  digit: '.info-counter-digit',
  digitValue: '.info-counter-digit-value',
  numberContainer: '.info-counter-number',
};

const CLASSES = {
  digit: 'info-counter-digit',
  digitValue: 'info-counter-digit-value',
  wrapper: 'info-counter-wrapper',
  number: 'info-counter-number',
  text: 'info-counter-text',
  modePrefix: 'info-counter-mode-',
};

const PATTERNS = {
  numberOnly: /^\d+$/,
  extractNumber: /\d+/,
  htmlTags: /<[^>]+>/,
  pWrapper: /^<p[^>]*>.*<\/p>$/i,
  aueAttributes: /\s*data-(aue|richtext)-[^=]*="[^"]*"/g,
};

const DATA_ATTRS = {
  aueProp: 'data-aue-prop',
  aueType: 'data-aue-type',
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Safely parse integer from string
 * @param {string} value - Value to parse
 * @param {number} fallback - Fallback value if parsing fails
 * @returns {number} Parsed integer or fallback
 */
const safeParseInt = (value, fallback = 0) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

/**
 * Extract first number from text string
 * @param {string} text - Text to extract number from
 * @returns {number|null} Extracted number or null
 */
const extractNumber = (text) => {
  if (!text) return null;
  const match = text.match(PATTERNS.extractNumber);
  return match ? safeParseInt(match[0], null) : null;
};

/**
 * Check if text is only digits
 * @param {string} text - Text to check
 * @returns {boolean} True if text contains only digits
 */
const isNumberOnly = (text) => PATTERNS.numberOnly.test(text);

/**
 * Clean HTML string by removing Universal Editor attributes
 * @param {string} html - HTML string to clean
 * @returns {string} Cleaned HTML
 */
const cleanHTML = (html) => {
  if (!html) return '';
  return html.replace(PATTERNS.aueAttributes, '');
};

/**
 * Check if HTML contains Universal Editor attributes
 * @param {string} html - HTML to check
 * @returns {boolean} True if contains UE attributes
 */
const hasUEAttributes = (html) => html?.includes('data-aue-') || html?.includes('data-richtext-');

// =============================================================================
// DOM UTILITIES
// =============================================================================

/**
 * Create element with class name
 * @param {string} tag - HTML tag name
 * @param {string} className - CSS class name
 * @returns {HTMLElement} Created element
 */
const createElement = (tag, className) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  return element;
};

/**
 * Remove Universal Editor attributes from element and children
 * @param {HTMLElement} element - Element to clean
 */
const removeAueAttributes = (element) => {
  if (!element?.attributes) return;

  // Collect attributes to remove
  const attrsToRemove = Array.from(element.attributes)
    .filter((attr) => attr.name.startsWith('data-aue-') || attr.name.startsWith('data-richtext-'))
    .map((attr) => attr.name);

  // Remove collected attributes
  attrsToRemove.forEach((attr) => element.removeAttribute(attr));

  // Recursively clean children
  Array.from(element.children).forEach(removeAueAttributes);
};

// =============================================================================
// ANIMATION FUNCTIONS
// =============================================================================

/**
 * Ease-out cubic function for smooth animation
 * @param {number} progress - Animation progress (0-1)
 * @returns {number} Eased progress value
 */
const easeOutCubic = (progress) => 1 - (1 - progress) ** 3;

/**
 * Update digit elements to display a number
 * @param {NodeList|Array} digits - Collection of digit container elements
 * @param {number} number - Number to display
 */
const updateDigits = (digits, number) => {
  if (!digits?.length) return;

  const numberString = number.toString().padStart(digits.length, CONFIG.defaults.digit);

  digits.forEach((digitContainer, index) => {
    const digitElement = digitContainer.querySelector(SELECTORS.digitValue);
    if (digitElement) {
      digitElement.textContent = numberString[index] || CONFIG.defaults.digit;
    }
  });
};

/**
 * Animate counter from 0 to target number
 * @param {NodeList|Array} digits - Digit elements to animate
 * @param {number} targetNumber - Target number to count to
 * @returns {Promise<void>} Promise that resolves when animation completes
 */
const animateCounter = (digits, targetNumber) => {
  if (!digits?.length) return Promise.resolve();

  return new Promise((resolve) => {
    const startTime = performance.now();
    const { duration } = CONFIG.animation;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentNumber = Math.floor(targetNumber * easedProgress);

      updateDigits(digits, currentNumber);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure final value is exact
        updateDigits(digits, targetNumber);
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
};

// =============================================================================
// CONTENT EXTRACTION
// =============================================================================

/**
 * Process cell content to extract number or text
 * @param {HTMLElement} cell - Cell element to process
 * @returns {Object} Extracted data { number, text, html }
 */
const processCellContent = (cell) => {
  const aueProp = cell.getAttribute(DATA_ATTRS.aueProp);
  const aueType = cell.getAttribute(DATA_ATTRS.aueType);
  const cellText = cell.textContent?.trim() || '';
  const cellHTML = cell.innerHTML?.trim() || '';

  // Empty cell
  if (!cellText && !cellHTML) {
    return { number: null, text: '', html: '' };
  }

  // Number cell
  if (aueProp === 'number' || isNumberOnly(cellText)) {
    return { number: extractNumber(cellText), text: '', html: '' };
  }

  // Rich text cell
  if (aueProp === 'text' || aueType === 'richtext') {
    const tempDiv = createElement('div');
    tempDiv.innerHTML = cellHTML;
    Array.from(tempDiv.children).forEach(removeAueAttributes);

    return {
      number: null,
      text: tempDiv.textContent?.trim() || cellText,
      html: tempDiv.innerHTML?.trim() || cellHTML,
    };
  }

  // Plain text fallback
  return { number: null, text: cellText, html: cellHTML || cellText };
};

/**
 * Extract content from block rows
 * @param {Array<HTMLElement>} rows - Block rows
 * @returns {Object} Extracted content { targetNumber, descriptionText, descriptionHTML }
 */
const extractContent = (rows) => {
  const result = {
    targetNumber: null,
    descriptionText: '',
    descriptionHTML: '',
  };

  if (!rows?.length) return result;

  // Process first row cells
  const firstRow = rows[0];
  const cells = firstRow?.children ? [...firstRow.children] : [];

  cells.forEach((cell) => {
    const { number, text, html } = processCellContent(cell);

    if (number !== null && result.targetNumber === null) {
      result.targetNumber = number;
    }

    if (text && !result.descriptionText) {
      result.descriptionText = text;
      result.descriptionHTML = html;
    }
  });

  // Fallback: check other rows for text
  if (!result.descriptionText && rows.length > 1) {
    for (let i = 1; i < rows.length; i += 1) {
      const rowText = rows[i].textContent?.trim() || '';
      const rowHTML = rows[i].innerHTML?.trim() || '';

      if (rowText && !isNumberOnly(rowText)) {
        result.descriptionText = rowText;
        result.descriptionHTML = rowHTML || rowText;
        break;
      }
    }
  }

  // Final fallback: extract from all content
  if (result.targetNumber === null || !result.descriptionText) {
    const allText = rows.map((r) => r.textContent || '').join(' ').trim();
    const numberMatch = allText.match(PATTERNS.extractNumber);

    if (numberMatch && result.targetNumber === null) {
      result.targetNumber = safeParseInt(numberMatch[0]);
    }

    if (!result.descriptionText && numberMatch) {
      result.descriptionText = allText.replace(numberMatch[0], '').trim();
    }
  }

  // Ensure target number has a default
  result.targetNumber = result.targetNumber ?? CONFIG.defaults.targetNumber;

  return result;
};

// =============================================================================
// DOM BUILDERS
// =============================================================================

/**
 * Create digit containers for the counter
 * @param {number} digitCount - Number of digits to create
 * @returns {DocumentFragment} Fragment containing digit containers
 */
const createDigitContainers = (digitCount) => {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < digitCount; i += 1) {
    const digitContainer = createElement('div', CLASSES.digit);
    const digitValue = createElement('span', CLASSES.digitValue);

    digitValue.textContent = CONFIG.defaults.digit;
    digitValue.setAttribute('aria-hidden', 'true');

    digitContainer.appendChild(digitValue);
    fragment.appendChild(digitContainer);
  }

  return fragment;
};

/**
 * Create text paragraph element from description
 * @param {string} descriptionText - Plain text content
 * @param {string} descriptionHTML - HTML content
 * @returns {HTMLElement} Paragraph element
 */
const createTextParagraph = (descriptionText, descriptionHTML) => {
  const paragraph = createElement('p');
  let html = descriptionHTML || descriptionText;

  // Clean Universal Editor attributes
  if (hasUEAttributes(html)) {
    html = cleanHTML(html);
  }

  // Check if content has HTML tags
  const hasHTMLTags = html !== descriptionText && PATTERNS.htmlTags.test(html);

  if (hasHTMLTags) {
    // Extract inner content if wrapped in <p> tag
    if (PATTERNS.pWrapper.test(html)) {
      const tempDiv = createElement('div');
      tempDiv.innerHTML = html;
      paragraph.innerHTML = tempDiv.firstElementChild?.innerHTML || html;
    } else {
      paragraph.innerHTML = html;
    }
  } else {
    paragraph.textContent = descriptionText;
  }

  return paragraph;
};

/**
 * Build the counter DOM structure
 * @param {number} targetNumber - Target number for counter
 * @param {string} descriptionText - Description text
 * @param {string} descriptionHTML - Description HTML
 * @returns {Object} { wrapper, numberContainer, digits }
 */
const buildCounterStructure = (targetNumber, descriptionText, descriptionHTML) => {
  // Create wrapper
  const wrapper = createElement('div', CLASSES.wrapper);

  // Create number container
  const numberContainer = createElement('div', CLASSES.number);
  numberContainer.setAttribute('aria-label', `Counter: ${targetNumber}`);

  // Create digit containers
  const digitCount = targetNumber.toString().length;
  const digitFragment = createDigitContainers(digitCount);
  numberContainer.appendChild(digitFragment);

  // Get digit elements for animation
  const digits = numberContainer.querySelectorAll(SELECTORS.digit);

  // Create text container
  const textContainer = createElement('div', CLASSES.text);

  if (descriptionText?.trim()) {
    const textParagraph = createTextParagraph(descriptionText, descriptionHTML);
    textContainer.appendChild(textParagraph);
  }

  // Assemble structure
  wrapper.appendChild(numberContainer);
  wrapper.appendChild(textContainer);

  return { wrapper, numberContainer, digits };
};

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize counter animation with viewport detection
 * @param {HTMLElement} block - Block element
 * @param {NodeList|Array} digits - Digit elements
 * @param {number} targetNumber - Target number
 */
const initializeAnimation = (block, digits, targetNumber) => {
  if (!digits?.length || targetNumber < 0) return;

  // Prevent re-animation
  if (block.dataset.animated === 'true') return;

  // Skip animation in editor mode - show final value immediately
  if (checkEditorMode()) {
    updateDigits(digits, targetNumber);
    block.dataset.animated = 'true';
    return;
  }

  // Initialize display to 0
  updateDigits(digits, 0);

  // Observe viewport intersection
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && block.dataset.animated !== 'true') {
          block.dataset.animated = 'true';
          animateCounter(digits, targetNumber);
          observer.unobserve(block);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: CONFIG.animation.threshold,
    },
  );

  observer.observe(block);
};

/**
 * Determine display mode based on block classes
 * @param {HTMLElement} block - Block element
 * @returns {string} Mode string ('dark' or 'light')
 */
const getDisplayMode = (block) => {
  const isDarkMode = block.classList.contains('dark') || block.classList.contains('on-dark');
  return isDarkMode ? 'dark' : 'light';
};

// =============================================================================
// MAIN DECORATOR
// =============================================================================

/**
 * Decorate the info-counter block
 * @param {HTMLElement} block - The block element to decorate
 */
export default function decorate(block) {
  // Validate block has content
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Extract content from block structure
  const { targetNumber, descriptionText, descriptionHTML } = extractContent(rows);

  // Determine display mode
  const mode = getDisplayMode(block);

  // Clear and configure block
  block.innerHTML = '';
  block.classList.add(`${CLASSES.modePrefix}${mode}`);
  block.dataset.targetNumber = targetNumber.toString();

  // Build counter structure
  const { wrapper, digits } = buildCounterStructure(
    targetNumber,
    descriptionText,
    descriptionHTML,
  );

  // Append to block
  block.appendChild(wrapper);

  // Initialize animation
  initializeAnimation(block, digits, targetNumber);
}
