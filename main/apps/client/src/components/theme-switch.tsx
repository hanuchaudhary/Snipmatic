import { cn } from "@/lib/utils";
import { IconMoonFilled, IconSunFilled } from "@tabler/icons-react";
import { motion } from "motion/react";
<<<<<<<< HEAD:main/apps/client/src/components/theme-switch.tsx
import { useTheme } from "./provider/theme-provider";
========
import { useTheme } from "next-themes";
>>>>>>>> origin/main:client/src/components/ThemeToggle.tsx

const themes = [
  { key: "light", icon: IconSunFilled, label: "Light theme" },
  { key: "dark", icon: IconMoonFilled, label: "Dark theme" },
];

<<<<<<<< HEAD:main/apps/client/src/components/theme-switch.tsx
export const ThemeSwitch = () => {
========
export const ThemeToggle = () => {
>>>>>>>> origin/main:client/src/components/ThemeToggle.tsx
  const { theme, setTheme } = useTheme();
  return (
    <div
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "cursor-pointer relative z-40 flex h-8 rounded-full dark:bg-background/40 bg-white backdrop-blur-sm p-1 ring-1 ring-border"
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;
        return (
          <button
            type="button"
            key={key}
            className="relative h-6 w-6 rounded-full cursor-pointer"
            aria-label={label}
          >
            {isActive && (
              <motion.span
                layoutId="activeTheme"
                className="absolute inset-0 rounded-full bg-secondary"
                transition={{ type: "spring", duration: 0.5 }}
              />
            )}
            <Icon
              className={cn(
                "relative m-auto h-4 w-4",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
