# Experience Fragment Block

The Experience Fragment block allows you to include reusable content from fragment pages, with special support for replacing the header navigation with custom navigation fragments.

## Overview

Unlike the standard Fragment block which loads only the first section, the Experience Fragment block loads **all sections** from the referenced fragment page. This makes it ideal for more complex reusable content patterns.

### Key Features

- Loads all sections from a fragment page
- Special navigation fragment support (replaces header when configured)
- Configurable via page metadata
- Style variants (Default, Dark, Light)
- Template-specific configuration

## File Structure

```
blocks/experience-fragment/
├── _experience-fragment.json    # Block definition and model
├── experience-fragment.js       # Core JavaScript functionality
├── experience-fragment.css      # Block styling
└── README.md                    # This documentation
```

## Usage

### As a Standard Block

Add the Experience Fragment block to any page and select a fragment reference:

1. In Universal Editor, add an "Experience Fragment" block to your page
2. Select a fragment page from the AEM content picker
3. Optionally choose a style variant (Default, Dark, or Light)

### As a Navigation Replacement (Page Properties)

To replace the default header navigation with a custom experience fragment:

1. **Create a navigation fragment** in AEM:
   - Create a new page under `/experience-fragment/` folder
   - Name the page starting with `nav` (e.g., `nav-secondary`, `nav-product-hub`)
   - Add your navigation content to the page

2. **Configure in page properties**:
   - Open the page in Universal Editor
   - Click on the page properties panel
   - Find the **"Experience Fragment (Navigation)"** field
   - Select your navigation fragment using the content picker

3. **Result**: The header will automatically use your experience fragment instead of the default navigation

### Template-Specific Configuration

The experience fragment field is available in all template metadata models:

| Template | Metadata Model | Field Available |
|----------|---------------|-----------------|
| Default | `page-metadata` | ✅ Experience Fragment (Navigation) |
| Article | `article-metadata` | ✅ Experience Fragment (Navigation) |
| Events | `events-metadata` | ✅ Experience Fragment (Navigation) |

This allows you to configure different navigation fragments for different page templates.

## Navigation Fragment Naming Convention

| Fragment Name | Behavior |
|--------------|----------|
| `nav-secondary` | Replaces header navigation |
| `nav-product-hub` | Replaces header navigation |
| `footer-global` | Used as standard fragment (does NOT replace header) |
| `promo-banner` | Used as standard fragment (does NOT replace header) |

**Rule**: Only fragments with names starting with `nav` (case-insensitive) will replace the header navigation.

## Configuration Options

### Block Model Fields

| Field | Type | Description |
|-------|------|-------------|
| `reference` | `aem-content` | Path to the fragment page |
| `classes` | `select` | Style variant (Default, Dark, Light) |

### Page Metadata Field

Available in page properties for all templates:

| Field | Type | Label | Description |
|-------|------|-------|-------------|
| `experience-fragment` | `aem-content` | Experience Fragment (Navigation) | Select a fragment to replace header. Must start with 'nav'. |

**Location in Universal Editor:**
1. Select the page (click outside any block)
2. Open the properties panel (right side)
3. Find "Experience Fragment (Navigation)" field
4. Use content picker to select fragment

## API Reference

### Exported Functions

```javascript
import { 
  loadExperienceFragment,
  loadExperienceFragmentForHeader,
  isNavFragment 
} from '../experience-fragment/experience-fragment.js';
```

#### `loadExperienceFragment(path)`

Loads an experience fragment with all its sections.

**Parameters:**
- `path` (string) - The path to the fragment page

**Returns:**
- `Promise<HTMLElement|null>` - The main element containing all sections, or null if loading fails

**Example:**
```javascript
const fragment = await loadExperienceFragment('/experience-fragment/nav-secondary');
if (fragment) {
  const sections = fragment.querySelectorAll('.section');
  // Process sections...
}
```

#### `loadExperienceFragmentForHeader(path)`

Loads an experience fragment specifically for header replacement. Returns a container with all sections structured for header use.

**Parameters:**
- `path` (string) - The path to the fragment page

**Returns:**
- `Promise<HTMLElement|null>` - Container with `.experience-fragment-nav` class and all sections as `.experience-fragment-nav-section` children

**Example:**
```javascript
const headerFragment = await loadExperienceFragmentForHeader('/experience-fragment/nav-product');
if (headerFragment) {
  // headerFragment is a div.experience-fragment-nav
  // with div.experience-fragment-nav-section children
  nav.appendChild(headerFragment);
}
```

#### `isNavFragment(path)`

Checks if a fragment path indicates a navigation fragment.

