import { defineConfig } from "vite"

export default defineConfig(({ mode }) => ({
	define: {
		IS_DEV: JSON.stringify(mode !== "production"),
	},
	build: {

		sourcemap: true,
	},
}))
