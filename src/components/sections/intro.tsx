"use client";

import { SITE } from "@/config/site";
import { GlassButtonLink } from "@/components/ui/glass-button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { usePathname } from "next/navigation";
import { scrollToNavTarget } from "@/lib/nav-scroll";
import { useScrollStore } from "@/stores/scroll-store";

export function Intro() {
  const pathname = usePathname();
  const lenis = useScrollStore((s) => s.lenis);

  const onStudioClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    event.preventDefault();
    scrollToNavTarget(lenis, "#studio");
    window.history.replaceState(null, "", "/#studio");
  };

  return (
    <section
      data-dissolve="out"
      data-dissolve-start="top bottom"
      data-dissolve-end="top 60%"
      className="mt-c-240 relative px-8 mobile-landscape:px-0"
    >
      <div className="tablet-landscape:max-w-50vw tablet-landscape:w-1/2 mobile-landscape:flex justify-end tablet-portrait:justify-start tablet-landscape:justify-end pt-c-160">
        <div className="w-fit tablet-portrait:w-auto relative z-1 flex flex-col gap-c-16 desktop-sm:gap-c-24 desktop:gap-c-48 tablet-landscape:items-end mobile-landscape:px-c-48 tablet-landscape:px-0">
          <ScrollReveal asChild variant="fade">
            <h2 className="heading-2 font-barlow mobile-landscape:ml-auto tablet-landscape:ml-0 w-fit tablet-portrait:w-full">
              <span className="mobile-landscape:w-fit flex flex-col">
                <span>Not more games,</span>
                <span>better games.</span>
              </span>
            </h2>
          </ScrollReveal>

          <div className="gap-c-16 desktop-sm:gap-5 desktop:gap-c-32 flex w-fit flex-col items-start">
            <ScrollReveal asChild>
              <p className="body-md mobile-landscape:max-w-105">{SITE.copy.philosophyBody}</p>
            </ScrollReveal>
            <ScrollReveal asChild variant="fade">
              <GlassButtonLink href="/#studio" onClick={onStudioClick}>
                About the studio
                <span className="sr-only"> — Blitzcrown</span>
              </GlassButtonLink>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
