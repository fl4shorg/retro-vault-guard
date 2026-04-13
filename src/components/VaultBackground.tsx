import { createPortal } from 'react-dom';
import { useWallpaperContext } from '@/contexts/WallpaperContext';
import { WALLPAPER_PRESETS } from '@/hooks/useWallpaper';

/* WallpaperPortal
   Rendered directly into <body> (via portal) so no ancestor CSS transform,
   filter or stacking context can interfere with its fixed position.
   Uses 100vw/100vh (layout viewport — stable) instead of inset:0
   (visual viewport — changes when mobile browser chrome hides/shows),
   and is promoted to its own GPU compositor layer via translateZ(0) so it
   never repaints or repositions during scroll.                           */
function WallpaperPortal({ dataUrl }: { dataUrl: string }) {
  return createPortal(
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -9999,
        overflow: 'hidden',
        pointerEvents: 'none',
        userSelect: 'none',
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
    >
      <img
        src={dataUrl}
        alt=""
        aria-hidden="true"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </div>,
    document.body
  );
}

const VaultBackground = () => {
  const { wallpaper } = useWallpaperContext();

  const isCustom = wallpaper.type === 'custom';
  const preset = wallpaper.type === 'preset'
    ? WALLPAPER_PRESETS.find(p => p.id === wallpaper.id) ?? WALLPAPER_PRESETS[0]
    : null;
  const isDefault = preset?.id === 'default';
  const dataUrl = isCustom
    ? (wallpaper as { type: 'custom'; dataUrl: string }).dataUrl
    : '';

  return (
    <>
      {isCustom && <WallpaperPortal dataUrl={dataUrl} />}

      <div className="fixed inset-0 -z-10">
        {/* Dark overlay for readability over custom image */}
        {isCustom && (
          <div
            className="absolute inset-0"
            style={{ background: 'hsl(220 35% 5% / 0.72)' }}
          />
        )}

        {/* Preset wallpaper */}
        {!isCustom && !isDefault && preset && (
          <div className="absolute inset-0" style={preset.style} />
        )}

        {/* Default vault gradient */}
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

        {/* Hazard stripe */}
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
    </>
  );
};

export default VaultBackground;
