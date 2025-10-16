# Advanced Configuration Guide - Language Switcher

This guide provides detailed instructions for configuring advanced page mappings in the language switcher for your multitenant Universal Editor project.

## Overview

The language switcher supports sophisticated page mapping to handle cases where pages have different URLs across locales. This is essential for multilingual sites where page names are translated or follow different naming conventions.

## Configuration Methods

### Method 1: Centralized Configuration (Recommended)

The recommended approach uses a centralized configuration file that applies to all pages automatically.

#### Step 1: Edit Configuration File

Open `blocks/language-switcher/page-mappings.js` and update the `PAGE_MAPPINGS` object:

```javascript
export const PAGE_MAPPINGS = {
  // Add your page mappings here
  'ch-fr': {
    'a-propos': {
      'de-de': 'ueber-uns-de',
      'de-en': 'about-us',
      'ch-de': 'ueber-uns',
      'ch-en': 'about-us'
    },
    'nouveau-page': {
      'de-de': 'neue-seite',
      'de-en': 'new-page',
      'ch-de': 'neue-seite',
      'ch-en': 'new-page'
    }
  },
  'de-de': {
    'ueber-uns-de': {
      'ch-fr': 'a-propos',
      'ch-de': 'ueber-uns',
      'ch-en': 'about-us',
      'de-en': 'about-us'
    }
  }
  // Add more locales as needed
};
```

#### Step 2: Deploy Changes

1. Commit your changes to the repository
2. Push to your branch
3. The changes will automatically apply to all pages

### Method 2: Manual Block Configuration

For page-specific mappings when using the language switcher as a manual block:

#### Step 1: Add Language Switcher Block

1. Open your page in Universal Editor
2. Add a new block
3. Select "Language Switcher" from the Blocks group

#### Step 2: Configure Page Mapping

1. Click on the language switcher block
2. Open the block properties panel
3. Find the "Page Mapping (JSON format)" field
4. Enter your JSON configuration:

```json
{
  "ch-fr": {
    "current-page-path": {
      "de-de": "german-page-path",
      "ch-de": "swiss-german-path",
      "ch-en": "swiss-english-path",
      "de-en": "german-english-path"
    }
  }
}
```

## Real-World Examples

### Example 1: About Us Pages

Your requirement: Map `/a-propos` (French) to `/ueber-uns-de` (German)

```javascript
// In page-mappings.js
export const PAGE_MAPPINGS = {
  'ch-fr': {
    'a-propos': {
      'de-de': 'ueber-uns-de',
      'de-en': 'about-us',
      'ch-de': 'ueber-uns',
      'ch-en': 'about-us'
    }
  },
  'de-de': {
    'ueber-uns-de': {
      'ch-fr': 'a-propos',
      'ch-de': 'ueber-uns',
      'ch-en': 'about-us',
      'de-en': 'about-us'
    }
  },
  'ch-de': {
    'ueber-uns': {
      'ch-fr': 'a-propos',
      'de-de': 'ueber-uns-de',
      'ch-en': 'about-us',
      'de-en': 'about-us'
    }
  },
  'ch-en': {
    'about-us': {
      'ch-fr': 'a-propos',
      'ch-de': 'ueber-uns',
      'de-de': 'ueber-uns-de',
      'de-en': 'about-us'
    }
  },
  'de-en': {
    'about-us': {
      'ch-fr': 'a-propos',
      'ch-de': 'ueber-uns',
      'ch-en': 'about-us',
      'de-de': 'ueber-uns-de'
    }
  }
};
```

### Example 2: Product Pages with Categories

```javascript
export const PAGE_MAPPINGS = {
  'ch-fr': {
    'produits/electronique': {
      'de-de': 'produkte/elektronik',
      'de-en': 'products/electronics',
      'ch-de': 'produkte/elektronik',
      'ch-en': 'products/electronics'
    },
    'produits/vetements': {
      'de-de': 'produkte/kleidung',
      'de-en': 'products/clothing',
      'ch-de': 'produkte/kleidung',
      'ch-en': 'products/clothing'
    }
  },
  'de-de': {
    'produkte/elektronik': {
      'ch-fr': 'produits/electronique',
      'ch-de': 'produkte/elektronik',
      'ch-en': 'products/electronics',
      'de-en': 'products/electronics'
    }
  }
};
```

### Example 3: News and Blog Posts

