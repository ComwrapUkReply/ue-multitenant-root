# Search Results Block - Author Guide

This guide helps content authors and editors use the Search Results block in Universal Editor to create search pages for their site.

## Table of Contents

1. [Overview](#overview)
2. [Adding the Block](#adding-the-block)
3. [Configuration Options](#configuration-options)
4. [Common Use Cases](#common-use-cases)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Overview

The Search Results block creates a searchable interface that allows visitors to find content on your site. It provides:

- A search input field where users can type queries
- Real-time search results that update as users type
- Optional filtering by content folders and tags
- Multiple display styles (list or card grid)
- Pagination for large result sets

## Adding the Block

### Step 1: Navigate to Your Page

1. Open Universal Editor
2. Navigate to the page where you want to add search functionality
3. This is typically a dedicated search page (e.g., `/search`)

### Step 2: Add the Block

1. Click the **+** button to add a new block
2. Search for "Search Results" in the component palette
3. Click on "Search Results" to add it to your page

### Step 3: Configure the Block

Click on the Search Results block to open the properties panel. You'll see several configuration options (detailed below).

## Configuration Options

### Filter by Folder

**Purpose**: Limit search results to specific sections of your site.

**When to Use**: 
- Create section-specific search pages (e.g., a search page only for blog posts)
- Restrict search to certain content types (e.g., only product pages)

**How to Configure**:
1. Click in the "Filter by Folder" field
2. Browse to the folder you want to filter by, or
3. Type the folder path directly (e.g., `/blog` or `/products`)
4. For multiple folders, separate them with commas (e.g., `/blog, /news`)

**Examples**:
- `/blog` - Shows only blog posts
- `/products` - Shows only product pages
- `/blog, /news` - Shows pages from both blog and news sections
- Leave empty - Shows all pages on the site

**Tips**:
- Folder paths are case-insensitive
- Paths should start with `/`
- You can use AEM content paths (they'll be automatically converted)

### Display Style

**Purpose**: Choose how search results are displayed.

**Options**:

#### Default (List Results)
- Vertical list layout
- Best for text-heavy content
- Shows title and description
- No images

**When to Use**: 
- General site search
- Content-focused sites
- When you want maximum results visible

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

### Enable Tag Filter

**Purpose**: Allow users to filter search results by tags.

**When to Use**:
- When your content has tags/categories
- You want users to refine search results
- You have content with multiple categories

**How to Configure**:
1. Toggle "Enable Tag Filter" to **On**
2. Tags will automatically appear when search results are displayed
3. Tags are extracted from the pages in search results

**How It Works**:
- When a user searches, the block automatically finds all unique tags in the results
- These tags appear as clickable pills above the results
- Users can click tags to filter results further
- The "Clear All" button appears when tags are selected

**Tips**:
- Tags are only shown if they exist in the search results
- If no tags are found, the tag filter won't appear
- Make sure your pages have tags assigned in AEM

### Allow Multiple Tag Selection

**Purpose**: Control whether users can select one or multiple tags at once.

**When to Use Multiple Selection**:
- Users might want to see content matching multiple categories
- Example: "Show me articles tagged with both 'Technology' and 'News'"

**When to Use Single Selection**:
- Simpler filtering experience
- Users choose one category at a time
- Example: "Show me either Technology OR News articles"

**How to Configure**:
1. Toggle "Allow Multiple Tag Selection" to **On** or **Off**
2. **On**: Users can click multiple tags to combine filters
3. **Off**: Selecting a tag deselects others

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

### No Results For Query

**Purpose**: Customize the message shown when no results are found.

**Default**: "No results found for"

**Examples**:
- "Sorry, no results found for"
- "We couldn't find anything matching"
- "No pages match"

**How to Configure**:
1. Type your custom message in the "No Results For Query" field
2. The search query will be appended automatically
3. Example: "No results found for" + " 'products'"

**Tips**:
- Keep it friendly and helpful
- Consider adding suggestions (e.g., "Try different keywords")

### Search Results Title

**Purpose**: Set the heading that appears above the search box.

**Default**: "Search Results"

**Examples**:
- "Search Our Site"
- "Find Content"
- "Site Search"
- "Search"

**How to Configure**:
1. Type your custom title in the "Search Results Title" field
2. Leave empty to use the default "Search Results"

**Tips**:
- Keep it concise
- Make it clear what users are searching
- Consider your page context

## Common Use Cases

### Use Case 1: General Site Search

**Goal**: Create a search page that searches all site content.

**Configuration**:
- **Filter by Folder**: Leave empty
- **Display Style**: Default (List Results)
- **Enable Tag Filter**: Off
- **Search Placeholder**: "Search..."
- **Search Results Title**: "Search"

**Result**: A simple search page that searches all content and displays results in a list.

### Use Case 2: Blog Search with Categories

**Goal**: Create a search page specifically for blog posts with category filtering.

**Configuration**:
- **Filter by Folder**: `/blog`
- **Display Style**: Cards (Grid Results)
- **Enable Tag Filter**: On
- **Allow Multiple Tag Selection**: On
- **Search Placeholder**: "Search blog posts..."
- **Search Results Title**: "Blog Search"

**Result**: A search page that only shows blog posts, displays them as cards with images, and allows users to filter by blog categories.

### Use Case 3: Product Search

**Goal**: Create a product search page with visual results.

**Configuration**:
- **Filter by Folder**: `/products`
- **Display Style**: Cards (Grid Results)
- **Enable Tag Filter**: On
- **Allow Multiple Tag Selection**: On
- **Search Placeholder**: "Search products..."
- **Search Results Title**: "Product Search"

**Result**: A product search page showing product cards with images, allowing users to filter by product categories.

### Use Case 4: Multi-Section Search

**Goal**: Create a search page that searches multiple sections.

**Configuration**:
- **Filter by Folder**: `/blog, /news, /resources`
- **Display Style**: Default (List Results)
- **Enable Tag Filter**: On
- **Allow Multiple Tag Selection**: Off
- **Search Placeholder**: "Search articles and resources..."
- **Search Results Title**: "Content Search"

**Result**: A search page that searches blog, news, and resources sections, with single-category filtering.

## Best Practices

### Folder Filtering

1. **Use Specific Paths**: Be specific with folder paths to avoid unintended results
2. **Test Paths**: Verify folder paths exist and contain content
3. **Multiple Folders**: Use comma separation for related content sections
4. **Case Sensitivity**: Paths are case-insensitive, but use consistent casing

### Tag Filtering

1. **Tag Your Content**: Ensure pages have relevant tags assigned
2. **Consistent Tagging**: Use consistent tag names across content
3. **Multiple vs Single**: Choose based on your content structure
   - Multiple: Good for content with overlapping categories
   - Single: Good for mutually exclusive categories

### Display Styles

1. **List View**: Best for text-heavy content or when you want to show many results
2. **Cards View**: Best when images are important or for visual content
3. **Consistency**: Use the same style across similar search pages

### Placeholder Text

1. **Be Specific**: Make it clear what users are searching
2. **Action-Oriented**: Use verbs like "Search", "Find", "Discover"
3. **Context-Aware**: Match the placeholder to the page context

### Titles and Messages

1. **Clear and Concise**: Keep titles short and descriptive
2. **User-Friendly**: Use friendly language for error messages
3. **Consistent**: Use consistent terminology across your site

### Testing

1. **Test Searches**: Try various search terms to ensure results are relevant
2. **Test Filters**: Verify folder and tag filters work correctly
3. **Test Empty States**: Search for terms that return no results
4. **Test on Mobile**: Verify the search works well on mobile devices

## Troubleshooting

### No Results Appearing

**Problem**: Search doesn't return any results, even for known content.

**Solutions**:
1. Check that `/query-index.json` exists and is up to date
2. Verify folder filter paths are correct
3. Ensure content has been published
4. Try searching with different terms

### Tag Filter Not Showing

**Problem**: Tag filter doesn't appear even when enabled.

**Solutions**:
1. Verify "Enable Tag Filter" is set to **On**
2. Ensure pages in search results have tags assigned
3. Check that tags exist in the content
4. Try a different search query that returns tagged content

### Wrong Results Showing

**Problem**: Search shows results from wrong sections.

**Solutions**:
1. Check folder filter paths are correct
2. Verify paths match your content structure
3. Ensure paths start with `/`
4. Check for typos in folder paths

### Images Not Showing in Cards

**Problem**: Card view doesn't show images.

**Solutions**:
1. Ensure pages have featured images assigned
2. Check that images are published
3. Verify image paths are correct
4. Try list view to see if content appears

### Pagination Not Working

**Problem**: Pagination doesn't appear or navigation doesn't work.

**Solutions**:
1. Ensure you have more than 3 search results
2. Check browser console for errors
3. Try refreshing the page
4. Verify JavaScript is enabled

### Configuration Not Saving

**Problem**: Changes to block configuration don't save.

**Solutions**:
1. Click outside the properties panel to save
2. Publish the page to save changes
3. Check that you have edit permissions
4. Try refreshing Universal Editor

## Tips and Tricks

### Creating Multiple Search Pages

You can create multiple search pages for different purposes:

- `/search` - General site search
- `/blog/search` - Blog-specific search
- `/products/search` - Product search
- `/resources/search` - Resources search

Each can have different configurations tailored to their content.

### Linking from Search Block

If you have a Search block (the search input component), you can link it to your Search Results page:

1. Configure the Search block to redirect to your Search Results page
2. The search query will be passed via URL parameter
3. The Search Results page will automatically load with the query

### Customizing Messages

Make your search experience more branded by customizing:
- Search placeholder text
- No results messages
- Search results title

### Using Tags Effectively

1. **Consistent Naming**: Use consistent tag names (e.g., always "Technology" not "Tech" or "technology")
2. **Relevant Tags**: Only tag content with relevant, useful tags
3. **Not Too Many**: Don't over-tag content (3-5 tags per page is usually enough)
4. **Hierarchical**: Consider using hierarchical tags if your CMS supports it

## Getting Help

If you encounter issues not covered in this guide:

1. Check the browser console for error messages
2. Verify your configuration matches the examples
3. Test with a simple configuration first
4. Contact your development team for technical issues

## Related Documentation

- [Comprehensive Guide](./README.md) - Overview of all features
- [Developer Guide](./search-results-developer-guide.md) - Technical documentation
- [Universal Editor Documentation](https://www.aem.live/developer/ue-tutorial) - General Universal Editor guide
