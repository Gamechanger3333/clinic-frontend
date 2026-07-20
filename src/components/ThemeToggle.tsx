"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  /** Show a text label next to the icon (used in the sidebar) */
  showLabel?: boolean;
}

export default function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — real theme is only known after mount
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      title={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
      aria-label="Toggle theme"
      className={cn(
        "w-11 h-11 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-foreground/80 hover:text-primary hover:border-primary/40 transition-all duration-200 active:scale-95",
        className
      )}
    >
      <span className="relative w-5 h-5 flex-shrink-0">
        <Sun className={cn("w-5 h-5 absolute inset-0 transition-all duration-300", isDark ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100")} />
        <Moon className={cn("w-5 h-5 absolute inset-0 transition-all duration-300", isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50")} />
      </span>
      {showLabel && (
        <span className="text-sm">{mounted ? (isDark ? "Light Mode" : "Dark Mode") : "Theme"}</span>
      )}
    </button>
  );
}