```javascript
export const PAGE_MAPPINGS = {
  'ch-fr': {
    'actualites/2024/nouvelle-importante': {
      'de-de': 'nachrichten/2024/wichtige-neuigkeit',
      'de-en': 'news/2024/important-news',
      'ch-de': 'nachrichten/2024/wichtige-neuigkeit',
      'ch-en': 'news/2024/important-news'
    }
  }
};
```

## Advanced Features

### Nested Page Paths

The language switcher supports nested page paths:

```javascript
'services/consulting/digital-transformation': {
  'de-de': 'dienstleistungen/beratung/digitale-transformation',
  'ch-de': 'dienstleistungen/beratung/digitale-transformation'
}
```

### Fallback Handling

If a page mapping is not found, the language switcher will:

1. Try to use the same path in the target locale
2. If that fails, redirect to the fallback page (default: homepage)
3. Show a message if the page doesn't exist

### Custom Labels

Customize how locale names appear in the switcher:

```javascript
export const CUSTOM_LABELS = {
  'ch-de': 'Schweiz (Deutsch)',
  'ch-fr': 'Suisse (Français)',
  'ch-en': 'Switzerland (English)',
  'de-de': 'Deutschland (Deutsch)',
  'de-en': 'Germany (English)'
};
```

## Testing Your Configuration

### Step 1: Verify Mappings

1. Navigate to a page with mappings (e.g., `/a-propos` on the French site)
2. Open the language switcher
3. Click on a different locale
4. Verify you're redirected to the correct page

### Step 2: Test All Locales

Test the mapping from each locale to ensure bidirectional navigation works:

- **From CH-FR**: `https://main--ue-multitenant-root-ch-fr--comwrapukreply.aem.page/a-propos`
- **To DE-DE**: Should go to `https://main--ue-multitenant-root-de-de--comwrapukreply.aem.page/ueber-uns-de`

### Step 3: Test Fallback Behavior

1. Navigate to a page without mappings
2. Switch languages
3. Verify you're redirected to the homepage or fallback page

## Troubleshooting

### Common Issues

**Issue**: Language switcher shows but doesn't navigate correctly
**Solution**: Check JSON syntax in your page mappings

**Issue**: Some pages redirect to homepage instead of mapped page
**Solution**: Ensure bidirectional mappings (both source→target and target→source)

**Issue**: Language switcher doesn't appear in header
**Solution**: Verify the header fragment includes a nav-tools section

### Debug Mode

Add this to your browser console to debug page mappings:

```javascript
// Check current locale detection
console.log('Current locale:', window.languageSwitcher?.currentLocale);

// Check page mappings
console.log('Page mappings:', window.languageSwitcher?.pageMappings);

// Check current page path
console.log('Current path:', window.languageSwitcher?.currentPath);
```

## Best Practices

### 1. Bidirectional Mappings

Always create mappings in both directions:

```javascript
// ✅ Good: Bidirectional
'ch-fr': { 'a-propos': { 'de-de': 'ueber-uns-de' } },
'de-de': { 'ueber-uns-de': { 'ch-fr': 'a-propos' } }

// ❌ Bad: One-way only
'ch-fr': { 'a-propos': { 'de-de': 'ueber-uns-de' } }
```

### 2. Consistent Naming

Use consistent naming patterns across locales:

```javascript
// ✅ Good: Consistent pattern
'products/category-name'
'produkte/kategorie-name'
'produits/nom-categorie'

// ❌ Bad: Inconsistent
'products/electronics'
'elektronik'
'produits-electronique'
```

### 3. Documentation

Document your page mappings for team members:

```javascript
// Product pages mapping
// Maps product categories across all locales
'ch-fr': {
  'produits/electronique': { /* electronics category */ }
}
```

### 4. Testing

Always test mappings after adding new pages:

1. Create the page in all locales
2. Add mappings to configuration
3. Test navigation from each locale
4. Verify fallback behavior

## Maintenance

### Adding New Pages

1. **Create pages** in all required locales
2. **Update page-mappings.js** with new mappings
3. **Test navigation** between all locales
4. **Deploy changes** to production

### Removing Pages

1. **Remove mappings** from page-mappings.js
2. **Update fallback logic** if needed
3. **Test remaining mappings** still work
4. **Deploy changes**

This advanced configuration system provides flexible, maintainable page mapping for your multitenant Universal Editor project while ensuring consistent user experience across all locales.
