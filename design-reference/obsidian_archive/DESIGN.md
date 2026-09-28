---
name: Obsidian Archive
colors:
  surface: '#121316'
  surface-dim: '#121316'
  surface-bright: '#38393c'
  surface-container-lowest: '#0d0e11'
  surface-container-low: '#1b1b1f'
  surface-container: '#1f1f23'
  surface-container-high: '#292a2d'
  surface-container-highest: '#343538'
  on-surface: '#e3e2e6'
  on-surface-variant: '#d4c4b0'
  inverse-surface: '#e3e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#9d8f7c'
  outline-variant: '#504535'
  surface-tint: '#fabc4d'
  primary: '#ffc665'
  on-primary: '#432c00'
  primary-container: '#e5a93c'
  on-primary-container: '#5e4000'
  inverse-primary: '#7e5700'
  secondary: '#4de082'
  on-secondary: '#003919'
  secondary-container: '#00b55d'
  on-secondary-container: '#003e1c'
  tertiary: '#b3d1ff'
  on-tertiary: '#00315d'
  tertiary-container: '#80b6ff'
  on-tertiary-container: '#004681'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdead'
  primary-fixed-dim: '#fabc4d'
  on-primary-fixed: '#281900'
  on-primary-fixed-variant: '#604100'
  secondary-fixed: '#6dfe9c'
  secondary-fixed-dim: '#4de082'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005227'
  tertiary-fixed: '#d4e3ff'
  tertiary-fixed-dim: '#a4c9ff'
  on-tertiary-fixed: '#001c39'
  on-tertiary-fixed-variant: '#004883'
  background: '#121316'
  on-background: '#e3e2e6'
  surface-variant: '#343538'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 52px
    fontWeight: '700'
    lineHeight: 58px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 42px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system embodies an editorial, archival aesthetic tailored for discerning gaming enthusiasts and critics. Drawing direct inspiration from cinematic cultural databases like Letterboxd and structured cataloging platforms like Steam and Backloggd, it frames interactive media with serious curatorial reverence.

The personality balances cinematic restraint with tactile precision. The interface acts as a bespoke, gallery-like canvas: dark, understated, and mathematically structured to elevate high-chroma key art, box illustrations, and screenshot media without visual competition. 

The aesthetic is built on **Dark Architectural Minimalism** punctuated by **Precision Data Density**. Surfaces rely on deep obsidian, volcanic slate, and subtle linear separations. Rather than gaudy neon gaming tropes, micro-interactions evoke fine editorial instruments—sharp tabular metrics, tactile toggle switches, crisp metadata badges, and high-impact typographic scoring nodes.

## Colors

The palette establishes an ultra-refined dark atmosphere where contrast is calibrated for prolonged browsing, reading, and comparison sessions.

### Base Surface Architecture
- **Canvas Base (`#121316`)**: The deepest structural backdrop, grounding the entire viewport.
- **Surface Elevation 1 (`#18191E`)**: Primary card, panel, and sidebar background, providing seamless separation from the canvas.
- **Surface Elevation 2 (`#22252B`)**: Interactive controls, floating dialogs, tooltips, and elevated card hovers.
- **Hairline Border (`#2D3139`)**: A crisp, low-luminance divider maintaining spatial boundaries without adding visual clutter.
- **Subtle Highlight Border (`#3E434D`)**: Applied selectively to focused elements, active tabs, and primary card highlights.

### Typography & Content Tokens
- **Text Primary (`#EDEDED`)**: High-contrast, non-glare off-white for titles, primary data values, and active states.
- **Text Secondary (`#A0A5B1`)**: Balanced mid-tone slate for supporting body copy, metadata labels, and timestamps.
- **Text Muted (`#636A79`)**: Low-emphasis tone for passive icons, placeholder text, and subtle grid lines.

### Accent Accents & Scoring System
- **Gold / Masterpiece Tier (`#E5A93C`)**: The signature primary accent. Reserved for 90+ ratings, critic highlights, awards, and primary call-to-action buttons.
- **Emerald / Recommended Tier (`#4ADE80`)**: Secondary functional accent denoting high positive consensus (75–89), completed backlog states, and verified acquisitions.
- **Azure / Community Tier (`#60A5FA`)**: Tertiary functional accent designating platform markers (Steam, PlayStation, Xbox, Switch syncs) and neutral data indicators.
- **Crimson / Mixed-Negative (`#F87171`)**: Reserved strictly for critical warnings, negative sentiment (<50), and destructive actions.

## Typography

The typographic hierarchy pairs architectural geometry with engineered data clarity.

- **Headlines & Display (`Space Grotesk`)**: Anchors game titles, tier list headers, and macro statistics. Its modern technical character cuts cleanly across dark canvases with tightened tracking for an assertive, high-end editorial mood.
- **Body Text (`Hanken Grotesk`)**: An exceptionally neutral grotesque engineered for long-form game reviews, synopsis blurbs, and user comments. It maintains high legibility across muted gray shades.
- **Technical Badges & Metrics (`JetBrains Mono`)**: Powers the numerical framework: rating scores, release dates, completion times (Main/Completionist), Steam store metrics, and tier indicators. Tabular numerals ensure clean vertical alignment across side-by-side comparison tables.

