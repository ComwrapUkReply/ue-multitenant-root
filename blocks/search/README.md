# Search Block

A powerful autocomplete search component for Universal Editor that provides instant search suggestions as users type, with optional navigation to a dedicated search results page.

## Overview

The Search block enables users to quickly find content on your site through an intelligent autocomplete interface. It provides:

- **Instant suggestions** as users type (minimum 3 characters)
- **Autosuggest mode** with inline results (up to 5 suggestions)
- **Navigation mode** that redirects to a dedicated search results page
- **Mobile-responsive** with toggle button for mobile devices
- **Accessibility features** including ARIA labels, keyboard navigation, and screen reader support
- **Multiple display styles** (list or card grid)

## Features

### Autosuggest Functionality

- **Real-time suggestions**: Results appear instantly as users type
- **Minimum query length**: Requires 3 characters before showing suggestions
- **Limited results**: Shows up to 5 suggestions inline
- **Query highlighting**: Search terms are highlighted in results using `<mark>` tags
- **URL synchronization**: Search queries are automatically added to the URL

### Display Modes

#### Autosuggest Mode (Default)

When enabled, the block shows inline search suggestions:

- Up to 5 results displayed below the search input
- Results update in real-time as users type
- Clicking a result navigates directly to that page
- "View all results" button appears when there are more than 5 results (if result page is configured)

#### Navigation Mode

When autosuggest is disabled, the block acts as a simple search input:

- No inline suggestions shown
- Clicking the search icon or pressing Enter navigates to the result page
- Search query is passed via URL parameter
- Ideal for sites with dedicated search results pages

### Display Styles

#### List View (Default)

Suggestions are displayed as a vertical list with:
- Title and description
- Border separators between items
- Hover effects
- No images

#### Cards View

Suggestions are displayed in a responsive grid with:
- Card-based layout (3 columns on desktop, 2 on tablet, 1 on mobile)
- Featured images (when available)
- Card hover effects with elevation
- Image zoom on hover

### Mobile Experience

- **Toggle button**: Mobile-friendly search button appears in header
- **Expandable panel**: Search panel expands/collapses on mobile
- **Full-width input**: Easy typing on mobile devices
- **Touch-friendly**: Large tap targets for results
- **Header integration**: Automatically positions based on header height

## Configuration Options

### Toggle to Turn Recommended Search

**Field Type**: Boolean  
**Label**: Toggle to turn recommended search  
**Description**: Enable list of recommendations when user is typing in the search input.

**Default**: `true` (enabled)

**When Enabled**:
- Shows inline suggestions as users type
- Displays up to 5 results
- Shows "View all results" button if more results exist

**When Disabled**:
- No inline suggestions
- Search icon becomes clickable button
- Pressing Enter or clicking icon navigates to result page
- Result page field becomes required

### Result Page

**Field Type**: AEM Content Link  
**Label**: Result Page...  
**Description**: Link to the search results page. When set, clicking the search icon or pressing Enter will navigate to this page with search results. This field is required when autosuggest is disabled.

**How It Works**:
- When configured, the search icon becomes a clickable button
- Pressing Enter navigates to the result page with the search query
- Clicking the search icon also navigates to the result page
- Search query is passed via URL parameter: `?q=search+term`

**Best Practice**: Create a dedicated search results page using the Search Results block and link to it here.

### Display Style

**Field Type**: Select  
**Label**: Display Style  
**Options**:
- **Default (List Results)**: Vertical list layout without images
- **Cards (Grid Results)**: Grid-based card layout with images

### Search Placeholder

**Field Type**: Text  
**Label**: Search Placeholder  
**Description**: Placeholder text shown in the search input field.

**Default**: `"Search..."`

**Examples**:
- "Search products..."
- "Find articles..."
- "Type to search..."

### No Results Message

**Field Type**: Text  
**Label**: No Results Message  
**Description**: Message shown when no results are found.

**Default**: `"No results found."`

**Examples**:
- "No matching content. Try different keywords."
- "Nothing found. Please try again."

