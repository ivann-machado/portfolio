export function rand(a: number, b: number) { return a + Math.random() * (b - a); }
export function randInt(a: number, b: number) { return Math.floor(rand(a, b)); }
export function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
export function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }