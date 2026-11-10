import { Battery, Signal, Wifi } from "lucide-react";
import React, { useEffect, useState } from "react";

export function AndroidPhoneFrame({ children }: { children: React.ReactNode }) {
  const [currentTime, setCurrentTime] = useState("09:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-42px)] items-center justify-center bg-zinc-950/80 p-2 sm:p-6 backdrop-blur-md">
      {/* Android Device Chassis */}
      <div className="relative mx-auto flex h-[844px] w-full max-w-[390px] flex-col overflow-hidden rounded-[44px] border-[8px] border-zinc-800 bg-background shadow-[0_25px_70px_rgba(0,0,0,0.6)] ring-1 ring-zinc-700/50">
        {/* Android Punch Hole & Speaker */}
        <div className="absolute left-1/2 top-3 z-50 flex -translate-x-1/2 items-center gap-2">
          <div className="size-3.5 rounded-full bg-black ring-2 ring-zinc-900" />
          <div className="h-1 w-12 rounded-full bg-zinc-800" />
        </div>

        {/* Android System Status Bar */}
        <div className="relative z-40 flex h-10 w-full items-center justify-between px-6 pt-2 text-[11px] font-semibold text-foreground/80 select-none bg-background/80 backdrop-blur-sm">
          <span>{currentTime}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="size-3" strokeWidth={2.5} />
            <Wifi className="size-3" strokeWidth={2.5} />
            <div className="flex items-center gap-0.5">
              <span className="text-[9px]">98%</span>
              <Battery className="size-3.5 fill-current" />
            </div>
          </div>
        </div>

        {/* Scrollable Mobile Viewport */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-none pb-4">
          {children}
        </div>

        {/* Android Navigation Gesture Bar */}
        <div className="relative z-40 flex h-4 w-full items-center justify-center bg-background/90 pb-1">
          <div className="h-1 w-32 rounded-full bg-foreground/30 hover:bg-foreground/50 transition-colors" />
        </div>
      </div>
    </div>
  );
}
