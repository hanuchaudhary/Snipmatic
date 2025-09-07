"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useRef } from "react";
import { Navbar } from "./Navbar";
import { GradientText } from "../ui/GradientText";
import { VideoCard } from "../ui";
import { useTheme } from "next-themes";

export function HeroSection() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      y: 20,
      opacity: 0,
      filter: "blur(10px)",
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const buttonVariants: Variants = {
    hidden: {
      y: 20,
      opacity: 0,
      filter: "blur(10px)",
      scale: 0.9,
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.8,
      },
    },
  };

  return (
    <section className="relative flex flex-col justify-center">
      <Navbar />
      <motion.div
        className="mx-auto z-10 min-h-[calc(100vh-15rem)] flex items-center flex-col justify-center relative md:pt-0 pt-40 md:w-4xl md:text-[5rem] text-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="mt-20 mx-auto font-instrumental text-center leading-none"
          variants={itemVariants}
        >
          Snip Your Way
        </motion.h1>

        <motion.h1
          className="mx-auto font-instrumental text-center leading-none flex items-center justify-center md:gap-3 gap-1"
          variants={itemVariants}
        >
          to Virality with
          <GradientText
            colors={["#ff4500", "#ff8c00", "#ffd700"]}
            animationSpeed={5}
            showBorder={false}
            className="custom-class"
          >
            Snipmatic
          </GradientText>
        </motion.h1>

        <motion.p
          className="md:text-lg text-sm font-jost md:px-0 px-4 text-neutral-300 my-8 text-center mx-auto max-w-2xl"
          variants={itemVariants}
        >
          Get famous with Snipmatic — transform any YouTube video into viral-ready shorts with AI-powered precision.
        </motion.p>

        <motion.div
          className="flex flex-wrap flex-col gap-2 md:text-base text-sm font-jost tracking-wider items-center justify-center"
          variants={buttonVariants}
        >
          <Link href="/signin">
            <motion.button
              ref={buttonRef}
              style={{
                boxShadow: "rgba(255, 255, 255, 0.16) 0px 2px 6px -2px inset",
              }}
              className="border hover:scale-105 transition-transform px-7 py-3 rounded-xl font-semibold bg-neutral-900 dark:text-muted-foreground text-white cursor-pointer flex items-center gap-2"
              whileHover={{
                boxShadow: "rgba(255, 255, 255, 0.25) 0px 4px 12px -4px inset",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Start Creating Now
              <ArrowUpRight />
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="w-full mx-auto overflow-hidden px-4 sm:px-2 mt-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
      >
        <VideoCard
          imageUrl={
            theme === "dark"
              ? "https://d10d2f3sgu39wn.cloudfront.net/Screenshot from 2025-08-17 21-39-13.png"
              : "https://d10d2f3sgu39wn.cloudfront.net/Screenshot from 2025-09-02 00-44-55.png"
          }
          videoUrl="https://d10d2f3sgu39wn.cloudfront.net/snipmatic-demo-1754599920218.mp4"
          className="w-full"
        />
      </motion.div>
    </section>
  );
}
