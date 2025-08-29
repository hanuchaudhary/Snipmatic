import GradualBlurMemo from "@/components/Landing/Gradualblur";
import { HeroSection } from "@/components/Landing/HeroSection";
import { RaycastAnimatedBlackBackground } from "@/components/ui/raycast-animated-black-background";

export default function Home() {
  return (
    <div className="relative z-20 max-w-7xl mx-auto flex justify-center min-h-screen">
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
      <div className="fixed z-[-1] opacity-50 dark:block hidden">
        <RaycastAnimatedBlackBackground />
      </div>
    </div>
  );
}