### View All Results Button Text

**Field Type**: Text  
**Label**: View All Results Button Text  
**Description**: Text for the 'View all results' button shown when there are more than 5 results.

**Default**: `"View all {count} results"`

**Note**: The `{count}` placeholder is automatically replaced with the actual number of results.

**Examples**:
- "View all {count} results"
- "See all {count} matches"
- "Show all {count}"

## Usage Examples

### Basic Autosuggest Search

Create a search block with inline suggestions:

1. Add the Search block to your page (typically in the header)
2. Keep "Toggle to turn recommended search" enabled (default)
3. Optionally set a Result Page for "View all results" functionality
4. Select "Default (List Results)" for Display Style

**Result**: A search input that shows up to 5 suggestions as users type.

### Navigation-Only Search

Create a search block that only navigates to a results page:

1. Add the Search block
2. Disable "Toggle to turn recommended search"
3. **Required**: Set the Result Page field
4. Customize placeholder text

**Result**: A search input that navigates to the results page when users press Enter or click the search icon.

### Visual Search with Cards

Create a search block with card-style suggestions:

1. Add the Search block
2. Keep autosuggest enabled
3. Select "Cards (Grid Results)" for Display Style
4. Set a Result Page for full results

**Result**: A search input that shows suggestions as cards with images in a grid layout.

## Integration with Search Results Block

The Search block works seamlessly with the Search Results block:

1. **Search Block** - Provides the search input with autosuggest
2. **Search Results Block** - Displays full results on a dedicated page

**Integration Pattern**:
1. Add Search block to header or any page
2. Create a dedicated search results page
3. Add Search Results block to that page
4. Link the Search block's Result Page field to the search results page

**User Flow**:
1. User types in Search block → sees up to 5 suggestions
2. User clicks "View all results" → navigates to Search Results page
3. Search Results page shows all matching results with pagination and filtering

## Technical Details

### Data Source

The block uses `/query-index.json` as its data source. This file is automatically generated by Edge Delivery Services and contains an index of all searchable pages.

### Search Algorithm

- Searches through page titles, descriptions, and content
- Uses case-insensitive matching
- Supports multiple search terms (space-separated)
- Highlights matching terms in results

### Performance

- **No debouncing**: Results appear instantly (no delay)
- **Limited results**: Only shows 5 suggestions to keep performance optimal
- **Efficient filtering**: Client-side filtering for fast results
- **Lazy loading**: Images load as needed

### Accessibility

- **WCAG 2.2 compliant**: Meets accessibility standards
- **Keyboard navigation**: Full keyboard support
  - Tab to navigate
  - Enter to search or navigate
  - Escape to clear
- **Screen reader support**: ARIA labels and live regions
- **Focus management**: Input receives focus when search opens
- **Mobile accessibility**: Touch-friendly with proper ARIA attributes

### Mobile Behavior

- **Toggle button**: Appears in header on mobile
- **Expandable panel**: Slides down from header
- **Full-width**: Search input spans full width on mobile
- **Header-aware**: Automatically positions based on header height
- **Touch targets**: Large, easy-to-tap result items

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- `scripts/search-utils.js` - Search functionality and utilities
- `scripts/aem.js` - Icon decoration

## Related Components

- **Search Results Block** (`blocks/search-results/`) - Full search results page with pagination and filtering
- **Header Block** (`blocks/header/`) - Typically contains the Search block

## Differences from Search Results Block

| Feature | Search Block | Search Results Block |
|---------|-------------|---------------------|
| **Purpose** | Autocomplete input | Full results page |
| **Results Shown** | Up to 5 suggestions | All results with pagination |
| **Location** | Header or any page | Dedicated search page |
| **Filtering** | No filtering | Folder and tag filtering |
| **Pagination** | No pagination | Full pagination support |
| **Use Case** | Quick search, autocomplete | Comprehensive search experience |

## Support

For issues, questions, or feature requests, please refer to the developer guide or contact the development team.
