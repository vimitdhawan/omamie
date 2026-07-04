// Tailwind configuration – aligns omamie design tokens with Tailwind utilities.
// NOTE: Tailwind CSS v4 reads theme tokens from the CSS file (globals.css) via @theme.
// This file is kept as a human-readable reference of the design system mapping.
import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        // Primary brand accent and variants
        primary: "#ff385c",
        "primary-active": "#e00b41",
        "primary-disabled": "#ffd1da",
        // Semantic colors
        error: "#c13515",
        "error-hover": "#b32505",
        // Accent tokens
        premium: "#460479",
        featured: "#92174d",
        // Neutral palette
        ink: "#222222",
        body: "#3f3f3f",
        muted: "#6a6a6a",
        "muted-soft": "#929292",
        hairline: "#dddddd",
        "hairline-soft": "#ebebeb",
        "border-strong": "#c1c1c1",
        canvas: "#ffffff",
        "surface-soft": "#f7f7f7",
        "surface-card": "#ffffff",
        "surface-strong": "#f2f2f2",
        "on-primary": "#ffffff",
        "on-dark": "#ffffff",
        "legal-link": "#428bff",
        "star-rating": "#222222",
        scrim: "#000000",
      },
      borderRadius: {
        xxs: "4px",
        sm: "8px",
        base: "16px",
        mdCustom: "14px", // keep camelCase for this non-standard key
        lg: "20px",
        xl: "32px",
      },
      spacing: {
        xxs: "2px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        base: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "64px",
      },
      fontFamily: {
        // Inter is the open-source font used by the design system
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        // Display & title sizes
        "display-xl": ["28px", { lineHeight: "1.43" }],
        "display-lg": [
          "22px",
          { lineHeight: "1.18", letterSpacing: "-0.44px" },
        ],
        "display-md": ["21px", { lineHeight: "1.43" }],
        "display-sm": [
          "20px",
          { lineHeight: "1.20", letterSpacing: "-0.18px" },
        ],
        "rating-display": [
          "64px",
          { lineHeight: "1.1", letterSpacing: "-1px" },
        ],
        // Title sizes
        "title-md": ["16px", { lineHeight: "1.25", fontWeight: "600" }],
        "title-sm": ["16px", { lineHeight: "1.25", fontWeight: "500" }],
        // Base body sizes
        "body-md": ["16px", { lineHeight: "1.5" }],
        "body-sm": ["14px", { lineHeight: "1.43" }],
        // Captions / labels
        caption: ["14px", { lineHeight: "1.29", fontWeight: "500" }],
        "caption-sm": ["13px", { lineHeight: "1.23" }],
        badge: ["11px", { lineHeight: "1.18", fontWeight: "600" }],
        "micro-label": ["12px", { lineHeight: "1.33", fontWeight: "700" }],
        "uppercase-tag": [
          "8px",
          {
            lineHeight: "1.25",
            letterSpacing: "0.32px",
            fontWeight: "700",
            textTransform: "uppercase",
          },
        ],
        // Button / link / nav sizes
        "button-md": ["16px", { lineHeight: "1.25", fontWeight: "500" }],
        "button-sm": ["14px", { lineHeight: "1.29", fontWeight: "500" }],
        link: ["14px", { lineHeight: "1.43" }],
        "nav-link": ["16px", { lineHeight: "1.25", fontWeight: "600" }],
      },
    },
  },
  plugins: [],
} satisfies Config;
