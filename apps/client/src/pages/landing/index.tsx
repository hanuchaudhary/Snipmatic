import { HeroSection } from "./hero";
import { Navbar } from "./navbar";
import { FeaturesSection } from "./features-section";
import { ClientsSection } from "./clients-section";
import { Footer } from "./footer";

export function LandingPage() {
  return (
    <div className="relative z-20 w-full">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ClientsSection />
      <Footer />
    </div>
  );
}
