import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin, bytecodePlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin(), bytecodePlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@": resolve("src/renderer/src")
      }
    },
    publicDir: resolve("src/renderer/public"),
    plugins: [vue(), tailwindcss()],
    optimizeDeps: {
      include: ["pixi.js", "pixi-live2d-display"]
    },
    build: {
      rollupOptions: {
        external: ["live2d.min.js"]
      }
    },
    server: {
      headers: {
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'"
      }
    }
  }
});
