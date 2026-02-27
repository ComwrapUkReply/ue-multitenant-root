# Video Hero Block

A responsive and accessible video hero banner with overlay content, supporting WCAG 2.2 Level AA compliance.

## Features

- Full-width background video with dark overlay
- Responsive design (mobile-first)
- WCAG 2.2 Level AA accessible:
  - Respects `prefers-reduced-motion` (pauses video for users with motion sensitivity)
  - High contrast mode support
  - Keyboard navigation with visible focus indicators
  - Proper ARIA attributes
  - Video marked as decorative (`aria-hidden="true"`)
- Performance optimized:
  - Pauses video when out of viewport
  - Autoplay with fallback handling
- Customizable CTAs with primary/secondary button styles
- Optional badge/logo placement

## Content Structure

The block expects the following content structure in your document:

| Video Hero |
|------------|
| /designs/hero-video.mp4 |
| Creating moments that matter<br>**B2B go-to-market** orchestration |
| Optional subheading text |
| [Our Work](https://example.com/work)<br>[What We Do](https://example.com/services) |
| ![Adobe Platinum Partner](/designs/badge.png) |

### Row Breakdown:

1. **Row 1**: Video URL (path to MP4 file)
2. **Row 2**: Main heading (use `**text**` or `<strong>` for emphasis in red/pink)
3. **Row 3**: Subheading (optional)
4. **Row 4**: Call-to-action buttons (first link = primary button, second = secondary)
5. **Row 5**: Badge/logo image (optional)

## Styling

### Colors
- Primary accent: `#ff0066` (pink/red)
- Text: White on dark video overlay
- Buttons: Primary (filled pink), Secondary (outlined white)

### Typography
- Heading: Clamp 32px-56px, light weight (300)
- Emphasis: Bold (600) in accent color
- Subheading: Clamp 18px-24px
- Buttons: 16px, semibold (600)

### Responsive Breakpoints
- Mobile: < 768px (stacked buttons, smaller badge)
- Tablet: 768px - 1199px
- Desktop: ≥ 1200px

## Accessibility Features

### WCAG 2.2 Compliance

- **2.2.2 Pause, Stop, Hide**: Video pauses when `prefers-reduced-motion` is enabled
- **2.4.7 Focus Visible**: Clear focus indicators on all interactive elements
- **1.4.3 Contrast**: Minimum 4.5:1 contrast ratio for text
- **1.4.11 Non-text Contrast**: 3:1 contrast for UI components
- **1.4.12 Text Spacing**: Supports user text spacing overrides
- **1.4.13 Content on Hover or Focus**: No content appears on hover/focus
- **2.1.1 Keyboard**: All functionality available via keyboard
- **2.5.8 Target Size**: Touch targets minimum 44×44px

### Media Queries
- `prefers-reduced-motion: reduce` - Pauses video
- `prefers-contrast: high` - Increases overlay darkness and border widths
- `prefers-color-scheme` - Adjusts overlay opacity

## Example Usage

### In Google Docs or Word:

Create a table with "Video Hero" as the header and 5 rows following the structure above.

### In HTML:

```html
<div class="video-hero block">
  <div>
    <div>/designs/hero-video.mp4</div>
  </div>
  <div>
    <div>Creating moments that matter<br><strong>B2B go-to-market</strong> orchestration</div>
  </div>
  <div>
    <div>Your subheading here</div>
  </div>
  <div>
    <div>
      <a href="https://example.com/work">Our Work</a><br>
      <a href="https://example.com/services">What We Do</a>
    </div>
  </div>
  <div>
    <div><img src="/designs/badge.png" alt="Adobe Platinum Partner"></div>
  </div>
</div>
```

## Browser Support

- Modern browsers with HTML5 video support
- Falls back gracefully if autoplay is blocked
- Optimized for performance on mobile devices

## Performance Considerations

- Video automatically pauses when out of viewport
- Uses Intersection Observer API for efficient detection
- `playsinline` attribute for iOS compatibility
- Lazy loading for optimal initial page load
