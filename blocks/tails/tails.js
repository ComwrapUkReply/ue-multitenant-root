import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/** Selectors used for tail card structure */
const SELECTORS = {
  picture: 'picture',
  heading: 'h1, h2, h3, h4, h5, h6',
};

/** Class names for flip card structure */
const CLASSES = {
  card: 'tails-card',
  inner: 'tails-card-inner',
  front: 'tails-card-front',
  back: 'tails-card-back',
  image: 'tails-tail-image',
  titleWrap: 'tails-card-title-wrap',
  body: 'tails-tail-body',
};

/**
 * Build flip-card structure: front (image + title overlay), back (description).
 * @param {HTMLElement} li - List item containing image and body divs
 */
function buildFlipCard(li) {
  const imageDiv = li.querySelector(`.${CLASSES.image}`) ?? li.querySelector(':scope > div:first-child');
  const bodyDiv = li.querySelector(`.${CLASSES.body}`) ?? li.querySelector(':scope > div:last-child');

  if (!imageDiv || !bodyDiv) return;

  const heading = bodyDiv.querySelector(SELECTORS.heading);
  const titleWrap = document.createElement('div');
  titleWrap.className = CLASSES.titleWrap;
  if (heading) {
    titleWrap.append(heading);
    heading.remove();
  }

  const inner = document.createElement('div');
  inner.className = CLASSES.inner;

  const front = document.createElement('div');
  front.className = CLASSES.front;
  front.append(imageDiv.cloneNode(true));
  front.insertBefore(titleWrap, front.firstChild);

  const back = document.createElement('div');
  back.className = CLASSES.back;
  const backContent = document.createElement('div');
  backContent.className = 'tails-card-back-richtext';
  backContent.append(bodyDiv);
  back.append(backContent);

  inner.append(front, back);
  li.textContent = '';
  li.className = CLASSES.card;
  li.append(inner);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector(SELECTORS.picture)) {
        div.className = CLASSES.image;
      } else {
        div.className = CLASSES.body;
      }
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  ul.querySelectorAll('li').forEach(buildFlipCard);

  block.textContent = '';
  block.append(ul);
}
