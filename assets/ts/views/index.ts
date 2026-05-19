/**
 * views/index.ts
 * DOM element references and data rendering functions.
 * Provides two strategy-aware renderers: one for JSON data, one for WordPress API data.
 * The unified renderContent() picks the right one based on the active fetch strategy.
 */

import type { TileData, WordPressPost } from "../types"
import { fetchConfig } from "../config"

// --- DOM Element References ---

export const mainFrameEl = document.querySelector("#main") as HTMLElement
export const terminalFrameEl = document.querySelector("#terminal-frame") as HTMLElement
export const terminalEl = document.querySelector("#terminal") as HTMLElement
export const termCmdEl = document.querySelector("#term-cmd") as HTMLElement

export const crtOverlay = document.querySelector(".crt-overlay") as HTMLElement

export const centralTileEl = document.querySelector("#central-tile") as HTMLElement
export const centralContentEl = document.querySelector("#central-content") as HTMLElement
export const backBtnEl = document.querySelector("#back-btn") as HTMLButtonElement
export const wrap3dEl = document.querySelector("#wrap3d") as HTMLElement

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
