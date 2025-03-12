import { defineConfig } from "vite";
import reactSWC from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [reactSWC()],
	optimizeDeps: {
		include: ["react", "react-dom"],
	},
	css: {
		postcss: "./postcss.config.cjs",
	},
});
