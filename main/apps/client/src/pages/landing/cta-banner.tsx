import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRightIcon } from "lucide-react";

import AnimatedGradientBackground from "@/components/animated-gradient-bg";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-black px-4 py-24">
      <AnimatedGradientBackground
        startingGap={140}
        Breathing
        breathingRange={6}
        animationSpeed={0.012}
        gradientColors={["#000000", "#0d0d1a", "#1a1060", "#2979FF", "#FF80AB", "#3D5AFE", "#000000"]}
        gradientStops={[20, 35, 50, 65, 78, 90, 100]}
        topOffset={20}
      />
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="mb-4 text-5xl font-black leading-tight tracking-tighter text-white md:text-6xl">
            Your first quiz
            <br />
            is one click away.
          </h2>
          <p className="mb-8 text-base text-white/50">
            No credit card. No setup. Just knowledge, speed, and competition.
          </p>
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-black transition-all hover:bg-white/90 active:scale-95"
          >
            Get started — it's free
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
