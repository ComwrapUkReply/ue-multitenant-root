/**
 * Hero block implementation
 * Handles hero content with image background and CTA buttons
 */

/**
 * Return true if the link is an image reference (used to skip image row when finding CTA links)
 * @param {HTMLAnchorElement} link - Anchor element
 * @returns {boolean}
 */
const isImageLink = (link) => {
  if (!link) return false;
  const href = link.href || '';
  return href.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    || href.includes('/adobe/assets/')
    || href.includes('adobeaemcloud.com');
};

/**
 * Extract data from block children
 * With element grouping, buttons are already rendered as <a> tags
 * @param {HTMLElement} block - The block DOM element
 * @returns {Object} Extracted data
 */
const extractData = (block) => {
  const data = {
    image: null,
    imageAlt: '',
    heroText: '',
    fullBlockLink: '',
    primaryButton: null,
    secondaryButton: null,
  };

  const rows = Array.from(block.children);

  // Find rows by content rather than fixed index (tabs may or may not create rows)
  let imageFound = false;
  let heroTextFound = false;
  let primaryButtonFound = false;
  let secondaryButtonFound = false;

  rows.forEach((row) => {
    // Find image row (contains picture or image link)
    if (!imageFound) {
      const existingPicture = row.querySelector('picture');
      if (existingPicture) {
        data.image = existingPicture;
        const img = existingPicture.querySelector('img');
        if (img && img.alt) {
          data.imageAlt = img.alt;
        }
        imageFound = true;
        return;
      }
      // Image might be a link that needs to be converted
      const imageLink = row.querySelector('a');
      if (imageLink && (imageLink.href.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
        || imageLink.href.includes('/adobe/assets/')
        || imageLink.href.includes('adobeaemcloud.com'))) {
        const newPicture = document.createElement('picture');
        const img = document.createElement('img');
        img.src = imageLink.href;
        img.alt = imageLink.title || imageLink.textContent || '';
        img.loading = 'lazy';
        newPicture.appendChild(img);
        data.image = newPicture;
        data.imageAlt = img.alt;
        imageFound = true;
        return;
      }
    }

    // Find heroText (richtext - contains HTML content like headings/paragraphs)
    // Skip if already found image or buttons in this row
    if (!heroTextFound && !row.querySelector('picture') && !row.querySelector('img')
      && !row.querySelector('a[href*=".jpg"], a[href*=".png"], a[href*=".jpeg"], a[href*=".gif"], a[href*=".webp"], a[href*=".svg"]')
      && (row.querySelector('h1, h2, h3, h4, h5, h6, p') || row.innerHTML?.includes('<p>') || row.innerHTML?.includes('<h'))) {
      const descDiv = row.querySelector('div');
      const content = descDiv?.innerHTML?.trim() || row.innerHTML?.trim();
      const rowText = row.textContent?.trim();
      // Make sure it's not a field label
      if (content && content.length > 0 && !rowText.match(/^(image|imageAlt|classes|primaryButton|secondaryButton)/i)) {
        data.heroText = content;
        heroTextFound = true;
      }
    }

    // Find primaryButton (element grouped - contains link)
    if (!primaryButtonFound && row.querySelector('a') && !row.querySelector('picture')
      && !row.querySelector('img') && !isImageLink(row.querySelector('a'))) {
      const button = row.querySelector('a');
      if (button && button.href && !button.href.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        // Element grouping creates: P0=button, P1=label, P2=target, P3=classes
        const allParagraphs = Array.from(row.querySelectorAll('p'));

        // Get label from second paragraph (P1)
        if (allParagraphs[1]) {
          const label = allParagraphs[1].textContent?.trim();
          if (label) {
            button.textContent = label;
          }
        }

        // Identify target and classes by content
        const validTargetValues = ['_blank', '_self', '_parent', '_top'];
        const validClassValues = ['primary', 'secondary', 'text'];

        let targetFound = false;
        let classesFound = false;

        // Check P2
        if (allParagraphs[2]) {
          const p2Content = allParagraphs[2].textContent?.trim();
          if (p2Content) {
            if (validTargetValues.includes(p2Content)) {
              button.target = p2Content;
              button.rel = 'noopener noreferrer';
              targetFound = true;
            } else if (validClassValues.some((cls) => p2Content.includes(cls)) || p2Content.includes(',')) {
              p2Content.split(',').forEach((cls) => {
                const trimmedClass = cls.trim();
                if (trimmedClass) {
                  button.classList.add(trimmedClass);
                }
              });
              classesFound = true;
            }
          }
        }

        // Check P3
        if (allParagraphs[3]) {
          const p3Content = allParagraphs[3].textContent?.trim();
          if (p3Content) {
            if (!targetFound && validTargetValues.includes(p3Content)) {
              button.target = p3Content;
              button.rel = 'noopener noreferrer';
              targetFound = true;
            } else if (!classesFound && (validClassValues.some((cls) => p3Content.includes(cls)) || p3Content.includes(','))) {
              p3Content.split(',').forEach((cls) => {
                const trimmedClass = cls.trim();
                if (trimmedClass) {
                  button.classList.add(trimmedClass);
                }
              });
              classesFound = true;
            }
          }
        }

        data.primaryButton = button;
        if (!button.classList.contains('button')) {
          button.classList.add('button');
        }
        button.title = button.href;
        primaryButtonFound = true;
        return;
      }
    }

    // Find secondaryButton (element grouped - contains link, after primaryButton)
    if (primaryButtonFound && !secondaryButtonFound && row.querySelector('a')
      && !row.querySelector('picture') && !row.querySelector('img')
      && !isImageLink(row.querySelector('a'))) {
      const button = row.querySelector('a');
      if (button && button.href && !button.href.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        // Element grouping creates: P0=button, P1=label, P2=target, P3=classes
        const allParagraphs = Array.from(row.querySelectorAll('p'));

        // Get label from second paragraph (P1)
        if (allParagraphs[1]) {
          const label = allParagraphs[1].textContent?.trim();
          if (label) {
            button.textContent = label;
          }
        }

        // Identify target and classes by content
        const validTargetValues = ['_blank', '_self', '_parent', '_top'];
        const validClassValues = ['primary', 'secondary', 'text'];

        let targetFound = false;
        let classesFound = false;

        // Check P2
        if (allParagraphs[2]) {
          const p2Content = allParagraphs[2].textContent?.trim();
          if (p2Content) {
            if (validTargetValues.includes(p2Content)) {
              button.target = p2Content;
              button.rel = 'noopener noreferrer';
              targetFound = true;
            } else if (validClassValues.some((cls) => p2Content.includes(cls)) || p2Content.includes(',')) {
              p2Content.split(',').forEach((cls) => {
                const trimmedClass = cls.trim();
                if (trimmedClass) {
                  button.classList.add(trimmedClass);
                }
              });
              classesFound = true;
            }
          }
        }

        // Check P3
        if (allParagraphs[3]) {
          const p3Content = allParagraphs[3].textContent?.trim();
          if (p3Content) {
            if (!targetFound && validTargetValues.includes(p3Content)) {
              button.target = p3Content;
              button.rel = 'noopener noreferrer';
              targetFound = true;
            } else if (!classesFound && (validClassValues.some((cls) => p3Content.includes(cls)) || p3Content.includes(','))) {
              p3Content.split(',').forEach((cls) => {
                const trimmedClass = cls.trim();
                if (trimmedClass) {
                  button.classList.add(trimmedClass);
                }
              });
              classesFound = true;
            }
          }
        }

        data.secondaryButton = button;
        if (!button.classList.contains('button')) {
          button.classList.add('button');
        }
        button.title = button.href;
        secondaryButtonFound = true;
      }
    }
  });

  return data;
};

