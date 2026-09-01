/**
 * Tuning values for the WebGL layers, gathered in one place so the look can be
 * adjusted without touching component code. These are dialled in by eye
 * against the running page ??treat them as starting points, not constants.
 */

/** Shown before WebGL takes over, and on machines where it never does. */
export const CSS_FALLBACK_GRADIENT =
  "radial-gradient(ellipse at 45% 35%, #1a5c4a 0%, #0a2e24 45%, #050308 100%)";

export const GRADIENT_COLORS = {
  /** Near-black base. The mint should read as light on darkness, not as a
   *  mint field, so this stays very close to black. */
  shadow: "#02140f",
  /** Lit colour of the mass that drifts across the frame (one step below brand mint). */
  glow: "#00a884",
} as const;

/** Relative pull of the two gradient stops. Higher second value = more glow. */
export const GRADIENT_COLOR_WEIGHTS: [number, number] = [15, 85];

export const GRADIENT_COLOR_BLEND = 1;
export const BLOB_DISPLACEMENT = 0.55;
export const BLOB_MORPH_SPEED = 1.3;
export const BLOB_RANDOMNESS = 0.35;

export const BLOOM_INTENSITY = 1.6;
export const BLOOM_SMOOTHING = 0.3;
export const BLOOM_THRESHOLD = 0.05;

/** Scrolling speeds the gradient's internal clock up or down. */
export const SCROLL_GRADIENT_DOWN_SPEED = 1.8;
export const SCROLL_GRADIENT_UP_SPEED = 0.3;

/** Hero geometry particle ceiling; `resolveGraphics().shapeCount` is what spawns. */
export const SHAPE_PARTICLE_COUNT = 4000;
/** World-space size of the unit-normalised silhouette at the resting depth. */
export const SHAPE_PARTICLE_SCALE = 5.46;
/** Discrete particle diameters (3 steps). */
export const SHAPE_PARTICLE_SIZES = [0.425, 0.6, 0.775] as const;

/** Fraction of shape particles that twinkle, and how hard they pulse. */
export const SHAPE_PARTICLE_TWINKLE_RATIO = 0.35;
export const SHAPE_PARTICLE_TWINKLE_INTENSITY = 2.5;

/**
 * Surface drift. Idle motion is a small oscillating offset on the silhouette ?? * not a continuous spin of the whole group.
 */
export const SHAPE_PARTICLE_DRIFT_MIN = 0.012;
export const SHAPE_PARTICLE_DRIFT_MAX = 0.055;

/**
 * Aura / dust particles that peel off the formed logo, drift outward, and loop.
 * Ratio is of the total shape particle count.
 */
export const SHAPE_AURA_RATIO = 0.128;
export const SHAPE_AURA_RADIUS_MIN = 0.084;
export const SHAPE_AURA_RADIUS_MAX = 1.085;
export const SHAPE_AURA_SPEED_MIN = 0.18;
export const SHAPE_AURA_SPEED_MAX = 0.42;
export const SHAPE_AURA_SWIRL = 0.22;
export const SHAPE_AURA_SIZE_MUL = 0.72;

/** Particles assemble from a scatter cloud into the mark on first paint. */
export const SHAPE_FORMATION_DURATION = 2.4;
export const SHAPE_FORMATION_STAGGER = 0.65;

/** Cursor pushes nearby particles outward and tilts the whole mark toward it. */
export const SHAPE_POINTER_RADIUS = 0.855;
export const SHAPE_POINTER_PUSH = 1.15;
/**
 * Soft-edge multiplier past the core radius. Influence is culled at
 * radius * soft, with a gaussian that is already near-zero at the rim ?? * so the field doesn't read as a hard circle.
 */
export const SHAPE_POINTER_SOFT = 1.85;
/** Higher = steeper gaussian drop-off from the cursor core. */
export const SHAPE_POINTER_GAUSS = 4.2;
/** Higher = snappier reform; lower = softer, fluffier settle. */
export const SHAPE_POINTER_RETURN = 7.5;
/** World-space speed that saturates push from motion (lower = easier to engage). */
export const SHAPE_POINTER_SPEED_REF = 48;
/** Idle hover still contributes some soft push while the cursor sits on the mark. */
export const SHAPE_POINTER_HOVER_PUSH = 0.42;
export const SHAPE_POINTER_MAX_OFFSET = 2.1;
export const SHAPE_GROUP_LOOK_TILT = 0.55;
export const SHAPE_GROUP_TILT_SPEED = 6;
/** Slow Y spin while the lightning silhouette is fully formed (rad/s). */
export const SHAPE_LIGHTNING_IDLE_SPIN = 0.11;
/** Gentle Z wobble amplitude and speed for the formed lightning mark. */
export const SHAPE_LIGHTNING_IDLE_WOBBLE = 0.045;
export const SHAPE_LIGHTNING_IDLE_WOBBLE_SPEED = 0.38;

/** Full turns of the hero geometry from hero through the featured-work handoff. */
export const GEOMETRY_SCROLL_TURNS = 2;
export const GEOMETRY_SCROLL_SCRUB = 0.7;

/** Contact CTA lightning — 40% larger than the previous contact resting size. */
export const CONTACT_LIGHTNING_SCALE = 0.392;
/** Point size multiplier while the bolt sits in the contact slot. */
export const CONTACT_LIGHTNING_PARTICLE_SIZE_MUL = 0.5;

/** How far beyond the viewport edge intro dust spawns (fraction of width/height). */
export const INTRO_OFFSCREEN_MARGIN_MIN = 0.06;
export const INTRO_OFFSCREEN_MARGIN_MAX = 0.2;

/** Nudge the contact bolt upward so its visual mass aligns with the slot center. */
export const CONTACT_LIGHTNING_VISUAL_Y_BIAS_PX = 12;
