import type { Game, GameGenre } from "@/config/games";
import { GAME_COPY } from "@/config/game-copy";

function asset(slug: string, file: string) {
  return `/games/${slug}/${encodeURIComponent(file)}`;
}

export type GameProfile = {
  mechanic: string;
  beats: readonly [string, string, string];
  gallery: string[];
};

const GENRE_PROFILE: Record<
  GameGenre,
  { mechanic: string; beats: readonly [string, string, string] }
> = {
  crash: {
    mechanic:
      "Players stake, watch a multiplier climb in real time, and cash out before the round busts. One curve, one decision ??built for short mobile sessions.",
    beats: [
      "Real-time multiplier curve with manual cash-out",
      "Round resolves in seconds, not spins",
      "Same crash grammar across the Blitzcrown crash slate",
    ],
  },
  plinko: {
    mechanic:
      "A ball drops through a peg board into multiplier slots. Physics-led pacing, instant settlement, and room for Double Pop variants on the same ladder math.",
    beats: [
      "Drop-and-settle loop with visible peg hits",
      "Configurable boards and seasonal skins",
      "Double Pop family adds a second-chance beat",
    ],
  },
  tower: {
    mechanic:
      "Players climb a tower by picking the next safe block ??or cash out the height they have reached. Risk ramps with every step; no reel spin required.",
    beats: [
      "Step-by-step risk with optional early cash-out",
      "Clear audio-visual feedback on each pick",
      "Arcade climb pacing, not slot timing",
    ],
  },
  cards: {
    mechanic:
      "Table-game tension compressed into one instant-win round. Baccarat, poker, or duel logic ??resolved in a single beat with stadium-scale presentation.",
    beats: [
      "Familiar table math, instant settlement",
      "Stadium or duel presentation layers",
      "No waiting through full shoe cycles",
    ],
  },
};

