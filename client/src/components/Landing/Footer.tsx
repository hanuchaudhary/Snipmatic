"use client";

import { usePathname } from "next/navigation";
import React from "react";

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/clip" || pathname === "/credits") return null;
  
  return (
    <div className="flex items-center leading-none mt-14 justify-center text-[34vw] overflow-hidden font-semibold mask-b-from-0% opacity-20 font-[VT323]">
      <h4>
        snip<span className="text-orange-400">m</span>atic
      </h4>
    </div>
  );
}
