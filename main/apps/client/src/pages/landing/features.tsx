import { motion } from "motion/react";

import { FEATURES } from "./data";

export function Features() {
  return (
    <section id="features" className="relative bg-black px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-bold tracking-[0.3em] text-white/40 uppercase">Why quize</p>
          <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
            Built for the
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              serious learner.
            </span>
          </h2>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-colors hover:border-white/15 hover:bg-white/[0.06]"
            >
              <div
                className="mb-4 flex size-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${feature.accent}20`, color: feature.accent }}
              >
                <feature.icon className="size-5" />
              </div>
              <h3 className="mb-2 text-base font-bold tracking-tight text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{feature.description}</p>

              <div
                className="pointer-events-none absolute -bottom-12 -right-12 size-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20"
                style={{ backgroundColor: feature.accent }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