/**
 * Create the hero structure
 * @param {HTMLElement} block - The block DOM element
 * @param {Object} data - Hero data
 */
const createHeroStructure = (block, data) => {
  // Create image container (first div with picture)
  if (data.image) {
    const imageDiv = document.createElement('div');
    imageDiv.appendChild(data.image);
    block.appendChild(imageDiv);
  }

  // Check if we have buttons or content to create hero-content
  const hasButtons = data.primaryButton || data.secondaryButton;
  const hasContent = data.heroText && data.heroText.trim().length > 0;

  // Only create hero-content if we have content or buttons
  if (hasContent || hasButtons) {
    // Create content container
    const contentDiv = document.createElement('div');
    contentDiv.className = 'hero-content';

    // Add heroText content (richtext - may contain headings and paragraphs)
    if (hasContent) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data.heroText;

      // Process headings and paragraphs from heroText
      const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const paragraphs = tempDiv.querySelectorAll('p');

      headings.forEach((heading) => {
        contentDiv.appendChild(heading);
      });

      paragraphs.forEach((p) => {
        // Skip button paragraphs
        const isButton = p.querySelector('a.button') || p.classList.contains('button-container');
        if (!isButton && p.textContent.trim().length > 0) {
          p.classList.add('hero-description');
          contentDiv.appendChild(p);
        }
      });
    }

    // Create buttons container
    if (hasButtons) {
      const buttonsDiv = document.createElement('div');
      buttonsDiv.className = 'button-container';

      if (data.primaryButton) {
        buttonsDiv.appendChild(data.primaryButton);
      }

      if (data.secondaryButton) {
        buttonsDiv.appendChild(data.secondaryButton);
      }

      contentDiv.appendChild(buttonsDiv);
    }

    // Handle full block link (wrap entire content if there's a fullBlockLink and no buttons)
    if (data.fullBlockLink && !hasButtons) {
      const blockLink = document.createElement('a');
      blockLink.href = data.fullBlockLink;
      blockLink.className = 'hero-block-link';
      blockLink.setAttribute('aria-label', 'Hero link');

      // Add external link attributes if needed
      if (data.fullBlockLink.startsWith('http') && !data.fullBlockLink.includes(window.location.hostname)) {
        blockLink.target = '_blank';
        blockLink.rel = 'noopener noreferrer';
      }

      blockLink.appendChild(contentDiv);
      block.appendChild(blockLink);
    } else {
      block.appendChild(contentDiv);
    }
  }
};

