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

      {/* Custom image wallpaper */}
      {isCustom && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${(wallpaper as { type: 'custom'; dataUrl: string }).dataUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* Preset wallpaper base */}
      {!isCustom && !isDefault && preset && (
        <div className="absolute inset-0" style={preset.style} />
      )}

      {/* Default vault gradient bg (only for default preset) */}
      {isDefault && (
        <div className="absolute inset-0 vault-gradient-bg" />
      )}

      {/* Overlay for custom images — darkens so text stays readable */}
      {isCustom && (
        <div
          className="absolute inset-0"
          style={{ background: 'hsl(220 35% 5% / 0.72)' }}
        />
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
        className="absolute w-[700px] h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--vault-blue)), transparent 70%)',
          opacity: isCustom ? 0.025 : 0.04,
          top: '10%',
          left: '-5%',
          animation: 'float-bg 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--vault-yellow)), transparent 70%)',
          opacity: isCustom ? 0.02 : 0.03,
          bottom: '5%',
          right: '-5%',
          animation: 'float-bg 20s ease-in-out infinite reverse',
        }}
      />
    </div>
  );
};

export default VaultBackground;
