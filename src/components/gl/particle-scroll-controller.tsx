"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  GEOMETRY_SCROLL_SCRUB,
  GEOMETRY_SCROLL_TURNS,
} from "@/config/visuals";
import type { ShapeName } from "@/lib/geometry/particle-shapes";
import { useGlobalStore } from "@/stores/global-store";
import { useParticleScrollStore } from "@/stores/particle-scroll-store";
import { useScrollStore } from "@/stores/scroll-store";
import { lerpLogoOffset } from "@/lib/hero-logo-offset";
import { pinHomeScrollIfNeeded, preserveScrollDuring } from "@/lib/nav-scroll";

gsap.registerPlugin(ScrollTrigger);

const VALID_SHAPES: ShapeName[] = ["lightning", "star", "orb", "diamond"];

function asShape(value: string | undefined): ShapeName | null {
  if (!value) return null;
  // Reference site uses "adn" for the about hero ??map to our soft orb stand-in.
  if (value === "adn") return "orb";
  return VALID_SHAPES.includes(value as ShapeName) ? (value as ShapeName) : null;
}

/**
 * Watches `[data-geometry]` / `[data-dissolve]` markers in the page and
 * scrubs the particle field state to match ??dissolve, morph target, and the
 * continuous Y rotation across the page length.
 *
 * Armed only after `entranceDone` so the load timeline owns dissolve first.
 */
export function ParticleScrollController() {
  const entranceDone = useGlobalStore((s) => s.entranceDone);

  useEffect(() => {
    if (!entranceDone) return;

    const setState = useParticleScrollStore.getState().setState;
    const triggers: ScrollTrigger[] = [];

    // --- Dissolve / morph markers -----------------------------------------
    document.querySelectorAll<HTMLElement>("[data-dissolve]").forEach((el) => {
      const mode = el.dataset.dissolve; // "in" | "out"
      const start = el.dataset.dissolveStart ?? el.dataset.start ?? "top bottom";
      const end = el.dataset.dissolveEnd ?? el.dataset.end ?? (mode === "in" ? "top top" : "top center");
      const scrub = Number(el.dataset.dissolveScrub ?? el.dataset.scrub ?? 0.2);
      const geometry = asShape(el.dataset.geometry);

      const state = { t: mode === "out" ? 0 : 1 };

      const tween = gsap.to(state, {
        t: mode === "out" ? 1 : 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start,
          end,
          scrub: Number.isNaN(scrub) ? 0.2 : scrub,
          onUpdate: () => {
            const patch: Parameters<typeof setState>[0] = { dissolve: state.t };
            if (geometry && mode === "in") {
              patch.shapeTarget = geometry;
              // Morph amount rises as we form the new shape.
              patch.shapeMorph = geometry === "lightning" ? 0 : 1 - state.t;
            }
            if (geometry && mode === "out") {
              // Keep current target while scattering.
              patch.shapeTarget = geometry;
            }
            setState(patch);
          },
        },
      });

      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    // Geometry-only markers (no dissolve) ??e.g. hero declaring the resting shape.
    document.querySelectorAll<HTMLElement>("[data-geometry]").forEach((el) => {
      if (el.dataset.dissolve) return;
      const geometry = asShape(el.dataset.geometry);
      if (!geometry) return;

      const st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => setState({ shapeTarget: geometry, shapeMorph: geometry === "lightning" ? 0 : 1 }),
        onEnterBack: () => setState({ shapeTarget: geometry, shapeMorph: geometry === "lightning" ? 0 : 1 }),
      });
      triggers.push(st);
    });

    // --- Continuous Y rotation across the page ----------------------------
    const firstGeometry = document.querySelector<HTMLElement>("[data-geometry]");
    const lastDissolveIn = Array.from(
      document.querySelectorAll<HTMLElement>('[data-dissolve="in"]')
    ).at(-1);

    if (firstGeometry) {
      const rot = { y: 0 };
      const endDegrees = -360 * GEOMETRY_SCROLL_TURNS;
      const tween = gsap.to(rot, {
        y: (endDegrees * Math.PI) / 180,
        ease: "none",
        scrollTrigger: {
          trigger: firstGeometry,
          start: "top top",
          endTrigger: lastDissolveIn ?? document.body,
          end: lastDissolveIn ? "bottom -50%" : "bottom bottom",
          scrub: GEOMETRY_SCROLL_SCRUB,
          onUpdate: () => setState({ geometryScrollRotationY: rot.y }),
        },
      });
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    }

    // --- Contact: slide logo left so contact details stay clear ----------
    const contact = document.querySelector<HTMLElement>("#contact");
    if (contact) {
      const st = ScrollTrigger.create({
        trigger: contact,
        start: "top 90%",
        end: "top 35%",
        scrub: 0.35,
        onUpdate: (self) => setState({ heroOffsetX: lerpLogoOffset(self.progress) }),
        onRefresh: (self) => setState({ heroOffsetX: lerpLogoOffset(self.progress) }),
      });
      triggers.push(st);
    }

    preserveScrollDuring(useScrollStore.getState().lenis, () => {
      ScrollTrigger.refresh();
    });
    pinHomeScrollIfNeeded(useScrollStore.getState().lenis);

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [entranceDone]);

  return null;
}
