export const SITE = {
  name: "Blitzcrown",
  emails: {
    sales: "sales@blitzcrown.io",
    hello: "hello@blitzcrown.io",
    partners: "partners@blitzcrown.games",
  },
  nav: [
    { href: "/#home", label: "About us" },
    { href: "/#latest-games", label: "games" },
    { href: "/#contact", label: "Contact" },
  ],
  legal: {
    operator:
      "This site is operated by Massive Gaming Malta Limited, registration number C109221, having registered address at 97, Triq Windsor, Sliema, SLM 1853, Malta.",
    licence:
      "Massive Gaming Malta Limited is licensed and regulated by the MGA (Malta Gaming Authority), licence number MGA/B2B/1088/2025.",
    copyright: "Copyright © 2022 Massive Gaming Pty. Ltd. All rights reserved.",
    mgaVerification:
      "https://authorisation.mga.org.mt/verification.aspx?lang=EN&company=955deb11-b97d-498f-86c1-3c904da8aed0&details=1",
  },
  privacy: {
    effectiveDate: "21 August 2026",
  },
  copy: {
    preloader: {
      line1: "BEYOND MORE,",
      line2: "ORIGINAL GAMES.",
    },
    hero: {
      badge: "B2B iGaming Studio · GLI-Ready",
      title: "Blitzcrown",
      description:
        "Provably-fair, never-seen-before instant-win games across Crash, Plinko, Mines, Dice and Tower. Twelve originals, one integration, endless engagement.",
      primaryCta: "Explore the Portfolio",
      secondaryCta: "Talk to the Team",
      stats: [
        { value: "12", label: "Original Games" },
        { value: "5", label: "Game Genres" },
        { value: "51,200x", label: "Top Multiplier" },
        { value: "3", label: "Aggregator Partners" },
      ],
    },
    catchphrase: "BEYOND MORE, ORIGINAL GAMES.",
    catchphraseLine: "Twelve originals, zero clones.",
    catchphraseSupport:
      "Quality over quantity. Every title ships with a mechanic you won't find anywhere else — engineered for retention and built to certify.",
    gamesIntro:
      "Discover our portfolio of original instant win games, carefully crafted to deliver unique mechanics and fresh ideas.",
    contactLead: "Ready to explore partnership opportunities?",
    contactBody: "Have questions about our innovative games? Connect with us!",
    contactCta: {
      title: "Let's put your lobby ahead.",
      body: "Book a portfolio walkthrough and demo access. We'll get you from first call to live integration — fast.",
      linkedInLabel: "Connect on LinkedIn",
      linkedInUrl: "https://www.linkedin.com/company/massive-gaming",
    },
    latestGamesKicker: "Latest games",
    latestGamesLead:
      "Original instant win games with unique mechanics and fresh ideas—not a clone farm.",
    proofsHeading: "Built for operators",
    proofsLead:
      "A dedicated B2B mindset: clean design, strict compliance, and seamless onboarding. Launch fast and scale globally.",
  },
} as const;

export const FOOTER = {
  tagline: "A B2B games studio crafting instant-win originals for the modern iGaming lobby.",
  columns: [
    {
      title: "PRODUCT",
      links: [
        { label: "Games", href: "/games" },
        { label: "Genres", href: "/games" },
        { label: "Why Us", href: "/#home" },
      ],
    },
    {
      title: "COMPANY",
      links: [
        { label: "Partners", href: "/#contact" },
        { label: "Contact", href: "/#contact" },
        { label: "Careers", href: "mailto:hello@blitzcrown.io?subject=Careers" },
      ],
    },
    {
      title: "DISTRIBUTION",
      links: [
        { label: "Hub88", href: "https://hub88.io", external: true },
        { label: "EveryMatrix", href: "https://everymatrix.com", external: true },
        { label: "Esofthall" },
      ],
    },
  ],
  copyright: "© 2026 Blitzcrown. All rights reserved.",
  disclaimer:
    "Blitzcrown provides games to licensed operators only and does not offer real-money gambling to end users. All in-page game visuals are for demonstration purposes.",
  badges: "B2B provider · 18+ · Demo Play Only",
} as const;

export const DISTRIBUTION_PARTNERS = [
  {
    name: "Hub88",
    tagline: "Instant casino aggregation",
    href: "https://hub88.io",
    logo: null,
  },
  {
    name: "EveryMatrix",
    tagline: "Turnkey iGaming platform",
    href: "https://everymatrix.com",
    logo: "/partners/everymatrix.png",
  },
  {
    name: "Esofthall",
    tagline: "The Future of Innovation",
    logo: "/partners/esofthall.png",
  },
  {
    name: "FreeStyle Gaming",
    logo: "/partners/freestyle-gaming.png",
  },
  {
    name: "Mondogaming",
    logo: "/partners/mondogaming.png",
  },
  {
    name: "Uplatform",
    logo: "/partners/uplatform.png",
  },
  {
    name: "NOTiX Games",
    logo: "/partners/notix-games.png",
  },
  {
    name: "LTGame",
    logo: "/partners/ltgame.png",
  },
] as const;

export const PARTNER_PROOFS = [
  {
    title: "Single API. Multiple Games",
    body: "One integration unlocks the full instant-win slate—crash, plinko, tower, dice, and more.",
  },
  {
    title: "Certified and Licensed",
    body: "Independent testing bodies certify our games. MGA B2B licence MGA/B2B/1088/2025.",
  },
  {
    title: "33 Languages and ISO Currencies",
    body: "Localize and price without a rebuild. Bet-limit configurations included.",
  },
  {
    title: "Mobile and Desktop",
    body: "The same session quality on both surfaces—operators do not ship two clients.",
  },
] as const;

export const ABOUT = {
  hero: "WE ARE BLITZCROWN",
  lead: "Blitzcrown is a modern iGaming provider focused on non-traditional, instant-win experiences like crash and plinko. Our philosophy is simple: Not more games, better games.",
  build: "Each title is developed on a foundation of casino game theory and quantitative design, creating a game flow that is both deep and intuitive. We polish every moment with intuitive audio-visual feedback, ensuring every action lands with clarity and impact.",
  b2b: "We operate with a dedicated B2B mindset—prioritizing clean design, strict compliance, and seamless onboarding. With support for all major languages, currencies, and bet-limit configurations, our partners can launch fast and scale globally with confidence.",
  rgTitle: "Responsible Gaming",
  rg: "We are strongly committed to responsible gaming. We design our games with fairness and player protection at their core. To ensure full transparency and integrity, our games are certified by reputable, independent testing bodies. We proudly uphold the highest industry standards and regulatory requirements, and are actively working to expand our licensing into new markets to deliver a trusted and sustainable entertainment experience for all.",
  pillars: [
    {
      title: "User Protection",
      body: "We put players first. Our games are built to be fair and safe, making sure everyone has a fun and secure time.",
    },
    {
      title: "Compliance",
      body: "We always follow the strictest rules and laws of the gaming industry. We're also working hard to get more licenses in new countries.",
    },
    {
      title: "Transparency & Integrity",
      body: "We maintain full transparency in our operations and game mechanics, ensuring a fair and trustworthy environment for all.",
    },
  ],
} as const;
