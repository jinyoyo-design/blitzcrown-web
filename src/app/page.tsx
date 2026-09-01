import { Hero } from "@/components/sections/hero";
import { Intro } from "@/components/sections/intro";
import { FeaturedWork } from "@/components/sections/featured-work";
import { AboutSection } from "@/components/sections/about-section";
import { ContactSection } from "@/components/sections/contact-section";
import { Footer } from "@/components/sections/footer";

export default function HomePage() {
  return (
    <main data-page-content className="container relative z-10">
      <Hero />
      <Intro />
      <FeaturedWork />
      <AboutSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
