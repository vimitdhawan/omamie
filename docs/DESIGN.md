---
version: alpha
name: omamie-design
description: A clean, photography-driven Omamie — a property management marketplace built on a pure white canvas with a primary blue accent (#336cfb). The design emphasizes generous whitespace, soft rounded corners, and clear hierarchy for property listings, search, and booking flows. All typography uses the Inter fallback stack.
# Design system notes – colors map to Tailwind semantic tokens; light mode only, dark mode can be added later

colors:
  # Tailwind semantic token (light mode) → Purpose
  primary: "#336cfb" # Primary CTA / accent (maps to bg-primary / text-primary-foreground)
  primary-active: "#1e52d9" # Active state for primary CTA
  primary-disabled: "#adc6ff" # Disabled primary CTA
  primary-error-text: "#ba1a1a" # Error text for forms
  primary-error-text-hover: "#9a1515" # Error text hover state
  premium: "#6174b3" # Premium badge / accent (e.g., featured property)
  featured: "#ca5100" # Featured badge / accent
  ink: "#757681" # Default text on light surfaces
  body: "#757681" # Secondary text / long-form copy
  muted: "#9da0aa"
  muted-soft: "#b8bac3"
  hairline: "#c4c6cf"
  hairline-soft: "#e1e6f1"
  border-strong: "#74777f"
  canvas: "#ffffff"
  surface-soft: "#f1f3f9"
  surface-card: "#ffffff"
  surface-strong: "#e6ebf4"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  legal-link: "#336cfb"
  star-rating: "#757681"
  scrim: "#000000"

typography:
  # All type uses the Inter fallback font (system UI stack). Only size, weight, lineHeight, and letterSpacing are defined.
  display-xl:
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.43
    letterSpacing: 0
  display-lg:
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.18
    letterSpacing: -0.44px
  display-md:
    fontSize: 21px
    fontWeight: 700
    lineHeight: 1.43
    letterSpacing: 0
  display-sm:
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.18px
  title-md:
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0
  title-sm:
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0
  rating-display:
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -1px
  body-md:
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  caption:
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.29
    letterSpacing: 0
  caption-sm:
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.23
    letterSpacing: 0
  badge:
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: 0
  micro-label:
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.33
    letterSpacing: 0
  uppercase-tag:
    fontSize: 8px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0.32px
    textTransform: uppercase
  button-md:
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0
  button-sm:
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.29
    letterSpacing: 0
  link:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  nav-link:
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 0

rounded:
  none: 0px
  xs: 4px
  sm: 8px
  md: 14px
  lg: 20px
  xl: 32px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 14px 24px
    height: 48px
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
  button-primary-disabled:
    backgroundColor: "{colors.primary-disabled}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: 13px 23px
    height: 48px
  button-tertiary-text:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
  button-pill-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.full}"
    padding: 10px 20px
  search-orb:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    height: 48px
  icon-button-circle:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    height: 32px
  icon-button-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    height: 40px
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: 80px
  product-tab-active:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    rounded: "{rounded.none}"
  product-tab-inactive:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    typography: "{typography.nav-link}"
  search-bar-pill:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: 14px 24px
    height: 64px
  search-field-segment:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    padding: 8px 24px
  category-strip:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.muted}"
    typography: "{typography.button-sm}"
  category-tab-active:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.none}"
  property-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
  property-card-photo:
    rounded: "{rounded.md}"
  experience-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.md}"
  city-link-block:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.title-sm}"
  rating-display-card:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.rating-display}"
  guest-favorite-badge:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.badge}"
    rounded: "{rounded.full}"
    padding: 4px 10px
  new-tag:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.uppercase-tag}"
    rounded: "{rounded.full}"
    padding: 2px 6px
  amenity-row:
    backgroundColor: transparent
    textColor: "{colors.body}"
    typography: "{typography.body-md}"
    padding: 12px 0
  reviews-card:
    backgroundColor: transparent
    textColor: "{colors.body}"
    typography: "{typography.body-sm}"
  host-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.body}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 24px
  reservation-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 24px
  date-picker-day:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
  date-picker-day-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.full}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 14px 12px
    height: 56px
  footer-light:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    padding: 48px 80px
  footer-link:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
  legal-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.muted}"
    typography: "{typography.caption-sm}"

  # Helper components for design system colors
  error-message:
    textColor: "{colors.primary-error-text}"
    typography: "{typography.caption}"
  error-message-hover:
    textColor: "{colors.primary-error-text-hover}"
    typography: "{typography.caption}"
  disabled-text:
    textColor: "{colors.muted-soft}"
    typography: "{typography.body-sm}"
  star-icon:
    textColor: "{colors.star-rating}"
  hairline-divider:
    backgroundColor: "{colors.hairline}"
    height: 1px
  hairline-soft-divider:
    backgroundColor: "{colors.hairline-soft}"
    height: 1px
  border-strong-indicator:
    backgroundColor: "{colors.border-strong}"
    height: 2px
  modal-backdrop:
    backgroundColor: "{colors.scrim}"
  legal-link:
    textColor: "{colors.legal-link}"
    typography: "{typography.caption-sm}"
  premium-badge:
    backgroundColor: "{colors.premium}"
    textColor: "{colors.on-primary}"
    typography: "{typography.badge}"
  featured-badge:
    backgroundColor: "{colors.featured}"
    textColor: "{colors.on-primary}"
    typography: "{typography.badge}"
