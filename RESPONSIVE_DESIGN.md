# Responsive Design Guidelines

**Design System:** Glassmorphism + Apple-inspired Light/Dark Themes
**Source of Truth:** `client/src/styles/design-tokens.css`

---

## Purpose

This document defines responsive behavior for the entire application. Every component, page, animation, modal, card, and navigation element must follow these rules.

- One consistent design language
- Predictable layouts across all viewports
- Minimal layout shifts
- Reusable, accessible components

**All values come from `design-tokens.css`.** Never hardcode colors, spacing, radii, shadows, or typography.

---

## Responsive Philosophy

The app is **responsive first**, not desktop-first. Each breakpoint receives the layout that best fits the available space. Do not shrink desktop pages into mobile — redesign per viewport while preserving the same visual identity.

---

## Breakpoints

| Name | Range | Target | Layout |
|------|-------|--------|--------|
| **XS** | `0 – 479px` | Small phones, foldables | Single column, max readability |
| **SM** | `480 – 767px` | Modern phones | Single column, comfortable spacing |
| **MD** | `768 – 1023px` | Tablets | 2-column layouts, larger cards |
| **LG** | `1024 – 1439px` | Laptops, small desktops | Main desktop layout |
| **XL** | `1440px+` | Large monitors, ultrawide | Increased whitespace, wider grids |

### CSS Breakpoint Variable (add to tokens if needed)

```css
/* Recommended — add to design-tokens.css :root */
--bp-xs: 0px;
--bp-sm: 480px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1440px;
```

---

## Container

Use the existing `.container` class:

```css
.container {
  max-width: var(--content-max-width); /* 1200px */
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Mobile */
@media (max-width: 768px) {
  .container { padding: 0 var(--space-4); }
}
```

Never stretch content edge-to-edge on large screens.

---

## Typography Scale

Typography tokens scale automatically at `≤ 768px` (defined in `design-tokens.css`). Use `clamp()` for fluid sizes where needed:

```css
/* Fluid heading example */
font-size: clamp(var(--font-size-2xl), 4vw, var(--font-size-4xl));
```

**Never reduce text below accessible sizes** (`--font-size-xs` = 0.75rem minimum).

---

## Spacing

Use spacing tokens exclusively:

```css
var(--space-1)   /* 4px  → 3px mobile */
var(--space-2)   /* 8px  → 6px mobile */
var(--space-3)   /* 12px → 10px mobile */
var(--space-4)   /* 16px → 14px mobile */
var(--space-6)   /* 24px → 20px mobile */
var(--space-8)   /* 32px → 24px mobile */
var(--space-10)  /* 40px → 32px mobile */
var(--space-16)  /* 64px → 48px mobile */
var(--space-20)  /* 80px → 64px mobile */
```

Mobile spacing tokens are already defined at `≤ 768px` in `design-tokens.css`.

---

## Layout Rules

| Viewport | Columns | Sidebar | Navigation |
|----------|---------|---------|------------|
| XL/LG | 2–6 | Expanded | Glass navbar with full menu |
| MD | 2 | Collapsed or hidden | Simplified navbar |
| SM/XS | 1 | Drawer (hamburger) | Hamburger or bottom nav |

Use CSS Grid or Flexbox. Avoid `position: absolute` unless necessary. Prefer `min-height` over fixed heights.

---

## Glassmorphism

Glass effects adapt by viewport:

| Viewport | Blur | Background | Border |
|----------|------|------------|--------|
| LG/XL | `var(--glass-blur)` 16–20px | Full opacity | Visible |
| MD | Medium | Full opacity | Visible |
| SM/XS | Reduced or none | Lighter | Subtle |

**Never remove the glass identity.** Reduce intensity on mobile for performance.

```css
/* Mobile glass adjustment */
@media (max-width: 768px) {
  .glass-card {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
}
```

---

## Navigation

- **Desktop (≥ 1024px):** Fixed glass navbar (`--navbar-height: 56px`), full brand + theme toggle
- **Tablet (768–1023px):** Same navbar, collapse secondary items
- **Mobile (< 768px):** Hamburger menu or slide-out drawer

The existing `Nav.jsx` uses scroll-triggered glassmorphism — this works across all viewports.

---

## Cards

Cards may restructure per viewport:

**Desktop:** Side-by-side content (image | text | actions)
**Tablet:** 2-column grid, same card structure
**Mobile:** Stacked vertically (image → title → description → actions)

Use existing card classes: `.glass-card`, `.card`, `.card-hover`, `.feature-card`, `.status-card`.

