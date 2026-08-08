import { Footer } from "./footer";
import { HeroSection } from "./hero";
import GradualBlurMemo from "@/components/ui/gradual-blur";

export function LandingPage() {
  return (
    <div className="relative z-20 max-w-7xl mx-auto flex flex-col justify-center min-h-screen">
      <HeroSection />
      <GradualBlurMemo
        target="page"
        position="bottom"
        height="6rem"
        strength={5}
        divCount={5}
        curve="bezier"
        exponential={true}
        opacity={1}
      />
      <Footer />
    </div>
  );
}
