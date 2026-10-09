import { HeroSection } from "./hero";
import { Navbar } from "./navbar";
import { FeaturesSection } from "./features-section";
import { ClientsSection } from "./clients-section";
import { Footer } from "./footer";
import PricingSection from "@/components/pricing-section";

export function LandingPage() {
  return (
    <div className="relative z-20 w-full">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <div className="max-w-7xl mx-auto py-20">
        <PricingSection />
      </div>
      <ClientsSection />
      <Footer />
    </div>
  );
}
