/**
 * views/index.ts
 * Data rendering functions.
 *
 * Two renderers: one for local JSON content, one for WordPress REST API posts.
 * The unified renderContent() picks the right one by inspecting the data shape
 * (duck typing on title.rendered vs title: string), so no global strategy flag
 * is needed — each piece of data carries its own identity.
 */

import type { TileData, TileContent, WordPressPost } from "../types"
import { centralContentEl } from "../dom/elements"

// --- Type guard ---

function isWordPressPost(data: TileContent | WordPressPost): data is WordPressPost {
	return typeof (data as WordPressPost).title === "object"
}

// --- JSON / local-content Renderer ---

/**
 * Renders tile content sourced from the local JSON config.
 */
export function renderJsonContent(data: TileData): void {
	centralContentEl.innerHTML = `
		<article class="project-post project-post--local">
			<header class="project-post__header">
				<h1 class="project-post__title">${data.title}</h1>
			</header>
			<div class="project-post__body">${data.body}</div>
		</article>
	`
}

// --- WordPress Renderer ---

/**
 * Renders a WordPress REST API post into the central content pane.
 * Formats the publish date in French locale and displays the full
 * post content (content.rendered), which already contains WP block HTML.
 */
export function renderWordPressContent(post: WordPressPost): void {
	const publishedDate = post.date
		? new Intl.DateTimeFormat("fr-FR", {
			year: "numeric",
			month: "short",
			day: "2-digit",
		}).format(new Date(post.date))
		: null

	centralContentEl.innerHTML = `
		<article class="project-post project-post--wordpress" data-post-slug="${post.slug}">
			<header class="project-post__header">
				<h1 class="project-post__title">${post.title.rendered}</h1>
				${publishedDate ? `<span class="project-post__date">${publishedDate}</span>` : ""}
			</header>
			<div class="project-post__body wp-content">${post.content.rendered}</div>
		</article>
	`
}

// --- Strategy-Aware Unified Renderer ---

/**
 * Renders content using the renderer that matches the data shape.
 * - WordPressPost (title.rendered object)  → renderWordPressContent
 * - TileContent   (title: string)          → renderJsonContent
 */
export function renderContent(data: TileContent | WordPressPost): void {
	if (isWordPressPost(data)) {
		renderWordPressContent(data)
	} else {
		renderJsonContent(data as TileData)
	}
}

// --- Data Extraction ---

/**
 * Extracts tile content metadata from a tile element's HTML data attributes.
 * Used as a fallback when no store record is found.
 */
export function getTileData(tile: HTMLElement): TileData {
	return {
		title: tile.dataset["contentTitle"] ?? tile.dataset["content"] ?? "Project",
		body: tile.dataset["contentBody"] ?? "",
	}
}
