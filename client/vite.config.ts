<<<<<<< HEAD
import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [react(), tailwindcss()],
    define: { 
      "process.env.API_BASE_URL": JSON.stringify(env.API_BASE_URL),
      "process.env.API_VERSION": JSON.stringify(env.API_VERSION),
      "process.env.S3_BUCKET_NAME": JSON.stringify(env.VITE_S3_BUCKET),
      "process.env.AWS_REGION": JSON.stringify(env.VITE_AWS_REGION),
    },
    server: { 
      proxy: {
        "/api/v1": {
          target: `http://localhost:${env.API_PORT}`,
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
=======
import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [react(), tailwindcss()],
    define: { 
      "process.env.API_BASE_URL": JSON.stringify(env.API_BASE_URL),
      "process.env.API_VERSION": JSON.stringify(env.API_VERSION),
      "process.env.S3_BUCKET_NAME": JSON.stringify(env.VITE_S3_BUCKET),
      "process.env.AWS_REGION": JSON.stringify(env.VITE_AWS_REGION),
    },
    server: { 
      proxy: {
        "/api/v1": {
          target: `http://localhost:${env.API_PORT}`,
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
>>>>>>> master
