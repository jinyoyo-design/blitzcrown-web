import type { Metadata } from "next";
import { PrivacyContent } from "@/components/sections/privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy ??Blitzcrown",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
