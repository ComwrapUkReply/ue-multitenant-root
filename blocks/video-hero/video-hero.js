/**
 * Video Hero Block
 * Creates an accessible video hero banner with overlay content
 * Compatible with AEM Universal Editor
 */

/** Get the first cell (inner div) of a row for content extraction */
const getCell = (row) => (row?.querySelector?.(':scope > div') ?? row);

/**
 * Loads and decorates the video hero block
 * @param {Element} block The video hero block element
 */
export default function decorate(block) {
  // Extract fields from block rows (position-based; data-aue-* are UE-only)
  let videoSrc = null;
  let headingHtml = null;
  let subheadingText = null;
  let primaryBtn = null;
  let secondaryBtn = null;
  let badgeImg = null;

  const rows = [...block.children];

  // Row 0: Video (reference renders as link or picture)
  if (rows[0]) {
    const videoLink = rows[0].querySelector('a');
    const videoSource = rows[0].querySelector('video source, source[type*="video"]');
    if (videoLink) {
      videoSrc = videoLink.href;
    } else if (videoSource?.src) {
      videoSrc = videoSource.src;
    }
  }

  // Row 1: Heading (richtext) – UE uses data-richtext-prop; fallback to cell content
  if (rows[1]) {
    const cell = getCell(rows[1]);
    const headingEl = rows[1].querySelector('[data-richtext-prop="heading"]')
      || cell.querySelector('h1, h2, h3, h4, h5, h6');
    if (headingEl) {
      headingHtml = headingEl.innerHTML?.trim() || headingEl.textContent?.trim() || '';
    } else if (cell?.innerHTML?.trim()) {
      headingHtml = cell.innerHTML.trim();
    }
  }

  // Row 2: Subheading
  if (rows[2]) {
    const cell = getCell(rows[2]);
    const subheadingEl = rows[2].querySelector('[data-aue-prop="subheading"]') || cell;
    subheadingText = subheadingEl?.textContent?.trim() || '';
  }

  // Row 3: Primary Button – link may be in button-container
  if (rows[3]) {
    const primaryLink = rows[3].querySelector('[data-aue-prop="primaryButtonText"]')
      || rows[3].querySelector('.button-container a, a.button')
      || rows[3].querySelector('a');
    if (primaryLink) {
      primaryBtn = primaryLink.cloneNode(true);
    }
  }

  // Row 4: Secondary Button
  if (rows[4]) {
    const secondaryLink = rows[4].querySelector('[data-aue-prop="secondaryButtonText"]')
      || rows[4].querySelector('.button-container a, a.button')
      || rows[4].querySelector('a');
    if (secondaryLink) {
      secondaryBtn = secondaryLink.cloneNode(true);
    }
  }

  // Row 5: Badge (reference renders as image)
  if (rows[5]) {
    const badgeEl = rows[5].querySelector('[data-aue-prop="badge"]')
      || rows[5].querySelector('img')
      || rows[5].querySelector('picture img');
    if (badgeEl) {
      badgeImg = badgeEl;
    }
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
  video.setAttribute('controls', '');
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
