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
           and framework cache independently and load in parallel. Routed by
           package so shared deps (react) land in one chunk, not duplicated. */
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("recharts") || id.includes("d3-") || id.includes("victory")) return "recharts";
          if (id.includes("leaflet")) return "leaflet";
          if (id.includes("react")) return "react";
          return "vendor";
        },
      },
    },
  },
});
