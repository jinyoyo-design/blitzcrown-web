"use client";

import { SITE } from "@/config/site";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Footer } from "@/components/sections/footer";

const SECTIONS = [
  {
    title: "Who we are",
    body: [
      `${SITE.legal.operator} ${SITE.legal.licence} In this policy, ?�Blitzcrown?? ?�we?? ?�us?? and ?�our??refer to Massive Gaming Malta Limited.`,
      "This website is a B2B marketing site for operators and partners. It is not a consumer gaming platform.",
    ],
  },
  {
    title: "Information we collect",
    body: [
      "Contact details you choose to share ??such as your name, company, email address, and message ??when you write to us or use the contact panel.",
      "Technical data your browser sends automatically, including IP address, device type, browser type, referring URL, and approximate location derived from IP.",
      "Usage data about how you interact with this site, such as pages viewed and time spent, collected through standard server logs and, where enabled, analytics tools.",
    ],
  },
  {
    title: "How we use information",
    body: [
      "To respond to sales, partnership, and general inquiries.",
      "To operate, secure, and improve this website.",
      "To comply with legal, regulatory, and licensing obligations.",
      "We do not sell personal data.",
    ],
  },
  {
    title: "Legal basis",
    body: [
      "Where required by applicable law, we process personal data on the basis of legitimate interests in operating a B2B website and communicating with prospective partners, your consent where you submit a form or email us, and legal obligation where regulation requires retention or disclosure.",
    ],
  },
  {
    title: "Sharing and retention",
    body: [
      "We may share information with service providers that host or support this website, professional advisers, and regulators or authorities when the law requires it.",
      "We keep contact correspondence for as long as needed to manage the relationship and meet legal or licensing requirements, then delete or anonymise it.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "Depending on your location, you may have rights to access, correct, delete, restrict, or object to processing of your personal data, and to lodge a complaint with a supervisory authority.",
      `To exercise these rights, contact us at ${SITE.emails.hello}.`,
    ],
  },
  {
    title: "Cookies",
    body: [
      "This site may use essential cookies required for security and basic operation. If analytics or preference cookies are added later, this policy will be updated and, where required, consent will be collected before they are set.",
    ],
  },
  {
    title: "Changes",
    body: [
      `We may update this policy from time to time. The effective date at the top of this page shows when it was last revised.`,
    ],
  },
] as const;

export function PrivacyContent() {
  return (
    <main data-page-content className="container relative z-10">
      <section className="mt-navbar-height tablet-portrait:px-12 desktop:px-24 px-8 pt-20 pb-12">
        <ScrollReveal asChild>
          <h1 className="heading-2 font-barlow max-w-160">Privacy Policy</h1>
        </ScrollReveal>
        <ScrollReveal asChild>
          <p className="body-sm mt-c-16 text-brand-05/50">
            Effective {SITE.privacy.effectiveDate}
          </p>
        </ScrollReveal>
        <ScrollReveal asChild>
          <p className="body-md mt-c-24 max-w-140 text-brand-05/75">
            This policy explains how Massive Gaming Malta Limited collects and uses personal data
            when you visit blitzcrown.io or contact us about partnership opportunities.
          </p>
        </ScrollReveal>

        <div className="mt-c-48 max-w-140 flex flex-col gap-c-32">
          {SECTIONS.map((section) => (
            <ScrollReveal key={section.title}>
              <div>
                <h2 className="heading-5 font-barlow">{section.title}</h2>
                <div className="mt-c-12 flex flex-col gap-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="body-md text-brand-05/70">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}

          <ScrollReveal>
            <div>
              <h2 className="heading-5 font-barlow">Contact</h2>
              <p className="body-md mt-c-12 text-brand-05/70">
                Questions about this policy or your data:{" "}
                <a href={`mailto:${SITE.emails.hello}`} className="underline">
                  {SITE.emails.hello}
                </a>
                .
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
      <Footer />
    </main>
  );
}
