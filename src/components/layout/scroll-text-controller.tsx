"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGlobalStore } from "@/stores/global-store";
import { useScrollStore } from "@/stores/scroll-store";
import { preserveScrollDuring, pinHomeScrollIfNeeded } from "@/lib/nav-scroll";

gsap.registerPlugin(ScrollTrigger, SplitText);

const PRINT_KEYS = [{ opacity: 0.4 }, { opacity: 0.6 }, { opacity: 0.8 }, { opacity: 1 }];

/**
 * Binds reference-style scroll text treatments:
 * `.js-s-lines` (masked line rise) and `.js-s-print-opacity` (char print-in).
 */
export function ScrollTextController() {
  const entranceDone = useGlobalStore((s) => s.entranceDone);
  const pathname = usePathname();

  useEffect(() => {
    if (!entranceDone) return;

    const splits: SplitText[] = [];
    let ctx: gsap.Context | undefined;

    const bind = async () => {
      try {
        await document.fonts.ready;
      } catch {
        /* ignore */
      }

      ctx = gsap.context(() => {
        document.querySelectorAll<HTMLElement>(".js-s-print-opacity").forEach((el) => {
          const split = new SplitText(el, { type: "chars,words,lines", tag: "span" });
          splits.push(split);

          const fromZero = el.dataset.startFromZero === "true";
          const scrubRaw = el.dataset.scrub;
          const scrub = scrubRaw ? Number(scrubRaw) : 1;

          gsap.fromTo(
            split.chars,
            { opacity: fromZero ? 0 : 0.1 },
            {
              keyframes: PRINT_KEYS,
              stagger: 0.02,
              ease: "power1.inOut",
              duration: 0.2,
              scrollTrigger: {
                trigger: el,
                start: el.dataset.start ?? "top 90%",
                end: el.dataset.end ?? "bottom 70%",
                scrub: Number.isNaN(scrub) ? 1 : scrub,
              },
            }
          );
        });

        document.querySelectorAll<HTMLElement>(".js-s-lines").forEach((el) => {
          if (el.closest("[data-home-hero]")) return;

          const split = new SplitText(el, {
            type: "lines",
            mask: "lines",
            linesClass: "overflow-hidden",
            tag: "div",
          });
          splits.push(split);

          const scale = Number(el.dataset.scale) || 1;

          gsap.fromTo(
            split.lines,
            { yPercent: 320, scale, rotate: 10 },
            {
              yPercent: 0,
              scale: 1,
              rotate: 0,
              stagger: 0.07,
              duration: 0.4,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: el.dataset.start ?? "top 90%",
                end: el.dataset.end ?? "bottom 60%",
                scrub: 1,
              },
            }
          );
        });
      });

      preserveScrollDuring(useScrollStore.getState().lenis, () => {
        ScrollTrigger.refresh();
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      pinHomeScrollIfNeeded(useScrollStore.getState().lenis);
    };

    void bind();

    return () => {
      splits.forEach((split) => {
        try {
          split.revert();
        } catch {
          /* ignore */
        }
      });
      ctx?.revert();
    };
  }, [entranceDone, pathname]);

  return null;
}
