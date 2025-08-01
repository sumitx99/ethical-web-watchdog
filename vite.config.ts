
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        background: path.resolve(__dirname, "src/background.ts"),
        content: path.resolve(__dirname, "src/content.ts")
      },
      output: {
        entryFileNames: (chunk) => {
          return chunk.name === 'background' || chunk.name === 'content'
            ? '[name].js'
            : 'assets/[name]-[hash].js';
        }
      }
    }
  }
}));
