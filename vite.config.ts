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
          /* No manual chunk for recharts.
             It is used by exactly one lazily-loaded route (the admin's stats
             page), so naming a chunk for it made things worse rather than
             better: Rollup co-locates shared dependencies into an existing
             chunk, clsx landed in "charts" — and clsx is behind `cn()`, which
             every component on the site calls. So every route ended up
             importing the chart library, and index.html modulepreloaded
             360KB of it on the home page. Left alone, recharts is split into
             the admin route that actually uses it. */
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@tanstack")) return "query";
          if (id.includes("react-router")) return "router";
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) return "react-vendor";
        },
      },
    },
  },
}));
