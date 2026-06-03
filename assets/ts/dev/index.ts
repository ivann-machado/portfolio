import {
    toggleTerminal,
    toggleExplosion,
    togglePartialExplosion,
} from "../controllers"
import { getTerminalOpenState, getGridMode } from "../store"
import { explosion, partialExplosion } from "../anims"
import * as store from "../store"


// Expose public API globally.
declare global {
    interface Window {
        toggleTerminal: typeof toggleTerminal
        toggleExplosion: typeof toggleExplosion
        togglePartialExplosion: typeof togglePartialExplosion
        explosion: typeof explosion
        partialExplosion: typeof partialExplosion
        getTerminalOpenState: typeof getTerminalOpenState
        getGridMode: typeof getGridMode
        glitchTransition: typeof glitchTransition
        toggleTransition: typeof toggleTransition
        startTransition: typeof startTransition
        stopTransition: typeof stopTransition
        store: typeof store
    }
}

window.toggleTerminal = toggleTerminal
window.toggleExplosion = toggleExplosion
window.togglePartialExplosion = togglePartialExplosion
window.explosion = explosion
window.partialExplosion = partialExplosion
window.getTerminalOpenState = getTerminalOpenState
window.getGridMode = getGridMode
window.store = store

import { glitchTransition, toggleTransition, startTransition, stopTransition } from "../anims/transition"
window.glitchTransition = glitchTransition
window.toggleTransition = toggleTransition
window.startTransition = startTransition
window.stopTransition = stopTransition
