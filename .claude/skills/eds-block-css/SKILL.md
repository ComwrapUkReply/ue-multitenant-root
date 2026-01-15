# EDS Block CSS Creation Skill

## Overview

This skill provides comprehensive guidelines for creating CSS for new Edge Delivery Services (EDS) blocks in Adobe Experience Manager Universal Editor projects. The focus is on simple, maintainable CSS that follows best practices for block isolation, responsive design, and performance.

## Core Principles

### CSS Selector Simplicity
- **Do not use @important** - This breaks the natural cascade and makes debugging difficult
- **Do not use generic .block class** - Always use block-specific naming to avoid conflicts
- **Use only block-specific naming** - Prefix all classes with the block name
- **Use simplest CSS selectors** - Prefer direct class selectors over complex combinations

### Block-Specific Naming Convention
```css
/* ✅ CORRECT - Block-specific naming */
.teaser-image {
  /* styles */
}

.teaser-title {
  /* styles */
}

/* ❌ INCORRECT - Generic naming */
.image {
  /* styles */
}

.title {
  /* styles */
}
```

## CSS Structure for New Blocks

### Basic Block CSS Template
When creating CSS for a new block, follow this structure:

```css
/* blocks/your-block-name/your-block-name.css */

/* ===== MOBILE-FIRST BASE STYLES ===== */
/* Styles for mobile devices (default) */
.your-block-name {
  margin: 1rem 0;
  padding: 1rem;
}

/* Block content elements */
.your-block-name-content {
  /* Content wrapper styles */
}

.your-block-name-title {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.your-block-name-text {
  line-height: 1.6;
  margin-bottom: 1rem;
}

/* ===== TABLET STYLES ===== */
@media (width >= 600px) {
  .your-block-name {
    padding: 1.5rem;
  }

  .your-block-name-title {
    font-size: 1.75rem;
  }
}

/* ===== DESKTOP STYLES ===== */
@media (width >= 900px) {
  .your-block-name {
    padding: 2rem;
  }

  .your-block-name-title {
    font-size: 2rem;
  }
}

/* ===== LARGE DESKTOP STYLES ===== */
@media (width >= 1200px) {
  .your-block-name {
    max-width: 1200px;
    margin: 2rem auto;
  }
}
```

### Block Container vs Wrapper vs Content

For Franklin blocks, follow this hierarchy:
- **Block container**: Apply only structural/layout styles
- **Block wrapper**: Apply positioning and spacing
- **Block content**: Apply content-specific styling

```css
/* Block container - DO NOT style directly */
.your-block-name-container {
  /* Only structural styles if needed */
}

/* Block wrapper - Apply positioning and spacing */
.your-block-name-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Block content - Apply content styling */
.your-block-name {
  /* Content-specific styles */
}
```

## CSS Selector Block Isolation

### Principle
AEM blocks operate collaboratively in the same DOM/CSSOM. Write CSS selectors that isolate your styles from impacting elements outside your block.

### Implementation
Make sure every CSS selector in a block's .css file only applies to that block:

```css
/* ✅ CORRECT - Isolated selectors */
.teaser .teaser-image {
  /* Only affects .teaser-image inside .teaser */
}

.teaser .teaser-content .teaser-title {
  /* Specific to teaser block content */
}

/* ❌ INCORRECT - Global selectors */
.image {
  /* Affects ALL .image elements site-wide */
}

.content .title {
  /* Affects title elements in ANY content container */
}
```

## Cascade in CSS

### CSS Class Naming Strategy
- **Public classes**: Not prefixed (can be used across blocks)
- **Private classes**: Prefixed with block name (block-specific)

```css
/* Public classes - available across blocks */
.btn {
  /* Button styles used by multiple blocks */
}

.text-center {
  /* Utility class for centering text */
}

/* Private classes - specific to this block */
.teaser-overlay {
  /* Only used within teaser blocks */
}

.teaser-background {
  /* Block-specific background styling */
}
```

### CSS Variables Strategy
- **Global variables**: No prefix (available site-wide)
- **Block variables**: Prefixed with block name

```css
/* Global variables in styles.css */
:root {
  --color-primary: #0078d4;
  --spacing-m: 1rem;
}

/* Block-specific variables */
.teaser {
  --teaser-transition-duration: 0.3s;
  --teaser-overlay-opacity: 0.8;
}
```

## CSS Indentation and Property Order

### Property Organization
Group related properties logically:

```css
.element {
  /* Positioning */
  position: relative;
  top: 0;
  left: 0;

  /* Box model */
  width: 100%;
  height: auto;
  margin: 1rem;
  padding: 1rem;

  /* Typography */
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;

  /* Colors */
  color: #333;
  background-color: #fff;

  /* Borders and shadows */
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  /* Other */
  cursor: pointer;
  transition: all 0.3s ease;
}
```

