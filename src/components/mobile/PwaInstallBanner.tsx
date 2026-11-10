import { Button } from "@/components/ui/button";
import { Download, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if dismissed before
    const isDismissed = sessionStorage.getItem("forma-pwa-dismissed");
    if (isDismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("forma-pwa-dismissed", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Install App"
      className="sticky top-0 z-45 border-b border-border/70 bg-sand/90 backdrop-blur-md px-4 py-2.5 text-foreground transition-all"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Smartphone className="size-4" />
          </div>
          <div>
            <p className="text-[12px] font-medium leading-tight">
              Install Forma on your device
            </p>
            <p className="text-[10px] text-muted-foreground hidden sm:block">
              Fast loading, offline cache & native app experience for Android & Windows.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleInstall}
            className="h-7 rounded-full px-3 text-[11px] font-medium gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="size-3" />
            Install
          </Button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
