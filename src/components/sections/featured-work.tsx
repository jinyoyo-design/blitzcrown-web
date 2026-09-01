"use client";

import { OutlineButton } from "@/components/ui/outline-button";
import { GlassButtonLink } from "@/components/ui/glass-button";
import { RotundaCarousel } from "@/components/ui/rotunda-carousel";
import { GAMES, LATEST_GAME_SLUGS } from "@/config/games";
import { SITE } from "@/config/site";

const LATEST_GAMES = LATEST_GAME_SLUGS.map((slug) => {
  const game = GAMES.find((item) => item.slug === slug)!;
  return {
    title: game.title,
    href: `/games/${game.slug}`,
    image: game.cover,
  };
});

const CAROUSEL_SCALE = 1.69;
const CAROUSEL_PANEL_WIDTH = Math.round(386 * CAROUSEL_SCALE);
const CAROUSEL_PANEL_HEIGHT = Math.round(516 * CAROUSEL_SCALE);
const CAROUSEL_DISTANCE = Math.round(96 * CAROUSEL_SCALE);

export function FeaturedWork() {
  return (
    <section
      id="latest-games"
      data-geometry="lightning"
      data-dissolve="in"
      data-start="bottom 100%"
      data-end="bottom -50%"
      className="-mt-c-80 scroll-mt-navbar-height pt-c-120 gap-c-48 flex flex-col"
    >
      <div className="container gap-c-16 mx-auto flex max-w-160 flex-col items-center px-8 text-center tablet-portrait:safearea-lg">
        <h2 className="js-s-lines body-md uppercase">{SITE.copy.latestGamesKicker}</h2>
        <p className="js-s-print-opacity heading-2 font-barlow leading-[1.1em]">
          {SITE.copy.catchphraseLine}
        </p>
        <p className="js-s-print-opacity body-md tablet-portrait:body-lg max-w-130 text-brand-05/60 leading-[1.65em]">
          {SITE.copy.catchphraseSupport}
        </p>
        <GlassButtonLink href="/games" className="relative z-10 mt-c-8">
          All games
        </GlassButtonLink>
      </div>

      <div className="relative h-[min(72vw,879px)] min-h-[473px] w-full tablet-portrait:h-[min(66vw,946px)] tablet-portrait:min-h-[541px] desktop:h-[min(58vw,1048px)]">
        <RotundaCarousel
          images={LATEST_GAMES.map((game) => ({ image: game.image }))}
          panelWidth={CAROUSEL_PANEL_WIDTH}
          panelHeight={CAROUSEL_PANEL_HEIGHT}
          fitToWidth={LATEST_GAMES.length}
          loop
          spinDirection="right"
          gap={0}
          rounded={3}
          distance={CAROUSEL_DISTANCE}
          tilt={0}
          speed={55}
          cursor={{ damping: 100, hover: 200 }}
          style={{ minHeight: "100%", height: "100%" }}
        />
      </div>
    </section>
  );
}
