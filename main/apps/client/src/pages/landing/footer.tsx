export function Footer() {
  return (
    <div className="relative w-full">
      <div className="flex items-center leading-none mt-14 justify-center text-[34vw] overflow-hidden font-semibold opacity-20" style={{ fontFamily: "'VT323', monospace", maskImage: "linear-gradient(to top, transparent 0%, black 100%)" }}>
        <h4>
          snip<span className="text-orange-400">m</span>atic
        </h4>
      </div>
      <p className="absolute z-[999] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-[family-name:var(--font-instrumental)] whitespace-nowrap text-sm">
        founded by{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 hover:underline"
          href="https://x.com/KushChaudharyOg"
        >
          @kushchaudhary
        </a>{" "}
        &{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-400 hover:underline"
          href="https://x.com/kuahxD"
        >
          @kushagra
        </a>
      </p>
    </div>
  );
}
