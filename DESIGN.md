---
name: Envault
description: End-to-end encrypted messages, delivered exactly when they're meant to arrive.
colors:
  amber-ember: "#f5a623"
  kindled-orange: "#f97316"
  deep-crimson: "#e11d48"
  void-black: "#080a0d"
  charcoal-surface: "#10121c"
  hairline-border: "#ffffff1a"
  paper-white: "#eef1f5"
  muted-silver: "#c0c7d1"
  alert-red: "#ef4444"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "clamp(2.3rem, 5.6vw, 4.6rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "0.02em"
rounded:
  sm: "4px"
  md: "12px"
  lg: "18px"
  xl: "28px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.kindled-orange}"
    textColor: "#14111d"
    rounded: "{rounded.sm}"
    padding: "0 28px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.amber-ember}"
    textColor: "#14111d"
    rounded: "{rounded.sm}"
    padding: "0 28px"
    height: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-silver}"
    rounded: "{rounded.sm}"
    padding: "0 28px"
    height: "44px"
  card:
    backgroundColor: "{colors.charcoal-surface}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "#ffffff08"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "40px"
  brand-mark:
    backgroundColor: "{colors.kindled-orange}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    size: "32px"
---

# Design System: Envault

## 1. Overview

**Creative North Star: "The Ember Vault"**

Envault holds a message in the dark and lets it glow quietly until the moment it's due. The system is built around that image: a near-black interior, and a single warm light source, amber cooling into crimson, that marks where attention belongs. It never floods the screen; it marks the door, the primary action, the thing that's alive right now.

This replaces the system's previous cool-purple identity. Purple read as generic app chrome; amber-to-crimson reads as something lit and tended, closer to a lantern or a sealed letter by candlelight than a SaaS dashboard. Per PRODUCT.md's anti-references, this system explicitly rejects the generic "SaaS corporate" look: flat gradients used as decoration, identical feature cards, stock-photo business tone. Every warm accent here earns its place by marking something the user should actually look at.

**Key Characteristics:**
- Near-black void with a solid warm accent; the amber-to-crimson gradient lives only in the ambient background glow, never on a component
- Flat by default; depth comes from translucency, hairline borders, and blur, not drop shadows
- One typeface (Inter) carries the entire system, differentiated by weight and size alone
- Sharp, minimal precision in components: 4px radii on interactive controls, no bevel, no gloss

## 2. Colors: The Ember Palette

The palette pairs a solid warm accent with a near-black neutral scale. The amber-to-crimson gradient is reserved for the page's ambient glow, and, rarely, for typography; every UI component (buttons, brand marks, badges, pills) is a flat, solid fill.

