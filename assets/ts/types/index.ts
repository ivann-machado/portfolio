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
	date: string
	link: string
	featured_media: number
}

// --- Tile Registry ---

/** Positional key used to address a tile in the grid, e.g. "2:3" */
export type TileKey = `${number}:${number}`

/**
 * Determines what happens when a tile is opened:
 * - "post" → expands the central tile into fullscreen content view
 * - "list" → re-renders the grid with a new set of tiles from the linked URL
 */
export type TileActionType = "post" | "list"

/** What is displayed inside the tile and in the fullscreen view */
export interface TileContent {
	title: string
	/** HTML string or plain text rendered as the tile body */
	body: string
}

/** Where opening the tile navigates, and how */
export interface TileLink {
	url: string
	type: TileActionType
}

/** Full data record for a single grid tile */
export interface TileRecord {
	/** Live DOM reference to the tile element */
	el: HTMLElement
	/** Grid row (-2 to 2) */
	row: number
	/** Grid column (-2 to 2) */
	col: number
	/** Display content — title for the label, body for fullscreen view */
	content: TileContent
	/** Navigation target */
	link: TileLink
	/** Raw WordPress post — present only for WP-sourced tiles */
	wpPost?: WordPressPost
}

// --- Animations ---

export type TransitionCallback = () => void

export interface ViewTransitionLike {
	finished: Promise<void>
}

// --- Fetch ---

export interface FetchConfig {
	/** URL to the landing page JSON config (e.g. "/data/landing.json") */
	landingUrl: string
	/**
	 * Base URL for the WordPress REST API custom posts endpoint
	 * (e.g. "https://example.com/wp-json/wp/v2/portfolio")
	 */
	wordpressUrl: string
}

// --- Data ---

export interface TileConfig {
	row: number
	col: number
	content: TileContent
	link: TileLink
}

export interface TileListConfig {
	tiles: TileConfig[]
}

// --- Store ---

export interface AnimState {
	/** Whether the terminal panel is open */
	terminalOpen: boolean
	/** Current grid layout mode */
	gridMode: GridMode
	/** Last explosion shape used */
	gridShape: ExplosionShape
	/** Whether a tile open/close transition is in progress */
	isAnimating: boolean
	/** The currently keyboard/mouse-selected tile DOM element, or null */
	selectedTile: HTMLElement | null
	/** The positional key of the currently selected tile in the registry, or null */
	selectedKey: TileKey | null
	/** Whether the CRT glitch transition canvas loop is running */
	transitionLoopActive: boolean
	/** Whether the glitch transition is mid-frame (entry/sustain/exit) */
	transitionAnimating: boolean
	/**
	 * Snapshot of the landing page TileRecords — cached after first load so
	 * returning to the landing never triggers a network request.
	 */
	landingRecords: ReadonlyArray<TileRecord> | null
}

export type StoreListener<K extends keyof AnimState> = (
	next: AnimState[K],
	prev: AnimState[K],
) => void
