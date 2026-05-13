# Play/Pause Button Implementation

## Summary

Added intelligent play/pause button functionality to both the `video` and `video-hero` blocks. The buttons automatically display the correct initial state based on the autoplay setting.

## Changes Made

### 1. video-hero Block (`blocks/video-hero/`)

#### video-hero.js
- **Updated play/pause button initialization** (lines 179-227)
  - Button now shows **pause icon** when `autoplay` is enabled (video is playing)
  - Button now shows **play icon** when `autoplay` is disabled (video is paused)
  - Initial ARIA label correctly reflects the button state
  - Added `is-playing` class when autoplay is enabled
  - Added 100ms delayed state check to handle browser autoplay blocking

**Key Logic:**
```javascript
// Set initial state based on autoplay setting
const initialLabel = videoAutoplay ? 'Pause video' : 'Play video';
playToggle.setAttribute('aria-label', initialLabel);

// Show correct icon based on autoplay
playToggle.innerHTML = `
  <span class="video-hero-icon video-hero-icon-play ${videoAutoplay ? 'video-hero-icon-hidden' : ''}" ...>
  <span class="video-hero-icon video-hero-icon-pause ${videoAutoplay ? '' : 'video-hero-icon-hidden'}" ...>
`;
```

### 2. video Block (`blocks/video/`)

#### video.js
- **Added `createPlayPauseButton` function** (new function after line 119)
  - Creates a play/pause button with SVG icons
  - Sets initial state based on autoplay parameter
  - Handles play/pause toggling
  - Updates button state on video play/pause events
  - Returns button element for further manipulation

- **Updated `decorateTeaser` function** (line 28-79)
  - Now returns the video element for reference
  - Enables play/pause button attachment

- **Enhanced `decorateVideoOptions` function** (line 158-201)
  - Returns video options object with autoplay state
  - Automatically adds play/pause button to teaser video
  - Only adds button when native controls are disabled
  - Passes autoplay state to button creator

- **Updated main `decorate` function** (line 227-228)
  - Captures return values from decorateTeaser and decorateVideoOptions
  - Enables video options to be used for button creation

#### video.css
- **Added play/pause button styles** (lines 299-365)
  - Positioned in bottom-right corner
  - Semi-transparent black background with white border
  - Smooth hover transitions
  - Focus-visible outline for accessibility
  - Icon visibility toggle with `.video-icon-hidden` class
  - Responsive sizing (44px on desktop, 40px on mobile)
  - Proper z-index layering (z-index: 10)

**Key Styles:**
```css
.video-play-pause-toggle {
  position: absolute;
  bottom: var(--space-24);
  right: var(--space-24);
  z-index: 10;
  width: 44px;
  height: 44px;
  background: rgb(0 0 0 / 40%);
  border: var(--border-width-md) solid var(--color-white);
  border-radius: var(--border-radius-full);
}
```

## Behavior

### When Autoplay is Enabled (true)
1. Video starts playing automatically
2. **Pause button is visible** (pause icon shown)
3. Play icon is hidden (`.video-icon-hidden` class applied)
4. Button has `is-playing` class
5. ARIA label: "Pause video"
6. Clicking pauses the video and switches to play icon

### When Autoplay is Disabled (false)
1. Video is paused on load
2. **Play button is visible** (play icon shown)
3. Pause icon is hidden (`.video-icon-hidden` class applied)
4. Button does NOT have `is-playing` class
5. ARIA label: "Play video"
6. Clicking plays the video and switches to pause icon

### Fallback Handling
- If browser blocks autoplay, the 100ms delay state check ensures button reflects actual video state
- Button state updates automatically on play/pause events
- Works with both user interactions and programmatic video control

## Accessibility Features

1. **ARIA Labels**: Dynamic labels that update based on video state
2. **Focus Visible**: Clear focus outline for keyboard navigation
3. **Icon Visibility**: Uses `visibility: hidden` instead of `display: none` to maintain layout
4. **Touch Targets**: 44px minimum on desktop, 40px on mobile (meets WCAG 2.2 guidelines)
5. **Semantic HTML**: Uses `<button type="button">` with proper attributes

## Design Consistency

Both blocks now share:
- Similar button positioning (bottom-right corner)
- Consistent icon sizes and styling
- Same color scheme (white on semi-transparent black)
- Matching hover and focus states
- Responsive sizing breakpoints

## Testing Recommendations

1. **Autoplay Enabled**: Verify pause button appears and video plays
2. **Autoplay Disabled**: Verify play button appears and video is paused
3. **Browser Blocking**: Test with autoplay-restricted browsers (Safari, mobile)
4. **Keyboard Navigation**: Tab to button and activate with Enter/Space
5. **Screen Readers**: Verify ARIA labels are announced correctly
6. **Mobile Devices**: Check button sizing and touch target accessibility
7. **Native Controls**: When controls are enabled, button should not appear

## Browser Compatibility

- Modern browsers with ES6 support
- Uses standard HTML5 video API
- CSS custom properties for theming
- SVG icons for scalability
- Works with autoplay policies in Chrome, Safari, Firefox, Edge
