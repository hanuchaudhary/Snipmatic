import { HeroSection } from "./hero";
import { Navbar } from "./navbar";
import { FeaturesSection } from "./features-section";
import { ClientsSection } from "./clients-section";
import { Footer } from "./footer";
import PricingSection from "@/components/pricing-section";
import GradientASCII from "@/components/landing/gradient-ascii";

export function LandingPage() {
  return (
    <div className="relative z-20 w-full">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <div className="max-w-7xl mx-auto md:py-20 py-10">
        <PricingSection />
      </div>
      <ClientsSection />
      <Footer />
      <div className="absolute bottom-0 w-full h-150 rotate-180 opacity-50">
        <GradientASCII
          colors={["#1e3fd8", "#f6f8ff", "#a5d8ff", "#38bdf8"]}
          shape="horizon"
          characters=" =+xX0S8#@"
          cellSize={18}
          density={0.8}
          glyphOpacity={0.85}
          glow={0.2}
          depthOfField={0}
          flicker={0.2}
          softness={0.5}
          scale={1}
          flow={0.5}
          speed={1}
          gradientOpacity={0.9}
          grain={0.08}
          variation={0}
          mouseInteraction
          scrambleRadius={0.1}
          clickEffect="wave"
          intro
          // lightMode={theme === "light"}
        />
      </div>
    </div>
  );
}
