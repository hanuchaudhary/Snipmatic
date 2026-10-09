import { Link } from "react-router"

import { useSession } from "@/lib/auth/auth.client"

const PRODUCT = [
  { to: "/signup", label: "Clip studio" },
  { to: "/signup", label: "Captions" },
  { to: "/signup", label: "Exports" },
  { to: "/pricing", label: "Pricing" },
]

const ACCOUNT = [
  { to: "/login", label: "Sign in" },
  { to: "/signup", label: "Start free" },
  { to: "/dashboard", label: "Dashboard" },
]

export function Footer() {
  const { data: session } = useSession()
  const year = new Date().getFullYear()

  return (
    <footer className="relative w-full overflow-hidden px-20 pt-20">
      <div className="border-t border-x p-10">
        <div className="mx-auto grid gap-10 grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/logo.png" alt="" className="h-8" />
              <span className="text-lg font-semibold">Snipmatic</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground text-pretty">
              Paste a YouTube link. Get clips you can post today — highlights,
              vertical crops, captions already on.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
              Product
            </p>
            <ul className="mt-4 space-y-2">
              {PRODUCT.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
              Account
            </p>
            <ul className="mt-4 space-y-2">
              {(session?.user
                ? ACCOUNT.filter((item) => item.to === "/dashboard")
                : ACCOUNT.filter((item) => item.to !== "/dashboard")
              ).map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground pt-20">
          <span>© {year} Snipmatic</span>
          <span>Built to ship shorts, not timelines.</span>
        </div>
      </div>
    </footer>
  )
}
