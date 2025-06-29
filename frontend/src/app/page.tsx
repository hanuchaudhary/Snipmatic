import { PricingSection } from "@/components/Landing/PricingSection";
import { FaqSection } from "@/components/Landing/FAQs";
import { HowItWorks } from "@/components/Landing/HowItWorks";
import { FeaturesSection } from "@/components/Landing/FeaturesSection";
import { ProblemSection } from "@/components/Landing/ProblemSection";
import { HeroSection } from "@/components/Landing/HeroSection";
import PlusIcon from "@/components/Landing/PlusIcon";
import LandingNavbar from "@/components/Landing/LandingNavbar";
import { Footer } from "@/components/Landing/Footer";

export default function Home() {
  return (
  <div className="px-5 pt-12 transition-transform">
      <LandingNavbar />
      <div className="relative max-w-5xl mx-auto flex min-h-screen flex-col border mt-10">
        <div className="absolute -top-4 -right-4">
          <PlusIcon />
        </div>
        <div className="absolute -bottom-4 -right-4">
          <PlusIcon />
        </div>
        <div className="absolute -top-4 -left-4">
          <PlusIcon />
        </div>
        <div className="absolute top-[642px] -right-4">
          <PlusIcon />
        </div>
        <HeroSection />
        <div className="h-4 border-b" />
        <ProblemSection />
        <div className="h-4 border-b" />
        <FeaturesSection />
        <HowItWorks />
        <PricingSection />
        <div className="h-4 border-b" />
        <FaqSection />
      </div>
        <Footer />
    </div>
  );
}
