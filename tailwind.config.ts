import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {

      /* 🔤 FONTS */
      fontFamily: {
        body: ["Inter", "sans-serif"],
        headline: ["Inter", "sans-serif"],
        code: ["monospace"],
      },

      /* 🎨 COLORS */
      colors: {

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
      },

      /* 🔥 GLASS UI COLORS */
      backgroundImage: {
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))",

        "main-gradient":
          "linear-gradient(to right, #9333ea, #ec4899)",
      },

      /* 🔥 SHADOW */
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.1)",
        soft: "0 4px 20px rgba(0,0,0,0.08)",
      },

      /* 🔥 BACKDROP BLUR */
      backdropBlur: {
        xs: "2px",
      },

      /* 🔥 BORDER RADIUS */
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },

      /* 🔥 ANIMATIONS */
      keyframes: {

        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        scaleIn: {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },

        slideUp: {
          "0%": {
            transform: "translateY(20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
      },

      animation: {
        fadeIn: "fadeIn 0.4s ease-in-out",
        scaleIn: "scaleIn 0.3s ease",
        slideUp: "slideUp 0.4s ease",
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
} satisfies Config;
