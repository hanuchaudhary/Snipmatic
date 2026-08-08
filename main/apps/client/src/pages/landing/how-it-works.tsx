import { motion } from "motion/react";
import { ArrowRightIcon } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Create a quiz",
    body: "Add questions, set timers, and configure point values. Takes under 2 minutes.",
  },
  {
    num: "02",
    title: "Share the code",
    body: "Players join from any device — no app download, no account required to play.",
  },
  {
    num: "03",
    title: "Compete live",
    body: "Watch the leaderboard shift in real time. Every correct answer counts.",
  },
  {
    num: "04",
    title: "Review results",
    body: "Deep analytics tell you exactly where players excelled or struggled.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-black px-4 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-bold tracking-[0.3em] text-white/40 uppercase">Simple by design</p>
          <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
            Up and running
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              in four steps.
            </span>
          </h2>
        </motion.div>

        <div className="grid gap-px md:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative p-6"
            >
              <div className="mb-4 font-mono text-4xl font-black tracking-tighter text-white/10">
                {step.num}
              </div>
              <h3 className="mb-2 text-sm font-bold text-white">{step.title}</h3>
              <p className="text-xs leading-relaxed text-white/45">{step.body}</p>
              {i < STEPS.length - 1 && (
                <div className="absolute right-0 top-1/3 hidden h-px w-px md:block">
                  <ArrowRightIcon className="size-4 text-white/20" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
