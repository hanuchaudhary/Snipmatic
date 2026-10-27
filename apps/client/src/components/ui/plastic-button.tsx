import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type PlasticButtonVariant = "primary" | "blue" | "white" | "destructive" | "emerald";

type PlasticButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
    variant?: PlasticButtonVariant;
};

type VariantStyle = {
    text: string;
    vars: string[];
};

const variants: Record<PlasticButtonVariant, VariantStyle> = {
    blue: {
        text: "text-white",
        vars: [
            "[--pb-bg:linear-gradient(to_bottom,rgb(59,130,246),rgb(37,99,235))]",
            "[--pb-shadow:0_2px_8px_0_rgba(37,99,235,0.35),0_1.5px_0_0_rgba(255,255,255,0.25)_inset,0_-2px_8px_0_rgba(37,99,235,0.5)_inset]",
            "[--pb-ring:0_0_0_2px_rgba(255,255,255,0.10)_inset,0_1.5px_0_0_rgba(255,255,255,0.18)_inset,0_-2px_8px_0_rgba(37,99,235,0.18)_inset]",
            "[--pb-shine:linear-gradient(180deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_80%,transparent_100%)]",
        ],
    },
    primary: {
        text: "text-white dark:text-neutral-800",
        vars: [
            "[--pb-bg:linear-gradient(to_bottom,rgb(82,82,82),rgb(38,38,38))]",
            "[--pb-shadow:0_2px_8px_0_rgba(23,23,23,0.35),0_1.5px_0_0_rgba(255,255,255,0.25)_inset,0_-2px_8px_0_rgba(23,23,23,0.5)_inset]",
            "[--pb-ring:0_0_0_2px_rgba(255,255,255,0.10)_inset,0_1.5px_0_0_rgba(255,255,255,0.18)_inset,0_-2px_8px_0_rgba(23,23,23,0.18)_inset]",
            "[--pb-shine:linear-gradient(180deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_80%,transparent_100%)]",
            "dark:[--pb-bg:linear-gradient(to_bottom,rgb(255,255,255),rgb(229,229,229))]",
            "dark:[--pb-shadow:0_2px_8px_0_rgba(0,0,0,0.45),0_1.5px_0_0_rgba(255,255,255,0.9)_inset,0_-2px_8px_0_rgba(163,163,163,0.35)_inset]",
            "dark:[--pb-ring:0_0_0_1px_rgba(23,23,23,0.08)_inset,0_1.5px_0_0_rgba(255,255,255,0.8)_inset,0_-2px_8px_0_rgba(163,163,163,0.18)_inset]",
            "dark:[--pb-shine:linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0)_80%,transparent_100%)]",
        ],
    },
    white: {
        text: "text-neutral-800",
        vars: [
            "[--pb-bg:linear-gradient(to_bottom,rgb(255,255,255),rgb(229,229,229))]",
            "[--pb-shadow:0_2px_8px_0_rgba(23,23,23,0.15),0_1.5px_0_0_rgba(255,255,255,0.9)_inset,0_-2px_8px_0_rgba(163,163,163,0.35)_inset]",
            "[--pb-ring:0_0_0_1px_rgba(23,23,23,0.08)_inset,0_1.5px_0_0_rgba(255,255,255,0.8)_inset,0_-2px_8px_0_rgba(163,163,163,0.18)_inset]",
            "[--pb-shine:linear-gradient(180deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0)_80%,transparent_100%)]",
        ],
    },
    destructive: {
        text: "text-white",
        vars: [
            "[--pb-bg:linear-gradient(to_bottom,rgb(239,68,68),rgb(220,38,38))]",
            "[--pb-shadow:0_2px_8px_0_rgba(220,38,38,0.35),0_1.5px_0_0_rgba(255,255,255,0.25)_inset,0_-2px_8px_0_rgba(220,38,38,0.5)_inset]",
            "[--pb-ring:0_0_0_2px_rgba(255,255,255,0.10)_inset,0_1.5px_0_0_rgba(255,255,255,0.18)_inset,0_-2px_8px_0_rgba(220,38,38,0.18)_inset]",
            "[--pb-shine:linear-gradient(180deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_80%,transparent_100%)]",
        ],
    },
    emerald: {
        text: "text-white",
        vars: [
            "[--pb-bg:linear-gradient(to_bottom,rgb(34,197,94),rgb(22,163,74))]",
            "[--pb-shadow:0_2px_8px_0_rgba(22,163,74,0.35),0_1.5px_0_0_rgba(255,255,255,0.25)_inset,0_-2px_8px_0_rgba(22,163,74,0.5)_inset]",
            "[--pb-ring:0_0_0_2px_rgba(255,255,255,0.10)_inset,0_1.5px_0_0_rgba(255,255,255,0.18)_inset,0_-2px_8px_0_rgba(22,163,74,0.18)_inset]",
            "[--pb-shine:linear-gradient(180deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0)_80%,transparent_100%)]",
        ],
    },
};

export function PlasticButton({
    children,
    variant = "primary",
    className,
    style,
    ...props
}: PlasticButtonProps) {
    const v = variants[variant];

    return (
        <button
            {...props}
            className={cn(
                "relative px-4 py-1.75 rounded-full font-medium text-sm transition-all duration-200 cursor-pointer flex justify-center items-center",
                "active:scale-[0.98]",
                v.text,
                v.vars,
                className,
            )}
            style={{
                background: "var(--pb-bg)",
                boxShadow: "var(--pb-shadow)",
                ...style,
            }}
        >
            <span className="relative z-10 flex items-center justify-center gap-1.5">{children}</span>
            <span
                className="absolute left-1/2 top-0 z-20 w-[80%] h-2/5 -translate-x-1/2 rounded-t-full pointer-events-none"
                style={{
                    background: "var(--pb-shine)",
                    filter: "blur(1.5px)",
                }}
            />
            <span
                className="absolute inset-0 z-0 rounded-full pointer-events-none"
                style={{ boxShadow: "var(--pb-ring)" }}
            />
        </button>
    );
}