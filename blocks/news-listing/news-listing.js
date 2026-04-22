import { getMetadata } from '../../scripts/aem.js';

// The Guardian Open Platform — https://open-platform.theguardian.com/access/
// Free tier: 5,000 requests/day, 12 req/sec, no credit card required
const GUARDIAN_API_BASE = 'https://content.guardianapis.com/search';
const GUARDIAN_KEY_META = 'guardian-apikey';
const GUARDIAN_FIELDS = 'thumbnail,trailText,headline';

// TODO: remove before production — use page metadata "guardian-apikey" instead
const DEV_API_KEY = '723cc7cb-6c79-436d-992b-a532f7574c0f';

const ARTICLES_PER_FETCH = 10;
const INITIAL_ROWS = 4;
const COLUMNS = 4;
const INITIAL_CARDS = INITIAL_ROWS * COLUMNS;
const META_KEYS = Object.freeze({
  provider: 'news-provider',
});

const PROVIDERS = Object.freeze({
  gnews: Object.freeze({
    name: 'gnews',
    apiBase: 'https://gnews.io/api/v4',
    keyMeta: 'fa8be279f005e9112d5f0b27b8dfc93a',
  }),
  currents: Object.freeze({
    name: 'currents',
    apiBase: 'https://api.currentsapi.services/v1',
    keyMeta: '29Ajftr5l2CQ34rLqYucXoJpPFCsGgdDitM3ZCQuWJOfiLrf',
  }),
});

// Reusable string constants to keep lines within the 100-char limit
const UE_PLACEHOLDER_DESC = 'This is a placeholder description for the news article card in Universal Editor preview mode.';
const DEFAULT_DESC = 'Stay up to date with the latest news in technology and innovation.';
const CONFIG_MSG = 'News feed is not configured. Add "guardian-apikey" in page metadata.';

const CATEGORIES = Object.freeze([
  { label: 'All', query: 'artificial intelligence OR robotics OR marketing' },
  { label: 'AI', query: 'artificial intelligence' },
  { label: 'Adobe', query: 'adobe experience cloud' },
  { label: 'Robotics', query: 'robotics automation' },
  { label: 'Marketing', query: 'digital marketing martech' },
]);

function isUE() {
  const { classList } = document.documentElement;
  return classList.contains('adobe-ue-edit') || classList.contains('adobe-ue-preview');
}

function extractBlockFields(block) {
  const rows = Array.from(block.children);
  const titleRow = rows[0];
  const descRow = rows[1];
  const pathRow = rows[2];
  const fields = {
    title: titleRow?.textContent?.trim() || '',
    description: descRow?.textContent?.trim() || '',
    postPagePath: pathRow?.textContent?.trim() || '',
  };
  [titleRow, descRow, pathRow].forEach((row) => row?.remove());
  block.textContent = '';
  return fields;
}

const cache = new Map();

function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  children.forEach((child) => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child) {
      element.appendChild(child);
    }
  });
  return element;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getApiKey() {
  return getMetadata(GUARDIAN_KEY_META).trim() || DEV_API_KEY;
}

function mapGuardianArticle(article) {
  return {
    title: article?.fields?.headline || article?.webTitle || '',
    description: article?.fields?.trailText || '',
    url: article?.webUrl || '',
    image: article?.fields?.thumbnail || '',
    publishedAt: article?.webPublicationDate || '',
  };
}

async function fetchNews(query, apiKey, page = 1) {
  const cacheKey = `${query}-${page}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const params = new URLSearchParams({
    q: query,
    'api-key': apiKey,
    'page-size': String(ARTICLES_PER_FETCH),
    page: String(page),
    'show-fields': GUARDIAN_FIELDS,
    'order-by': 'newest',
  });

  const url = `${GUARDIAN_API_BASE}?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw Object.assign(
      new Error(`Guardian API error: ${response.status}`),
      { status: response.status },
    );
  }

  const data = await response.json();
  const articles = (data?.response?.results || []).map(mapGuardianArticle);
  const totalPages = data?.response?.pages ?? 0;
  const currentPage = data?.response?.currentPage ?? page;
  const result = { articles, hasNextPage: currentPage < totalPages };
  cache.set(cacheKey, result);
  return result;
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
    ? el('img', { src: article.image, alt: article.title, loading: 'lazy' })
    : el('span', { class: 'news-card-placeholder' });

  const card = el(
    'li',
    {},
    el(
      'a',
      { href, class: 'news-card-link' },
      el('div', { class: 'news-card-image' }, imageEl),
      el(
        'div',
        { class: 'news-card-body' },
        el('h3', {}, article.title || ''),
        el('time', { datetime: article.publishedAt || '' }, formatDate(article.publishedAt)),
        el('p', {}, article.description || ''),
      ),
    ),
  );

  card.querySelector('a').addEventListener('click', () => storeArticle(article));

  return card;
}

