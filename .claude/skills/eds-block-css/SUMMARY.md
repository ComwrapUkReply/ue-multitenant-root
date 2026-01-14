# EDS Block CSS Guidelines - Quick Reference

## Core Rules for Creating Block CSS

When creating or refactoring CSS for EDS blocks, follow these essential guidelines:

### ✅ DO:
- **Mobile-first approach**: Write mobile styles first (default), then enhance with `@media (width >= 768px)` and `@media (width >= 1024px)`
- **Block-specific naming**: Use `.blockname-element` format (e.g., `.teaser-image`, `.teaser-content`)
- **Simple selectors**: Keep CSS selectors simple and readable
- **Validate with ESLint**: Run `npx eslint "**/*.css"` before committing - all CSS must pass validation
- **Isolate styles**: Ensure CSS only affects elements within your block

### ❌ DON'T:
- **No `!important`**: Never use `!important` - let the cascade work naturally
- **No `.block` class**: Don't use generic `.block` class - use block-specific naming only
- **No complex selectors**: Avoid deeply nested or complex selectors - add semantic classes via JavaScript instead
- **No max-width queries**: Use `@media (width >= Xpx)` format, not `@media (width <= Xpx)`

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
1. ✅ Run ESLint CSS validation: `npx eslint "**/*.css"`
2. ✅ Fix all linting errors
3. ✅ Test on mobile, tablet, and desktop
4. ✅ Verify no style conflicts with other blocks

### Quick Checklist
- [ ] Mobile-first CSS structure
- [ ] Block-specific class names (no `.block`)
- [ ] Media queries use `width >=` format
- [ ] No `!important` declarations
- [ ] ESLint CSS validation passes
- [ ] Simple, readable selectors
- [ ] Styles isolated to block only

**Full documentation**: See `.claude/skills/eds-block-css/SKILL.md` for complete guidelines.
