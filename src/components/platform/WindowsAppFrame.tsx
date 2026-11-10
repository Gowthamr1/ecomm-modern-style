import { cn } from "@/lib/utils";
import {
  Boxes,
  Compass,
  Home,
  Minus,
  Package,
  Settings,
  ShoppingBag,
  Square,
  X,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router";

export function WindowsAppFrame({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const sidebarLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/shop", label: "Catalog", icon: Compass },
    { to: "/inventory", label: "Console", icon: Boxes },
    { to: "/cart", label: "Bag", icon: ShoppingBag },
    { to: "/orders", label: "Orders", icon: Package },
    { to: "/profile", label: "Account", icon: Settings },
  ];

  return (
    <div className="flex min-h-[calc(100vh-42px)] flex-col bg-zinc-950/70 p-2 sm:p-4 backdrop-blur-md">
      {/* Windows 11 App Window Frame */}
      <div className="mx-auto flex h-[860px] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-zinc-700/60 bg-background shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        {/* Windows 11 Title Bar */}
        <div className="flex h-9 w-full items-center justify-between border-b border-border/80 bg-muted/60 px-3 text-xs select-none">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <span className="flex size-3.5 items-center justify-center rounded bg-primary text-[8px] font-bold text-primary-foreground">
              F
            </span>
            <span className="font-semibold text-[11px] tracking-tight">
              Forma Studio — Windows Edition (v2.6)
            </span>
          </div>

          <div className="flex items-center text-muted-foreground">
            <button
              type="button"
              className="flex size-8 items-center justify-center hover:bg-muted text-foreground transition-colors"
              title="Minimize"
            >
              <Minus className="size-3.5" />
            </button>
            <button
              type="button"
              className="flex size-8 items-center justify-center hover:bg-muted text-foreground transition-colors"
              title="Maximize"
            >
              <Square className="size-2.5" />
            </button>
            <button
              type="button"
              className="flex size-8 items-center justify-center hover:bg-destructive hover:text-white transition-colors"
              title="Close"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Windows Desktop Layout Body: Left Sidebar + Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Windows Left Navigation Rail */}
          <aside className="hidden md:flex w-52 flex-col justify-between border-r border-border/80 bg-muted/20 p-3">
            <div className="space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                Navigation
              </div>
              {sidebarLinks.map((item) => {
                const isActive =
                  item.to === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-3 text-[11px]">
              <p className="font-semibold text-foreground">Windows 11 Mica</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Optimized for multi-window desktop shopping.
              </p>
            </div>
          </aside>

          {/* Main Desktop Scrollable Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
