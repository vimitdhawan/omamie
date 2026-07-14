// Tailwind configuration – aligns Omamie design tokens with Tailwind utilities.
// NOTE: Tailwind CSS v4 reads theme tokens from the CSS file (globals.css) via @theme.
// This file is kept as a human-readable reference of the design system mapping.

import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        // Primary brand accent and variants (Stitch Blue Palette)
        primary: "#336cfb",
        "primary-active": "#1e52d9",
        "primary-disabled": "#adc6ff",
        // Semantic colors
        error: "#ba1a1a",
        "error-hover": "#9a1515",
        // Accent tokens
        premium: "#6174b3",
        featured: "#ca5100",
        // Neutral palette
        ink: "#757681",
        body: "#757681",
        muted: "#9da0aa",
        "muted-soft": "#b8bac3",
        hairline: "#c4c6cf",
        "hairline-soft": "#e1e6f1",
        "border-strong": "#74777f",
        canvas: "#ffffff",
        "surface-soft": "#f1f3f9",
        "surface-card": "#ffffff",
        "surface-strong": "#e6ebf4",
        "on-primary": "#ffffff",
        "on-dark": "#ffffff",
        "legal-link": "#336cfb",
        "star-rating": "#757681",
        scrim: "#000000",
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        base: "14px",
        mdCustom: "14px",
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
