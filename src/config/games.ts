export const GAME_GENRES = [
  "all",
  "plinko",
  "crash",
  "tower",
  "cards",
] as const;

export type GameGenre = Exclude<(typeof GAME_GENRES)[number], "all">;

export type Game = {
  slug: string;
  title: string;
  genre: GameGenre;
  series?: string;
  hook: string;
  cover: string;
  logo?: string;
  background?: string;
};

function asset(slug: string, file: string) {
  return `/games/${slug}/${encodeURIComponent(file)}`;
}

function thumb(file: string) {
  return `/thumbnails/${file}`;
}

export const GAMES: Game[] = [
  {
    slug: "dragon-and-wizard",
    title: "Dragon & Wizard",
    genre: "crash",
    series: "Dragon & Wizard",
    hook: "The origin crash of the Dragon & Wizard world ??one curve, one cash-out.",
    cover: thumb("img-thumbnail-dragonwizard.png"),
    logo: asset("dragon-and-wizard", "logo_dragon&wizard.png"),
    background: asset("dragon-and-wizard", "bg_dragon&wizard.png"),
  },
  {
    slug: "dragon-and-wizard-fly2win",
    title: "Dragon & Wizard Fly2Win",
    genre: "crash",
    series: "Dragon & Wizard",
    hook: "The same world, a flight path ??cash out before the dragon drops.",
    cover: thumb("img-thumbnail-dragonwizardfly2win.png"),
    logo: asset("dragon-and-wizard-fly2win", "logo_dragon&wizard_fly2win.png"),
    background: asset("dragon-and-wizard-fly2win", "bg_dragon&wizard_fly2win.png"),
  },
  {
    slug: "dragon-and-wizard-jump2win",
    title: "Dragon & Wizard Jump2Win",
    genre: "crash",
    series: "Dragon & Wizard",
    hook: "Jump timing as the crash mechanic ??still one world, a new read.",
    cover: thumb("img-thumbnail-dragonwizardjump2win.png"),
    logo: asset("dragon-and-wizard-jump2win", "logo_dragon&wizard_jump2win.png"),
    background: asset("dragon-and-wizard-jump2win", "bg_dragon&wizard_jump2win.png"),
  },
  {
    slug: "crash",
    title: "Crash",
    genre: "crash",
    hook: "The classic multiplier climb. Hold, read the curve, get out.",
    cover: thumb("img-thumbnail-crash.png"),
    logo: asset("crash", "img_logo_crash.png"),
    background: asset("crash", "bg_crash.jpg"),
  },
  {
    slug: "fast-crash",
    title: "Fast Crash",
    genre: "crash",
    hook: "Shorter rounds, same crash grammar ??built for rapid sessions.",
    cover: thumb("img-thumbnail-fastcrash.png"),
    logo: asset("fast-crash", "img_logo_fastcrash.png"),
    background: asset("fast-crash", "bg_fastcrash.jpg"),
  },
  {
    slug: "fast-crash-blitz",
    title: "Fast Crash Blitz",
    genre: "crash",
    hook: "A blitz cut of Fast Crash ??denser rounds, same cash-out tension.",
    cover: thumb("img-thumbnail-fastcrashblitz.png"),
    logo: asset("fast-crash-blitz", "img_logo_fastcrash.png"),
    background: asset("fast-crash-blitz", "bg_fastcrash.png"),
  },
  {
    slug: "twin-crash",
    title: "Twin Crash",
    genre: "crash",
    hook: "Two curves in one round. Read both, or pick a side.",
    cover: thumb("img-thumbnail-twincrash.png"),
    logo: asset("twin-crash", "img_logo_twincrash.png"),
    background: asset("twin-crash", "bg_twincrash.jpg"),
  },
  {
    slug: "twin-crash-blitz",
    title: "Twin Crash Blitz",
    genre: "crash",
    hook: "Twin Crash at blitz pace ??two lines, less time to hesitate.",
    cover: thumb("img-thumbnail-twincrashblitz.png"),
    logo: asset("twin-crash-blitz", "img_logo_twincrash_blitz_120_120.png"),
    background: asset("twin-crash-blitz", "bg_twincrash.png"),
  },
  {
    slug: "double-pop-plinko-51200",
    title: "Double Pop Plinko 51200x",
    genre: "plinko",
    series: "Double Pop",
    hook: "The high-ceiling Double Pop ??same board language, a 51200x top.",
    cover: thumb("img-thumbnail-doublepopplinko51200x.png"),
    logo: asset("double-pop-plinko-51200", "img_logo_double_pop_plinko_51200.png"),
    background: asset("double-pop-plinko-51200", "img_bg_double_pop_plinko_51200.png"),
  },
  {
    slug: "boom-boom-hit-plinko",
    title: "Boom Boom Hit Plinko",
    genre: "plinko",
    hook: "Impact plinko ??every peg hit is meant to be felt.",
    cover: thumb("img-thumbnail-boomboomhitplinko.png"),
    logo: asset("boom-boom-hit-plinko", "img_logo_bbh_plinko.png"),
    background: asset("boom-boom-hit-plinko", "bg_bbh_plinko.jpg"),
  },
  {
    slug: "interstellar-plinko",
    title: "Interstellar Plinko",
    genre: "plinko",
    hook: "Plinko in deep space ??same drop, a wider visual scale.",
    cover: thumb("img-thumbnail-interstellarplinko.png"),
    logo: asset("interstellar-plinko", "img_logo_interstellar_plinko_120_120.png"),
    background: asset("interstellar-plinko", "bg_interstellar_plinko.jpg"),
  },
  {
    slug: "lollypop-plinko",
    title: "Lollypop Plinko",
    genre: "plinko",
    hook: "Candy-board plinko with colored pops on the way down.",
    cover: thumb("img-thumbnail-lollypopplinko.png"),
    logo: asset("lollypop-plinko", "logo_lollypopplinko.png"),
    background: asset("lollypop-plinko", "bg_lollypopplinko.png"),
  },
  {
    slug: "snowball-plinko",
    title: "Snowball Plinko",
    genre: "plinko",
    hook: "A winter drop ??snowballs instead of chips, same ladder math.",
    cover: thumb("img-thumbnail-snowballplinko.png"),
    logo: asset("snowball-plinko", "logo_snowballplinko.png"),
    background: asset("snowball-plinko", "bg_snowballplinko.png"),
  },
  {
    slug: "smash-tower",
    title: "Smash Tower",
    genre: "tower",
    hook: "Climb and smash ??pick the next block, or cash the height.",
    cover: thumb("img-thumbnail-smashtower.png"),
    logo: asset("smash-tower", "logo_smash_tower.png"),
    background: asset("smash-tower", "bg_smash_tower.png"),
  },
  {
    slug: "epic-strike-tower-of-zeus",
    title: "Epic Strike: Tower of Zeus",
    genre: "tower",
    hook: "A Zeus-themed climb. Timing and picks, not spinning reels.",
    cover: thumb("img-thumbnail-epicstriketowerofzeus.png"),
    logo: asset("epic-strike-tower-of-zeus", "logo_epicstrike.png"),
    background: asset("epic-strike-tower-of-zeus", "bg_epicstrike.png"),
  },
  {
    slug: "super-card-rush",
    title: "Super Card Rush",
    genre: "cards",
    hook: "Tabletop rush compressed into one instant-win round.",
    cover: thumb("img-thumbnail-supercardrush.png"),
    logo: asset("super-card-rush", "img_logo_supercardrush.png"),
    background: asset("super-card-rush", "img_bg_1.png"),
  },
  {
    slug: "nine-knights",
    title: "Nine Knights",
    genre: "cards",
    hook: "Nine-knight showdown ??a card duel resolved in one beat.",
    cover: thumb("img-thumbnail-nineknights.png"),
    logo: asset("nine-knights", "img_logo_nineknights.png"),
    background: asset("nine-knights", "bg_nineknights.png"),
  },
];

export const HERO_FLAGSHIP_SLUG = "dragon-and-wizard" as const;

export const LATEST_GAME_SLUGS = [
  "dragon-and-wizard",
  "dragon-and-wizard-fly2win",
  "dragon-and-wizard-jump2win",
  "double-pop-plinko-51200",
  "smash-tower",
  "boom-boom-hit-plinko",
  "twin-crash-blitz",
  "epic-strike-tower-of-zeus",
] as const;

export const GENRE_LABEL: Record<(typeof GAME_GENRES)[number], string> = {
  all: "All",
  plinko: "Plinko",
  crash: "Crash",
  tower: "Tower",
  cards: "Cards",
};

export function getGame(slug: string) {
  return GAMES.find((game) => game.slug === slug);
}

export function relatedGames(game: Game, limit = 3) {
  const sameSeries = game.series
    ? GAMES.filter((item) => item.slug !== game.slug && item.series === game.series)
    : [];
  const sameGenre = GAMES.filter(
    (item) => item.slug !== game.slug && item.genre === game.genre && !sameSeries.includes(item)
  );
  return [...sameSeries, ...sameGenre].slice(0, limit);
}
