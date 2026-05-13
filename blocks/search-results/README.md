# Search Results Block

A comprehensive search results component for Universal Editor that provides real-time search functionality with advanced filtering options, pagination, and multiple display styles.

## Overview

The Search Results block enables users to search through site content with a powerful, accessible interface. It supports:

- **Real-time search** with debounced input (300ms delay)
- **Folder filtering** to limit results to specific content paths
- **Tag filtering** to filter results by page tags
- **Multiple display styles** (list or card grid)
- **Pagination** for large result sets (3 items per page)
- **URL query parameter support** for deep linking
- **Accessibility features** including ARIA labels, keyboard navigation, and screen reader support

## Features

### Search Functionality

- **Debounced search**: Searches execute 300ms after the user stops typing
- **Minimum query length**: Requires at least 3 characters before searching
- **Query highlighting**: Search terms are highlighted in results using `<mark>` tags
- **URL synchronization**: Search queries are automatically added to the URL for sharing and bookmarking

### Filtering Options

#### Folder Filtering

Filter search results to show only pages from specific folder paths. This is useful for creating section-specific search pages (e.g., a search page that only shows blog posts or product pages).

- Supports single or multiple folders (comma-separated)
- Automatically transforms AEM content paths to published paths
- Paths are case-insensitive

#### Tag Filtering

When enabled, the block automatically extracts unique tags from search results and displays them as filter pills. Users can click tags to further refine results.

- **Single or multiple selection**: Configure whether users can select one or multiple tags
- **Dynamic tag extraction**: Tags are extracted from the current search results
- **Clear all button**: Users can quickly clear all tag filters
- **Visual feedback**: Selected tags are highlighted with active state styling

### Display Styles

#### List View (Default)

Results are displayed as a vertical list with:
- Title and description
- Border separators between items
- Hover effects on titles
- Full-width layout

#### Cards View

Results are displayed in a responsive grid with:
- Card-based layout (3 columns on desktop, 2 on tablet, 1 on mobile)
- Featured images (when available)
- Card hover effects with elevation
- Image zoom on hover

### Pagination

- **Items per page**: 3 results per page (configurable in code)
- **Smart pagination**: Shows up to 5 page numbers with ellipsis for large page counts
- **Navigation controls**: Previous/Next buttons with disabled states
- **Accessibility**: Full ARIA support with live region announcements
- **Smooth scrolling**: Automatically scrolls to top of results on page change

## Configuration Options

### Filter by Folder

**Field Type**: AEM Content Link  
**Label**: Filter by Folder  
**Description**: Filter results to show only pages from this folder path (e.g., /products or /blog). Leave empty to show all results. You can specify multiple folders separated by commas.

**Example Values**:
- `/products` - Shows only product pages
- `/blog, /news` - Shows pages from both blog and news folders
- Empty - Shows all pages

### Display Style

**Field Type**: Select  
**Label**: Display Style  
**Options**:
- **Default (List Results)**: Vertical list layout
- **Cards (Grid Results)**: Grid-based card layout with images

### Enable Tag Filter

**Field Type**: Boolean  
**Label**: Enable Tag Filter  
**Description**: Show tag filter buttons based on page tags in search results. Users can filter results by clicking on tag pills.

**Default**: `false`

### Allow Multiple Tag Selection

**Field Type**: Boolean  
**Label**: Allow Multiple Tag Selection  
**Description**: When enabled, users can select multiple tags to filter results. When disabled, only one tag can be selected at a time.

**Default**: `true`

### Search Placeholder

**Field Type**: Text  
**Label**: Search Placeholder  
**Description**: Placeholder text shown in the search input field.

**Default**: `"Search..."`

### No Results For Query

**Field Type**: Text  
**Label**: No Results For Query  
**Description**: Message shown in the count area when no results are found, followed by the search query.

**Default**: `"No results found for"`

### Search Results Title

**Field Type**: Text  
**Label**: Search Results Title  
**Description**: Title shown above the search results.

**Default**: `"Search Results"`

## Usage Examples

### Basic Search Page

Create a simple search page that searches all content:

1. Add the Search Results block to a page
2. Leave "Filter by Folder" empty
3. Select "Default (List Results)" for Display Style
4. Keep tag filtering disabled

### Blog Search Page

Create a search page that only shows blog posts:

1. Add the Search Results block
2. Set "Filter by Folder" to `/blog` (or your blog folder path)
3. Enable tag filtering to allow users to filter by blog categories
4. Select "Cards (Grid Results)" for a more visual display

### Product Search with Tags

Create a product search page with tag filtering:

1. Add the Search Results block
2. Set "Filter by Folder" to `/products`
3. Enable tag filtering
4. Enable multiple tag selection (users can filter by multiple product categories)
5. Select "Cards (Grid Results)" to show product images

## Technical Details

### Data Source

The block uses `/query-index.json` as its data source. This file is automatically generated by Edge Delivery Services and contains an index of all searchable pages.

### Search Algorithm

- Searches through page titles, descriptions, and content
- Uses case-insensitive matching
- Supports multiple search terms (space-separated)
- Highlights matching terms in results

### Performance

- **Debounced input**: Reduces API calls during typing
- **Lazy loading**: Images load as needed
- **Efficient filtering**: Client-side filtering for fast results
- **Pagination**: Limits DOM elements for better performance

### Accessibility

- **WCAG 2.2 compliant**: Meets accessibility standards
- **Keyboard navigation**: Full keyboard support
- **Screen reader support**: ARIA labels and live regions
- **Focus management**: Clear focus indicators
- **Reduced motion**: Respects user preferences

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- `scripts/search-utils.js` - Search functionality and utilities
- `scripts/content-filter-utils.js` - Tag filtering functionality
- `scripts/aem.js` - Icon decoration

## Related Components

- **Search Block** (`blocks/search/`) - Search input component that can link to search results page
- **Dynamic Content Block** (`blocks/dynamic-content/`) - Similar filtering capabilities for content display

## Support

For issues, questions, or feature requests, please refer to the developer guide or contact the development team.