### Indentation Consistency
- Use consistent indentation (2 spaces or 4 spaces)
- Don't change existing indentation in functional PRs
- Only modify indentation when doing dedicated CSS refactoring

## CSS Selectors Complexity

### Keep Selectors Simple
Avoid complex selectors that are hard to read and maintain:

```css
/* ✅ SIMPLE - Easy to understand and maintain */
.teaser-image {
  /* styles */
}

.teaser-content .teaser-title {
  /* styles */
}

/* ❌ COMPLEX - Hard to read and brittle */
.teaser > div:first-child > picture > img[src*="hero"] {
  /* styles */
}

.teaser:not(.dark-theme) .content > h2:first-of-type + p {
  /* styles */
}
```

### When to Add CSS Classes
Instead of complex selectors, add semantic classes via JavaScript:

```javascript
// In your-block-name.js
export default function decorate(block) {
  // Add semantic classes for simpler CSS
  block.querySelector('img')?.classList.add('your-block-name-image');
  block.querySelector('h1, h2, h3')?.classList.add('your-block-name-title');
  block.querySelector('p')?.classList.add('your-block-name-text');
}
```

## CSS Naming Conventions

### Block-Specific Naming
- Use the block name as prefix for all block-specific classes
- Use kebab-case for multi-word class names
- Keep names intuitive and descriptive

```css
/* Good examples */
.hero-banner {
  /* Clear and descriptive */
}

.product-card-image {
  /* Specific and readable */
}

.testimonial-quote {
  /* Semantic and intuitive */
}

/* Avoid */
.heroBanner {
  /* camelCase - inconsistent with CSS conventions */
}

.pcimg {
  /* Abbreviations - unclear meaning */
}

.tq {
  /* Too abbreviated - not descriptive */
}
```

### Avoid Unnecessary Namespacing
Don't add redundant prefixes unless necessary:

```css
/* ✅ GOOD - Simple and clear */
.card-title {
  /* Within card block context */
}

.hero-background {
  /* Within hero block context */
}

/* ❌ AVOID - Redundant namespacing */
.card-card-title {
  /* Card prefix is unnecessary */
}

.hero-hero-background {
  /* Hero prefix is redundant */
}
```

## Leverage ARIA Attributes for Styling

### ARIA Attributes for State-Based Styling
Use ARIA attributes instead of custom classes for well-defined states:

```css
/* ✅ GOOD - Uses semantic ARIA attributes */
[aria-expanded="true"] .accordion-content {
  display: block;
}

[aria-hidden="true"] {
  display: none;
}

/* ❌ AVOID - Custom classes with unknown semantics */
.expanded .accordion-content {
  display: block;
}

.hidden-custom {
  display: none;
}
```

### Common ARIA Attributes for Styling
```css
/* Expansion state */
[aria-expanded="true"] { /* Expanded styles */ }
[aria-expanded="false"] { /* Collapsed styles */ }

/* Visibility */
[aria-hidden="true"] { /* Hidden styles */ }
[aria-hidden="false"] { /* Visible styles */ }

/* Selection state */
[aria-selected="true"] { /* Selected styles */ }

/* Required state */
[aria-required="true"] { /* Required field styles */ }
```

## Mobile-First Responsive Design

### Mobile-First Principle
Write CSS for mobile devices first, then enhance for larger screens:

```css
/* ===== MOBILE STYLES (DEFAULT) ===== */
.teaser {
  padding: 1rem;
  font-size: 1rem;
}

.teaser-image {
  width: 100%;
  height: 200px;
}

/* ===== TABLET STYLES ===== */
@media (width >= 600px) {
  .teaser {
    padding: 1.5rem;
  }

  .teaser-image {
    height: 300px;
  }
}

/* ===== DESKTOP STYLES ===== */
@media (width >= 900px) {
  .teaser {
    padding: 2rem;
    display: flex;
    gap: 2rem;
  }

  .teaser-image {
    flex: 1;
    height: 400px;
  }

  .teaser-content {
    flex: 1;
  }
}

/* ===== LARGE DESKTOP STYLES ===== */
@media (width >= 1200px) {
  .teaser {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Standard Breakpoints
Use these consistent breakpoints across all blocks:

```css
/* Mobile: Default (no media query) */
/* Max width: ~599px */

/* Tablet */
@media (width >= 600px) {
  /* Min width: 600px */
}

/* Desktop */
@media (width >= 900px) {
  /* Min width: 900px */
}

/* Large Desktop */
@media (width >= 1200px) {
  /* Min width: 1200px */
}
```

### Avoid Mixing Breakpoint Types
Don't mix min-width and max-width in the same stylesheet:

```css
/* ✅ CONSISTENT - All width >= */
@media (width >= 600px) { /* Tablet */ }
@media (width >= 900px) { /* Desktop */ }

