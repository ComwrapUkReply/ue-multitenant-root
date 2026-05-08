# WCAG 2.2 Checklist for EDS Blocks

This checklist focuses on what **blocks** can reasonably control. Page-level issues (e.g. single `<h1>`, global landmarks) are typically handled by templates.

For each block you touch, scan this list and address what applies.

## 1. Perceivable (1.x)

### 1.1 Text Alternatives

- All **informational** images inside the block have meaningful `alt` text.
- Decorative images use empty `alt=""` or `role="presentation"` and are not announced.

### 1.3 Adaptable (Structure)

- Headings (`<h1>`–`<h6>`) reflect the logical structure of the content.
- Lists (`<ul>`, `<ol>`) are used for actual lists of related items.
- Tables are only used for tabular data, not layout.
- Landmarks (if used inside the block) are appropriate and not duplicated unnecessarily.

### 1.4 Distinguishable (Contrast and Visual Presentation)

- Text has sufficient contrast against its background:
  - Normal text: 4.5:1
  - Large text: 3:1
- Blocks do not hardcode colours that break contrast; they rely on theme tokens that have been contrast-audited.
- Text is not conveyed by colour alone; states have multiple indicators (e.g. icons, underlines, shapes).

## 2. Operable (2.x)

### 2.1 Keyboard Accessible

- All interactive elements (buttons, links, controls) are reachable by keyboard (Tab / Shift+Tab).
- No custom element swallows focus without a good reason.
- Keyboard-only users can perform all the same actions as pointer users.

### 2.2 Enough Time

- Timed behaviours (e.g. auto-advancing carousel) provide controls to pause/stop or are slow and subtle enough not to harm usability.
- For most simple informational blocks, this is N/A.

### 2.3 Seizures and Physical Reactions

- No flashing content (3+ flashes per second) is introduced in a block.

### 2.4 Navigable

- Within the block, focus order follows the visual and logical order.
- Focus is not unexpectedly trapped inside the block.
- Any headings and labels accurately describe the content or purpose.

### 2.5 Input Modalities

- Pointer targets are at least 24×24 CSS pixels (for interactive controls the block defines).
- Drag-and-drop interactions (if any) have an alternative that does not require dragging.

## 3. Understandable (3.x)

### 3.1 Readable

- Language of page is set at template level; blocks do not conflict with it.
- If a block contains a long passage of text in another language, `lang` can be added at container level.

### 3.2 Predictable

- Interactive elements behave consistently: links navigate, buttons perform actions.
- Focus is not moved programmatically without a clear reason (e.g. focus management for modals).

### 3.3 Input Assistance

- If the block includes forms, fields have labels, hints, and clear error messaging.
- Error states are indicated both visually and programmatically (e.g. via `aria-invalid`, `role="alert"` or similar patterns).

## 4. Robust (4.x)

### 4.1 Compatible

- DOM structure is valid HTML; no invalid nesting (e.g. `<p><div>…</div></p>`).
- ARIA attributes, if used, follow the specification (no unknown roles or states).
- Custom widgets still expose semantics that assistive technologies can understand (e.g. `role="tablist"`, `role="tab"`, `role="tabpanel"` for tabs).

## 5. WCAG 2.2 Additions (Highlights)

### 2.4.11 Focus Appearance (Minimum)

- Focused elements have a visible outline or equivalent change that is:
  - At least 2 CSS pixels around the perimeter, or
  - Equivalent area and highly contrasting (3:1) with both the unfocused state and the background.

### 2.4.12 Focus Not Obscured (Minimum)

- In scrollable containers, focused elements are not fully hidden behind sticky headers/footers introduced by the block.

### 2.5.7 Dragging Movements

- Any dragging interaction introduced by a block (e.g. slider) has a non-drag alternative (e.g. buttons).

### 2.5.8 Target Size (Minimum)

- Pointer targets that the block defines are at least 24×24 CSS pixels, or fall under allowed exceptions (e.g. inline text links).

### 3.2.6 Consistent Help

- If the block provides help or support entry points, their placement is consistent across occurrences of the block on a site.

### 3.3.7 Redundant Entry

- If the block collects information already provided elsewhere on the page or in the user journey, it avoids forcing users to re-enter it without good reason.

### 3.3.8 Accessible Authentication

- If the block participates in authentication flows (rare for content blocks), it does not rely solely on cognitive tests like puzzles or remembering passwords without offering alternatives.

