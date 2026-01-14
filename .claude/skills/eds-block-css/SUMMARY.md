# EDS Block CSS Guidelines - Quick Reference

## ⚠️ CRITICAL: Accessibility & WCAG 2.2 Compliance

**MANDATORY REQUIREMENT**: All CSS must comply with WCAG 2.2 guidelines and accessibility best practices. This is non-negotiable.

### Accessibility Essentials
- **Color contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus indicators**: All interactive elements must have visible focus states (3px solid outline minimum)
- **Touch targets**: Minimum 44px × 44px for all interactive elements
- **Motion respect**: Honor `prefers-reduced-motion` settings
- **Zoom support**: Layout must work at 200% zoom without horizontal scrolling

### Before Committing
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Verify color contrast ratios
- [ ] Check keyboard navigation
- [ ] Test with prefers-reduced-motion enabled
- [ ] Validate touch target sizes

## Core Rules for Creating Block CSS

When creating or refactoring CSS for EDS blocks, follow these essential guidelines:

### ✅ DO:
- **Mobile-first approach**: Write mobile styles first (default), then enhance with `@media (width >= 768px)` and `@media (width >= 1024px)`
- **Block-specific naming**: Use `.blockname-element` format (e.g., `.teaser-image`, `.teaser-content`)
- **Simple selectors**: Keep CSS selectors simple and readable
- **Validate with ESLint**: Run `npx eslint "**/*.css"` before committing - all CSS must pass validation
- **Isolate styles**: Ensure CSS only affects elements within your block
- **WCAG 2.2 compliant**: Meet all accessibility requirements

### ❌ DON'T:
- **No `!important`**: Never use `!important` - let the cascade work naturally
- **No `.block` class**: Don't use generic `.block` class - use block-specific naming only
- **No complex selectors**: Avoid deeply nested or complex selectors - add semantic classes via JavaScript instead
- **No max-width queries**: Use `@media (width >= Xpx)` format, not `@media (width <= Xpx)`
- **No accessibility violations**: Never compromise on WCAG 2.2 compliance

### Media Query Format
Always use this format:
```css
/* Mobile: Default (no media query) */
.element { /* mobile styles */ }

/* Tablet */
@media (width >= 768px) { /* tablet styles */ }

/* Desktop */
@media (width >= 1024px) { /* desktop styles */ }
```

### Standard Breakpoints
- Mobile: Default (no media query)
- Tablet: `@media (width >= 768px)`
- Desktop: `@media (width >= 1024px)`

### Before Committing
1. ✅ **CRITICAL**: Test WCAG 2.2 compliance (contrast, focus, touch targets, motion)
2. ✅ Run ESLint CSS validation: `npx eslint "**/*.css"`
3. ✅ Fix all linting errors
4. ✅ Test on mobile, tablet, and desktop
5. ✅ Verify no style conflicts with other blocks
6. ✅ Validate keyboard navigation and screen reader compatibility

### Quick Checklist
- [ ] **WCAG 2.2 compliant** - Accessibility requirements met
- [ ] Mobile-first CSS structure
- [ ] Block-specific class names (no `.block`)
- [ ] Media queries use `width >=` format
- [ ] No `!important` declarations
- [ ] ESLint CSS validation passes
- [ ] Simple, readable selectors
- [ ] Styles isolated to block only
- [ ] Focus indicators on all interactive elements
- [ ] Touch targets minimum 44px × 44px
- [ ] Respects prefers-reduced-motion

**Full documentation**: See `.claude/skills/eds-block-css/SKILL.md` for complete guidelines.