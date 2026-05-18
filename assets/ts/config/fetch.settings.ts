/**
 * fetch.settings.ts
 * Configuration for data fetching strategy and API endpoint.
 */

import type { FetchConfig } from "../types"

export const fetchConfig: FetchConfig = {
	strategy: "json",
	apiUrl: "/data/tiles.json",

	// WordPress example:
	// strategy: "wordpress",
	// apiUrl: "https://your-wordpress-site.com",
	// → Posts endpoint: ${apiUrl}/wp-json/wp/v2/posts
	// → Pages endpoint: ${apiUrl}/wp-json/wp/v2/pages
}