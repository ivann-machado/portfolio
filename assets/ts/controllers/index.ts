/**
 * controllers/index.ts
 * Core logic controllers.
 * Orchestrates what animations to perform on actions, what data to fetch, and what to render.
 */

import type { ExplosionShape } from "../types"
import {
	explosion,
	partialExplosion,
	terminal,
	getGridMode,
	isTerminalOpen,
	popTile,
	unPopTile,
	freezeTransition,
	unfreezeTransition,
	enterFullscreen,
	exitFullscreen,
	runViewTransition,
	mountTileToBody,
	mountTileToGrid,
} from "../anims"
import { centralTileEl, wrap3dEl } from "../dom/elements"
import { getTileData, renderContent } from "../views"
import { fetchConfig } from "../config"

// --- Animation Timing Constants ---
const COLLAPSE_DURATION_MS = 700
const POP_DURATION_MS = 550

let isAnimating = false

// --- Toggle Logic ---

export function toggleTerminal(): void {
	terminal(!isTerminalOpen())
}

export function toggleExplosion(shape: ExplosionShape = "mountain"): void {
	const currentMode = getGridMode()
	explosion(currentMode !== "explosion", shape)
	clearSelection()
}

export function togglePartialExplosion(shape: ExplosionShape = "mountain"): void {
	const currentMode = getGridMode()
	partialExplosion(currentMode !== "partial-explosion", shape)
	clearSelection()
}


export function setGridShape(shape: ExplosionShape): void {
	const mode = getGridMode()
	if (mode === "explosion") {
		explosion(true, shape)
	} else if (mode === "partial-explosion") {
		partialExplosion(true, shape)
	}
}

// --- Content Interaction Logic ---

export async function openContent(tile: HTMLElement): Promise<void> {
	if (isAnimating) return

	// Check if clickable based on grid mode
	const mode = getGridMode()
	if (mode === "collapsed") {
		return
	}
	if (mode === "partial-explosion" && !tile.classList.contains("inner-tile")) {
		return
	}

	isAnimating = true

	clearSelection()

	// 1. Trigger grid collapse animation
	explosion(false)

	// 2. Decide what to fetch based on config
	let data
	if (fetchConfig.strategy === "wordpress") {
		data = getTileData(tile)
	} else {
		data = getTileData(tile)
	}

	// 3. Render Data
	renderContent(data)

	// 4. Orchestrate fullscreen transition timing
	setTimeout(() => {
		popTile()

		setTimeout(() => {
			freezeTransition()

			const transition = runViewTransition(() => {
				mountTileToBody()
				enterFullscreen()
			})

			transition.finished.then(() => {
				unfreezeTransition()
				isAnimating = false
			})
		}, POP_DURATION_MS)
	}, COLLAPSE_DURATION_MS)
}

export function closeContent(): void {
	if (isAnimating) return
	isAnimating = true

	freezeTransition()

	const transition = runViewTransition(() => {
		mountTileToGrid()
		exitFullscreen()
	})

	transition.finished.then(() => {
		unfreezeTransition()

		setTimeout(() => {
			unPopTile()

			setTimeout(() => {
				explosion(true)
				isAnimating = false
			}, POP_DURATION_MS)
		}, 100)
	})
}

// --- Selection / Keyboard Navigation Logic ---

let selectedTile: HTMLElement | null = null

export function clearSelection(): void {
	if (selectedTile) {
		selectedTile.classList.remove("selected")
		selectedTile = null
	}
}

export function selectTile(tile: HTMLElement | null, scroll = false): void {
	if (centralTileEl.classList.contains("fullscreen")) return

	const mode = getGridMode()
	if (mode === "collapsed") return

	if (selectedTile) {
		selectedTile.classList.remove("selected")
	}

	selectedTile = tile
	if (selectedTile) {
		if (mode === "partial-explosion" && !selectedTile.classList.contains("inner-tile")) {
			selectedTile = null
			return
		}
		selectedTile.classList.add("selected")
		if (scroll) {
			selectedTile.scrollIntoView({ behavior: "smooth", block: "center" })
		}
	}
}

export function moveSelection(direction: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight"): void {
	if (centralTileEl.classList.contains("fullscreen")) return

	const mode = getGridMode()
	if (mode === "collapsed") return

	const tiles = Array.from(wrap3dEl.querySelectorAll<HTMLElement>("[data-augmented-ui]"))

	// Filter tiles based on current grid mode
	const availableTiles = mode === "partial-explosion"
		? tiles.filter(t => t.classList.contains("inner-tile"))
		: tiles

	if (availableTiles.length === 0) return

	if (!selectedTile || !availableTiles.includes(selectedTile)) {
		selectTile(availableTiles[0], true)
		return
	}

	const currentRow = parseInt(selectedTile.style.getPropertyValue("--row") || "0")
	const currentCol = parseInt(selectedTile.style.getPropertyValue("--col") || "0")

	let nextRow = currentRow
	let nextCol = currentCol

	if (direction === "ArrowUp") nextRow--
	if (direction === "ArrowDown") nextRow++
	if (direction === "ArrowLeft") nextCol--
	if (direction === "ArrowRight") nextCol++

	// Find the tile closest to the target coordinates
	const nextTile = availableTiles.find(t => {
		const r = parseInt(t.style.getPropertyValue("--row") || "0")
		const c = parseInt(t.style.getPropertyValue("--col") || "0")
		return r === nextRow && c === nextCol
	})

	if (nextTile) {
		selectTile(nextTile, true)
	}
}

export function triggerSelected(): void {
	if (selectedTile) {
		openContent(selectedTile)
	}
}

// Re-export state getters if needed by external scripts
export { isTerminalOpen, getGridMode }
