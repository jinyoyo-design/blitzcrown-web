"use client";

import { PARTNER_PROOFS, SITE } from "@/config/site";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export function PartnerProofs() {
  return (
    <section className="relative z-10 px-8 pt-c-160 pb-c-160 tablet-portrait:px-12 desktop:px-24">
      <div className="tablet-portrait:grid-cols-[1fr_1.2fr] grid gap-c-32 items-end">
        <ScrollReveal asChild>
          <h2 className="heading-2 font-barlow max-w-110">{SITE.copy.proofsHeading}</h2>
        </ScrollReveal>
        <ScrollReveal asChild>
          <p className="body-md max-w-120 text-brand-05/80">{SITE.copy.proofsLead}</p>
        </ScrollReveal>
      </div>

      <div className="mt-c-48 tablet-portrait:grid-cols-2 desktop:grid-cols-4 grid gap-c-24">
        {PARTNER_PROOFS.map((proof) => (
          <ScrollReveal key={proof.title} variant="fade">
            <div className="flex h-full flex-col gap-c-16">
              <p className="heading-6 font-barlow">{proof.title}</p>
              <p className="body-sm text-brand-05/70">{proof.body}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
