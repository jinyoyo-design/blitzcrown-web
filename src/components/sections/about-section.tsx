"use client";

import { ABOUT, PARTNER_PROOFS } from "@/config/site";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function AboutSection() {
  return (
    <section id="studio" className="scroll-mt-navbar-height relative z-10 flex flex-col gap-40 pt-c-160 pb-c-160">
      <div className="desktop-sm:grid desktop-sm:grid-cols-2 desktop-sm:pr-c-32 px-8 tablet-portrait:px-12 desktop:px-24">
        <ScrollReveal asChild>
          <h2 className="heading-2 font-barlow tablet-portrait:sticky tablet-portrait:top-1/2 tablet-portrait:h-fit">
            About Us
          </h2>
        </ScrollReveal>
        <div className="gap-c-16 tablet-portrait:gap-c-32 tablet-landscape:gap-c-48 mt-c-32 desktop-sm:mt-0 flex flex-col">
          <ScrollReveal>
            <p className="heading-3 font-barlow leading-[1.2em]">Not more games, better games.</p>
          </ScrollReveal>
          <div className="body-lg gap-c-32 flex max-w-140 flex-col leading-[1.6em]!">
            <ScrollReveal>
              <p>{ABOUT.lead}</p>
            </ScrollReveal>
            <ScrollReveal>
              <p>{ABOUT.build}</p>
            </ScrollReveal>
            <ScrollReveal>
              <p>{ABOUT.b2b}</p>
            </ScrollReveal>
          </div>
        </div>
      </div>

      <div className="px-8 tablet-portrait:px-12 desktop:px-24">
        <div className="tablet-portrait:grid-cols-2 desktop:grid-cols-4 grid gap-c-24">
          {PARTNER_PROOFS.map((proof) => (
            <ScrollReveal key={proof.title} variant="fade">
              <div className="flex h-full flex-col gap-3">
                <p className="heading-6 font-barlow">{proof.title}</p>
                <p className="body-sm text-brand-05/70">{proof.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <div className="safearea-md tablet-portrait:safearea-lg flex flex-col gap-c-48 px-8 tablet-portrait:px-12 desktop:px-24">
        <div className="desktop-sm:grid desktop-sm:grid-cols-2">
          <div />
          <div className="gap-c-16 flex max-w-140 flex-col">
            <ScrollReveal>
              <h3 className="heading-2 font-barlow">{ABOUT.rgTitle}</h3>
            </ScrollReveal>
            <ScrollReveal>
              <p className="body-lg leading-[1.6em]!">{ABOUT.rg}</p>
            </ScrollReveal>
          </div>
        </div>

        <div className="tablet-portrait:grid-cols-3 grid gap-c-32">
          {ABOUT.pillars.map((pillar) => (
            <ScrollReveal key={pillar.title}>
              <div className="flex flex-col gap-3">
                <h4 className="heading-5 font-barlow">{pillar.title}</h4>
                <p className="body-sm text-brand-05/75">{pillar.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
