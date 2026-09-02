import { useState } from "react";
import { Link, useLocation } from "react-router";

import {
  ArrowUpRight,
  Captions,
  Clapperboard,
  Menu,
  ScanFace,
  Scissors,
  Share2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { ThemeSwitch } from "@/components/theme-switch";
import { useSession } from "@/lib/auth/auth.client";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import {
  MotionNavigationMenu,
  MotionNavigationMenuContent,
  MotionNavigationMenuItem,
  MotionNavigationMenuLink,
  MotionNavigationMenuList,
  MotionNavigationMenuTrigger,
} from "@/components/unlumen-ui/motion-navigation-menu";

const listHighlightClassName = "bg-white/10 rounded-lg";
const contentHighlightClassName =
  "bg-primary/10 rounded-lg ring-1 ring-primary/15";

const PRODUCTS = [
  {
    href: "/signup",
    title: "Clip studio",
    description: "Cut long videos into shorts that actually travel.",
    icon: Clapperboard,
  },
  {
    href: "/signup",
    title: "Captions",
    description: "Burn-in captions with word-level timing.",
    icon: Captions,
  },
  {
    href: "/signup",
    title: "Exports",
    description: "TikTok, Reels, Shorts — one pass, every ratio.",
    icon: Share2,
  },
];

const FEATURES = [
  {
    href: "/signup",
    title: "Viral detection",
    description: "Surface the moments that hook.",
    icon: Sparkles,
  },
  {
    href: "/signup",
    title: "Smart tracking",
    description: "Keep faces and subjects in frame.",
    icon: ScanFace,
  },
  {
    href: "/signup",
    title: "AI editing",
    description: "Cut, pace, and polish without a timeline.",
    icon: Wand2,
  },
];

function LandingNavMenu() {
  return (
    <MotionNavigationMenu
      className="hidden md:flex"
      viewportClassName="bg-background/85 border-white/10 shadow-none backdrop-blur-xl"
      springStiffness={350}
      springDamping={32}
    >
      <MotionNavigationMenuList highlightClassName={listHighlightClassName}>
        <MotionNavigationMenuItem value="product">
          <MotionNavigationMenuTrigger className="text-muted-foreground">
            Product
          </MotionNavigationMenuTrigger>
          <MotionNavigationMenuContent
            highlightClassName={contentHighlightClassName}
          >
            <div className="grid w-[500px] grid-cols-[1fr_1.25fr] gap-2">
              <MotionNavigationMenuLink
                href="/signup"
                className="bg-background/70 min-h-44 justify-between rounded-lg p-4"
              >
                <span className="bg-background flex size-9 items-center justify-center rounded-lg border">
                  <Scissors className="size-4" />
                </span>
                <span className="space-y-1">
                  <span className="block text-sm font-medium">Studio</span>
                  <span className="text-muted-foreground block text-xs">
                    Drop a podcast or long take. Walk away with clips.
                  </span>
                </span>
              </MotionNavigationMenuLink>
              <div className="grid grid-cols-1 gap-0.5">
                {PRODUCTS.map((product) => (
                  <MotionNavigationMenuLink key={product.title} href={product.href}>
                    <span className="flex items-center justify-between gap-2 text-sm font-medium">
                      <span className="flex items-center gap-2">
                        <product.icon className="size-4" />
                        {product.title}
                      </span>
                      <ArrowUpRight className="size-3" />
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {product.description}
                    </span>
                  </MotionNavigationMenuLink>
                ))}
              </div>
            </div>
          </MotionNavigationMenuContent>
        </MotionNavigationMenuItem>

        <MotionNavigationMenuItem value="features">
          <MotionNavigationMenuTrigger className="text-muted-foreground">
            Features
          </MotionNavigationMenuTrigger>
          <MotionNavigationMenuContent
            highlightClassName={contentHighlightClassName}
          >
            <div className="grid w-[360px] gap-0.5">
              {FEATURES.map((feature) => (
                <MotionNavigationMenuLink key={feature.title} href={feature.href}>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <feature.icon className="size-4" />
                    {feature.title}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {feature.description}
                  </span>
                </MotionNavigationMenuLink>
              ))}
            </div>
          </MotionNavigationMenuContent>
        </MotionNavigationMenuItem>

        <MotionNavigationMenuItem>
          <MotionNavigationMenuLink
            href="/pricing"
            className="px-4 py-2 text-sm font-medium text-muted-foreground"
          >
            Pricing
          </MotionNavigationMenuLink>
        </MotionNavigationMenuItem>
      </MotionNavigationMenuList>
    </MotionNavigationMenu>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const pathname = useLocation().pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLanding = pathname === "/";

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="absolute w-full left-1/2 -translate-x-1/2 md:my-4 top-0 z-60 max-w-7xl mx-auto md:backdrop-blur-none backdrop-blur-sm">
        <div className="md:px-8 px-4 py-2 grid grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-4 justify-self-start">
            {(isLanding || !session?.user) && (
              <Link
                className="flex items-center justify-center"
                to={session?.user ? "/dashboard" : "/"}
              >
                <img src="/logo.png" className="h-8" alt="Snipmatic Logo" />
                <span>Snipmatic</span>
              </Link>
            )}
          </div>

          {isLanding ? <LandingNavMenu /> : <div />}

          <div className="hidden md:flex items-center gap-2 justify-self-end">
            <ThemeSwitch />
            {session?.user ? (
              isLanding ? (
                <Link to="/dashboard" className="px-4 text-xs">
                  Dashboard
                </Link>
              ) : null
            ) : (
              <Link
                to="/login"
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Sign in
              </Link>
            )}
            {session?.user && <ProfileDropdown />}
          </div>

          <div className="md:hidden justify-self-end col-start-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={closeMobileMenu}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 w-[76vw] rounded-l-3xl h-full bg-background border-l shadow-xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <Link
                    className="flex items-center gap-2"
                    to="/"
                    onClick={closeMobileMenu}
                  >
                    <img src="/logo.png" className="h-8" alt="Snipmatic Logo" />
                    <span className="text-lg font-semibold">Snipmatic</span>
                  </Link>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-6 mt-2">
                    <div className="space-y-1">
                      <p className="px-3 text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                        Product
                      </p>
                      {PRODUCTS.map((product) => (
                        <Link
                          key={product.title}
                          to={product.href}
                          onClick={closeMobileMenu}
                          className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                        >
                          {product.title}
                        </Link>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <p className="px-3 text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                        Features
                      </p>
                      {FEATURES.map((feature) => (
                        <Link
                          key={feature.title}
                          to={feature.href}
                          onClick={closeMobileMenu}
                          className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                        >
                          {feature.title}
                        </Link>
                      ))}
                    </div>
                    <Link
                      to="/pricing"
                      onClick={closeMobileMenu}
                      className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                    >
                      Pricing
                    </Link>
                    <div className="space-y-2 pt-2">
                      {session?.user ? (
                        <Link
                          to="/dashboard"
                          onClick={closeMobileMenu}
                          className="block rounded-md bg-primary px-3 py-2 text-sm text-background text-center"
                        >
                          Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            onClick={closeMobileMenu}
                            className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-primary"
                          >
                            Sign in
                          </Link>
                          <Link
                            to="/signup"
                            onClick={closeMobileMenu}
                            className="block rounded-md bg-primary px-3 py-2 text-center text-sm font-bold text-background"
                          >
                            Start free
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </nav>

                <div className="p-4 flex items-center justify-between border-t border-border">
                  <ThemeSwitch />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