## Layout & Spacing

The layout is built around a structured, fluid grid engineered for dense visual curation and multi-column game matrices.

### Breakpoint Matrix
- **Desktop (1280px+)**: 12-column layout with max-width container capped at 1440px. 24px gutters, 32px outer canvas margin. Adapts easily for side-by-side game comparison split screens (6 vs. 6 columns).
- **Tablet (768px – 1279px)**: 8-column layout with 20px gutters and 24px outer margins. Cover card grids reconfigure dynamically from 6 to 4 items per row.
- **Mobile (320px – 767px)**: 4-column layout with 12px gutters and 16px outer margins. Comparison layouts transform from parallel columns into an accordion-driven horizontal swipe system.

### Rhythmic Discipline
Vertical density follows an 8px base rhythm (with 4px micro-steps). Cover arts use standard 3:4 and 2:3 vertical poster aspect ratios. Information clusters (developer tags, score arrays, platform badges) are grouped using tight `space-xs` and `space-sm` increments, while editorial sections breathe via `space-xl` separation.

## Elevation & Depth

Depth is defined through disciplined surface luminosity and razor-thin borders rather than heavy ambient drop shadows, preserving clarity against dark themes.

### Tonal Stratification
- **Ground Floor (`#121316`)**: Canvas plane.
- **Level 1 Panels (`#18191E` with 1px solid `#2D3139`)**: Poster card backgrounds, data grids, comparison shelves.
- **Level 2 Modals & Flyouts (`#22252B` with 1px solid `#3E434D`)**: Dropdown selectors, quick-rate overlays, search modal palettes.

### Lighting & Ambient Occlusion
- Shadows are restrained, ultra-diffused, and slightly tinted with cold graphite: `box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.65)`.
- Backdrop filters are leveraged for transient overlays and floating headers: `backdrop-filter: blur(12px)` over a 70% alpha `#121316` surface, allowing vibrant poster colors to tint the interface subtly as the user scrolls.
- Active or high-tier elements feature an inner specular stroke: `inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`.

## Shapes

The geometric signature is **Soft Precision (Level 1)**. 

Game posters, cards, chips, and input elements utilize compact 4px (`0.25rem`) corner radii, moving to 8px (`0.5rem`) on modals, tier list slots, and large visual canvases. This intentional low-radius strategy keeps the interface sharp, structured, and reminiscent of high-end cataloging dashboards. Circular geometry is reserved strictly for user avatars and circular rating progress dials.

## Components

### Buttons
- **Primary Action (Log, Review, Wishlist)**: `#E5A93C` filled background with `#121316` bold text. Subtle hover state brightens to `#F3BA59`. 4px radius, `label-md` JetBrains Mono uppercase tracking.
- **Secondary Action (Compare, Shelf)**: `#18191E` surface, 1px `#2D3139` border, `#EDEDED` text. On hover: border tints to `#3E434D` with surface shift to `#22252B`.
- **Ghost Action**: Transparent background with `#A0A5B1` text; turns `#EDEDED` with subtle background tint on hover.

### Game Poster Cards
- Standard 3:4 portrait aspect ratio.
- Encased in a 1px border `#2D3139` with 4px corner radius.
- Includes a top-right pinned score pill: JetBrains Mono `label-sm` rendered on `#121316` (80% blur) with score-tier color typography (e.g., `#E5A93C` or `#4ADE80`).
- Hover state: Subtle zoom (`scale(1.02)`), border tinting to `#3E434D`, and swift emergence of an action footer overlay offering quick-log, rating stars, and backlog status icons.

### Rating & Score Badges
- **Universal Score Pill**: Monospaced numerical readout inside a compact pill container. Gold (`#E5A93C`) for 90+, Emerald (`#4ADE80`) for 75–89, Slate (`#A0A5B1`) for <74.
- **Star Rating Selector**: Half-star precision rating component with gold fill and micro-haptic state feedback.

### Input Fields & Search Command Bar
- Surface `#18191E`, border 1px `#2D3139`, inner padding `space-md`. Focus state features a crisp 1px highlight border in `#E5A93C` with zero blurry outline rings.
- Integrated quick-search shortcut pill displaying `⌘K` or `Ctrl+K` set in JetBrains Mono `label-sm`.

### Chips & Filter Tags
- Compact tags for genres, platforms, and tags (e.g., "Roguelike", "Steam Deck Verified").
- Background `#18191E`, border 1px `#2D3139`, text `#A0A5B1`. 
- Active state: `#E5A93C` text color, border tint `#E5A93C`, and subtle 10% gold background fill.

### Comparison Matrix Table
- Alternating subtle rows (`#121316` and `#18191E`) divided by hairline borders (`#2D3139`).
- Persistent sticky header pinning both comparing titles side-by-side.
- Metric cells (Metascore, Completion Time, Release Year, User Score) utilize tabular JetBrains Mono alignment for effortless eye scanning.