# Universal Editor Multilingual Content Setup Guide

This guide explains how to create and organize multilingual content in Adobe Universal Editor for your multisite with country/language structure.

## URL Structure Overview

Your multilingual setup supports these URL patterns:
- `en/uk` - English (United Kingdom)
- `en/us` - English (United States)
- `ch/de` - German (Switzerland)
- `ch/fr` - French (Switzerland)
- `ch/it` - Italian (Switzerland)
- `de/de` - German (Germany)
- `fr/fr` - French (France)
- `it/it` - Italian (Italy)
- `pl/pl` - Polish (Poland)

## Content Folder Structure

### 1. Create Locale Folders in Universal Editor

In Universal Editor, create the following folder structure in your content repository:

```
/content/
├── en/
│   ├── uk/
│   │   ├── index (homepage)
│   │   ├── about/
│   │   ├── products/
│   │   └── contact/
│   └── us/
│       ├── index (homepage)
│       ├── about/
│       ├── products/
│       └── contact/
├── ch/
│   ├── de/
│   │   ├── index (homepage)
│   │   ├── ueber-uns/
│   │   ├── produkte/
│   │   └── kontakt/
│   ├── fr/
│   │   ├── index (homepage)
│   │   ├── a-propos/
│   │   ├── produits/
│   │   └── contact/
│   └── it/
│       ├── index (homepage)
│       ├── chi-siamo/
│       ├── prodotti/
│       └── contatto/
├── de/
│   └── de/
│       ├── index (homepage)
│       ├── ueber-uns/
│       ├── produkte/
│       └── kontakt/
├── fr/
│   └── fr/
│       ├── index (homepage)
│       ├── a-propos/
│       ├── produits/
│       └── contact/
├── it/
│   └── it/
│       ├── index (homepage)
│       ├── chi-siamo/
│       ├── prodotti/
│       └── contatto/
└── pl/
    └── pl/
        ├── index (homepage)
        ├── o-nas/
        ├── produkty/
        └── kontakt/
```

### 2. Step-by-Step Content Creation

#### Step 1: Create Root Locale Folders
1. In Universal Editor, navigate to your content root
2. Create folders for each country/language combination:
   - `en` (for English locales)
   - `ch` (for Switzerland)
   - `de` (for Germany)
   - `fr` (for France)
   - `it` (for Italy)
   - `pl` (for Poland)

#### Step 2: Create Language Subfolders
Within each country folder, create language subfolders:
- In `en/`: create `uk` and `us`
- In `ch/`: create `de`, `fr`, and `it`
- In `de/`: create `de`
- In `fr/`: create `fr`
- In `it/`: create `it`
- In `pl/`: create `pl`

#### Step 3: Create Homepage for Each Locale
1. In each language folder (e.g., `en/uk/`), create an `index` document
2. This will be your homepage for that locale
3. Configure the page metadata:
   - Set appropriate `<title>` for the locale
   - Add `lang` attribute (e.g., `en-GB`, `de-CH`, `fr-CH`)
   - Include locale-specific content

#### Step 4: Create Section Pages
For each locale, create relevant section pages:
- **English locales**: `about`, `products`, `contact`
- **German locales**: `ueber-uns`, `produkte`, `kontakt`
- **French locales**: `a-propos`, `produits`, `contact`
- **Italian locales**: `chi-siamo`, `prodotti`, `contatto`
- **Polish locale**: `o-nas`, `produkty`, `kontakt`

## Content Creation Best Practices

### 1. Page Templates
Use consistent page templates across locales:
- Same block structure
- Consistent layout
- Locale-specific content and images

### 2. Metadata Configuration
For each page, set appropriate metadata:
```html
<!-- In page properties -->
<meta name="language" content="en-GB">
<meta name="country" content="UK">
<meta name="locale" content="en-uk">
```

### 3. Navigation Setup
- Create locale-specific navigation menus
- Use translated menu labels
- Ensure internal links point to correct locale paths

### 4. Header and Footer
1. **Add Language Switcher to Header**:
   - Edit your header template
   - Add the Language Switcher block
   - Configure supported locales in the block settings

2. **Localize Header/Footer Content**:
   - Create locale-specific header/footer content
   - Translate navigation items
   - Update contact information per locale

## Universal Editor Configuration

### 1. Block Configuration
Ensure your blocks support multilingual content:
- Use the Language Switcher block in headers
- Configure Quote, Hero, Cards blocks for each locale
- Set appropriate content for each language

### 2. Language Switcher Block Setup
When adding the Language Switcher block:
1. **Supported Locales**: Select the locales you want to support
2. **Fallback Locale**: Choose your primary locale (usually `en-uk`)
3. **Show Country Flags**: Enable for better UX
4. **Group by Country**: Enable for countries with multiple languages
5. **Preserve Path**: Enable to maintain current page path when switching

### 3. Content Linking Strategy
- **Internal Links**: Always use relative paths within the same locale
- **Cross-Locale Links**: Use absolute paths or let the language switcher handle them
- **Media Assets**: Consider locale-specific images and videos

## URL Mapping and SEO

### 1. URL Structure Consistency
Maintain consistent URL patterns:
- `/{country}/{language}/page-name`
- Example: `/ch/de/produkte` or `/en/uk/products`

### 2. Hreflang Implementation
The system automatically generates hreflang tags for:
- `en-GB` for `en/uk`
- `en-US` for `en/us`
- `de-CH` for `ch/de`
- `fr-CH` for `ch/fr`
- `it-CH` for `ch/it`
- `de-DE` for `de/de`
- `fr-FR` for `fr/fr`
- `it-IT` for `it/it`
- `pl-PL` for `pl/pl`

### 3. Sitemap Generation
Each locale will have its own sitemap section with proper hreflang attributes.

## Testing Your Setup

### 1. URL Testing
Test that these URLs work correctly:
- `https://your-site.aem.page/en/uk/`
- `https://your-site.aem.page/ch/de/`
- `https://your-site.aem.page/ch/fr/`

### 2. Language Switcher Testing
1. Navigate to any page
2. Use the language switcher to change locale
3. Verify you land on the equivalent page in the new locale
4. Check that the URL structure is correct

### 3. Content Verification
- Ensure each locale has appropriate translated content
- Verify images and media are locale-appropriate
- Test that internal navigation works within each locale

## Common Issues and Solutions

### Issue 1: Language Switcher Not Appearing
**Solution**: Ensure the Language Switcher block is added to your header template and configured with supported locales.

### Issue 2: Wrong Locale Detection
**Solution**: Check that your URL structure matches the expected pattern (`/country/language/` or `/language/country/`).

### Issue 3: Missing Translations
**Solution**: Create equivalent pages in all supported locales, or configure fallback behavior in the language switcher.

### Issue 4: SEO Issues
**Solution**: Verify that hreflang tags are correctly generated and that each locale has appropriate metadata.

## Next Steps

1. **Create Master Content**: Start with your primary locale (e.g., `en/uk`)
2. **Translate Content**: Create equivalent pages in other locales
3. **Test Navigation**: Ensure the language switcher works correctly
4. **Optimize for SEO**: Verify hreflang and metadata implementation
5. **Launch Gradually**: Roll out locales incrementally for better management

This structure provides a solid foundation for your multilingual EDS multisite using Universal Editor for content management.
