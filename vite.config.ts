import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@app": path.resolve(__dirname, "src/app"),
      "@entities": path.resolve(__dirname, "src/entities"),
      "@widgets": path.resolve(__dirname, "src/widgets"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
});
