import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// In development the React dev server (port 5173) proxies /api calls to the
// Node.js backend, so no CORS or hard-coded URLs are needed in the code.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_PROXY_TARGET || "http://localhost:3000";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: { "/api": { target: backend, changeOrigin: true } },
    },
  };
});
