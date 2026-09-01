"use client";

import { DISTRIBUTION_PARTNERS, SITE } from "@/config/site";
import { GlassButtonLink } from "@/components/ui/glass-button";

type Partner = (typeof DISTRIBUTION_PARTNERS)[number];

function PartnerMark({ partner }: { partner: Partner }) {
  const { name } = partner;
  const tagline = "tagline" in partner ? partner.tagline : undefined;
  const logo = "logo" in partner ? partner.logo : null;
  const href = "href" in partner ? partner.href : undefined;

  const content = (
    <>
      {logo ? (
        <img
          src={logo}
          alt={name}
          draggable={false}
          className="h-9 max-w-[150px] object-contain opacity-65 brightness-0 invert transition-opacity duration-300 group-hover:opacity-100 tablet-portrait:h-10 tablet-portrait:max-w-[170px]"
        />
      ) : (
        <span className="heading-5 font-barlow text-brand-05/55 transition-colors duration-300 group-hover:text-brand-05/85">
          {name}
        </span>
      )}
      {tagline ? (
        <span className="body-xs text-brand-05/35 mt-2 max-w-40 leading-[1.5em] transition-colors duration-300 group-hover:text-brand-05/55">
          {tagline}
        </span>
      ) : null}
    </>
  );

  const className =
    "group flex min-h-24 flex-col items-center justify-center px-3 text-center tablet-portrait:min-h-28 tablet-portrait:px-4";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-event="hover"
        className={className}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

export function ContactSection() {
  const { contactCta } = SITE.copy;

  return (
    <section
      data-hero-offset="left"
      className="scroll-mt-navbar-height relative z-10 px-8 pt-c-160 pb-c-160 tablet-portrait:px-12 desktop:px-24"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-c-80">
        <div
          id="partners"
          data-geometry="lightning"
          className="scroll-mt-navbar-height flex flex-col items-center gap-c-32 text-center"
        >
          <div className="flex flex-col gap-c-8">
            <p className="body-xs text-brand-50 font-barlow font-semibold tracking-[0.22em] uppercase">
              Our partners
            </p>
            <h2 className="heading-2 font-barlow">Trusted by industry leaders</h2>
          </div>

          <div className="tablet-portrait:grid-cols-3 desktop:grid-cols-4 grid w-full gap-x-c-24 gap-y-c-32">
            {DISTRIBUTION_PARTNERS.map((partner) => (
              <PartnerMark key={partner.name} partner={partner} />
            ))}
          </div>
        </div>

        <div className="border-brand-05/10 border-t" />

        <div
          data-contact-cta-row
          className="tablet-landscape:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] grid items-start gap-x-c-64 gap-y-c-48"
        >
          <div
            data-contact-lightning-anchor
            className="tablet-landscape:flex tablet-landscape:self-stretch tablet-landscape:items-center tablet-landscape:justify-center pointer-events-none hidden"
            aria-hidden="true"
          />

          <div
            id="contact"
            className="scroll-mt-navbar-height relative z-20 flex flex-col items-center gap-c-24 text-center tablet-landscape:items-start tablet-landscape:text-left"
          >
            <div
              data-contact-copy-align
              className="flex w-full max-w-130 flex-col gap-c-24"
            >
              <h2 className="heading-2 font-barlow text-brand-05 leading-[1.05em] tracking-[-0.02em]">
                {contactCta.title}
              </h2>

              <p className="body-lg text-brand-05/55 leading-[1.65em]">
                {contactCta.body}
              </p>
            </div>

            <div className="flex w-full max-w-130 flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center tablet-landscape:justify-start">
              <a
                href={`mailto:${SITE.emails.partners}`}
                data-event="hover"
                className="body-sm inline-flex min-h-11 items-center justify-center rounded-circular bg-brand-50 px-6 py-3 font-semibold text-brand-100 shadow-[0_0_28px_color-mix(in_srgb,var(--color-brand-50)_42%,transparent)] transition-[filter,transform] duration-300 hover:brightness-110"
              >
                {SITE.emails.partners}
              </a>

              <GlassButtonLink
                href={contactCta.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                compact
                className="min-h-11 justify-center px-6"
              >
                {contactCta.linkedInLabel}
              </GlassButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
