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
	setGridShape
} from "../controllers"
import { crtGradient } from "../anims"
import { registerHandlers, initKeybinds } from "../keybinds"
import { registerListeners, terminalAnimEnd } from "./listeners"
import { sleep } from "../utils"

import { toggleTransition, startTransition, stopTransition } from "../anims/transition"

if (IS_DEV) {
	import("../dev")
}
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
	toggleTransition,
	debugBowl: () => setGridShape("bowl"),
	debugMountain: () => setGridShape("mountain"),
})

// ###################################################
// ################# Launch Sequence #################
// ###################################################

declare const IS_DEV: boolean
initKeybinds(IS_DEV)
toggleTerminal()

await terminalAnimEnd

startTransition()

await sleep(250)

toggleTerminal()
crtGradient()
stopTransition()
