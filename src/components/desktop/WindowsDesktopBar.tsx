import { cn } from "@/lib/utils";
import { Command, Laptop, Monitor, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function WindowsDesktopBar({
  onOpenSearch,
}: {
  onOpenSearch?: () => void;
}) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [platformName, setPlatformName] = useState("Web / Windows");

  useEffect(() => {
    // Detect standalone PWA or Windows desktop app
    const isPwa =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isPwa);

    if (navigator.userAgent.includes("Windows")) {
      setPlatformName("Windows App");
    } else if (navigator.userAgent.includes("Mac")) {
      setPlatformName("macOS App");
    } else {
      setPlatformName("Desktop Web");
    }
  }, []);

  return (
    <div
      role="banner"
      className={cn(
        "hidden md:flex h-8 w-full items-center justify-between border-b border-border/60 bg-muted/30 px-4 text-[11px] text-muted-foreground",
        "select-none transition-colors",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium text-foreground/80">
          {isStandalone ? (
            <Monitor className="size-3 text-primary" />
          ) : (
            <Laptop className="size-3 text-muted-foreground" />
          )}
          <span>Forma · {platformName}</span>
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px]">Cloud Storefront Live</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenSearch}
          className="group inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 hover:bg-muted transition-colors cursor-pointer"
        >
          <Command className="size-3 text-muted-foreground group-hover:text-foreground" />
          <span className="text-[10px]">Quick Search</span>
          <kbd className="rounded border border-border/80 bg-background px-1 py-0.2 text-[9px] font-mono text-muted-foreground shadow-xs">
            Ctrl+K
          </kbd>
        </button>

        <div className="hidden lg:flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1">
            <Sparkles className="size-3 text-sand-deep" />
            Curated 2026 Collection
          </span>
        </div>
      </div>
    </div>
  );
}
