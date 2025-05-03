import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1a73e8", // KeyAuth blue
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "#1a73e8", // KeyAuth blue
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "#ea4335", // Red
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "#0f9d58", // Green
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "#fa7b17", // Orange
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // KeyAuth specific colors
        keyauth: {
          blue: "#1a73e8",
          red: "#ea4335",
          green: "#0f9d58",
          purple: "#9334ea",
          orange: "#fa7b17",
          dark: "#0f1117",
          "dark-card": "#1a1d24",
          "dark-border": "#2a2f38",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        card: "0 4px 6px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 8px 16px rgba(0, 0, 0, 0.3)",
      },
      backgroundColor: {
        "code-bg": "#0f1117",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
