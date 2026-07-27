/**
 * Schema.org JSON-LD builder and injector for Edge Delivery Services pages.
 * Reads page metadata from <head> meta tags (Universal Editor page properties).
 */

import { getMetadata } from './aem.js';

const SCHEMA_CONTEXT = 'https://schema.org';
const SCRIPT_ATTR = 'data-seo-schema';

const ARTICLE_TYPES = ['Article', 'NewsArticle', 'BlogPosting'];

const CONFIG = Object.freeze({
  metaKeys: {
    enabled: 'schema-enabled',
    type: 'schema-type',
    rawJsonLd: 'schema-jsonld',
    headline: 'schema-headline',
    description: 'schema-description',
    image: 'schema-image',
    author: 'schema-author',
    orgName: 'schema-org-name',
    orgUrl: 'schema-org-url',
    eventStart: 'schema-event-start',
    eventEnd: 'schema-event-end',
    eventLocation: 'schema-event-location',
    videoUrl: 'schema-video-url',
  },
  fallbacks: {
    title: ['jcr:title', 'og:title'],
    description: ['jcr:description', 'og:description'],
    image: ['og:image'],
    author: ['author', 'author-name', 'article:author'],
    orgName: ['brand', 'events:organizer'],
    publishDate: ['publishDate', 'article_publish_date'],
  },
  defaultType: 'WebPage',
  breadcrumbSelector: 'main .breadcrumbs nav[aria-label="Breadcrumb"] a, main .breadcrumbs a',
});

/**
 * @param {string} value
 * @returns {boolean}
 */
