"use client";

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

/** Base card aspect; actual pixel size comes from fitToWidth × fitScale in RotundaCarousel. */
const CAROUSEL_PANEL_WIDTH = 386;
const CAROUSEL_PANEL_HEIGHT = 516;
/** 70% larger than the default fit (previous scale props were ignored by fitToWidth). */
const CAROUSEL_FIT_SCALE = 1.7;
const CAROUSEL_DISTANCE = 96;

export function FeaturedWork() {
  return (
    <section
      id="latest-games"
      data-geometry="lightning"
      data-dissolve="in"
      data-start="bottom 100%"
      data-end="bottom -50%"
      className="-mt-c-80 scroll-mt-navbar-height pt-c-120 flex flex-col gap-c-48"
    >
      <div className="container mx-auto flex max-w-160 flex-col items-center gap-c-16 px-8 text-center tablet-portrait:safearea-lg">
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

      <div className="relative z-10 h-[min(72vw,879px)] min-h-[473px] w-full pointer-events-auto tablet-portrait:h-[min(66vw,946px)] tablet-portrait:min-h-[541px] desktop:h-[min(58vw,1048px)]">
        <RotundaCarousel
          images={LATEST_GAMES.map((game) => ({ image: game.image }))}
          panelWidth={CAROUSEL_PANEL_WIDTH}
          panelHeight={CAROUSEL_PANEL_HEIGHT}
          fitToWidth={LATEST_GAMES.length}
          fitScale={CAROUSEL_FIT_SCALE}
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
