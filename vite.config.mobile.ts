import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('html2canvas') || id.includes('html-to-image')) {
              return 'image-libs';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-libs';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
