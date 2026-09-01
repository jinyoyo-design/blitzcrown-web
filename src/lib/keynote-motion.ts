export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const seg = (t: number, a: number, b: number) =>
  clamp((t - a) / (b - a || 1e-6), 0, 1);

export const smooth = (t: number) => t * t * (3 - 2 * t);

export const eOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type CharJitter = readonly [number, number, number];

export function createCharJitter(length: number, seed: number): CharJitter[] {
  const random = seededRandom(seed);
  return Array.from({ length }, () => [random() * 2 - 1, random() * 2 - 1, random()] as CharJitter);
}

/** Keynote wordmark assemble — chromatic drift, scale settle, per-char jitter. */
export function applyWordmarkFrame(
  elements: readonly HTMLElement[],
  jitter: readonly CharJitter[],
  progress: number,
) {
  for (let index = 0; index < elements.length; index += 1) {
    const element = elements[index];
    const [jx, jy, phase] = jitter[index] ?? [0, 0, 0];
    const amount = eOut(clamp(seg(progress, 0.02, 0.5) * 1.5 - phase * 0.5, 0, 1));
    element.style.transform = `translate(${(jx * 62 * (1 - amount)).toFixed(1)}px, ${(jy * 34 * (1 - amount)).toFixed(1)}px) scale(${lerp(1.24, 1, amount).toFixed(3)})`;
    element.style.opacity = String(Math.min(1, amount * 1.6));
    const separation = (1 - amount) * 11;
    element.style.textShadow =
      separation > 0.4
        ? `${(-separation).toFixed(1)}px 0 rgba(255,64,72,.85), ${separation.toFixed(1)}px 0 rgba(64,255,190,.8), 0 ${(separation * 0.55).toFixed(1)}px rgba(96,124,255,.8)`
        : "none";
    element.style.filter = separation > 0.7 ? `blur(${(separation * 0.3).toFixed(2)}px)` : "none";
  }
}