---

## Hero Sections

| Viewport | Layout |
|----------|--------|
| LG/XL | Illustration + Content side by side |
| MD | Illustration above, Content below |
| SM/XS | Content first, Illustration below, CTA centered |

The home page hero already follows this pattern with `flex-direction: column` on mobile.

---

## Buttons

Use existing button classes. They scale automatically:

```css
.btn--sm  /* 32px height */
.btn--md  /* 40px height */
.btn--lg  /* 48px height */
```

On mobile, full-width buttons when they are primary actions:

```css
@media (max-width: 479px) {
  .btn--mobile-full { width: 100%; }
}
```

**Touch target minimum:** 44 × 44px (use `--button-lg` = 48px for mobile primary actions).

---

## Images

- Use `object-fit: cover` or `contain` as needed
- Lazy load off-screen images
- Scale illustrations down on smaller viewports
- Replace complex illustrations with simplified versions or icons on mobile

```css
.hero-illustration {
  width: 100%;
  max-width: 400px;
  height: auto;
}

@media (max-width: 768px) {
  .hero-illustration { max-width: 240px; }
}
```

---

## Modals

| Viewport | Behavior |
|----------|----------|
| LG/XL | Centered modal, max-width constrained |
| MD | Slightly smaller modal |
| SM/XS | Bottom sheet or full-screen modal |

---

## Animations

Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- **Desktop:** Full motion, all effects enabled
- **Tablet:** Medium motion, reduce particle density
- **Mobile:** Shorter animations, fewer background effects (StormClouds, ElectricityOverlay)

Use existing animation tokens: `--transition-fast` (150ms), `--transition-normal` (250ms), `--transition-slow` (400ms).

---

## Hover States

- **Desktop:** Required for interactive elements
- **Tablet:** Optional
- **Mobile:** Never rely on hover. Use `:active` or touch feedback instead

---

## Shadows

Use shadow tokens. Never increase shadow intensity on mobile:

```css
--shadow-xs   /* Subtle */
--shadow-sm   /* Default card */
--shadow-md   /* Elevated */
--shadow-lg   /* Floating */
--shadow-xl   /* Modal / overlay */
```

---

## Background Decorations

The app uses StormClouds and ElectricityOverlay effects:

- **Desktop:** Full effects enabled
- **Tablet:** Reduce density
- **Mobile:** Keep subtle or disable heavy particle effects

```css
@media (max-width: 768px) {
  .electricity-overlay { display: none; }
  .storm-clouds { opacity: 0.3; }
}
```

---

## CSS Recommendations

Prefer these over media queries when possible:

```css
/* Fluid sizing */
width: clamp(280px, 90vw, 640px);

/* Responsive font */
font-size: clamp(1rem, 2vw, 1.5rem);

/* Min/max constraints */
max-width: min(100%, var(--content-max-width));
```

Prefer `flex-wrap` over overflow. Prefer CSS Grid for layouts. Avoid fixed widths and fixed heights.

---

## Components Checklist

Every component must support responsive behavior:

| Component | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| Nav | Glass bar, full menu | Glass bar, collapsed | Hamburger / drawer |
| Footer | 3-column layout | 2-column | Stacked single column |
| Upload Zone | Full drag area | Same | Compact, touch-friendly |
| Job Cards | Side-by-side info | 2-column grid | Stacked vertically |
| Queue Panel | Sidebar | Below main | Full-width below |
| Processing Details | Expanded | Compact | Minimal |
| Intro Overlay | Full animation | Full animation | Shorter animation |
| Modals | Centered | Centered | Bottom sheet / fullscreen |
| Progress Bars | Full width | Full width | Full width |

---

## Validation Checklist

Every screen must satisfy:

- [ ] Works from 320px to ultrawide
- [ ] No horizontal scrolling
- [ ] Uses design tokens exclusively (no hardcoded values)
- [ ] Images scale appropriately
- [ ] Layout restructures when beneficial
- [ ] Touch-friendly (44px+ targets on mobile)
- [ ] Keyboard accessible
- [ ] Responsive typography (uses token scaling)
- [ ] Responsive spacing (uses token scaling)
- [ ] Responsive grids (CSS Grid / Flexbox)
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Glass effects reduced on mobile
- [ ] No fixed-width layouts
- [ ] No hardcoded colors
- [ ] Tested across all 5 breakpoints

---

## Guiding Principle

> Build for the available space, not by shrinking the desktop layout.

Each viewport gets the experience that fits its screen while preserving the app's identity through the shared design system in `design-tokens.css`.
