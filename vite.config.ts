import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendor libs into cacheable chunks instead of one large bundle.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // MUST come before the charts rule: clsx/tailwind-merge are imported
          // by cn() (every component). Left unassigned, Rollup absorbed them
          // into the charts chunk, statically dragging 360KB of admin-only
          // recharts onto the public homepage's critical path.
          if (id.includes("clsx") || id.includes("tailwind-merge") || id.includes("class-variance-authority"))
            return "ui-utils";
          if (id.includes("recharts") || id.includes("/d3-")) return "charts";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@tanstack")) return "query";
          if (id.includes("react-router")) return "router";
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) return "react-vendor";
        },
      },
    },
  },
}));
