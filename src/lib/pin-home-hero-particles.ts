import type { ShapeName } from "@/lib/geometry/particle-shapes";
import { heroLogoOffsetTarget } from "@/lib/hero-logo-offset";
import type { ParticleScrollState } from "@/stores/particle-scroll-store";

const HOME_PIN_SCROLL_MAX = 56;

export function shouldPinHomeHeroParticles() {
  if (typeof window === "undefined" || window.location.pathname !== "/") return false;
  return window.scrollY <= HOME_PIN_SCROLL_MAX;
}

/** Force the formed hero lightning while the page is pinned at the top. */
export function applyHomeHeroParticlePin(
  setState: (partial: Partial<ParticleScrollState & { shapeTarget?: ShapeName; shapeMorph?: number }>) => void
) {
  if (!shouldPinHomeHeroParticles()) return false;

  setState({
    dissolve: 0,
    geometryScale: 1,
    heroOffsetX: heroLogoOffsetTarget(),
    heroOffsetY: 0,
    shapeTarget: "lightning",
    shapeMorph: 0,
  });
  return true;
}
