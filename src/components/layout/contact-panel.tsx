"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useGlobalStore } from "@/stores/global-store";
import { ContactSelect } from "@/components/ui/contact-select";
import { GlassButton } from "@/components/ui/glass-button";
import { SITE } from "@/config/site";
import { cn } from "@/lib/cn";

const INTEREST_OPTIONS = [
  { value: "Game integration", label: "Game integration" },
  { value: "Full portfolio", label: "Full portfolio" },
  { value: "Partnership", label: "Partnership" },
  { value: "Something else", label: "Something else" },
] as const;

export function ContactPanel() {
  const open = useGlobalStore((s) => s.contactOpen);
  const setContactOpen = useGlobalStore((s) => s.setContactOpen);
  const [interest, setInterest] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContactOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setContactOpen]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setContactOpen(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close contact panel"
        onClick={() => setContactOpen(false)}
        className={cn(
          "fixed inset-0 z-[999999] bg-brand-100/40 transition-opacity duration-500",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <div
        className={cn(
          "fixed top-0 right-0 z-[1000000] h-screen w-105 max-w-full transition-transform duration-700",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 border-l border-r border-brand-10/10 bg-brand-100/40 backdrop-blur-3xl"
        />
        <section
          data-lenis-prevent
          data-carousel-ignore
          className="relative flex h-full flex-col justify-between overflow-y-auto"
        >
          <div className="flex flex-1 flex-col justify-between gap-3 px-c-16 pt-c-16 pb-3">
            <div>
              <div className="flex items-center justify-between gap-c-16">
                <h2 className="heading-3 font-barlow text-brand-05 italic">Contact</h2>
                <button
                  type="button"
                  data-event="hover"
                  aria-label="Close"
                  onClick={() => setContactOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-05/6 bg-brand-05/4"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
                    <path
                      d="M12.0205 0.707031L6.7168 6.01074L12.0205 11.3145L11.3135 12.0215L6.00977 6.71777L0.707031 12.0205L0 11.3135L5.30273 6.01074L0 0.708008L0.707031 0.000976562L6.00977 5.30371L11.3135 0L12.0205 0.707031Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>
              <p className="body-md">
                {SITE.copy.contactLead}{" "}
                <span className="font-semibold italic">Connect with us.</span>
              </p>
            </div>
            <a
              href={`mailto:${SITE.emails.sales}`}
              data-event="hover"
              className="body-md w-fit"
            >
              {SITE.emails.sales}
            </a>
          </div>

          <form className="flex flex-col" noValidate onSubmit={onSubmit}>
            <label
              data-event="hide"
              htmlFor="contact-name"
              className="relative h-20 max-h-[10vh] border-t border-brand-10/10 px-c-16 py-3"
            >
              <span className="body-xs pointer-events-none flex items-center gap-1.5">Name</span>
              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Your name"
                className="absolute inset-0 cursor-text! px-c-16 pt-6"
              />
            </label>
            <label
              data-event="hide"
              htmlFor="contact-email"
              className="relative h-20 max-h-[10vh] border-t border-brand-10/10 px-c-16 py-3"
            >
              <span className="body-xs pointer-events-none flex items-center gap-1.5">Email</span>
              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="you@operator.com"
                className="absolute inset-0 cursor-text! px-c-16 pt-6"
              />
            </label>
            <label
              data-event="hide"
              htmlFor="contact-company"
              className="relative h-20 max-h-[10vh] border-t border-brand-10/10 px-c-16 py-3"
            >
              <span className="body-xs pointer-events-none flex items-center gap-1.5">Company</span>
              <input
                id="contact-company"
                name="company"
                type="text"
                placeholder="Operator or studio"
                className="absolute inset-0 cursor-text! px-c-16 pt-6"
              />
            </label>

            <ContactSelect
              id="interest"
              label="Interest"
              placeholder="What can we help with?"
              value={interest}
              options={[...INTEREST_OPTIONS]}
              onChange={setInterest}
            />

            <label
              data-event="hide"
              htmlFor="contact-message"
              className="relative h-40 max-h-[20vh] border-t border-brand-10/10 px-c-16 py-3"
            >
              <span className="body-xs pointer-events-none flex items-center gap-1.5">Message</span>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Tell us about the market, titles, or integration timeline..."
                className="absolute inset-0 resize-none cursor-text! px-c-16 pt-9"
              />
            </label>
            <div className="flex items-center justify-center border-t border-brand-10/10 px-c-16 py-c-24">
              <GlassButton type="submit">Send message</GlassButton>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