**Parameters:**
- `path` (string) - The fragment path

**Returns:**
- `boolean` - True if the fragment name starts with 'nav'

**Example:**
```javascript
isNavFragment('/experience-fragment/nav-secondary');  // true
isNavFragment('/experience-fragment/footer-global');  // false
```

## Examples

### Example 1: Basic Experience Fragment

```html
<!-- Block structure in page -->
<div class="experience-fragment">
  <div>
    <div>
      <a href="/experience-fragment/promo-banner">/experience-fragment/promo-banner</a>
    </div>
  </div>
</div>
```

### Example 2: Navigation Replacement

**Page metadata configuration:**
```
experience-fragment: /experience-fragment/nav-product-hub
```

**Header behavior:**
- Header loads `/experience-fragment/nav-product-hub` instead of default `/nav`
- All sections from the fragment are used
- Standard header decoration is applied

### Example 3: Creating a Navigation Fragment

Create a page at `/experience-fragment/nav-secondary` with this structure:

**Section 1 - Brand:**
- Logo image and link

**Section 2 - Navigation Items:**
- Navigation links organized in lists
- Dropdown menus as nested lists

**Section 3 - Tools:**
- Language switcher
- Search
- Other utilities

## Styling

### CSS Classes - Standard Block Usage

| Class | Description |
|-------|-------------|
| `.experience-fragment` | Main block container |
| `.experience-fragment-section` | Wrapper for each section from the fragment |
| `.experience-fragment.dark` | Dark theme variant |
| `.experience-fragment.light` | Light theme variant |

### CSS Classes - Navigation Replacement

When used as header navigation replacement:

| Class | Description |
|-------|-------------|
| `.experience-fragment-header` | Added to header block |
| `.experience-fragment-nav-wrapper` | Wrapper for the nav |
| `.nav.experience-fragment-nav` | Nav element with experience fragment styling |
| `.experience-fragment-nav-section` | Each section from fragment |
| `.experience-fragment-nav-section-1` | First section (numbered) |
| `.experience-fragment-nav-section-2` | Second section (numbered) |

### Custom Styling Example

```css
/* Custom styling for experience fragment sections */
.experience-fragment .experience-fragment-section {
  padding: 1rem;
  margin-bottom: 1rem;
}

/* Dark variant customization */
.experience-fragment.dark {
  background-color: var(--dark-color);
  color: var(--background-color);
}
```

## Fallback Behavior

| Scenario | Result |
|----------|--------|
| No experience-fragment metadata | Default `/nav` is used |
| Experience fragment not found | Default `/nav` is used |
| Fragment name doesn't start with 'nav' | Default `/nav` is used for header |
| Fragment loads successfully + starts with 'nav' | Experience fragment replaces header |

## Troubleshooting

### Fragment Not Loading

1. **Check the path**: Ensure the fragment path is correct and starts with `/`
2. **Verify the page exists**: The fragment page must be published
3. **Check console**: Look for "Failed to load experience fragment" warnings

### Single Section Fragment Not Loading

1. **Verify section exists**: The fragment page must have at least one section with content
2. **Check decoration**: Ensure the page content is properly structured as a section
3. **Console warnings**: Look for "Experience fragment has no sections" warning

### Header Not Being Replaced

1. **Check fragment name**: Must start with `nav` (case-insensitive)
2. **Verify metadata**: Ensure `experience-fragment` is set in page metadata
3. **Check console**: Look for "Header: Using experience fragment navigation" log

### Navigation Styles Not Applied

When using an experience fragment as navigation:

1. **Standard nav classes are NOT applied**: `.nav-brand`, `.nav-sections`, `.nav-tools` won't be added
2. **Use experience fragment classes**: Style with `.experience-fragment-nav-section` and `.experience-fragment-nav-section-{n}`
3. **Target the nav container**: Custom CSS should use `.nav.experience-fragment-nav` selector
4. **Header block has extra class**: Use `.header.experience-fragment-header` for header-specific overrides

### Styling Issues

1. **Specificity**: Use `.experience-fragment` prefix for custom styles
2. **Variables**: Ensure CSS custom properties are defined
3. **Sections**: Each section is wrapped in `.experience-fragment-section`

## Related Components

- [Fragment Block](../fragment/README.md) - Standard fragment (first section only)
- [Header Block](../header/README.md) - Default header implementation

## Technical Notes

- Experience fragments are fetched via `.plain.html` endpoint
- Media paths are automatically resolved relative to the fragment location
- All sections are decorated using standard `decorateMain` and `loadSections`
- The block uses async/await pattern for fragment loading

