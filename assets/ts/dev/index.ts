import {
    toggleTerminal,
    toggleExplosion,
    togglePartialExplosion,
    isTerminalOpen,
    getGridMode
} from "../controllers"
import { explosion, partialExplosion } from "../anims";


// Expose public API globally.
declare global {
    interface Window {
        toggleTerminal: typeof toggleTerminal
        toggleExplosion: typeof toggleExplosion
        togglePartialExplosion: typeof togglePartialExplosion
        explosion: typeof explosion
        partialExplosion: typeof partialExplosion
        isTerminalOpen: typeof isTerminalOpen
        getGridMode: typeof getGridMode
        glitchTransition: typeof glitchTransition
        toggleTransition: typeof toggleTransition
        startTransition: typeof startTransition
        stopTransition: typeof stopTransition
    }
}

window.toggleTerminal = toggleTerminal
window.toggleExplosion = toggleExplosion
window.togglePartialExplosion = togglePartialExplosion
window.explosion = explosion
window.partialExplosion = partialExplosion
window.isTerminalOpen = isTerminalOpen
window.getGridMode = getGridMode

import { glitchTransition, toggleTransition, startTransition, stopTransition } from "../anims/transition"
window.glitchTransition = glitchTransition
window.toggleTransition = toggleTransition
window.startTransition = startTransition
window.stopTransition = stopTransition
