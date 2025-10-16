# Language Switcher Block

A comprehensive language switcher block for AEM Universal Editor with Edge Delivery Services, designed specifically for multitenant repoless configurations.

## Overview

The Language Switcher block provides seamless navigation between different locale versions of the same page in a multitenant setup. It automatically detects the current locale and generates appropriate links to equivalent pages in other locales.

## Features

- **Automatic Locale Detection**: Detects current locale from URL patterns
- **Smart Page Mapping**: Maps equivalent pages across different locales
- **Multiple Display Styles**: Dropdown, horizontal list, or flag-only display
- **Customizable Labels**: Override default locale names
- **Page Mapping Configuration**: Define custom page mappings between locales
- **Responsive Design**: Mobile-first approach with touch-friendly interface
- **Accessibility**: Full keyboard navigation and screen reader support
- **Analytics Integration**: Built-in tracking for language switching events

## Supported Locales

The block supports the following locales based on your multitenant configuration:

- **Switzerland German** (`ch-de`): 🇨🇭 Schweiz (Deutsch)
- **Switzerland French** (`ch-fr`): 🇨🇭 Suisse (Français)  
- **Switzerland English** (`ch-en`): 🇨🇭 Switzerland (English)
- **Germany German** (`de-de`): 🇩🇪 Deutschland (Deutsch) *(default)*
- **Germany English** (`de-en`): 🇩🇪 Germany (English)

## URL Mapping

The block automatically maps between your Edge Delivery Services sites:

- `https://main--ue-multitenant-root-ch-de--comwrapukreply.aem.page/` ↔ `/content/ue-multitenant-root/ch/de/`
- `https://main--ue-multitenant-root-ch-fr--comwrapukreply.aem.page/` ↔ `/content/ue-multitenant-root/ch/fr/`
- `https://main--ue-multitenant-root-ch-en--comwrapukreply.aem.page/` ↔ `/content/ue-multitenant-root/ch/en/`
- `https://main--ue-multitenant-root-de-de--comwrapukreply.aem.page/` ↔ `/content/ue-multitenant-root/de/de/`
- `https://main--ue-multitenant-root-de-en--comwrapukreply.aem.page/` ↔ `/content/ue-multitenant-root/de/en/`

### Inner Page Mapping

The block intelligently maps inner pages between locales. For example:
- `https://main--ue-multitenant-root-ch-fr--comwrapukreply.aem.page/a-propos`
- Maps to: `https://main--ue-multitenant-root-de-de--comwrapukreply.aem.page/ueber-uns-de`

## Configuration Options

### Display Style
- **Dropdown** (default): Compact dropdown menu
- **Horizontal**: Horizontal list of language options
- **Flags**: Flag-only display with tooltips

### Show Country Flags
- **Yes** (default): Display country flag emojis
- **No**: Text-only display

### Custom Labels
Override default locale labels using JSON format:
```json
{
  "ch-de": "Deutsch (Schweiz)",
  "ch-fr": "Français (Suisse)",
  "de-de": "Deutsch (Deutschland)"
}
```

### Page Mapping
Define custom page mappings between locales using JSON format:
```json
{
  "ch-fr": {
    "a-propos": {
      "de-de": "ueber-uns-de",
      "ch-de": "ueber-uns",
      "ch-en": "about-us"
    }
  }
}
```

### Exclude Locales
Select specific locales to hide from the switcher.

### Fallback Page
Default page path when a page doesn't exist in the target locale (default: `/`).

### Block Options
- **Style**: Compact or Large sizing
- **Position**: Left, Center, or Right alignment

## Usage

### Automatic Header Integration

The language switcher is **automatically added to the header** in the nav-tools area on all pages. This provides consistent language switching across your entire site without manual configuration.

**Header Features:**
- Compact dropdown design optimized for header space
- Responsive behavior (mobile and desktop)
- Automatic locale detection and page mapping
- Right-aligned dropdown menu to prevent overflow

### Manual Block Addition

You can also manually add the language switcher as a block to any page:

1. Open your page in Universal Editor
2. Add a new block
3. Select "Language Switcher" from the Blocks group
4. Configure the display options as needed
5. Publish the page

### Basic Configuration

For most use cases, the default settings work well:
- Display Style: Dropdown
- Show Flags: Yes
- Leave other fields empty for automatic behavior

