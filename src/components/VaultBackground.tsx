import { useWallpaperContext } from '@/contexts/WallpaperContext';
import { WALLPAPER_PRESETS } from '@/hooks/useWallpaper';

const VaultBackground = () => {
  const { wallpaper } = useWallpaperContext();

  const isCustom = wallpaper.type === 'custom';
  const preset = wallpaper.type === 'preset'
    ? WALLPAPER_PRESETS.find(p => p.id === wallpaper.id) ?? WALLPAPER_PRESETS[0]
    : null;
  const isDefault = preset?.id === 'default';

  return (
    <div className="fixed inset-0 -z-10">

      {/* Custom image wallpaper — img tag keeps it truly fixed during scroll */}
      {isCustom && (
        <>
          <img
            src={(wallpaper as { type: 'custom'; dataUrl: string }).dataUrl}
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
          {/* Dark overlay for readability */}
          <div
            className="absolute inset-0"
            style={{ background: 'hsl(220 35% 5% / 0.72)' }}
          />
        </>
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
