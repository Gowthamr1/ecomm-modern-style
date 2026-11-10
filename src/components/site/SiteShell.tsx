import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { PwaInstallBanner } from "@/components/mobile/PwaInstallBanner";
import { QuickSearchModal } from "@/components/site/QuickSearchModal";
import { useEffect, useState, type ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function SiteShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  // Global keyboard shortcut listener for Ctrl+K, Cmd+K, and /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "/" && !isInput) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased text-foreground selection:bg-sand selection:text-primary">
      {/* PWA Install Banner */}
      <PwaInstallBanner />

      {/* Primary Customer Site Header */}
      <SiteHeader onOpenSearch={() => setSearchOpen(true)} />

      {/* Main Content Body */}
      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* Customer Footer */}
      <SiteFooter />

      {/* Real Mobile Responsive Navigation (Android / Smartphone devices) */}
      <MobileBottomNav />

      {/* Quick Search Modal (Ctrl+K) */}
      <QuickSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
