"use client";

import { useCallback, useState } from "react";
import { useGlobalStore } from "@/stores/global-store";
import { useScrollStore } from "@/stores/scroll-store";
import { resetScrollTop } from "@/lib/nav-scroll";
import { Preloader } from "./preloader";
import { SiteEntrance } from "./site-entrance";

type Phase = "preload" | "enter" | "done";

/**
 * Owns the load ??open ??hero entrance handoff.
 * Scroll stays locked (`isLoading`) until entrance completes.
 */
export function BootSequence() {
  const [phase, setPhase] = useState<Phase>("preload");
  const setIsLoading = useGlobalStore((s) => s.setIsLoading);
  const setEntranceDone = useGlobalStore((s) => s.setEntranceDone);

  const onPreloaderDone = useCallback(() => {
    setPhase("enter");
  }, []);

  const onEntranceDone = useCallback(() => {
    setPhase("done");
    resetScrollTop(useScrollStore.getState().lenis);
    setIsLoading(false);
    setEntranceDone(true);
  }, [setEntranceDone, setIsLoading]);

  if (phase === "done") return null;

  return (
    <>
      {phase === "preload" ? <Preloader onComplete={onPreloaderDone} /> : null}
      <SiteEntrance active={phase === "enter"} onComplete={onEntranceDone} />
    </>
  );
}
