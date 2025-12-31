# Responsive Design Documentation

## Phase 4: Responsive Layout System

This document describes the responsive design implementation for the DSA Visualizer.

---

## Breakpoints

| Breakpoint | Width | Description |
|------------|-------|-------------|
| Desktop | > 1200px | Full 3-column layout |
| Tablet | 768px - 1200px | Collapsible sidebars |
| Mobile | < 768px | Overlay sidebars |

---

## Desktop Layout (> 1200px)

```
┌─────────────────────────────────────────────────────────────┐
│                        Header (48px)                        │
├───────────┬─────────────────────────────────┬───────────────┤
│           │                                 │               │
│  Left     │        Canvas Area              │    Right      │
│  Sidebar  │        (Flexible)               │    Sidebar    │
│  (288px)  │                                 │    (320px)    │
│           │                                 │               │
├───────────┴─────────────────────────────────┴───────────────┤
│                     Terminal (256px)                        │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Both sidebars visible by default
- Canvas area takes remaining space
- All elements fully visible
- Keyboard shortcuts displayed

---

## Tablet Layout (768px - 1200px)

```
┌─────────────────────────────────────────────┐
│              Header (48px)                  │
├─────────────────────────────────────────────┤
│                                             │
│             Canvas Area                     │
│             (Full Width)                    │
│                                             │
├─────────────────────────────────────────────┤
│              Terminal (256px)               │
└─────────────────────────────────────────────┘

[Overlay: Left Sidebar when toggled]
[Overlay: Right Sidebar when toggled]
```

**Features:**
- Sidebars hidden by default
- Toggle buttons in header
- Sidebars appear as overlays
- Dark backdrop when sidebar open
- Canvas takes full width

---

## Mobile Layout (< 768px)

```
┌───────────────────────────────┐
│      Header (48px)            │
├───────────────────────────────┤
│                               │
│        Canvas Area            │
│        (Full Width)           │
│                               │
├───────────────────────────────┤
│       Terminal (256px)        │
└───────────────────────────────┘

[Full-screen overlay: Sidebar when toggled]
```

**Features:**
- Compact header with hamburger menu
- Full-screen sidebar overlays
- Touch-friendly controls
- Simplified breadcrumbs
- Larger touch targets

---

## CSS Implementation

### Grid Layout

```css
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.content-area {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar-left {
  width: 288px;
  flex-shrink: 0;
  transition: transform 0.3s ease-out;
}

.canvas-area {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.sidebar-right {
  width: 320px;
  flex-shrink: 0;
  transition: transform 0.3s ease-out;
}

.terminal {
  height: 256px;
  flex-shrink: 0;
}
```

### Media Queries

```css
/* Tablet */
@media (max-width: 1200px) {
  .sidebar-left,
  .sidebar-right {
    position: fixed;
    z-index: 50;
    height: calc(100vh - 48px - 256px);
  }
  
  .sidebar-left {
    left: 0;
    transform: translateX(-100%);
  }
  
  .sidebar-right {
    right: 0;
    transform: translateX(100%);
  }
  
  .sidebar-left.open {
    transform: translateX(0);
  }
  
  .sidebar-right.open {
    transform: translateX(0);
  }
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar-left,
  .sidebar-right {
    width: 100%;
    max-width: 320px;
  }
  
  .header-breadcrumb {
    display: none;
  }
  
  .header-shortcuts {
    display: none;
  }
}
```

---

## Animation Classes

### Sidebar Animations

```css
/* Slide in from left */
@keyframes slideInLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Slide in from right */
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.sidebar-enter-left {
  animation: slideInLeft 0.3s ease-out;
}

.sidebar-enter-right {
  animation: slideInRight 0.3s ease-out;
}
```

### Overlay Backdrop

```css
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
  backdrop-filter: blur(4px);
}
```

---

## Touch Targets

For mobile accessibility, all interactive elements have:
- Minimum touch target: 44x44px
- Adequate spacing between targets
- Clear visual feedback on touch

```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: 12px;
}

.touch-target:active {
  transform: scale(0.95);
  opacity: 0.9;
}
```

---

## Keyboard Shortcuts

| Shortcut | Action | Available |
|----------|--------|-----------|
| Ctrl+F | Focus search | All |
| Ctrl+B | Toggle left sidebar | All |
| Ctrl+Shift+B | Toggle right sidebar | All |
| Escape | Close search/sidebar | All |
| Arrow Up/Down | Navigate tree | Desktop/Tablet |
| Arrow Left/Right | Collapse/Expand | Desktop/Tablet |
| Enter | Select item | All |

---

## Testing Checklist

- [ ] Desktop: All 3 columns visible
- [ ] Desktop: Sidebars can be hidden with shortcuts
- [ ] Tablet: Sidebars hidden by default
- [ ] Tablet: Toggle buttons work correctly
- [ ] Tablet: Overlay appears when sidebar opens
- [ ] Mobile: Full-width canvas
- [ ] Mobile: Hamburger menu functional
- [ ] Mobile: Touch targets adequate
- [ ] Mobile: No horizontal scroll
- [ ] All: Smooth animations
- [ ] All: No layout shifts
