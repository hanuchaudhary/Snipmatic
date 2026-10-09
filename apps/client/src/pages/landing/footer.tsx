import { Link } from "react-router"

import { useSession } from "@/lib/auth/auth.client"
import { IconCopyright } from "@tabler/icons-react"

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
    <footer className="relative w-full overflow-hidden max-w-7xl mx-auto min-h-[calc(100svh-10rem)] mt-20">
      <div className="border-t py-14">
        <div className="mx-auto grid gap-10 grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center">
              <span className="heading">Snipmatic</span>
            </Link>
            <p className="mt-4 max-w-sm subheading text-[1.2rem]! text-primary! text-pretty">
              Paste a YouTube link. Get clips you can post today — highlights,
              vertical crops, captions already on.
            </p>
          </div>

          <div>
            <p className="subheading text-[1.2rem]! text-primary! text-pretty">
              Product
            </p>
            <ul className="mt-10 space-y-2">
              {PRODUCT.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="subheading text-[1.2rem]! transition-colors hover:text-foreground!"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="subheading text-[1.2rem]! text-primary! text-pretty">
              Account
            </p>
            <ul className="mt-10 space-y-3">
              {(session?.user
                ? ACCOUNT.filter((item) => item.to === "/dashboard")
                : ACCOUNT.filter((item) => item.to !== "/dashboard")
              ).map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="subheading text-[1.2rem]! transition-colors hover:text-foreground!"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
      <div className="flex items-center justify-between gap-4 subheading text-[1.2rem]! text-primary! pt-20 w-full">
        <span className="flex items-center">
          <IconCopyright className="size-6 text-primary! inline-block mr-1" />
          {year} Snipmatic</span>
        <span className="subheading text-[1.2rem]! text-primary! text-pretty">Built to ship shorts, not timelines.</span>
      </div>
    </footer>
  )
}
