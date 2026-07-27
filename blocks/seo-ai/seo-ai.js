/**
 * Authoring-only block: generates Schema.org JSON-LD via an edge function.
 * Renders nothing on published pages.
 */

import { getMetadata } from '../../scripts/aem.js';
import { isUEEdit } from '../helpers.js';

const CONFIG = Object.freeze({
  selectors: {
    provider: '[data-aue-prop="ai-provider"]',
    endpoint: '[data-aue-prop="ai-endpoint"]',
    schemaType: '[data-aue-prop="schema-type"]',
  },
  classes: {
    panel: 'seo-ai-panel',
    button: 'seo-ai-generate',
    status: 'seo-ai-status',
    busy: 'is-busy',
  },
  meta: {
    jsonLd: 'schema-jsonld',
    enabled: 'schema-enabled',
    pageType: 'schema-type',
  },
  defaultEndpoint: '/api/seo-generate',
});

/**
 * @param {HTMLElement} root
 * @param {string} selector
 * @returns {string}
 */
function readBlockField(root, selector) {
  const el = root.querySelector(selector);
  if (!el) return '';
  return (el.textContent || '').trim();
}

/**
 * @param {string} name
 * @param {string} content
 */
function setPageMetaContent(name, content) {
  if (!name) return;
  let meta = document.head.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content || '');
}

/**
 * @param {HTMLElement} statusEl
 * @param {string} message
 * @param {'info'|'success'|'error'} [variant]
 */
function setStatus(statusEl, message, variant = 'info') {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.variant = variant;
}

/**
 * @param {HTMLElement} block
 * @returns {Promise<void>}
 */
async function onGenerate(block) {
  const button = block.querySelector(`.${CONFIG.classes.button}`);
  const statusEl = block.querySelector(`.${CONFIG.classes.status}`);
  if (!button) return;

  const endpoint = readBlockField(block, CONFIG.selectors.endpoint) || CONFIG.defaultEndpoint;
  const aiProvider = readBlockField(block, CONFIG.selectors.provider) || 'openai';
  const schemaType = readBlockField(block, CONFIG.selectors.schemaType)
    || getMetadata(CONFIG.meta.pageType)
    || 'WebPage';

  const payload = {
    pagePath: window.location.pathname,
    schemaType,
    title: getMetadata('jcr:title') || getMetadata('og:title'),
    description: getMetadata('jcr:description') || getMetadata('og:description'),
    template: getMetadata('template'),
    aiProvider,
  };

  button.classList.add(CONFIG.classes.busy);
  button.disabled = true;
  setStatus(statusEl, 'Generating JSON-LD…', 'info');

  try {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (endpoint.startsWith('/')) {
      try {
        const tokenResp = await fetch('/libs/granite/csrf/token.json', { credentials: 'same-origin' });
        if (tokenResp.ok) {
          const tokenData = await tokenResp.json();
          if (tokenData && tokenData.token) {
            headers['CSRF-Token'] = tokenData.token;
          }
        }
      } catch {
        // CSRF optional for external endpoints
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      credentials: endpoint.startsWith('/') ? 'same-origin' : 'omit',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data || data.success !== true) {
      const errMsg = (data && data.error) ? data.error : `HTTP ${response.status}`;
      setStatus(statusEl, `Generation failed: ${errMsg}`, 'error');
      return;
    }

    const jsonLd = typeof data.jsonLd === 'string' ? data.jsonLd : JSON.stringify(data.jsonLd);
    setPageMetaContent(CONFIG.meta.jsonLd, jsonLd);
    setPageMetaContent(CONFIG.meta.enabled, 'true');
    if (!getMetadata(CONFIG.meta.pageType)) {
      setPageMetaContent(CONFIG.meta.pageType, schemaType);
    }

    setStatus(
      statusEl,
      `JSON-LD generated (${data.providerId || aiProvider}). Save page properties to persist.`,
      'success',
    );
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    setStatus(statusEl, `Request error: ${message}`, 'error');
  } finally {
    button.classList.remove(CONFIG.classes.busy);
    button.disabled = false;
  }
}

/**
 * @param {HTMLElement} block
 */
function renderAuthoringPanel(block) {
  block.textContent = '';
  block.classList.add(CONFIG.classes.panel);

  const intro = document.createElement('p');
  intro.textContent = 'Generate Schema.org JSON-LD for this page using your configured edge API.';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = CONFIG.classes.button;
  button.textContent = 'Generate Schema with AI';

  const status = document.createElement('p');
  status.className = CONFIG.classes.status;
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  button.addEventListener('click', () => {
    onGenerate(block);
  });

  block.append(intro, button, status);
}

/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  if (!isUEEdit()) {
    block.remove();
    return;
  }
  renderAuthoringPanel(block);
}
