import { useState, useRef, useEffect } from 'react';
import { Settings, Camera, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useTheme, themes, type ThemeId } from '@/hooks/useTheme';

const PROFILE_PHOTO_KEY = 'vault-profile-photo';

export const getProfilePhoto = (): string | null => {
  return localStorage.getItem(PROFILE_PHOTO_KEY);
};

const themeColors: Record<ThemeId, string> = {
  'vault-tec': 'bg-[hsl(45,100%,55%)]',
  'pip-boy': 'bg-[hsl(120,100%,40%)]',
  'nuka-cola': 'bg-[hsl(0,85%,50%)]',
  'brotherhood': 'bg-[hsl(220,10%,55%)]',
  'institute': 'bg-[hsl(190,90%,50%)]',
};

const VaultSettings = () => {
  const { theme, setTheme } = useTheme();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(getProfilePhoto());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      // Resize to save localStorage space
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 128;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        localStorage.setItem(PROFILE_PHOTO_KEY, compressed);
        setProfilePhoto(compressed);
        window.dispatchEvent(new Event('profile-photo-change'));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    localStorage.removeItem(PROFILE_PHOTO_KEY);
    setProfilePhoto(null);
    window.dispatchEvent(new Event('profile-photo-change'));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="w-10 h-10 rounded-lg flex items-center justify-center border border-border/60 hover:border-primary/50 hover:bg-primary/10 transition-all text-muted-foreground hover:text-primary">
          <Settings size={18} />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="border-l border-border/50 w-[300px]"
        style={{ background: 'hsl(220 35% 9% / 0.97)', backdropFilter: 'blur(20px)' }}
      >
        <SheetHeader>
          <SheetTitle className="font-display text-primary tracking-[0.2em] text-sm vault-text-glow">
            CONFIGURAÇÕES
          </SheetTitle>
        </SheetHeader>

        {/* Profile Photo Section */}
        <div className="mt-6 mb-6">
          <p className="font-mono text-[10px] text-muted-foreground tracking-[0.3em] mb-4">
            // FOTO DE PERFIL
          </p>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-border/60 vault-badge flex items-center justify-center">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={24} className="text-muted-foreground/60" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-lg bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera size={18} className="text-primary" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-mono text-primary hover:text-primary/80 transition-colors text-left"
              >
                {profilePhoto ? 'TROCAR FOTO' : 'ESCOLHER FOTO'}
              </button>
              {profilePhoto && (
                <button
                  onClick={removePhoto}
                  className="text-xs font-mono text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1 text-left"
                >
                  <Trash2 size={10} /> REMOVER
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        <div>
          <p className="font-mono text-[10px] text-muted-foreground tracking-[0.3em] mb-4">
            // SELECIONE O TEMA
          </p>
          <div className="space-y-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-all text-left ${
                  theme === t.id
                    ? 'bg-primary/15 border border-primary/30 vault-glow'
                    : 'border border-transparent hover:bg-muted/50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full ${themeColors[t.id]} shrink-0`} />
                <div>
                  <p className={`text-sm font-semibold tracking-wide ${theme === t.id ? 'text-primary' : 'text-foreground'}`}>
                    {t.name}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">{t.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VaultSettings;
