import React from "react"
import Link from "next/link"
import { ArrowRight, Globe } from "lucide-react"

import { cn } from "@/lib/utils"

interface WrapButtonProps {
  className?: string
  children: React.ReactNode
  href?: string
  onClick?: () => void
}

const WrapButton: React.FC<WrapButtonProps> = ({
  className,
  children,
  href,
  onClick,
}) => {
  return (
    <div onClick={onClick} className="flex items-center justify-center">
      {href ? (
        <Link href={href}>
          <div
            className={cn(
              "group cursor-pointer border group dark:border-[#3B3A3A] dark:bg-[#151515] bg-white gap-2 flex items-center p-[4px] rounded-full pr-1.5",
              className
            )}
          >
            <div className="border dark:border-[#3B3A3A] bg-[#ff3f17]/80 dark:bg-[#ff3f17] py-1 rounded-full flex items-center justify-center text-neutral-950">
              <p className="font-medium tracking-wide mr-3 ml-2 flex items-center gap-2 justify-center font-instrumental">
                {children}
              </p>
            </div>
            <div className="text-[#3b3a3a] group-hover:ml-2  ease-in-out transition-all size-[26px] flex items-center justify-center rounded-full border-2 border-[#3b3a3a]  ">
              <ArrowRight
                size={18}
                className="group-hover:rotate-45 ease-in-out transition-all "
              />
            </div>
          </div>
        </Link>
      ) : (
        <div
          className={cn(
            "group cursor-pointer border group border-[#3B3A3A] bg-[#151515] gap-2  h-[64px] flex items-center p-[11px] rounded-full",
            className
          )}
        >
          <div className="border border-[#3B3A3A] bg-[#fe7500] h-[43px] rounded-full flex items-center justify-center">
            <Globe className="mx-2 animate-spin " />
            <p className="mr-3">
              {children ? children : "Get Started"}
            </p>
          </div>
          <div className="dark:text-[#3b3a3a] group-hover:ml-2  ease-in-out transition-all size-[26px] flex items-center justify-center rounded-full border-2 dark:border-[#3b3a3a]  ">
            <ArrowRight
              size={18}
              className="group-hover:rotate-45 ease-in-out transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default WrapButton
