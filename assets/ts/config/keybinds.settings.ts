/**
 * keybinds.settings.ts
 * Maps named actions to keyboard keys.
 * Actions not listed here will have no keybind.
 * Dev-only actions can be added here and stripped in production builds.
 */

import type { KeybindMap } from "../types"

/** Production keybinds */
export const keybinds: KeybindMap = {
	closeContent: "Escape",
}

/** Dev-only keybinds — merged on top of production in non-prod builds */
export const devKeybinds: KeybindMap = {
	toggleExplosion: "e",
	togglePartialExplosion: "p",
	toggleTerminal: "t",
	crtGradient: "g",
	debugBowl: "b",
	debugMountain: "m",
}
