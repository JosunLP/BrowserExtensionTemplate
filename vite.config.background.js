import { defineConfig } from "vite";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	build: {
		rollupOptions: {
			input: resolve(__dirname, "src/background.ts"),
			output: {
				entryFileNames: "background.js",
				dir: resolve(__dirname, "dist/js"),
			},
		},
		sourcemap: true,
	},
	plugins: [tsconfigPaths()],
	resolve: {
		extensions: [".tsx", ".ts"],
	},
	esbuild: {
		include: /.*\.tsx?$/,
		exclude: [/node_modules/, /dist/, /src\/app\.ts/, /src\/settings\.ts/],
	},
});
