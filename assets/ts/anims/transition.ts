import { ctx, screenSignal, feDisp, feTurb } from "../dom/elements"
import { rand, randInt, sleep } from "../utils"

let animating: boolean,
	loopRequested: boolean = false

const W = ctx.canvas.width,
	H = ctx.canvas.height

function setFilter(scale: number, freqX: number, freqY: number, seed: number) {
	feDisp.setAttribute('scale', scale.toString())
	feTurb.setAttribute('baseFrequency', `${freqX / 2} ${freqY * 2}`)
	if (seed !== undefined) feTurb.setAttribute('seed', seed.toString())
	screenSignal.style.filter = 'url(#tv-distort)'
}

function drawNoise(amount: number, alpha: number) {
	const id = ctx.createImageData(W, H),
		d = id.data

	for (let i = 0; i < d.length; i += 4) {
		if (Math.random() < amount) {
			const v = randInt(0, 255)
			d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = alpha * 255 | 0
		}
	}
	ctx.putImageData(id, 0, 0)
}

function drawHLines(count: number, alpha: number) {
	for (let i = 0; i < count; i++) {
		const y = randInt(0, H),
			h = randInt(1, 4)
		ctx.fillStyle = `rgba(255,255,255,${alpha})`
		ctx.fillRect(0, y, W, h)
	}
}

function drawTears(count: number, intensity: number) {
	for (let i = 0; i < count; i++) {
		const y = randInt(0, H),
			h = randInt(2, intensity * 3 + 2),
			shift = rand(-intensity * 10, intensity * 10),
			imgData = ctx.getImageData(0, y, W, h)
		ctx.fillStyle = 'rgba(0,0,0,0.85)'
		ctx.fillRect(0, y, W, h)
		ctx.putImageData(imgData, shift, y)
		if (Math.random() < 0.3) {
			ctx.fillStyle = Math.random() < 0.5 ? 'rgba(255,40,40,0.2)' : 'rgba(40,40,255,0.2)'
			ctx.fillRect(shift, y, W, h)
		}
	}
}

function clearCanvas() { ctx.clearRect(0, 0, W, H); }

async function glitchTransition() {
	animating = true

	const nr = 1,
		dr = 3,
		tr = 1,

		baseDur = 700 + (nr + dr + tr) * 18,
		introDur = baseDur * 0.55,
		outroDur = baseDur * 0.45

	let tick = 0

	// ==========================================
	// 1. ENTRY PHASE (FADE IN) - RUNS ONCE
	// ==========================================
	await new Promise<void>(resolve => {
		const startTime = performance.now()
		requestAnimationFrame(function introFrame() {
			const elapsed = performance.now() - startTime,
				phaseT = (elapsed / introDur)

			if (phaseT >= 0.55 || !loopRequested) {
				resolve()
				return
			}

			tick++
			clearCanvas()
			const pi = phaseT < 0.4 ? 0 : 1,
				activeP = pi === 0 ? Math.min(phaseT / 0.4, 1) : 1

			if (nr > 0) {
				const na = pi === 1 ? nr / 10 : activeP * 0.35 * nr / 10
				drawNoise(na, 0.7)
				drawHLines(randInt(0, 2 + Math.floor(nr * activeP)), 0.1 + activeP * 0.25)
			}
			if (tr > 0) {
				const tearCount = pi === 1 ? randInt(3, 6) : Math.random() < activeP * tr / 10 ? randInt(1, 3) : 0
				if (tearCount > 0) drawTears(tearCount, tr)
			}
			if (dr > 0) {
				const dispScale = pi === 1 ? dr * 18 + rand(-8, 8) : activeP * dr * 20,
					freqX = 0.012 + activeP * 0.02 * (dr / 10),
					freqY = 0.06 + activeP * 0.08 * (dr / 10)
				setFilter(dispScale, freqX, freqY, (tick % 80) + pi * 20)
			}
			requestAnimationFrame(introFrame)
		})
	})

	// ==========================================
	// 2. SUSTAIN PHASE (INFINITE MAIN LOOP)
	// ==========================================
	while (loopRequested) {
		await new Promise<void>(resolve => {
			requestAnimationFrame(() => {
				tick++
				clearCanvas()

				if (nr > 0) {
					drawNoise(nr / 10, 0.7)
					drawHLines(randInt(0, 2 + Math.floor(nr)), 0.35)
				}
				if (tr > 0) {
					if (randInt(3, 6) > 0) drawTears(randInt(3, 6), tr)
				}
				if (dr > 0) {
					const dispScale = dr * 18 + rand(-8, 8),
						freqX = 0.032 * (dr / 10),
						freqY = 0.14 * (dr / 10)
					setFilter(dispScale, freqX, freqY, (tick % 80) + 20)
				}
				resolve()
			})
		})
		await sleep(16)
	}

	// ==========================================
	// 3. EXIT PHASE (FADE OUT) - RUNS ONCE
	// ==========================================
	await new Promise<void>(resolve => {
		const startTime = performance.now()
		requestAnimationFrame(function outroFrame() {
			const elapsed = performance.now() - startTime,
				progress = Math.min(elapsed / outroDur, 1),
				phaseT = 0.55 + (progress * 0.45)

			if (progress >= 1) {
				resolve()
				return
			}

			tick++
			clearCanvas()
			const activeP = 1 - Math.min((phaseT - 0.55) / 0.45, 1)

			if (nr > 0) {
				drawNoise(activeP * 0.35 * nr / 5, 0.7)
				drawHLines(randInt(0, 2 + Math.floor(nr * activeP)), 0.1 + activeP * 0.25)
			}
			if (tr > 0) {
				const tearCount = Math.random() < activeP * tr / 10 ? randInt(1, 3) : 0
				if (tearCount > 0) drawTears(tearCount, tr)
			}
			if (dr > 0) {
				const dispScale = activeP * dr * 20,
					freqX = 0.012 + activeP * 0.02 * (dr / 10),
					freqY = 0.06 + activeP * 0.08 * (dr / 10)
				setFilter(dispScale, freqX, freqY, (tick % 80) + 40)
			}
			requestAnimationFrame(outroFrame)
		})
	})


	clearCanvas()
	feDisp.setAttribute('scale', '0')
	feTurb.setAttribute('baseFrequency', '0.00 0.00')
	screenSignal.style.filter = 'none'

	animating = false
	document.body.classList.remove('pauseanimation')
}

export function startTransition() {
	loopRequested = true
	document.body.classList.add('pauseanimation')
	glitchTransition()
}

export function stopTransition() {
	loopRequested = false
}

export function toggleTransition() {
	if (animating) stopTransition()
	else startTransition()
}

export { glitchTransition }