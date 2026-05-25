/**
 * types/index.ts
 * Centralized type definitions for the entire application.
 */

// --- Explosion ---

export type ExplosionShape = "mountain" | "bowl"
export type GridMode = "collapsed" | "explosion" | "partial-explosion"

// --- Keybinds ---

export type KeybindAction =
	| "closeContent"
	// Dev-only
	| "crtGradient"
	| "toggleExplosion"
	| "togglePartialExplosion"
	| "toggleTerminal"
	| "toggleTransition"
	| "debugBowl"
	| "debugMountain"

export type KeybindMap = Partial<Record<KeybindAction, string>>

export type ActionHandler = () => void
export type HandlerRegistry = Partial<Record<KeybindAction, ActionHandler>>

// --- Views / Data ---

/** Generic tile data — sourced from DOM data attributes or a JSON API */
export interface TileData {
	title: string
	body: string
}

/** WordPress REST API post shape (subset of fields used for rendering) */
export interface WordPressPost {
	id: number
	slug: string
	title: { rendered: string }
	excerpt: { rendered: string }
	content: { rendered: string }
}

// --- Animations ---

export type TransitionCallback = () => void

export interface ViewTransitionLike {
	finished: Promise<void>
}

// --- Fetch ---

export type FetchStrategy = "json" | "wordpress"

export interface FetchConfig {
	strategy: FetchStrategy
	/**
	 * For "json": path or URL to the JSON data file (e.g. "/data/tiles.json")
	 * For "wordpress": base URL of the WordPress site (e.g. "https://example.com")
	 *   — REST API endpoints will be derived automatically.
	 */
	apiUrl: string
}
