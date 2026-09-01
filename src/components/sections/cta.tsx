"use client";

import { useGlobalStore } from "@/stores/global-store";
import { SITE } from "@/config/site";
import { GlassButton } from "@/components/ui/glass-button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function Cta() {
  const setContactOpen = useGlobalStore((s) => s.setContactOpen);

  return (
    <section className="relative pt-c-160 pb-c-320">
      <p className="display-140 flex flex-col items-center">
        <ScrollReveal asChild>
          <span className="w-full text-center">
            <span className="mobile-landscape:-ml-c-80 w-fit">Ready to explore</span>
          </span>
        </ScrollReveal>
        <ScrollReveal asChild>
          <span className="w-full text-center">
            <span>partnership opportunities?</span>
          </span>
        </ScrollReveal>
        <ScrollReveal asChild>
          <span className="w-full text-center">
            <a
              href={`mailto:${SITE.emails.sales}`}
              data-event="hover"
              className="mobile-landscape:ml-c-80 w-fit underline"
            >
              {SITE.emails.sales}
            </a>
          </span>
        </ScrollReveal>
        <ScrollReveal asChild>
          <span className="w-full text-center">
            <span className="mobile-landscape:-ml-c-320 w-fit">or simply</span>
          </span>
        </ScrollReveal>
        <ScrollReveal asChild>
          <span className="w-full text-center">
            <GlassButton type="button" onClick={() => setContactOpen(true)} wrapperClassName="mobile-landscape:-ml-c-360">
              GET IN TOUCH
            </GlassButton>
          </span>
        </ScrollReveal>
      </p>
    </section>
  );
}
