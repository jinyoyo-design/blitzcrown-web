import { create } from "zustand";
import type { ShapeName } from "@/lib/geometry/particle-shapes";

/**
 * Scroll-driven state for the hero particle field.
 * Written by ParticleScrollController (GSAP scrubbers), read every frame by
 * ShapeParticles. Mirrors the reference site's particleScrollState contract.
 */
export type ParticleScrollState = {
  /** Current silhouette. */
  shapeTarget: ShapeName;
  /** 0 = rest shape (lightning), 1 = fully morph to shapeTarget when target ??lightning. */
  shapeMorph: number;
  /** 0 = formed silhouette, 1 = fully scattered. */
  dissolve: number;
  /** Y rotation of the particle group, in radians (scroll-scrubbed). */
  geometryScrollRotationY: number;
  /** Horizontal shift of the hero logo after entrance (world units). */
  heroOffsetX: number;
};

type Store = ParticleScrollState & {
  setState: (partial: Partial<ParticleScrollState>) => void;
};

export const useParticleScrollStore = create<Store>((set) => ({
  shapeTarget: "lightning",
  shapeMorph: 0,
  // Start scattered ??the entrance timeline tweens this to 0 as the mark forms.
  dissolve: 1,
  geometryScrollRotationY: 0,
  heroOffsetX: 0,
  setState: (partial) => set(partial),
}));
