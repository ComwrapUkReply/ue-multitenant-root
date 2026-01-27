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
    (child) => child.getAttribute('data-block-name') === 'button',
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
      button.className = 'button';

      // Wrap label text in a span element
      const span = document.createElement('span');
      span.textContent = linkText;
      button.appendChild(span);
      if (linkTitle) {
        button.title = linkTitle;
      }
      if (linkType === 'primary') {
        button.classList.add('primary');
      } else if (linkType === 'secondary') {
        button.classList.add('secondary');
      }

      // Wrap button in container (required for styling)
      const buttonContainer = document.createElement('p');
      buttonContainer.classList.add('button-container');
      buttonContainer.appendChild(button);

      // Preserve Universal Editor attributes by removing only child divs, not the block itself
      // Remove all child divs but keep the buttonBlock's data attributes
      const childDivs = [...buttonBlock.querySelectorAll(':scope > div')];
      childDivs.forEach((div) => div.remove());

      // Create a single div wrapper to maintain structure (Universal Editor expects this)
      // This structure helps Universal Editor identify and highlight the button correctly
      const wrapperDiv = document.createElement('div');
      wrapperDiv.appendChild(buttonContainer);

      // Add the collapsed button container within the wrapper
      buttonBlock.appendChild(wrapperDiv);

      // Remove any remaining text elements that are siblings (they should be processed/removed)
      // This ensures Universal Editor highlights the button, not a text element below it
      const remainingTextDivs = [...buttonBlock.querySelectorAll(':scope > div')].filter((div) => {
        const p = div.querySelector('p');
        return p && p.textContent.trim() === 'text' && !p.querySelector('a.button');
      });
      remainingTextDivs.forEach((div) => div.remove());

      // Ensure the button block itself is set up for proper Universal Editor selection
      // The button block should contain only the button wrapper, making selection clear
      buttonBlock.setAttribute('data-block-status', 'loaded');
    }
  });

  // Don't move button blocks - keep them in place so Universal Editor can track them
  // Instead, just add a wrapper class to group them visually via CSS
  const buttonBlocks = [...block.children].filter(
    (child) => child.getAttribute('data-block-name') === 'button',
  );

  if (buttonBlocks.length > 0) {
    // Add a class to the button blocks for styling, but don't move them
    buttonBlocks.forEach((buttonBlock) => {
      buttonBlock.classList.add('hero-button-block');
    });
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

function processButtonText(block) {
  block.querySelectorAll('.button-container').forEach((buttonContainer) => {
    const textContentElement = buttonContainer.parentElement.nextElementSibling.querySelector('p');
    const textContent = textContentElement.textContent.trim();
    const button = buttonContainer.querySelector('a');

    // Wrap label text in a span element
    const span = document.createElement('span');
    span.textContent = textContent;
    button.textContent = '';
    button.appendChild(span);

    textContentElement.remove();
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

  // Process button components (this creates the button structure)
  processButtons(block);

  // Sync button text fields with text content of button elements (after buttons are created)
  processButtonText(block);
}
