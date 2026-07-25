import type { GlobalThemeOverrides } from "naive-ui";

/** Dark ink text color used on top of the solid accent fill (primary buttons). */
const inkColor = "#14111D";

/**
 * Single source of truth for every button's visual style across the app
 * (landing, auth, dashboard). Change a color or border here and it applies
 * to every `n-button` everywhere, instead of per-view overrides.
 */
export const envaultThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: "#C47A45",
    primaryColorHover: "#CCA466",
    primaryColorPressed: "#8F4C32",
    primaryColorSuppl: "#C47A45",
    borderRadius: "12px",
  },
  Button: {
    // Primary (solid accent) buttons: never a gradient, per the design system's Solid Ember Rule.
    textColorPrimary: inkColor,
    textColorHoverPrimary: inkColor,
    textColorPressedPrimary: inkColor,
    textColorFocusPrimary: inkColor,
    textColorDisabledPrimary: inkColor,
    borderPrimary: "none",
    borderHoverPrimary: "none",
    borderPressedPrimary: "none",
    borderFocusPrimary: "none",
    borderDisabledPrimary: "none",
    // Ghost / secondary buttons: translucent hairline border, muted text that brightens on hover.
    textColorGhost: "var(--env-muted)",
    textColorGhostHover: "var(--env-text)",
    textColorGhostPressed: "var(--env-text)",
    textColorGhostFocus: "var(--env-text)",
    border: "1px solid var(--env-surface-border)",
    borderHover: "1px solid rgba(255, 255, 255, 0.32)",
    borderPressed: "1px solid rgba(255, 255, 255, 0.32)",
    borderFocus: "1px solid rgba(255, 255, 255, 0.32)",
  },
};
