function decorateTeaserPicture(teaserPicture, target) {
  teaserPicture.parentElement.classList.add('video-cover');
  target.appendChild(teaserPicture.parentElement);
}

function playVideoAnimation(e) {
  const [playIcon] = e.target
    .closest('.hero-video')
    .querySelectorAll('.play-pause-fullscreen-button svg');

  playIcon.style.opacity = 1;
  setTimeout(() => {
    playIcon.style.opacity = 0;
  }, 400);
}

function pauseVideoAnimation(e) {
  const [, pauseIcon] = e.target
    .closest('.hero-video')
    .querySelectorAll('.play-pause-fullscreen-button svg');

  pauseIcon.style.opacity = 1;
  setTimeout(() => {
    pauseIcon.style.opacity = 0;
  }, 400);
}

function decorateTeaser(video, teaserPicture, target) {
  if (!video && !teaserPicture) {
    // nothing to decorate
    return;
  }

  if (!video) {
    // author didn't configure a teaser video
    // we'll use the image as the hero content for all screen sizes
    teaserPicture.style.setProperty('display', 'block', 'important');
    decorateTeaserPicture(teaserPicture, target);
    return;
  }

  const videoTag = document.createElement('video');
  if (!teaserPicture) {
    // author didn't configure a teaser picture
    // we'll use the video for all screen sizes
    videoTag.style.setProperty('display', 'block', 'important');
  } else {
    videoTag.setAttribute('poster', teaserPicture.currentSrc);
    decorateTeaserPicture(teaserPicture, target);
  }

  videoTag.classList.add('video-cover');

  const mql = window.matchMedia('only screen and (max-width: 768px)');
  if (mql.matches && teaserPicture) {
    videoTag.setAttribute('preload', 'metadata');
  } else {
    videoTag.toggleAttribute('autoplay', true);
    // Ensure muted for autoplay (browsers require muted videos for autoplay)
    // The muted state will be properly set in decorateVideoOptions, but set it here too
    videoTag.toggleAttribute('muted', true);
    videoTag.muted = true;
  }

  mql.onchange = (e) => {
    if (!e.matches && !videoTag.hasAttribute('autoplay')) {
      videoTag.toggleAttribute('autoplay', true);
      // Ensure muted when enabling autoplay
      videoTag.toggleAttribute('muted', true);
      videoTag.muted = true;
      videoTag.play();
    }
  };

  videoTag.innerHTML = `<source src="${video.href}" type="video/mp4">`;
  target.prepend(videoTag);
  video.remove();
  
  return videoTag;
}

function decorateOverlayButton(fullScreenVideoLink, block, overlay) {
  const button = document.createElement('button');
  button.classList.add('video-banner-btn');

  button.innerHTML = fullScreenVideoLink.innerHTML;

  button.addEventListener('click', () => {
    const fullVideoContainer = block.querySelector('.full-video-container');
    fullVideoContainer.style.display = 'block';
    const video = fullVideoContainer.querySelector('video');
    video.play();
    setTimeout(() => {
      video.addEventListener('play', playVideoAnimation);
      video.addEventListener('pause', pauseVideoAnimation);
    });
  });

  overlay.appendChild(button);
  fullScreenVideoLink.remove();
}

function createIcons(target, iconNames) {
  iconNames.forEach((iconName) => {
    const icon = document.createElement('span');
    icon.classList.add('icon');
    icon.classList.add(`icon-${iconName}`);

    target.appendChild(icon);
  });

  // decorateIcons(target);
}

