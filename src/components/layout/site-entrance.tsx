"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { heroLogoOffsetTarget } from "@/lib/hero-logo-offset";
import { useGlobalStore } from "@/stores/global-store";
import { useParticleScrollStore } from "@/stores/particle-scroll-store";

type SiteEntranceProps = {
  active: boolean;
  onComplete: () => void;
};

function hideHeroContent(content: HTMLElement) {
  content.classList.add("hero-content-pending");
  gsap.set(content, { opacity: 0, y: 28 });
}

function showHeroContent(content: HTMLElement) {
  content.classList.remove("hero-content-pending");
  gsap.set(content, { opacity: 1, y: 0, clearProps: "transform" });
}

/**
 * Post-preloader hero entrance:
 * 1) scattered particles drift briefly after the panels open
 * 2) particles coalesce into a centered lightning logo
 * 3) logo shifts right while copy fades in on the left
 */
export function SiteEntrance({ active, onComplete }: SiteEntranceProps) {
  useEffect(() => {
    if (!active) return;

    let killed = false;
    let tl: gsap.core.Timeline | null = null;

    const content = document.querySelector<HTMLElement>("[data-home-hero-content]");
    if (content) hideHeroContent(content);

    const run = async () => {
      const hero = document.querySelector<HTMLElement>("[data-home-hero]");
      if (!hero || !content) {
        onComplete();
        return;
      }

      hideHeroContent(content);

      useGlobalStore.getState().setHeroCoalesceActive(false);
      useParticleScrollStore.getState().setState({
        shapeTarget: "lightning",
        shapeMorph: 0,
        dissolve: 1,
        heroOffsetX: 0,
        heroOffsetY: 0,
        geometryScale: 1,
      });

      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }

      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      if (killed) return;

      const dissolveProxy = { dissolve: 1 };
      const offsetProxy = { x: 0 };
      const offsetTarget = heroLogoOffsetTarget();

      tl = gsap.timeline({
        delay: 0.2,
        onStart: () => {
          useGlobalStore.getState().setHeroCoalesceActive(true);
        },
        onComplete: () => {
          showHeroContent(content);
          useGlobalStore.getState().setHeroCoalesceActive(false);
          useParticleScrollStore.getState().setState({
            dissolve: 0,
            heroOffsetX: offsetTarget,
            heroOffsetY: 0,
            geometryScale: 1,
          });
          onComplete();
        },
      });

      tl.to(
        dissolveProxy,
        {
          dissolve: 0,
          duration: 2.2,
          ease: "power2.inOut",
          onUpdate: () => {
            useParticleScrollStore.getState().setState({ dissolve: dissolveProxy.dissolve });
          },
        },
        0
      );

      tl.to(
        offsetProxy,
        {
          x: offsetTarget,
          duration: 0.85,
          ease: "power3.inOut",
          onUpdate: () => {
            useParticleScrollStore.getState().setState({ heroOffsetX: offsetProxy.x });
          },
        },
        1.85
      );

      tl.to(
        content,
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          onStart: () => {
            content.classList.remove("hero-content-pending");
          },
        },
        2.05
      );
    };

    void run();

    return () => {
      killed = true;
      useGlobalStore.getState().setHeroCoalesceActive(false);
      tl?.kill();
    };
  }, [active, onComplete]);

  return null;
}
