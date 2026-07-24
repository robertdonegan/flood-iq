import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/flood-iq/",
  /* Auto-open is off deliberately. `vite --open false` parses "false" as a
     path to open and lands you on /false — if you want it back, set
     `open: true` here rather than passing the flag. */
  server: { open: false },
  build: {
    rollupOptions: {
      output: {
        /* Split heavy vendor trees out of the app chunk so the map, charts
           and framework cache independently and load in parallel. recharts's
           own react-* deps (react-is, react-smooth) stay with recharts; only
           real react/react-dom/scheduler go in the react chunk — otherwise
           react-is bridges vendor<->react and rollup reports a circular chunk. */
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](recharts|d3-|victory|react-is|react-smooth)/.test(id)) return "recharts";
          if (id.includes("leaflet")) return "leaflet";
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return "react";
          return "vendor";
        },
      },
    },
  },
});
