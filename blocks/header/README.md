# Header Block Developer Manual

## Overview

The header block is a flexible navigation component that supports both AEM Experience Fragments (XF) and standard Edge Delivery Services (EDS) fragments. It provides a responsive navigation system with mobile hamburger menu, desktop dropdown menus, and full keyboard accessibility.

## Table of Contents

1. [Architecture](#architecture)
2. [Configuration](#configuration)
3. [AEM Experience Fragment Integration](#aem-experience-fragment-integration)
4. [Features](#features)
5. [Styling and Layout](#styling-and-layout)
6. [Usage Examples](#usage-examples)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)

## Architecture

### File Structure

```
blocks/header/
├── header.js          # Main JavaScript implementation
├── header.css         # Base header styles
├── xf-nav.css         # AEM Experience Fragment specific styles
└── README.md          # This documentation
```

### Component Structure

The header block creates a navigation structure with three main sections:

1. **Brand Section** (`nav-brand`): Contains logo and brand identity
2. **Navigation Sections** (`nav-sections`): Main navigation menu with dropdown support
3. **Tools Section** (`nav-tools`): Additional tools or actions (search, user menu, etc.)

### HTML Structure

The header generates the following DOM structure:

```html
<header>
  <div class="nav-wrapper">
    <nav id="nav" aria-expanded="false">
      <div class="nav-hamburger">
        <button type="button" aria-controls="nav" aria-label="Open navigation">
          <span class="nav-hamburger-icon"></span>
        </button>
      </div>
      <div class="nav-brand">
        <!-- Brand/Logo content -->
      </div>
      <div class="nav-sections">
        <!-- Navigation menu -->
      </div>
      <div class="nav-tools">
        <!-- Tools content -->
      </div>
    </nav>
  </div>
</header>
```

## Configuration

### AEM Experience Fragment Configuration

The header block includes a configuration object for AEM Experience Fragment integration:

```javascript
const AEM_XF_CONFIG = {
  enabled: true,                                    // Enable/disable XF loading
  authorUrl: 'https://author-p24706-e491522.adobeaemcloud.com',
  publishUrl: 'https://publish-p24706-e491522.adobeaemcloud.com',
  useDev: true,                                     // Use author or publish URL
  xfPath: '/content/experience-fragments/wknd/language-masters/en/site/header/master',
};
```

### Configuration via Metadata

You can override the default XF path using page metadata:

**Metadata Key**: `header-xf-path`

**Example**: Set in page metadata to use a custom XF path:
```
header-xf-path: /content/experience-fragments/custom/header
```

### Disable XF Integration

To use standard EDS fragments instead of XF, set the following metadata:

**Metadata Key**: `use-standard-nav`

**Value**: `true`

This will bypass XF loading and use the standard fragment loading mechanism.

### Standard Fragment Configuration

When using standard fragments, configure the navigation path via metadata:

**Metadata Key**: `nav`

**Example**: 
```
nav: /nav
```

If not specified, defaults to `/nav`.

## AEM Experience Fragment Integration

### How It Works

1. **XF Fetching**: The header fetches the Experience Fragment HTML from AEM
2. **Content Processing**: Extracts and processes the XF content
3. **Path Resolution**: Fixes image paths and navigation links to use absolute URLs
4. **Navigation Filtering**: Transforms nested navigation structure for EDS compatibility
5. **Decoration**: Applies EDS-specific classes and event handlers

### XF Content Processing

The header performs several transformations on XF content:

#### 1. Image Path Fixing

Converts relative image paths to absolute URLs:

```javascript
// Before: /content/dam/image.png
// After: https://author-p24706-e491522.adobeaemcloud.com/content/dam/image.png
```

#### 2. Navigation Link Fixing

Converts AEM content paths to absolute URLs:

- `/content/...` paths → Full AEM URL
- Relative paths → Resolved using content path context

#### 3. Navigation Structure Filtering

The header filters navigation to show only nested items:

- Removes parent links from level-0 items that have children
- Promotes level-1 items to main navigation
- Maintains hierarchical structure for dropdowns

### XF Selector Strategy

The header uses multiple selectors to find XF content, in order of preference:

1. `.cmp-container .aem-Grid .responsivegrid.container`
2. `.cmp-container .aem-Grid`
3. `.cmp-container`
4. `.aem-Grid`
5. Fallback: First `div` with children in body

### Content Path Extraction

The header automatically extracts the content path from navigation links:

```javascript
// Extracts: /content/wknd/language-masters/en
// From: /content/wknd/language-masters/en/site/page.html
```

This path is used to resolve relative navigation links.

## Features

### Responsive Design

The header adapts to different screen sizes:

- **Mobile (< 900px)**: Hamburger menu, stacked layout, full-screen overlay
- **Desktop (≥ 900px)**: Horizontal navigation, inline dropdowns, no hamburger

### Mobile Menu

- Hamburger icon animation (three lines → X)
- Full viewport height overlay
- Body scroll lock when menu is open
- Touch-friendly navigation items

### Desktop Navigation

- Horizontal navigation bar
- Dropdown menus on hover/click
- Keyboard accessible dropdowns
- Visual indicators for expandable items

### Keyboard Accessibility

#### Navigation Controls

- **Enter/Space**: Open/close dropdown menus
- **Escape**: Close expanded navigation or mobile menu
- **Tab**: Navigate through menu items
- **Focus Loss**: Auto-close dropdowns when focus leaves navigation

#### ARIA Attributes

- `aria-expanded`: Indicates dropdown state
- `aria-controls`: Links hamburger button to navigation
- `aria-label`: Provides accessible labels for buttons

### Dropdown Menus

Dropdown menus support:

- Click to toggle (desktop)
- Keyboard navigation
- Auto-close on focus loss
- Visual indicators (arrow icons)
- Positioned absolutely below parent item

## Styling and Layout

### CSS Architecture

The header uses a modular CSS approach:

1. **header.css**: Base styles and layout
2. **xf-nav.css**: AEM Experience Fragment specific styles

### Layout System

The header uses CSS Grid for layout:

**Mobile Layout**:
```css
grid-template:
  'hamburger brand tools' var(--nav-height)
  'sections sections sections' 1fr / auto 1fr auto;
```

**Mobile Expanded**:
```css
grid-template:
  'hamburger brand' var(--nav-height)
  'sections sections' 1fr
  'tools tools' var(--nav-height) / auto 1fr;
```

**Desktop Layout**:
- Switches to Flexbox
- Horizontal navigation
- No hamburger menu

### CSS Variables

The header uses theme variables for styling:

- `--nav-height`: Navigation bar height
- `--background-color`: Background color
- `--body-font-family`: Font family
- `--body-font-size-s`: Small font size
- `--heading-font-size-s`: Small heading size
- `--light-color`: Light background for dropdowns

### Responsive Breakpoints

- **Mobile**: Default styles (< 900px)
- **Desktop**: `@media (width >= 900px)`

### Hamburger Icon Animation

The hamburger icon animates between states:

- **Closed**: Three horizontal lines
- **Open**: X icon (rotated lines)

Animation uses CSS transforms for smooth transitions.

### Dropdown Styling

Desktop dropdowns feature:

- Absolute positioning below parent
- Light background color
- Box shadow for depth
- Arrow indicator pointing to parent
- Smooth transitions

## Usage Examples

### Basic Usage

Add the header block to a page:

```html
<div class="header block"></div>
```

The block will automatically:
1. Check for XF configuration
2. Load appropriate fragment
3. Decorate and enhance navigation

### Using AEM Experience Fragment

1. **Create XF in AEM**:
   - Path: `/content/experience-fragments/wknd/language-masters/en/site/header/master`
   - Include navigation component
   - Include logo/image component

2. **Configure in Code** (optional):
   ```javascript
   // Update AEM_XF_CONFIG in header.js
   const AEM_XF_CONFIG = {
     enabled: true,
     xfPath: '/content/experience-fragments/custom/header',
     // ... other config
   };
   ```

3. **Or Use Metadata**:
   ```
   header-xf-path: /content/experience-fragments/custom/header
   ```

### Using Standard Fragment

1. **Create Navigation Fragment**:
   - Path: `/nav` or custom path
   - Structure: Brand, Sections, Tools

2. **Configure via Metadata**:
   ```
   use-standard-nav: true
   nav: /custom-nav
   ```

### Custom Navigation Structure

For standard fragments, use this structure:

```html
<div>
  <div>
    <!-- Brand/Logo -->
    <a href="/">Logo</a>
  </div>
  <div class="nav-sections">
    <div class="default-content-wrapper">
      <ul>
        <li>
          <a href="/page1">Page 1</a>
          <ul>
            <li><a href="/page1/sub1">Sub 1</a></li>
            <li><a href="/page1/sub2">Sub 2</a></li>
          </ul>
        </li>
        <li><a href="/page2">Page 2</a></li>
      </ul>
    </div>
  </div>
  <div>
    <!-- Tools -->
  </div>
</div>
```

## API Reference

### Main Function

#### `decorate(block)`

Main entry point for header decoration.

**Parameters**:
- `block` (HTMLElement): The header block element

**Returns**: `Promise<void>`

**Example**:
```javascript
import decorate from './blocks/header/header.js';

const headerBlock = document.querySelector('.header.block');
await decorate(headerBlock);
```

### Internal Functions

#### `fetchExperienceFragment()`

Fetches Experience Fragment from AEM.

**Returns**: `Promise<Element|null>`

#### `processXfContent(xfContent)`

Processes and cleans XF content for EDS compatibility.

**Parameters**:
- `xfContent` (Element): Raw XF content element

**Returns**: `Element` - Processed content

#### `decorateNavSections(nav)`

Decorates navigation sections for EDS compatibility.

**Parameters**:
- `nav` (Element): Navigation element

#### `toggleMenu(nav, navSections, forceExpanded)`

Toggles mobile menu state.

**Parameters**:
- `nav` (Element): Navigation element
- `navSections` (Element): Navigation sections
- `forceExpanded` (Boolean|null): Force expand state

#### `toggleAllNavSections(sections, expanded)`

Toggles all navigation dropdown sections.

**Parameters**:
- `sections` (Element): Sections container
- `expanded` (Boolean): Expansion state

## Troubleshooting

### XF Not Loading

**Symptoms**: Header shows empty or uses fallback fragment

**Solutions**:
1. Check XF path in configuration
2. Verify AEM URLs are correct
3. Check browser console for fetch errors
4. Verify XF is published in AEM
5. Check CORS settings if loading from different domain

### Navigation Links Broken

**Symptoms**: Links point to wrong URLs or are relative

**Solutions**:
1. Verify `baseUrl` configuration
2. Check content path extraction
3. Ensure XF content has proper link structure
4. Check `fixNavigationLinks` function execution

### Images Not Displaying

**Symptoms**: Images are broken or missing

**Solutions**:
1. Check image path fixing logic
2. Verify AEM base URL
3. Ensure images are published
4. Check image source attributes

### Dropdowns Not Working

**Symptoms**: Dropdown menus don't open/close

**Solutions**:
1. Check `nav-drop` class is applied
2. Verify event listeners are attached
3. Check ARIA attributes
4. Verify desktop/mobile detection

### Mobile Menu Not Opening

**Symptoms**: Hamburger menu doesn't respond

**Solutions**:
1. Check hamburger button exists
2. Verify event listener attachment
3. Check `aria-expanded` attribute
4. Verify body scroll lock logic

### Styling Issues

**Symptoms**: Layout broken or styles not applied

**Solutions**:
1. Verify CSS files are loaded
2. Check CSS variable definitions
3. Verify grid/flexbox layout
4. Check responsive breakpoints
5. Inspect computed styles in browser

### Keyboard Navigation Issues

**Symptoms**: Keyboard navigation doesn't work

**Solutions**:
1. Check `tabindex` attributes
2. Verify event listeners for keyboard events
3. Check ARIA attributes
4. Test with screen reader

## Best Practices

### Performance

1. **Lazy Load**: XF content is loaded asynchronously
2. **Error Handling**: Graceful fallback to standard fragments
3. **Caching**: Consider caching XF content for better performance

### Accessibility

1. **ARIA Labels**: Always provide meaningful labels
2. **Keyboard Support**: Ensure all interactions are keyboard accessible
3. **Focus Management**: Properly manage focus states
4. **Screen Readers**: Test with screen reader software

### Maintenance

1. **Configuration**: Keep AEM URLs and paths in configuration
2. **Error Logging**: Monitor console for errors
3. **Testing**: Test with both XF and standard fragments
4. **Documentation**: Update this manual when making changes

## Related Documentation

- [AEM Experience Fragments](https://experienceleague.adobe.com/docs/experience-manager-65/authoring/authoring/experience-fragments.html)
- [Edge Delivery Services Documentation](https://www.aem.live/developer)
- [Fragment Block Documentation](../fragment/README.md)

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Test with standard fragment to isolate XF issues
4. Contact development team

