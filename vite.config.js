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
});
