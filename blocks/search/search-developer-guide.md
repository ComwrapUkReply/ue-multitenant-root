# Search Block - Developer Guide

This guide provides technical documentation for developers working with the Search block, including implementation details, customization options, and integration patterns.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Configuration System](#configuration-system)
4. [Core Functions](#core-functions)
5. [Display Modes](#display-modes)
6. [Mobile Integration](#mobile-integration)
7. [Customization](#customization)
8. [Integration](#integration)
9. [Performance Optimization](#performance-optimization)
10. [Accessibility Implementation](#accessibility-implementation)
11. [Testing](#testing)
12. [Troubleshooting](#troubleshooting)

## Architecture Overview

The Search block is built with a modular architecture that separates concerns:

```
search.js
├── Configuration Parsing
│   └── parseBlockConfig() - Extracts settings from block DOM
├── UI Creation
│   ├── searchBox() - Search container with icon and input
│   ├── searchInput() - Search input with event handlers
│   ├── searchIcon() - Search icon (button or span)
│   └── searchResultsContainer() - Results list container
├── Search Execution
│   └── handleSearch() - Main search logic
├── Results Rendering
│   └── renderResults() - Renders limited suggestions
├── Navigation
│   └── navigateToResultPage() - Navigates to results page
└── Mobile Integration
    ├── createMobileSearchButton() - Mobile toggle button
    ├── toggleSearchBlock() - Toggle visibility
    └── applySearchBlockMargin() - Header-aware positioning
```

### Data Flow

1. **Initialization**: Block parses configuration from DOM
2. **User Input**: Search input triggers immediate search (no debouncing)
3. **Data Fetching**: Loads data from `/query-index.json`
4. **Filtering**: Applies search term filtering
5. **Rendering**: Displays up to 5 results
6. **Interaction**: User can click result or navigate to full results page

## File Structure

```
blocks/search/
├── _search.json              # Block definition and model
├── search.js                 # Main JavaScript implementation
├── search.css                # Styling
├── README.md                 # Comprehensive guide
├── search-developer-guide.md # This file
└── search-author-guide.md    # Author guide
```

## Configuration System

### Configuration Object

The block uses a centralized configuration object:

```javascript
const CONFIG = {
  defaultSource: '/query-index.json',
  placeholders: {
    searchPlaceholder: 'Search...',
    searchNoResults: 'No results found.',
    viewAllButtonText: 'View all {count} results',
  },
  suggestionsLimit: 3,  // Actually shows 5, but config says 3
  autosuggest: true,
  imageWidth: 320,
};
```

**Note**: The `suggestionsLimit` in code is set to 3, but the actual limit used is 5 (hardcoded in `renderResults()`). This may be a discrepancy to address.

### Parsing Block Configuration

The `parseBlockConfig()` function extracts configuration from the block's DOM structure. AEM renders block fields in a table-like structure:

**Two-column format (key-value)**:
```html
<div>
  <div>Toggle to turn recommended search</div>
  <div>true</div>
</div>
<div>
  <div>Result Page...</div>
  <div><a href="/search">/search</a></div>
</div>
```

**Single-column format**:
```html
<div>
  <div>true</div>
</div>
<div>
  <div><a href="/search">/search</a></div>
</div>
```

The parser handles both formats and extracts:
- Autosuggest boolean value
- Result page URL (from links)
- Placeholder text values
- Display classes

## Core Functions

### `decorate(block)`

Main entry point for block decoration. Orchestrates the entire initialization:

```javascript
export default async function decorate(block) {
  // 1. Parse configuration
  const config = parseBlockConfig(block);
  
  // 2. Build UI structure
  // 3. Add mobile button if in wrapper
  // 4. Restore query from URL
  // 5. Attach toggle handlers
  // 6. Handle window resize
}
```

### `parseBlockConfig(block)`

Extracts configuration from block DOM. Returns:

```javascript
{
  autosuggest: boolean,      // Whether to show inline suggestions
  resultPage: string|null,   // URL to search results page
  placeholders: {            // Custom text strings
    searchPlaceholder: string,
    searchNoResults: string,
    viewAllButtonText: string,
  },
}
```

### `handleSearch(e, block, config)`

Main search execution function:

1. Gets search value from input
2. Updates URL with query
3. Checks if autosuggest is enabled (returns early if disabled)
4. Validates minimum length (3 characters)
5. Parses search terms
6. Fetches data from query-index.json
7. Filters data by search terms
8. Renders results (up to 5)

**Key Behavior**:
- No debouncing (instant results)
- Minimum 3 characters required
- Clears results if query is too short
- Shows error message if data can't be loaded

### `renderResults(block, config, filteredData, searchTerms, showImages)`

Renders limited search suggestions:

- Limits results to 5 (hardcoded, despite config saying 3)
- Renders each result using `renderResult()` from search-utils.js
- Adds "View all results" link if:
  - Result page is configured
  - More than 5 results exist
- Shows "no results" message if no matches

### `searchInput(block, config)`

Creates search input with event handlers:

**Event Handlers**:
- `input` - Triggers search on typing
- `keyup` - Handles Escape key to clear
- `keydown` - Handles Enter key to navigate (if result page configured)

**Features**:
- ARIA label for accessibility
- Custom placeholder text
- URL synchronization

### `searchIcon(block, config)`

Creates search icon element:

**When Result Page is Configured**:
- Creates a `<button>` element
- Makes icon clickable
- Navigates to result page on click
- Adds hover and focus styles

**When No Result Page**:
- Creates a `<span>` element
- Non-interactive icon
- Purely decorative

### `navigateToResultPage(resultPageUrl, searchQuery)`

Navigates to the search results page:

```javascript
function navigateToResultPage(resultPageUrl, searchQuery) {
  const url = new URL(resultPageUrl, window.location.origin);
  url.searchParams.set('q', searchQuery);
  window.location.href = url.toString();
}
```

## Display Modes

### Autosuggest Mode (Default)

When `autosuggest` is `true`:

- Results container is added to DOM
- Inline suggestions appear as users type
- Up to 5 results shown
- "View all results" button appears if more results exist

**CSS Class**: No special class (default state)

### Navigation Mode

When `autosuggest` is `false`:

- Results container is not added to DOM
- No inline suggestions shown
- Search icon becomes clickable button
- Enter key or icon click navigates to result page

**CSS Class**: `.no-autosuggest`

**Styling Differences**:
- Search icon button has primary background color
- Results container is hidden via CSS
- Search box has reduced max-width

## Mobile Integration

### Mobile Search Button

The block creates a mobile toggle button when placed in a `.search-wrapper`:

```javascript
function createMobileSearchButton(block) {
  const button = document.createElement('button');
  button.className = 'search-button';
  // ... ARIA attributes
  // ... Click handler
  return button;
}
```

### Toggle Functionality

The `toggleSearchBlock()` function handles visibility:

1. Toggles `aria-expanded` attribute
2. Syncs state across all search buttons on page
3. Applies margin-top based on header height
4. Focuses input when opening

### Header-Aware Positioning

The block calculates header height and applies margin:

```javascript
function calculateHeaderHeight() {
  const header = document.querySelector('header.block, header');
  const navWrapper = header.querySelector('.nav-wrapper');
  return navWrapper ? navWrapper.offsetHeight : header.offsetHeight;
}
```

This ensures the search panel appears below the header on mobile.

## Customization

### Changing Suggestions Limit

Modify the limit in `renderResults()`:

```javascript
// Current: hardcoded to 5
const limit = 5;

// To change:
const limit = config.suggestionsLimit || 5;
```

Or update the CONFIG:

```javascript
const CONFIG = {
  suggestionsLimit: 10,  // Show 10 suggestions
  // ...
};
```

### Adding Debouncing

Currently, search executes immediately. To add debouncing:

```javascript
let searchTimeout;
input.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch(e, block, config);
  }, 300);  // 300ms delay
});
```

### Custom Search Source

To use a different data source:

```javascript
const config = {
  source: '/custom-index.json',  // Custom source
  // ...
};
```

### Custom Minimum Query Length

Modify the minimum length check:

```javascript
if (searchValue.length < 5) {  // Change from 3 to 5
  clearSearch(block);
  return;
}
```

## Integration

### Integration with Search Results Block

The Search block is designed to work with the Search Results block:

1. **Search Block** - Provides autocomplete input
2. **Search Results Block** - Shows full results page

**URL Parameter Passing**:
```javascript
// Search block navigates with query
navigateToResultPage('/search', 'products');
// Results in: /search?q=products

// Search Results block reads query
const queryParam = getQueryFromUrl();  // Returns "products"
```

### Header Integration

The block integrates with the header block:

**Structure**:
```html
<div class="search-wrapper">
  <button class="search-button">...</button>
  <div class="search block">...</div>
</div>
```

**Mobile Behavior**:
- Button appears in header
- Clicking button toggles search panel
- Panel positions below header

### Multiple Search Blocks

The block supports multiple instances on a page:

- All search buttons sync their `aria-expanded` state
- Each block maintains its own state
- Toggle handlers are attached to all buttons

## Performance Optimization

### No Debouncing

Unlike Search Results block, this block doesn't debounce:

- **Reason**: Autosuggest should feel instant
- **Trade-off**: More API calls, but better UX
- **Mitigation**: Limited to 5 results

### Limited Results

Only shows 5 suggestions to:
- Reduce DOM manipulation
- Improve rendering performance
- Keep UI clean and focused

### Efficient Filtering

Filtering operations are optimized:

1. Fetches data once per search
2. Client-side filtering (fast)
3. Limits results before rendering

### Lazy Loading

Images in card view use lazy loading:

```javascript
// Images are loaded via renderResult() which includes
// lazy loading attributes
```

## Accessibility Implementation

### ARIA Labels

All interactive elements have ARIA labels:

```javascript
input.setAttribute('aria-label', searchPlaceholder);
button.setAttribute('aria-label', 'Search');
block.setAttribute('aria-expanded', 'false');
block.setAttribute('id', 'search-panel');
```

### Live Regions

Results container includes live region:

```javascript
results.setAttribute('role', 'status');
results.setAttribute('aria-live', 'polite');
results.setAttribute('aria-atomic', true);
```

This announces result count changes to screen readers.

### Keyboard Navigation

Full keyboard support:

- **Tab**: Navigate to input
- **Type**: Enter search query
- **Enter**: Navigate to result page (if configured) or submit
- **Escape**: Clear search and close
- **Arrow keys**: Navigate results (if implemented)

### Focus Management

Input receives focus when search opens:

```javascript
if (newState) {
  const input = block.querySelector('.search-input');
  if (input) {
    setTimeout(() => {
      input.focus();
    }, 100);
  }
}
```

### Screen Reader Support

Hidden text for screen readers:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

### Reduced Motion

Respects user motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing

### Manual Testing Checklist

- [ ] Search with 3+ characters shows suggestions
- [ ] Search with < 3 characters doesn't show suggestions
- [ ] Results highlight search terms
- [ ] Clicking result navigates to page
- [ ] "View all results" appears when > 5 results
- [ ] "View all results" navigates correctly
- [ ] Enter key navigates to result page (if configured)
- [ ] Search icon click navigates (if configured)
- [ ] Escape key clears search
- [ ] URL query parameters are read on load
- [ ] URL query parameters update on search
- [ ] Mobile toggle button works
- [ ] Mobile panel expands/collapses
- [ ] Header height calculation works
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Mobile responsive layout works

### Unit Testing

Example test structure:

```javascript
describe('Search Block', () => {
  describe('parseBlockConfig', () => {
    it('should extract autosuggest boolean', () => {
      // Test implementation
    });
    
    it('should extract result page URL', () => {
      // Test implementation
    });
  });
  
  describe('handleSearch', () => {
    it('should not search with < 3 characters', () => {
      // Test implementation
    });
    
    it('should show suggestions when autosuggest enabled', () => {
      // Test implementation
    });
  });
});
```

### Integration Testing

Test with actual query-index.json:

```javascript
// Mock fetchData to return test data
const testData = [
  { path: '/page1', title: 'Page 1', ... },
  { path: '/page2', title: 'Page 2', ... },
  // ... more test data
];

// Test search functionality
// Test result rendering
// Test navigation
```

## Troubleshooting

### Search Not Showing Suggestions

**Issue**: Suggestions don't appear when typing.

**Solutions**:
1. Check that `/query-index.json` exists and is accessible
2. Verify autosuggest is enabled (should be `true`)
3. Ensure search query is 3+ characters
4. Check browser console for errors
5. Verify data structure matches expected format

### Result Page Navigation Not Working

**Issue**: Clicking search icon or pressing Enter doesn't navigate.

**Solutions**:
1. Verify result page is configured in block properties
2. Check that result page URL is valid
3. Ensure result page exists and is published
4. Check browser console for navigation errors
5. Verify URL parameter is being set correctly

### Mobile Button Not Appearing

**Issue**: Mobile search toggle button doesn't show.

**Solutions**:
1. Verify block is inside `.search-wrapper` element
2. Check that header structure is correct
3. Verify CSS is loading
4. Check for JavaScript errors
5. Ensure block is properly initialized

### Header Height Calculation Wrong

**Issue**: Search panel overlaps header on mobile.

**Solutions**:
1. Check header structure matches expected format
2. Verify `.nav-wrapper` exists in header
3. Check that header height calculation function works
4. Test on different screen sizes
5. Verify CSS margin-top is being applied

### Autosuggest Not Disabling

**Issue**: Suggestions still show when autosuggest is disabled.

**Solutions**:
1. Verify configuration parsing is correct
2. Check that `no-autosuggest` class is added
3. Verify results container is not added to DOM
4. Check CSS for `.no-autosuggest` styles
5. Clear browser cache

### URL Query Not Restoring

**Issue**: Search query from URL doesn't populate input on load.

**Solutions**:
1. Verify `getQueryFromUrl()` function works
2. Check that input event is dispatched correctly
3. Ensure query parameter format is correct (`?q=term`)
4. Check for timing issues (DOM not ready)
5. Verify URL parameter is present

## Best Practices

### Code Organization

- Keep functions focused and single-purpose
- Use descriptive function names
- Add JSDoc comments for all functions
- Group related functionality together

### Error Handling

- Always check for null/undefined values
- Provide fallback values for configuration
- Handle fetch errors gracefully
- Show user-friendly error messages

### Performance

- Limit results to keep DOM small
- Use efficient selectors
- Avoid unnecessary DOM manipulations
- Consider adding debouncing if performance issues occur

### Accessibility

- Always include ARIA labels
- Support keyboard navigation
- Provide live regions for dynamic content
- Test with screen readers

### Maintainability

- Use constants for configuration
- Document complex logic
- Follow project coding standards
- Write clear comments

## Related Documentation

- [Search Utils Documentation](../scripts/search-utils.js)
- [Universal Editor Block Development Guide](../../AGENTS.md)
- [Author Guide](./search-author-guide.md)
- [Search Results Block Documentation](../search-results/README.md)