---

## Overview

The platform is the canonical example of a generous, photography-led Omamie property management marketplace. The base canvas is **pure white** (`{colors.canvas}` — #ffffff) with a modern, medium-dark neutral (`{colors.ink}` — #757681) for headlines and body, and a single voltage of **primary blue** (`{colors.primary}` — #336cfb) carrying every primary CTA, the search-button orb, and inline brand links. The **Muted Navy** (`{colors.premium}` — #6174b3) and **Burnt Orange** (`{colors.featured}` — #ca5100) tokens are sub-brand accents that only appear inside premium / featured property contexts to provide visual distinction without breaking the professional tone.

Type runs **Inter** (a variable font), with a system stack underneath (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`).

The shape language is **rounded**. Buttons are 8px radius (`{rounded.sm}`), property cards are 16px (`{rounded.md}`), the search bar is fully pill-shaped (`{rounded.full}`), and icon buttons and orbs are circles (`{rounded.full}`). There is essentially no hard corner anywhere except the body grid itself — every interactive element is rounded.

**Key Characteristics:**

- Single accent color: `{colors.primary}` (#336cfb) carries every primary CTA, the search orb, and inline links. Used scarcely — most pages are 90% white + ink with one or two accent moments.
- Custom variable type: **Inter** font. Display weights sit at 500–700, body at 400. Modest weight is intentional — the system trusts photography for visual heft.
- Three-product top nav: Properties, Rentals, Services — each with a hand-illustrated 32px icon and "NEW" badges (`{component.new-tag}`) on the newer products.
- Pill-shaped global search bar: white surface, fully rounded (`{rounded.full}`), divided by 1px hairlines into Where / When / Who segments, terminated by a circular primary search orb (`{component.search-orb}`).
- Property cards are photo-first: aspect-ratio rectangles with `{rounded.md}` corner clipping, swipeable image carousel, "Guest favorite" floating badge top-left, heart icon top-right.
- The design system caps elevation at one shadow tier — used on hover-floated cards and search/account dropdowns.
- 8px base spacing system, with major sections at `{spacing.section}` (64px) — generous but efficient.

## Colors

### Brand & Accent

- **Primary** (`{colors.primary}` — #336cfb): The single brand color. Used for primary CTA backgrounds (Reserve, Continue, Search), the search orb, and inline brand links.
- **Primary Active** (`{colors.primary-active}` — #1e52d9): The press / pointer-down variant — slightly deeper blue.
- **Primary Disabled** (`{colors.primary-disabled}` — #adc6ff): A pale blue tint used on disabled CTAs.
- **Premium** (`{colors.premium}` — #6174b3): Sub-brand accent for premium/first property tier.
- **Featured** (`{colors.featured}` — #ca5100): Sub-brand accent for featured property. High-contrast orange used for visibility.

### Surface

- **Canvas** (`{colors.canvas}` — #ffffff): The default page floor for every public page.
- **Surface Soft** (`{colors.surface-soft}` — #f1f3f9): The lightest fill — used on disabled fields and sub-nav hover backgrounds.
- **Surface Strong** (`{colors.surface-strong}` — #e6ebf4): Slightly heavier fill — circular icon-button surface.

### Hairlines & Borders

- **Hairline** (`{colors.hairline}` — #c4c6cf): The default 1px border tone.
- **Hairline Soft** (`{colors.hairline-soft}` — #e1e6f1): A lighter divider used on long-scrolling editorial body separators.
- **Border Strong** (`{colors.border-strong}` — #74777f): A heavier stroke used on disabled outline buttons and form focus states.

### Text

- **Ink** (`{colors.ink}` — #757681): The dominant text color on light surfaces. Provides a professional, softer contrast than pure black.
- **Body** (`{colors.body}` — #757681): Main running-text color.
- **Muted** (`{colors.muted}` — #9da0aa): Sub-titles and inactive UI labels.
- **Muted Soft** (`{colors.muted-soft}` — #b8bac3): Disabled link text.
- **Star Rating** (`{colors.star-rating}` — #757681): Star icons and rating numbers render in the neutral ink token.
- **On Primary** (`{colors.on-primary}` — #ffffff): White text on primary blue CTAs.

### Semantic

- **Error** (`{colors.primary-error-text}` — #ba1a1a): Inline error text for form validation.
- **Error Hover** (`{colors.primary-error-text-hover}` — #9a1515): Darkens on link hover.
- **Legal Link Blue** (`{colors.legal-link}` — #336cfb): Inline links inside legal copy.

### Scrim

- **Scrim** (`{colors.scrim}` — #000000 at 50% opacity): The global modal backdrop tone — date picker, login dialog, language picker. Stored as the base hex; opacity is applied at render time.

## Typography

### Font Family

The system runs **Inter** for everything — display, body, navigation, captions, microcopy.

### Hierarchy

| Token                         | Size | Weight | Line Height | Letter Spacing     | Use                                                    |
| ----------------------------- | ---- | ------ | ----------- | ------------------ | ------------------------------------------------------ |
| `{typography.rating-display}` | 64px | 700    | 1.1         | -1px               | Listing detail rating display ("4.81")                 |
| `{typography.display-xl}`     | 28px | 700    | 1.43        | 0                  | Homepage hero heading                                  |
| `{typography.display-lg}`     | 22px | 500    | 1.18        | -0.44px            | Listing detail hero h1                                 |
| `{typography.display-md}`     | 21px | 700    | 1.43        | 0                  | Section heads inside listing detail                    |
| `{typography.display-sm}`     | 20px | 600    | 1.20        | -0.18px            | Sub-section titles ("Amenities", "Reviews")            |
| `{typography.title-md}`       | 16px | 600    | 1.25        | 0                  | City link block titles                                 |
| `{typography.title-sm}`       | 16px | 500    | 1.25        | 0                  | Footer column heads                                    |
| `{typography.body-md}`        | 16px | 400    | 1.5         | 0                  | Default running-text                                   |
| `{typography.body-sm}`        | 14px | 400    | 1.43        | 0                  | Card meta lines, dates, prices                         |
| `{typography.caption}`        | 14px | 500    | 1.29        | 0                  | Search field segment labels                            |
| `{typography.caption-sm}`     | 13px | 400    | 1.23        | 0                  | Footer legal line                                      |
| `{typography.badge}`          | 11px | 600    | 1.18        | 0                  | "Guest favorite" floating badge text                   |
| `{typography.micro-label}`    | 12px | 700    | 1.33        | 0                  | Property amenity micro-labels                          |
| `{typography.uppercase-tag}`  | 8px  | 700    | 1.25        | 0.32px (uppercase) | "NEW" badge on product-nav tabs                        |
| `{typography.button-md}`      | 16px | 500    | 1.25        | 0                  | Primary CTA button labels                              |
| `{typography.button-sm}`      | 14px | 500    | 1.29        | 0                  | Pill button labels (category strip)                    |
| `{typography.link}`           | 14px | 400    | 1.43        | 0                  | Inline body links                                      |
| `{typography.nav-link}`       | 16px | 600    | 1.25        | 0                  | Top product-nav labels (Properties, Rentals, Services) |

### Principles

Display weights stay modest. The homepage h1 at 28px / 700 is deliberately small — it tucks under the search bar so photography and the property grid carry visual hierarchy. The listing-detail h1 at 22px / 500 is even quieter; the listing photo banner does the work above it.

The single typographically loud moment in the entire system is the **rating display** (`{typography.rating-display}` — 64px / 700) on listing pages. That is the only place the system trusts type alone to carry hierarchy — rating numbers are a peak trust signal, so they get the loudest treatment.

### Note on Font Substitutes

If Inter is unavailable, **system-ui** or **Roboto** are acceptable fallbacks. Adjust display headlines down by ~2% in line-height to match Inter's slightly tighter cap height; otherwise the proportions transfer cleanly.

## Layout

### Spacing System

- **Base unit:** 4px (with 2px micro-step).
- **Tokens:** `{spacing.xxs}` 2px · `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.base}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 32px · `{spacing.xxl}` 48px · `{spacing.section}` 64px.
- **Section padding (vertical):** `{spacing.section}` (64px) for major page bands; tighter than typical SaaS marketing (80–96px) because marketplace pages need higher card density per scroll.
- **Card internal padding:** `{spacing.lg}` (24px) for `{component.host-card}` and `{component.reservation-card}`; `{spacing.base}` (16px) for property-card meta block; `{spacing.sm}` (8px) for caption / date-row gutters.
- **Gutters:** `{spacing.base}` (16px) between cards in the homepage city grid; `{spacing.lg}` (24px) inside footer column gutters; `{spacing.xs}` (4px) on dense category-strip dividers.

### Grid & Container

- **Max content width:** ~1280px centered on the homepage and editorial pages. Listing detail pages cap closer to 1080px to keep the photo banner and reservation rail readable.
- **City link grid (homepage footer):** 6-column grid at desktop with each cell housing a city name in `{typography.title-md}` and a category sub-label in `{typography.body-sm}` muted.
- **Listing detail:** 2-column with photo / amenity body on the left (~64% width) and a sticky reservation card (`{component.reservation-card}`) on the right (~32%).
- **Footer:** 3-column link list (Support / Hosting / Legal) at desktop, collapsing to 1-column on mobile.

### Whitespace Philosophy

The system gives editorial bands 64px of vertical breathing room but compresses card grids — property and city-link cards sit just 16px apart. The contrast is intentional: the page reads as "open hero, dense marketplace below," reinforcing the marketplace nature without overwhelming the visitor at the fold.

## Elevation

The system has essentially **one shadow tier** plus the flat baseline.

- **Flat (no shadow):** Body, hero, footer, all editorial bands — 95% of surfaces.
- **Card hover float:** `box-shadow: rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px 0, rgba(0, 0, 0, 0.1) 0 4px 8px 0` — applied to property cards on pointer hover, the search bar at rest, and dropdown menus.
- **Modal scrim:** `{colors.scrim}` rendered at 50% opacity — the global modal backdrop. Used on date pickers, login dialogs, language picker.

There are no progressive elevation tiers — the system either has the one shadow or none. Depth comes from photography, the white-on-white surface separation, and rounded-corner clipping rather than from layered shadows.

## Components

### Buttons

**`button-primary`** — Primary blue fill (#336cfb), white text, 8px radius, 14×24px padding, 48px height, weight 500. The most common CTA across the system: "Reserve", "Continue", "Search", account-flow primaries.

**`button-primary-active`** — The press state. Background flips to `{colors.primary-active}` (#1e52d9).

**`button-primary-disabled`** — Pale blue tint at #adc6ff with white text. Cursor not-allowed.

**`button-secondary`** — White fill with ink text and a 1px ink outline. 8px radius. Used for "Save", "Cancel", and inverse CTAs over primary surfaces.

**`button-tertiary-text`** — Plain ink text, no surface, no border. Underlined on hover. Used for "Show more" type links and modal close labels.

**`button-pill-primary`** — A pill-shaped primary blue CTA — 9999px radius, 10×20px padding, 14px label.

### Search Surface

**`search-bar-pill`** — The signature global search bar. White fill, 9999px radius, 64px height, 1px hairline border. Internally divided by vertical hairline rules into `{component.search-field-segment}` cells (Where / When / Who).

**`search-orb`** — The circular primary blue orb terminating the right edge of the search bar. 48×48px, fully rounded, white magnifying-glass icon centered. The hottest single color moment on the homepage.

### Top Navigation

**`top-nav`** — White surface, 80px height, 1px bottom hairline. The Omamie wordmark sits flush left.

**`new-tag`** — A tiny rounded-pill badge anchored top-right of an icon, carrying the uppercase "NEW" label.

### Listing Cards

**`property-card`** — A photo-first card. Image with `{rounded.md}` corner clipping, image carousel dots overlay, "Guest favorite" floating badge top-left, and a heart icon top-right.

**`guest-favorite-badge`** — White rounded pill at 11px / 600 weight. Sits over the photo with the system's only shadow tier applied for elevation.

### Listing Detail

**`rating-display-card`** — The signature listing-detail moment. A 64px / 700 rating number flanked by tiny laurel-wreath SVG ornaments.

**`reservation-card`** — The sticky right-rail card on listing detail pages. White surface, `{rounded.md}` rounding, 1px hairline border, 1px shadow tier elevation, 24px padding. Contains nightly price, date-range selector, guest-count stepper, "Reserve" primary blue CTA full-width, and a fee breakdown stack beneath.

### Forms

**`text-input`** — White surface, 1px hairline outline, `{rounded.sm}` 8px radius, 56px height. On focus, the border thickens to 2px and the border color flips to `{colors.ink}` — no glow, no ring.

### Footer

**`footer-light`** — White surface (matches the page canvas), 48×80px padding. Three columns of link blocks (Support / Hosting / Legal).

**`legal-band`** — A bottom strip beneath the footer columns carrying the copyright line, language picker, and social icons. All text in muted `{colors.muted}` at `{typography.caption-sm}`.

## Responsive Behavior

| Name    | Width       | Key Changes                                                                                                                                                                                                                               |
| ------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile  | < 744px     | Top nav collapses to logo + hamburger; product tabs hide behind a sheet; search bar collapses to a single tappable pill; property cards stack 1-up; city grid 1-column; listing detail collapses reservation card to a sticky bottom bar. |
| Tablet  | 744–1128px  | Top nav keeps product tabs but search bar narrows; property cards 2-up; city grid 2–3 column; reservation card stays sticky right-rail at narrower width.                                                                                 |
| Desktop | 1128–1440px | Full top nav with three product tabs centered; search bar at full pill width with all 3 segments visible; property cards 4-up; city grid 6-column; listing detail 2-column with reservation rail.                                         |
| Wide    | > 1440px    | Content width caps at 1440px on listing/search pages and ~1280px on editorial; gutters absorb the rest.                                                                                                                                   |

### Touch Targets

- Primary CTAs at minimum 48×48px (above WCAG AAA).
- Search orb is 48×48px circular — the most-tapped element on the page.
- Heart save button is 32×32px circular — borderline for AAA but compensated by a generous 12px padding inside the photo card.
- Date-picker day cells are 40×40px circular.

### Collapsing Strategy

- Top product tabs collapse into a hamburger sheet below 744px.
- Search bar's 3 segments collapse into a single-tap entry that opens a full-screen search overlay on mobile.
- Property and city-link grids drop column counts cleanly at each breakpoint — never reflow rows; always reduce columns.
- Reservation card on listing detail switches from sticky right-rail to a sticky bottom bar on mobile, carrying just the "Reserve" CTA + nightly price summary.

## Known Gaps

- **Hover state colors:** intentionally not documented per the global no-hover policy — property card's actual `:hover` styling is a subtle elevation lift, but precise extraction is unreliable.
- **Loading states / skeleton screens:** not visible on the extracted surfaces.
- **Map view styling:** the search-results map uses custom-tinted tiles with custom primary markers; not captured here.
- **Form input error states:** error text color (`{colors.primary-error-text}`) is documented, but the full input outline + helper-text combination on validation failure was not visible in the captured surfaces.
- **Sub-brand palettes:** Premium (`{colors.premium}`) and Featured (`{colors.featured}`) are documented as tokens, but their full sub-system (typography overrides, surface treatment) lives on separate sub-domains and is not captured here.
