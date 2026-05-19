/**
 * views/index.ts
 * Data rendering functions.
 * Provides two strategy-aware renderers: one for JSON data, one for WordPress API data.
 * The unified renderContent() picks the right one based on the active fetch strategy.
 */

import type { TileData, WordPressPost } from "../types"
import { fetchConfig } from "../config"
import { centralContentEl } from "../dom/elements"

// --- JSON Renderer ---

/**
 * Renders tile content sourced from the JSON API or DOM data attributes.
 */
export function renderJsonContent(data: TileData): void {
	centralContentEl.innerHTML = `<h2>${data.title}</h2><p>${data.body}</p>`
}

// --- WordPress Renderer ---

/**
 * Renders tile content sourced from a WordPress REST API post.
 */
export function renderWordPressContent(post: WordPressPost): void {
	centralContentEl.innerHTML = `
		<h2>${post.title.rendered}</h2>
		<div class="wp-content">${post.content.rendered}</div>
	`
}

// --- Strategy-Aware Unified Renderer ---

/**
 * Renders content using the renderer that matches the active fetch strategy.
 * Controlled by fetchConfig.strategy in config/fetch.settings.ts.
 */
export function renderContent(data: TileData | WordPressPost): void {
	if (fetchConfig.strategy === "wordpress") {
		renderWordPressContent(data as WordPressPost)
	} else {
		renderJsonContent(data as TileData)
	}
}

// --- Data Extraction ---

/**
 * Extracts tile content metadata from a tile element's HTML data attributes.
 * Used as the primary source in JSON mode and as a fallback in WordPress mode.
 */
export function getTileData(tile: HTMLElement): TileData {
	return {
		title: tile.dataset["contentTitle"] ?? tile.dataset["content"] ?? "Project",
		body: tile.dataset["contentBody"] ?? "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.",
	}
}
