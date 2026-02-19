import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* Figma palette — source of truth */
        navy: {
          DEFAULT: "#364763",
          50: "#F1F3F6",
          100: "#D8DDE5",
          200: "#B0BAC9",
          300: "#8997AD",
          400: "#617491",
          500: "#364763",
          600: "#2C3A52",
          700: "#222D40",
          800: "#17202E",
          900: "#0D131D",
        },
        rose: {
          DEFAULT: "#CF3952",
          50: "#FDF1F3",
          100: "#F9D4DA",
          200: "#F2A3B0",
          300: "#EB7286",
          400: "#E1475F",
          500: "#CF3952",
          600: "#B53047",
          700: "#98273B",
          800: "#7C1F30",
          900: "#5F1724",
        },
        "warm-gray": "#F5F4F0",
        /* Figma semantic text colors */
        "tc-text": {
          primary: "#12100F",
          secondary: "#3F444C",
          placeholder: "#9C9C9C",
          heading: "#1E2939",
          subtle: "#4A5565",
          label: "#364153",
          hint: "#6A7282",
        },
        /* Figma status palette */
        "tc-blue": { bg: "#E3F2FD", text: "#0D47A1" },
        "tc-red": { bg: "#FEEBEE", border: "#E57373", text: "#B71C1C" },
        "tc-green": { bg: "#E8F5E9", border: "#81C784", text: "#1B5E20" },
        "tc-online": "#00C950",
        /* Figma chat surface tokens */
        "tc-chat": {
          bg: "#FAFAFA",
          bubble: "#EBEBEB",
          input: "#F3F3F3",
        },
      },
      spacing: {
        /* Figma spacing tokens not in default 4px scale */
        "1.5": "6px",
        "2.5": "10px",
        "4.25": "17px",
        "40": "160px",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 2px)",
        pill: "9999px",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
