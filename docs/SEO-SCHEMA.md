# Schema.org structured data (EDS / Universal Editor)

This project emits JSON-LD from page metadata via `scripts/seo-schema.js` (loaded from `scripts/delayed.js`). Authors configure fields under **Structured Data (Schema.org)** in page properties. Optional **SEO AI Generator** block calls an edge function to draft `schema-jsonld`.

## Page metadata fields

| Meta name | Purpose |
|-----------|---------|
| `schema-enabled` | `true` to emit JSON-LD |
| `schema-type` | WebPage, Article, NewsArticle, BlogPosting, Event, Organization, VideoObject |
| `schema-headline` | Override title/headline |
| `schema-description` | Override description |
| `schema-image` | Override image URL |
| `schema-author` | Author name (articles) |
| `schema-org-name` | Publisher / organization name |
| `schema-org-url` | Organization URL |
| `schema-event-start` / `schema-event-end` / `schema-event-location` | Event fields |
| `schema-video-url` | Video content URL |
| `schema-jsonld` | Raw JSON-LD (overrides generated output) |

Model definitions: `models/_schema-metadata.json` (included in `models/_page.json` and `models/_component-models.json`).

After changing JSON models, run: `npm run build:json`

## Runtime behaviour

1. If `schema-enabled` is not true, no script is injected.
2. If `schema-jsonld` is set, it is parsed (or used as text) and injected as-is.
3. Otherwise `buildJsonLd()` builds type-specific JSON-LD from meta tags.
4. If a **Breadcrumbs** block is on the page, a `BreadcrumbList` is combined using `@graph`.

## Edge function contract

**Endpoint (default):** `POST /api/seo-generate`  
Configure per environment in the **SEO AI Generator** block (`ai-endpoint` field).

### Request

`Content-Type: application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `pagePath` | string | yes | Current page path |
| `schemaType` | string | yes | Target Schema.org type |
| `title` | string | no | Page title |
| `description` | string | no | Page description |
| `template` | string | no | Page template id |
| `aiProvider` | string | no | `openai` or `gemini` |

### Response

Success (`200`):

`{ "success": true, "providerId": "openai", "jsonLd": "{ ... }" }`

`jsonLd` must be a JSON string or serializable object.

Error (`4xx` / `5xx`):

`{ "success": false, "error": "Human-readable message" }`

### Environment variables

| Variable | Used when |
|----------|-----------|
| `OPENAI_API_KEY` | `aiProvider` is `openai` |
| `GEMINI_API_KEY` | `aiProvider` is `gemini` |
| `OPENAI_MODEL` | Optional, default `gpt-4o-mini` |
| `GEMINI_MODEL` | Optional, default `gemini-2.0-flash` |

Never expose API keys in the browser or in this repository.

### CORS

If the endpoint is on another origin, allow the AEM author / preview origins and the live `.aem.page` / `.aem.live` hosts.

## Node.js handler template (Netlify / Vercel / Cloudflare Workers)

See `docs/seo-generate-handler.example.mjs` for a copy-paste reference implementation. Adapt the export for your platform.

## Adobe App Builder

Deploy the same logic as a web action, set secrets in the workspace, and point `ai-endpoint` on the SEO AI block to the action URL.

## Authoring checklist

1. Enable **Structured Data** on the page and choose a type.
2. Fill overrides or rely on title/description/OG meta.
3. (Optional) Add **SEO AI Generator** block in Universal Editor, run generate, then save page properties.
4. View page source on publish and confirm `application/ld+json` script with `data-seo-schema`.

## Related files

- `scripts/seo-schema.js` — build and inject JSON-LD
- `scripts/delayed.js` — calls `injectSeoSchema()`
- `blocks/seo-ai/` — authoring-only AI UI
- `helix-query.yaml` — indexes `schema-type` and `schema-enabled`
