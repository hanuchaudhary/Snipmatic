"use client";

import { usePathname } from "next/navigation";
import React from "react";

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/clip" || pathname === "/credits" || pathname === "/signin")
    return null;

  return (
    <div className="relative">
      <div className="flex items-center leading-none mt-14 justify-center text-[34vw] overflow-hidden font-semibold mask-b-from-0% opacity-20 font-[VT323]">
        <h4>
          snip<span className="text-orange-400">m</span>atic
        </h4>
      </div>
      <p className="absolute z-[999999999] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-instrumental">
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
