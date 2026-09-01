import type Lenis from "lenis";
import { create } from "zustand";

type ScrollStore = {
  lenis: Lenis | null;
  setLenis: (lenis: Lenis | null) => void;

  /** Signed scroll velocity; the GL layers read this every frame. */
  velocity: number;
  setVelocity: (velocity: number) => void;
};

export const useScrollStore = create<ScrollStore>((set) => ({
  lenis: null,
  setLenis: (lenis) => set({ lenis }),

  velocity: 0,
  setVelocity: (velocity) => set({ velocity }),
}));