/* ❌ INCONSISTENT - Mixed approaches */
@media (width >= 600px) { /* Tablet */ }
@media (max-width: 899px) { /* Desktop (wrong approach) */ }
```

## Accessibility and WCAG 2.2 Compliance

### CRITICAL: WCAG 2.2 and Accessibility Requirements
**ALL CSS must comply with WCAG 2.2 guidelines and accessibility best practices. This is mandatory and non-negotiable.**

#### Color and Contrast
- **Minimum contrast ratios**:
  - Normal text: 4.5:1 minimum
  - Large text (18pt+ or 14pt+ bold): 3:1 minimum
  - Interactive elements: 3:1 minimum (focus states)
- **Color independence**: Don't rely solely on color to convey information
- **Test with tools**: Use contrast checkers and color blindness simulators

#### Focus Management
- **Visible focus indicators**: All interactive elements must have visible focus states
- **Focus order**: Logical tab order that matches visual layout
- **Focus trapping**: Modal dialogs must trap focus appropriately

#### Motion and Animation
- **Respect user preferences**: Honor `prefers-reduced-motion` setting
- **No vestibular triggers**: Avoid animations that could cause dizziness
- **Smooth transitions**: Use `transition` instead of abrupt changes

#### Touch Targets
- **Minimum size**: 44px × 44px for touch targets (WCAG 2.2 requirement)
- **Spacing**: Adequate spacing between interactive elements
- **Hover states**: Provide hover states on devices that support hover

#### Text and Typography
- **Readable fonts**: Use system fonts or well-tested web fonts
- **Line height**: Minimum 1.5 for body text, 1.2 for headings
- **Text spacing**: Support user-defined text spacing preferences

#### Media Queries and Responsive Design
- **Zoom support**: Ensure 200% zoom doesn't break layout (WCAG 2.2 requirement)
- **Orientation**: Support both portrait and landscape orientations
- **Reflow**: Content must reflow without horizontal scrolling at 320px width

### Implementation Requirements
```css
/* ✅ ACCESSIBLE FOCUS STATES */
.button:focus-visible,
.link:focus-visible {
  outline: 3px solid #0056b3;
  outline-offset: 2px;
}

/* ✅ RESPECT USER PREFERENCES */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ✅ TOUCH TARGET SIZES */
.button {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem 1.5rem;
}

/* ✅ HIGH CONTRAST SUPPORT */
@media (prefers-contrast: high) {
  .button {
    border: 2px solid;
  }
}
```

## CSS Validation and Linting

### ESLint CSS Validation
All CSS code must be valid against the ESLint CSS plugin (`@eslint/css`):

- **Install the plugin**: `npm install --save-dev @eslint/css`
- **Configure ESLint**: Add CSS file patterns to your ESLint configuration
- **Validate before committing**: Run `npx eslint "**/*.{css,scss}"` to check CSS files
- **Fix linting errors**: Address all ESLint CSS violations before merging

### Common ESLint CSS Rules to Follow
```json
{
  "extends": ["plugin:@eslint/css/recommended"],
  "rules": {
    "@eslint/css/no-duplicate-properties": "error",
    "@eslint/css/no-empty-blocks": "error",
    "@eslint/css/no-invalid-properties": "error",
    "@eslint/css/no-unknown-properties": "error",
    "@eslint/css/prefer-logical-properties": "warn"
  }
}
```

### CSS Code Quality Requirements
- **No duplicate properties** - Each property should only appear once per rule
- **No empty blocks** - Remove unused CSS rules
- **Valid properties** - Use only standard CSS properties
- **Logical properties** - Prefer `margin-block` over `margin-top/bottom` when appropriate
- **Consistent formatting** - Follow consistent indentation and spacing

## CSS Preprocessors and Frameworks

### Avoid Introducing New Dependencies
Do not introduce CSS preprocessors or frameworks without team consensus:

- **No Sass/Less** unless the entire project uses it
- **No Tailwind CSS** unless approved by the team
- **No PostCSS plugins** unless standardized across the project

### Use Modern Native CSS
Rely on modern CSS features supported by evergreen browsers:

```css
/* ✅ MODERN CSS FEATURES */
.element {
  /* CSS Grid */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));

  /* Flexbox */
  display: flex;
  gap: 1rem;

  /* Custom properties */
  --primary-color: #0078d4;
  color: var(--primary-color);

  /* Logical properties */
  margin-block: 1rem;
  padding-inline: 1rem;

  /* Container queries (if supported) */
  container-type: inline-size;
}

