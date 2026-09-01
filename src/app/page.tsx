import { Hero } from "@/components/sections/hero";
import { FeaturedWork } from "@/components/sections/featured-work";
import { ContactSection } from "@/components/sections/contact-section";
import { Footer } from "@/components/sections/footer";

export default function HomePage() {
  return (
    <main data-page-content className="container relative z-10">
      <Hero />
      <FeaturedWork />
      <ContactSection />
      <Footer />
    </main>
  );
}
