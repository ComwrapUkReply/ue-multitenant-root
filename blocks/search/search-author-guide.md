# Search - Author Guide

## Overview

The Search block provides a search input field that allows visitors to search your site's content. It displays instant suggestions as users type and can navigate to a dedicated search results page for full results.

This guide covers creating and managing Search blocks in AEM Universal Editor with Edge Delivery Services (EDS).

---

## How to Add a Search Block

### Creating Your First Search Block in Universal Editor

**Step 1: Add the Search Block**

1. Open your page in Universal Editor
2. Click the "+" button to add a new component
3. Search for or select "Search" from the block library
4. The Search block will be inserted into your page

**Step 2: Configure Result Page (Recommended)**

1. Select the Search block on your page
2. In the Properties panel, find the "Result Page" field
3. Click on the field to open the content browser
4. Navigate to and select your search results page
5. When set, pressing Enter or clicking the search icon will navigate users to the full results page

**Step 3: Choose Display Style**

1. While the Search block is selected, look for the "Display Style" option
2. Choose your preferred style:
   - **Default (Grid Results)**: Standard layout with grid-style suggestions
   - **Minimal (List Results)**: Compact list-style suggestions

**Step 4: Customize Messages (Optional)**

1. **Search Placeholder**: Custom placeholder text for the input field (default: "Search...")
2. **No Results Message**: Message shown when no results match the search (default: "No results found.")

**Step 5: Preview and Publish**

1. Preview your Search block using preview mode
2. Test the search functionality
3. Verify suggestions appear correctly
4. Publish when ready

---

## Search Options

### Result Page

Links to a dedicated search results page. When configured:
- Pressing **Enter** navigates to the results page with the search query
- Clicking the **search icon** navigates to the results page
- The search query is passed via URL parameter (`?q=your+search`)

**Best Practice**: Create a dedicated search results page using the Search Results block and link to it here.

### Display Style

- **Default (Grid Results)**: Suggestions appear in a grid layout with images (if available)
- **Minimal (List Results)**: Suggestions appear in a simple list format, text only

### Search Placeholder

Custom text shown in the search input before the user types. Keep it short and instructive.

**Examples**:
- "Search..."
- "Search products..."
- "Find articles..."

### No Results Message

Message displayed when the search finds no matching content.

**Examples**:
- "No results found."
- "No matching content. Try different keywords."
- "Nothing found. Please try again."

---

## How Search Works

### Instant Suggestions

As users type (minimum 3 characters), the search displays up to 5 matching suggestions instantly. Results are fetched from your site's content index (`/query-index.json`).

### Search Behavior

1. User types in the search field
2. After 3+ characters, suggestions appear below the input
3. Clicking a suggestion navigates directly to that page
4. If a Result Page is configured:
   - Pressing Enter navigates to the full results page
   - Clicking the search icon navigates to the full results page
5. Pressing Escape clears the search

### Content Matching

Search matches content based on:
- Page titles
- Page descriptions
- Page paths

Matching terms are highlighted in the suggestions.

---

## Placement Guidelines

### Header Integration

The Search block is designed to work in the site header. When placed in the header:
- A mobile-friendly toggle button appears on smaller screens
- The search panel expands/collapses for mobile users
- The search adapts to the header's styling

### Standalone Placement

You can also place the Search block on any page as a standalone element. This is useful for:
- Landing pages with prominent search functionality
- Help or support pages
- Resource library pages

---

## Writing Tips

### Do's

- **Set a Result Page** for comprehensive search results
- **Use clear placeholder text** that tells users what they can search for
- **Create a dedicated search results page** for the full search experience
- **Test search functionality** before publishing
- **Keep placeholder text concise** - it should fit comfortably in the input field

### Don'ts

- **Don't leave Result Page empty** if you want users to see all results
- **Don't use overly long placeholder text** - it may be cut off on mobile
- **Don't forget to test** on both desktop and mobile devices

---

## How Users Will Experience Your Search

### Desktop Experience

- Search input is always visible
- Suggestions appear in a dropdown as users type
- Results show titles and descriptions
- Matched terms are highlighted
- Clicking anywhere outside closes suggestions

### Mobile Experience

- Search toggle button appears in the header
- Tapping the button expands the search panel
- Full-width search input for easy typing
- Touch-friendly suggestion results
- Panel can be closed by tapping the toggle again

### Accessibility Features

- **Keyboard navigation**: Full keyboard support for typing and navigation
- **Screen reader support**: ARIA attributes for accessibility
- **Focus management**: Input receives focus when search opens
- **Escape key**: Clears search and closes suggestions

---

## Common Questions

### Q: Why don't I see any search results?

**A:** Search requires at least 3 characters. Also, ensure your site has published content that can be indexed.

### Q: How do I create a search results page?

**A:** Create a new page and add the "Search Results" block to it. Then link that page in the Search block's "Result Page" field.

### Q: Can I customize what content appears in search?

**A:** Search indexes all published pages automatically. The content comes from your site's `query-index.json` which includes all pages with titles and descriptions.

### Q: Why is search disabled in the editor?

**A:** Search is disabled in AEM authoring mode because the content index isn't available there. Test search functionality in preview or on the published site.

### Q: Can I have multiple Search blocks on one page?

**A:** Yes, but typically one Search block (usually in the header) is sufficient.

---

## Troubleshooting

### Search not showing any suggestions

**Check:**
- You've typed at least 3 characters
- Your site has published content
- You're not in AEM authoring mode (use preview instead)

**Resolution:** Test on the published site or preview mode.

### Result Page navigation not working

**Check:**
- Result Page field is properly configured
- The linked page exists and is published
- The page contains a Search Results block

**Resolution:** Verify the Result Page link in the Properties panel.

### Mobile search button not appearing

**Check:**
- The Search block is properly placed within the header
- The header is using the correct structure
- CSS styles are loading correctly

**Resolution:** Verify the Search block placement and header configuration.

---

## Quick Reference

| Option | Description | Default |
|--------|-------------|---------|
| Result Page | Link to search results page | None |
| Display Style | Grid or Minimal list view | Default (Grid) |
| Search Placeholder | Input placeholder text | "Search..." |
| No Results Message | Message when no results found | "No results found." |

**Minimum Characters**: 3 characters required before suggestions appear
**Maximum Suggestions**: 5 suggestions shown inline
**Data Source**: Automatic (uses site's query-index.json)

---

*Last Updated: January 2025*
*For technical documentation, see the developer guide*
*For AEM Universal Editor support, contact your AEM administrator*
