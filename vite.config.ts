import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tailwindcss(), react()],
    server: {
      port: 5173
    },
    build: {
      outDir: "dist",
      sourcemap: false
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    }
  };
});
