/**
 * config/fetch.settings.ts
 * Configuration for data fetching strategy and API endpoints.
 *
 * - landingUrl: local JSON file that drives the initial grid state
 * - wordpressUrl: base URL of the WordPress site; any tile link that starts
 *   with this prefix is automatically treated as a WP REST API call
 */

import type { FetchConfig } from "../types"

export const fetchConfig: FetchConfig = {
	landingUrl: "/data/landing.json",
	wordpressUrl: "https://imachado.alwaysdata.net/wp",
}