import { SparklesIcon } from "lucide-react";

const FOOTER_LINKS = ["Privacy", "Terms", "About", "Blog", "Contact"];

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-black px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-white text-black">
            <SparklesIcon className="size-3.5" />
          </div>
          <span className="text-sm font-black tracking-tighter text-white">QUIZE</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          {FOOTER_LINKS.map((item) => (
            <a
              key={item}
              href="#"
              className="text-xs text-white/35 transition-colors hover:text-white/70"
            >
              {item}
            </a>
          ))}
        </div>

        <p className="text-xs text-white/25">© 2026 Quize. All rights reserved.</p>
      </div>
    </footer>
  );
}
