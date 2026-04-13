import { createContext, useContext } from 'react';
import { useWallpaper } from '@/hooks/useWallpaper';
import type { WallpaperPresetId, WallpaperState } from '@/hooks/useWallpaper';

interface WallpaperCtx {
  wallpaper: WallpaperState;
  setPreset: (id: WallpaperPresetId) => void;
  setCustom: (dataUrl: string) => void;
  reset: () => void;
}

const WallpaperContext = createContext<WallpaperCtx | null>(null);

export function WallpaperProvider({ children }: { children: React.ReactNode }) {
  const value = useWallpaper();
  return (
    <WallpaperContext.Provider value={value}>
      {children}
    </WallpaperContext.Provider>
  );
}

export function useWallpaperContext() {
  const ctx = useContext(WallpaperContext);
  if (!ctx) throw new Error('useWallpaperContext must be used inside WallpaperProvider');
  return ctx;
}
