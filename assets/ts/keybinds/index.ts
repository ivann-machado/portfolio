/**
 * keybinds/index.ts
 * Keyboard event manager.
 * Reads the action-to-key mapping from config and dispatches to registered handlers.
 * Actions with no mapping in config are silently ignored.
 * Dev actions can be registered separately and omitted in production.
 */

import type { KeybindAction, KeybindMap, HandlerRegistry } from "../types"
import { keybinds, devKeybinds } from "../config"

let registry: HandlerRegistry = {}
let activeKeymap: KeybindMap = {}

/**
 * Registers handlers for each action.
 */
export function registerHandlers(handlers: HandlerRegistry): void {
	registry = { ...registry, ...handlers }
}

/**
 * Activates the keybind system with the production keymap.
 * Call with `true` to also include dev keybinds.
 */
export function initKeybinds(includeDev = false): void {
	activeKeymap = includeDev
		? { ...keybinds, ...devKeybinds }
		: { ...keybinds }

	window.addEventListener("keydown", handleKeydown)
}

function handleKeydown(e: KeyboardEvent): void {
	const action = (Object.keys(activeKeymap) as KeybindAction[]).find(
		(a) => activeKeymap[a] === e.key
	)

	if (!action) return

	const handler = registry[action]
	if (handler) {
		e.preventDefault()
		handler()
	}
}
