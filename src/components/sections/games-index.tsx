"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GAMES } from "@/config/games";
import { DraggableGrid } from "@/components/ui/draggable-grid";
import { useScrollStore } from "@/stores/scroll-store";

export function GamesIndex() {
  const router = useRouter();
  const lenis = useScrollStore((s) => s.lenis);

  const gridItems = useMemo(
    () =>
      GAMES.map((game) => ({
        image: { src: game.cover, alt: game.title },
        alt: game.title,
        slug: game.slug,
      })),
    []
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("scroll-locked");
    lenis?.stop();

    return () => {
      root.classList.remove("scroll-locked");
      lenis?.start();
    };
  }, [lenis]);

  return (
    <main
      data-page-content
      className="fixed inset-x-0 top-0 z-10 flex h-screen flex-col overflow-hidden pt-[var(--spacing-navbar-height)]"
    >
      <section className="relative min-h-0 flex-1">
        <DraggableGrid
          items={gridItems}
          columns={17}
          imageWidth={386}
          imageHeight={516}
          rounded={2}
          gap={3}
          enableWheel
          className="h-full w-full"
          onItemClick={(item) => {
            if (item.slug) router.push(`/games/${item.slug}`);
          }}
          style={{ height: "100%", minHeight: 0 }}
        />
      </section>
    </main>
  );
}
