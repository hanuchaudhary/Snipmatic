import { HeroSection } from "./hero";
import { Navbar } from "./navbar";

export function LandingPage() {
  return (
    <div className="relative z-20 w-full">
      <Navbar />
      <HeroSection />
      {/* <Footer /> */}
    </div>
  );
}
