import type { Config } from "tailwindcss";

export default {
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        "foreground-soft": "hsl(var(--foreground-soft))",
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
        footer: "hsl(var(--footer))",
        cream: "hsl(var(--cream))",
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-body)'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Named type scale in rem, so the accessibility widget's font-scale
      // (html { font-size: calc(16px * s) }) genuinely scales the site. The px
      // values these replace: meta 18, body 20, card 22, section 38.
      // Arbitrary text-[NNpx] classes are being migrated onto these.
      fontSize: {
        meta: ["1.125rem", { lineHeight: "1.6" }], // 18px labels/meta
        // NOT named "body": that class name is taken by the .text-body prose
        // utility in index.css (18px/1.75) and the collision would be silent.
        lede: ["1.25rem", { lineHeight: "1.75" }], // 20px running text
        // 22px item titles. NOT named "card": `card` is also a colour in the
        // palette, so `text-card` compiled to BOTH this size rule and
        // `color: hsl(var(--card))` — pure white. Anything using it without a
        // later colour utility went invisible on a light background (the
        // sticky CTA headline did exactly that). Same class of silent
        // collision as the `body` note above; the palette is the other
        // namespace a fontSize key can land in.
        "card-title": ["1.375rem", { lineHeight: "1.35" }],
        /** @deprecated collides with the `card` colour — use card-title. */
        card: ["1.375rem", { lineHeight: "1.35" }],
        subsection: ["1.625rem", { lineHeight: "1.3" }], // 26px headings inside a section
        section: ["2.375rem", { lineHeight: "1.25" }], // 38px section titles
      },
      // Tailwind's default scale jumps 500 -> 700. Without 600 here the site's
      // standard image-zoom reached for `duration-[600ms]`, which Tailwind drops
      // entirely as ambiguous (transition- or animation-duration?) — so those
      // hovers silently ran at the 150ms default.
      transitionDuration: {
        600: "600ms",
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
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) both",
        "fade-in": "fade-in 1s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
