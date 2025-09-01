"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSnipStore } from "@/lib/snipStore";

export function CreditButton() {
  const { data: session } = useSession();
  const store = useSnipStore();
  const [isHovered, setIsHovered] = useState(false);
  const [showCredits, setShowCredits] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      store.fetchCredits();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (store.credits > 0) {
      const interval = setInterval(() => {
        setShowCredits((prev) => !prev);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [store.credits]);

  if (!session?.user) {
    return null;
  }

  const hasCredits = store.credits > 0;

  return (
    <Link href="/credits" className="group">
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          "font-instrumental cursor-pointer rounded-xl",
          "transition-colors duration-300 backdrop-blur-sm md:px-0 md:py-0 px-2 py-1 ease-in-out md:h-8 md:w-30 flex items-center justify-center relative group",
          "bg-orange-400/10 md:border-2 border border-double border-orange-400/60 text-orange-400",
          "hover:bg-orange-400/10 hover:border-orange-400 hover:text-orange-400"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative z-10 flex items-center gap-2 font-semibold tracking-wider text-[10px] font-mono">
          <AnimatePresence mode="wait">
            {hasCredits ? (
              isHovered ? (
                <motion.span
                  key="buy-more"
                  initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                  transition={{ duration: 0.2 }}
                >
                  Buy More
                </motion.span>
              ) : showCredits ? (
                <motion.div
                  key="credits"
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  transition={{ duration: 0.3, type: "spring" }}
                  className="flex items-center gap-2"
                >
                  <motion.span
                    animate={{ color: ["#f97316", "#fb923c", "#f97316"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {store.credits.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </motion.span>
                  <span className="opacity-80">Credits</span>
                </motion.div>
              ) : (
                <motion.span
                  key="buy-more-interval"
                  initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
                  transition={{ duration: 0.3 }}
                  className=""
                >
                  Buy More
                </motion.span>
              )
            ) : (
              <motion.span
                key="buy-credits"
                initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                transition={{ duration: 0.2 }}
                className=""
              >
                Buy Credits
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.span
          className={cn(
            "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-in-out",
            "bg-orange-400"
          )}
          animate={{
            boxShadow: [
              `0 0 0 0 rgba(255, 115, 0, 0)`,
              `0 0 0 10px rgba(255, 115, 0, 0.3)`,
              `0 0 0 20px rgba(255, 115, 0, 0)`,
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        />
      </motion.div>
    </Link>
  );
}
