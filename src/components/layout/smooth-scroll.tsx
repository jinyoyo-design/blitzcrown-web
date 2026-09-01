"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerTickerCallback } from "@/lib/ticker";
import { resetScrollTop } from "@/lib/nav-scroll";
import { useGlobalStore } from "@/stores/global-store";
import { useScrollStore } from "@/stores/scroll-store";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const setLenis = useScrollStore((s) => s.setLenis);
  const setVelocity = useScrollStore((s) => s.setVelocity);

  useEffect(() => {
    // autoRaf is off because the shared ticker advances Lenis; see lib/ticker.
    const lenis = new Lenis({ autoRaf: false, smoothWheel: true });
    lenisRef.current = lenis;
    setLenis(lenis);
    if (useGlobalStore.getState().isLoading) lenis.stop();

    // ScrollTrigger must read Lenis' virtual scroll position, otherwise pins
    // and scrubbed timelines fight the native document scroll.
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (typeof value === "number") {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.documentElement.style.transform ? "transform" : "fixed",
    });
    ScrollTrigger.defaults({ scroller: document.documentElement });

    lenis.on("scroll", ({ velocity, direction }) => {
      setVelocity(velocity * direction);
      if (Math.abs(velocity) > 0.01) {
        useGlobalStore.getState().closeContactFormIfOpen();
      }
      ScrollTrigger.update();
    });

    const unregister = registerTickerCallback(({ timeMs }) => {
      lenis.raf(timeMs);
    });

    const pinTop = () => {
      resetScrollTop(lenis);
    };

    pinTop();
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) pinTop();
    };
    window.addEventListener("pageshow", onPageShow);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      unregister();
      ScrollTrigger.scrollerProxy(document.documentElement); // clear
      lenis.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [setLenis, setVelocity]);

  const isLoading = useGlobalStore((s) => s.isLoading);
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (isLoading) {
      lenis.stop();
      return;
    }
    resetScrollTop(lenis);
    lenis.start();
  }, [isLoading]);

  return <>{children}</>;
}
