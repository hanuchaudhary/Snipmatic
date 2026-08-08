import { CtaBanner } from "./cta-banner";
import { Features } from "./features";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { Navbar } from "./navbar";
import { Pricing } from "./pricing";

export function LandingPage() {
  return (
    <div className="min-h-screen max-w-6xl mx-auto">
      <Navbar />
      <div className="border-x">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CtaBanner />
        <Footer />
      </div>
    </div>
  );
}
