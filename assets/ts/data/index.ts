/**
 * data/index.ts
 * Tile list loader and parser.
 *
 * Fetches a tile list, detects whether the source is a local JSON config or a
 * WordPress REST API, and populates the store registry accordingly.
 * Also injects each tile's title label into its DOM element.
 *
 * Landing tiles are cached in the store after the first load so that returning
 * to the menu never triggers a second network request.
 */

import type { TileContent, TileLink, TileRecord, WordPressPost } from "../types"
import { fetchConfig } from "../config"
import {
	registerTile,
	clearTiles,
	getAllTiles,
	getLandingRecords,
	setLandingRecords,
} from "../store"

import { wrap3dEl } from "../dom/elements"

// ---------------------------------------------------------------------------
// JSON config shape (mirrors public/data/landing.json)
// ---------------------------------------------------------------------------

interface TileConfig {
	row: number
	col: number
	content: TileContent
	link: TileLink
}

interface TileListConfig {
	tiles: TileConfig[]
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch a tile list and populate the registry.
 *
 * Resolution order:
 *   1. Landing URL + cached records → instant restore, no network call
 *   2. WordPress URL               → fetch posts, parseWordPressPosts()
 *   3. Any other URL               → fetch JSON config, parseTileConfig()
 *      After loading landing JSON for the first time, records are cached.
 */
export async function loadTileList(url: string): Promise<void> {
	const isLanding = url === fetchConfig.landingUrl
	const isWordPress = !isLanding && url.startsWith(fetchConfig.wordpressUrl)

	// Fast path: restore landing from the store cache (no network request)
	if (isLanding) {
		const cached = getLandingRecords()
		if (cached) {
			restoreLanding(cached)
			return
		}
	}

	const res = await fetch(url)
	if (!res.ok) {
		console.error(`[tiles] Failed to load tile config from "${url}": ${res.status}`)
		return
	}

	if (isWordPress) {
		const posts: WordPressPost[] = await res.json()
		console.log(`[tiles] WP response: ${posts.length} post(s)`)
		parseWordPressPosts(posts)
	} else {
		const config: TileListConfig = await res.json()
		parseTileConfig(config)
		// Cache landing records so future menu-returns are instant
		if (isLanding) {
			setLandingRecords(Array.from(getAllTiles().values()))
		}
	}
}

// ---------------------------------------------------------------------------
// Parsers
// ---------------------------------------------------------------------------

/**
 * Parse a local JSON tile-list config and populate the registry.
 * Tiles are matched to DOM elements by their explicit row/col coordinates.
 */
function parseTileConfig(config: TileListConfig): void {
	clearTileDecorations()
	clearTiles()

	// Locate elements based on explicit coordinates
	// Only use direct children to prevent nested augmented elements (e.g. back-btn) from hijacking the pool
	const domTiles = Array.from(wrap3dEl.children)
		.filter(el => el.hasAttribute("data-augmented-ui")) as HTMLElement[]

	for (const entry of config.tiles) {
		const el = domTiles.find(t => {
			const row = parseInt(t.style.getPropertyValue("--row"))
			const col = parseInt(t.style.getPropertyValue("--col"))
			return row === entry.row && col === entry.col
		})

		if (!el) {
			console.warn(`[tiles] No DOM element at (${entry.row}, ${entry.col}) — skipping`)
			continue
		}

		const record: TileRecord = {
			el,
			row: entry.row,
			col: entry.col,
			content: entry.content,
			link: entry.link,
		}

		registerTile(record)
		renderTileLabel(record)
	}
}

/**
 * Restore the landing grid from cached TileRecords.
 * DOM element references in the records remain valid across list transitions.
 */
function restoreLanding(records: ReadonlyArray<TileRecord>): void {
	clearTileDecorations()
	clearTiles()
	for (const record of records) {
		registerTile(record)
		renderTileLabel(record)
	}
}

/**
 * Parse an array of WordPress REST API posts and populate the registry.
 *
 * Layout strategy:
 *   ≤ CENTER_PRIORITY_THRESHOLD posts → centerFirst() (inner 3×3 area)
 *   > CENTER_PRIORITY_THRESHOLD posts → spreadTiles() (even distribution)
 *
 * The bottom-left corner (row=2, col=-2) is always reserved as a "← Menu"
 * navigation tile. The central tile (#central-tile) is excluded entirely.
 */
function parseWordPressPosts(posts: WordPressPost[]): void {
	clearTileDecorations()
	clearTiles()

	// Collect all interactive tiles, exclude the fullscreen central tile
	// Only use direct children to prevent nested augmented elements (e.g. back-btn) from hijacking the pool
	const allTiles = Array.from(wrap3dEl.children)
		.filter(el => el.hasAttribute("data-augmented-ui") && el.id !== "central-tile") as HTMLElement[]

	console.log(`[tiles] allTiles found: ${allTiles.length}`)

	// Sort row-major (top-left → bottom-right) for deterministic layout
	allTiles.sort(byRowMajor)

	// Reserve the bottom-left corner as the landing-return tile
	const homeEl = allTiles.find(el =>
		parseInt(cssVar(el, "--row")) === 2 &&
		parseInt(cssVar(el, "--col")) === -2
	) ?? allTiles[allTiles.length - 1]

	const postPool = allTiles.filter(el => el !== homeEl)
	console.log(`[tiles] postPool: ${postPool.length}, home at row=${cssVar(homeEl, "--row")} col=${cssVar(homeEl, "--col")}`)

	// --- Register the "← Menu" home tile ---
	const homeRow = parseInt(cssVar(homeEl, "--row") || "0")
	const homeCol = parseInt(cssVar(homeEl, "--col") || "0")
	const homeRecord: TileRecord = {
		el: homeEl,
		row: homeRow,
		col: homeCol,
		content: { title: "← Menu", body: "" },
		link: { url: fetchConfig.landingUrl, type: "list" },
	}
	homeEl.classList.add("tile--home")
	registerTile(homeRecord)
	renderTileLabel(homeRecord)

	// --- Select post tiles using the appropriate layout strategy ---
	const selectedTiles = posts.length <= CENTER_PRIORITY_THRESHOLD
		? centerFirst(postPool, posts.length)
		: spreadTiles(postPool, posts.length)



	for (let i = 0; i < posts.length && i < selectedTiles.length; i++) {
		const post = posts[i]
		const el = selectedTiles[i]

		const row = parseInt(cssVar(el, "--row") || "0")
		const col = parseInt(cssVar(el, "--col") || "0")

		const record: TileRecord = {
			el,
			row,
			col,
			content: {
				title: post.title.rendered,
				body: post.content.rendered,
			},
			link: {
				url: post.link,
				type: "post",
			},
			wpPost: post,
		}

		registerTile(record)
		renderTileLabel(record)
	}
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

/**
 * When post count is ≤ this threshold, tiles are placed center-first
 * (nearest to grid origin) instead of spread across the full pool.
 * 9 covers the inner 3×3 ring — the most visually prominent 3D area.
 */
const CENTER_PRIORITY_THRESHOLD = 9

/** Removes .tile--home markers and all injected .tile-label spans from DOM. */
function clearTileDecorations(): void {
	wrap3dEl.querySelectorAll(".tile--home").forEach(el => el.classList.remove("tile--home"))
	wrap3dEl.querySelectorAll(".tile-label").forEach(el => el.remove())
}

/**
 * Read a CSS custom property from an element.
 * Uses getComputedStyle first (cascade-aware), falls back to el.style.
 * Trims whitespace — some browsers return " 2" with a leading space.
 */
function cssVar(el: HTMLElement, prop: string): string {
	return (
		getComputedStyle(el).getPropertyValue(prop).trim() ||
		el.style.getPropertyValue(prop).trim()
	)
}

/** Row-major sort comparator: top-left → bottom-right. */
function byRowMajor(a: HTMLElement, b: HTMLElement): number {
	const rowA = parseInt(cssVar(a, "--row") || "0")
	const rowB = parseInt(cssVar(b, "--row") || "0")
	const colA = parseInt(cssVar(a, "--col") || "0")
	const colB = parseInt(cssVar(b, "--col") || "0")
	return rowA !== rowB ? rowA - rowB : colA - colB
}

/**
 * Picks the N tiles closest to the grid center (0,0) by Euclidean distance.
 * For ties, the row-major order of the postPool is preserved (stable pick).
 * Used for small post counts so content appears in the most prominent 3D area.
 */
function centerFirst(available: HTMLElement[], count: number): HTMLElement[] {
	return [...available]
		.sort((a, b) => {
			const rowA = parseInt(cssVar(a, "--row") || "0")
			const colA = parseInt(cssVar(a, "--col") || "0")
			const rowB = parseInt(cssVar(b, "--row") || "0")
			const colB = parseInt(cssVar(b, "--col") || "0")
			return (rowA * rowA + colA * colA) - (rowB * rowB + colB * colB)
		})
		.slice(0, count)
}

/**
 * Distributes N items evenly across a pool of M available tiles using
 * stratified sampling, ensuring tiles are never adjacent or clumped.
 *
 * For count=1 picks the center of the pool.
 * For count≥M uses all tiles.
 * Otherwise: index_i = round(i × (M-1) / (N-1)) for i = 0 … N-1
 */
function spreadTiles(available: HTMLElement[], count: number): HTMLElement[] {
	if (count <= 0) return []
	if (count >= available.length) return available
	if (count === 1) return [available[Math.floor(available.length / 2)]]

	return Array.from({ length: count }, (_, i) =>
		available[Math.round(i * (available.length - 1) / (count - 1))]
	)
}

/**
 * Injects (or updates) a title label span inside a tile element.
 * The span carries class "tile-label" so CSS can control its visibility.
 */
function renderTileLabel(record: TileRecord): void {
	let label = record.el.querySelector<HTMLElement>(".tile-label")
	if (!label) {
		label = document.createElement("span")
		label.className = "tile-label"
		record.el.appendChild(label)
	}
	label.textContent = record.content.title
}
