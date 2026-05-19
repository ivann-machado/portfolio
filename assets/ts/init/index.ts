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
	closeContent,
	toggleExplosion,
	togglePartialExplosion,
	toggleTerminal,
	isTerminalOpen,
	getGridMode,
	setGridShape
} from "../controllers"
import { explosion, partialExplosion, crtGradient } from "../anims"
import { terminalEl } from "../dom/elements"
import { registerHandlers, initKeybinds } from "../keybinds"
import { registerListeners } from "./listeners"

// --- Event Listeners ---
registerListeners()

// --- Keybind Registration ---
registerHandlers({
	closeContent,
	// Dev handlers
	crtGradient,
	toggleExplosion,
	togglePartialExplosion,
	toggleTerminal,
	debugBowl: () => setGridShape("bowl"),
	debugMountain: () => setGridShape("mountain"),
})

// ###################################################
// ################# Launch Sequence #################
// ###################################################

declare const IS_DEV: boolean
initKeybinds(IS_DEV)
toggleTerminal()

// On terminal animation end, close the terminal
const onTerminalAnimEnd = (e: AnimationEvent) => {
	if (e.target === terminalEl) {
		setTimeout(() => {
			toggleTerminal()
			terminalEl.removeEventListener("animationend", onTerminalAnimEnd)
			crtGradient()
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
