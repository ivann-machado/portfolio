/**
 * dom/elements.ts
 * Shared DOM element references used across rendering, animation, and input modules.
 */

export const mainFrameEl = document.querySelector("#main") as HTMLElement
export const terminalFrameEl = document.querySelector("#terminal-frame") as HTMLElement
export const terminalEl = document.querySelector("#terminal") as HTMLElement
export const termCmdEl = document.querySelector("#term-cmd") as HTMLElement

export const crtOverlay = document.querySelector(".crt-overlay") as HTMLElement

export const centralTileEl = document.querySelector("#central-tile") as HTMLElement
export const centralContentEl = document.querySelector("#central-content") as HTMLElement
export const backBtnEl = document.querySelector("#back-btn") as HTMLButtonElement
export const wrap3dEl = document.querySelector("#wrap3d") as HTMLElement
