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
 * Process button components added to the hero
 * @param {HTMLElement} block - The hero block DOM element
 */
function processButtons(block) {
  // Find all button block items (buttons added as children to hero)
  // These are direct children of the hero block with data-block-name="button"
  const buttonBlockItems = [...block.children].filter(
    (child) => child.getAttribute('data-block-name') === 'button'
  );

  buttonBlockItems.forEach((buttonBlock) => {
    // Extract button fields from the block structure
    // Each field is a div child of the button block
    const rows = [...buttonBlock.querySelectorAll(':scope > div')];
    let link = '';
    let linkText = '';
    let linkTitle = '';
    let linkType = '';

    rows.forEach((row, index) => {
      const text = row.textContent?.trim() || '';
      const linkElement = row.querySelector('a');

      if (index === 0 && linkElement) {
        // First row: link (aem-content)
        link = linkElement.href || linkElement.textContent?.trim() || '';
      } else if (index === 1) {
        // Second row: linkText
        linkText = text;
      } else if (index === 2) {
        // Third row: linkTitle
        linkTitle = text;
      } else if (index === 3) {
        // Fourth row: linkType
        linkType = text;
      }
    });

    // Create button element if we have link and text
    if (link && linkText) {
      const button = document.createElement('a');
      button.href = link;
      button.textContent = linkText;
      button.className = 'button';
      if (linkTitle) {
        button.title = linkTitle;
      }
      if (linkType === 'primary') {
        button.classList.add('primary');
      } else if (linkType === 'secondary') {
        button.classList.add('secondary');
      }

      // Wrap button in container
      const buttonContainer = document.createElement('p');
      buttonContainer.classList.add('button-container');
      buttonContainer.appendChild(button);

      // Replace the button block content with the collapsed button
      buttonBlock.innerHTML = '';
      buttonBlock.appendChild(buttonContainer);
    }
  });

  // Find all button components (both button and custom-button) that are already collapsed
  const buttonComponents = block.querySelectorAll('.button-container');

  if (buttonComponents.length > 0) {
    // Create a wrapper for all buttons
    const ctaWrapper = document.createElement('div');
    ctaWrapper.classList.add('hero-buttons');

    // Move all button components into the wrapper
    buttonComponents.forEach((buttonComponent) => {
      ctaWrapper.appendChild(buttonComponent);
    });

    // Add the button wrapper to the content area
    const contentDiv = block.querySelector('.hero-content');
    if (contentDiv) {
      contentDiv.appendChild(ctaWrapper);
    }
  }

  // Clean up any empty paragraphs left behind
  block.querySelectorAll('p:empty').forEach((p) => p.remove());
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

  // Process button components
  processButtons(block);
}