### Advanced Configuration

For custom page mappings, use the Page Mapping field:

```json
{
  "current-locale": {
    "current-page-path": {
      "target-locale": "target-page-path"
    }
  }
}
```

Example:
```json
{
  "ch-fr": {
    "a-propos": {
      "de-de": "ueber-uns-de",
      "ch-de": "ueber-uns",
      "ch-en": "about-us",
      "de-en": "about-us"
    },
    "contact": {
      "de-de": "kontakt",
      "ch-de": "kontakt",
      "ch-en": "contact",
      "de-en": "contact"
    }
  }
}
```

## Styling

The block includes comprehensive CSS with support for:

- **Responsive Design**: Mobile-first approach
- **Theme Integration**: Uses CSS custom properties
- **Accessibility**: High contrast and reduced motion support
- **Multiple Layouts**: Dropdown, horizontal, and flag displays

### CSS Classes

- `.language-switcher-block`: Main block container
- `.language-switcher-container`: Inner container
- `.language-dropdown`: Dropdown style container
- `.language-list.horizontal`: Horizontal list style
- `.language-list.flags`: Flag-only style
- `.language-current`: Current locale indicator
- `.language-option`: Clickable locale options

### Block Modifiers

- `.compact`: Smaller sizing
- `.large`: Larger sizing  
- `.left`: Left alignment
- `.center`: Center alignment
- `.right`: Right alignment

## JavaScript API

The block exposes several utility functions for advanced customization:

### `detectCurrentLocale()`
Returns the current locale object or null if not detected.

### `getCurrentPagePath(currentLocale)`
Gets the current page path relative to the locale.

### `mapPagePath(currentPath, currentLocale, targetLocale, customMapping)`
Maps a page path to equivalent paths in other locales.

### `generateTargetURL(targetLocale, pagePath)`
Generates the complete target URL for a specific locale.

## Analytics

The block automatically tracks language switching events with the following data:

```javascript
{
  event: 'language_switch',
  language_from: 'ch-fr',
  language_to: 'de-de', 
  page_path: '/a-propos'
}
```

Events are sent to `window.dataLayer` if available.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user motion preferences

## Performance

- **Lightweight**: Minimal JavaScript footprint
- **Lazy Loading**: Images loaded on demand
- **Efficient DOM**: Minimal DOM manipulation
- **Caching**: Locale detection results cached

## Troubleshooting

### Language Switcher Not Appearing
- Verify the block is added to the page
- Check that component definitions are updated
- Ensure the page is published

### Incorrect Locale Detection
- Check URL patterns match expected format
- Verify site configuration in Edge Delivery Services
- Test with different locale URLs

### Page Mapping Not Working
- Validate JSON syntax in Page Mapping field
- Check that target pages exist
- Verify locale codes match configuration

### Styling Issues
- Check CSS custom properties are defined
- Verify theme integration
- Test responsive breakpoints

## Development

### File Structure
```
blocks/language-switcher/
├── _language-switcher.json    # Block definition and model
├── language-switcher.js       # Main JavaScript implementation  
├── language-switcher.css      # Styling and responsive design
├── index.js                   # Entry point
└── README.md                  # This documentation
```

### Testing

Test the language switcher on all locale sites:

1. **Switzerland German**: https://main--ue-multitenant-root-ch-de--comwrapukreply.aem.page/
2. **Switzerland French**: https://main--ue-multitenant-root-ch-fr--comwrapukreply.aem.page/
3. **Switzerland English**: https://main--ue-multitenant-root-ch-en--comwrapukreply.aem.page/
4. **Germany German**: https://main--ue-multitenant-root-de-de--comwrapukreply.aem.page/
5. **Germany English**: https://main--ue-multitenant-root-de-en--comwrapukreply.aem.page/

### Contributing

When modifying the language switcher:

1. Update the JavaScript for new functionality
2. Add corresponding CSS for styling
3. Update the JSON model for new configuration options
4. Test across all locales and devices
5. Update this documentation

## References

- [AEM Multi Site Management](https://www.aem.live/developer/repoless-multisite-manager)
- [Universal Editor Documentation](https://www.aem.live/developer/ue-tutorial)
- [Edge Delivery Services](https://www.aem.live/developer/repoless-authoring)
