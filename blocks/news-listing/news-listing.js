import { useBlockConfig, isUE } from '../helpers.js';
import {
  domEl, div, ul, li, a, h2, h3, p, button, img, span,
} from '../../scripts/dom-builder.js';

const API_KEY = 'fa8be279f005e9112d5f0b27b8dfc93a';
const API_BASE = 'https://gnews.io/api/v4';
const ARTICLES_PER_FETCH = 10;
const INITIAL_ROWS = 4;
const COLUMNS = 4;
const INITIAL_CARDS = INITIAL_ROWS * COLUMNS;

const CATEGORIES = Object.freeze([
  { label: 'All', query: 'artificial intelligence OR robotics OR marketing' },
  { label: 'AI', query: 'artificial intelligence' },
  { label: 'Content Supply Chain', query: 'content supply chain digital asset management' },
  { label: 'Robotics', query: 'robotics automation' },
  { label: 'Marketing', query: 'digital marketing martech' },
]);

const BLOCK_CONFIG = Object.freeze({
  empty: true,
  FIELDS: {
    LISTING_TITLE: { index: 0, removeRow: true },
    LISTING_DESCRIPTION: { index: 1, removeRow: true },
    POST_PAGE_PATH: { index: 2, removeRow: true },
  },
});

const cache = new Map();

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function fetchNews(query, page = 1) {
  const cacheKey = `${query}-${page}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const params = new URLSearchParams({
    q: query,
    lang: 'en',
    max: String(ARTICLES_PER_FETCH),
    page: String(page),
    apikey: API_KEY,
  });

  const url = `${API_BASE}/search?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  cache.set(cacheKey, data.articles || []);
  return data.articles || [];
}

function storeArticle(article) {
  try {
    sessionStorage.setItem(
      `news-article-${article.url}`,
      JSON.stringify(article),
    );
  } catch {
    // sessionStorage may be full or unavailable
  }
}

function createCard(article, postPagePath) {
  const href = `${postPagePath}?source=${encodeURIComponent(article.url)}`;

  const imageEl = article.image
    ? img({ src: article.image, alt: article.title, loading: 'lazy' })
    : span({ class: 'news-card-placeholder' });

  const card = li(
    a(
      { href, class: 'news-card-link' },
      div({ class: 'news-card-image' }, imageEl),
      div(
        { class: 'news-card-body' },
        h3(article.title || ''),
        domEl('time', { datetime: article.publishedAt || '' }, formatDate(article.publishedAt)),
        p(article.description || ''),
      ),
    ),
  );

  card.querySelector('a').addEventListener('click', () => storeArticle(article));

  return card;
}

function createSkeletonCards(count) {
  const skeleton = div({ class: 'news-listing-skeleton' });
  for (let i = 0; i < count; i += 1) {
    skeleton.appendChild(
      div(
        { class: 'news-skeleton-card' },
        div({ class: 'news-skeleton-image' }),
        div(
          { class: 'news-skeleton-body' },
          div({ class: 'news-skeleton-line' }),
          div({ class: 'news-skeleton-line' }),
          div({ class: 'news-skeleton-line' }),
        ),
      ),
    );
  }
  return skeleton;
}

function createMessage(text, retryFn) {
  const msg = div({ class: 'news-listing-message' }, p(text));
  if (retryFn) {
    const retryBtn = button({ class: 'news-listing-retry' }, 'Try again');
    retryBtn.addEventListener('click', retryFn);
    msg.appendChild(retryBtn);
  }
  return msg;
}

function renderPlaceholder(block, titleText, descriptionText) {
  const header = div(
    { class: 'news-listing-header' },
    h2(titleText),
    p(descriptionText),
  );

  const filters = div({ class: 'news-listing-filters' });
  CATEGORIES.forEach((cat, i) => {
    filters.appendChild(
      button({ 'aria-pressed': i === 0 ? 'true' : 'false' }, cat.label),
    );
  });

  const grid = ul({ class: 'news-listing-grid' });
  for (let i = 0; i < 8; i += 1) {
    grid.appendChild(
      li(
        a(
          { href: '#', class: 'news-card-link' },
          div(
            { class: 'news-card-image' },
            span({ class: 'news-card-placeholder' }),
          ),
          div(
            { class: 'news-card-body' },
            h3('Sample News Article Title'),
            domEl('time', 'January 1, 2025'),
            p('This is a placeholder description for the news article card in Universal Editor preview mode.'),
          ),
        ),
      ),
    );
  }

  block.append(header, filters, grid);
}

