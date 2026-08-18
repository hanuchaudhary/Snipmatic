import { Footer } from "./footer";
import { HeroSection } from "./hero";
import GradualBlurMemo from "@/components/ui/gradual-blur";

export function LandingPage() {
  return (
    <div className="relative z-20 w-full">
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
