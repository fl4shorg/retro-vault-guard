import { useEffect } from 'react';
import { useWallpaperContext } from '@/contexts/WallpaperContext';
import { WALLPAPER_PRESETS } from '@/hooks/useWallpaper';

const VaultBackground = () => {
  const { wallpaper } = useWallpaperContext();

  const isCustom = wallpaper.type === 'custom';
  const preset = wallpaper.type === 'preset'
    ? WALLPAPER_PRESETS.find(p => p.id === wallpaper.id) ?? WALLPAPER_PRESETS[0]
    : null;
  const isDefault = preset?.id === 'default';

  /* Apply custom wallpaper directly on <body> so it's truly fixed to the
     viewport and never moves during scroll, regardless of any stacking
     contexts or transforms inside the React tree.                         */
  useEffect(() => {
    const body = document.body;
    if (isCustom) {
      const dataUrl = (wallpaper as { type: 'custom'; dataUrl: string }).dataUrl;
      body.style.setProperty('background-image', `url(${CSS.escape ? dataUrl : dataUrl})`);
      body.style.setProperty('background-size', 'cover');
      body.style.setProperty('background-position', 'center center');
      body.style.setProperty('background-repeat', 'no-repeat');
      body.style.setProperty('background-attachment', 'fixed');
    } else {
      body.style.removeProperty('background-image');
      body.style.removeProperty('background-size');
      body.style.removeProperty('background-position');
      body.style.removeProperty('background-repeat');
      body.style.removeProperty('background-attachment');
    }
    return () => {
      body.style.removeProperty('background-image');
      body.style.removeProperty('background-size');
      body.style.removeProperty('background-position');
      body.style.removeProperty('background-repeat');
      body.style.removeProperty('background-attachment');
    };
  }, [isCustom, wallpaper]);

  return (
    <div className="fixed inset-0 -z-10">

      {/* Dark overlay when custom wallpaper is active */}
      {isCustom && (
        <div
          className="absolute inset-0"
          style={{ background: 'hsl(220 35% 5% / 0.72)' }}
        />
      )}

      {/* Preset wallpaper base */}
      {!isCustom && !isDefault && preset && (
        <div className="absolute inset-0" style={preset.style} />
      )}

      {/* Default vault gradient bg */}
      {isDefault && (
        <div className="absolute inset-0 vault-gradient-bg" />
      )}

      {/* Grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isCustom ? 0.015 : 0.03,
          backgroundImage: `
            linear-gradient(hsl(var(--vault-yellow)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--vault-yellow)) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Hazard stripes top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />

      {/* Floating orbs */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, hsl(var(--vault-blue)), transparent 70%)',
          top: '10%',
          left: '-5%',
          animation: 'float-bg 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle, hsl(var(--vault-yellow)), transparent 70%)',
          bottom: '5%',
          right: '-5%',
          animation: 'float-bg 20s ease-in-out infinite reverse',
        }}
      />
    </div>
  );
};

export default VaultBackground;
