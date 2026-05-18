/**
 * anims/index.ts
 * Animation trigger functions.
 * Responsible only for triggering CSS transitions and managing
 * animation-related class changes and state.
 */

import type { TransitionCallback, ViewTransitionLike, ExplosionShape, GridMode } from "../types"
import {
	centralTileEl,
	backBtnEl,
	wrap3dEl,
	mainFrameEl,
	terminalFrameEl,
	terminalEl,
	termCmdEl
} from "../views"

// --- State ---

let terminalOpen = false
let currentGridMode: GridMode = "collapsed"

// --- Terminal Animations ---

export function terminal(bool: boolean): boolean {
	terminalOpen = bool
	terminalFrameEl.className = terminalOpen ? "open" : ""
	terminalEl.className = terminalOpen ? "open" : ""
	termCmdEl.className = terminalOpen ? "open" : ""
	return terminalOpen
}

export function isTerminalOpen(): boolean { return terminalOpen }

// --- Grid Animations ---

export function explosion(bool: boolean, shape: ExplosionShape = "mountain"): void {
	mainFrameEl.classList.remove("explosion", "partial-explosion", "bowl", "mountain")
	if (bool) {
		mainFrameEl.classList.add("explosion", shape)
		currentGridMode = "explosion"
	} else {
		currentGridMode = "collapsed"
	}
}

export function partialExplosion(bool: boolean, shape: ExplosionShape = "mountain"): void {
	mainFrameEl.classList.remove("explosion", "partial-explosion", "bowl", "mountain")
	if (bool) {
		mainFrameEl.classList.add("partial-explosion", shape)
		currentGridMode = "partial-explosion"
	} else {
		currentGridMode = "collapsed"
	}
}

export function getGridMode(): GridMode { return currentGridMode }

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
	document.body.appendChild(centralTileEl)
}

/**
 * Moves the central tile back into the 3D grid.
 */
export function mountTileToGrid(): void {
	wrap3dEl.appendChild(centralTileEl)
}
