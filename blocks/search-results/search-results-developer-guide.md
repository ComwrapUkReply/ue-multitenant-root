# Search Results Block - Developer Guide

This guide provides technical documentation for developers working with the Search Results block, including implementation details, customization options, and integration patterns.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Configuration System](#configuration-system)
4. [Core Functions](#core-functions)
5. [Customization](#customization)
6. [Integration](#integration)
7. [Performance Optimization](#performance-optimization)
8. [Accessibility Implementation](#accessibility-implementation)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

## Architecture Overview

The Search Results block is built with a modular architecture that separates concerns:

```
search-results.js
├── Configuration Parsing
│   └── parseBlockConfig() - Extracts settings from block DOM
├── UI Creation
│   ├── createSearchInput() - Search input with debouncing
│   ├── createSearchIcon() - Search icon element
│   └── createPagination() - Pagination controls
├── Search Execution
│   └── executeSearch() - Main search logic with filtering
├── Results Rendering
│   └── renderResults() - Renders paginated results
└── Filtering
    ├── filterByFolder() - Folder path filtering
    └── Tag filtering (via content-filter-utils.js)
```

### Data Flow

1. **Initialization**: Block parses configuration from DOM
2. **User Input**: Search input triggers debounced search
3. **Data Fetching**: Loads data from `/query-index.json`
4. **Filtering**: Applies folder and tag filters
5. **Rendering**: Displays paginated results
6. **Interaction**: User can filter by tags or navigate pages

## File Structure

```
blocks/search-results/
├── _search-results.json      # Block definition and model
├── search-results.js         # Main JavaScript implementation
├── search-results.css        # Styling
├── README.md                 # Comprehensive guide
├── search-results-developer-guide.md  # This file
└── search-results-author-guide.md     # Author guide
```

## Configuration System

### Configuration Object

The block uses a centralized configuration object:

```javascript
const CONFIG = {
  defaultSource: '/query-index.json',
  itemsPerPage: 3,
  placeholders: {
    searchNoResultsFor: 'No results found for',
    searchResultsTitle: 'Search Results',
    searchPlaceholder: 'Search...',
  },
  imageWidth: 375,
};
```

### Parsing Block Configuration

The `parseBlockConfig()` function extracts configuration from the block's DOM structure. AEM renders block fields in a table-like structure:

**Two-column format (key-value)**:
```html
<div>
  <div>Filter by Folder</div>
  <div><a href="/content/ue-multitenant-root/products">/products</a></div>
</div>
```

**Single-column format**:
```html
<div>
  <div>cards</div>
</div>
```

The parser handles both formats and extracts:
- Folder paths (from links or text)
- Display classes (cards, minimal)
- Boolean values (enableTagFilter, multipleTagSelect)
- Text values (placeholders, titles)

### Configuration Extraction Methods

#### Primary Method: Row-by-Row Parsing

The parser iterates through block children and identifies fields by:
1. Label matching (case-insensitive)
2. Value type detection (link, boolean, text, class)
3. Field order matching

#### Fallback Methods

If primary parsing fails, fallback methods search the DOM directly:

- `extractClassesFallback()` - Finds classes value
- `extractTitleFallback()` - Finds title value
- `extractEnableTagFilter()` - Finds tag filter setting

## Core Functions

### `decorate(block)`

Main entry point for block decoration. Orchestrates the entire initialization:

```javascript
export default async function decorate(block) {
  // 1. Parse configuration
  const config = parseBlockConfig(block);
  
  // 2. Apply classes
  block.classList.add(...config.classes);
  
  // 3. Build UI structure
  // 4. Initialize search
  // 5. Handle URL query parameters
}
```

### `parseBlockConfig(block)`

Extracts configuration from block DOM. Returns:

```javascript
{
  folders: string[],           // Array of folder paths
  placeholders: {              // Custom text strings
    searchPlaceholder: string,
    searchNoResultsFor: string,
    searchResultsTitle: string,
  },
  classes: string,             // Display style classes
  enableTagFilter: boolean,    // Tag filtering enabled
  multipleTagSelect: boolean,  // Multiple tag selection
}
```

### `executeSearch(block, config, searchValue, state)`

Main search execution function:

1. Parses search terms
2. Shows loading state
3. Fetches data from query-index.json
4. Applies folder filtering
5. Applies search term filtering
6. Extracts and displays tag filters (if enabled)
7. Applies tag filtering (if tags selected)
8. Renders results

**State Object**:
```javascript
{
  searchFilteredData: [],  // Results after search filtering
  searchTerms: [],          // Parsed search terms
  selectedTags: [],         // Currently selected tags
}
```

### `renderResults(block, config, filteredData, searchTerms, headingTag, showImages, currentPage)`

Renders paginated search results:

- Calculates pagination (3 items per page)
- Renders result items using `renderResult()` from search-utils.js
- Updates results count with filter information
- Creates pagination controls if needed
- Handles empty state

### `createPagination(currentPage, totalPages, onPageChange)`

Creates accessible pagination controls:

- Previous/Next buttons with disabled states
- Page number buttons (up to 5 visible)
- Ellipsis for large page counts
- ARIA labels and live regions
- Keyboard navigation support

### `filterByFolder(data, folders)`

Filters data by folder paths:

```javascript
function filterByFolder(data, folders) {
  return data.filter((item) => 
    folders.some((folder) => 
      item.path.toLowerCase().startsWith(folder.toLowerCase())
    )
  );
}
```

### `createSearchInput(block, config, state)`

Creates search input with debouncing:

- 300ms debounce delay
- Minimum 3 characters required
- URL synchronization
- Clears results when empty

## Customization

### Changing Items Per Page

Modify the `CONFIG` object:

```javascript
const CONFIG = {
  itemsPerPage: 6,  // Change from 3 to 6
  // ...
};
```

### Custom Search Source

To use a different data source, modify the configuration:

```javascript
const config = {
  source: '/custom-index.json',  // Custom source
  // ...
};
```

### Custom Debounce Delay

Modify the debounce timeout in `createSearchInput()`:

```javascript
searchTimeout = setTimeout(() => {
  executeSearch(block, config, searchValue, state);
}, 500);  // Change from 300ms to 500ms
```

### Custom Minimum Query Length

Modify the minimum length check:

```javascript
if (searchValue.length >= 5) {  // Change from 3 to 5
  // Execute search
}
```

### Adding Custom Filters

To add custom filtering logic, extend `executeSearch()`:

```javascript
async function executeSearch(block, config, searchValue, state) {
  // ... existing code ...
  
  // Add custom filter
  filteredData = filteredData.filter((item) => {
    // Your custom filter logic
    return customFilterCondition(item);
  });
  
  // ... rest of function ...
}
```

## Integration

### Using with Search Block

The Search Results block works seamlessly with the Search block:

1. **Search Block** (`blocks/search/`) - Provides search input on any page
2. **Search Results Block** - Displays results on dedicated search page

**Integration Pattern**:
```javascript
// In search block, redirect to search results page
const searchResultsUrl = '/search?q=' + encodeURIComponent(query);
window.location.href = searchResultsUrl;
```

### URL Query Parameters

The block automatically reads and uses URL query parameters:

```javascript
// URL: /search?q=products
const queryParam = getQueryFromUrl();  // Returns "products"
```

To set query parameters programmatically:

```javascript
updateUrlWithQuery('search term');
// Updates URL to: ?q=search+term
```

### Integration with Dynamic Content

The Search Results block shares filtering utilities with the Dynamic Content block:

- `content-filter-utils.js` - Tag filtering functions
- `search-utils.js` - Search and rendering functions

This allows for consistent filtering behavior across components.

## Performance Optimization

### Debouncing

Search input is debounced to reduce API calls:

```javascript
let searchTimeout;
input.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    executeSearch(block, config, searchValue, state);
  }, 300);
});
```

### Pagination

Results are paginated to limit DOM elements:

- Only renders 3 items per page
- Removes previous pagination before creating new one
- Efficient slice operation for pagination

### Lazy Loading

Images in card view use lazy loading:

```javascript
// Images are loaded via renderResult() which includes
// lazy loading attributes
```

### Efficient Filtering

Filtering operations are optimized:

1. **Folder filtering first** - Reduces dataset early
2. **Search filtering second** - Works on smaller dataset
3. **Tag filtering last** - Works on already filtered results

## Accessibility Implementation

### ARIA Labels

All interactive elements have ARIA labels:

```javascript
nav.setAttribute('aria-label', 'Search results pagination');
button.setAttribute('aria-label', 'Go to page 1');
button.setAttribute('aria-current', 'page');  // Current page
```

### Live Regions

Pagination includes live region for screen readers:

```javascript
const liveRegion = document.createElement('div');
liveRegion.setAttribute('aria-live', 'polite');
liveRegion.setAttribute('aria-atomic', 'true');
// Announces page changes
```

### Keyboard Navigation

All interactive elements are keyboard accessible:

- Search input: Standard input navigation
- Tag pills: Tab navigation, Enter/Space to activate
- Pagination: Tab navigation, Enter/Space to activate
- Focus indicators: 3px outline with primary color

### Screen Reader Support

Hidden text for screen readers:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
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

- [ ] Search with 3+ characters triggers search
- [ ] Search with < 3 characters doesn't trigger search
- [ ] Empty search clears results
- [ ] Folder filtering works correctly
- [ ] Tag filtering works (single and multiple)
- [ ] Pagination displays correctly
- [ ] Pagination navigation works
- [ ] URL query parameters are read on load
- [ ] URL query parameters update on search
- [ ] Results highlight search terms
- [ ] Loading state displays
- [ ] No results message displays
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Mobile responsive layout works

### Unit Testing

Example test structure:

```javascript
describe('Search Results Block', () => {
  describe('parseBlockConfig', () => {
    it('should extract folder paths from links', () => {
      // Test implementation
    });
    
    it('should extract classes from text', () => {
      // Test implementation
    });
  });
  
  describe('filterByFolder', () => {
    it('should filter by single folder', () => {
      // Test implementation
    });
    
    it('should filter by multiple folders', () => {
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
  { path: '/products/item1', title: 'Product 1', ... },
  { path: '/blog/post1', title: 'Blog Post 1', ... },
];

// Test search functionality
// Test filtering
// Test pagination
```

## Troubleshooting

### Search Not Working

**Issue**: Search doesn't execute or returns no results.

**Solutions**:
1. Check that `/query-index.json` exists and is accessible
2. Verify data structure matches expected format
3. Check browser console for errors
4. Verify search terms are 3+ characters

### Folder Filtering Not Working

**Issue**: Folder filter doesn't limit results.

**Solutions**:
1. Verify folder paths are correct (case-insensitive)
2. Check path transformation (AEM paths are converted)
3. Ensure paths start with `/`
4. Check that folder paths exist in data

### Tag Filter Not Appearing

**Issue**: Tag filter doesn't show even when enabled.

**Solutions**:
1. Verify `enableTagFilter` is set to `true`
2. Check that search results have tags
3. Verify `content-filter-utils.js` is loaded
4. Check browser console for errors

### Pagination Not Working

**Issue**: Pagination doesn't appear or navigation doesn't work.

**Solutions**:
1. Verify more than 3 results exist
2. Check that pagination is appended to block
3. Verify event listeners are attached
4. Check for JavaScript errors

### Configuration Not Parsing

**Issue**: Block configuration isn't being read correctly.

**Solutions**:
1. Check block DOM structure matches expected format
2. Verify field names match model definition
3. Use fallback methods if primary parsing fails
4. Add console logging to debug parsing

### Styling Issues

**Issue**: Styles not applying or layout broken.

**Solutions**:
1. Verify CSS file is loaded
2. Check for CSS conflicts with other blocks
3. Verify CSS custom properties are defined
4. Check responsive breakpoints

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

- Debounce user input
- Limit DOM manipulations
- Use efficient selectors
- Paginate large result sets

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
- [Content Filter Utils Documentation](../scripts/content-filter-utils.js)
- [Universal Editor Block Development Guide](../../AGENTS.md)
- [Author Guide](./search-results-author-guide.md)
