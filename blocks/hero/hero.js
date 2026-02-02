/**
 * Hero block implementation
 * Handles hero content with image background and CTA buttons
 */

/**
 * Process image reference and convert to actual image element
 * @param {HTMLElement} block - The hero block DOM element
 */
function processImageReference(block) {
  // Find the first link that points to an image (this is how AEM renders image references)
  const imageLinks = [...block.querySelectorAll('a')].filter((link) => {
    const href = link.href || '';
    return href.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
           || href.includes('/adobe/assets/')
           || href.includes('adobeaemcloud.com');
  });

  if (imageLinks.length > 0) {
    const imageLink = imageLinks[0];
    const imageUrl = imageLink.href;
    const imageAlt = imageLink.title || imageLink.textContent || '';

    // Create picture element
    const picture = document.createElement('picture');
    picture.classList.add('hero-image-wrapper');

    // Create img element
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = imageAlt;
    img.classList.add('hero-image');
    img.loading = 'eager'; // Hero images should load immediately

    picture.appendChild(img);

    // Replace the link with the picture element
    const linkParent = imageLink.closest('div');
    if (linkParent) {
      linkParent.innerHTML = '';
      linkParent.appendChild(picture);
    }
  }
}

/**
 * Map CTA style value from model to CSS class name
 * @param {string} style - Value from cta1_style / cta2_style (e.g. "primary", "primary Outline")
 * @returns {string} CSS class name (e.g. "primary", "primary-outline")
 */
function ctaStyleToClass(style) {
  if (!style || !style.trim()) return '';
  const normalized = style.trim().toLowerCase().replace(/\s+/g, '-');
  return normalized;
}

/**
 * Build a single CTA button element from link, text, target and style
 * @param {string} href - Link URL
 * @param {string} text - Button label
 * @param {string} target - "" or "_blank"
 * @param {string} styleValue - Style select value
 * @returns {HTMLAnchorElement|null} Button element or null if href/text missing
 */
function buildCTAButton(href, text, target, styleValue) {
  if (!href || !text || !href.trim() || !text.trim()) return null;
  const button = document.createElement('a');
  button.href = href.trim();
  button.className = 'button';
  const span = document.createElement('span');
  span.textContent = text.trim();
  button.appendChild(span);
  if (target === '_blank') {
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
  }
  const styleClass = ctaStyleToClass(styleValue);
  if (styleClass) {
    button.classList.add(styleClass);
  }
  return button;
}

/**
 * Return true if the link is an image reference (used to skip image row when finding CTA links)
 * @param {HTMLAnchorElement} link - Anchor element
 * @returns {boolean}
 */
function isImageLink(link) {
  const href = link.href || '';
  return href.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    || href.includes('/adobe/assets/')
    || href.includes('adobeaemcloud.com');
}

/**
 * Extract CTA data from a row (link from <a>, text from textContent)
 * @param {Element} linkRow - Row containing ctaN_link (may have <a>)
 * @param {Element} textRow - Row containing ctaN_text
 * @param {Element} targetRow - Row containing ctaN_target
 * @param {Element} styleRow - Row containing ctaN_style
 * @returns {{ href: string, text: string, target: string, style: string }}
 */
function extractCTAData(linkRow, textRow, targetRow, styleRow) {
  const linkEl = linkRow?.querySelector('a');
  const href = linkEl ? (linkEl.href || linkEl.textContent?.trim() || '') : '';
  const text = textRow?.textContent?.trim() || '';
  const target = targetRow?.textContent?.trim() || '';
  const style = styleRow?.textContent?.trim() || '';
  return {
    href,
    text,
    target,
    style,
  };
}

/**
 * Process CTAs from hero model fields. Finds CTA rows by scanning for non-image link rows,
 * respects ctaCount (0/1/2), builds buttons and removes CTA rows from DOM.
 * @param {HTMLElement} block - The hero block DOM element
 */
