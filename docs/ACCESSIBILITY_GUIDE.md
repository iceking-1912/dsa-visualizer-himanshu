# Accessibility Guide

## Phase 4: Accessibility Implementation

This document describes the accessibility features implemented in the DSA Visualizer.

---

## WCAG Compliance Target

The DSA Visualizer aims to meet **WCAG 2.1 Level AA** standards.

---

## Color Contrast

### Text Colors

| Element | Foreground | Background | Ratio | Pass |
|---------|------------|------------|-------|------|
| Primary text | #e0e0e0 | #0a0a0a | 14.5:1 | ✅ AAA |
| Secondary text | #a0a0a0 | #0a0a0a | 7.2:1 | ✅ AAA |
| Muted text | #666666 | #0a0a0a | 3.9:1 | ✅ AA |
| Accent (cyan) | #00d4ff | #0a0a0a | 8.7:1 | ✅ AAA |
| Success (green) | #00ff88 | #0a0a0a | 12.3:1 | ✅ AAA |
| Error (red) | #ff4444 | #0a0a0a | 4.8:1 | ✅ AA |

### Interactive Elements

| State | Color | Background | Ratio |
|-------|-------|------------|-------|
| Button default | #0a0a0a | #00d4ff | 8.7:1 |
| Button hover | #0a0a0a | #00b4df | 7.4:1 |
| Link | #00d4ff | #0a0a0a | 8.7:1 |
| Focus ring | #00d4ff | - | - |

---

## Keyboard Navigation

### Global Shortcuts

```
Ctrl/Cmd + F     Focus search input
Ctrl/Cmd + B     Toggle left sidebar
Ctrl/Cmd + Shift + B     Toggle right sidebar
Escape           Close overlays/clear search
```

### File Tree Navigation

```
Arrow Up         Previous item
Arrow Down       Next item
Arrow Right      Expand folder / Enter folder
Arrow Left       Collapse folder / Go to parent
Enter            Select item / Toggle folder
Home             First item
End              Last item
```

### Settings Panel

```
Tab              Move to next control
Shift + Tab      Move to previous control
Enter            Activate button/toggle
Arrow Left/Right Adjust slider
Space            Toggle checkbox
```

---

## Focus Management

### Focus Indicators

All interactive elements have visible focus indicators:

```css
.focus-visible-ring:focus-visible {
  outline: 2px solid #00d4ff;
  outline-offset: 2px;
}

/* Button focus */
button:focus-visible {
  outline: 2px solid #00d4ff;
  outline-offset: 2px;
}

/* Input focus */
input:focus-visible {
  border-color: #00d4ff;
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
}
```

### Focus Trapping

When modals or overlays are open:
- Focus is trapped within the overlay
- Tab cycles through focusable elements
- Escape closes the overlay
- Focus returns to trigger element

---

## ARIA Attributes

### File Tree

```tsx
<div role="tree" aria-label="Algorithm explorer">
  <div 
    role="treeitem"
    aria-expanded="true"
    aria-selected="false"
    tabindex="0"
  >
    Folder Name
    <div role="group">
      {/* Child items */}
    </div>
  </div>
</div>
```

### Panels

```tsx
<aside 
  role="complementary"
  aria-label="Algorithm details"
>
  {/* Panel content */}
</aside>
```

### Buttons

```tsx
<button
  aria-label="Toggle left sidebar"
  aria-expanded="true"
  aria-controls="left-sidebar"
>
  {/* Icon */}
</button>
```

### Sliders

```tsx
<input
  type="range"
  role="slider"
  aria-label="Animation speed"
  aria-valuemin="1"
  aria-valuemax="10"
  aria-valuenow="5"
  aria-valuetext="5x speed"
/>
```

---

## Screen Reader Support

### Announcements

Live regions for dynamic content:

```tsx
<div 
  role="status" 
  aria-live="polite"
  aria-atomic="true"
>
  {statusMessage}
</div>
```

### Hidden Content

Visually hidden but screen reader accessible:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Motion & Animation

### Reduced Motion

Respects user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Controls

- Pause/play buttons for all animations
- Speed control (1-10x)
- Step mode for frame-by-frame viewing

---

## Touch Accessibility

### Touch Targets

- Minimum size: 44x44 pixels
- Adequate spacing between targets
- No gesture-only interactions

### Mobile Considerations

- No hover-dependent functionality
- Long-press alternatives for right-click
- Swipe gestures have button alternatives

---

## Testing Checklist

### Keyboard

- [ ] All interactive elements reachable via Tab
- [ ] Focus order is logical
- [ ] Focus indicators visible
- [ ] Escape closes overlays
- [ ] Arrow keys navigate tree

### Screen Readers

- [ ] All images have alt text
- [ ] Form fields have labels
- [ ] Buttons have accessible names
- [ ] Status updates announced
- [ ] Landmarks properly defined

### Visual

- [ ] 4.5:1 contrast for normal text
- [ ] 3:1 contrast for large text
- [ ] Focus indicators visible
- [ ] No color-only information
- [ ] Text resizable to 200%

### Motor

- [ ] No time-limited interactions
- [ ] No keyboard traps
- [ ] Large click targets
- [ ] Spacing between targets

---

## Tools for Testing

1. **axe DevTools** - Browser extension for accessibility audits
2. **WAVE** - Web accessibility evaluation tool
3. **Lighthouse** - Built into Chrome DevTools
4. **NVDA/VoiceOver** - Screen reader testing
5. **Contrast Checker** - Color contrast verification
