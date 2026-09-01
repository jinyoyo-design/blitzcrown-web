"use client";

import { SITE } from "@/config/site";
import { GlassButton, GlassButtonLink } from "@/components/ui/glass-button";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";
import { useGlobalStore } from "@/stores/global-store";

export function Hero() {
  const setContactOpen = useGlobalStore((s) => s.setContactOpen);

  return (
    <section
      id="home"
      data-home-hero
      data-geometry="lightning"
      data-geometry-entry-animation="false"
      className="scroll-mt-navbar-height mt-navbar-height tablet-portrait:px-12 tablet-landscape:px-16 desktop-sm:px-20 desktop:px-24 desktop-lg:px-30 relative flex min-h-hero-screen-height items-center px-8 py-10"
    >
      <div
        data-home-hero-content
        className="hero-content-pending pointer-events-auto relative z-10 flex w-full max-w-140 flex-col gap-c-32 tablet-landscape:max-w-150 desktop:max-w-160"
      >
        <div className="flex flex-col gap-c-16">
          <p
            data-home-hero-badge
            className="border-brand-50/15 bg-brand-100/40 text-brand-30 body-xs tablet-portrait:body-sm inline-flex w-fit items-center gap-2 rounded-circular border px-4 py-2 tracking-wide backdrop-blur-sm"
          >
            <span className="bg-brand-50 h-1.5 w-1.5 shrink-0 rounded-full shadow-[0_0_8px_var(--color-brand-50)]" />
            {SITE.copy.hero.badge}
          </p>

          <h1
            data-home-hero-title
            className="font-barlow text-brand-05 text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.92em] font-bold tracking-[-0.02em]"
          >
            {SITE.copy.hero.title}
          </h1>

          <p
            data-home-hero-copy
            className="body-md tablet-portrait:body-lg mt-c-8 max-w-130 text-brand-05/75 leading-[1.65em]"
          >
            {SITE.copy.hero.description}
          </p>
        </div>

        <div data-home-hero-actions className="flex flex-wrap items-center gap-3">
          <GlassButtonLink href="/games" data-home-hero-cta compact>
            {SITE.copy.hero.primaryCta}
            <span aria-hidden="true"> →</span>
          </GlassButtonLink>
          <GlassButton
            type="button"
            data-home-hero-cta
            compact
            onClick={() => setContactOpen(true)}
          >
            {SITE.copy.hero.secondaryCta}
          </GlassButton>
        </div>

        <dl
          data-home-hero-stats
          className="tablet-portrait:grid-cols-4 grid grid-cols-2 gap-x-c-24 gap-y-c-16 border-t border-brand-05/10 pt-c-24"
        >
          {SITE.copy.hero.stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="sr-only">{label}</dt>
              <dd className="text-brand-50 font-barlow text-2xl leading-none font-bold tracking-tight tablet-portrait:text-3xl">
                {value}
              </dd>
              <dd className="body-xs text-brand-05/45 uppercase tracking-[0.14em]">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
      <ScrollIndicator />
    </section>
  );
}