function createSkeletonCards(count) {
  const skeleton = el('div', { class: 'news-listing-skeleton' });
  for (let i = 0; i < count; i += 1) {
    skeleton.appendChild(
      el(
        'div',
        { class: 'news-skeleton-card' },
        el('div', { class: 'news-skeleton-image' }),
        el(
          'div',
          { class: 'news-skeleton-body' },
          el('div', { class: 'news-skeleton-line' }),
          el('div', { class: 'news-skeleton-line' }),
          el('div', { class: 'news-skeleton-line' }),
        ),
      ),
    );
  }
  return skeleton;
}

function createMessage(text, retryFn) {
  const msg = el('div', { class: 'news-listing-message' }, el('p', {}, text));
  if (retryFn) {
    const retryBtn = el('button', { class: 'news-listing-retry' }, 'Try again');
    retryBtn.addEventListener('click', retryFn);
    msg.appendChild(retryBtn);
  }
  return msg;
}

function getErrorMessage(error) {
  const { status } = error || {};
  if (status === 401 || status === 403) {
    return 'Unable to access the news feed. Please verify "guardian-apikey" in page metadata.';
  }
  if (status === 429) {
    return 'News feed rate limit reached. Please try again later.';
  }
  return 'Unable to load news. Please try again later.';
}

function renderPlaceholder(block, titleText, descriptionText) {
  const header = el(
    'div',
    { class: 'news-listing-header' },
    el('h2', {}, titleText),
    el('p', {}, descriptionText),
  );

  const filters = el('div', { class: 'news-listing-filters' });
  CATEGORIES.forEach((cat, i) => {
    filters.appendChild(
      el('button', { 'aria-pressed': i === 0 ? 'true' : 'false' }, cat.label),
    );
  });

  const grid = el('ul', { class: 'news-listing-grid' });
  for (let i = 0; i < 8; i += 1) {
    grid.appendChild(
      el(
        'li',
        {},
        el(
          'a',
          { href: '#', class: 'news-card-link' },
          el('div', { class: 'news-card-image' }, el('span', { class: 'news-card-placeholder' })),
          el(
            'div',
            { class: 'news-card-body' },
            el('h3', {}, 'Sample News Article Title'),
            el('time', {}, 'January 1, 2025'),
            el('p', {}, UE_PLACEHOLDER_DESC),
          ),
        ),
      ),
    );
  }

  block.append(header, filters, grid);
}

