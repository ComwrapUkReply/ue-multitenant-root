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
  /** Parse boolean from row cell (e.g. "true" / "false" from authoring) */
  const parseBoolFromRow = (row, defaultValue = false) => {
    if (!row) return defaultValue;
    const cell = getCell(row);
    const text = cell?.textContent?.trim()?.toLowerCase();
    if (text === 'true') return true;
    if (text === 'false') return false;
    return defaultValue;
  };

  /** True if row cell content looks like a boolean (for backward compatibility) */
  const rowLooksLikeBoolean = (row) => {
    const text = getCell(row)?.textContent?.trim()?.toLowerCase();
    return text === 'true' || text === 'false';
  };

  const rows = [...block.children];
  const hasVideoOptionRows = rows.length >= 10 && rowLooksLikeBoolean(rows[1]);

  // Row indices: with option rows 0=video, 1–4=options, 5=heading, 6=subheading, 7=primary, 8=secondary, 9=badge
  // Without (legacy): 0=video, 1=heading, 2=subheading, 3=primary, 4=secondary, 5=badge
  const idx = {
    video: 0,
    heading: hasVideoOptionRows ? 5 : 1,
    subheading: hasVideoOptionRows ? 6 : 2,
    primary: hasVideoOptionRows ? 7 : 3,
    secondary: hasVideoOptionRows ? 8 : 4,
    badge: hasVideoOptionRows ? 9 : 5,
  };

  let videoSrc = null;
  let videoAutoplay = true;
  let videoLoop = true;
  let videoMuted = true;
  let videoControls = false;
  let headingHtml = null;
  let subheadingText = null;
  let primaryBtn = null;
  let secondaryBtn = null;
  let badgeImg = null;

  // Row 0: Video (reference renders as link or picture)
  if (rows[idx.video]) {
    const videoLink = rows[idx.video].querySelector('a');
    const videoSource = rows[idx.video].querySelector('video source, source[type*="video"]');
    if (videoLink) {
      videoSrc = videoLink.href;
    } else if (videoSource?.src) {
      videoSrc = videoSource.src;
    }
  }

  // Video options (rows 1–4 when present)
  if (hasVideoOptionRows) {
    videoAutoplay = parseBoolFromRow(rows[1], true);
    videoLoop = parseBoolFromRow(rows[2], true);
    videoMuted = parseBoolFromRow(rows[3], true);
    videoControls = parseBoolFromRow(rows[4], false);
  }

  // Heading (richtext)
  if (rows[idx.heading]) {
    const row = rows[idx.heading];
    const cell = getCell(row);
    const headingEl = row.querySelector('[data-richtext-prop="heading"]')
      || cell?.querySelector('h1, h2, h3, h4, h5, h6');
    if (headingEl) {
      headingHtml = headingEl.innerHTML?.trim() || headingEl.textContent?.trim() || '';
    } else if (cell?.innerHTML?.trim()) {
      headingHtml = cell.innerHTML.trim();
    }
  }

  // Subheading
  if (rows[idx.subheading]) {
    const row = rows[idx.subheading];
    const cell = getCell(row);
    const subheadingEl = row.querySelector('[data-aue-prop="subheading"]') || cell;
    subheadingText = subheadingEl?.textContent?.trim() || '';
  }

  // Primary Button
  if (rows[idx.primary]) {
    const primaryLink = rows[idx.primary].querySelector('[data-aue-prop="primaryButtonText"]')
      || rows[idx.primary].querySelector('.button-container a, a.button')
      || rows[idx.primary].querySelector('a');
    if (primaryLink) {
      primaryBtn = primaryLink.cloneNode(true);
    }
  }

  // Secondary Button
  if (rows[idx.secondary]) {
    const secondaryLink = rows[idx.secondary].querySelector('[data-aue-prop="secondaryButtonText"]')
      || rows[idx.secondary].querySelector('.button-container a, a.button')
      || rows[idx.secondary].querySelector('a');
    if (secondaryLink) {
      secondaryBtn = secondaryLink.cloneNode(true);
    }
  }

  // Badge
  if (rows[idx.badge]) {
    const badgeEl = rows[idx.badge].querySelector('[data-aue-prop="badge"]')
      || rows[idx.badge].querySelector('img')
      || rows[idx.badge].querySelector('picture img');
    if (badgeEl) {
      badgeImg = badgeEl;
    }
  }

  // Clear the block
  block.innerHTML = '';

  // Create video background container
  const videoContainer = document.createElement('div');
  videoContainer.className = 'video-hero-background';

  // Create video element – apply author-configurable options
  const video = document.createElement('video');
  video.className = 'video-hero-video';
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');
  video.toggleAttribute('autoplay', videoAutoplay);
  video.toggleAttribute('loop', videoLoop);
  video.toggleAttribute('muted', videoMuted);
  video.toggleAttribute('controls', videoControls);
  video.autoplay = videoAutoplay;
  video.loop = videoLoop;
  video.muted = videoMuted;
  video.controls = videoControls;

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

  // Play/pause toggle (bottom right) – for when autoplay is blocked or user wants to pause
  if (videoSrc) {
    const playToggle = document.createElement('button');
    playToggle.type = 'button';
    playToggle.className = 'video-hero-play-toggle';
    playToggle.setAttribute('aria-label', 'Play video');
    playToggle.innerHTML = `
      <span class="video-hero-icon video-hero-icon-play" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" focusable="false">
          <path d="M8 5v14l11-7L8 5z"/>
        </svg>
      </span>
      <span class="video-hero-icon video-hero-icon-pause video-hero-icon-hidden" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" focusable="false">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      </span>
    `;
    videoContainer.appendChild(playToggle);

    const updatePlayToggleState = () => {
      const isPlaying = !video.paused;
      playToggle.classList.toggle('is-playing', isPlaying);
      playToggle.querySelector('.video-hero-icon-play')?.classList.toggle('video-hero-icon-hidden', isPlaying);
      playToggle.querySelector('.video-hero-icon-pause')?.classList.toggle('video-hero-icon-hidden', !isPlaying);
      playToggle.setAttribute('aria-label', isPlaying ? 'Pause video' : 'Play video');
    };

    playToggle.addEventListener('click', () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', updatePlayToggleState);
    video.addEventListener('pause', updatePlayToggleState);
    updatePlayToggleState();
  }

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

  // Start playback when autoplay is on (user can use play button if blocked)
  if (videoSrc) {
    if (videoAutoplay) {
      video.play().catch(() => {});
    }

    // Pause when off-screen; resume when visible only if autoplay is on
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && videoAutoplay) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.25 });

    observer.observe(block);

    // Respect prefers-reduced-motion: pause and show first frame
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionPreference = (e) => {
      if (e.matches) {
        video.pause();
        video.currentTime = 0;
      } else if (videoAutoplay) {
        video.play().catch(() => {});
      }
    };

    prefersReducedMotion.addEventListener('change', handleMotionPreference);
    handleMotionPreference(prefersReducedMotion);
  }
}
