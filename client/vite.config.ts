import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [react(), tailwindcss()],
    define: { 
      "process.env.S3_BUCKET_NAME": JSON.stringify(env.VITE_S3_BUCKET),
      "process.env.AWS_REGION": JSON.stringify(env.VITE_AWS_REGION),
    },
    server: { 
      proxy: {
        "/api/v1": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
