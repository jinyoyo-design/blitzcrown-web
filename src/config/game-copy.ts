export type GameCopy = {
  mechanic: string;
  beats: readonly [string, string, string];
};

export const GAME_COPY: Record<string, GameCopy> = {
  "dragon-and-wizard": {
    mechanic:
      "The flagship Dragon & Wizard crash: a single rising multiplier tied to the duel between dragon and wizard. Players cash out before the curve busts ??fantasy art, classic crash math.",
    beats: [
      "Signature Blitzcrown crash with character-led presentation",
      "One curve, one cash-out decision per round",
      "Anchor title for the Dragon & Wizard series",
    ],
  },
  "dragon-and-wizard-fly2win": {
    mechanic:
      "Same universe, flight-path crash. The multiplier climbs along the dragon's route ??cash out before the drop. A vertical read on crash instead of a flat curve.",
    beats: [
      "Flight-path multiplier tied to dragon movement",
      "Series variant without changing core crash logic",
      "Strong aerial art direction for mobile-first play",
    ],
  },
  "dragon-and-wizard-jump2win": {
    mechanic:
      "Jump-timing crash in the Dragon & Wizard world. The multiplier advances on jump beats ??players read height and timing, then cash out before the fall.",
    beats: [
      "Jump cadence replaces a standard climb animation",
      "Same cash-out grammar as the rest of the series",
      "Distinct mechanic skin on shared crash infrastructure",
    ],
  },
  crash: {
    mechanic:
      "The baseline Blitzcrown crash: stake, watch the multiplier rise, cash out before bust. Clean UI, fast rounds, no extra layers ??the reference implementation.",
    beats: [
      "Pure multiplier curve with manual cash-out",
      "Minimal presentation for operator white-labeling",
      "Short round time built for repeat sessions",
    ],
  },
  "fast-crash": {
    mechanic:
      "Crash at a faster tempo. Shorter climbs, quicker busts, same cash-out rule ??tuned for players who want more rounds per minute.",
    beats: [
      "Accelerated round pacing vs standard Crash",
      "Identical cash-out decision, tighter time window",
      "Suited to quick mobile sessions",
    ],
  },
  "fast-crash-blitz": {
    mechanic:
      "The blitz cut of Fast Crash ??even denser round turnover with heightened visual energy. Hold the line or exit before the blitz bust.",
    beats: [
      "Fastest crash cadence in the Fast Crash family",
      "High-energy blitz presentation layer",
      "For lobbies that prioritise throughput",
    ],
  },
  "twin-crash": {
    mechanic:
      "Two multiplier curves in one round. Track both lines, split attention, or commit to one side ??then cash out before either busts.",
    beats: [
      "Dual-curve crash in a single round",
      "Extra read for players who want more tension",
      "Distinct from single-line crash without new math class",
    ],
  },
  "twin-crash-blitz": {
    mechanic:
      "Twin Crash at blitz speed. Two lines, less time to decide ??the same dual-curve idea with a faster session rhythm.",
    beats: [
      "Two curves with blitz-round timing",
      "Higher decision pressure than Twin Crash",
      "Pairs well with high-engagement lobbies",
    ],
  },
  "double-pop-plinko-51200": {
    mechanic:
      "Double Pop Plinko with a high-ceiling board ??the 51200x top slot is the headline, with the same double-pop beat after the initial drop.",
    beats: [
      "51200x ceiling as the operator-facing hook",
      "Double Pop second-chance layer retained",
      "Premium art and ball variants for flagship placement",
    ],
  },
  "boom-boom-hit-plinko": {
    mechanic:
      "Impact-led plinko ??every peg hit is punchy audio-visually. Drop, ricochet, settle; the board sells physical contact, not passive falling.",
    beats: [
      "Hit-feedback-forward plinko presentation",
      "Standard drop-and-slot settlement",
      "Arcade impact feel for casual instant-win players",
    ],
  },
  "interstellar-plinko": {
    mechanic:
      "Plinko set in deep space ??same drop mechanics, cosmic scale in the art. Ball trajectories feel wider; settlement stays instant.",
    beats: [
      "Space-themed skin on standard plinko flow",
      "Wide visual scale for hero lobby placement",
      "Instant peg-board settlement unchanged",
    ],
  },
  "lollypop-plinko": {
    mechanic:
      "Candy-board plinko with coloured pops on the way down. Sweet theme, readable multipliers, drop-and-settle pacing for casual sessions.",
    beats: [
      "Candy visual layer with coloured pop beats",
      "Casual-friendly art direction",
      "Standard plinko settlement underneath",
    ],
  },
  "snowball-plinko": {
    mechanic:
      "Winter plinko ??snowballs replace chips on a frost board. Same ladder math, cold-weather character art, instant result after the drop.",
    beats: [
      "Winter character and snowball presentation",
      "Seasonal variant for Q4 campaigns",
      "Drop-and-settle plinko core unchanged",
    ],
  },
  "smash-tower": {
    mechanic:
      "Climb a tower by smashing blocks ??each safe pick raises the multiplier. Cash out your height or keep climbing until a block fails.",
    beats: [
      "Step-climb with hammer smash feedback",
      "Optional cash-out at any reached height",
      "Arcade tower pacing, not slot spin timing",
    ],
  },
  "epic-strike-tower-of-zeus": {
    mechanic:
      "Zeus-themed tower climb. Pick stones, dodge strikes, raise the multiplier ??mythic presentation on the same climb-or-cash grammar.",
    beats: [
      "Greek myth art with stone-pick climb loop",
      "Epic Strike presentation layer",
      "Cash-out-or-continue tension on every step",
    ],
  },
  "super-card-rush": {
    mechanic:
      "A full card rush compressed into one instant-win beat. Draw, reveal, settle ??tabletop energy without waiting through a shoe.",
    beats: [
      "Multi-card reveal in a single round",
      "Tabletop rush pacing, instant settlement",
      "Rich card art for casino-adjacent lobbies",
    ],
  },
  "nine-knights": {
    mechanic:
      "Nine knights face off in a card duel resolved in one beat. Red vs blue tension, instant outcome, medieval stadium presentation.",
    beats: [
      "Knight duel compressed to one round",
      "Red/blue faction read for quick decisions",
      "Character-led cards art direction",
    ],
  },
};
