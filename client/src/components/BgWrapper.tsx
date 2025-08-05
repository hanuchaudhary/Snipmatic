"use client";
import { usePathname } from "next/navigation";
import React from "react";

export function BgWrapper() {
  const pathname = usePathname();
  console.log("BgWrapper pathname:", pathname);

  return (
    <>
      <div
        className={`fixed left-1/2 ${
          pathname.startsWith("/signin") ||
          pathname.startsWith("/signup") ||
          pathname.startsWith("/verify")
            ? "top-[100%]"
            : "top-[70%]"
        } -translate-x-1/2 -translate-y-1/2  z-[-1] h-screen`}
      >
        <h1
          className={`md:text-[44vh] text-[34vh] font-instrumental dark:text-white/40 text-black/60 font-black ${
            pathname.startsWith("/signin") ||
            pathname.startsWith("/signup") ||
            pathname.startsWith("/verify")
              ? "blur-xl text-[50vh]"
              : "dark:blur-none blur-md"
          }`}
        >
          Snipmatic
        </h1>
      </div>
      {/* <div className="fixed inset-0 z-[-1]">
            <GradientBackground
              gradientOrigin="bottom-middle"
              noiseIntensity={0.3}
              noisePatternSize={90}
              noisePatternRefreshInterval={6}
            />
          </div> */}
    </>
  );
}