/* ✅ CSS FEATURES WITH FALLBACKS */
.element {
  /* Aspect ratio with fallback */
  aspect-ratio: 16 / 9;
  /* Fallback for older browsers */
  @supports not (aspect-ratio: 16 / 9) {
    padding-bottom: 56.25%; /* 16:9 aspect ratio fallback */
  }
}
```

## Browser Support Guidelines

### Evergreen Browser Support
Ensure features are supported by modern browsers:

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions

### Feature Detection and Fallbacks
Use @supports for progressive enhancement:

```css
/* Base styles (works everywhere) */
.element {
  display: block;
  width: 100%;
}

/* Enhanced styles (modern browsers only) */
@supports (display: grid) {
  .element {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@supports (container-type: inline-size) {
  .element {
    container-type: inline-size;
  }
}
```

## Block CSS Creation Workflow

### Step-by-Step Process

1. **Analyze Block Structure**
   - Review the block's HTML structure
   - Identify semantic elements
   - Plan CSS class additions in JavaScript

2. **Create Mobile-First CSS**
   - Write base styles for mobile
   - Use block-specific class names
   - Keep selectors simple

3. **Add Responsive Breakpoints**
   - Add tablet styles (width >= 600px)
   - Add desktop styles (width >= 900px)
   - Add large desktop styles (width >= 1200px)

4. **Ensure Block Isolation**
   - Verify all selectors are scoped to the block
   - Test that styles don't affect other blocks
   - Use block-specific prefixes for private classes

5. **Validate and Optimize**
   - **CRITICAL**: Test WCAG 2.2 compliance (contrast, focus, touch targets, motion)
   - Run ESLint CSS validation: `npx eslint "**/*.css"`
   - Fix any linting errors before proceeding
   - Check performance impact
   - Test across different screen sizes
   - Validate keyboard navigation and screen reader compatibility

### Example: Creating CSS for a New "Feature" Block

```css
/* blocks/feature/feature.css */

/* ===== MOBILE STYLES ===== */
.feature {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.feature-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.feature-description {
  line-height: 1.6;
  color: #666;
}

/* ===== TABLET STYLES ===== */
@media (width >= 600px) {
  .feature {
    padding: 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .feature-icon {
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    margin-bottom: 0;
  }

  .feature-content {
    flex: 1;
  }
}

/* ===== DESKTOP STYLES ===== */
@media (width >= 900px) {
  .feature {
    padding: 2rem;
    gap: 1.5rem;
  }

  .feature-icon {
    width: 80px;
    height: 80px;
  }

  .feature-title {
    font-size: 1.5rem;
  }
}
```

## Common Patterns and Best Practices

### Layout Patterns
```css
/* Flexbox layout pattern */
.block-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (width >= 900px) {
  .block-wrapper {
    flex-direction: row;
  }
}

/* Grid layout pattern */
.block-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (width >= 600px) {
  .block-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (width >= 900px) {
  .block-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Typography Patterns
```css
/* Heading hierarchy */
.block-title-xl {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
}

.block-title-l {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.3;
}

.block-title-m {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
}

/* Text styles */
.block-text-lead {
  font-size: 1.125rem;
  line-height: 1.6;
}

.block-text-body {
  font-size: 1rem;
  line-height: 1.6;
}

.block-text-caption {
  font-size: 0.875rem;
  line-height: 1.5;
  color: #666;
}
```

### Interactive States
```css
/* Button patterns */
.block-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #0078d4;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.block-button:hover {
  background: #0056b3;
}

.block-button:focus {
  outline: 2px solid #0078d4;
  outline-offset: 2px;
}

/* Link patterns */
.block-link {
  color: #0078d4;
  text-decoration: none;
  transition: color 0.3s ease;
}

.block-link:hover {
  color: #0056b3;
  text-decoration: underline;
}
```

## Summary

Follow these guidelines when creating CSS for new EDS blocks:

1. **⚠️ WCAG 2.2 Compliance** - All CSS must meet WCAG 2.2 accessibility standards (MANDATORY)
2. **Validate with ESLint CSS** - Ensure all CSS passes `@eslint/css` validation
3. **Use block-specific naming** - Prefix all classes with the block name
4. **Keep selectors simple** - Avoid complex selectors and CSS nesting
5. **Mobile-first approach** - Write mobile styles first, enhance for larger screens
6. **Use standard breakpoints** - 600px, 900px, 1200px (all width >=)
7. **Isolate block styles** - Ensure CSS only affects elements within the block
8. **Leverage ARIA attributes** - Use semantic attributes for state-based styling
9. **Avoid @important** - Let the cascade work naturally
10. **Use modern CSS** - Rely on native CSS features with fallbacks
11. **Maintain consistency** - Follow existing indentation and property order
12. **Test thoroughly** - Validate across devices and ensure no conflicts

This approach ensures maintainable, performant, and scalable CSS that works well within the EDS ecosystem.