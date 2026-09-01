/**
 * Runtime quality profile. The look stays the same family ??particle silhouette,
 * mint blob + bloom, starfield ??while budgets scale with the machine so a
 * 14k-particle / 3-canvas stack doesn't lock a mid-range laptop at 20fps.
 *
 * Call from client components only (reads navigator).
 */

export type GraphicsProfile = {
  starCount: number;
  shapeCount: number;
  rigDpr: [number, number];
  blobDpr: [number, number];
  featuredDpr: [number, number];
  bloomLevels: number;
  bloomIntensity: number;
};

const DESKTOP: GraphicsProfile = {
  starCount: 5200,
  shapeCount: 2800,
  rigDpr: [1, 1.5],
  blobDpr: [1, 1.25],
  featuredDpr: [1, 1.25],
  bloomLevels: 5,
  bloomIntensity: 1.45,
};

const CONSTRAINED: GraphicsProfile = {
  starCount: 2800,
  shapeCount: 1800,
  rigDpr: [1, 1],
  blobDpr: [1, 1],
  featuredDpr: [1, 1],
  bloomLevels: 4,
  bloomIntensity: 1.2,
};

let cached: GraphicsProfile | null = null;

export function resolveGraphics(): GraphicsProfile {
  if (cached) return cached;
  if (typeof window === "undefined") {
    cached = DESKTOP;
    return cached;
  }

  const cores = navigator.hardwareConcurrency || 8;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const saveData = Boolean(
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  );
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const constrained =
    saveData ||
    cores <= 4 ||
    (typeof mem === "number" && mem <= 4) ||
    (coarsePointer && dpr >= 2);

  cached = constrained ? CONSTRAINED : DESKTOP;
  return cached;
}