export default async function decorate(block) {
  const fields = extractBlockFields(block);
  const titleText = fields.title || 'Latest News';
  const descriptionText = fields.description || DEFAULT_DESC;
  const postPagePath = fields.postPagePath || '/news/post';

  if (isUE()) {
    renderPlaceholder(block, titleText, descriptionText);
    return;
  }

  const apiKey = getApiKey();

  // Build header with animated category label
  const categorySpan = el('span', { class: 'news-listing-category' }, CATEGORIES[0].label);
  const titleEl = el('h2', {}, 'Latest ');
  titleEl.appendChild(categorySpan);
  titleEl.appendChild(document.createTextNode(' News'));

  const header = el(
    'div',
    { class: 'news-listing-header' },
    titleEl,
    el('p', {}, descriptionText),
  );

  const filters = el('div', { class: 'news-listing-filters' });
  const grid = el('ul', { class: 'news-listing-grid' });
  const skeleton = createSkeletonCards(COLUMNS);
  const loadMoreBtn = el(
    'button',
    { class: 'news-listing-load-more', style: 'display:none' },
    'Load More News',
  );

  let currentQuery = CATEGORIES[0].query;
  let currentPage = 1;
  let allArticles = [];
  let displayedCount = 0;
  let isLoading = false;
  let hasMore = true;

  // Show/hide and enable/disable the load-more button
  function updateButton() {
    const moreAvailable = hasMore || displayedCount < allArticles.length;
    loadMoreBtn.style.display = moreAvailable ? '' : 'none';
    loadMoreBtn.disabled = isLoading;
    loadMoreBtn.textContent = isLoading ? 'Loading…' : 'Load More News';
  }

  function renderBatch() {
    const end = Math.min(displayedCount + INITIAL_CARDS, allArticles.length);
    for (let i = displayedCount; i < end; i += 1) {
      grid.appendChild(createCard(allArticles[i], postPagePath));
    }
    displayedCount = end;
    updateButton();
  }

  async function loadMore() {
    if (isLoading || (!hasMore && displayedCount >= allArticles.length)) return;

    // Still have buffered articles — just render the next batch
    if (displayedCount < allArticles.length) {
      renderBatch();
      return;
    }

    if (!hasMore) return;

    isLoading = true;
    updateButton();

    try {
      const { articles, hasNextPage } = await fetchNews(currentQuery, apiKey, currentPage);
      if (articles.length === 0) {
        hasMore = false;
        if (allArticles.length === 0) {
          grid.innerHTML = '';
          grid.after(createMessage('No news articles found for this category.'));
        }
      } else {
        allArticles = allArticles.concat(articles);
        currentPage += 1;
        hasMore = hasNextPage;
        renderBatch();
      }
    } catch (error) {
      if (allArticles.length === 0) {
        grid.after(createMessage(getErrorMessage(error), () => {
          block.querySelector('.news-listing-message')?.remove();
          loadMore();
        }));
      }
    } finally {
      isLoading = false;
      updateButton();
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
    loadMoreBtn.style.display = 'none';

    // Pre-fetch enough articles to fill the initial rows
    while (hasMore && allArticles.length < INITIAL_CARDS) {
      isLoading = true;
      updateButton();
      try {
        // eslint-disable-next-line no-await-in-loop
        const { articles, hasNextPage } = await fetchNews(currentQuery, apiKey, currentPage);
        if (articles.length === 0) {
          hasMore = false;
        } else {
          allArticles = allArticles.concat(articles);
          currentPage += 1;
          hasMore = hasNextPage;
        }
      } catch (error) {
        isLoading = false;
        updateButton();
        grid.after(createMessage(getErrorMessage(error), () => {
          block.querySelector('.news-listing-message')?.remove();
          switchCategory(query);
        }));
        return;
      }
    }

    isLoading = false;
    renderBatch();

    if (allArticles.length === 0) {
      grid.after(createMessage('No news articles found for this category.'));
    }
  }

  loadMoreBtn.addEventListener('click', () => loadMore());

  CATEGORIES.forEach((cat, i) => {
    const btn = el('button', { 'aria-pressed': i === 0 ? 'true' : 'false' }, cat.label);
    btn.addEventListener('click', () => {
      filters.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      categorySpan.classList.add('news-listing-category-out');
      setTimeout(() => {
        categorySpan.textContent = cat.label;
        categorySpan.classList.remove('news-listing-category-out');
        categorySpan.classList.add('news-listing-category-in');
        setTimeout(() => categorySpan.classList.remove('news-listing-category-in'), 300);
      }, 300);
      switchCategory(cat.query);
    });
    filters.appendChild(btn);
  });

  block.append(header, filters, skeleton, grid, loadMoreBtn);

  if (!apiKey) {
    skeleton.remove();
    grid.after(createMessage(CONFIG_MSG));
    return;
  }

  // Initial load — fill first page of cards
  try {
    while (hasMore && allArticles.length < INITIAL_CARDS) {
      isLoading = true;
      // eslint-disable-next-line no-await-in-loop
      const { articles, hasNextPage } = await fetchNews(currentQuery, apiKey, currentPage);
      if (articles.length === 0) {
        hasMore = false;
      } else {
        allArticles = allArticles.concat(articles);
        currentPage += 1;
        hasMore = hasNextPage;
      }
    }
    isLoading = false;
    skeleton.remove();
    renderBatch();

    if (allArticles.length === 0) {
      grid.after(createMessage('No news articles found for this category.'));
    }
  } catch (error) {
    isLoading = false;
    skeleton.remove();
    grid.after(createMessage(getErrorMessage(error), () => {
      block.querySelector('.news-listing-message')?.remove();
      switchCategory(currentQuery);
    }));
  }
}
