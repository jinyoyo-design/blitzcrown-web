import {
  CONTACT_LIGHTNING_SCALE,
  CONTACT_LIGHTNING_VISUAL_Y_BIAS_PX,
  INTRO_OFFSCREEN_MARGIN_MAX,
  INTRO_OFFSCREEN_MARGIN_MIN,
  SHAPE_PARTICLE_SCALE,
} from "@/config/visuals";
import { STARFIELD } from "@/config/starfield";

/** Must match `DEPTH` in shape-particles. */
const PLANE_Z = 6;

/** Map a viewport pixel to the particle plane at z = -PLANE_Z. */
export function screenToParticlePlane(clientX: number, clientY: number) {
  const w = Math.max(window.innerWidth, 1);
  const h = Math.max(window.innerHeight, 1);
  const aspect = w / h;
  const tanHalf = Math.tan((STARFIELD.fov * Math.PI) / 180 / 2);
  const ndcX = (clientX / w) * 2 - 1;
  const ndcY = -(clientY / h) * 2 + 1;

  return {
    x: ndcX * tanHalf * aspect * PLANE_Z,
    y: ndcY * tanHalf * PLANE_Z,
  };
}

/** World-space target for the contact lightning mark (left column, clear of CTA copy). */
export function contactLightningAnchorPosition(): { x: number; y: number } | null {
  const anchor = document.querySelector<HTMLElement>("[data-contact-lightning-anchor]");
  const contactCopy = document.querySelector<HTMLElement>("#contact");
  if (!anchor) return null;

  const anchorRect = anchor.getBoundingClientRect();
  if (anchorRect.width < 8 || anchorRect.height < 8) return null;

  // Center of the left empty column (horizontal + vertical).
  let cx = anchorRect.left + anchorRect.width * 0.5;
  const cy = anchorRect.top + anchorRect.height * 0.5 - CONTACT_LIGHTNING_VISUAL_Y_BIAS_PX;

  const copyEdge = contactCopy?.getBoundingClientRect().left;
  if (copyEdge != null) {
    const gap = 24;
    const boltHalfWidth = anchorRect.width * 0.24 * CONTACT_LIGHTNING_SCALE;
    if (cx + boltHalfWidth > copyEdge - gap) {
      cx = copyEdge - gap - boltHalfWidth;
    }
  }

  return screenToParticlePlane(cx, cy);
}

function hash01(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** World-space spawn on/off beyond the viewport edges for the hero intro coalesce. */
export function sampleIntroOffscreenSpawn(index: number) {
  const w = Math.max(window.innerWidth, 1);
  const h = Math.max(window.innerHeight, 1);
  const along = hash01(index * 1.127 + 0.5);
  const marginT = hash01(index * 3.331 + 7.1);
  const margin =
    INTRO_OFFSCREEN_MARGIN_MIN +
    marginT * (INTRO_OFFSCREEN_MARGIN_MAX - INTRO_OFFSCREEN_MARGIN_MIN);

  const edge = index % 4;
  let cx: number;
  let cy: number;

  switch (edge) {
    case 0:
      cx = -w * margin;
      cy = along * h;
      break;
    case 1:
      cx = w * (1 + margin);
      cy = along * h;
      break;
    case 2:
      cx = along * w;
      cy = -h * margin;
      break;
    default:
      cx = along * w;
      cy = h * (1 + margin);
      break;
  }

  const plane = screenToParticlePlane(cx, cy);
  const depthSpread = SHAPE_PARTICLE_SCALE * 1.8 * 0.9;
  return {
    x: plane.x,
    y: plane.y,
    z: (hash01(index * 2.173) - 0.5) * depthSpread,
  };
}

let lockedContactAnchor: { x: number; y: number } | null = null;
let contactAnchorLocked = false;

/** Clear the footer lock so layout changes or upward scroll can re-track live. */
export function resetContactLightningLock() {
  lockedContactAnchor = null;
  contactAnchorLocked = false;
}

/**
 * Live contact anchor while the CTA is settling; locks once the footer is about
 * to enter so further scroll does not drift the bolt upward.
 */
export function resolveContactFollowPosition(): { x: number; y: number } | null {
  const footer = document.querySelector("footer");
  const footerTop = footer?.getBoundingClientRect().top ?? Infinity;
  const shouldLock = footerTop <= window.innerHeight;

  if (shouldLock) {
    if (!contactAnchorLocked) {
      const live = contactLightningAnchorPosition();
      if (live) {
        lockedContactAnchor = live;
        contactAnchorLocked = true;
      }
    }
    return lockedContactAnchor;
  }

  contactAnchorLocked = false;
  lockedContactAnchor = null;
  return contactLightningAnchorPosition();
}

/** Bottom-left gather point for scattered particles before they glide to contact. */
export function contactGatherPosition(): { x: number; y: number } {
  const w = Math.max(window.innerWidth, 1);
  const h = Math.max(window.innerHeight, 1);
  const cx = w * (w >= 1280 ? 0.22 : w >= 768 ? 0.26 : 0.34);
  const cy = h * 0.78;
  return screenToParticlePlane(cx, cy);
}

function easeOutCubic(t: number) {
  const p = Math.min(1, Math.max(0, t));
  return 1 - (1 - p) ** 3;
}

export { easeOutCubic };
