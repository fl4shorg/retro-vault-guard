import { useState, useRef, useEffect } from 'react';
import { LogOut, Camera, Trash2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTheme, themes, type ThemeId } from '@/hooks/useTheme';
import type { User } from '@supabase/supabase-js';

export const getProfilePhoto = (): string | null => null;

const BUCKET = 'avatars';

const themeColors: Record<ThemeId, string> = {
  'vault-tec': 'bg-[hsl(45,100%,55%)]',
  'pip-boy': 'bg-[hsl(120,100%,40%)]',
  'nuka-cola': 'bg-[hsl(0,85%,50%)]',
  'brotherhood': 'bg-[hsl(220,10%,55%)]',
  'institute': 'bg-[hsl(190,90%,50%)]',
};

async function compressAndUpload(file: File, userId: string): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const SIZE = 256;
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d')!;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE);
        canvas.toBlob(async (blob) => {
          if (!blob) { resolve(null); return; }
          const path = `${userId}/avatar.jpg`;
          const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
            upsert: true,
            contentType: 'image/jpeg',
          });
          if (error) { resolve(null); return; }
          const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
          resolve(data.publicUrl + '?t=' + Date.now());
        }, 'image/jpeg', 0.82);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface VaultProfileMenuProps {
  user: User | null;
  userName: string;
  onLogout: () => void;
}

const VaultSettings = ({ user, userName, onLogout }: VaultProfileMenuProps) => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.user_metadata?.avatar_url ?? null
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvatarUrl(user?.user_metadata?.avatar_url ?? null);
  }, [user?.user_metadata?.avatar_url]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await compressAndUpload(file, user.id);
      if (url) {
        await supabase.auth.updateUser({ data: { avatar_url: url } });
        setAvatarUrl(url);
      }
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = async () => {
    if (!user) return;
    await supabase.storage.from(BUCKET).remove([`${user.id}/avatar.jpg`]);
    await supabase.auth.updateUser({ data: { avatar_url: null } });
    setAvatarUrl(null);
  };

  const initial = (userName || 'H').charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>

      {/* ── Avatar circle button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 transition-all flex items-center justify-center font-bold font-mono text-base"
        style={{
          borderColor: open ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.5)',
          background: avatarUrl ? 'transparent' : 'hsl(var(--primary) / 0.12)',
          color: 'hsl(var(--primary))',
          boxShadow: open ? '0 0 12px hsl(var(--primary) / 0.4)' : 'none',
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-xl border border-border/50 overflow-hidden z-[200] shadow-2xl"
          style={{ background: 'hsl(220 35% 9%)', backdropFilter: 'blur(24px)' }}
        >
          <div className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

          {/* User info */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary/40 flex items-center justify-center shrink-0"
              style={{ background: 'hsl(var(--primary) / 0.1)' }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary font-bold font-mono text-base">{initial}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[8px] text-muted-foreground/35 tracking-[0.4em]">AGENTE IDENTIFICADO</p>
              <p className="font-display text-sm font-bold text-primary tracking-wide truncate">
                {userName.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Photo */}
          <div className="px-4 py-3 border-b border-white/5">
            <p className="font-mono text-[8px] text-muted-foreground/35 tracking-[0.35em] mb-2.5">// FOTO DE PERFIL</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 font-mono text-[10px] text-primary hover:text-primary/75 transition-colors disabled:opacity-40"
              >
                <Camera size={12} />
                {uploading ? 'ENVIANDO...' : avatarUrl ? 'TROCAR FOTO' : 'ADICIONAR FOTO'}
              </button>
              {avatarUrl && !uploading && (
                <button
                  onClick={removePhoto}
                  className="flex items-center gap-1 font-mono text-[10px] text-destructive/60 hover:text-destructive transition-colors ml-auto"
                >
                  <Trash2 size={11} /> REMOVER
                </button>
              )}
            </div>
          </div>

          {/* Themes */}
          <div className="px-4 py-3 border-b border-white/5">
            <p className="font-mono text-[8px] text-muted-foreground/35 tracking-[0.35em] mb-2.5">// TEMA DO TERMINAL</p>
            <div className="space-y-0.5">
              {themes.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all text-left ${
                    theme === t.id ? 'bg-primary/10 border border-primary/15' : 'hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${themeColors[t.id]} shrink-0`} />
                  <span className={`font-mono text-[10px] tracking-wider ${theme === t.id ? 'text-primary' : 'text-muted-foreground/60'}`}>
                    {t.name}
                  </span>
                  {theme === t.id && <Check size={10} className="text-primary ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div className="px-4 py-2.5">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg font-mono text-[11px] text-destructive/60 hover:text-destructive hover:bg-destructive/8 transition-all text-left"
            >
              <LogOut size={13} />
              SAIR DO VAULT
            </button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
    </div>
  );
};

export default VaultSettings;
