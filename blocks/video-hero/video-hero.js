/**
 * Video Hero Block
 * Creates an accessible video hero banner with overlay content
 * Compatible with AEM Universal Editor
 */

/** Get the first cell (inner div) of a row for content extraction */
const getCell = (row) => (row?.querySelector?.(':scope > div') ?? row);

/** Parse boolean from row (same pattern as video.js: p or cell text "true"/"false") */
function parseBooleanFromRow(row, defaultValue = false) {
  if (!row) return defaultValue;
  const text = (row.querySelector('p')?.textContent?.trim() || getCell(row)?.textContent?.trim() || '').toLowerCase();
  if (text === 'true') return true;
  if (text === 'false') return false;
  return defaultValue;
}

/**
 * Loads and decorates the video hero block
 * @param {Element} block The video hero block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // New model (current _video-hero.json):
  // 0=tab(Content), 1=video, 2=heading, 3=subheading, 4=badge, 5=badgeAlt,
  // 6=tab(CTAs), 7=primaryButton, 8=primaryButtonText, 9=secondaryButton, 10=secondaryButtonText,
  // 11=tab(Controls), 12=video-autoplay, 13=video-loop, 14=video-muted, 15=video-controls
  //
  // Legacy (fewer rows, before tabs/booleans existed):
  // 0=video, 1=heading, 2=subheading, 3=primary, 4=secondary, 5=badge
  const hasContentTab = rows.length >= 16;
  const idx = hasContentTab
    ? {
      video: 1,
      heading: 2,
      subheading: 3,
      badge: 4,
      primary: 7,
      secondary: 9,
      autoplay: 12,
      loop: 13,
      muted: 14,
      controls: 15,
    }
    : {
      video: 0,
      heading: 1,
      subheading: 2,
      badge: 5,
      primary: 3,
      secondary: 4,
      autoplay: null,
      loop: null,
      muted: null,
      controls: null,
    };

  let videoSrc = null;
  let headingHtml = null;
  let subheadingText = null;
  let primaryBtn = null;
  let secondaryBtn = null;
  let badgeImg = null;

  const videoAutoplay = idx.autoplay != null ? parseBooleanFromRow(rows[idx.autoplay], true) : true;
  const videoLoop = idx.loop != null ? parseBooleanFromRow(rows[idx.loop], true) : true;
  const videoMuted = idx.muted != null ? parseBooleanFromRow(rows[idx.muted], true) : true;
  const videoControls = idx.controls != null ? parseBooleanFromRow(rows[idx.controls], false)
    : false;

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

  // Row 1: Heading (richtext)
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

  // Row 2: Subheading
  if (rows[idx.subheading]) {
    const row = rows[idx.subheading];
    const cell = getCell(row);
    const subheadingEl = row.querySelector('[data-aue-prop="subheading"]') || cell;
    subheadingText = subheadingEl?.textContent?.trim() || '';
  }

  // Badge (row 3 in new structure, row 5 in legacy)
  if (rows[idx.badge]) {
    const badgeEl = rows[idx.badge].querySelector('[data-aue-prop="badge"]')
      || rows[idx.badge].querySelector('img')
      || rows[idx.badge].querySelector('picture img');
    if (badgeEl) {
      badgeImg = badgeEl;
    }
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

  // Clear the block
  block.innerHTML = '';

  // Create video background container
  const videoContainer = document.createElement('div');
  videoContainer.className = 'video-hero-background';

  // Create video element – apply author options (same pattern as video.js)
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
