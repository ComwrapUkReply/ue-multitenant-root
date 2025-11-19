/**
 * Video Hero Block
 * Creates an accessible video hero banner with overlay content
 * Compatible with AEM Universal Editor
 */

/**
 * Loads and decorates the video hero block
 * @param {Element} block The video hero block element
 */
export default function decorate(block) {
  // Extract content from the block
  const rows = [...block.children];

  // Expected structure:
  // Row 0: Video URL
  // Row 1: Heading (with optional emphasis text)
  // Row 2: Subheading (optional)
  // Row 3: Buttons (CTAs)
  // Row 4: Badge/Logo (optional)

  const videoRow = rows[0];
  const headingRow = rows[1];
  const subheadingRow = rows[2];
  const buttonsRow = rows[3];
  const badgeRow = rows[4];

  const videoUrl = videoRow?.textContent.trim();
  const headingContent = headingRow?.querySelector('div')?.innerHTML || headingRow?.innerHTML;
  const subheadingContent = subheadingRow?.textContent.trim();

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
  const source = document.createElement('source');
  source.src = videoUrl;
  source.type = 'video/mp4';
  video.appendChild(source);

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
  if (headingContent) {
    const heading = document.createElement('h1');
    heading.className = 'video-hero-heading';
    heading.innerHTML = headingContent;
    content.appendChild(heading);
  }

  // Create subheading
  if (subheadingContent) {
    const subheading = document.createElement('p');
    subheading.className = 'video-hero-subheading';
    subheading.textContent = subheadingContent;
    content.appendChild(subheading);
  }

  // Create buttons container
  if (buttonsRow) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'video-hero-buttons';

    const buttons = buttonsRow.querySelectorAll('a');
    buttons.forEach((button, index) => {
      button.className = `button ${index === 0 ? 'button-primary' : 'button-secondary'}`;
      // Ensure buttons have accessible focus states
      button.setAttribute('role', 'button');
      buttonsContainer.appendChild(button);
    });

    content.appendChild(buttonsContainer);
  }

  // Create badge container
  if (badgeRow) {
    const badge = document.createElement('div');
    badge.className = 'video-hero-badge';
    const badgeImage = badgeRow.querySelector('img');
    if (badgeImage) {
      // Ensure badge image has alt text for accessibility
      if (!badgeImage.alt) {
        badgeImage.alt = 'Partner badge';
      }
      badge.appendChild(badgeImage);
    }
    content.appendChild(badge);
  }

  // Assemble the block
  block.appendChild(videoContainer);
  block.appendChild(content);

  // Ensure video plays (some browsers may block autoplay)
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
