/** Ambient starfield that drifts toward the camera behind the page content. */
export const STARFIELD = {
  /** Ceiling; `resolveGraphics().starCount` is what actually spawns. */
  count: 10000,
  fov: 55,

  sizeMin: 0.8,
  sizeMax: 2.2,

  /**
   * Particles spawn between these distances. Apparent size falls off as
   * 1/depth, so pushing the far plane out mostly just adds sub-pixel particles
   * that cost CPU and render as nothing.
   */
  spawnFarMin: 600,
  spawnFarMax: 1800,

  /**
   * Recycled only once past the camera, so nothing winks out while still on
   * screen. Because x/y are fixed at spawn, the perspective divide sweeps
   * particles outward as they approach and most exit through the edges.
   */
  recycleZ: 60,

  /**
   * Particles that happen to travel near the view axis can't exit sideways,
   * so they fade instead once they get closer than this.
   */
  nearFadeDepth: 260,

  /** Speed is sampled log-uniformly, so a few streak past a slow majority. */
  speedMin: 40,
  speedMax: 520,

  /** Depth at which a particle renders at its nominal pixel size. */
  referenceDepth: 800,

  /** A fifth of the field is "sparkle": larger and much brighter. */
  sparkleRatio: 0.2,
  brightSizeMul: 1.42,
  brightLevel: 2.4,
  dimLevel: 0.85,

  /** Spawn box is slightly wider than the frustum so edges never look cut. */
  xySpread: 1.05,

  /** White dust. Slight warm/mint variation keeps it from looking uniform. */
  colors: ["#ffffff", "#eafff8", "#fffaf2"],
} as const;
