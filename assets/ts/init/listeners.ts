import {
    moveSelection,
    hoverTile,
    unhoverTile,
    triggerSelected,
    openContent,
    closeContent,
} from "../controllers"
import {
    backBtnEl,
    wrap3dEl,
    terminalEl
} from "../dom/elements"

export function registerListeners(): void {

    // --- Tile Click ---
    wrap3dEl.addEventListener("click", (e: MouseEvent) => {
        const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-augmented-ui]")
        if (tile) openContent(tile)
    })

    // --- Back Button ---
    backBtnEl.addEventListener("click", () => {
        closeContent()
    })

    // --- Keyboard Navigation ---
    window.addEventListener("keydown", (e: KeyboardEvent) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
            e.preventDefault()
            moveSelection(e.key as "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight")
        }
        if (e.key === "Enter") {
            e.preventDefault()
            triggerSelected()
        }
    })

    // --- Mouse Hover Selection ---
    wrap3dEl.addEventListener("mouseover", (e: MouseEvent) => {
        const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-augmented-ui]")
        hoverTile(tile)
    })

    wrap3dEl.addEventListener("mouseout", (e: MouseEvent) => {
        const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-augmented-ui]")
        unhoverTile(tile)
    })
}

export const terminalAnimEnd = new Promise<void>((resolve) => {
    const checkAnim = (e: AnimationEvent) => {
        if (e.target === terminalEl) {
            terminalEl.removeEventListener("animationend", checkAnim)
            resolve()
        }
    }
    terminalEl.addEventListener("animationend", checkAnim)
})
