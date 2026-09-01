import type { Metadata } from "next";
import { GamesIndex } from "@/components/sections/games-index";

export const metadata: Metadata = {
  title: "Games ??Blitzcrown",
  description:
    "Discover our portfolio of original instant win games, carefully crafted to deliver unique mechanics and fresh ideas.",
};

export default function GamesPage() {
  return <GamesIndex />;
}
