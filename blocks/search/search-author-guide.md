# Search Block - Author Guide

This guide helps content authors and editors use the Search block in Universal Editor to create search functionality for their site.

## Table of Contents

1. [Overview](#overview)
2. [Adding the Block](#adding-the-block)
3. [Configuration Options](#configuration-options)
4. [Common Use Cases](#common-use-cases)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Overview

The Search block creates a search input field that allows visitors to quickly find content on your site. It provides:

- A search input field where users can type queries
- Instant search suggestions that appear as users type (up to 5 results)
- Optional navigation to a dedicated search results page
- Mobile-responsive design with toggle button
- Multiple display styles (list or card grid)

## Adding the Block

### Step 1: Navigate to Your Page

1. Open Universal Editor
2. Navigate to the page where you want to add search functionality
3. This is typically in the header, but can be placed anywhere

### Step 2: Add the Block

1. Click the **+** button to add a new block
2. Search for "Search" in the component palette
3. Click on "Search" to add it to your page

### Step 3: Configure the Block

Click on the Search block to open the properties panel. You'll see several configuration options (detailed below).

## Configuration Options

### Toggle to Turn Recommended Search

**Purpose**: Control whether inline search suggestions appear as users type.

**When Enabled (Default)**:
- Shows up to 5 suggestions below the search input
- Suggestions update in real-time as users type
- "View all results" button appears if more than 5 results exist
- Users can click suggestions to navigate directly

**When Disabled**:
- No inline suggestions shown
- Search icon becomes a clickable button
- Pressing Enter or clicking icon navigates to result page
- **Important**: Result Page field becomes required when disabled

**How to Configure**:
1. Toggle "Toggle to turn recommended search" to **On** or **Off**
2. **On**: Shows inline suggestions (default)
3. **Off**: Navigation-only mode (requires Result Page)

**When to Disable**:
- You have a dedicated search results page
- You want a simpler search experience
- You prefer navigation over inline suggestions

### Result Page

**Purpose**: Link to a dedicated search results page for full search functionality.

**When to Use**:
- You have a Search Results block on another page
- You want users to see all search results with pagination
- You want advanced filtering options (folder, tags)

**How to Configure**:
1. Click in the "Result Page..." field
2. Browse to your search results page, or
3. Type the page path directly (e.g., `/search`)

**How It Works**:
- When configured, the search icon becomes clickable
- Pressing **Enter** navigates to the result page with the search query
- Clicking the **search icon** also navigates to the result page
- Search query is passed via URL parameter: `?q=search+term`

**Best Practice**: Create a dedicated search results page using the Search Results block and link to it here.

**Required When**: Autosuggest is disabled (you must set a result page)

### Display Style

**Purpose**: Choose how search suggestions are displayed.

**Options**:

#### Default (List Results)
- Vertical list layout
- Shows title and description
- No images
- Best for text-heavy content

**When to Use**: 
- General site search
- Content-focused sites
- When you want a clean, simple interface

#### Cards (Grid Results)
- Grid-based card layout
- Shows images when available
- 3 columns on desktop, 2 on tablet, 1 on mobile
- More visual presentation

**When to Use**:
- Image-rich content
- Product catalogs
- Blog/article listings
- When visual appeal is important

**How to Configure**:
1. Click the "Display Style" dropdown
2. Select either "Default (List Results)" or "Cards (Grid Results)"

### Search Placeholder

**Purpose**: Customize the placeholder text in the search input field.

**Default**: "Search..."

**Examples**:
- "Search products..."
- "Find articles..."
- "Type to search..."
- "What are you looking for?"

**How to Configure**:
1. Type your custom placeholder text in the "Search Placeholder" field
2. Leave empty to use the default "Search..."

**Tips**:
- Keep it short and descriptive
- Use action-oriented language
- Consider your audience
- Test on mobile to ensure it fits

### No Results Message

**Purpose**: Customize the message shown when no results are found.

**Default**: "No results found."

**Examples**:
- "No matching content. Try different keywords."
- "Nothing found. Please try again."
- "Sorry, we couldn't find anything matching your search."

**How to Configure**:
1. Type your custom message in the "No Results Message" field
2. Leave empty to use the default "No results found."

**Tips**:
- Keep it friendly and helpful
- Consider adding suggestions (e.g., "Try different keywords")
- Match your site's tone

### View All Results Button Text

**Purpose**: Customize the text for the "View all results" button.

**Default**: "View all {count} results"

**Note**: The `{count}` placeholder is automatically replaced with the actual number of results.

**Examples**:
- "View all {count} results"
- "See all {count} matches"
- "Show all {count} results"
- "View {count} more results"

**How to Configure**:
1. Type your custom button text in the "View All Results Button Text" field
2. Include `{count}` where you want the number to appear
3. Leave empty to use the default

**When It Appears**:
- Only shows when there are more than 5 search results
- Only shows when Result Page is configured
- Only shows when autosuggest is enabled

## Common Use Cases

### Use Case 1: Header Search with Autosuggest

**Goal**: Create a search in the header with inline suggestions.

**Configuration**:
- **Toggle to turn recommended search**: On (default)
- **Result Page**: `/search` (optional, but recommended)
- **Display Style**: Default (List Results)
- **Search Placeholder**: "Search..."
- **No Results Message**: "No results found."

**Result**: A search input in the header that shows up to 5 suggestions as users type, with option to view all results.

### Use Case 2: Navigation-Only Search

**Goal**: Create a simple search that only navigates to results page.

**Configuration**:
- **Toggle to turn recommended search**: Off
- **Result Page**: `/search` (required)
- **Display Style**: Default (List Results)
- **Search Placeholder**: "Search..."
- **No Results Message**: Not used (no inline results)

**Result**: A search input with clickable icon that navigates to the search results page when users press Enter or click the icon.

### Use Case 3: Visual Search with Cards

**Goal**: Create a search with visual card-style suggestions.

**Configuration**:
- **Toggle to turn recommended search**: On
- **Result Page**: `/search`
- **Display Style**: Cards (Grid Results)
- **Search Placeholder**: "Search products..."
- **View All Results Button Text**: "View all {count} products"

**Result**: A search input that shows suggestions as cards with images in a grid layout.

### Use Case 4: Landing Page Search

**Goal**: Create a prominent search on a landing page.

**Configuration**:
- **Toggle to turn recommended search**: On
- **Result Page**: `/search`
- **Display Style**: Cards (Grid Results)
- **Search Placeholder**: "Discover our content..."
- **No Results Message**: "No content found. Try different keywords."

**Result**: A visually appealing search with card-style suggestions perfect for landing pages.

## Best Practices

### Autosuggest Configuration

1. **Enable for Quick Search**: Keep autosuggest enabled for most use cases
2. **Disable for Simple Navigation**: Disable if you prefer navigation-only
3. **Always Set Result Page**: Even with autosuggest, set a result page for "View all results"

### Result Page

1. **Create Dedicated Page**: Create a search results page using Search Results block
2. **Test Navigation**: Verify navigation works correctly
3. **Required When Disabled**: Remember to set result page when autosuggest is disabled

### Display Styles

1. **List View**: Best for text-heavy content or general search
2. **Cards View**: Best when images are important or for visual content
3. **Consistency**: Use the same style across your site

### Placeholder Text

1. **Be Specific**: Make it clear what users are searching
2. **Action-Oriented**: Use verbs like "Search", "Find", "Discover"
3. **Context-Aware**: Match the placeholder to the page context
4. **Keep It Short**: Ensure it fits on mobile devices

### Messages

1. **Clear and Concise**: Keep messages short and descriptive
2. **User-Friendly**: Use friendly language for error messages
3. **Consistent**: Use consistent terminology across your site
4. **Helpful**: Consider adding suggestions in no-results messages

### Mobile Considerations

1. **Test on Mobile**: Always test search functionality on mobile devices
2. **Placeholder Length**: Keep placeholder text short for mobile
3. **Touch Targets**: Ensure results are easy to tap on mobile
4. **Toggle Button**: Verify mobile toggle button works correctly

### Integration with Search Results

1. **Create Results Page**: Use Search Results block for full results
2. **Link Properly**: Link Search block to Search Results page
3. **Consistent Styling**: Match styling between Search and Search Results blocks
4. **Test Flow**: Test the complete search flow from input to results

## Troubleshooting

### No Suggestions Appearing

**Problem**: Search doesn't show any suggestions when typing.

**Solutions**:
1. Check that you've typed at least 3 characters
2. Verify autosuggest is enabled (should be On)
3. Ensure your site has published content
4. Check that you're not in AEM authoring mode (use preview)
5. Verify `/query-index.json` exists and is accessible

### Result Page Navigation Not Working

**Problem**: Clicking search icon or pressing Enter doesn't navigate.

**Solutions**:
1. Verify Result Page field is configured
2. Check that the linked page exists and is published
3. Ensure the page path is correct
4. Check browser console for errors
5. Verify URL parameter is being set (`?q=term`)

### Mobile Toggle Button Not Appearing

**Problem**: Mobile search button doesn't show on mobile devices.

**Solutions**:
1. Verify Search block is inside `.search-wrapper` element
2. Check that header structure is correct
3. Ensure CSS is loading correctly
4. Check for JavaScript errors
5. Verify block is properly placed in header

### Autosuggest Not Disabling

**Problem**: Suggestions still show when autosuggest is disabled.

**Solutions**:
1. Verify toggle is set to Off
2. Check that block has `no-autosuggest` class
3. Ensure results container is not in DOM
4. Clear browser cache
5. Refresh the page

### View All Results Button Not Showing

**Problem**: "View all results" button doesn't appear.

**Solutions**:
1. Verify there are more than 5 search results
2. Check that Result Page is configured
3. Ensure autosuggest is enabled
4. Verify button text is configured
5. Check that search has returned results

### Search Not Working in Editor

**Problem**: Search doesn't work in AEM authoring mode.

**Solutions**:
1. This is expected behavior - search requires published content
2. Test in preview mode instead
3. Test on published site
4. Search index is only available on published sites

### URL Query Not Restoring

**Problem**: Search query from URL doesn't populate input on page load.

**Solutions**:
1. Verify URL parameter format is correct (`?q=term`)
2. Check that query parameter is present in URL
3. Ensure block initialization completes
4. Check browser console for errors
5. Verify `getQueryFromUrl()` function works

## Tips and Tricks

### Creating Multiple Search Blocks

You can create multiple search blocks for different purposes:

- Header search - General site search
- Landing page search - Prominent search on homepage
- Section search - Search specific to a section

Each can have different configurations tailored to their context.

### Customizing Button Text

Use the `{count}` placeholder in "View All Results Button Text" to show the number of results:

- "View all {count} results" → "View all 25 results"
- "See {count} more" → "See 25 more"
- "Show all {count} matches" → "Show all 25 matches"

### Integration with Search Results

For the best user experience:

1. Create a Search Results page with the Search Results block
2. Configure it with appropriate filters (folder, tags)
3. Link the Search block's Result Page to the Search Results page
4. Test the complete flow from search to results

### Mobile Optimization

- Keep placeholder text short (mobile screens are narrow)
- Test toggle button functionality
- Verify search panel expands correctly
- Ensure results are touch-friendly

## Getting Help

If you encounter issues not covered in this guide:

1. Check the browser console for error messages
2. Verify your configuration matches the examples
3. Test with a simple configuration first
4. Contact your development team for technical issues

## Related Documentation

- [Comprehensive Guide](./README.md) - Overview of all features
- [Developer Guide](./search-developer-guide.md) - Technical documentation
- [Search Results Block](../search-results/README.md) - Full search results page
- [Universal Editor Documentation](https://www.aem.live/developer/ue-tutorial) - General Universal Editor guide
