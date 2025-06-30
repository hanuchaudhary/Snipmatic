import Link from "next/link";
import {
  Play,
  Download,
  Share2,
  Scissors,
  Clock,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { ContainerScroll } from "../ui/ContainerScroll";
import LandingNavbar from "./LandingNavbar";

export function HeroSection() {
  return (
    <section className="relative flex flex-col justify-center">
      <LandingNavbar />
      <ContainerScroll
        titleComponent={
          <div className="mx-auto z-10 relative md:pt-0 pt-40">
            <h1 className="md:w-4xl md:text-[5rem] text-5xl mt-20 mx-auto font-instrumental text-center leading-none">
              Snip Your Way
            </h1>
            <h1 className="md:w-4xl md:text-[5rem] text-5xl mx-auto font-instrumental text-center leading-none">
              to Virality with Snipmatic.
            </h1>
            <p className="md:text-lg md:px-0 px-4 text-muted-foreground my-8 text-center mx-auto max-w-2xl">
              Snip viral-ready shorts from any YouTube video — fast, effortless,
              and powered by Snipmatic AI.
            </p>
            <div className="flex flex-wrap gap-2 items-center justify-center">
              <Link href="/dashboard">
                <button
                  style={{
                    boxShadow:
                      "rgba(255, 255, 255, 0.16) 0px 2px 6px -2px inset",
                  }}
                  className="border hover:scale-105 transition-transform px-7 py-3 rounded-xl font-semibold bg-neutral-900 text-muted-foreground cursor-pointer flex items-center gap-2"
                >
                  Start Creating Now
                  <ArrowUpRight />
                </button>
              </Link>
            </div>
          </div>
        }
      >
        <div>
          <div className="grid grid-cols-12 gap-6 h-[500px]">
            <div className="col-span-3 bg-background/50 rounded-xl p-4 border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">Snipmatic</span>
              </div>

              <nav className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-primary/10 rounded-lg text-primary">
                  <Play className="w-4 h-4" />
                  <span className="text-sm">Dashboard</span>
                </div>
                <div className="flex items-center gap-3 p-2 text-muted-foreground hover:text-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Analytics</span>
                </div>
                <div className="flex items-center gap-3 p-2 text-muted-foreground hover:text-foreground">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Downloads</span>
                </div>
                <div className="flex items-center gap-3 p-2 text-muted-foreground hover:text-foreground">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Library</span>
                </div>
              </nav>

              <div className="mt-8 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                <div className="text-xs text-muted-foreground mb-1">
                  This Month
                </div>
                <div className="text-lg font-bold">47 Clips</div>
                <div className="text-xs text-green-500">
                  +23% from last month
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-6 space-y-4">
              {/* Video Preview */}
              <div className="bg-background/50 rounded-xl border h-64 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-purple-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto backdrop-blur-sm">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-white font-medium">
                      Original Video Preview
                    </div>
                    <div className="text-white/70 text-sm">10:24 duration</div>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center justify-between text-white text-sm">
                      <span>How to Build a Startup in 2024</span>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>2:30 - 4:15</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Processing Status */}
              <div className="bg-background/50 rounded-xl border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">AI Processing</span>
                  <span className="text-sm text-green-500">Complete</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-orange-500 h-2 rounded-full w-full"></div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Found 8 viral moments • Generated 12 clips
                </div>
              </div>
            </div>

            {/* Generated Clips */}
            <div className="col-span-3 space-y-4">
              {/* Vertical Clip */}
              <div className="bg-background/50 rounded-xl border p-3 h-40">
                <div className="bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-lg h-full relative overflow-hidden">
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                    <span className="text-white text-xs">9:16</span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/50 backdrop-blur-sm rounded p-2">
                      <div className="text-white text-xs font-medium mb-1">
                        Startup Tips
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-xs">0:45</span>
                        <div className="flex gap-1">
                          <button className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                            <Download className="w-3 h-3 text-white" />
                          </button>
                          <button className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                            <Share2 className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Square Clip */}
              <div className="bg-background/50 rounded-xl border p-3 h-32">
                <div className="bg-gradient-to-br from-green-500/20 to-orange-500/20 rounded-lg h-full relative overflow-hidden">
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                    <span className="text-white text-xs">1:1</span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/50 backdrop-blur-sm rounded p-2">
                      <div className="text-white text-xs font-medium mb-1">
                        Key Insight
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-xs">0:30</span>
                        <div className="flex gap-1">
                          <button className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                            <Download className="w-3 h-3 text-white" />
                          </button>
                          <button className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                            <Share2 className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal Clip */}
              <div className="bg-background/50 rounded-xl border p-3 h-24">
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg h-full relative overflow-hidden">
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
                    <span className="text-white text-xs">16:9</span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/50 backdrop-blur-sm rounded p-2">
                      <div className="text-white text-xs font-medium mb-1">
                        Best Quote
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-xs">1:20</span>
                        <div className="flex gap-1">
                          <button className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                            <Download className="w-3 h-3 text-white" />
                          </button>
                          <button className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                            <Share2 className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>
      <div className="w-full fixed -bottom-10 left-1/2 -translate-x-1/2 bg-black/70 h-20 blur-2xl" />
      <div className="w-full fixed -bottom-10 left-1/2 -translate-x-1/2 bg-black/50 h-20 blur-2xl" />
    </section>
  );
}
