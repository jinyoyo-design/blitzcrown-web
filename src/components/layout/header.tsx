"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/ui/brand-logo";
import { AnimatedTopDock, type DockItem } from "@/shaders/animated-top-dock/AnimatedTopDock";
import { useGlobalStore } from "@/stores/global-store";
import { useScrollStore } from "@/stores/scroll-store";
import { scrollToNavTarget } from "@/lib/nav-scroll";

const HEADER_DOCK_ITEMS: readonly DockItem[] = [
  {
    id: "about",
    label: "About us",
    icon: (
      <>
        <circle cx="8" cy="8" r="5.8" />
        <path d="M2.4 8c2.4-3.5 9-3.5 11.3 0" />
      </>
    ),
  },
  {
    id: "games",
    label: "games",
    icon: (
      <>
        <path d="M8 1.9 14.1 5v6L8 14.1 1.9 11V5z" />
        <path d="M1.9 5 8 8.1 14.1 5M8 8.1v6" />
      </>
    ),
  },
  {
    id: "contact",
    label: "Contact",
    icon: (
      <>
        <path d="M8.6 2.2H13v4.4l-6.6 6.6a1.2 1.2 0 0 1-1.7 0L2.2 10.5a1.2 1.2 0 0 1 0-1.7z" />
        <circle cx="10.6" cy="4.6" r=".9" />
      </>
    ),
  },
];

const NAV_TARGETS: Record<string, string> = {
  about: "/#home",
  games: "/#latest-games",
  contact: "/#contact",
};

export function Header() {
  const pathname = usePathname();
  const lenis = useScrollStore((s) => s.lenis);
  const setContactOpen = useGlobalStore((s) => s.setContactOpen);
  const [activeNav, setActiveNav] = useState(HEADER_DOCK_ITEMS[0].id);

  const scrollToHref = (href: string) => {
    if (href.startsWith("/#") && pathname === "/") {
      scrollToNavTarget(lenis, href.slice(1));
      window.history.replaceState(null, "", href);
      return;
    }

    if (href.startsWith("/#")) {
      window.location.href = href;
    }
  };

  const onLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setActiveNav("about");
    scrollToHref("/#home");
  };

  const onItemActivate = (id: string) => {
    const href = NAV_TARGETS[id];
    if (!href) return;

    setActiveNav(id);
    scrollToHref(href);

    if (id === "contact") {
      setContactOpen(true);
    }
  };

  const onPartnerClick = () => {
    setActiveNav("contact");
    scrollToHref("/#contact");
    setContactOpen(true);
  };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[1000000] px-4 tablet-portrait:px-8 wide:top-4">
      <div className="container pointer-events-auto mx-auto flex h-navbar-height w-full items-center gap-4 tablet-portrait:gap-6">
        <BrandLogo onClick={onLogoClick} className="site-header-logo" />

        <AnimatedTopDock
          variant="modern"
          shell="header"
          showBrand={false}
          className="min-w-0 flex-1"
          dockItems={HEADER_DOCK_ITEMS}
          activeId={activeNav}
          onItemActivate={(id) => onItemActivate(id)}
          showGhost={false}
          ctaLabel="Partner with Us"
          onCtaClick={onPartnerClick}
          proximity={122}
          spring={0.19}
          damping={0.7}
          widthGrowth={17}
          heightGrowth={16}
          drop={3.5}
        />
      </div>
    </header>
  );
}
