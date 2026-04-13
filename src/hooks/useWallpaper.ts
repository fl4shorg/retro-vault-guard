import { useState, useEffect } from 'react';

const LS_KEY = 'vault-wallpaper';

export type WallpaperPresetId =
  | 'default'
  | 'void'
  | 'nuclear'
  | 'pip-boy'
  | 'nuka-cola'
  | 'brotherhood'
  | 'institute'
  | 'wasteland';

export interface WallpaperPreset {
  id: WallpaperPresetId;
  name: string;
  preview: string;
  style: React.CSSProperties;
  overlayOpacity?: number;
}

export const WALLPAPER_PRESETS: WallpaperPreset[] = [
  {
    id: 'default',
    name: 'Vault-Tec',
    preview: 'linear-gradient(135deg, hsl(220,35%,10%), hsl(220,40%,7%))',
    style: {},
    overlayOpacity: 0,
  },
  {
    id: 'void',
    name: 'Void',
    preview: 'radial-gradient(ellipse at 50% 50%, hsl(240,15%,6%), hsl(0,0%,2%))',
    style: {
      background: 'radial-gradient(ellipse at 50% 50%, hsl(240,15%,6%), hsl(0,0%,2%))',
    },
    overlayOpacity: 0,
  },
  {
    id: 'nuclear',
    name: 'Nuclear',
    preview: 'radial-gradient(ellipse at 50% 80%, hsl(35,90%,12%), hsl(220,30%,5%))',
    style: {
      background: 'radial-gradient(ellipse at 50% 80%, hsl(35,80%,10%), hsl(220,30%,5%))',
    },
    overlayOpacity: 0,
  },
  {
    id: 'pip-boy',
    name: 'Pip-Boy',
    preview: 'radial-gradient(ellipse at 30% 40%, hsl(120,60%,8%), hsl(130,20%,4%))',
    style: {
      background: 'radial-gradient(ellipse at 30% 40%, hsl(120,55%,7%), hsl(130,20%,3%))',
    },
    overlayOpacity: 0,
  },
  {
    id: 'nuka-cola',
    name: 'Nuka-Cola',
    preview: 'radial-gradient(ellipse at 60% 30%, hsl(0,60%,12%), hsl(220,30%,5%))',
    style: {
      background: 'radial-gradient(ellipse at 60% 30%, hsl(0,55%,10%), hsl(220,30%,4%))',
    },
    overlayOpacity: 0,
  },
  {
    id: 'brotherhood',
    name: 'Brotherhood',
    preview: 'linear-gradient(160deg, hsl(215,20%,10%), hsl(220,10%,5%))',
    style: {
      background: 'linear-gradient(160deg, hsl(215,18%,9%), hsl(220,8%,4%))',
    },
    overlayOpacity: 0,
  },
  {
    id: 'institute',
    name: 'Institute',
    preview: 'radial-gradient(ellipse at 50% 0%, hsl(190,70%,9%), hsl(210,40%,4%))',
    style: {
      background: 'radial-gradient(ellipse at 50% 0%, hsl(190,65%,8%), hsl(210,35%,4%))',
    },
    overlayOpacity: 0,
  },
  {
    id: 'wasteland',
    name: 'Wasteland',
    preview: 'radial-gradient(ellipse at 50% 100%, hsl(35,40%,10%), hsl(25,20%,4%))',
    style: {
      background: 'radial-gradient(ellipse at 50% 100%, hsl(35,35%,9%), hsl(25,18%,4%))',
    },
    overlayOpacity: 0,
  },
];

export type WallpaperState =
  | { type: 'preset'; id: WallpaperPresetId }
  | { type: 'custom'; dataUrl: string };

function load(): WallpaperState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { type: 'preset', id: 'default' };
    return JSON.parse(raw) as WallpaperState;
  } catch {
    return { type: 'preset', id: 'default' };
  }
}

function save(w: WallpaperState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(w));
  } catch {
    // quota exceeded — skip silently
  }
}

export function compressImage(file: File, maxPx = 1920, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = ev => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width > height) {
            height = Math.round((height * maxPx) / width);
            width = maxPx;
          } else {
            width = Math.round((width * maxPx) / height);
            height = maxPx;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function useWallpaper() {
  const [wallpaper, setWallpaperState] = useState<WallpaperState>(load);

  useEffect(() => {
    save(wallpaper);
  }, [wallpaper]);

  const setPreset = (id: WallpaperPresetId) => {
    setWallpaperState({ type: 'preset', id });
  };

  const setCustom = (dataUrl: string) => {
    setWallpaperState({ type: 'custom', dataUrl });
  };

  const reset = () => {
    setWallpaperState({ type: 'preset', id: 'default' });
  };

  const currentPreset =
    wallpaper.type === 'preset'
      ? WALLPAPER_PRESETS.find(p => p.id === wallpaper.id) ?? WALLPAPER_PRESETS[0]
      : null;

  return { wallpaper, setPreset, setCustom, reset, currentPreset };
}
