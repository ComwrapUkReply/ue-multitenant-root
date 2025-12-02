# Region Switcher Block

A block that allows users to switch between different country/regions. This block works **together with the Language Switcher** to provide a complete locale selection experience.

## Overview

The Region Switcher and Language Switcher work as a **two-step selection process**:

1. **Region Switcher** → User selects their country/region (e.g., Switzerland, Germany)
2. **Language Switcher** → User selects their preferred language within that region

### Example Flow

`
User is on Switzerland (German) page
    │
    ├── Region Switcher shows: [🇨🇭 Switzerland ▼] [🇩🇪 Germany]
    │
    └── Language Switcher shows: [Deutsch ▼] [Français] [English]
           ↑ Only languages available in Switzerland

User switches to Germany
    │
    ├── Region Switcher shows: [🇨🇭 Switzerland] [🇩🇪 Germany ▼]
    │
    └── Language Switcher shows: [Deutsch ▼] [English]
           ↑ Only languages available in Germany
`

The Region Switcher:
- Shows available countries/regions (not individual languages)
- Each region uses its default language when switching
- Works with Language Switcher for complete locale control

## How It Works

### Region Detection

The block detects the current region from the URL:

**Edge Delivery Services URL Pattern:**
`https://multi-lang--ue-multitenant-root-{region}-{lang}--comwrapukreply.aem.page/`

**AEM Authoring URL Pattern:**
`/content/ue-multitenant-root/{region}/{lang}/`

### Available Regions

Regions are extracted from `placeholders.json`:

| Region Code | Name | Flag | Default Language | Available Languages |
|-------------|------|------|------------------|---------------------|
| `ch` | Switzerland | 🇨🇭 | German (de) | de, fr, en |
| `de` | Germany | 🇩🇪 | German (de) | de, en |

### URL Generation

When switching regions, the block generates URLs using the region's default language:

| Current URL | Target Region | Generated URL |
|-------------|---------------|---------------|
| `.../ch-de/ueber-uns` | Germany | `.../de-de/ueber-uns` |
| `.../de-en/about-us` | Switzerland | `.../ch-de/about-us` |

## Usage

### Basic Usage

Add the Region Switcher block to any page:

| Region Switcher |
|-----------------|
| Display Style: dropdown |
| Show Flags: true |

### Display Styles

1. **Dropdown** (default) - Compact dropdown menu
2. **Horizontal** - Inline list of regions
3. **Flags** - Flag icons only

### Configuration Options

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| Display Style | dropdown, horizontal, flags | dropdown | Visual style |
| Show Flags | true, false | true | Show country flags |
| Default Languages | JSON object | {} | Override default language per region |

### Default Languages Override

You can override the default language for specific regions:

`json
{
  "ch": "fr",
  "de": "en"
}
`

## Header Integration

To add the Region Switcher to the header, modify `header.js`:

`javascript
import regionSwitcherDecorate from '../region-switcher/region-switcher.js';

async function addRegionSwitcher(nav) {
  const navTools = nav.querySelector('.nav-tools');
  if (!navTools) return;

  const regionSwitcherBlock = document.createElement('div');
  regionSwitcherBlock.className = 'region-switcher block';
  regionSwitcherBlock.dataset.displayStyle = 'dropdown';
  regionSwitcherBlock.dataset.showFlags = 'true';

  await regionSwitcherDecorate(regionSwitcherBlock);
  navTools.appendChild(regionSwitcherBlock);
}
`

## Styling

### CSS Variables

The block uses CSS custom properties for theming:

`css
:root {
  --background-color: #fff;
  --text-color: #333;
  --border-color: #ccc;
  --hover-background: #f5f5f5;
  --current-background: #e8f4ff;
  --focus-color: #0066cc;
}
`

### Theme Variants

- **Light** (default) - Light background
- **Dark** - Dark background with light text
- **Transparent** - No background

### Size Variants

- **Default** - Standard size
- **Compact** - Smaller, space-efficient
- **Full Width** - Spans container width

## API

### Exported Functions

`javascript
import {
  createRegionSwitcher,
  detectCurrentRegion,
  getCurrentLanguage,
  getAvailableRegions,
  generateRegionURL,
  clearCache,
  CONFIG,
} from './region-switcher.js';
`

### createRegionSwitcher(options)

Creates a region switcher element.

`javascript
const switcher = await createRegionSwitcher({
  displayStyle: 'dropdown',
  showFlags: true,
});
`

### detectCurrentRegion()

Returns the current region object.

`javascript
const region = detectCurrentRegion();
// { code: 'ch', name: 'Switzerland', flag: '🇨🇭', defaultLanguage: 'de' }
`

### getAvailableRegions()

Returns array of available regions from placeholders.

`javascript
const regions = await getAvailableRegions();
// [{ code: 'ch', ... }, { code: 'de', ... }]
`

### generateRegionURL(targetRegion, targetLanguage, pagePath)

Generates URL for a target region.

`javascript
const url = generateRegionURL(
  { code: 'de', defaultLanguage: 'de' },
  null, // uses default language
  'about-us'
);
// https://multi-lang--ue-multitenant-root-de-de--comwrapukreply.aem.page/about-us
`

## Comparison: Region Switcher vs Language Switcher

| Feature | Region Switcher | Language Switcher |
|---------|-----------------|-------------------|
| Purpose | Switch countries/regions | Switch languages within region |
| Scope | Cross-region | Within current region only |
| Page Mapping | Not required | Required for inner pages |
| Default Language | Uses region default | User selected |
| Visibility | Always visible | Hidden if region has 1 language |
| Order in Header | First (left) | Second (right) |

### Combined Workflow

`
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]  [Nav Items...]  [🇨🇭 Switzerland ▼] [Deutsch ▼]        │
│                          └─ Region          └─ Language        │
│                             (Step 1)           (Step 2)        │
└─────────────────────────────────────────────────────────────────┘
`

**Step 1**: User selects region (Switzerland/Germany)
**Step 2**: User selects language within that region

## Data Source

The block fetches data from:
`
https://multi-lang--ue-multitenant-root--comwrapukreply.aem.page/placeholders.json
`

### Placeholders Format

`json
{
  "data": [
    {
      "source": "/ch/de/",
      "target": "/ch/fr/",
      "description": "Homepage CH German to French",
      "type": "homepage"
    }
  ]
}
`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

- Full keyboard navigation
- ARIA attributes for screen readers
- Focus management
- Reduced motion support
- High contrast support

