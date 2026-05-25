import {
    moveSelection,
    selectTile,
    triggerSelected,
    openContent,
    closeContent,
    getGridMode,
} from "../controllers"
import {
    centralTileEl,
    backBtnEl,
    wrap3dEl,
    terminalEl
} from "../dom/elements"

export function registerListeners(): void {
    wrap3dEl.addEventListener("click", (e: MouseEvent) => {
        const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-augmented-ui]")
        if (tile && !centralTileEl.classList.contains("fullscreen")) {
            const mode = getGridMode()
            if (mode === "collapsed") {
                return
            }
            if (mode === "partial-explosion" && !tile.classList.contains("inner-tile")) {
                return
            }
            openContent(tile)
        }
    })

    backBtnEl.addEventListener("click", () => {
        closeContent()
    })

    // Keyboard Navigation
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

    // Mouse Hover Selection
    wrap3dEl.addEventListener("mouseover", (e: MouseEvent) => {
        const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-augmented-ui]")
        selectTile(tile)
    })
}

export const terminalAnimEnd = new Promise<void>((resolve) => {
    const checkAnim = (e: AnimationEvent) => {
        if (e.target === terminalEl) {
            terminalEl.removeEventListener("animationend", checkAnim);
            resolve(); // Resolving unblocks the sequential line execution below
        }
    };
    terminalEl.addEventListener("animationend", checkAnim);
});