function isTruthyMeta(value) {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

/**
 * @param {string} primary
 * @param {string[]} fallbacks
 * @param {(name: string) => string} readMeta
 * @returns {string}
 */
function firstMeta(primary, fallbacks, readMeta) {
  const direct = readMeta(primary);
  if (direct) return direct;
  const chain = fallbacks || [];
  for (let i = 0; i < chain.length; i += 1) {
    const val = readMeta(chain[i]);
    if (val) return val;
  }
  return '';
}

/**
 * @param {(name: string) => string} readMeta
 * @returns {Record<string, string>}
 */
export function collectSchemaMeta(readMeta = getMetadata) {
  const keys = CONFIG.metaKeys;
  return {
    enabled: readMeta(keys.enabled),
    type: readMeta(keys.type) || CONFIG.defaultType,
    rawJsonLd: readMeta(keys.rawJsonLd),
    headline: firstMeta(keys.headline, CONFIG.fallbacks.title, readMeta),
    description: firstMeta(keys.description, CONFIG.fallbacks.description, readMeta),
    image: firstMeta(keys.image, CONFIG.fallbacks.image, readMeta),
    author: firstMeta(keys.author, CONFIG.fallbacks.author, readMeta),
    orgName: firstMeta(keys.orgName, CONFIG.fallbacks.orgName, readMeta),
    orgUrl: readMeta(keys.orgUrl),
    eventStart: readMeta(keys.eventStart),
    eventEnd: readMeta(keys.eventEnd),
    eventLocation: readMeta(keys.eventLocation),
    videoUrl: readMeta(keys.videoUrl),
    publishDate: firstMeta('publishDate', CONFIG.fallbacks.publishDate, readMeta),
    pageUrl: typeof window !== 'undefined' ? window.location.href.split('#')[0] : '',
  };
}

/**
 * @returns {object|null}
 */
export function buildBreadcrumbList() {
  if (typeof document === 'undefined') return null;
  const links = [...document.querySelectorAll(CONFIG.breadcrumbSelector)];
  if (!links.length) return null;

  const itemListElement = links.map((anchor, index) => {
    const href = anchor.getAttribute('href') || '';
    const name = (anchor.textContent || '').trim();
    const item = {
      '@type': 'ListItem',
      position: index + 1,
      name,
    };
    if (href) {
      try {
        item.item = new URL(href, window.location.origin).href;
      } catch {
        item.item = href;
      }
    }
    return item;
  });

  return {
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

/**
 * @param {string} type
 * @param {Record<string, string>} meta
 * @returns {object}
 */
function buildBaseEntity(type, meta) {
  const entity = {
    '@context': SCHEMA_CONTEXT,
    '@type': type,
    url: meta.pageUrl,
  };

  const titleField = ARTICLE_TYPES.includes(type) ? 'headline' : 'name';
  if (meta.headline) entity[titleField] = meta.headline;
  if (meta.description) entity.description = meta.description;
  if (meta.image) entity.image = meta.image;

  return entity;
}

/**
 * @param {object} entity
 * @param {Record<string, string>} meta
 */
function applyArticleFields(entity, meta) {
  if (meta.author) {
    entity.author = {
      '@type': 'Person',
      name: meta.author,
    };
  }
  if (meta.publishDate) {
    entity.datePublished = meta.publishDate;
  }
  const publisherName = meta.orgName;
  if (publisherName) {
    entity.publisher = {
      '@type': 'Organization',
      name: publisherName,
    };
    if (meta.orgUrl) entity.publisher.url = meta.orgUrl;
  }
}

/**
 * @param {object} entity
 * @param {Record<string, string>} meta
 */
function applyEventFields(entity, meta) {
  if (meta.eventStart) entity.startDate = meta.eventStart;
  if (meta.eventEnd) entity.endDate = meta.eventEnd;
  if (meta.eventLocation) {
    entity.location = {
      '@type': 'Place',
      name: meta.eventLocation,
    };
  }
  if (meta.orgName) {
    entity.organizer = {
      '@type': 'Organization',
      name: meta.orgName,
    };
  }
}

/**
 * @param {object} entity
 * @param {Record<string, string>} meta
 */
function applyOrganizationFields(entity, meta) {
  if (meta.orgName) entity.name = meta.orgName;
  if (meta.orgUrl) entity.url = meta.orgUrl;
  if (meta.image) entity.logo = meta.image;
}

/**
 * @param {object} entity
 * @param {Record<string, string>} meta
 */
function applyVideoFields(entity, meta) {
  if (meta.videoUrl) entity.contentUrl = meta.videoUrl;
  if (meta.headline) entity.name = meta.headline;
  if (meta.image) entity.thumbnailUrl = meta.image;
}

/**
 * @param {string} type
 * @param {Record<string, string>} meta
 * @returns {object|null}
 */
export function buildJsonLd(type, meta) {
  if (!type || !meta) return null;

  const schemaType = type.trim() || CONFIG.defaultType;
  const entity = buildBaseEntity(schemaType, meta);

  if (ARTICLE_TYPES.includes(schemaType)) {
    applyArticleFields(entity, meta);
  } else if (schemaType === 'Event') {
    applyEventFields(entity, meta);
  } else if (schemaType === 'Organization') {
    applyOrganizationFields(entity, meta);
  } else if (schemaType === 'VideoObject') {
    applyVideoFields(entity, meta);
  }

  const breadcrumbs = buildBreadcrumbList();
  if (breadcrumbs && schemaType !== 'BreadcrumbList') {
    const { '@context': ctx, ...primary } = entity;
    return {
      '@context': ctx || SCHEMA_CONTEXT,
      '@graph': [primary, breadcrumbs],
    };
  }

  return entity;
}

/**
 * @param {string} raw
 * @returns {object|string|null}
 */
export function parseRawJsonLd(raw) {
  if (!raw || !String(raw).trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

/**
 * @param {object|string} jsonLd
 */
export function injectSchemaScript(jsonLd) {
  if (!jsonLd || typeof document === 'undefined') return;

  const existing = document.head.querySelector(`script[type="application/ld+json"][${SCRIPT_ATTR}]`);
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.setAttribute(SCRIPT_ATTR, 'true');
  script.textContent = typeof jsonLd === 'string' ? jsonLd : JSON.stringify(jsonLd);
  document.head.appendChild(script);
}

/**
 * Entry point: read metadata, build JSON-LD, inject into document head.
 * @param {(name: string) => string} [readMeta]
 */
export function injectSeoSchema(readMeta = getMetadata) {
  const meta = collectSchemaMeta(readMeta);
  if (!isTruthyMeta(meta.enabled)) return;

  const raw = parseRawJsonLd(meta.rawJsonLd);
  if (raw) {
    injectSchemaScript(raw);
    return;
  }

  const payload = buildJsonLd(meta.type, meta);
  if (payload) injectSchemaScript(payload);
}
