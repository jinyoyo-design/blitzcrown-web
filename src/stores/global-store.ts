import { create } from "zustand";

type GlobalStore = {
  /** True until the preloader + hero entrance hand off to the site. */
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;

  /** True after the load/entrance timeline finishes ??unlocks scroll particle scrubbers. */
  entranceDone: boolean;
  setEntranceDone: (value: boolean) => void;

  contactOpen: boolean;
  setContactOpen: (value: boolean) => void;
  closeContactFormIfOpen: () => void;
};

export const useGlobalStore = create<GlobalStore>((set, get) => ({
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),

  entranceDone: false,
  setEntranceDone: (entranceDone) => set({ entranceDone }),

  contactOpen: false,
  setContactOpen: (contactOpen) => set({ contactOpen }),
  closeContactFormIfOpen: () => {
    if (get().contactOpen) set({ contactOpen: false });
  },
}));
