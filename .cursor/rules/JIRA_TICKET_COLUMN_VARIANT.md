# JIRA Ticket: New Column Block Variant - Image Text Split

## 📋 Ticket Summary
**Title:** Implement "Image Text Split" variant for Column block component  
**Type:** Story  
**Priority:** Medium  
**Story Points:** 5  
**Component:** Frontend/Components  

## 🎯 Description
Implement a new column block variant called "Image Text Split" based on Figma design specifications. This variant creates a two-column layout with a large image on the left and text content on the right, featuring specific typography, spacing, and responsive behavior.

## 📐 Design Specifications
- **Layout:** Two-column horizontal layout (desktop), stacked vertical (mobile)
- **Image Column:** Fixed width 572px × 408px height
- **Text Column:** Flexible width, max 437px
- **Gap:** 67px between columns
- **Typography:** 
  - Headings: #0063be (blue), Interstate font, 34px/34px line-height
  - Body text: #000000 (black), Interstate font, 14px/20px line-height
- **Bottom Separator:** Horizontal line spanning full width
- **Padding:** 80px top, 140px sides, 60px bottom

## ✅ Acceptance Criteria

### Functional Requirements
- [ ] New "Image Text Split" option appears in column variant dropdown
- [ ] Variant creates two-column layout with image on left, text on right
- [ ] Image column maintains 572px × 408px aspect ratio
- [ ] Text column respects 437px maximum width
- [ ] Bottom separator line displays correctly
- [ ] Responsive behavior: stacks vertically on mobile (< 900px)
- [ ] Typography matches design specifications exactly

### Technical Requirements
- [ ] Code follows project linting standards (no errors)
- [ ] CSS uses modern color function notation
- [ ] Responsive design uses proper media queries
- [ ] JavaScript handles variant-specific styling
- [ ] No external dependencies added

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Implementation Details

### Files Modified
1. **`blocks/columns/_columns.json`**
   - Added "Image Text Split" option to variant dropdown
   - Value: `image-text-split`

2. **`blocks/columns/columns.css`**
   - Added `.columns.variant-image-text-split` styles
   - Implemented responsive design with mobile breakpoint
   - Added typography specifications for headings and paragraphs
   - Included bottom separator styling

3. **`blocks/columns/columns.js`**
   - Enhanced to handle image-text-split variant
   - Added specific class assignments for styling
   - Ensured proper image column detection

### CSS Classes Added
```css
.columns.variant-image-text-split
.columns.variant-image-text-split > div
.columns.variant-image-text-split > div > div:first-child
.columns.variant-image-text-split > div > div:last-child
.columns.variant-image-text-split h1-h6
.columns.variant-image-text-split p
```

### Responsive Breakpoints
- **Desktop:** ≥ 900px (horizontal layout)
- **Mobile:** < 900px (vertical stack)

## 🧪 Testing Scenarios

### Test Case 1: Basic Functionality
1. Add Columns block to page
2. Select "Image Text Split" variant
3. Add image to first column, text to second column
4. **Expected:** Two-column layout displays correctly

### Test Case 2: Typography
1. Add heading and paragraph to text column
2. **Expected:** 
   - Heading: Blue color (#0063be), 34px Interstate font
   - Paragraph: Black color (#000), 14px Interstate font

### Test Case 3: Responsive Design
1. View on desktop (≥ 900px)
2. Resize to mobile (< 900px)
3. **Expected:** Layout stacks vertically on mobile

### Test Case 4: Image Handling
1. Add various image sizes to first column
2. **Expected:** Images maintain aspect ratio and fill container

## 📱 Mobile Specifications
- **Padding:** 40px top, 20px sides, 30px bottom
- **Layout:** Vertical stack with 32px gap
- **Image:** Full width, 250px height
- **Typography:** Heading reduced to 28px/32px line-height

## 🎨 Design Tokens Used
```css
/* Colors */
--primary-blue: #0063be
--text-black: #000000
--border-gray: #e5e7eb

/* Typography */
--font-family: Interstate, sans-serif
--heading-weight: 275
--body-weight: 400

/* Spacing */
--column-gap: 67px
--mobile-gap: 32px
--section-padding: 80px 140px 60px
--mobile-padding: 40px 20px 30px
```

## 🔍 Code Quality Checklist
- [x] CSS follows stylelint rules
- [x] No linting errors
- [x] Modern CSS syntax used
- [x] Proper specificity management
- [x] Responsive design implemented
- [x] Accessibility considerations included

## 📋 Definition of Done
- [ ] Feature implemented according to specifications
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] No linting errors
- [ ] Tested in Universal Editor
- [ ] Tested across target browsers
- [ ] Documentation updated
- [ ] Ready for production deployment

## 🚀 Deployment Notes
- No database changes required
- No configuration changes needed
- Feature available immediately after deployment
- Backward compatible with existing column blocks

## 📞 Stakeholders
- **Product Owner:** [Name]
- **Designer:** [Name] 
- **Developer:** [Name]
- **QA:** [Name]

## 🔗 Related Tickets
- [Link to design ticket]
- [Link to related frontend tickets]

## 📝 Notes
- Design based on Figma specifications
- Uses existing column block infrastructure
- No breaking changes to current functionality
- Follows project coding standards and patterns

---
**Created:** [Date]  
**Last Updated:** [Date]  
**Status:** Ready for Development
