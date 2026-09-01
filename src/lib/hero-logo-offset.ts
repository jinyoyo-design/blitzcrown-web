import { CONTACT_LIGHTNING_SCALE } from "@/config/visuals";
import {
  contactGatherPosition,
  contactLightningAnchorPosition,
  easeOutCubic,
} from "@/lib/particle-plane";

/** Hero resting position: logo sits to the right so copy can live on the left. */
export function heroLogoOffsetTarget() {
  const w = window.innerWidth;
  if (w >= 1280) return 1.25;
  if (w >= 768) return 0.95;
  return 0.45;
}

/** Fallback when the DOM anchor is hidden (mobile / narrow layouts). */
export function contactLogoOffsetTarget() {
  const w = window.innerWidth;
  if (w >= 1280) return -1.05;
  if (w >= 768) return -0.65;
  return -0.15;
}

export function contactLogoOffsetTargetY() {
  const h = window.innerHeight;
  if (h >= 900) return 0.72;
  if (h >= 700) return 0.55;
  return 0.38;
}

const CONTACT_GATHER_END = 0.38;
const CONTACT_GLIDE_END = 0.72;

/** Scroll-scrubbed partners → gather → contact glide → reform. */
export function contactJourneyState(progress: number) {
  const t = Math.min(1, Math.max(0, progress));
  const gather = contactGatherPosition();
  const anchored = contactLightningAnchorPosition();
  const fromX = heroLogoOffsetTarget();
  const fromY = 0;

  const base = {
    shapeTarget: "lightning" as const,
    shapeMorph: 0,
  };

  if (!gather || !anchored) {
    return {
      ...base,
      heroOffsetX: fromX,
      heroOffsetY: fromY,
      geometryScale: 1,
      dissolve: 1,
    };
  }

  if (t < CONTACT_GATHER_END) {
    const p = easeOutCubic(t / CONTACT_GATHER_END);
    return {
      ...base,
      heroOffsetX: fromX + (gather.x - fromX) * p,
      heroOffsetY: fromY + (gather.y - fromY) * p,
      geometryScale: 1,
      dissolve: 1,
    };
  }

  if (t < CONTACT_GLIDE_END) {
    const p = easeOutCubic((t - CONTACT_GATHER_END) / (CONTACT_GLIDE_END - CONTACT_GATHER_END));
    return {
      ...base,
      heroOffsetX: gather.x + (anchored.x - gather.x) * p,
      heroOffsetY: gather.y + (anchored.y - gather.y) * p,
      geometryScale: 1 + (CONTACT_LIGHTNING_SCALE - 1) * p,
      dissolve: 1,
    };
  }

  const p = easeOutCubic((t - CONTACT_GLIDE_END) / (1 - CONTACT_GLIDE_END));
  return {
    ...base,
    heroOffsetX: anchored.x,
    heroOffsetY: anchored.y,
    geometryScale: CONTACT_LIGHTNING_SCALE,
    dissolve: 1 - p,
  };
}

export function resolveContactLogoOffset(progress: number) {
  const t = easeOutCubic(Math.min(1, Math.max(0, progress)));
  const anchored = contactLightningAnchorPosition();
  const fromX = heroLogoOffsetTarget();
  const fromY = 0;
  const toX = anchored?.x ?? contactLogoOffsetTarget();
  const toY = anchored?.y ?? contactLogoOffsetTargetY();

  if (t >= 1 && anchored) {
    return anchored;
  }

  return {
    x: fromX + (toX - fromX) * t,
    y: fromY + (toY - fromY) * t,
  };
}

export function lerpContactGeometryScale(progress: number) {
  const t = easeOutCubic(Math.min(1, Math.max(0, progress)));
  return 1 + (CONTACT_LIGHTNING_SCALE - 1) * t;
}