/**
 * Process classes field and apply to block
 * @param {HTMLElement} block - The hero block DOM element
 */
const processClasses = (block) => {
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
};

/**
 * Add event tracking for analytics
 * @param {HTMLElement} block - The block DOM element
 */
const addAnalytics = (block) => {
  // Track button clicks
  const buttonsContainer = block.querySelector('.button-container');
  if (buttonsContainer) {
    const buttons = buttonsContainer.querySelectorAll('a');
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'hero_cta_click',
            block_type: 'hero',
            button_position: index === 0 ? 'primary' : 'secondary',
            button_text: button.textContent?.trim(),
            button_url: button.href,
            button_style: button.className,
          });
        }
      });
    });
  }

  // Track full block link clicks
  const blockLink = block.querySelector('.hero-block-link');
  if (blockLink) {
    blockLink.addEventListener('click', () => {
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'hero_block_click',
          block_type: 'hero',
          block_url: blockLink.href,
        });
      }
    });
  }
};

/**
 * Main decoration function
 * @param {HTMLElement} block - The block DOM element
 */
export default async function decorate(block) {
  // Process classes field first (before other processing)
  processClasses(block);

  // Extract data from block children
  const data = extractData(block);

  // Clear block content
  block.textContent = '';

  // Create hero structure
  createHeroStructure(block, data);

  // Add analytics tracking
  addAnalytics(block);
}
