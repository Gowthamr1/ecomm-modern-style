import React, { createContext, useContext, useEffect, useState } from "react";

export type PlatformMode = "web" | "android" | "windows";

interface PlatformContextType {
  mode: PlatformMode;
  setMode: (mode: PlatformMode) => void;
  isAndroid: boolean;
  isWindows: boolean;
  isWeb: boolean;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<PlatformMode>(() => {
    const saved = localStorage.getItem("forma-platform-mode");
    return (saved as PlatformMode) || "web";
  });

  const setMode = (newMode: PlatformMode) => {
    setModeState(newMode);
    localStorage.setItem("forma-platform-mode", newMode);
  };

  return (
    <PlatformContext.Provider
      value={{
        mode,
        setMode,
        isAndroid: mode === "android",
        isWindows: mode === "windows",
        isWeb: mode === "web",
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error("usePlatform must be used within a PlatformProvider");
  }
  return context;
}
