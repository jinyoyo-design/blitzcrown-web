import { create } from "zustand";

type GlobalStore = {
  /** True until the preloader + hero entrance hand off to the site. */
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;

  /** True after the load/entrance timeline finishes ??unlocks scroll particle scrubbers. */
  entranceDone: boolean;
  setEntranceDone: (value: boolean) => void;

  /** True while the post-preloader dissolve tween is actively coalescing the hero mark. */
  heroCoalesceActive: boolean;
  setHeroCoalesceActive: (value: boolean) => void;

  /** True after the preloader peel finishes — scattered hero particles may show. */
  introOpen: boolean;
  setIntroOpen: (value: boolean) => void;

  contactOpen: boolean;
  setContactOpen: (value: boolean) => void;
  closeContactFormIfOpen: () => void;
};

export const useGlobalStore = create<GlobalStore>((set, get) => ({
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),

  entranceDone: false,
  setEntranceDone: (entranceDone) => set({ entranceDone }),

  heroCoalesceActive: false,
  setHeroCoalesceActive: (heroCoalesceActive) => set({ heroCoalesceActive }),

  introOpen: false,
  setIntroOpen: (introOpen) => set({ introOpen }),

  contactOpen: false,
  setContactOpen: (contactOpen) => set({ contactOpen }),
  closeContactFormIfOpen: () => {
    if (get().contactOpen) set({ contactOpen: false });
  },
}));
