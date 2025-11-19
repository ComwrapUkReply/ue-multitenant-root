# Customize Page Metadata Guide

This guide explains how to add custom page properties (metadata) to AEM pages and use them in Universal Editor blocks for Edge Delivery Services projects.

## Table of Contents

1. [Overview](#overview)
2. [Understanding Page Metadata](#understanding-page-metadata)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Using Metadata in Blocks](#using-metadata-in-blocks)
5. [Query and Index Metadata](#query-and-index-metadata)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Overview

Page metadata allows content authors to add custom properties to pages that can be:
- Used for SEO and social sharing
- Queried and filtered in search
- Displayed in blocks and components
- Used for content categorization

## Understanding Page Metadata

### What is Page Metadata?
Page metadata consists of custom properties that are stored with each page and can be accessed in:
- The page's `<head>` section as meta tags
- Universal Editor page properties panel
- Query indexes for search and filtering
- Block JavaScript for dynamic content

### File Structure
```
project-root/
├── component-models.json     # Main component definitions
├── models/
│   └── _page.json           # Base page metadata model
└── helix-query.yaml         # Query indexing configuration
```

## Step-by-Step Implementation

### Step 1: Define Metadata Fields

Edit `/models/_page.json` to add your custom metadata fields:

```json
{
  "models": [
    {
      "id": "page-metadata",
      "fields": [
        {
          "component": "text",
          "valueType": "string",
        "name": "jcr:title",
        "label": "Title"
        },
        {
          "component": "text",
          "valueType": "string",
          "name": "jcr:description",
          "label": "Description"
        },
        {
          "component": "text",
          "valueType": "string",
          "name": "keywords",
          "multi": true,
          "label": "Keywords"
        },
        // Add your custom fields here
        {
          "component": "text",
          "valueType": "string",
          "name": "author-name",
          "label": "Author Name",
          "value": ""
        },
        {
          "component": "text",
          "valueType": "string",
          "name": "author-role",
          "label": "Author Role",
          "value": ""
        },
        {
          "component": "text",
          "valueType": "string",
          "name": "author-email",
          "label": "Author Email",
          "value": ""
        },
        {
          "component": "select",
          "name": "category",
          "label": "Category",
          "valueType": "string",
          "options": [
            {
              "name": "Blog",
              "value": "blog"
            },
            {
              "name": "News",
              "value": "news"
            },
            {
              "name": "Events",
              "value": "events"
            }
          ],
          "value": ""
        }
      ]
    }
  ]
}
```

### Step 2: Update Main Component Models

Edit `/component-models.json` to include the same fields:

```json
[
  {
    "id": "page-metadata",
    "fields": [
      // Same fields as in _page.json
    ]
  }
  // ... other models
]
```

### Step 3: Configure Query Indexing

Edit `/helix-query.yaml` to make metadata searchable:

```yaml
version: 1

indices:
  default:
    include:
      - '/**'
    exclude:
      - '/drafts/**'
    target: /query-index.json
    properties:
      lastModified:
        select: none
        value: parseTimestamp(headers["last-modified"], "ddd, DD MMM YYYY hh:mm:ss GMT")
      title:
        select: head > meta[property="og:title"]
        value: attribute(el, "content")
      description:
        select: head > meta[name="description"]
        value: attribute(el, "content")
      keywords:
        select: head > meta[name="keywords"]
        value: attribute(el, "content")
      robots:
        select: head > meta[name="robots"]
        value: attribute(el, "content")
      # Add your custom metadata properties
      author-name:
        select: head > meta[name="author-name"]
        value: attribute(el, "content")
      author-role:
        select: head > meta[name="author-role"]
        value: attribute(el, "content")
      author-email:
        select: head > meta[name="author-email"]
        value: attribute(el, "content")
      category:
        select: head > meta[name="category"]
        value: attribute(el, "content")
      image:
        select: head > meta[property="og:image"]
        value: match(attribute(el, "content"), "https://[^/]+(/.*)")

  # Optional: Create specialized indexes
  blog:
    include:
      - '/blog/**'
    target: /blog-index.json
    properties:
      # Include only relevant properties for blog content
      lastModified:
        select: none
        value: parseTimestamp(headers["last-modified"], "ddd, DD MMM YYYY hh:mm:ss GMT")
      title:
        select: head > meta[property="og:title"]
        value: attribute(el, "content")
      author-name:
        select: head > meta[name="author-name"]
        value: attribute(el, "content")
      author-role:
        select: head > meta[name="author-role"]
        value: attribute(el, "content")
      category:
        select: head > meta[name="category"]
        value: attribute(el, "content")
```

### Step 4: Deploy Changes

```bash
# Add all modified files
git add component-models.json models/_page.json helix-query.yaml

# Commit with descriptive message
git commit -m "Add custom page metadata: author info and category"

# Push to repository
git push
```

### Step 5: Test in Universal Editor

1. Open Universal Editor
2. Navigate to any page
3. Open Page Properties panel
4. Verify new fields are visible:
   - Author Name
   - Author Role
   - Author Email
   - Category (dropdown)

## Using Metadata in Blocks

### Method 1: Access via Meta Tags

```javascript
// blocks/author-info/author-info.js
export default function decorate(block) {
  // Get metadata from page head
  const authorName = getMetaContent('author-name');
  const authorRole = getMetaContent('author-role');
  const authorEmail = getMetaContent('author-email');
  const category = getMetaContent('category');

  // Create author info display
  if (authorName) {
    const authorInfo = document.createElement('div');
    authorInfo.className = 'author-info';
    
    authorInfo.innerHTML = `
      <div class="author-details">
        <h3>${authorName}</h3>
        ${authorRole ? `<p class="role">${authorRole}</p>` : ''}
        ${authorEmail ? `<p class="email"><a href="mailto:${authorEmail}">${authorEmail}</a></p>` : ''}
        ${category ? `<span class="category">${category}</span>` : ''}
      </div>
    `;
    
    block.appendChild(authorInfo);
  }
}

/**
 * Helper function to get meta tag content
 * @param {string} name - Meta tag name
 * @returns {string} Meta tag content or empty string
 */
function getMetaContent(name) {
  const meta = document.querySelector(`meta[name="${name}"]`);
  return meta ? meta.getAttribute('content') : '';
}
```

### Method 2: Query Index Data

```javascript
// blocks/blog-listing/blog-listing.js
export default function decorate(block) {
  // Fetch blog posts from query index
  fetchBlogPosts(block);
}

async function fetchBlogPosts(container) {
  try {
    const response = await fetch('/blog-index.json');
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      renderBlogPosts(container, data.data);
    } else {
      container.innerHTML = '<p>No blog posts found.</p>';
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    container.innerHTML = '<p>Error loading blog posts.</p>';
  }
}

function renderBlogPosts(container, posts) {
  const postsHTML = posts.map(post => `
    <article class="blog-post">
      <h2>${post.title || 'Untitled'}</h2>
      <div class="post-meta">
        <span class="author">By ${post['author-name'] || 'Unknown Author'}</span>
        <span class="role">${post['author-role'] || ''}</span>
        <span class="category">${post.category || ''}</span>
        <span class="date">${new Date(post.lastModified * 1000).toLocaleDateString()}</span>
      </div>
      <p class="description">${post.description || ''}</p>
      <a href="${post.path}" class="read-more">Read More</a>
    </article>
  `).join('');
  
  container.innerHTML = postsHTML;
}
```

### Method 3: Filter by Metadata

```javascript
// blocks/category-filter/category-filter.js
export default function decorate(block) {
  const category = getMetaContent('category');
  
  if (category) {
    // Add category-specific styling
    block.classList.add(`category-${category}`);
    
    // Add category badge
    const badge = document.createElement('span');
    badge.className = 'category-badge';
    badge.textContent = category.toUpperCase();
    block.appendChild(badge);
  }
}
```

## Query and Index Metadata

### Accessing Query Indexes

```javascript
// Fetch all pages with metadata
async function getAllPages() {
  const response = await fetch('/query-index.json');
  return await response.json();
}

// Filter by specific metadata
async function getPagesByCategory(category) {
  const data = await getAllPages();
  return data.data.filter(page => page.category === category);
}

// Search by author
async function getPagesByAuthor(authorName) {
  const data = await getAllPages();
  return data.data.filter(page => page['author-name'] === authorName);
}

// Get recent posts
async function getRecentPosts(limit = 5) {
  const data = await getAllPages();
  return data.data
    .sort((a, b) => b.lastModified - a.lastModified)
    .slice(0, limit);
}
```

### Using in Templates

```javascript
// blocks/recent-posts/recent-posts.js
export default function decorate(block) {
  const limit = block.dataset.limit || 5;
  
  getRecentPosts(limit).then(posts => {
    const postsHTML = posts.map(post => `
      <div class="recent-post">
        <h3><a href="${post.path}">${post.title}</a></h3>
        <p class="meta">
          By ${post['author-name']} • ${post.category} • 
          ${new Date(post.lastModified * 1000).toLocaleDateString()}
        </p>
      </div>
    `).join('');
    
    block.innerHTML = postsHTML;
  });
}
```

## Best Practices

### 1. Field Naming Conventions
- Use kebab-case for field names: `author-name`, `author-role`
- Use descriptive labels: "Author Name" instead of "Name"
- Provide default values when appropriate

### 2. Field Types
- **Text**: For simple text inputs
- **Select**: For predefined options (categories, status)
- **Multiselect**: For multiple selections
- **Reference**: For asset references

### 3. Validation
```javascript
// Validate required fields
function validateMetadata() {
  const requiredFields = ['author-name', 'category'];
  const missing = requiredFields.filter(field => !getMetaContent(field));
  
  if (missing.length > 0) {
    console.warn('Missing required metadata:', missing);
  }
}
```

### 4. Error Handling
```javascript
// Safe metadata access
function getMetaContent(name, defaultValue = '') {
  try {
    const meta = document.querySelector(`meta[name="${name}"]`);
    return meta ? meta.getAttribute('content') || defaultValue : defaultValue;
  } catch (error) {
    console.error(`Error accessing meta tag ${name}:`, error);
    return defaultValue;
  }
}
```

### 5. Performance
- Cache query results when possible
- Use specific indexes for better performance
- Lazy load metadata when needed

## Troubleshooting

### Common Issues

#### 1. Metadata Not Appearing in Universal Editor
**Solution**: Check that both `component-models.json` and `models/_page.json` have the same fields.

#### 2. Query Index Not Updating
**Solution**: 
- Verify `helix-query.yaml` is committed and pushed
- Wait 5-10 minutes for indexing
- Check that pages are published

#### 3. Metadata Not Accessible in JavaScript
**Solution**: Ensure meta tags are properly rendered in the page head:
```html
<meta name="author-name" content="John Doe">
<meta name="author-role" content="Content Writer">
<meta name="category" content="blog">
```

#### 4. Query Index Returns 404
**Solution**:
- Check `helix-query.yaml` syntax
- Verify target path is correct
- Ensure pages match include patterns

### Debugging Tools

```javascript
// Debug metadata
function debugMetadata() {
  const metaTags = document.querySelectorAll('meta[name]');
  console.log('Available metadata:', 
    Array.from(metaTags).map(meta => ({
      name: meta.getAttribute('name'),
      content: meta.getAttribute('content')
    }))
  );
}

// Debug query index
async function debugQueryIndex() {
  try {
    const response = await fetch('/query-index.json');
    const data = await response.json();
    console.log('Query index columns:', data.columns);
    console.log('Sample data:', data.data[0]);
  } catch (error) {
    console.error('Query index error:', error);
  }
}
```

## Summary

This guide covers the complete process of:
1. ✅ Adding custom page metadata fields
2. ✅ Configuring query indexing
3. ✅ Using metadata in blocks
4. ✅ Querying and filtering content
5. ✅ Following best practices
6. ✅ Troubleshooting common issues

Remember to always test your changes in Universal Editor and verify that metadata appears correctly in both the authoring interface and the published pages.