function processCTAsFromModel(block) {
  const rows = [...block.children];
  // Find rows that contain a non-image link (these are cta1_link, cta2_link)
  const linkRowIndices = rows
    .map((row, i) => i)
    .filter((i) => {
      const a = rows[i].querySelector('a');
      return a && !isImageLink(a);
    });

  // When ctaCount is "0", CTA fields may be hidden so no link rows exist; still remove ctaCount row
  if (linkRowIndices.length === 0) {
    const ctaCountOnlyRow = rows.find((row, i) => i >= 4 && /^[012]$/.test(row.textContent?.trim()));
    if (ctaCountOnlyRow?.parentElement === block) {
      ctaCountOnlyRow.remove();
    }
    return;
  }

  // ctaCount row is immediately before the first CTA link row
  const ctaCountRowIndex = linkRowIndices[0] - 1;
  const ctaCount = ctaCountRowIndex >= 0
    ? String(rows[ctaCountRowIndex].textContent?.trim() || '0')
    : '0';
  let wanted = 0;
  if (ctaCount === '1') wanted = 1;
  else if (ctaCount === '2') wanted = 2;

  const buttons = [];
  let lastCtaRowIndex = ctaCountRowIndex;

  for (let n = 0; n < wanted && n < linkRowIndices.length; n += 1) {
    const linkIdx = linkRowIndices[n];
    const textIdx = linkIdx + 1;
    const targetIdx = linkIdx + 2;
    const styleIdx = linkIdx + 3;
    if (styleIdx >= rows.length) break;
    const cta = extractCTAData(rows[linkIdx], rows[textIdx], rows[targetIdx], rows[styleIdx]);
    const btn = buildCTAButton(cta.href, cta.text, cta.target, cta.style);
    if (btn) buttons.push(btn);
    lastCtaRowIndex = styleIdx;
  }

  if (buttons.length === 0) {
    // Remove ctaCount row so "0"/"1"/"2" doesn't show as raw text
    if (ctaCountRowIndex >= 0 && rows[ctaCountRowIndex]?.parentElement === block) {
      rows[ctaCountRowIndex].remove();
    }
    return;
  }

  const container = document.createElement('div');
  container.classList.add('hero-buttons');
  buttons.forEach((btn) => {
    const p = document.createElement('p');
    p.classList.add('button-container');
    p.appendChild(btn);
    container.appendChild(p);
  });

  const contentArea = block.querySelector('.hero-content');
  if (contentArea) {
    contentArea.appendChild(container);
  } else {
    block.appendChild(container);
  }

  // Remove CTA section rows: from ctaCount row through last CTA row used
  for (let i = lastCtaRowIndex; i >= ctaCountRowIndex; i -= 1) {
    if (rows[i] && rows[i].parentElement === block) {
      rows[i].remove();
    }
  }
}

/**
 * Process classes field and apply to block
 * @param {HTMLElement} block - The hero block DOM element
 */
function processClasses(block) {
  // Find the classes field value in the block content
  // Look for a div that contains "classes" as text and get the value from the next div
  const allDivs = [...block.querySelectorAll('div')];
  const classesDiv = allDivs.find((div) => {
    const hasClassesText = div.textContent.trim() === 'classes';
    const hasNextSibling = div.nextElementSibling;
    const nextSiblingIsDiv = div.nextElementSibling && div.nextElementSibling.tagName === 'DIV';
    return hasClassesText && hasNextSibling && nextSiblingIsDiv;
  });

  if (classesDiv && classesDiv.nextElementSibling) {
    const classesValue = classesDiv.nextElementSibling.textContent.trim();
    if (classesValue && classesValue !== 'classes') {
      // Apply the class to the block
      block.classList.add(classesValue);
    }
  }
}

/**
 * Add semantic classes to hero elements
 * @param {HTMLElement} block - The hero block DOM element
 */
function addSemanticClasses(block) {
  // Mark content area - find the div with text content
  const contentDivs = [...block.querySelectorAll(':scope > div > div')];

  contentDivs.forEach((div) => {
    // If it has heading or paragraph (not just links), it's content
    if (div.querySelector('h1, h2, h3, h4, h5, h6, p')) {
      div.classList.add('hero-content');
    }
  });

  // Mark description paragraphs (paragraphs that are not button containers or titles)
  const paragraphs = block.querySelectorAll('p');
  paragraphs.forEach((p) => {
    const isButton = p.querySelector('a') || p.classList.contains('button-container');
    const isButtonComponent = p.closest('[data-block-name="button"]') || p.closest('[data-block-name="custom-button"]');
    const isEmpty = p.textContent.trim().length === 0;

    if (!isButton && !isButtonComponent && !isEmpty) {
      p.classList.add('hero-description');
    }
  });
}

/**
 * Entry point to hero block's JavaScript
 * Must be exported as default and accept a block's DOM element
 * @param {HTMLElement} block - The block's DOM element/tree
 */
export default function decorate(block) {
  // Process classes field first (before other processing)
  processClasses(block);

  // Process image reference
  processImageReference(block);

  // Add semantic CSS classes
  addSemanticClasses(block);

  // Build CTAs from model fields (cta1/cta2: link, text, target, style)
  processCTAsFromModel(block);
}
