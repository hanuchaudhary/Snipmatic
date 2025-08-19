"use client";
import { usePathname } from "next/navigation";
import React from "react";

export function BgWrapper() {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed left-1/2 ${
          pathname.startsWith("/signin") ||
          pathname.startsWith("/signup") ||
          pathname.startsWith("/verify") ||
          pathname.startsWith("/credits/success")
            ? "top-[100%] blur-md dark:blur-none"
            : "top-[70%] dark:blur-none blur-md"
        } -translate-x-1/2 -translate-y-1/2  z-[-1] h-screen`}
      >
        <h1
          className={`md:text-[44vh] text-[34vh] font-instrumental scale-y-125 dark:text-secondary/40 mask-b-from-0% text-black/60 font-black ${
            pathname.startsWith("/signin") ||
            pathname.startsWith("/signup") ||
            pathname.startsWith("/verify") ||
            pathname.startsWith("/credits")
              ? "text-[50vh]"
              : ""
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
