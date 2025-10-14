# Smart Language Switcher Setup Guide

This guide explains how to set up and use the smart language switcher for your Universal Editor multisite project.

## Overview

The smart language switcher provides intelligent URL mapping between different locales in your multisite setup. It supports:

- **Automatic Language Detection**: Detects current language from URL path
- **Intelligent URL Mapping**: Maps pages between languages using placeholders configuration
- **Multiple Display Styles**: Dropdown, inline links, or flag icons
- **Seamless Integration**: Works with existing header navigation
- **Fallback Support**: Graceful fallbacks when mappings are unavailable

## Supported Locales

The system supports the following locales based on your multisite configuration:

- `ch-de`: German (Switzerland) - `/ch/de/`
- `ch-fr`: French (Switzerland) - `/ch/fr/`
- `ch-en`: English (Switzerland) - `/ch/en/`
- `de-de`: German (Germany) - `/de/de/` (default)
- `de-en`: English (Germany) - `/de/en/`

## Setup Instructions

### 1. Component Registration

The language switcher components are automatically registered when you build the project. The following files handle the registration:

- `blocks/language-switcher/_language-switcher.json` - Universal Editor configuration
- `blocks/language-switcher/language-switcher.js` - Block implementation
- `blocks/language-switcher/language-switcher.css` - Styling

### 2. Header Integration

The language switcher is automatically integrated into your header navigation. It will:

1. Look for the `nav-tools` section in your header
2. Replace any placeholder text containing "language" or "lang"
3. Add the language switcher if no placeholder is found

### 3. URL Mappings Configuration

#### Option A: Using Universal Editor (Recommended)

1. In Universal Editor, create a new document called `placeholders`
2. Add a sheet called `language-switcher`
3. Create a table with the following columns:
   - `source`: Source URL path (e.g., `/ch/de/ueber-uns`)
   - `target`: Target URL path (e.g., `/ch/fr/a-propos`)
   - `description`: Optional description for the mapping

#### Option B: Manual Configuration

1. Copy the template file `placeholders-language-switcher-template.json`
2. Rename it to `placeholders.json`
3. Modify the mappings according to your site structure
4. Place it in your site root

### 4. Example URL Mappings

```json
{
  "data": [
    {
      "source": "/ch/de/",
      "target": "/ch/fr/",
      "description": "Homepage CH German to French"
    },
    {
      "source": "/ch/de/ueber-uns",
      "target": "/ch/fr/a-propos",
      "description": "About page CH German to French"
    },
    {
      "source": "/ch/de/produkte",
      "target": "/ch/en/products",
      "description": "Products page CH German to English"
    }
  ]
}
```

## Usage

### Adding Language Switcher Block

1. In Universal Editor, add a "Language Switcher" block to your page
2. Configure the following options:
   - **Supported Locales**: Select which languages to show
   - **Display Style**: Choose dropdown, inline, or flags
   - **Fallback Locale**: Set the default language
   - **Show Country Flags**: Enable/disable flag icons
   - **Preserve Path**: Maintain current page path when switching

### Display Styles

#### Dropdown (Default)
- Compact dropdown menu
- Shows current language with arrow
- Expandable list of other languages

#### Inline Links
- Horizontal list of language links
- Current language highlighted
- Separated by vertical bars

#### Flag Icons
- Flag-only display
- Current language has colored border
- Hover effects for other flags

### Block Options

You can customize the appearance using block options:

- **Position**: `header-right`, `header-left`, `centered`
- **Theme**: `light`, `dark`

## How It Works

### Language Detection

The system detects the current language by analyzing the URL path:

```javascript
// Examples:
// /ch/de/products → ch-de
// /de/en/about → de-en
// /ch/fr/ → ch-fr
```

### URL Mapping Logic

1. **Current page detection**: Extracts language and page path
2. **Mapping lookup**: Searches placeholders for current page
3. **Target URL construction**: Builds target language URL
4. **Fallback handling**: Uses standard pattern if no mapping found

### Fallback Behavior

If no specific mapping is found, the system:

1. Preserves the current page path
2. Changes only the language prefix
3. Navigates to the constructed URL

Example: `/ch/de/new-page` → `/ch/fr/new-page`

## Customization

### CSS Variables

The language switcher uses your theme's CSS variables:

- `--background-color`: Background colors
- `--text-color`: Text colors
- `--link-color`: Link and accent colors
- `--light-color`: Border and hover colors
- `--body-font-family`: Font family

### Custom Styling

You can override styles by targeting these classes:

```css
/* Dropdown style */
.language-switcher-dropdown-container { }
.language-switcher-current { }
.language-switcher-dropdown { }
.language-switcher-option { }

/* Inline style */
.language-switcher-inline-container { }
.language-switcher-inline { }
.language-switcher-link { }

/* Flags style */
.language-switcher-flags-container { }
.language-switcher-flags { }
.language-switcher-flag-button { }
```

## Troubleshooting

### Language Switcher Not Appearing

1. Check that `nav-tools` section exists in your header
2. Verify the header fragment is loading correctly
3. Ensure JavaScript files are loading without errors

### Incorrect Language Detection

1. Verify URL structure matches locale configuration
2. Check that paths start with correct language prefixes
3. Confirm default locale is set correctly

### Mapping Not Working

1. Verify `placeholders.json` is accessible at site root
2. Check the `language-switcher` sheet exists
3. Ensure mapping format is correct (source/target columns)

### Styling Issues

1. Check CSS variables are defined in your theme
2. Verify no conflicting styles override the component
3. Test responsive behavior on different screen sizes

## API Reference

### Core Functions

#### `getLanguage()`
Returns the current language code detected from URL.

#### `switchToLanguage(targetLang)`
Switches to the specified target language.

#### `getAvailableLanguages()`
Returns array of all configured languages with metadata.

#### `createLanguageSwitcher(container)`
Creates and returns a language switcher element.

### Configuration Options

```javascript
const config = {
  supportedLocales: ['ch-de', 'ch-fr', 'ch-en'],
  displayStyle: 'dropdown', // 'dropdown' | 'inline' | 'flags'
  fallbackLocale: 'de-de',
  showCountryFlags: true,
  preservePath: true
};
```

## Best Practices

1. **Always provide mappings** for important pages
2. **Test all language combinations** before going live
3. **Use descriptive mapping descriptions** for maintenance
4. **Keep fallback locale** as your primary language
5. **Test responsive behavior** on mobile devices
6. **Verify accessibility** with screen readers

## Support

For issues or questions:

1. Check the browser console for JavaScript errors
2. Verify network requests to `placeholders.json`
3. Test with different browsers and devices
4. Review the implementation files for debugging
