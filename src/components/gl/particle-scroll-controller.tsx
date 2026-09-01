"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  GEOMETRY_SCROLL_SCRUB,
  GEOMETRY_SCROLL_TURNS,
  CONTACT_LIGHTNING_SCALE,
} from "@/config/visuals";
import type { ShapeName } from "@/lib/geometry/particle-shapes";
import { applyHomeHeroParticlePin } from "@/lib/pin-home-hero-particles";
import {
  resetContactLightningLock,
  resolveContactFollowPosition,
} from "@/lib/particle-plane";
import { contactJourneyState } from "@/lib/hero-logo-offset";
import { useGlobalStore } from "@/stores/global-store";
import { useParticleScrollStore } from "@/stores/particle-scroll-store";
import { useScrollStore } from "@/stores/scroll-store";
import { pinHomeScrollIfNeeded, preserveScrollDuring } from "@/lib/nav-scroll";

gsap.registerPlugin(ScrollTrigger);

const VALID_SHAPES: ShapeName[] = ["lightning", "star", "orb", "diamond"];

function asShape(value: string | undefined): ShapeName | null {
  if (!value) return null;
  if (value === "adn") return "orb";
  return VALID_SHAPES.includes(value as ShapeName) ? (value as ShapeName) : null;
}

/**
 * Watches `[data-geometry]` / `[data-dissolve]` markers in the page and
 * scrubs the particle field state to match — dissolve, morph target, and the
 * continuous Y rotation across the page length.
 *
 * Armed only after `entranceDone` so the load timeline owns dissolve first.
 */
export function ParticleScrollController() {
  const entranceDone = useGlobalStore((s) => s.entranceDone);
  const lenis = useScrollStore((s) => s.lenis);

  useEffect(() => {
    if (!entranceDone) return;

    const setState = useParticleScrollStore.getState().setState;
    const triggers: ScrollTrigger[] = [];

    const pinIfNeeded = () => applyHomeHeroParticlePin(setState);

    // --- Hero: scatter only while scrolling past the hero (not at rest) -----
    const homeHero = document.querySelector<HTMLElement>("[data-home-hero]");
    if (homeHero) {
      const scatter = { t: 0 };
      const scatterTween = gsap.to(scatter, {
        t: 1,
        ease: "none",
        scrollTrigger: {
          trigger: homeHero,
          start: "bottom bottom",
          end: "bottom top",
          scrub: 0.32,
          onUpdate: (self) => {
            if (pinIfNeeded()) return;
            setState({ dissolve: scatter.t, shapeTarget: "lightning", shapeMorph: 0 });
          },
          onRefresh: (self) => {
            if (pinIfNeeded()) return;
            setState({ dissolve: scatter.t, shapeTarget: "lightning", shapeMorph: 0 });
          },
        },
      });
      if (scatterTween.scrollTrigger) triggers.push(scatterTween.scrollTrigger);
    }

    // --- Dissolve / morph markers (below-fold sections only) --------------
    document.querySelectorAll<HTMLElement>("[data-dissolve]").forEach((el) => {
      const mode = el.dataset.dissolve;
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
          onUpdate: (self) => {
            if (pinIfNeeded()) return;
            if (mode === "in" && self.scroll() + 4 < self.start) return;

            const patch: Parameters<typeof setState>[0] = { dissolve: state.t };
            if (geometry && mode === "in") {
              patch.shapeTarget = geometry;
              patch.shapeMorph = geometry === "lightning" ? 0 : 1 - state.t;
            }
            if (geometry && mode === "out") {
              patch.shapeTarget = geometry;
            }
            setState(patch);
          },
          onRefresh: (self) => {
            if (pinIfNeeded()) return;
            if (mode === "in" && self.scroll() + 4 < self.start) return;

            const patch: Parameters<typeof setState>[0] = { dissolve: state.t };
            if (geometry && mode === "in") {
              patch.shapeTarget = geometry;
              patch.shapeMorph = geometry === "lightning" ? 0 : 1 - state.t;
            }
            if (geometry && mode === "out") {
              patch.shapeTarget = geometry;
            }
            setState(patch);
          },
        },
      });

      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    });

    document.querySelectorAll<HTMLElement>("[data-geometry]").forEach((el) => {
      if (el.dataset.dissolve) return;
      const geometry = asShape(el.dataset.geometry);
      if (!geometry) return;

      const st = ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          if (pinIfNeeded()) return;
          setState({ shapeTarget: geometry, shapeMorph: geometry === "lightning" ? 0 : 1 });
        },
        onEnterBack: () => {
          if (pinIfNeeded()) return;
          setState({ shapeTarget: geometry, shapeMorph: geometry === "lightning" ? 0 : 1 });
        },
      });
      triggers.push(st);
    });

    const partners = document.querySelector<HTMLElement>("#partners");
    const firstGeometry = document.querySelector<HTMLElement>("[data-geometry]");
    const lastDissolveIn = partners ?? document.querySelector<HTMLElement>('[data-dissolve="in"]');

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
          onUpdate: () => {
            if (pinIfNeeded()) return;
            setState({ geometryScrollRotationY: rot.y });
          },
        },
      });
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    }

    const contactAnchor = document.querySelector<HTMLElement>("[data-contact-lightning-anchor]");
    const contact = document.querySelector<HTMLElement>("#contact");
    const contactRow = contactAnchor?.parentElement;
    const footer = document.querySelector<HTMLElement>("footer");

    /** Gather bottom-left → glide to contact anchor → reform beside CTA copy. */
    if (partners && contactRow && contact) {
      const applyContactRest = () => {
        if (pinIfNeeded()) return;
        const anchored = resolveContactFollowPosition();
        if (!anchored) return;
        setState({
          dissolve: 0,
          shapeTarget: "lightning",
          shapeMorph: 0,
          heroOffsetX: anchored.x,
          heroOffsetY: anchored.y,
          geometryScale: CONTACT_LIGHTNING_SCALE,
        });
      };

      const applyContactJourney = (progress: number) => {
        if (pinIfNeeded()) return;
        resetContactLightningLock();
        setState(contactJourneyState(progress));
      };

      const journey = ScrollTrigger.create({
        trigger: partners,
        endTrigger: contactRow,
        start: "top 68%",
        end: "top 36%",
        scrub: 0.55,
        onUpdate: (self) => applyContactJourney(self.progress),
        onRefresh: (self) => applyContactJourney(self.progress),
      });
      triggers.push(journey);

      const follow = ScrollTrigger.create({
        trigger: contact,
        start: "top 36%",
        endTrigger: footer ?? contact,
        end: footer ? "bottom top" : "bottom bottom",
        onUpdate: applyContactRest,
        onRefresh: applyContactRest,
      });
      triggers.push(follow);
    }

    const onRefresh = () => {
      resetContactLightningLock();
      pinIfNeeded();
    };
    ScrollTrigger.addEventListener("refresh", onRefresh);

    const onLenisScroll = () => pinIfNeeded();
    lenis?.on("scroll", onLenisScroll);

    preserveScrollDuring(lenis, () => {
      ScrollTrigger.refresh();
    });
    pinHomeScrollIfNeeded(lenis);

    pinIfNeeded();
    requestAnimationFrame(pinIfNeeded);
    window.setTimeout(pinIfNeeded, 120);
    window.setTimeout(pinIfNeeded, 480);

    return () => {
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      lenis?.off("scroll", onLenisScroll);
      triggers.forEach((t) => t.kill());
    };
  }, [entranceDone, lenis]);

  return null;
}
