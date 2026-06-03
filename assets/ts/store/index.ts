/**
 * store/index.ts
 * Central reactive state tree for animation and UI state.
 *
 * All mutable animation/UI state lives here. Consumers read via
 * getters and write via setters. Subscribers are notified on change.
 */

import type { GridMode, ExplosionShape, TileKey, TileRecord } from "../types"

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface AnimState {
    /** Whether the terminal panel is open */
    terminalOpen: boolean
    /** Current grid layout mode */
    gridMode: GridMode
    /** Last explosion shape used */
    gridShape: ExplosionShape
    /** Whether a tile open/close transition is in progress */
    isAnimating: boolean
    /** The currently keyboard/mouse-selected tile DOM element, or null */
    selectedTile: HTMLElement | null
    /** The positional key of the currently selected tile in the registry, or null */
    selectedKey: TileKey | null
    /** Whether the CRT glitch transition canvas loop is running */
    transitionLoopActive: boolean
    /** Whether the glitch transition is mid-frame (entry/sustain/exit) */
    transitionAnimating: boolean
    /**
     * Snapshot of the landing page TileRecords — cached after first load so
     * returning to the landing never triggers a network request.
     */
    landingRecords: ReadonlyArray<TileRecord> | null
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const state: AnimState = {
    terminalOpen: false,
    gridMode: "collapsed",
    gridShape: "mountain",
    isAnimating: false,
    selectedTile: null,
    selectedKey: null,
    transitionLoopActive: false,
    transitionAnimating: false,
    landingRecords: null,
}

// ---------------------------------------------------------------------------
// Subscriber system
// ---------------------------------------------------------------------------

type Listener<K extends keyof AnimState> = (
    next: AnimState[K],
    prev: AnimState[K],
) => void

// Map of key → set of listeners
const listeners = new Map<keyof AnimState, Set<Listener<any>>>()

function emit<K extends keyof AnimState>(key: K, next: AnimState[K], prev: AnimState[K]): void {
    listeners.get(key)?.forEach(fn => fn(next, prev))
}

// ---------------------------------------------------------------------------
// Core read / write
// ---------------------------------------------------------------------------

export function get<K extends keyof AnimState>(key: K): AnimState[K] {
    return state[key]
}

export function set<K extends keyof AnimState>(key: K, value: AnimState[K]): void {
    const prev = state[key]
    if (prev === value) return
    state[key] = value
    emit(key, value, prev)
}

/** Subscribe to changes on a specific state key. Returns an unsubscribe fn. */
export function subscribe<K extends keyof AnimState>(
    key: K,
    fn: Listener<K>,
): () => void {
    if (!listeners.has(key)) listeners.set(key, new Set())
    listeners.get(key)!.add(fn)
    return () => listeners.get(key)?.delete(fn)
}

// ---------------------------------------------------------------------------
// Typed getters  (thin wrappers — keep call sites clean)
// ---------------------------------------------------------------------------

export const getTerminalOpenState = (): boolean => get("terminalOpen")
export const getGridMode = (): GridMode => get("gridMode")
export const getGridShape = (): ExplosionShape => get("gridShape")
export const getIsAnimating = (): boolean => get("isAnimating")
export const getSelectedTile = (): HTMLElement | null => get("selectedTile")
export const getSelectedKey = (): TileKey | null => get("selectedKey")
export const isTransitionLoop = (): boolean => get("transitionLoopActive")
export const isTransitionAnim = (): boolean => get("transitionAnimating")

// ---------------------------------------------------------------------------
// Typed setters
// ---------------------------------------------------------------------------

export const setTerminalOpenState = (v: boolean) => set("terminalOpen", v)
export const setGridMode = (v: GridMode) => set("gridMode", v)
export const setGridShape = (v: ExplosionShape) => set("gridShape", v)
export const setIsAnimating = (v: boolean) => set("isAnimating", v)
export const setSelectedTile = (v: HTMLElement | null) => set("selectedTile", v)
export const setSelectedKey = (v: TileKey | null) => set("selectedKey", v)
export const setTransitionLoop = (v: boolean) => set("transitionLoopActive", v)
export const setTransitionAnimating = (v: boolean) => set("transitionAnimating", v)
export const getLandingRecords = (): ReadonlyArray<TileRecord> | null => get("landingRecords")
export const setLandingRecords = (v: ReadonlyArray<TileRecord> | null) => set("landingRecords", v)

// ---------------------------------------------------------------------------
// Tile Registry
// ---------------------------------------------------------------------------

/**
 * Builds a TileKey from a row/col pair.
 * Keys are positional strings like "2:3" used to address tiles in the grid.
 */
export function tileKey(row: number, col: number): TileKey {
    return `${row}:${col}` as TileKey
}

/** Internal map — keyed by position, holds the full TileRecord per tile */
const tileRegistry = new Map<TileKey, TileRecord>()

/** Register (or overwrite) a tile in the registry. Returns its key. */
export function registerTile(record: TileRecord): TileKey {
    const key = tileKey(record.row, record.col)
    tileRegistry.set(key, record)
    return key
}

/** Look up a tile by its grid position. */
export function getTile(row: number, col: number): TileRecord | undefined {
    return tileRegistry.get(tileKey(row, col))
}

/** Look up a tile by its key directly. */
export function getTileByKey(key: TileKey): TileRecord | undefined {
    return tileRegistry.get(key)
}

/** Find the tile record whose DOM element matches the given element. */
export function getTileByEl(el: HTMLElement): TileRecord | undefined {
    for (const record of tileRegistry.values()) {
        if (record.el === el) return record
    }
    return undefined
}

/** Get the full registry (read-only view). */
export function getAllTiles(): ReadonlyMap<TileKey, TileRecord> {
    return tileRegistry
}

/** Remove a single tile from the registry. */
export function unregisterTile(row: number, col: number): void {
    tileRegistry.delete(tileKey(row, col))
}

/** Wipe all tiles — call before re-rendering the grid with a new list. */
export function clearTiles(): void {
    tileRegistry.clear()
    setSelectedKey(null)
    setSelectedTile(null)
}

// ---------------------------------------------------------------------------
// Debug snapshot (dev only)
// ---------------------------------------------------------------------------

export function snapshot(): Readonly<AnimState> & { tiles: ReturnType<typeof getAllTiles> } {
    return { ...state, tiles: getAllTiles() }
}
