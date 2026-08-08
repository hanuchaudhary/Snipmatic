import { useState } from "react";
import { Link, NavLink } from "react-router";
import { MenuIcon, XIcon, } from "lucide-react";

import { NAV_LINKS } from "./data";
import { Logo } from "@/components/logo";
import { ThemeSwitch } from "@/components/unlumen-ui/theme-switch";


export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b">
        <div className="flex items-center justify-between bg-background px-4 py-4 max-w-6xl mx-auto border-x">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="size-7" />
            <span>
              Clutch
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-medium tracking-wide text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeSwitch />
            <Link
              to="/login"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-background transition-all hover:bg-primary/90 active:scale-95"
            >
              Start free
            </Link>
          </div>

          <button
            className="flex size-8 items-center justify-center rounded-md border border-muted-foreground/10 bg-muted-foreground/5 text-muted-foreground md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
          </button>
        </div>

        {open && (
          <div className="mt-2 rounded-xl border border-muted-foreground/10 bg-muted-foreground/60 p-4 backdrop-blur-xl">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.href}
                  end
                  onClick={() => setOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted-foreground/5 hover:text-primary"
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-2">
                <Link
                  to="/login"
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted-foreground/5 hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-primary px-3 py-2 text-center text-sm font-bold text-background transition-all hover:bg-primary/90 active:scale-95"
                  onClick={() => setOpen(false)}
                >
                  Start free
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
