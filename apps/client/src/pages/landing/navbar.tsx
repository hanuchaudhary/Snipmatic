import { useState } from "react";
import { Link, NavLink } from "react-router";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useSession } from "@/lib/auth/auth.client";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "Viral Detection",
    description: "Find the moments most likely to perform.",
  },
  {
    title: "AI Editing",
    description: "Automatically cut and structure your clips.",
  },
  {
    title: "Smart Captions",
    description: "Generate accurate word-level captions.",
  },
  {
    title: "Face Tracking",
    description: "Keep speakers and subjects in frame.",
  },
  {
    title: "Auto Reframe",
    description: "Turn long videos into vertical content.",
  },
  {
    title: "Multi Platform",
    description: "Export for Shorts, Reels and TikTok.",
  },
];

export function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);

  const links = [
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 bg-background pt-6",
          isFeaturesOpen && "border-b"
        )}
      >
        <div className="max-w-7xl mx-auto">

          <motion.div
            className="overflow-hidden"
            initial={false}
            animate={{
              height: isFeaturesOpen ? "auto" : 64,
            }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="flex items-center justify-between px-6 md:px-0">
              <div className="flex items-center justify-center gap-16">
                <Link
                  to={session?.user ? "/dashboard" : "/"}
                  className="flex items-center"
                >
                  <img
                    src="/logo.png"
                    className="h-9"
                    alt="Snipmatic Logo"
                  />
                </Link>

                <nav className="hidden items-center gap-7 md:flex">
                  <Link
                    onMouseEnter={() => setIsFeaturesOpen(true)}
                    onMouseLeave={() => setIsFeaturesOpen(false)}
                    to="#features"
                    className={cn(
                      "subheading transition-colors hover:text-foreground! text-base!",
                    )}
                  >
                    Features
                  </Link>

                  {links.map((link) => (
                    <NavLink
                      key={link.href}
                      to={link.href}
                      className={({ isActive }) => cn("subheading transition-colors hover:text-foreground! text-base!", isActive && "text-primary")}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </nav>

              </div>
              <div className="hidden items-center md:flex">
                {session?.user ? (
                  <ProfileDropdown />
                ) : (
                  <NavLink
                    to="/login"
                    className={({ isActive }) => cn("rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-background", isActive && "text-primary")}
                  >
                    Sign in
                  </NavLink>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="rounded-md p-2 hover:bg-accent md:hidden"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isFeaturesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="hidden md:block"
                >
                  <div className="grid grid-cols-2 gap-x-20 px-8 py-10">
                    <div>
                      <p className="mb-6 text-sm text-muted-foreground">
                        Explore Features
                      </p>

                      <div className="space-y-6">
                        {FEATURES.slice(0, 3).map((feature) => (
                          <Link
                            key={feature.title}
                            to="#features"
                            className="block"
                          >
                            <div className="text-2xl tracking-tight">
                              {feature.title}
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {feature.description}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-6 text-sm text-muted-foreground">
                        More Features
                      </p>

                      <div className="space-y-5">
                        {FEATURES.slice(3).map((feature) => (
                          <NavLink
                            end
                            key={feature.title}
                            to="#features"
                            className={({ isActive }) => cn("block text-lg transition-colors hover:text-muted-foreground", isActive && "text-primary")}
                          >
                            {feature.title}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-16 md:hidden">
          <div className="flex h-full flex-col border-t">
            <nav className="flex flex-1 flex-col p-6">
              <Link
                to="/features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="border-b py-4 text-lg"
              >
                Features
              </Link>

              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="border-b py-4 text-lg"
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-auto">
                {session?.user ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-full bg-primary px-4 py-3 text-center text-sm font-medium text-background"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-full bg-primary px-4 py-3 text-center text-sm font-medium text-background"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}