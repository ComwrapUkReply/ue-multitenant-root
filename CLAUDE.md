# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Adobe AEM Edge Delivery Services (EDS) project with Universal Editor support, designed for multisite/multibrand deployments. Blocks are authored in Universal Editor and rendered via EDS. The project uses a Content-Driven Development (CDD) methodology — never start coding a block without identifying test content first.

## Commands

```bash
# Lint everything (JS + CSS)
npm run lint

# Lint individually
npm run lint:js          # ESLint for .js, .mjs, .json
npm run lint:css         # Stylelint for blocks/**/*.css and styles/*.css

# Auto-fix lint issues
npm run lint:fix

# Build merged JSON models (component-models.json, component-definition.json, component-filters.json)
npm run build:json
```

There is no test runner configured. There is no dev server in package.json — use the AEM CLI (`aem up`) or the EDS Sidekick for local preview.

## Architecture

### Block-Based System

Every block lives in `blocks/<block-name>/` with three files:
- `_<block-name>.json` — Content model definition (definitions, models, filters for Universal Editor)
- `<block-name>.js` — Exports `decorate(block)` function that transforms the DOM
- `<block-name>.css` — Block-scoped styles (all selectors must start with the block class)

Container blocks additionally define child item definitions (resourceType `core/franklin/components/block/v1/block/item`) and filters to restrict allowed children.

### Content Models

Individual block JSON files in `blocks/` are merged into root-level files via `npm run build:json`:
- `models/_component-models.json` + block `_*.json` → `component-models.json`
- `models/_component-definition.json` + block `_*.json` → `component-definition.json`
- `models/_component-filters.json` + block `_*.json` → `component-filters.json`

Always run `npm run build:json` after modifying any `_*.json` block model file.

### Core Scripts

- `scripts/aem.js` — RUM tracking, block/section loading, image optimization (`loadBlock`, `loadBlocks`, `decorateBlock`)
- `scripts/scripts.js` — Page initialization and decoration pipeline
- `scripts/dom-builder.js` — DOM construction utilities
- `blocks/helpers.js` — Shared utilities: `isUE()`, `isUEEdit()`, `isUEPreview()`, `isAEMAuthoring()`, `getContextualPath()`, `getCurrentCountryLanguage()`, `mapPath()`, `createImageWithModal()`, `useBlockConfig()`, `getDictionary()`, `getTaxonomy()`

### Multisite / Multibrand

- `.multisite/config.yaml` — Defines child repositories for brand-specific deployments
- Brand overrides go in `.multisite/<brand>/` directories
- Theming via CSS custom properties: base in `styles/styles.css`, brand overrides in `styles/theme.css`

### Universal Editor Integration

- `scripts/editor-support.js` / `scripts/editor-support-rte.js` — UE instrumentation
- UE mode detection: `document.documentElement.classList` contains `adobe-ue-edit` or `adobe-ue-preview`
- Block options use `classes` field with `multiselect` component in JSON models
- Constants: `ROOT_PATH = '/content/ue-multitenant-root'`, `TAG_NAMESPACE = 'ue-multitenant-root'`

## Code Style

- **JS**: 2-space indent, Airbnb ESLint base, require `.js` extensions in imports
- **CSS**: 4-space indent, mobile-first responsive, CSS custom properties for theming
- **JSON**: 2-space indent
- Pre-commit hook runs linting via Husky

## Block Development Patterns

The `decorate(block)` function receives the block's root `<div>`. Children are rows (authored table rows). Use `block.children` to iterate rows and `row.children` for cells.

`useBlockConfig(block, BLOCK_CONFIG, fieldExtractors)` in `blocks/helpers.js` extracts fields from block rows by index, with optional custom extractors per field.

For Dynamic Media images, use `createImageWithModal()` from helpers — handles smart crops, mobile sources, and optional lightbox modals.

Dictionary/i18n: `getDictionary(language)` fetches from `/api/dictionary.json` with column-based language lookups and fallback chain.

Taxonomy/Tags: `getTaxonomy(language)` fetches from `/taxonomy.json`, maps tag IDs like `namespace:category/subcategory` to structured Tag objects.