const GAME_GALLERY: Partial<Record<string, string[]>> = {
  "dragon-and-wizard": [
    asset("dragon-and-wizard", "bg_dragon&wizard.png"),
    asset("dragon-and-wizard", "img_dragon_1.png"),
    asset("dragon-and-wizard", "img_wizard_1.png"),
    asset("dragon-and-wizard", "img_wizard_2.png"),
  ],
  "dragon-and-wizard-fly2win": [
    asset("dragon-and-wizard-fly2win", "bg_dragon&wizard_fly2win.png"),
    asset("dragon-and-wizard-fly2win", "img_dragon.png"),
    asset("dragon-and-wizard-fly2win", "img_item_1.png"),
    asset("dragon-and-wizard-fly2win", "img_item_2.png"),
  ],
  "dragon-and-wizard-jump2win": [
    asset("dragon-and-wizard-jump2win", "bg_dragon&wizard_jump2win.png"),
    asset("dragon-and-wizard-jump2win", "img_dragon_2.png"),
    asset("dragon-and-wizard-jump2win", "img_top.png"),
    asset("dragon-and-wizard-jump2win", "thumbnail_dragon&wizard_jump2win.png"),
  ],
  crash: [
    asset("crash", "bg_crash.jpg"),
    asset("crash", "img_crash_1.png"),
    asset("crash", "img_crash_2.png"),
    asset("crash", "img_crash_3.png"),
  ],
  "fast-crash": [
    asset("fast-crash", "bg_fastcrash.jpg"),
    asset("fast-crash", "bg_fastcrash_bg.png"),
    asset("fast-crash", "img_logo_fastcrash_1.png"),
    asset("fast-crash", "thumbnail_fastcrash.png"),
  ],
  "fast-crash-blitz": [
    asset("fast-crash-blitz", "bg_fastcrash.png"),
    asset("fast-crash-blitz", "img_fastcrash_2.png"),
    asset("fast-crash-blitz", "img_fastcrash_3.png"),
    asset("fast-crash-blitz", "img_fastcrash_blitz.png"),
  ],
  "twin-crash": [
    asset("twin-crash", "bg_twincrash.jpg"),
    asset("twin-crash", "img_logo_twincrash.png"),
    asset("twin-crash", "thumbnail_twincrash.png"),
    asset("twin-crash", "img_icon_twincrash.png"),
  ],
  "twin-crash-blitz": [
    asset("twin-crash-blitz", "bg_twincrash.png"),
    asset("twin-crash-blitz", "img_logo_twincrash_blitz_120_120.png"),
    asset("twin-crash-blitz", "img_icon_twincrash_blitz_b.png"),
    asset("twin-crash-blitz", "img_thubmnail_twincrash_blitz_376_250.png"),
  ],
  "double-pop-plinko-51200": [
    asset("double-pop-plinko-51200", "img_bg_double_pop_plinko_51200.png"),
    asset("double-pop-plinko-51200", "img_ball_double_pop_plinko_51200.png"),
    asset("double-pop-plinko-51200", "img_ball_double_pop_plinko_51200-3.png"),
    asset("double-pop-plinko-51200", "img_logo_double_pop_plinko_51200.png"),
  ],
  "boom-boom-hit-plinko": [
    asset("boom-boom-hit-plinko", "bg_bbh_plinko.jpg"),
    asset("boom-boom-hit-plinko", "img_logo_bbh_plinko.png"),
    asset("boom-boom-hit-plinko", "thumbnail_bbh_plinko.png"),
    asset("boom-boom-hit-plinko", "img_icon_bbh_plinko.png"),
  ],
  "interstellar-plinko": [
    asset("interstellar-plinko", "bg_interstellar_plinko.jpg"),
    asset("interstellar-plinko", "img_logo_interstellar_plinko_120_120.png"),
    asset("interstellar-plinko", "img_thubmnail_interstellar_plinko_376_250.png"),
    asset("interstellar-plinko", "img_icon_interstellar_plinko_b.png"),
  ],
  "lollypop-plinko": [
    asset("lollypop-plinko", "bg_lollypopplinko.png"),
    asset("lollypop-plinko", "img_candy_1.png"),
    asset("lollypop-plinko", "img_candy_3.png"),
    asset("lollypop-plinko", "logo_lollypopplinko_b.png"),
  ],
  "snowball-plinko": [
    asset("snowball-plinko", "bg_snowballplinko.png"),
    asset("snowball-plinko", "img_snowballplinko_character.png"),
    asset("snowball-plinko", "img_ball_1.png"),
    asset("snowball-plinko", "img_ball_3.png"),
  ],
  "smash-tower": [
    asset("smash-tower", "bg_smash_tower_color.png"),
    asset("smash-tower", "img_item_gold.png"),
    asset("smash-tower", "img_item_diamond.png"),
    asset("smash-tower", "img_item_hammer.png"),
  ],
  "epic-strike-tower-of-zeus": [
    asset("epic-strike-tower-of-zeus", "bg_epicstrike.png"),
    asset("epic-strike-tower-of-zeus", "img_zeus_1.png"),
    asset("epic-strike-tower-of-zeus", "img_stone_1.png"),
    asset("epic-strike-tower-of-zeus", "logo_epicstrike_1.png"),
  ],
  "super-card-rush": [
    asset("super-card-rush", "img_bg_2.png"),
    asset("super-card-rush", "img_card_1.png"),
    asset("super-card-rush", "img_card_7.png"),
    asset("super-card-rush", "img_card_12.png"),
  ],
  "nine-knights": [
    asset("nine-knights", "bg_nineknights.png"),
    asset("nine-knights", "img_nineknights_character.png"),
    asset("nine-knights", "img_red.png"),
    asset("nine-knights", "img_blue.png"),
  ],
};

function defaultGallery(game: Game) {
  return [game.cover, game.background].filter(
    (src, index, list): src is string => !!src && list.indexOf(src) === index
  );
}

export function getGameProfile(game: Game): GameProfile {
  const genre = GENRE_PROFILE[game.genre];
  const copy = GAME_COPY[game.slug];
  return {
    mechanic: copy?.mechanic ?? genre.mechanic,
    beats: copy?.beats ?? genre.beats,
    gallery: GAME_GALLERY[game.slug] ?? defaultGallery(game),
  };
}

export const HERO_GAME_LOOP_FRAMES = [
  "/thumbnails/img-thumbnail-dragonwizard.png",
  "/thumbnails/img-thumbnail-dragonwizardfly2win.png",
  "/thumbnails/img-thumbnail-dragonwizardjump2win.png",
  "/thumbnails/img-thumbnail-crash.png",
] as const;
