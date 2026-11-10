import { usePlatform, type PlatformMode } from "@/context/PlatformContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import {
  Boxes,
  Globe,
  Laptop,
  Moon,
  Smartphone,
  Sun,
} from "lucide-react";
import { Link, useLocation } from "react-router";

export function PlatformSwitcherBar() {
  const { mode, setMode } = usePlatform();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isConsole = location.pathname.startsWith("/inventory") || location.pathname.startsWith("/admin");

  const platforms: { id: PlatformMode; label: string; icon: typeof Globe }[] = [
    { id: "web", label: "Modern Web", icon: Globe },
    { id: "android", label: "Android App", icon: Smartphone },
    { id: "windows", label: "Windows 11 App", icon: Laptop },
  ];

  return (
    <div
      role="region"
      aria-label="Platform Mode Switcher"
      className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-md px-3 py-1.5 shadow-xs transition-colors"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs">
        {/* Left: Brand Identity & Active Platform Indicator */}
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-foreground tracking-tight text-[11px] sm:text-xs">
            Forma Experience
          </span>
          <span className="hidden sm:inline text-muted-foreground/60">|</span>
          <span className="hidden sm:inline-block rounded-full bg-sand/80 px-2 py-0.5 text-[10px] font-medium text-primary">
            Active: {mode === "web" ? "Web Storefront" : mode === "android" ? "Android Native PWA" : "Windows Fluent App"}
          </span>
        </div>

        {/* Center: The 3 Platform Buttons */}
        <div className="flex items-center gap-1 rounded-full border border-border/90 bg-muted/40 p-1 shadow-xs">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isActive = mode === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setMode(p.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-medium transition-all select-none cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs scale-102 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60",
                )}
              >
                <Icon className={cn("size-3.5", isActive ? "stroke-[2.2]" : "stroke-[1.6]")} />
                <span className="hidden xs:inline sm:inline">{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Console Switcher & Theme Toggle */}
        <div className="flex items-center gap-2">
          {isConsole ? (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-sand/70 hover:bg-sand px-2.5 py-1 text-[11px] font-semibold text-primary transition-all cursor-pointer shadow-xs"
            >
              <Globe className="size-3 text-primary" />
              <span>Storefront</span>
            </Link>
          ) : (
            <Link
              to="/inventory"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-sand/70 hover:bg-sand px-2.5 py-1 text-[11px] font-semibold text-primary transition-all cursor-pointer shadow-xs"
            >
              <Boxes className="size-3 text-primary" />
              <span>Console</span>
            </Link>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="flex size-7 items-center justify-center rounded-full border border-border/80 bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="size-3.5 text-amber-400" />
            ) : (
              <Moon className="size-3.5 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
