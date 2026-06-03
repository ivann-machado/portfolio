/**
 * anims/index.ts
 * Animation trigger functions.
 * Responsible only for triggering CSS transitions and managing
 * animation-related class changes and state.
 */

import type { TransitionCallback, ViewTransitionLike, ExplosionShape } from "../types"
import {
	screenWrap,
	centralTileEl,
	backBtnEl,
	wrap3dEl,
	mainFrameEl,
	terminalFrameEl,
	terminalEl,
	termCmdEl,
	crtOverlay
} from "../dom/elements"
import {
	setTerminalOpenState,
	setGridMode,
	setGridShape,
	getGridShape,
	getSelectedTile
} from "../store"

// --- CRT Animations ---

export function crtGradient(): void {
	crtOverlay.style.setProperty("--green-gradient-value", "0.02")
}

// --- Terminal Animations ---

export function terminal(bool: boolean): boolean {
	setTerminalOpenState(bool)
	terminalFrameEl.className = bool ? "open" : ""
	terminalEl.className = bool ? "open" : ""
	termCmdEl.className = bool ? "open" : ""
	return bool
}


// --- Grid Animations ---

export function explosion(bool: boolean, shape: ExplosionShape = getGridShape()): void {
	mainFrameEl.classList.remove("explosion", "partial-explosion", "bowl", "mountain")
	//remove selected class from tile if any
	getSelectedTile()?.classList.remove("selected")
	if (bool) {
		mainFrameEl.classList.add("explosion", shape)
		setGridMode("explosion")
		setGridShape(shape)
	} else {
		setGridMode("collapsed")
	}
}

export function partialExplosion(bool: boolean, shape: ExplosionShape = "mountain"): void {
	mainFrameEl.classList.remove("explosion", "partial-explosion", "bowl", "mountain")
	if (bool) {
		mainFrameEl.classList.add("partial-explosion", shape)
		setGridMode("partial-explosion")
		setGridShape(shape)
	} else {
		setGridMode("collapsed")
	}
}


// --- Tile Animations ---

export function popTile(): void {
	centralTileEl.classList.add("popped")
}

export function unPopTile(): void {
	centralTileEl.classList.remove("popped")
}

export function freezeTransition(): void {
	centralTileEl.classList.add("notransition")
}

export function unfreezeTransition(): void {
	centralTileEl.classList.remove("notransition")
}

export function enterFullscreen(): void {
	centralTileEl.classList.add("fullscreen")
	backBtnEl.classList.remove("hidden")
}

export function exitFullscreen(): void {
	centralTileEl.classList.remove("fullscreen")
	backBtnEl.classList.add("hidden")
}

// --- View Transition Helper ---

/**
 * Runs a DOM mutation inside a View Transition if supported,
 * otherwise executes it immediately and returns a resolved promise.
 */
export function runViewTransition(callback: TransitionCallback): ViewTransitionLike {
	if (document.startViewTransition) {
		return document.startViewTransition(callback) as ViewTransitionLike
	}
	callback()
	return { finished: Promise.resolve() }
}

/**
 * Moves the central tile into the document body for fullscreen display.
 */
export function mountTileToBody(): void {
	screenWrap.appendChild(centralTileEl)
}

/**
 * Moves the central tile back into the 3D grid.
 */
export function mountTileToGrid(): void {
	wrap3dEl.appendChild(centralTileEl)
}
