"use client";

import Link from "next/link";
import { PARTNER_PROOFS } from "@/config/site";
import { GENRE_LABEL, relatedGames, type Game } from "@/config/games";
import { getGameProfile } from "@/lib/games/profile";
import { OutlineButton } from "@/components/ui/outline-button";
import { GlassButtonLink } from "@/components/ui/glass-button";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Footer } from "@/components/sections/footer";
import { useGlobalStore } from "@/stores/global-store";

export function GameDetail({ game }: { game: Game }) {
  const setContactOpen = useGlobalStore((s) => s.setContactOpen);
  const related = relatedGames(game);
  const profile = getGameProfile(game);

  return (
    <main data-page-content className="container relative z-10">
      <section className="mt-navbar-height relative isolate min-h-hero-screen-height overflow-hidden">
        <div className="absolute inset-0">
          <img src={game.background ?? game.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/55" />
        </div>
        <div className="tablet-portrait:px-12 desktop:px-24 relative z-10 flex min-h-hero-screen-height flex-col justify-end gap-c-16 px-8 pb-16">
          <p className="body-xs uppercase tracking-wide text-brand-05/60">
            {GENRE_LABEL[game.genre]}
            {game.series ? ` · ${game.series}` : ""}
          </p>
          {game.logo ? (
            <img src={game.logo} alt="" className="h-16 w-auto object-contain" />
          ) : null}
          <h1 className="heading-1 font-barlow max-w-160">{game.title}</h1>
          <p className="body-lg max-w-140 text-brand-05/80">{game.hook}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <OutlineButton onClick={() => setContactOpen(true)}>Request this title</OutlineButton>
            <GlassButtonLink href="/games">All games</GlassButtonLink>
          </div>
        </div>
      </section>

      <section className="tablet-portrait:px-12 desktop:px-24 gap-c-80 flex flex-col px-8 pt-c-80 pb-c-80">
        <div className="tablet-portrait:grid-cols-2 grid gap-c-32">
          <ScrollReveal>
            <div>
              <h2 className="heading-3 font-barlow">The mechanic</h2>
              <p className="body-md mt-c-16 max-w-100 text-brand-05/75">{profile.mechanic}</p>
              <p className="body-md mt-c-16 max-w-100 text-brand-05/60 italic">{game.hook}</p>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <ol className="flex flex-col gap-4">
              {profile.beats.map((beat, index) => (
                <li key={beat} className="flex gap-4">
                  <span className="heading-6 font-barlow text-brand-05/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="body-md text-brand-05/75">{beat}</p>
                </li>
              ))}
            </ol>
          </ScrollReveal>
        </div>

        {profile.gallery.length > 0 ? (
          <ScrollReveal>
            <div>
              <h2 className="heading-5 font-barlow mb-c-24">Key art</h2>
              <div className="tablet-portrait:grid-cols-2 desktop:grid-cols-4 grid gap-c-16">
                {profile.gallery.map((src) => (
                  <div key={src} className="aspect-[772/1032] overflow-hidden bg-brand-100/20">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ) : null}

        <div className="tablet-portrait:grid-cols-2 grid gap-c-32">
          <ScrollReveal>
            <div>
              <h2 className="heading-3 font-barlow">For operators</h2>
              <p className="body-md mt-c-16 max-w-100 text-brand-05/75">
                Same Blitzcrown stack as the rest of the slate: one API, configurable limits,
                languages and currencies, mobile and desktop.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid gap-3">
            {PARTNER_PROOFS.map((proof) => (
              <p key={proof.title} className="body-sm text-brand-05/70">
                <span className="text-brand-05">{proof.title}.</span> {proof.body}
              </p>
            ))}
          </div>
        </div>

        {related.length > 0 ? (
          <div>
            <h2 className="heading-5 font-barlow mb-c-24">Related titles</h2>
            <div className="tablet-portrait:grid-cols-3 grid gap-c-24">
              {related.map((item) => (
                <Link key={item.slug} href={`/games/${item.slug}`} data-event="hover" className="group">
                  <div className="aspect-[772/1032] overflow-hidden">
                    <img
                      src={item.cover}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="heading-6 font-barlow mt-3">{item.title}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
      <Footer />
    </main>
  );
}
