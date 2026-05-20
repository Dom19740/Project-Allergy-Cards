import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { nitro } from "nitro/vite";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), react(), nitro()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase limit slightly as we have heavy image libs
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Separate heavy image processing libraries
            if (id.includes('html2canvas') || id.includes('html-to-image')) {
              return 'image-libs';
            }
            // Separate UI libraries
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-libs';
            }
            return 'vendor';
          }
        },
      },
    },
  },
}));