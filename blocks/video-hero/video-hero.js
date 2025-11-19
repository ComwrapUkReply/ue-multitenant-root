/**
 * Video Hero Block
 * Creates an accessible video hero banner with overlay content
 * Compatible with AEM Universal Editor
 */

/**
 * Extracts field value from a row based on field name
 * @param {Element} block The block element
 * @param {string} fieldName The field name to look for
 * @returns {Element|string|null} The field value
 */
function getField(block, fieldName) {
  const field = block.querySelector(`[data-aue-prop="${fieldName}"]`)
    || block.querySelector(`[data-aue-resource*="${fieldName}"]`);
  return field;
}

/**
 * Loads and decorates the video hero block
 * @param {Element} block The video hero block element
 */
export default function decorate(block) {
  // Debug: Log the block structure to console
  console.log('Video Hero Block Structure:', block.innerHTML);

  // Try to extract fields using data attributes first (Universal Editor)
  let videoSrc = null;
  let headingHtml = null;
  let subheadingText = null;
  let primaryBtn = null;
  let secondaryBtn = null;
  let badgeImg = null;

  // Check if we have Universal Editor attributes
  const videoField = getField(block, 'video');
  const headingField = getField(block, 'heading');
  const subheadingField = getField(block, 'subheading');
  const primaryButtonField = getField(block, 'primaryButton');
  const primaryButtonTextField = getField(block, 'primaryButtonText');
  const secondaryButtonField = getField(block, 'secondaryButton');
  const secondaryButtonTextField = getField(block, 'secondaryButtonText');
  const badgeField = getField(block, 'badge');

  console.log('Fields found:', {
    videoField,
    headingField,
    subheadingField,
    primaryButtonField,
    primaryButtonTextField,
    secondaryButtonField,
    secondaryButtonTextField,
    badgeField,
  });

  // Extract values
  if (videoField) {
    const videoLink = videoField.querySelector('a');
    videoSrc = videoLink ? videoLink.href : videoField.textContent.trim();
  }

  if (headingField) {
    headingHtml = headingField.innerHTML;
  }

  if (subheadingField) {
    subheadingText = subheadingField.textContent.trim();
  }

  if (badgeField) {
    badgeImg = badgeField.querySelector('img') || badgeField.querySelector('picture img');
  }

  // Handle buttons - they might be in separate link and text fields
  if (primaryButtonField || primaryButtonTextField) {
    const link = primaryButtonField?.querySelector('a');
    const text = primaryButtonTextField?.textContent.trim();
    if (link) {
      primaryBtn = link.cloneNode(true);
      if (text && text !== '') {
        primaryBtn.textContent = text;
      }
    }
  }

  if (secondaryButtonField || secondaryButtonTextField) {
    const link = secondaryButtonField?.querySelector('a');
    const text = secondaryButtonTextField?.textContent.trim();
    if (link) {
      secondaryBtn = link.cloneNode(true);
      if (text && text !== '') {
        secondaryBtn.textContent = text;
      }
    }
  }

  // Fallback: Parse from row structure (for document-based authoring)
  if (!videoSrc || !headingHtml) {
    const rows = [...block.children];
    let rowIndex = 0;

    rows.forEach((row) => {
      const cells = [...row.children];
      cells.forEach((cell) => {
        const content = cell.textContent.trim();
        const link = cell.querySelector('a');
        const img = cell.querySelector('img');

        if (rowIndex === 0 && content) {
          videoSrc = videoSrc || content;
        } else if (rowIndex === 1 && !headingHtml) {
          headingHtml = cell.innerHTML;
        } else if (rowIndex === 2 && !subheadingText) {
          subheadingText = content;
        } else if (rowIndex === 3 && link) {
          if (!primaryBtn) {
            primaryBtn = link.cloneNode(true);
          } else if (!secondaryBtn) {
            secondaryBtn = link.cloneNode(true);
          }
        } else if (rowIndex === 4 && img && !badgeImg) {
          badgeImg = img;
        }
      });
      rowIndex++;
    });
  }

  // Clear the block
  block.innerHTML = '';

  // Create video background container
  const videoContainer = document.createElement('div');
  videoContainer.className = 'video-hero-background';

  // Create video element with accessibility attributes
  const video = document.createElement('video');
  video.className = 'video-hero-video';
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.setAttribute('loop', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true'); // Decorative video
  video.setAttribute('tabindex', '-1');

  // Add source
  if (videoSrc) {
    const source = document.createElement('source');
    source.src = videoSrc;
    source.type = 'video/mp4';
    video.appendChild(source);
  }

  // Add overlay for better text readability
  const overlay = document.createElement('div');
  overlay.className = 'video-hero-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  videoContainer.appendChild(video);
  videoContainer.appendChild(overlay);

  // Create content container
  const content = document.createElement('div');
  content.className = 'video-hero-content';

  // Create heading
  if (headingHtml) {
    const heading = document.createElement('h1');
    heading.className = 'video-hero-heading';
    heading.innerHTML = headingHtml;
    content.appendChild(heading);
  }

  // Create subheading
  if (subheadingText) {
    const subheading = document.createElement('p');
    subheading.className = 'video-hero-subheading';
    subheading.textContent = subheadingText;
    content.appendChild(subheading);
  }

  // Create buttons container
  if (primaryBtn || secondaryBtn) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'video-hero-buttons';

    if (primaryBtn) {
      primaryBtn.className = 'button button-primary';
      primaryBtn.setAttribute('role', 'button');
      buttonsContainer.appendChild(primaryBtn);
    }

    if (secondaryBtn) {
      secondaryBtn.className = 'button button-secondary';
      secondaryBtn.setAttribute('role', 'button');
      buttonsContainer.appendChild(secondaryBtn);
    }

    content.appendChild(buttonsContainer);
  }

  // Assemble the block
  block.appendChild(videoContainer);
  block.appendChild(content);

  // Create badge container (positioned absolutely, outside main content flow)
  if (badgeImg) {
    const badge = document.createElement('div');
    badge.className = 'video-hero-badge';
    const badgeImgClone = badgeImg.cloneNode(true);

    // Ensure badge image has alt text for accessibility
    if (!badgeImgClone.alt) {
      badgeImgClone.alt = 'Partner badge';
    }

    badge.appendChild(badgeImgClone);
    block.appendChild(badge);
  }

  // Ensure video plays (some browsers may block autoplay)
  if (videoSrc) {
    video.play().catch((error) => {
      console.warn('Video autoplay was prevented:', error);
    });

    // Pause video when not in viewport for performance
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.25 });

    observer.observe(block);

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreference = (e) => {
      if (e.matches) {
        video.pause();
        // Show first frame only
        video.currentTime = 0;
      } else {
        video.play().catch(() => {});
      }
    };

    prefersReducedMotion.addEventListener('change', handleMotionPreference);
    handleMotionPreference(prefersReducedMotion);
  }
}
