import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { barlow } from "@/lib/fonts";
import { BlobBackground } from "@/components/gl/blob-background";
import { RigCanvas } from "@/components/gl/rig-canvas";
import { BootSequence } from "@/components/layout/boot-sequence";
import { ContactPanel } from "@/components/layout/contact-panel";
import { HashScroll } from "@/components/layout/hash-scroll";
import { Header } from "@/components/layout/header";
import { NoiseOverlay } from "@/components/layout/noise-overlay";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { ParticleScrollController } from "@/components/gl/particle-scroll-controller";
import { ScrollTextController } from "@/components/layout/scroll-text-controller";
import { CustomCursor } from "@/components/ui/custom-cursor";
import "./globals.css";
import "@/shaders/lumen-cta/lumen-cta.css";
import "@/shaders/animated-top-dock/animated-top-dock.css";

export const metadata: Metadata = {
  title: "Blitzcrown ??Original Instant Win Games",
  description:
    "B2B instant-win studio under Massive Gaming. Original crash, plinko, and arcade titles for operators ??not more games, better games.",
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} h-full antialiased`}
    >
      <body className="font-barlow flex min-h-full flex-col">
        <Script id="boot-scroll-top" strategy="beforeInteractive">
          {`(function(){try{if("scrollRestoration"in history)history.scrollRestoration="manual";var hash=location.hash;if(hash){if(hash!=="#home"&&hash!=="#about"){try{sessionStorage.setItem("bc-pending-hash",hash)}catch(e){}}history.replaceState(null,"",location.pathname+location.search)}else{try{sessionStorage.removeItem("bc-pending-hash")}catch(e){}}window.scrollTo(0,0);var p=location.pathname;if(p==="/games"){var n=performance.getEntriesByType("navigation")[0];if(n&&n.type==="reload"){location.replace("/");return;}}}catch(e){}})();`}
        </Script>
        <BlobBackground />
        <RigCanvas />
        <NoiseOverlay />
        <CustomCursor />
        <Header />
        <BootSequence />
        <ContactPanel />
        <ParticleScrollController />
        <ScrollTextController />
        <HashScroll />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