function toggleVideoPlay(video) {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

async function decorateFullScreenVideo(fullScreenVideoLink, teaserPicture, target) {
  const fullVideoContainer = document.createElement('div');
  fullVideoContainer.classList.add('full-video-container');

  const video = document.createElement('video');
  video.classList.add('video-cover');
  video.innerHTML = `<source src="${fullScreenVideoLink}" type="video/mp4">`;
  video.setAttribute('preload', 'metadata');
  if (teaserPicture?.currentSrc) {
    video.setAttribute('poster', teaserPicture.currentSrc);
  }

  video.addEventListener('click', () => { toggleVideoPlay(video); });

  const closeVideoButton = document.createElement('div');
  closeVideoButton.classList.add('close-video');
  createIcons(closeVideoButton, ['close-video']);
  closeVideoButton.addEventListener('click', () => {
    video.removeEventListener('pause', pauseVideoAnimation);
    video.removeEventListener('play', playVideoAnimation);
    video.pause();
    video.currentTime = 0;
    video.load();
    fullVideoContainer.style.display = 'none';
  });

  const playPauseVideoButton = document.createElement('div');
  playPauseVideoButton.classList.add('play-pause-fullscreen-button');
  createIcons(playPauseVideoButton, ['full-screen-play', 'full-screen-pause']);
  playPauseVideoButton.addEventListener('click', () => { toggleVideoPlay(video); });

  fullVideoContainer.appendChild(closeVideoButton);
  fullVideoContainer.appendChild(playPauseVideoButton);
  fullVideoContainer.appendChild(video);
  target.appendChild(fullVideoContainer);
}

function createPlayPauseButton(video, container, autoplayEnabled) {
  const playPauseButton = document.createElement('button');
  playPauseButton.type = 'button';
  playPauseButton.className = 'video-play-pause-toggle';
  
  // Set initial state based on autoplay setting
  const initialLabel = autoplayEnabled ? 'Pause video' : 'Play video';
  playPauseButton.setAttribute('aria-label', initialLabel);
  
  playPauseButton.innerHTML = `
    <span class="video-icon video-icon-play ${autoplayEnabled ? 'video-icon-hidden' : ''}" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" focusable="false">
        <path d="M8 5v14l11-7L8 5z"/>
      </svg>
    </span>
    <span class="video-icon video-icon-pause ${autoplayEnabled ? '' : 'video-icon-hidden'}" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" focusable="false">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    </span>
  `;
  
  // Set initial is-playing state
  if (autoplayEnabled) {
    playPauseButton.classList.add('is-playing');
  }
  
  const updatePlayPauseState = () => {
    const isPlaying = !video.paused;
    playPauseButton.classList.toggle('is-playing', isPlaying);
    playPauseButton.querySelector('.video-icon-play')?.classList.toggle('video-icon-hidden', isPlaying);
    playPauseButton.querySelector('.video-icon-pause')?.classList.toggle('video-icon-hidden', !isPlaying);
    playPauseButton.setAttribute('aria-label', isPlaying ? 'Pause video' : 'Play video');
  };

  playPauseButton.addEventListener('click', () => {
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', updatePlayPauseState);
  video.addEventListener('pause', updatePlayPauseState);
  
  // Initial state update after a short delay to handle autoplay blocking
  setTimeout(() => {
    updatePlayPauseState();
  }, 100);
  
  container.appendChild(playPauseButton);
  return playPauseButton;
}

function decorateVideoOptions(block) {
  const video = block.querySelector('video');
  if (!video) {
    return;
  }

  // Handle video width (second row: video-width)
  const widthField = block.children[1];
  if (widthField) {
    const widthValue = widthField.querySelector('p')?.textContent?.trim();
    const videoContainer = video.closest('.teaser-video-container') || video.parentElement;
    if (videoContainer && widthValue) {
      videoContainer.style.width = widthValue;
    }
    widthField.remove();
  }

  // Handle boolean options (autoplay, loop, muted, controls) - rows 2–5 after width removal
  const autoplay = block.children[1];
  const loop = block.children[2];
  const muted = block.children[3];
  const controls = block.children[4];

  const autoplayValue = autoplay?.querySelector('p')?.textContent?.trim() || 'false';
  const loopValue = loop?.querySelector('p')?.textContent?.trim() || 'false';
  const mutedValue = muted?.querySelector('p')?.textContent?.trim() || 'false';
  const controlsValue = controls?.querySelector('p')?.textContent?.trim() || 'false';

  const autoplayEnabled = autoplayValue === 'true';
  const loopEnabled = loopValue === 'true';
  const mutedEnabled = mutedValue === 'true';
  const controlsEnabled = controlsValue === 'true';

  video.toggleAttribute('autoplay', autoplayEnabled);
  video.toggleAttribute('loop', loopEnabled);
  video.toggleAttribute('muted', mutedEnabled);
  video.toggleAttribute('controls', controlsEnabled);
  video.muted = mutedEnabled;
  video.loop = loopEnabled;
  video.autoplay = autoplayEnabled;
  video.controls = controlsEnabled;

  [autoplay, loop, muted, controls].filter(Boolean).forEach((el) => el.remove());
  
  // Add play/pause button for teaser video (if not showing native controls)
  if (!controlsEnabled) {
    const videoContainer = video.closest('.teaser-video-container') || video.closest('.hero-video-banner');
    if (videoContainer) {
      createPlayPauseButton(video, videoContainer, autoplayEnabled);
    }
  }
  
  return { autoplayEnabled, loopEnabled, mutedEnabled, controlsEnabled };
}

export default function decorate(block) {
  // Defensive: block must have at least one row
  const videoBanner = block.children[0];
  if (!videoBanner) {
    return;
  }

  videoBanner.classList.add('hero-video-banner');

  const heroContent = videoBanner.children[0];
  if (!heroContent) {
    return;
  }
  heroContent.classList.add('teaser-video-container');

  const teaserVideoLink = heroContent.querySelector('a');
  const teaserPicture = heroContent.querySelector('img');
  const placeholderImage = heroContent.querySelectorAll('picture')[1];

  if (placeholderImage) {
    placeholderImage.classList.add('placeholder-image');
    block.appendChild(placeholderImage);
  }

  const teaserVideo = decorateTeaser(teaserVideoLink, teaserPicture, heroContent, placeholderImage);
  const videoOptions = decorateVideoOptions(block);

  // Overlay (e.g. fullscreen link) is optional - only present when first row has two cells
  const overlay = videoBanner.children[1];
  if (!overlay) {
    return;
  }

  overlay.classList = 'overlay';
  const fullScreenVideoLink = overlay.querySelector('a:last-of-type');
  if (!fullScreenVideoLink) {
    return;
  }

  const fullScreenVideoLinkHref = fullScreenVideoLink.href;
  decorateOverlayButton(fullScreenVideoLink, block, overlay);
  decorateFullScreenVideo(fullScreenVideoLinkHref, teaserPicture, videoBanner);
}