### Primary
- **Kindled Orange** (#f97316): the default solid accent. Primary buttons, the brand mark, links, focus rings, and icon strokes all use this one flat color.
- **Amber Ember** (#f5a623): the lighter solid variant. Used for hover states on the primary accent, for "selected/active" states that need to read as distinct from a primary action (e.g. an active filter pill), and for the ambient glow's top-left stop.
- **Deep Crimson** (#e11d48): almost entirely reserved for the ambient glow's second stop (bottom-right, cooler and fainter) and, if a heading ever earns a gradient treatment, its dark end. Not used as a flat component fill.

### Neutral
- **Void Black** (#080a0d): the page background. The darkest surface in the system; nothing sits behind it.
- **Charcoal Surface** (#10121c): card, header, and dropdown backgrounds. One step up from Void Black, giving panels a faint lift without a shadow.
- **Hairline Border** (#ffffff1a, 10% white): the only border treatment in the system. Never opaque, never colored, always this same translucent white.
- **Paper White** (#eef1f5): primary text and headings.
- **Muted Silver** (#c0c7d1): secondary text, captions, de-emphasized labels.

### Semantic
- **Alert Red** (#ef4444): destructive actions and error states only (delete confirmations, failed requests, the logout danger item). Its hue sits at true red, not the pink-leaning Deep Crimson, so a warning never reads as "more brand."

### Ambient Glow
The one legitimate multi-color gradient in the system is atmospheric, not a component: a radial glow at 20%/10% (Kindled Orange, 22% opacity) and a second, fainter one at 90%/80% (Deep Crimson, 12% opacity), both fading to transparent over Void Black. It sets the "ember in the dark" scene on every full-page background and is never used inside a card, button, or badge.

### Named Rules
**The Solid Ember Rule.** The accent color is always a flat solid fill on components, never a gradient. A `linear-gradient` built from the ember colors (Amber Ember, Kindled Orange, Deep Crimson) on a button, brand mark, badge, or pill is a mistake, not a valid variant. The only places the ember colors are allowed to blend into a gradient are the page-level Ambient Glow and, occasionally, typography (see Typography's Named Rule). This doesn't apply to the neutral white-on-Charcoal translucency used for card depth (see Elevation); that's a tonal layering technique, not an accent gradient.

**The Two-Fire Rule.** Deep Crimson is brand light; Alert Red is an alarm. They never substitute for each other. Destructive UI (delete, danger states) uses Alert Red exclusively, even though its hue sits close to Deep Crimson.

## 3. Typography

**Body & Display Font:** Inter (with -apple-system, BlinkMacSystemFont, "Segoe UI" fallback)

**Character:** One family carries the whole system, from a 4.6rem hero line down to a 0.8rem locale label. Weight and size do the differentiating work, not a second typeface.

### Hierarchy
- **Display** (800, clamp(2.3rem, 5.6vw, 4.6rem), line-height 1.05, letter-spacing -0.02em): hero headlines only, one per page.
- **Headline** (700, 2rem, line-height 1.2): auth card titles, page-level headings inside the app shell.
- **Title** (650, 1.05rem): component-level headings, e.g. feature card titles.
- **Body** (400, 15px base, line-height 1.6; hero subtitle scales to clamp(1rem, 2.1vw, 1.26rem)): all paragraph and description text. Cap prose width at 65-75ch, already respected by the 700px hero-subtitle max-width.
- **Label** (650, 0.8rem, letter-spacing 0.02em): small UI text like the locale switch. Case comes from content (locale codes are naturally short caps), not a forced `text-transform`.

### Named Rules
**The One Voice Rule.** Inter is the only typeface anywhere in the product, from the marketing hero to a form-field hint. If a screen needs a second family, that's a sign it needs a weight or size change instead.

**The Solid Text Default Rule.** Headings and labels are a solid color by default (Paper White, or a single accent color for an emphasized span, as in the hero's "with time"). A gradient fill on text (`background-clip: text`) is not a default treatment; it's allowed only when one specific heading earns it as a rare, deliberate effect, never applied reflexively to every title.

## 4. Elevation

Envault is flat by default and stays that way deliberately: several components explicitly set `box-shadow: none` to override Naive UI's default elevation. Depth is conveyed through translucent layering instead: a slightly lighter neutral (Charcoal Surface over Void Black), a single hairline border, and `backdrop-filter: blur(10px)` on the app header so content can scroll beneath it without a hard edge.

### Shadow Vocabulary
- **Overlay shadow** (`box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5)`): reserved for content that floats above the page in its own layer, currently only the account dropdown menu.

### Named Rules
**The No-Shadow Rule.** Cards, buttons, and inline surfaces never cast a shadow. Only a true overlay (a menu, a modal) is allowed the one shadow value above.

## 5. Components

Components are cut clean and precise: sharp edges on interactive controls, translucent surfaces at rest, and a solid ember fill reserved for the one action that matters most on any given screen.

### Buttons
- **Shape:** 4px radius on every button, input, and select (`--n-border-radius: 4px` overrides Naive UI's 12px default). Deliberately tighter than the cards around them.
- **Primary:** solid Kindled Orange (#f97316), dark ink text (#14111d) for contrast, no border, no shadow, no gradient.
- **Hover:** background brightens toward Amber Ember and the button lifts 1px (`translateY(-1px)`); still solid, still no shadow.
- **Ghost / Secondary:** transparent background, translucent white border (`hairline-border`), muted-silver text that brightens to paper-white on hover.

### Cards
- **Corner style:** 18px radius for content cards (feature cards), 16px for the auth card. Both round enough to feel soft against the sharp 4px buttons inside them.
- **Background:** a faint vertical gradient between two near-transparent whites over Charcoal Surface, giving the impression of a lit panel without any real shadow.
- **Border:** the single hairline border, never a colored or side-only stripe.
- **Internal padding:** 20-24px.

### Inputs / Fields
- **Style:** near-transparent fill (`rgba(255,255,255,0.03)`), hairline border, 4px radius, matching buttons.
- **Focus:** border shifts to a translucent Kindled Orange (`rgba(249, 115, 22, 0.65-0.85)`), no glow, no box-shadow.
- **Autofill:** forced dark background and Paper White text so browser autofill styling can't break the dark theme.

### Navigation
- **Style:** a blurred, semi-transparent Charcoal Surface header (`rgba(7, 8, 15, 0.84)` + 10px blur) with a single hairline bottom border. Brand mark is the 32px solid Kindled Orange square (10px radius) holding the lock glyph.
- **States:** the account avatar is a flat circle (`border-radius: 50%`) tinted with a low-opacity Kindled Orange fill; its dropdown menu is the one place in the system allowed a real shadow (see Elevation).
- **Mobile:** brand name and header padding scale down at 760px; no structural change.

### Brand Mark (signature component)
A small square (32px in the header, up to 96px as the hero lock) filled with solid Kindled Orange, holding a single white icon glyph centered. It's flat by the Solid Ember Rule like every other component; the "ember" identity comes from the color and the glyph, not from a gradient.

## 6. Do's and Don'ts

### Do:
- **Do** keep the accent a flat solid fill on every component (buttons, brand marks, badges, pills). Kindled Orange for primary actions, Amber Ember for hover/selected states.
- **Do** reserve ember-colored gradients for the page-level Ambient Glow and, rarely, a single deliberate heading; never a component.
- **Do** keep every border to the single hairline treatment (`#ffffff1a`), no colored borders, no side-only stripes.
- **Do** keep buttons and inputs at 4px radius even as surrounding cards go softer (16-18px); the contrast is intentional.
- **Do** use Alert Red (#ef4444) for every destructive or error state, never Deep Crimson.
- **Do** add a `prefers-reduced-motion` fallback to any new animation (the hero lock's float animation currently has none and should gain one).

### Don't:
- **Don't** put an ember-colored `linear-gradient` on a button, brand mark, badge, or pill. That's the single most common way this system drifts back toward decoration; solid fill is the default and the fallback.
- **Don't** reach for the generic "SaaS corporate" look: flat decorative gradients, identical feature-card grids, stock-photo business tone. PRODUCT.md names this directly as the anti-reference.
- **Don't** add box-shadow to cards, buttons, or inline surfaces. Only true overlays (menus, modals) get the one overlay shadow value.
- **Don't** introduce a second typeface. Differentiate with Inter's weight and size scale only.
- **Don't** use `border-left`/`border-right` as a colored accent stripe on cards or list items.
- **Don't** let Deep Crimson and Alert Red bleed into each other's role; a delete button that looks like brand chrome undersells the danger of the action.
