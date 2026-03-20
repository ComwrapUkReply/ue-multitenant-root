import { useBlockConfig, isUE } from '../helpers.js';
import {
  domEl, div, a, h2, p, span,
} from '../../scripts/dom-builder.js';

const BLOCK_CONFIG = Object.freeze({
  empty: true,
  FIELDS: {
    BACK_BUTTON_LABEL: { index: 0, removeRow: true },
    BACK_BUTTON_PATH: { index: 1, removeRow: true },
    SOURCE_LABEL: { index: 2, removeRow: true },
  },
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function renderPlaceholder(block, backLabel, backPath) {
  const backLink = a({ href: backPath, class: 'news-post-back' }, backLabel);
  const image = div(
    { class: 'news-post-image' },
    div({ class: 'news-post-image-placeholder' }, 'Article Image'),
  );
  const meta = div(
    { class: 'news-post-meta' },
    domEl('time', 'January 1, 2025'),
    span({ class: 'news-post-meta-separator' }),
    span('News Source'),
  );
  const title = domEl('h1', { class: 'news-post-title' }, 'Sample News Article Title for Preview');
  const content = div(
    { class: 'news-post-content' },
    p('This is a placeholder article content shown in Universal Editor preview mode. The actual content will be fetched from the news API when viewed on the published site.'),
  );
  const source = a(
    {
      href: '#', class: 'news-post-source', target: '_blank', rel: 'noopener noreferrer',
    },
    'Read full article at source',
  );

  block.append(backLink, image, meta, title, content, source);
}

function renderFallback(block, backLabel, backPath, sourceLabel, sourceUrl) {
  const fallback = div(
    { class: 'news-post-fallback' },
    h2('Article preview unavailable'),
    p('This article is not available for inline preview. You can read it at the original source or go back to the news listing.'),
    div(
      { class: 'news-post-fallback-actions' },
      ...(sourceUrl
        ? [a({
          href: sourceUrl, class: 'news-post-source', target: '_blank', rel: 'noopener noreferrer',
        }, sourceLabel)]
        : []),
      a({ href: backPath, class: 'news-post-back' }, backLabel),
    ),
  );
  block.appendChild(fallback);
}

function renderArticle(block, article, backLabel, backPath, sourceLabel) {
  const backLink = a({ href: backPath, class: 'news-post-back' }, backLabel);

  const imageContainer = div({ class: 'news-post-image' });
  if (article.image) {
    imageContainer.appendChild(
      domEl('img', { src: article.image, alt: article.title, loading: 'eager' }),
    );
  } else {
    imageContainer.appendChild(
      div({ class: 'news-post-image-placeholder' }, 'No image available'),
    );
  }

  const meta = div(
    { class: 'news-post-meta' },
    domEl('time', { datetime: article.publishedAt || '' }, formatDate(article.publishedAt)),
    span({ class: 'news-post-meta-separator' }),
    span(article.source?.name || 'Unknown source'),
  );

  const title = domEl('h1', { class: 'news-post-title' }, article.title || '');

  const contentText = article.content || article.description || '';
  const content = div(
    { class: 'news-post-content' },
    p(contentText),
  );

  const source = a(
    {
      href: article.url, class: 'news-post-source', target: '_blank', rel: 'noopener noreferrer',
    },
    sourceLabel,
  );

  block.append(backLink, imageContainer, meta, title, content, source);
}

export default function decorate(block) {
  const {
    BACK_BUTTON_LABEL,
    BACK_BUTTON_PATH,
    SOURCE_LABEL,
  } = useBlockConfig(block, BLOCK_CONFIG);

  const backLabel = BACK_BUTTON_LABEL.text || 'Back to News';
  const backPath = BACK_BUTTON_PATH.text || '/news';
  const sourceLabel = SOURCE_LABEL.text || 'Read full article at source';

  if (isUE()) {
    renderPlaceholder(block, backLabel, backPath);
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const sourceUrl = params.get('source');

  if (!sourceUrl) {
    renderFallback(block, backLabel, backPath, sourceLabel, null);
    return;
  }

  let article = null;
  try {
    const stored = sessionStorage.getItem(`news-article-${sourceUrl}`);
    if (stored) article = JSON.parse(stored);
  } catch {
    // sessionStorage unavailable
  }

  if (article) {
    renderArticle(block, article, backLabel, backPath, sourceLabel);
  } else {
    renderFallback(block, backLabel, backPath, sourceLabel, sourceUrl);
  }
}
