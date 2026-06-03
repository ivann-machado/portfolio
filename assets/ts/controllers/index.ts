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
import {
	startTransition,
	stopTransition
} from "../anims/transition"

import {
	getIsAnimating,
	setIsAnimating,
	getSelectedTile,
	setSelectedTile,
	getTerminalOpenState,
	getGridMode,
	getGridShape,
	getTileByEl,
} from "../store"
import { centralTileEl, wrap3dEl } from "../dom/elements"
import { renderContent } from "../views"
import { loadTileList } from "../data"

// --- Animation Timing Constants ---
const COLLAPSE_DURATION_MS = 700
const POP_DURATION_MS = 550

// --- Toggle Logic ---

export function toggleTerminal(): void {
	terminal(!getTerminalOpenState())
}

export function toggleExplosion(shape: ExplosionShape = getGridShape()): void {
	const currentMode = getGridMode()
	explosion(currentMode !== "explosion", shape)
	clearSelection()
}

export function togglePartialExplosion(shape: ExplosionShape = getGridShape()): void {
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
	if (getIsAnimating()) return

	// Check if clickable based on grid mode
	const mode = getGridMode()
	if (mode === "collapsed") return
	if (mode === "partial-explosion" && !tile.classList.contains("inner-tile")) return

	// Resolve the data record — unregistered tiles are decorative, skip them
	const record = getTileByEl(tile)
	if (!record) return

	setIsAnimating(true)
	clearSelection()

	// --- List tile: swap out the grid with a new tile set ---
	if (record.link.type === "list") {
		const transitionStart = performance.now()
		startTransition()

		await loadTileList(record.link.url)

		const elapsed = performance.now() - transitionStart
		const minDuration = 300
		if (elapsed < minDuration) {
			await new Promise(resolve => setTimeout(resolve, minDuration - elapsed))
		}

		stopTransition()
		setIsAnimating(false)
		return
	}

	// --- Post tile: fullscreen content view ---

	// 1. Collapse the grid
	explosion(false)

	// 2. Render the tile's content into the central pane
	renderContent(record.wpPost ?? record.content)

	// 3. Orchestrate fullscreen transition timing
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
				setIsAnimating(false)
			})
		}, POP_DURATION_MS)
	}, COLLAPSE_DURATION_MS)
}

export function closeContent(): void {
	if (getIsAnimating()) return
	setIsAnimating(true)

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
				setIsAnimating(false)
			}, POP_DURATION_MS)
		}, 100)
	})
}

// --- Selection / Keyboard Navigation Logic ---

export function clearSelection(): void {
	const current = getSelectedTile()
	if (current) {
		current.classList.remove("selected")
		setSelectedTile(null)
	}
}

export function selectTile(tile: HTMLElement | null, scroll = false): void {
	if (centralTileEl.classList.contains("fullscreen")) return

	const mode = getGridMode()
	if (mode === "collapsed") return

	const current = getSelectedTile()
	if (current) {
		current.classList.remove("selected")
	}

	if (tile) {
		if (mode === "partial-explosion" && !tile.classList.contains("inner-tile")) {
			clearSelection()
			return
		}
		if (!getTileByEl(tile)) {
			clearSelection()
			return
		}
		tile.classList.add("selected")
		if (scroll) {
			tile.scrollIntoView({ behavior: "smooth", block: "center" })
		}
	}

	setSelectedTile(tile)
}

export function hoverTile(tile: HTMLElement | null): void {
	if (centralTileEl.classList.contains("fullscreen")) return

	const mode = getGridMode()
	if (mode === "collapsed") return

	selectTile(tile)
}

export function unhoverTile(tile: HTMLElement | null): void {
	if (tile) {
		tile.classList.remove("selected")
		if (tile === getSelectedTile()) {
			setSelectedTile(null)
		}
	}
}

export function moveSelection(direction: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight"): void {
	if (centralTileEl.classList.contains("fullscreen")) return

	const mode = getGridMode()
	if (mode === "collapsed") return

	const tiles = Array.from(wrap3dEl.children)
		.filter(el => el.hasAttribute("data-augmented-ui")) as HTMLElement[]

	const availableTiles = (mode === "partial-explosion"
		? tiles.filter(t => t.classList.contains("inner-tile"))
		: tiles).filter(t => getTileByEl(t))

	if (availableTiles.length === 0) return

	const selected = getSelectedTile()
	if (!selected || !availableTiles.includes(selected)) {
		selectTile(availableTiles[0], true)
		return
	}

	const currentRow = parseInt(getComputedStyle(selected).getPropertyValue("--row") || selected.style.getPropertyValue("--row") || "0")
	const currentCol = parseInt(getComputedStyle(selected).getPropertyValue("--col") || selected.style.getPropertyValue("--col") || "0")

	let dRow = 0
	let dCol = 0

	if (direction === "ArrowUp") dRow = -1
	if (direction === "ArrowDown") dRow = 1
	if (direction === "ArrowLeft") dCol = -1
	if (direction === "ArrowRight") dCol = 1

	// Filter tiles that are strictly in the chosen direction
	const candidates = availableTiles.filter(t => {
		const r = parseInt(getComputedStyle(t).getPropertyValue("--row") || t.style.getPropertyValue("--row") || "0")
		const c = parseInt(getComputedStyle(t).getPropertyValue("--col") || t.style.getPropertyValue("--col") || "0")
		if (dRow === -1 && r >= currentRow) return false
		if (dRow === 1 && r <= currentRow) return false
		if (dCol === -1 && c >= currentCol) return false
		if (dCol === 1 && c <= currentCol) return false
		return true
	})

	if (candidates.length > 0) {
		candidates.sort((a, b) => {
			const rA = parseInt(getComputedStyle(a).getPropertyValue("--row") || a.style.getPropertyValue("--row") || "0")
			const cA = parseInt(getComputedStyle(a).getPropertyValue("--col") || a.style.getPropertyValue("--col") || "0")
			const rB = parseInt(getComputedStyle(b).getPropertyValue("--row") || b.style.getPropertyValue("--row") || "0")
			const cB = parseInt(getComputedStyle(b).getPropertyValue("--col") || b.style.getPropertyValue("--col") || "0")

			const distA_primary = Math.abs((rA - currentRow) * dRow + (cA - currentCol) * dCol)
			const distB_primary = Math.abs((rB - currentRow) * dRow + (cB - currentCol) * dCol)

			if (distA_primary !== distB_primary) return distA_primary - distB_primary

			const distA_secondary = Math.abs((rA - currentRow) * dCol + (cA - currentCol) * dRow)
			const distB_secondary = Math.abs((rB - currentRow) * dCol + (cB - currentCol) * dRow)

			return distA_secondary - distB_secondary
		})

		selectTile(candidates[0], true)
	}
}

export function triggerSelected(): void {
	const selected = getSelectedTile()
	if (selected) {
		openContent(selected)
	}
}
