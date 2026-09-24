import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { cp, rm } from "node:fs/promises";

const frontendDist = path.resolve(import.meta.dirname, "dist");
const repositoryDist = path.resolve(import.meta.dirname, "../dist");

const mirrorBuildForRepositoryRoot = {
  name: "careermate-mirror-build-output",
  apply: "build" as const,
  async closeBundle() {
    await rm(repositoryDist, { recursive: true, force: true });
    await cp(frontendDist, repositoryDist, { recursive: true });
    console.log("CareerMate build output available at frontend/dist and dist.");
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mirrorBuildForRepositoryRoot],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
