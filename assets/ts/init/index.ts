/**
 * init/index.ts
 * Application choreographer and entry point.
 *
 * Wires up event listeners, orchestrates the initial launch sequence,
 * and exposes the global API.
 */

import "css-media-vars"
import "augmented-ui/augmented-ui.min.css"
import "../../css/main.css"
import {
	openContent,
	closeContent,
	toggleExplosion,
	togglePartialExplosion,
	toggleTerminal,
	isTerminalOpen,
	getGridMode,
	moveSelection,
	triggerSelected,
	setGridShape,
} from "../controllers"
import { explosion, partialExplosion } from "../anims"
import { wrap3dEl, centralTileEl, backBtnEl, terminalEl } from "../views"
import { registerHandlers, initKeybinds } from "../keybinds"

// --- Event Listeners ---

wrap3dEl.addEventListener("click", (e) => {
	const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-augmented-ui]")
	if (tile && !centralTileEl.classList.contains("fullscreen")) {
		// Enforcement: Only "inner-tile" is clickable in partial-explosion mode
		const mode = getGridMode()
		if (mode === "collapsed") {
			return
		}
		if (mode === "partial-explosion" && !tile.classList.contains("inner-tile")) {
			return
		}
		openContent(tile)
	}
})

backBtnEl.addEventListener("click", () => {
	closeContent()
})

// Keyboard Navigation
window.addEventListener("keydown", (e) => {
	if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
		e.preventDefault()
		moveSelection(e.key as any)
	}
	if (e.key === "Enter") {
		e.preventDefault()
		triggerSelected()
	}
})

// --- Keybind Registration ---

registerHandlers({
	toggleExplosion,
	togglePartialExplosion,
	toggleTerminal,
	closeContent,
	// Dev handlers
	debugBowl: () => setGridShape("bowl"),
	debugMountain: () => setGridShape("mountain"),
})

// --- Launch Sequence ---
declare const IS_DEV: boolean
initKeybinds(IS_DEV)
toggleTerminal()

// Reveal the page (body starts with display:none in HTML)
document.body.style.display = ""

// On terminal animation end, close the terminal
const onTerminalAnimEnd = (e: AnimationEvent) => {
	if (e.target === terminalEl) {
		setTimeout(() => {
			toggleTerminal()
			terminalEl.removeEventListener("animationend", onTerminalAnimEnd)
		}, 250)
	}
}
terminalEl.addEventListener("animationend", onTerminalAnimEnd)

// Expose public API globally in dev only.
// declare global is top-level only (TypeScript requirement) — it emits no JS.
declare global {
	interface Window {
		toggleTerminal: typeof toggleTerminal
		toggleExplosion: typeof toggleExplosion
		togglePartialExplosion: typeof togglePartialExplosion
		explosion: typeof explosion
		partialExplosion: typeof partialExplosion
		isTerminalOpen: typeof isTerminalOpen
		getGridMode: typeof getGridMode
	}
}

if (IS_DEV) {
	window.toggleTerminal = toggleTerminal
	window.toggleExplosion = toggleExplosion
	window.togglePartialExplosion = togglePartialExplosion
	window.explosion = explosion
	window.partialExplosion = partialExplosion
	window.isTerminalOpen = isTerminalOpen
	window.getGridMode = getGridMode
}