export default async function decorate(block) {
  const {
    LISTING_TITLE,
    LISTING_DESCRIPTION,
    POST_PAGE_PATH,
  } = useBlockConfig(block, BLOCK_CONFIG);

  const titleText = LISTING_TITLE.text || 'Latest News';
  const descriptionText = LISTING_DESCRIPTION.text || 'Stay up to date with the latest news in technology and innovation.';
  const postPagePath = POST_PAGE_PATH.text || '/news/post';

  if (isUE()) {
    renderPlaceholder(block, titleText, descriptionText);
    return;
  }

  // Build header
  const header = div(
    { class: 'news-listing-header' },
    h2(titleText),
    p(descriptionText),
  );

  // Build filter bar
  const filters = div({ class: 'news-listing-filters' });
  const grid = ul({ class: 'news-listing-grid' });
  const sentinel = div({ class: 'news-listing-sentinel' });
  const skeleton = createSkeletonCards(COLUMNS);

  let currentQuery = CATEGORIES[0].query;
  let currentPage = 1;
  let allArticles = [];
  let displayedCount = 0;
  let isLoading = false;
  let hasMore = true;
  let observer;

  function showSpinner() {
    sentinel.innerHTML = '';
    sentinel.appendChild(div({ class: 'news-listing-spinner' }));
    sentinel.style.display = '';
  }

  function hideSpinner() {
    sentinel.innerHTML = '';
    sentinel.style.display = 'none';
  }

  function renderBatch() {
    const end = Math.min(displayedCount + INITIAL_CARDS, allArticles.length);
    for (let i = displayedCount; i < end; i += 1) {
      grid.appendChild(createCard(allArticles[i], postPagePath));
    }
    displayedCount = end;

    if (displayedCount >= allArticles.length && !hasMore) {
      hideSpinner();
      if (observer) observer.disconnect();
    }
  }

  async function loadMore() {
    if (isLoading || (!hasMore && displayedCount >= allArticles.length)) return;

    // If we have buffered articles to show, just render them
    if (displayedCount < allArticles.length) {
      renderBatch();
      return;
    }

    if (!hasMore) return;

    isLoading = true;
    showSpinner();

    try {
      const articles = await fetchNews(currentQuery, currentPage);
      if (articles.length === 0) {
        hasMore = false;
        hideSpinner();
        if (observer) observer.disconnect();
        if (allArticles.length === 0) {
          grid.innerHTML = '';
          grid.after(createMessage('No news articles found for this category.'));
        }
      } else {
        allArticles = allArticles.concat(articles);
        currentPage += 1;
        if (articles.length < ARTICLES_PER_FETCH) hasMore = false;
        renderBatch();
      }
    } catch {
      hideSpinner();
      if (allArticles.length === 0) {
        grid.after(createMessage('Unable to load news. Please try again later.', () => {
          block.querySelector('.news-listing-message')?.remove();
          loadMore();
        }));
      }
    } finally {
      isLoading = false;
    }
  }

  function setupObserver() {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' },
    );
    if (hasMore || displayedCount < allArticles.length) {
      showSpinner();
      observer.observe(sentinel);
    }
  }

  async function switchCategory(query) {
    currentQuery = query;
    currentPage = 1;
    allArticles = [];
    displayedCount = 0;
    hasMore = true;
    grid.innerHTML = '';
    block.querySelector('.news-listing-message')?.remove();
    if (observer) observer.disconnect();
    await loadMore();
    // Fetch more if needed to fill initial rows
    while (hasMore && allArticles.length < INITIAL_CARDS) {
      // eslint-disable-next-line no-await-in-loop
      await loadMore();
    }
    renderBatch();
    setupObserver();
  }

  // Create filter buttons
  CATEGORIES.forEach((cat, i) => {
    const btn = button({ 'aria-pressed': i === 0 ? 'true' : 'false' }, cat.label);
    btn.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      switchCategory(cat.query);
    });
    filters.appendChild(btn);
  });

  block.append(header, filters, skeleton, grid, sentinel);

  // Initial load
  try {
    while (hasMore && allArticles.length < INITIAL_CARDS) {
      isLoading = true;
      // eslint-disable-next-line no-await-in-loop
      const articles = await fetchNews(currentQuery, currentPage);
      if (articles.length === 0) {
        hasMore = false;
      } else {
        allArticles = allArticles.concat(articles);
        currentPage += 1;
        if (articles.length < ARTICLES_PER_FETCH) hasMore = false;
      }
    }
    isLoading = false;
    skeleton.remove();
    renderBatch();

    if (allArticles.length === 0) {
      grid.after(createMessage('No news articles found for this category.'));
    }

    setupObserver();
  } catch {
    isLoading = false;
    skeleton.remove();
    grid.after(createMessage('Unable to load news. Please try again later.', () => {
      block.querySelector('.news-listing-message')?.remove();
      switchCategory(currentQuery);
    }));
  }
}
