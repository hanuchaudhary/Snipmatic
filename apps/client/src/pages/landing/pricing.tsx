import { Link } from "react-router";
import { motion } from "motion/react";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { PLANS } from "./data";

export function Pricing() {
  return (
    <section id="pricing" className="bg-black px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-bold tracking-[0.3em] text-white/40 uppercase">Pricing</p>
          <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
            Start free.
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Scale when ready.
            </span>
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "relative rounded-2xl border p-6",
                plan.highlighted
                  ? "border-white/25 bg-white/[0.07] shadow-[0_0_60px_-15px_rgba(100,150,255,0.3)]"
                  : "border-white/8 bg-white/[0.02]"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-0.5 text-[10px] font-black tracking-widest text-black uppercase">
                  Most popular
                </div>
              )}
              <div className="mb-4">
                <p className="text-xs font-bold tracking-widest text-white/40 uppercase">{plan.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter text-white">{plan.price}</span>
                  <span className="text-xs text-white/40">/{plan.period}</span>
                </div>
                <p className="mt-1 text-xs text-white/50">{plan.description}</p>
              </div>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                    <CheckIcon className="size-3 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className={cn(
                  "block w-full rounded-xl py-2.5 text-center text-xs font-bold transition-all hover:opacity-90 active:scale-95",
                  plan.highlighted
                    ? "bg-white text-black"
                    : "border border-white/15 bg-white/5 text-white hover:bg-white/10"
                )}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
