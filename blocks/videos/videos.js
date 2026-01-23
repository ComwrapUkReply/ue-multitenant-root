function decorateTeaserPicture(teaserPicture, target) {
  teaserPicture.parentElement.classList.add('videos-cover');
  target.appendChild(teaserPicture.parentElement);
}

function playvideosAnimation(e) {
  const [playIcon] = e.target
    .closest('.hero-videos')
    .querySelectorAll('.play-pause-fullscreen-button svg');

  playIcon.style.opacity = 1;
  setTimeout(() => {
    playIcon.style.opacity = 0;
  }, 400);
}

function pausevideosAnimation(e) {
  const [, pauseIcon] = e.target
    .closest('.hero-videos')
    .querySelectorAll('.play-pause-fullscreen-button svg');

  pauseIcon.style.opacity = 1;
  setTimeout(() => {
    pauseIcon.style.opacity = 0;
  }, 400);
}

function decorateTeaser(videos, teaserPicture, target) {
  if (!videos && !teaserPicture) {
    return;
  }

  if (!videos) {
    teaserPicture.style.setProperty('display', 'block', 'important');
    decorateTeaserPicture(teaserPicture, target);
    return;
  }

  const videosTag = document.createElement('videos');
  if (!teaserPicture) {
    videosTag.style.setProperty('display', 'block', 'important');
  } else {
    videosTag.setAttribute('poster', teaserPicture.currentSrc);
    decorateTeaserPicture(teaserPicture, target);
  }

  videosTag.classList.add('videos-cover');
  videosTag.toggleAttribute('muted', true);
  videosTag.toggleAttribute('loop', true);
  videosTag.setAttribute('controls', true);
  videosTag.setAttribute('title', videos.title);

  const mql = window.matchMedia('only screen and (max-width: 768px)');
  if (mql.matches && teaserPicture) {
    videosTag.setAttribute('preload', 'metadata');
  } else {
    videosTag.toggleAttribute('autoplay', true);
  }

  mql.onchange = (e) => {
    if (!e.matches && !videosTag.hasAttribute('autoplay')) {
      videosTag.toggleAttribute('autoplay', true);
      videosTag.play();
    }
  };

  videosTag.innerHTML = `<source src="${videos.href}" type="videos/mp4">`;
  target.prepend(videosTag);
  videosTag.muted = true;
  videos.remove();
}

function decorateOverlayButton(fullScreenvideosLink, block, overlay) {
  const button = document.createElement('button');
  button.classList.add('videos-banner-btn');

  button.innerHTML = fullScreenvideosLink.innerHTML;

  button.addEventListener('click', () => {
    const fullvideosContainer = block.querySelector('.full-videos-container');
    fullvideosContainer.style.display = 'block';
    const videos = fullvideosContainer.querySelector('videos');
    videos.play();
    setTimeout(() => {
      videos.addEventListener('play', playvideosAnimation);
      videos.addEventListener('pause', pausevideosAnimation);
    });
  });

  overlay.appendChild(button);
  fullScreenvideosLink.remove();
}

function createIcons(target, iconNames) {
  iconNames.forEach((iconName) => {
    const icon = document.createElement('span');
    icon.classList.add('icon');
    icon.classList.add(`icon-${iconName}`);

    target.appendChild(icon);
  });
}

function togglevideosPlay(videos) {
  if (videos.paused) {
    videos.play();
  } else {
    videos.pause();
  }
}

async function decorateFullScreenvideos(fullScreenvideosLink, teaserPicture, target) {
  const fullvideosContainer = document.createElement('div');
  fullvideosContainer.classList.add('full-videos-container');

  const videos = document.createElement('videos');
  videos.classList.add('videos-cover');
  videos.innerHTML = `<source src="${fullScreenvideosLink}" type="videos/mp4">`;
  videos.setAttribute('preload', 'metadata');
  videos.setAttribute('poster', teaserPicture.currentSrc);

  videos.addEventListener('click', () => { togglevideosPlay(videos); });

  const closevideosButton = document.createElement('div');
  closevideosButton.classList.add('close-videos');
  createIcons(closevideosButton, ['close-videos']);
  closevideosButton.addEventListener('click', () => {
    videos.removeEventListener('pause', pausevideosAnimation);
    videos.removeEventListener('play', playvideosAnimation);
    videos.pause();
    videos.currentTime = 0;
    videos.load();
    fullvideosContainer.style.display = 'none';
  });

  const playPausevideosButton = document.createElement('div');
  playPausevideosButton.classList.add('play-pause-fullscreen-button');
  createIcons(playPausevideosButton, ['full-screen-play', 'full-screen-pause']);
  playPausevideosButton.addEventListener('click', () => { togglevideosPlay(videos); });

  fullvideosContainer.appendChild(closevideosButton);
  fullvideosContainer.appendChild(playPausevideosButton);
  fullvideosContainer.appendChild(videos);
  target.appendChild(fullvideosContainer);
}

export default function decorate(block) {
  const videosBanner = block.children[0];
  videosBanner.classList.add('hero-videos-banner');
  const heroContent = videosBanner.children[0];
  heroContent.classList.add('teaser-videos-container');

  const teaservideosLink = heroContent.querySelector('a');
  const teaserPicture = heroContent.querySelector('img');
  const placeholderImage = heroContent.querySelectorAll('picture')[1];

  if (placeholderImage) {
    placeholderImage.classList.add('placeholder-image');
    block.appendChild(placeholderImage);
  }

  // preloadLCPImage(teaserPicture.src);
  decorateTeaser(teaservideosLink, teaserPicture, heroContent, placeholderImage);

  const overlay = videosBanner.children[1];
  overlay.classList = 'overlay';

  const fullScreenvideosLink = overlay.querySelector('a:last-of-type');
  if (!fullScreenvideosLink) {
    return;
  }
  const fullScreenvideosLinkHref = fullScreenvideosLink.href;
  decorateOverlayButton(fullScreenvideosLink, block, overlay);
  decorateFullScreenvideos(fullScreenvideosLinkHref, teaserPicture, videosBanner);
}
