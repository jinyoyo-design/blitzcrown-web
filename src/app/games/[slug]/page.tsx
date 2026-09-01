import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/config/games";
import { GameDetail } from "@/components/sections/game-detail";

export function generateStaticParams() {
  return GAMES.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return { title: "Game — Blitzcrown" };
  return {
    title: `${game.title} — Blitzcrown`,
    description: game.hook,
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();
  return <GameDetail game={game} />;
}
