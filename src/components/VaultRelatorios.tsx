import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import {
  FileText, Plus, Trash2, Download, User,
  Loader2, Camera, UserCheck, TrendingUp, Users,
  Building2, Shield, ChevronDown, Crown, Star, MessageSquare, Ban, Gavel, Landmark,
  CheckCircle2, XCircle, ShieldCheck, Sword, Vote, Stethoscope,
  Scale, Calendar, PenLine, Clock, Key, Flag, Megaphone, ClipboardCheck,
  Wrench, Lightbulb, AlertTriangle, Receipt,
} from 'lucide-react';

// ─── Themes ──────────────────────────────────────────────────────────────────

const THEMES = [
  { id: 'vault-amber',    name: 'Vault Âmbar',       gradient: 'linear-gradient(135deg,#78350f 0%,#b45309 50%,#d97706 100%)' },
  { id: 'midnight-gold',  name: 'Ouro Noir',          gradient: 'linear-gradient(135deg,#0d0d0d 0%,#1a1200 40%,#7c5f00 100%)' },
  { id: 'purple-cosmic',  name: 'Cósmico Roxo',       gradient: 'linear-gradient(135deg,#3b0764 0%,#7c3aed 50%,#a855f7 100%)' },
  { id: 'cyber-blue',     name: 'Cibernético Azul',   gradient: 'linear-gradient(135deg,#0c1445 0%,#1d4ed8 50%,#3b82f6 100%)' },
  { id: 'emerald-tech',   name: 'Esmeralda Tech',     gradient: 'linear-gradient(135deg,#052e16 0%,#059669 50%,#10b981 100%)' },
  { id: 'sunset-fire',    name: 'Pôr do Sol',         gradient: 'linear-gradient(135deg,#7f1d1d 0%,#dc2626 40%,#f97316 100%)' },
  { id: 'ocean-depths',   name: 'Oceano Profundo',    gradient: 'linear-gradient(135deg,#0c1445 0%,#1e40af 40%,#0891b2 100%)' },
  { id: 'galaxy-spiral',  name: 'Espiral Galáctica',  gradient: 'linear-gradient(135deg,#1e1b4b 0%,#581c87 30%,#be185d 70%,#f97316 100%)' },
  { id: 'neon-cyberpunk', name: 'Neon Cyberpunk',     gradient: 'linear-gradient(135deg,#0f0c29 0%,#302b63 40%,#24243e 100%)' },
  { id: 'volcanic',       name: 'Erupção Vulcânica',  gradient: 'linear-gradient(135deg,#1c0000 0%,#7c2d12 30%,#dc2626 70%,#f97316 100%)' },
  { id: 'aurora',         name: 'Aurora Boreal',      gradient: 'linear-gradient(135deg,#064e3b 0%,#0f172a 35%,#4c1d95 70%,#be185d 100%)' },
  { id: 'rose-gold',      name: 'Rosé Gold',          gradient: 'linear-gradient(135deg,#4a0019 0%,#9d174d 45%,#f59e0b 100%)' },
  { id: 'toxic-green',    name: 'Verde Tóxico',       gradient: 'linear-gradient(135deg,#052e16 0%,#14532d 40%,#84cc16 100%)' },
  { id: 'ice-cold',       name: 'Gelo Ártico',        gradient: 'linear-gradient(135deg,#0c1a3a 0%,#1e3a5f 40%,#7dd3fc 100%)' },
  { id: 'blood-moon',     name: 'Lua de Sangue',      gradient: 'linear-gradient(135deg,#0d0000 0%,#450a0a 35%,#991b1b 70%,#b45309 100%)' },
  { id: 'deep-space',     name: 'Espaço Profundo',    gradient: 'linear-gradient(135deg,#000000 0%,#0f172a 40%,#1e1b4b 70%,#312e81 100%)' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Recruta {
  id: string;
  nome: string;
  data: string;
}

interface ReportData {
  responsavel: string;
  fotoResponsavel: string | null;
  wallpaper: string | null;
  dataRelatorio: string;
  recrutamentos: Recruta[];
  subiuDeCargo: string[];
  numeroGrupo: string;
  totalGrupo: string;
  totalNYPD: string;
  totalTestes: string;
  descricao: string;
}

type Theme = typeof THEMES[number];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i]; }
  }
  return result;
}

/** Average all hex stops in a CSS gradient → one representative base colour */
function gradientBase(gradient: string): string {
  const hits = [...gradient.matchAll(/#([0-9a-f]{6})/gi)].map(m => m[1]);
  if (!hits.length) return '000000';
  const sum = hits.reduce((a, h) => ({
    r: a.r + parseInt(h.slice(0,2),16),
    g: a.g + parseInt(h.slice(2,4),16),
    b: a.b + parseInt(h.slice(4,6),16),
  }), { r:0, g:0, b:0 });
  const n = hits.length;
  const hex = (v: number) => Math.round(v/n).toString(16).padStart(2,'0');
  return `#${hex(sum.r)}${hex(sum.g)}${hex(sum.b)}`;
}

/** Alpha-blend an rgba colour over a solid #rrggbb background → solid rgb() string */
function solidOver(fgR: number, fgG: number, fgB: number, alpha: number, bg: string): string {
  const br = parseInt(bg.slice(1,3),16);
  const bg_ = parseInt(bg.slice(3,5),16);
  const bb = parseInt(bg.slice(5,7),16);
  const r = Math.round(alpha*fgR + (1-alpha)*br);
  const g = Math.round(alpha*fgG + (1-alpha)*bg_);
  const b = Math.round(alpha*fgB + (1-alpha)*bb);
  return `rgb(${r},${g},${b})`;
}
/** Shorthand: white × alpha over bg */
const wOver = (alpha: number, bg: string) => solidOver(255,255,255,alpha,bg);
/** Shorthand: black × alpha over bg */
const kOver = (alpha: number, bg: string) => solidOver(0,0,0,alpha,bg);

function formatDate(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

const emptyReport = (): ReportData => ({
  responsavel: '', fotoResponsavel: null, wallpaper: null, dataRelatorio: '',
  recrutamentos: [], subiuDeCargo: [],
  numeroGrupo: '',
  totalGrupo: '', totalNYPD: '', totalTestes: '',
  descricao: '',
});

// ─── Report Card ─────────────────────────────────────────────────────────────
// Uses 100% inline styles — renders identically in preview and in download

function ReportCard({ data, theme }: { data: ReportData; theme: Theme }) {
  const mono = "'Courier New', Courier, monospace";
  const w = '#ffffff';
  const wA = (a: number) => `rgba(255,255,255,${a})`; // safe for text colour only

  // Compute ALL background/border colours as solids so html-to-image renders
  // them identically to the browser preview (no rgba compositing against white).
  const base   = gradientBase(theme.gradient);
  const panel  = kOver(0.28, base);
  const bdr    = wOver(0.14, base);
  const c18    = wOver(0.18, base);
  const c35    = wOver(0.35, base);
  const c12    = wOver(0.12, base);
  const c22    = wOver(0.22, base);
  const c10    = wOver(0.10, base);
  const c50    = wOver(0.50, base);
  const c45    = wOver(0.45, base);

  // Wallpaper support: bg-image + dark overlay so text stays readable.
  // When no wallpaper, falls back to the theme gradient as usual.
  const hasWall = !!data.wallpaper;
  const outerStyle: React.CSSProperties = hasWall
    ? { width: 400, backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }
    : { width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const };

  return (
    <div style={outerStyle}>
      {hasWall && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)', zIndex: 0 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ height: 3, background: c35 }} />

      <div style={{ padding: '24px 22px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: c18, border: `1.5px solid ${c35}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width={42} height={42} viewBox="-17.28 -17.28 66.56 66.56" fill={w}><path d="M 16.117188 4.1035156 C 13.148188 4.0285156 10.174984 5.0325625 7.8339844 6.8515625 C 5.0579844 8.9875625 3.198 12.321031 3 15.832031 L 3 17.410156 C 3.103 19.040156 3.5373906 20.631844 4.2753906 22.089844 C 5.3233906 24.136844 6.9159062 25.855641 8.8789062 27.056641 C 12.570906 29.372641 17.423234 29.620875 21.365234 27.796875 C 23.841234 26.669875 25.950625 24.741422 27.265625 22.357422 C 28.105625 20.840422 28.612859 19.163547 28.755859 17.435547 C 28.780859 16.794547 28.780859 16.152719 28.755859 15.511719 C 28.586859 13.603719 28.044047 11.716469 26.998047 10.105469 C 27.747047 11.753469 27.955828 13.579187 27.673828 15.367188 C 27.404828 16.885188 26.719359 18.299219 25.693359 19.449219 C 25.800359 18.899219 25.989937 18.370406 26.085938 17.816406 C 26.205938 17.104406 26.268969 16.37525 26.167969 15.65625 C 26.074969 14.59225 25.955734 13.234906 25.552734 12.253906 C 25.557734 12.630906 25.526734 13.008719 25.552734 13.386719 C 25.621734 15.105719 24.972359 17.190172 23.943359 18.576172 C 22.958359 19.933172 21.516234 21.013672 19.865234 21.388672 C 19.139234 21.537672 18.327734 21.535812 17.677734 21.132812 C 17.064734 20.763813 16.723 20.062047 16.625 19.373047 C 16.488 18.275047 16.74875 17.160922 17.21875 16.169922 C 17.80375 14.945922 18.704078 13.899578 19.830078 13.142578 C 20.063078 12.979578 20.338625 12.862859 20.515625 12.630859 C 21.152625 11.840859 21.804156 11.060469 22.535156 10.355469 C 23.272156 9.6074688 23.976953 8.9381719 24.751953 8.3261719 C 23.283953 8.2851719 22.077203 8.8823281 20.783203 9.4863281 C 19.202203 10.263328 17.702641 11.196484 16.306641 12.271484 C 15.418641 12.955484 14.935016 13.626234 13.916016 14.115234 C 13.328016 14.405234 12.659625 14.477625 12.015625 14.390625 C 13.019625 14.777625 14.135578 14.662562 15.142578 14.351562 C 15.767578 14.152563 16.020703 14.000547 16.595703 13.685547 C 16.691703 13.614547 16.805109 13.654875 16.912109 13.671875 C 16.907109 13.890875 16.97225 14.152453 16.78125 14.314453 C 16.31125 14.802453 15.749922 15.192156 15.169922 15.535156 C 14.488922 15.922156 13.752609 16.233422 12.974609 16.357422 C 12.324609 16.481422 11.651938 16.361531 11.085938 16.019531 C 10.350938 15.557531 10.069891 14.634688 10.087891 13.804688 C 10.139891 12.582688 10.635078 11.415828 11.330078 10.423828 C 12.389078 8.9408281 13.941781 7.8284844 15.675781 7.2714844 C 16.374781 7.0184844 17.113844 6.9271094 17.839844 6.7871094 C 16.850844 6.6681094 15.849469 6.5844062 14.855469 6.6914062 C 13.861469 6.7704062 12.885656 7.0415 11.972656 7.4375 C 11.709656 7.5475 11.452969 7.6824219 11.167969 7.7324219 C 12.617969 6.1194219 14.640828 5.0209063 16.798828 4.7539062 C 18.025828 4.5579062 18.785 4.5033281 20 4.7363281 C 18.6 4.2343281 17.606188 4.0845156 16.117188 4.1035156 z M 20.337891 10.105469 C 20.282891 10.371469 20.068406 10.580922 19.816406 10.669922 C 19.556406 10.773922 19.287719 10.849484 19.011719 10.896484 C 19.431719 10.605484 19.885891 10.357469 20.337891 10.105469 z"/></svg>
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.25em', marginBottom: 2 }}>Sistema Operacional</div>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 900, color: w, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>CEO REGENTE</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Responsável</div>
              <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w }}>{data.responsavel || '—'}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), marginTop: 2 }}>{formatDate(data.dataRelatorio)}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: `2px solid ${c50}`, overflow: 'hidden', background: c12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.fotoResponsavel
                ? <img src={data.fotoResponsavel} width={44} height={44} style={{ objectFit: 'cover', display: 'block', width: 44, height: 44 }} alt="" />
                : <User size={20} color={wA(0.5)} />
              }
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: bdr, marginBottom: 16 }} />

        {/* ── Título Grupo ── */}
        {data.numeroGrupo && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14, padding: '10px 0' }}>
            <div style={{ flex: 1, height: 1, background: bdr }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={14} color={w} />
              <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 900, color: w, textTransform: 'uppercase' as const, letterSpacing: '0.2em', lineHeight: 1 }}>
                GRUPO {toRoman(parseInt(data.numeroGrupo))}
              </span>
              <Shield size={14} color={w} />
            </div>
            <div style={{ flex: 1, height: 1, background: bdr }} />
          </div>
        )}

        {/* ── Contagens ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'Membros no Grupo', value: data.totalGrupo, Icon: Users },
            { label: 'Quadro Diretivo',   value: data.totalNYPD,  Icon: Building2 },
            ...(data.totalTestes ? [{ label: 'Testes', value: data.totalTestes, Icon: Star }] : []),
          ].map(({ label, value, Icon }) => (
            <div key={label} style={{ flex: 1, background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: c18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} color={w} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.15em', lineHeight: 1, display: 'block' }}>{label}</span>
                <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 900, color: w, lineHeight: 1, display: 'block' }}>{value || '—'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Descrição ── */}
        {data.descricao.trim() && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <p style={{ fontFamily: mono, fontSize: 11, color: w, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' as const }}>{data.descricao}</p>
          </div>
        )}

        {/* ── Subiu de Cargo ── */}
        {data.subiuDeCargo.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <TrendingUp size={13} color={w} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: w, flex: 1 }}>Subiu de Cargo</span>
              <div style={{ fontFamily: mono, fontSize: 9, background: c18, borderRadius: 99, padding: '2px 8px', color: w, lineHeight: 1, textAlign: 'center' as const, flexShrink: 0 }}>{data.subiuDeCargo.length}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {data.subiuDeCargo.map((nome, i) => (
                <div key={i} style={{ background: c18, border: `1px solid ${c22}`, borderRadius: 6, padding: '3px 8px', fontFamily: mono, fontSize: 11, color: w, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>&#8593;</span>{nome}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recrutamentos ── */}
        {data.recrutamentos.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <Users size={13} color={w} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: w, flex: 1 }}>Recrutamentos</span>
              <div style={{ fontFamily: mono, fontSize: 9, background: c18, borderRadius: 99, padding: '2px 8px', color: w, lineHeight: 1, textAlign: 'center' as const, flexShrink: 0 }}>{data.recrutamentos.length}</div>
            </div>
            {data.recrutamentos.map((r, i) => (
              <div key={r.id} style={{
                paddingBottom: i < data.recrutamentos.length - 1 ? 10 : 0,
                marginBottom: i < data.recrutamentos.length - 1 ? 10 : 0,
                borderBottom: i < data.recrutamentos.length - 1 ? `1px solid ${c10}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: w, lineHeight: 1, display: 'block' }}>{r.nome || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.45), textTransform: 'uppercase' as const, letterSpacing: '0.1em', lineHeight: 1 }}>Documento Oficial — NEEXT LTDA</span>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.3), lineHeight: 1 }}>VAULT-TEC</span>
        </div>
      </div>

      <div style={{ height: 3, background: c18 }} />
      </div>{/* /zIndex wrapper */}
    </div>
  );
}

// ─── Recruit form row (sem foto) ──────────────────────────────────────────────

function RecrutaCard({ recruta, onChange, onRemove }: {
  recruta: Recruta;
  onChange: (r: Recruta) => void;
  onRemove: () => void;
}) {
  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2 font-mono text-xs text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  return (
    <div className="rounded-xl p-3 sm:p-4 space-y-2.5 relative"
      style={{ background: 'hsl(220 35% 8%)', border: '1px solid hsl(var(--primary)/0.2)' }}>
      <button onClick={onRemove} className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors">
        <Trash2 size={12} />
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-8">
        <input value={recruta.nome} onChange={e => onChange({ ...recruta, nome: e.target.value })}
          placeholder="Nome do recrutado" className={inp} />
        <input type="date" value={recruta.data} onChange={e => onChange({ ...recruta, data: e.target.value })}
          className={`${inp} [color-scheme:dark]`} />
      </div>
    </div>
  );
}

// ─── Simple list section ──────────────────────────────────────────────────────

function ListSection({ icon: Icon, label, items, placeholder, onAdd, onRemove }: {
  icon: React.ElementType; label: string; items: string[];
  placeholder: string; onAdd: (v: string) => void; onRemove: (i: number) => void;
}) {
  const [val, setVal] = useState('');
  const commit = () => { const t = val.trim(); if (t) { onAdd(t); setVal(''); } };
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(var(--primary)/0.2)', background: 'hsl(220 35% 8%)' }}>
      <div className="flex items-center gap-2 px-3 py-2.5 border-b"
        style={{ borderColor: 'hsl(var(--primary)/0.15)', background: 'hsl(var(--primary)/0.07)' }}>
        <Icon size={13} className="text-primary/70 shrink-0" />
        <span className="font-mono text-[11px] text-primary/80 uppercase tracking-[0.15em] font-bold flex-1">{label}</span>
        <span className="font-mono text-[10px] rounded-full px-2 py-0.5 shrink-0"
          style={{ background: 'hsl(var(--primary)/0.15)', color: 'hsl(var(--primary))' }}>{items.length}</span>
      </div>
      {items.length > 0 && (
        <ul className="px-3 py-2 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-primary/40 shrink-0">{String(i + 1).padStart(2, '0')}.</span>
              <span className="flex-1 font-mono text-xs text-foreground/80 break-words min-w-0">{item}</span>
              <button onClick={() => onRemove(i)} className="w-6 h-6 flex items-center justify-center rounded text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                <Trash2 size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2 px-3 py-2 border-t" style={{ borderColor: 'hsl(var(--primary)/0.1)' }}>
        <input value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && commit()}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent font-mono text-xs text-foreground/70 placeholder:text-muted-foreground/40 outline-none" />
        <button onClick={commit} disabled={!val.trim()}
          className="w-7 h-7 rounded flex items-center justify-center border border-primary/30 text-primary hover:bg-primary/15 disabled:opacity-30 transition-all shrink-0">
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Scaled preview wrapper ───────────────────────────────────────────────────

function ScaledPreview({ data, theme, cardRef }: { data: ReportData; theme: Theme; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setZoom(Math.min(1, w / 400));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}>
          <ReportCard data={data} theme={theme} />
        </div>
      </div>
    </div>
  );
}

// ─── CEO Report types & helpers ───────────────────────────────────────────────

interface CeoReportData {
  responsavel: string;
  fotoResponsavel: string | null;
  wallpaper: string | null;
  dataRelatorio: string;
  descricao: string;
  recrutamentos: Recruta[];
  subiuDeCargo: string[];
  oligarcas: string[];
}

const emptyCeoReport = (): CeoReportData => ({
  responsavel: '', fotoResponsavel: null, wallpaper: null, dataRelatorio: '',
  descricao: '', recrutamentos: [], subiuDeCargo: [],
  oligarcas: [],
});

// ─── CEO Report Card ──────────────────────────────────────────────────────────

function CeoReportCard({ data, theme }: { data: CeoReportData; theme: Theme }) {
  const mono = "'Courier New', Courier, monospace";
  const w = '#ffffff';
  const wA = (a: number) => `rgba(255,255,255,${a})`;

  const base  = gradientBase(theme.gradient);
  const panel = kOver(0.28, base);
  const bdr   = wOver(0.14, base);
  const c18   = wOver(0.18, base);
  const c35   = wOver(0.35, base);
  const c12   = wOver(0.12, base);
  const c22   = wOver(0.22, base);
  const c10   = wOver(0.10, base);
  const c50   = wOver(0.50, base);

  const hasWall = !!data.wallpaper;
  const outerStyle: React.CSSProperties = hasWall
    ? { width: 400, backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }
    : { width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const };

  return (
    <div style={outerStyle}>
      {hasWall && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)', zIndex: 0 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ height: 3, background: c35 }} />

      <div style={{ padding: '24px 22px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: c18, border: `1.5px solid ${c35}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Crown size={18} color={w} />
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.25em', marginBottom: 2 }}>Sistema Operacional</div>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 900, color: w, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>CEO</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Responsável</div>
              <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w }}>{data.responsavel || '—'}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), marginTop: 2 }}>{formatDate(data.dataRelatorio)}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: `2px solid ${c50}`, overflow: 'hidden', background: c12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.fotoResponsavel
                ? <img src={data.fotoResponsavel} width={44} height={44} style={{ objectFit: 'cover', display: 'block', width: 44, height: 44 }} alt="" />
                : <User size={20} color={wA(0.5)} />
              }
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: bdr, marginBottom: 16 }} />

        {/* ── Contadores ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'Total Oligarcas', value: data.oligarcas.length, Icon: Crown },
            { label: 'Total Recrutados', value: data.recrutamentos.length, Icon: Users },
          ].map(({ label, value, Icon }) => (
            <div key={label} style={{ flex: 1, background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: c18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} color={w} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.15em', lineHeight: 1, display: 'block' }}>{label}</span>
                <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 900, color: w, lineHeight: 1, display: 'block' }}>{value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Oligarcas ── */}
        {data.oligarcas.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Crown size={13} color={w} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: w, flex: 1 }}>Oligarcas</span>
              <div style={{ fontFamily: mono, fontSize: 9, background: c18, borderRadius: 99, padding: '2px 8px', color: w, lineHeight: 1, textAlign: 'center' as const, flexShrink: 0 }}>{data.oligarcas.length}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {data.oligarcas.map((nome, i) => (
                <div key={i} style={{ background: c18, border: `1px solid ${c22}`, borderRadius: 6, padding: '3px 8px', fontFamily: mono, fontSize: 11, color: w }}>
                  {nome}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Descrição ── */}
        {data.descricao.trim() && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <p style={{ fontFamily: mono, fontSize: 11, color: w, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' as const }}>{data.descricao}</p>
          </div>
        )}

        {/* ── Subiu de Cargo ── */}
        {data.subiuDeCargo.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <TrendingUp size={13} color={w} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: w, flex: 1 }}>Subiu de Cargo</span>
              <div style={{ fontFamily: mono, fontSize: 9, background: c18, borderRadius: 99, padding: '2px 8px', color: w, lineHeight: 1, textAlign: 'center' as const, flexShrink: 0 }}>{data.subiuDeCargo.length}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {data.subiuDeCargo.map((nome, i) => (
                <div key={i} style={{ background: c18, border: `1px solid ${c22}`, borderRadius: 6, padding: '3px 8px', fontFamily: mono, fontSize: 11, color: w, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>&#8593;</span>{nome}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recrutamentos ── */}
        {data.recrutamentos.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <Users size={13} color={w} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: w, flex: 1 }}>Recrutamentos</span>
              <div style={{ fontFamily: mono, fontSize: 9, background: c18, borderRadius: 99, padding: '2px 8px', color: w, lineHeight: 1, textAlign: 'center' as const, flexShrink: 0 }}>{data.recrutamentos.length}</div>
            </div>
            {data.recrutamentos.map((r, i) => (
              <div key={r.id} style={{
                paddingBottom: i < data.recrutamentos.length - 1 ? 10 : 0,
                marginBottom: i < data.recrutamentos.length - 1 ? 10 : 0,
                borderBottom: i < data.recrutamentos.length - 1 ? `1px solid ${c10}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: w, lineHeight: 1, display: 'block' }}>{r.nome || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.45), textTransform: 'uppercase' as const, letterSpacing: '0.1em', lineHeight: 1 }}>Documento Oficial — NEEXT LTDA</span>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.3), lineHeight: 1 }}>VAULT-TEC</span>
        </div>
      </div>

      <div style={{ height: 3, background: c18 }} />
      </div>
    </div>
  );
}

// ─── Scaled preview for CEO ───────────────────────────────────────────────────

function CeoScaledPreview({ data, theme, cardRef }: { data: CeoReportData; theme: Theme; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setZoom(Math.min(1, entry.contentRect.width / 400));
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}>
          <CeoReportCard data={data} theme={theme} />
        </div>
      </div>
    </div>
  );
}

// ─── CEO Generator ────────────────────────────────────────────────────────────

function CeoGenerator({ onBack }: { onBack: () => void }) {
  const captureRef  = useRef<HTMLDivElement>(null);
  const fotoRef     = useRef<HTMLInputElement>(null);
  const [data, setData]               = useState<CeoReportData>(emptyCeoReport());
  const [themeId, setThemeId]         = useState('vault-amber');
  const [themeOpen, setThemeOpen]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setData(d => ({ ...d, fotoResponsavel: null }));
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, fotoResponsavel: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const wallpaperRef = useRef<HTMLInputElement>(null);

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, wallpaper: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const addRecruta    = () => setData(d => ({ ...d, recrutamentos: [...d.recrutamentos, { id: uid(), nome: '', data: '' }] }));
  const updateRecruta = (id: string, r: Recruta) => setData(d => ({ ...d, recrutamentos: d.recrutamentos.map(x => x.id === id ? r : x) }));
  const removeRecruta = (id: string) => setData(d => ({ ...d, recrutamentos: d.recrutamentos.filter(x => x.id !== id) }));
  const addSubiu      = (v: string) => setData(d => ({ ...d, subiuDeCargo: [...d.subiuDeCargo, v] }));
  const removeSubiu   = (i: number) => setData(d => ({ ...d, subiuDeCargo: d.subiuDeCargo.filter((_, idx) => idx !== i) }));
  const addOligarca    = (v: string) => setData(d => ({ ...d, oligarcas: [...d.oligarcas, v] }));
  const removeOligarca = (i: number) => setData(d => ({ ...d, oligarcas: d.oligarcas.filter((_, idx) => idx !== i) }));

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `relatorio-ceo-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Crown size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">CEO</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">

        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>

            <div className="flex items-end gap-3">
              <div className="shrink-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Foto</label>
                <button onClick={() => fotoRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center relative group transition-opacity hover:opacity-80"
                  style={{ border: '1.5px solid hsl(var(--primary)/0.45)', background: 'hsl(var(--primary)/0.08)' }}>
                  {data.fotoResponsavel
                    ? <img src={data.fotoResponsavel} className="w-full h-full object-cover" alt="" />
                    : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={14} className="text-white" />
                  </div>
                </button>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </div>

              <div className="flex-1 min-w-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                  placeholder="Seu nome" className={inp} />
              </div>
            </div>

            {data.fotoResponsavel && (
              <button onClick={() => setData(d => ({ ...d, fotoResponsavel: null }))}
                className="font-mono text-[10px] text-destructive/50 hover:text-destructive transition-colors">
                Remover foto
              </button>
            )}

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
              <input type="date" value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Tema do Relatório</label>
              <div className="relative">
                <button onClick={() => setThemeOpen(o => !o)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 flex items-center gap-3 hover:border-primary/40 transition-colors">
                  <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: theme.gradient }} />
                  <span className="flex-1 text-left truncate">{theme.name}</span>
                  <ChevronDown size={14} className={`text-primary/50 shrink-0 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeOpen && (
                  <div className="absolute top-full mt-1 w-full z-20 rounded-xl border border-primary/20 overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                    style={{ background: 'hsl(220 35% 8%)' }}>
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm hover:bg-primary/10 transition-colors ${t.id === themeId ? 'text-primary' : 'text-foreground/70'}`}>
                        <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: t.gradient }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* ── Wallpaper (opcional) ── */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Wallpaper de Fundo <span className="text-muted-foreground/40 normal-case tracking-normal">(opcional — substitui o tema)</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => wallpaperRef.current?.click()}
                  className="w-16 h-10 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/60 transition-all shrink-0 relative group"
                  style={data.wallpaper ? { backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!data.wallpaper && <Camera size={14} className="text-primary/40 group-hover:text-primary transition-colors" />}
                  {data.wallpaper && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={12} className="text-white" /></div>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => wallpaperRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <Camera size={11} /> {data.wallpaper ? 'Trocar wallpaper' : 'Carregar wallpaper'}
                  </button>
                  {data.wallpaper && (
                    <button onClick={() => setData(d => ({ ...d, wallpaper: null }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                      Remover wallpaper
                    </button>
                  )}
                </div>
              </div>
              <input ref={wallpaperRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaper} />
              {data.wallpaper && (
                <p className="font-mono text-[10px] text-amber-400/70 mt-1.5">⚠ Wallpaper ativo — o tema de cor é ignorado</p>
              )}
            </div>

          {/* Oligarcas */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />OLIGARCAS<span className="h-px flex-1 bg-primary/15" /></p>
            <ListSection icon={Crown} label="Oligarcas" items={data.oligarcas}
              placeholder="Nome do oligarca..." onAdd={addOligarca} onRemove={removeOligarca} />
          </div>

          {/* Descrição */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />DESCRIÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <textarea value={data.descricao} onChange={e => setData(d => ({ ...d, descricao: e.target.value }))}
              placeholder="Escreva aqui o texto do relatório..." rows={5}
              className={`${inp} resize-none w-full`} />
          </div>

          {/* Subiu de Cargo */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />SUBIU DE CARGO<span className="h-px flex-1 bg-primary/15" /></p>
            <ListSection icon={TrendingUp} label="Promoções" items={data.subiuDeCargo}
              placeholder="Nome do promovido..." onAdd={addSubiu} onRemove={removeSubiu} />
          </div>

          {/* Recrutamentos */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />RECRUTAMENTOS<span className="h-px flex-1 bg-primary/15" /></p>
            {data.recrutamentos.length === 0 && (
              <p className="font-mono text-[11px] text-muted-foreground/50 text-center py-1">Nenhum recrutamento adicionado.</p>
            )}
            <div className="space-y-3">
              {data.recrutamentos.map(r => (
                <RecrutaCard key={r.id} recruta={r}
                  onChange={updated => updateRecruta(r.id, updated)}
                  onRemove={() => removeRecruta(r.id)} />
              ))}
            </div>
            <button onClick={addRecruta}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest border border-dashed border-primary/30 text-primary/60 hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all">
              <UserCheck size={13} />Adicionar Recrutado
            </button>
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <CeoScaledPreview data={data} theme={theme} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─── ADM Report ───────────────────────────────────────────────────────────────

interface AdmReportData {
  responsavel: string;
  fotoResponsavel: string | null;
  wallpaper: string | null;
  dataRelatorio: string;
  descricao: string;
  amigosRecrutados: string[];
}

const emptyAdmReport = (): AdmReportData => ({
  responsavel: '', fotoResponsavel: null, wallpaper: null, dataRelatorio: '',
  descricao: '', amigosRecrutados: [],
});

function AdmReportCard({ data, theme }: { data: AdmReportData; theme: Theme }) {
  const mono = "'Courier New', Courier, monospace";
  const w = '#ffffff';
  const wA = (a: number) => `rgba(255,255,255,${a})`;

  const base  = gradientBase(theme.gradient);
  const panel = kOver(0.28, base);
  const bdr   = wOver(0.14, base);
  const c18   = wOver(0.18, base);
  const c35   = wOver(0.35, base);
  const c12   = wOver(0.12, base);
  const c10   = wOver(0.10, base);
  const c50   = wOver(0.50, base);

  const hasWall = !!data.wallpaper;
  const outerStyle: React.CSSProperties = hasWall
    ? { width: 400, backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }
    : { width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const };

  return (
    <div style={outerStyle}>
      {hasWall && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)', zIndex: 0 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ height: 3, background: c35 }} />
      <div style={{ padding: '24px 22px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: c18, border: `1.5px solid ${c35}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Star size={18} color={w} />
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.25em', marginBottom: 2 }}>Sistema Operacional</div>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 900, color: w, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>ADM</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Responsável</div>
              <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w }}>{data.responsavel || '—'}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), marginTop: 2 }}>{formatDate(data.dataRelatorio)}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: `2px solid ${c50}`, overflow: 'hidden', background: c12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.fotoResponsavel
                ? <img src={data.fotoResponsavel} width={44} height={44} style={{ objectFit: 'cover', display: 'block', width: 44, height: 44 }} alt="" />
                : <User size={20} color={wA(0.5)} />
              }
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: bdr, marginBottom: 16 }} />

        {/* ── Descrição ── */}
        {data.descricao.trim() && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <p style={{ fontFamily: mono, fontSize: 11, color: w, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' as const }}>{data.descricao}</p>
          </div>
        )}

        {/* ── Amigos Recrutados ── */}
        {data.amigosRecrutados.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <Users size={13} color={w} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: w, flex: 1 }}>Amigos Recrutados</span>
              <div style={{ fontFamily: mono, fontSize: 9, background: c18, borderRadius: 99, padding: '2px 8px', color: w, lineHeight: 1, textAlign: 'center' as const, flexShrink: 0 }}>{data.amigosRecrutados.length}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {data.amigosRecrutados.map((nome, i) => (
                <div key={i} style={{ background: c18, border: `1px solid ${bdr}`, borderRadius: 6, padding: '3px 10px', fontFamily: mono, fontSize: 11, color: w, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: wA(0.55), fontSize: 9 }}>●</span>{nome}
                </div>
              ))}
            </div>
            {/* divisor list style for overflow */}
            {data.amigosRecrutados.length > 6 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${c10}` }}>
                {data.amigosRecrutados.slice(6).map((nome, i) => (
                  <div key={i} style={{ fontFamily: mono, fontSize: 11, color: w, paddingBottom: 4 }}>
                    <span style={{ color: wA(0.4), marginRight: 6 }}>{String(i + 7).padStart(2, '0')}.</span>{nome}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.45), textTransform: 'uppercase' as const, letterSpacing: '0.1em', lineHeight: 1 }}>Documento Oficial — NEEXT LTDA</span>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.3), lineHeight: 1 }}>VAULT-TEC</span>
        </div>
      </div>
      <div style={{ height: 3, background: c18 }} />
      </div>
    </div>
  );
}

function AdmScaledPreview({ data, theme, cardRef }: { data: AdmReportData; theme: Theme; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / 400)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}><AdmReportCard data={data} theme={theme} /></div>
      </div>
    </div>
  );
}

function AdmGenerator({ onBack }: { onBack: () => void }) {
  const captureRef  = useRef<HTMLDivElement>(null);
  const fotoRef     = useRef<HTMLInputElement>(null);
  const [data, setData]               = useState<AdmReportData>(emptyAdmReport());
  const [themeId, setThemeId]         = useState('emerald-tech');
  const [themeOpen, setThemeOpen]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setData(d => ({ ...d, fotoResponsavel: null }));
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, fotoResponsavel: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const wallpaperRef = useRef<HTMLInputElement>(null);

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, wallpaper: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const addAmigo    = (v: string) => setData(d => ({ ...d, amigosRecrutados: [...d.amigosRecrutados, v] }));
  const removeAmigo = (i: number) => setData(d => ({ ...d, amigosRecrutados: d.amigosRecrutados.filter((_, idx) => idx !== i) }));

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `relatorio-adm-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Star size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">ADM</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="flex items-end gap-3">
              <div className="shrink-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Foto</label>
                <button onClick={() => fotoRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center relative group transition-opacity hover:opacity-80"
                  style={{ border: '1.5px solid hsl(var(--primary)/0.45)', background: 'hsl(var(--primary)/0.08)' }}>
                  {data.fotoResponsavel
                    ? <img src={data.fotoResponsavel} className="w-full h-full object-cover" alt="" />
                    : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={14} className="text-white" />
                  </div>
                </button>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                  placeholder="Seu nome" className={inp} />
              </div>
            </div>
            {data.fotoResponsavel && (
              <button onClick={() => setData(d => ({ ...d, fotoResponsavel: null }))}
                className="font-mono text-[10px] text-destructive/50 hover:text-destructive transition-colors">
                Remover foto
              </button>
            )}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
              <input type="date" value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Tema do Relatório</label>
              <div className="relative">
                <button onClick={() => setThemeOpen(o => !o)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 flex items-center gap-3 hover:border-primary/40 transition-colors">
                  <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: theme.gradient }} />
                  <span className="flex-1 text-left truncate">{theme.name}</span>
                  <ChevronDown size={14} className={`text-primary/50 shrink-0 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeOpen && (
                  <div className="absolute top-full mt-1 w-full z-20 rounded-xl border border-primary/20 overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                    style={{ background: 'hsl(220 35% 8%)' }}>
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm hover:bg-primary/10 transition-colors ${t.id === themeId ? 'text-primary' : 'text-foreground/70'}`}>
                        <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: t.gradient }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* ── Wallpaper (opcional) ── */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Wallpaper de Fundo <span className="text-muted-foreground/40 normal-case tracking-normal">(opcional — substitui o tema)</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => wallpaperRef.current?.click()}
                  className="w-16 h-10 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/60 transition-all shrink-0 relative group"
                  style={data.wallpaper ? { backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!data.wallpaper && <Camera size={14} className="text-primary/40 group-hover:text-primary transition-colors" />}
                  {data.wallpaper && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={12} className="text-white" /></div>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => wallpaperRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <Camera size={11} /> {data.wallpaper ? 'Trocar wallpaper' : 'Carregar wallpaper'}
                  </button>
                  {data.wallpaper && (
                    <button onClick={() => setData(d => ({ ...d, wallpaper: null }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                      Remover wallpaper
                    </button>
                  )}
                </div>
              </div>
              <input ref={wallpaperRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaper} />
              {data.wallpaper && (
                <p className="font-mono text-[10px] text-amber-400/70 mt-1.5">⚠ Wallpaper ativo — o tema de cor é ignorado</p>
              )}
            </div>

          {/* Descrição */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />DESCRIÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <textarea value={data.descricao} onChange={e => setData(d => ({ ...d, descricao: e.target.value }))}
              placeholder="Escreva aqui o texto do relatório..." rows={5}
              className={`${inp} resize-none w-full`} />
          </div>

          {/* Amigos Recrutados */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />AMIGOS RECRUTADOS<span className="h-px flex-1 bg-primary/15" /></p>
            <ListSection icon={Users} label="Amigos Recrutados" items={data.amigosRecrutados}
              placeholder="Nome do amigo recrutado..." onAdd={addAmigo} onRemove={removeAmigo} />
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <AdmScaledPreview data={data} theme={theme} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Recrutamento Report ──────────────────────────────────────────────────────

interface RecrutamentoReportData {
  responsavel: string;
  fotoResponsavel: string | null;
  wallpaper: string | null;
  dataRelatorio: string;
  recrutamentos: Recruta[];
}

const emptyRecrutamentoReport = (): RecrutamentoReportData => ({
  responsavel: '', fotoResponsavel: null, wallpaper: null, dataRelatorio: '', recrutamentos: [],
});

function RecrutamentoReportCard({ data, theme }: { data: RecrutamentoReportData; theme: Theme }) {
  const mono = "'Courier New', Courier, monospace";
  const w = '#ffffff';
  const wA = (a: number) => `rgba(255,255,255,${a})`;

  const base  = gradientBase(theme.gradient);
  const panel = kOver(0.28, base);
  const bdr   = wOver(0.14, base);
  const c18   = wOver(0.18, base);
  const c35   = wOver(0.35, base);
  const c12   = wOver(0.12, base);
  const c10   = wOver(0.10, base);
  const c50   = wOver(0.50, base);

  const hasWall = !!data.wallpaper;
  const outerStyle: React.CSSProperties = hasWall
    ? { width: 400, backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }
    : { width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const };

  return (
    <div style={outerStyle}>
      {hasWall && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)', zIndex: 0 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ height: 3, background: c35 }} />
      <div style={{ padding: '24px 22px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: c18, border: `1.5px solid ${c35}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <UserCheck size={18} color={w} />
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.25em', marginBottom: 2 }}>Sistema Operacional</div>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 900, color: w, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>RECRUTAMENTO</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Responsável</div>
              <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w }}>{data.responsavel || '—'}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), marginTop: 2 }}>{formatDate(data.dataRelatorio)}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: `2px solid ${c50}`, overflow: 'hidden', background: c12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.fotoResponsavel
                ? <img src={data.fotoResponsavel} width={44} height={44} style={{ objectFit: 'cover', display: 'block', width: 44, height: 44 }} alt="" />
                : <User size={20} color={wA(0.5)} />
              }
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: bdr, marginBottom: 16 }} />

        {/* ── Total recrutados ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: c18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={15} color={w} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
              <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.15em', lineHeight: 1, display: 'block' }}>Total Recrutados</span>
              <span style={{ fontFamily: mono, fontSize: 22, fontWeight: 900, color: w, lineHeight: 1, display: 'block' }}>{data.recrutamentos.length}</span>
            </div>
          </div>
        </div>

        {/* ── Lista de recrutados ── */}
        {data.recrutamentos.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <UserCheck size={13} color={w} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: w, flex: 1 }}>Recrutados</span>
            </div>
            {data.recrutamentos.map((r, i) => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingBottom: i < data.recrutamentos.length - 1 ? 10 : 0,
                marginBottom: i < data.recrutamentos.length - 1 ? 10 : 0,
                borderBottom: i < data.recrutamentos.length - 1 ? `1px solid ${c10}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: mono, fontSize: 9, color: wA(0.4), minWidth: 20 }}>{String(i + 1).padStart(2, '0')}.</span>
                  <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: w }}>{r.nome || '—'}</span>
                </div>
                {r.data && (
                  <span style={{ fontFamily: mono, fontSize: 9, color: wA(0.5), flexShrink: 0 }}>{formatDate(r.data)}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.45), textTransform: 'uppercase' as const, letterSpacing: '0.1em', lineHeight: 1 }}>Documento Oficial — NEEXT LTDA</span>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.3), lineHeight: 1 }}>VAULT-TEC</span>
        </div>
      </div>
      <div style={{ height: 3, background: c18 }} />
      </div>
    </div>
  );
}

function RecrutamentoScaledPreview({ data, theme, cardRef }: { data: RecrutamentoReportData; theme: Theme; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / 400)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}><RecrutamentoReportCard data={data} theme={theme} /></div>
      </div>
    </div>
  );
}

function RecrutamentoGenerator({ onBack }: { onBack: () => void }) {
  const captureRef  = useRef<HTMLDivElement>(null);
  const fotoRef     = useRef<HTMLInputElement>(null);
  const [data, setData]               = useState<RecrutamentoReportData>(emptyRecrutamentoReport());
  const [themeId, setThemeId]         = useState('cyber-blue');
  const [themeOpen, setThemeOpen]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setData(d => ({ ...d, fotoResponsavel: null }));
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, fotoResponsavel: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const wallpaperRef = useRef<HTMLInputElement>(null);

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, wallpaper: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const addRecruta    = () => setData(d => ({ ...d, recrutamentos: [...d.recrutamentos, { id: uid(), nome: '', data: '' }] }));
  const updateRecruta = (id: string, r: Recruta) => setData(d => ({ ...d, recrutamentos: d.recrutamentos.map(x => x.id === id ? r : x) }));
  const removeRecruta = (id: string) => setData(d => ({ ...d, recrutamentos: d.recrutamentos.filter(x => x.id !== id) }));

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `relatorio-recrutamento-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <UserCheck size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">Recrutamento</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="flex items-end gap-3">
              <div className="shrink-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Foto</label>
                <button onClick={() => fotoRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center relative group transition-opacity hover:opacity-80"
                  style={{ border: '1.5px solid hsl(var(--primary)/0.45)', background: 'hsl(var(--primary)/0.08)' }}>
                  {data.fotoResponsavel
                    ? <img src={data.fotoResponsavel} className="w-full h-full object-cover" alt="" />
                    : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={14} className="text-white" />
                  </div>
                </button>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                  placeholder="Seu nome" className={inp} />
              </div>
            </div>
            {data.fotoResponsavel && (
              <button onClick={() => setData(d => ({ ...d, fotoResponsavel: null }))}
                className="font-mono text-[10px] text-destructive/50 hover:text-destructive transition-colors">
                Remover foto
              </button>
            )}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
              <input type="date" value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Tema do Relatório</label>
              <div className="relative">
                <button onClick={() => setThemeOpen(o => !o)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 flex items-center gap-3 hover:border-primary/40 transition-colors">
                  <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: theme.gradient }} />
                  <span className="flex-1 text-left truncate">{theme.name}</span>
                  <ChevronDown size={14} className={`text-primary/50 shrink-0 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeOpen && (
                  <div className="absolute top-full mt-1 w-full z-20 rounded-xl border border-primary/20 overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                    style={{ background: 'hsl(220 35% 8%)' }}>
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm hover:bg-primary/10 transition-colors ${t.id === themeId ? 'text-primary' : 'text-foreground/70'}`}>
                        <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: t.gradient }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* ── Wallpaper (opcional) ── */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Wallpaper de Fundo <span className="text-muted-foreground/40 normal-case tracking-normal">(opcional — substitui o tema)</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => wallpaperRef.current?.click()}
                  className="w-16 h-10 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/60 transition-all shrink-0 relative group"
                  style={data.wallpaper ? { backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!data.wallpaper && <Camera size={14} className="text-primary/40 group-hover:text-primary transition-colors" />}
                  {data.wallpaper && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={12} className="text-white" /></div>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => wallpaperRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <Camera size={11} /> {data.wallpaper ? 'Trocar wallpaper' : 'Carregar wallpaper'}
                  </button>
                  {data.wallpaper && (
                    <button onClick={() => setData(d => ({ ...d, wallpaper: null }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                      Remover wallpaper
                    </button>
                  )}
                </div>
              </div>
              <input ref={wallpaperRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaper} />
              {data.wallpaper && (
                <p className="font-mono text-[10px] text-amber-400/70 mt-1.5">⚠ Wallpaper ativo — o tema de cor é ignorado</p>
              )}
            </div>

          {/* Recrutamentos */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />RECRUTAMENTOS<span className="h-px flex-1 bg-primary/15" /></p>
            {data.recrutamentos.length === 0 && (
              <p className="font-mono text-[11px] text-muted-foreground/50 text-center py-1">Nenhum recrutado adicionado.</p>
            )}
            <div className="space-y-3">
              {data.recrutamentos.map(r => (
                <RecrutaCard key={r.id} recruta={r}
                  onChange={updated => updateRecruta(r.id, updated)}
                  onRemove={() => removeRecruta(r.id)} />
              ))}
            </div>
            <button onClick={addRecruta}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest border border-dashed border-primary/30 text-primary/60 hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all">
              <UserCheck size={13} />Adicionar Recrutado
            </button>
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <RecrutamentoScaledPreview data={data} theme={theme} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Parlamento Report ────────────────────────────────────────────────────────

interface GrupoParlamento {
  id: string;
  nome: string;
  totalAdms: string;
  totalMembros: string;
}

interface ParlamentoReportData {
  responsavel: string;
  fotoResponsavel: string | null;
  wallpaper: string | null;
  dataRelatorio: string;
  grupos: GrupoParlamento[];
}

const emptyParlamentoReport = (): ParlamentoReportData => ({
  responsavel: '', fotoResponsavel: null, wallpaper: null, dataRelatorio: '', grupos: [],
});

function GrupoParlamentoCard({ grupo, onChange, onRemove }: {
  grupo: GrupoParlamento;
  onChange: (g: GrupoParlamento) => void;
  onRemove: () => void;
}) {
  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2 font-mono text-xs text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  return (
    <div className="rounded-xl p-3 sm:p-4 space-y-2.5 relative"
      style={{ background: 'hsl(220 35% 8%)', border: '1px solid hsl(var(--primary)/0.2)' }}>
      <button onClick={onRemove} className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors">
        <Trash2 size={13} />
      </button>
      <div className="pr-8">
        <label className="font-mono text-[9px] text-primary/50 tracking-widest uppercase block mb-1">Nome do Grupo</label>
        <input value={grupo.nome} onChange={e => onChange({ ...grupo, nome: e.target.value })}
          placeholder="Nome do grupo..." className={inp} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-mono text-[9px] text-primary/50 tracking-widest uppercase block mb-1">Total de ADMs</label>
          <input type="number" min={0} value={grupo.totalAdms} onChange={e => onChange({ ...grupo, totalAdms: e.target.value })}
            placeholder="0" className={inp} />
        </div>
        <div>
          <label className="font-mono text-[9px] text-primary/50 tracking-widest uppercase block mb-1">Total de Membros</label>
          <input type="number" min={0} value={grupo.totalMembros} onChange={e => onChange({ ...grupo, totalMembros: e.target.value })}
            placeholder="0" className={inp} />
        </div>
      </div>
    </div>
  );
}

function ParlamentoReportCard({ data, theme }: { data: ParlamentoReportData; theme: Theme }) {
  const mono = "'Courier New', Courier, monospace";
  const w = '#ffffff';
  const wA = (a: number) => `rgba(255,255,255,${a})`;

  const base  = gradientBase(theme.gradient);
  const panel = kOver(0.28, base);
  const bdr   = wOver(0.14, base);
  const c18   = wOver(0.18, base);
  const c35   = wOver(0.35, base);
  const c12   = wOver(0.12, base);
  const c10   = wOver(0.10, base);
  const c50   = wOver(0.50, base);

  const totalAdms    = data.grupos.reduce((s, g) => s + (parseInt(g.totalAdms)    || 0), 0);
  const totalMembros = data.grupos.reduce((s, g) => s + (parseInt(g.totalMembros) || 0), 0);

  const hasWall = !!data.wallpaper;
  const outerStyle: React.CSSProperties = hasWall
    ? { width: 400, backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }
    : { width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const };

  return (
    <div style={outerStyle}>
      {hasWall && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)', zIndex: 0 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ height: 3, background: c35 }} />
      <div style={{ padding: '24px 22px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: c18, border: `1.5px solid ${c35}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Vote size={18} color={w} />
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.25em', marginBottom: 2 }}>Sistema Operacional</div>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 900, color: w, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>PARLAMENTO</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Responsável</div>
              <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w }}>{data.responsavel || '—'}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), marginTop: 2 }}>{formatDate(data.dataRelatorio)}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: `2px solid ${c50}`, overflow: 'hidden', background: c12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.fotoResponsavel
                ? <img src={data.fotoResponsavel} width={44} height={44} style={{ objectFit: 'cover', display: 'block', width: 44, height: 44 }} alt="" />
                : <User size={20} color={wA(0.5)} />
              }
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: bdr, marginBottom: 16 }} />

        {/* ── Totais gerais ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Grupos',           value: data.grupos.length, Icon: Vote },
            { label: 'Total de Membros', value: totalMembros,       Icon: Users },
            { label: 'Total de ADMs',    value: totalAdms,          Icon: Building2 },
          ].map(({ label, value, Icon }) => (
            <div key={label} style={{ flex: 1, background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: c18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} color={w} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.13em', lineHeight: 1, display: 'block' }}>{label}</span>
                <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 900, color: w, lineHeight: 1, display: 'block' }}>{value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Lista de grupos ── */}
        {data.grupos.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <Vote size={13} color={w} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: w, flex: 1 }}>Grupos</span>
              <span style={{ fontFamily: mono, fontSize: 9, background: c18, borderRadius: 99, padding: '2px 8px', color: w }}>{data.grupos.length}</span>
            </div>
            {/* header row */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${c10}` }}>
              <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.4), textTransform: 'uppercase' as const, letterSpacing: '0.15em', flex: 1 }}>Grupo</span>
              <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.4), textTransform: 'uppercase' as const, letterSpacing: '0.12em', width: 52, textAlign: 'center' as const }}>ADMs</span>
              <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.4), textTransform: 'uppercase' as const, letterSpacing: '0.12em', width: 60, textAlign: 'right' as const }}>Membros</span>
            </div>
            {data.grupos.map((g, i) => (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center',
                paddingBottom: i < data.grupos.length - 1 ? 8 : 0,
                marginBottom:  i < data.grupos.length - 1 ? 8 : 0,
                borderBottom:  i < data.grupos.length - 1 ? `1px solid ${c10}` : 'none',
              }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span style={{ fontFamily: mono, fontSize: 9, color: wA(0.35) }}>{String(i + 1).padStart(2, '0')}.</span>
                  <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{g.nome || '—'}</span>
                </div>
                <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w, width: 52, textAlign: 'center' as const, flexShrink: 0 }}>{g.totalAdms || '0'}</span>
                <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w, width: 60, textAlign: 'right' as const, flexShrink: 0 }}>{g.totalMembros || '0'}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.45), textTransform: 'uppercase' as const, letterSpacing: '0.1em', lineHeight: 1 }}>Documento Oficial — NEEXT LTDA</span>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.3), lineHeight: 1 }}>VAULT-TEC</span>
        </div>
      </div>
      <div style={{ height: 3, background: c18 }} />
      </div>
    </div>
  );
}

function ParlamentoScaledPreview({ data, theme, cardRef }: { data: ParlamentoReportData; theme: Theme; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / 400)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}><ParlamentoReportCard data={data} theme={theme} /></div>
      </div>
    </div>
  );
}

function ParlamentoGenerator({ onBack }: { onBack: () => void }) {
  const captureRef  = useRef<HTMLDivElement>(null);
  const fotoRef     = useRef<HTMLInputElement>(null);
  const [data, setData]               = useState<ParlamentoReportData>(emptyParlamentoReport());
  const [themeId, setThemeId]         = useState('galaxy-spiral');
  const [themeOpen, setThemeOpen]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setData(d => ({ ...d, fotoResponsavel: null }));
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, fotoResponsavel: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const wallpaperRef = useRef<HTMLInputElement>(null);

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, wallpaper: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const addGrupo    = () => setData(d => ({ ...d, grupos: [...d.grupos, { id: uid(), nome: '', totalAdms: '', totalMembros: '' }] }));
  const updateGrupo = (id: string, g: GrupoParlamento) => setData(d => ({ ...d, grupos: d.grupos.map(x => x.id === id ? g : x) }));
  const removeGrupo = (id: string) => setData(d => ({ ...d, grupos: d.grupos.filter(x => x.id !== id) }));

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `relatorio-parlamento-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Vote size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">Parlamento</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="flex items-end gap-3">
              <div className="shrink-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Foto</label>
                <button onClick={() => fotoRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center relative group transition-opacity hover:opacity-80"
                  style={{ border: '1.5px solid hsl(var(--primary)/0.45)', background: 'hsl(var(--primary)/0.08)' }}>
                  {data.fotoResponsavel
                    ? <img src={data.fotoResponsavel} className="w-full h-full object-cover" alt="" />
                    : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={14} className="text-white" />
                  </div>
                </button>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                  placeholder="Seu nome" className={inp} />
              </div>
            </div>
            {data.fotoResponsavel && (
              <button onClick={() => setData(d => ({ ...d, fotoResponsavel: null }))}
                className="font-mono text-[10px] text-destructive/50 hover:text-destructive transition-colors">
                Remover foto
              </button>
            )}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
              <input type="date" value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Tema do Relatório</label>
              <div className="relative">
                <button onClick={() => setThemeOpen(o => !o)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 flex items-center gap-3 hover:border-primary/40 transition-colors">
                  <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: theme.gradient }} />
                  <span className="flex-1 text-left truncate">{theme.name}</span>
                  <ChevronDown size={14} className={`text-primary/50 shrink-0 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeOpen && (
                  <div className="absolute top-full mt-1 w-full z-20 rounded-xl border border-primary/20 overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                    style={{ background: 'hsl(220 35% 8%)' }}>
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm hover:bg-primary/10 transition-colors ${t.id === themeId ? 'text-primary' : 'text-foreground/70'}`}>
                        <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: t.gradient }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* ── Wallpaper (opcional) ── */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Wallpaper de Fundo <span className="text-muted-foreground/40 normal-case tracking-normal">(opcional — substitui o tema)</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => wallpaperRef.current?.click()}
                  className="w-16 h-10 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/60 transition-all shrink-0 relative group"
                  style={data.wallpaper ? { backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!data.wallpaper && <Camera size={14} className="text-primary/40 group-hover:text-primary transition-colors" />}
                  {data.wallpaper && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={12} className="text-white" /></div>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => wallpaperRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <Camera size={11} /> {data.wallpaper ? 'Trocar wallpaper' : 'Carregar wallpaper'}
                  </button>
                  {data.wallpaper && (
                    <button onClick={() => setData(d => ({ ...d, wallpaper: null }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                      Remover wallpaper
                    </button>
                  )}
                </div>
              </div>
              <input ref={wallpaperRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaper} />
              {data.wallpaper && (
                <p className="font-mono text-[10px] text-amber-400/70 mt-1.5">⚠ Wallpaper ativo — o tema de cor é ignorado</p>
              )}
            </div>

          {/* Grupos */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />GRUPOS<span className="h-px flex-1 bg-primary/15" /></p>
            {data.grupos.length === 0 && (
              <p className="font-mono text-[11px] text-muted-foreground/50 text-center py-1">Nenhum grupo adicionado.</p>
            )}
            <div className="space-y-3">
              {data.grupos.map(g => (
                <GrupoParlamentoCard key={g.id} grupo={g}
                  onChange={updated => updateGrupo(g.id, updated)}
                  onRemove={() => removeGrupo(g.id)} />
              ))}
            </div>
            <button onClick={addGrupo}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest border border-dashed border-primary/30 text-primary/60 hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all">
              <Plus size={13} />Adicionar Grupo
            </button>
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <ParlamentoScaledPreview data={data} theme={theme} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Ministério da Defesa Report ─────────────────────────────────────────────

interface DefesaReportData {
  responsavel: string;
  fotoResponsavel: string | null;
  wallpaper: string | null;
  dataRelatorio: string;
  forcasAtivas: string;
  reservistas: string;
  descricao: string;
}

const emptyDefesaReport = (): DefesaReportData => ({
  responsavel: '', fotoResponsavel: null, wallpaper: null, dataRelatorio: '',
  forcasAtivas: '', reservistas: '', descricao: '',
});

function DefesaReportCard({ data, theme }: { data: DefesaReportData; theme: Theme }) {
  const mono = "'Courier New', Courier, monospace";
  const w = '#ffffff';
  const wA = (a: number) => `rgba(255,255,255,${a})`;

  const base  = gradientBase(theme.gradient);
  const panel = kOver(0.28, base);
  const bdr   = wOver(0.14, base);
  const c18   = wOver(0.18, base);
  const c35   = wOver(0.35, base);
  const c12   = wOver(0.12, base);
  const c50   = wOver(0.50, base);

  const hasWall = !!data.wallpaper;
  const outerStyle: React.CSSProperties = hasWall
    ? { width: 400, backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }
    : { width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const };

  return (
    <div style={outerStyle}>
      {hasWall && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)', zIndex: 0 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ height: 3, background: c35 }} />
      <div style={{ padding: '24px 22px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: c18, border: `1.5px solid ${c35}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck size={18} color={w} />
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.25em', marginBottom: 2 }}>Sistema Operacional</div>
              <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 900, color: w, textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>MIN. DA DEFESA</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Responsável</div>
              <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w }}>{data.responsavel || '—'}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), marginTop: 2 }}>{formatDate(data.dataRelatorio)}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: `2px solid ${c50}`, overflow: 'hidden', background: c12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.fotoResponsavel
                ? <img src={data.fotoResponsavel} width={44} height={44} style={{ objectFit: 'cover', display: 'block', width: 44, height: 44 }} alt="" />
                : <User size={20} color={wA(0.5)} />
              }
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: bdr, marginBottom: 16 }} />

        {/* ── Contagens ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: data.descricao.trim() ? 14 : 0 }}>
          {[
            { label: 'Forças Ativas', value: data.forcasAtivas, Icon: Sword },
            { label: 'Reservistas',   value: data.reservistas,  Icon: ShieldCheck },
          ].map(({ label, value, Icon }) => (
            <div key={label} style={{ flex: 1, background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: c18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} color={w} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.13em', lineHeight: 1, display: 'block' }}>{label}</span>
                <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 900, color: w, lineHeight: 1, display: 'block' }}>{value || '—'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Descrição ── */}
        {data.descricao.trim() && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px', marginTop: 14 }}>
            <p style={{ fontFamily: mono, fontSize: 11, color: w, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' as const }}>{data.descricao}</p>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.45), textTransform: 'uppercase' as const, letterSpacing: '0.1em', lineHeight: 1 }}>Documento Oficial — NEEXT LTDA</span>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.3), lineHeight: 1 }}>VAULT-TEC</span>
        </div>
      </div>
      <div style={{ height: 3, background: c18 }} />
      </div>
    </div>
  );
}

function DefesaScaledPreview({ data, theme, cardRef }: { data: DefesaReportData; theme: Theme; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / 400)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}><DefesaReportCard data={data} theme={theme} /></div>
      </div>
    </div>
  );
}

function DefesaGenerator({ onBack }: { onBack: () => void }) {
  const captureRef  = useRef<HTMLDivElement>(null);
  const fotoRef     = useRef<HTMLInputElement>(null);
  const [data, setData]               = useState<DefesaReportData>(emptyDefesaReport());
  const [themeId, setThemeId]         = useState('toxic-green');
  const [themeOpen, setThemeOpen]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setData(d => ({ ...d, fotoResponsavel: null }));
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, fotoResponsavel: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const wallpaperRef = useRef<HTMLInputElement>(null);

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, wallpaper: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `relatorio-defesa-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <ShieldCheck size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">Ministério da Defesa</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="flex items-end gap-3">
              <div className="shrink-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Foto</label>
                <button onClick={() => fotoRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center relative group transition-opacity hover:opacity-80"
                  style={{ border: '1.5px solid hsl(var(--primary)/0.45)', background: 'hsl(var(--primary)/0.08)' }}>
                  {data.fotoResponsavel
                    ? <img src={data.fotoResponsavel} className="w-full h-full object-cover" alt="" />
                    : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={14} className="text-white" />
                  </div>
                </button>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                  placeholder="Seu nome" className={inp} />
              </div>
            </div>
            {data.fotoResponsavel && (
              <button onClick={() => setData(d => ({ ...d, fotoResponsavel: null }))}
                className="font-mono text-[10px] text-destructive/50 hover:text-destructive transition-colors">
                Remover foto
              </button>
            )}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
              <input type="date" value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Tema do Relatório</label>
              <div className="relative">
                <button onClick={() => setThemeOpen(o => !o)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 flex items-center gap-3 hover:border-primary/40 transition-colors">
                  <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: theme.gradient }} />
                  <span className="flex-1 text-left truncate">{theme.name}</span>
                  <ChevronDown size={14} className={`text-primary/50 shrink-0 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeOpen && (
                  <div className="absolute top-full mt-1 w-full z-20 rounded-xl border border-primary/20 overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                    style={{ background: 'hsl(220 35% 8%)' }}>
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm hover:bg-primary/10 transition-colors ${t.id === themeId ? 'text-primary' : 'text-foreground/70'}`}>
                        <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: t.gradient }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* ── Wallpaper (opcional) ── */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Wallpaper de Fundo <span className="text-muted-foreground/40 normal-case tracking-normal">(opcional — substitui o tema)</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => wallpaperRef.current?.click()}
                  className="w-16 h-10 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/60 transition-all shrink-0 relative group"
                  style={data.wallpaper ? { backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!data.wallpaper && <Camera size={14} className="text-primary/40 group-hover:text-primary transition-colors" />}
                  {data.wallpaper && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={12} className="text-white" /></div>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => wallpaperRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <Camera size={11} /> {data.wallpaper ? 'Trocar wallpaper' : 'Carregar wallpaper'}
                  </button>
                  {data.wallpaper && (
                    <button onClick={() => setData(d => ({ ...d, wallpaper: null }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                      Remover wallpaper
                    </button>
                  )}
                </div>
              </div>
              <input ref={wallpaperRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaper} />
              {data.wallpaper && (
                <p className="font-mono text-[10px] text-amber-400/70 mt-1.5">⚠ Wallpaper ativo — o tema de cor é ignorado</p>
              )}
            </div>

          {/* Contagens */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />EFETIVO<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Forças Ativas</label>
                <input type="number" min={0} value={data.forcasAtivas} onChange={e => setData(d => ({ ...d, forcasAtivas: e.target.value }))}
                  placeholder="0" className={inp} />
              </div>
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Reservistas</label>
                <input type="number" min={0} value={data.reservistas} onChange={e => setData(d => ({ ...d, reservistas: e.target.value }))}
                  placeholder="0" className={inp} />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />DESCRIÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <textarea value={data.descricao} onChange={e => setData(d => ({ ...d, descricao: e.target.value }))}
              placeholder="Escreva aqui o texto do relatório..." rows={5}
              className={`${inp} resize-none w-full`} />
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <DefesaScaledPreview data={data} theme={theme} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Premiê Report ────────────────────────────────────────────────────────────

interface PremiereReportData {
  responsavel: string;
  fotoResponsavel: string | null;
  wallpaper: string | null;
  dataRelatorio: string;
  descricao: string;
  presentes: string[];
  ausentes: string[];
}

const emptyPremiereReport = (): PremiereReportData => ({
  responsavel: '', fotoResponsavel: null, wallpaper: null, dataRelatorio: '',
  descricao: '', presentes: [], ausentes: [],
});

function PremiereReportCard({ data, theme }: { data: PremiereReportData; theme: Theme }) {
  const mono = "'Courier New', Courier, monospace";
  const w = '#ffffff';
  const wA = (a: number) => `rgba(255,255,255,${a})`;

  const base  = gradientBase(theme.gradient);
  const panel = kOver(0.28, base);
  const bdr   = wOver(0.14, base);
  const c18   = wOver(0.18, base);
  const c35   = wOver(0.35, base);
  const c12   = wOver(0.12, base);
  const c10   = wOver(0.10, base);
  const c50   = wOver(0.50, base);

  const hasWall = !!data.wallpaper;
  const outerStyle: React.CSSProperties = hasWall
    ? { width: 400, backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }
    : { width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const };

  return (
    <div style={outerStyle}>
      {hasWall && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)', zIndex: 0 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ height: 3, background: c35 }} />
      <div style={{ padding: '24px 22px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: c18, border: `1.5px solid ${c35}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Landmark size={18} color={w} />
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.25em', marginBottom: 2 }}>Sistema Operacional</div>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 900, color: w, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>PREMIÊ</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Responsável</div>
              <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w }}>{data.responsavel || '—'}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), marginTop: 2 }}>{formatDate(data.dataRelatorio)}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: `2px solid ${c50}`, overflow: 'hidden', background: c12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.fotoResponsavel
                ? <img src={data.fotoResponsavel} width={44} height={44} style={{ objectFit: 'cover', display: 'block', width: 44, height: 44 }} alt="" />
                : <User size={20} color={wA(0.5)} />
              }
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: bdr, marginBottom: 16 }} />

        {/* ── Contagens ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'Total Presentes', value: data.presentes.length, Icon: CheckCircle2 },
            { label: 'Total Ausentes',  value: data.ausentes.length,  Icon: XCircle },
          ].map(({ label, value, Icon }) => (
            <div key={label} style={{ flex: 1, background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: c18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} color={w} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
                <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.13em', lineHeight: 1, display: 'block' }}>{label}</span>
                <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 900, color: w, lineHeight: 1, display: 'block' }}>{value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Descrição ── */}
        {data.descricao.trim() && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
            <p style={{ fontFamily: mono, fontSize: 11, color: w, lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' as const }}>{data.descricao}</p>
          </div>
        )}

        {/* ── Presentes ── */}
        {data.presentes.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <CheckCircle2 size={13} color={w} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: w, flex: 1 }}>Ministros Presentes</span>
              <div style={{ fontFamily: mono, fontSize: 9, background: c18, borderRadius: 99, padding: '2px 8px', color: w, lineHeight: 1, flexShrink: 0 }}>{data.presentes.length}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {data.presentes.map((nome, i) => (
                <div key={i} style={{ background: c18, border: `1px solid ${bdr}`, borderRadius: 6, padding: '3px 10px', fontFamily: mono, fontSize: 11, color: w, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: wA(0.55), fontSize: 9 }}>✓</span>{nome}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Ausentes ── */}
        {data.ausentes.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <XCircle size={13} color={w} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: w, flex: 1 }}>Ministros Ausentes</span>
              <div style={{ fontFamily: mono, fontSize: 9, background: c18, borderRadius: 99, padding: '2px 8px', color: w, lineHeight: 1, flexShrink: 0 }}>{data.ausentes.length}</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {data.ausentes.map((nome, i) => (
                <div key={i} style={{ background: c18, border: `1px solid ${bdr}`, borderRadius: 6, padding: '3px 10px', fontFamily: mono, fontSize: 11, color: w, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: wA(0.4), fontSize: 9 }}>✕</span>{nome}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.45), textTransform: 'uppercase' as const, letterSpacing: '0.1em', lineHeight: 1 }}>Documento Oficial — NEEXT LTDA</span>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.3), lineHeight: 1 }}>VAULT-TEC</span>
        </div>
      </div>
      <div style={{ height: 3, background: c18 }} />
      </div>
    </div>
  );
}

function PremiereScaledPreview({ data, theme, cardRef }: { data: PremiereReportData; theme: Theme; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / 400)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}><PremiereReportCard data={data} theme={theme} /></div>
      </div>
    </div>
  );
}

function PremiereGenerator({ onBack }: { onBack: () => void }) {
  const captureRef  = useRef<HTMLDivElement>(null);
  const fotoRef     = useRef<HTMLInputElement>(null);
  const [data, setData]               = useState<PremiereReportData>(emptyPremiereReport());
  const [themeId, setThemeId]         = useState('ocean-depths');
  const [themeOpen, setThemeOpen]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setData(d => ({ ...d, fotoResponsavel: null }));
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, fotoResponsavel: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const wallpaperRef = useRef<HTMLInputElement>(null);

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, wallpaper: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const addPresente    = (v: string) => setData(d => ({ ...d, presentes: [...d.presentes, v] }));
  const removePresente = (i: number) => setData(d => ({ ...d, presentes: d.presentes.filter((_, idx) => idx !== i) }));
  const addAusente     = (v: string) => setData(d => ({ ...d, ausentes: [...d.ausentes, v] }));
  const removeAusente  = (i: number) => setData(d => ({ ...d, ausentes: d.ausentes.filter((_, idx) => idx !== i) }));

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `relatorio-premiere-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Landmark size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">Premiê</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="flex items-end gap-3">
              <div className="shrink-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Foto</label>
                <button onClick={() => fotoRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center relative group transition-opacity hover:opacity-80"
                  style={{ border: '1.5px solid hsl(var(--primary)/0.45)', background: 'hsl(var(--primary)/0.08)' }}>
                  {data.fotoResponsavel
                    ? <img src={data.fotoResponsavel} className="w-full h-full object-cover" alt="" />
                    : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={14} className="text-white" />
                  </div>
                </button>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                  placeholder="Seu nome" className={inp} />
              </div>
            </div>
            {data.fotoResponsavel && (
              <button onClick={() => setData(d => ({ ...d, fotoResponsavel: null }))}
                className="font-mono text-[10px] text-destructive/50 hover:text-destructive transition-colors">
                Remover foto
              </button>
            )}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
              <input type="date" value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Tema do Relatório</label>
              <div className="relative">
                <button onClick={() => setThemeOpen(o => !o)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 flex items-center gap-3 hover:border-primary/40 transition-colors">
                  <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: theme.gradient }} />
                  <span className="flex-1 text-left truncate">{theme.name}</span>
                  <ChevronDown size={14} className={`text-primary/50 shrink-0 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeOpen && (
                  <div className="absolute top-full mt-1 w-full z-20 rounded-xl border border-primary/20 overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                    style={{ background: 'hsl(220 35% 8%)' }}>
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm hover:bg-primary/10 transition-colors ${t.id === themeId ? 'text-primary' : 'text-foreground/70'}`}>
                        <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: t.gradient }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* ── Wallpaper (opcional) ── */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Wallpaper de Fundo <span className="text-muted-foreground/40 normal-case tracking-normal">(opcional — substitui o tema)</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => wallpaperRef.current?.click()}
                  className="w-16 h-10 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/60 transition-all shrink-0 relative group"
                  style={data.wallpaper ? { backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!data.wallpaper && <Camera size={14} className="text-primary/40 group-hover:text-primary transition-colors" />}
                  {data.wallpaper && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={12} className="text-white" /></div>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => wallpaperRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <Camera size={11} /> {data.wallpaper ? 'Trocar wallpaper' : 'Carregar wallpaper'}
                  </button>
                  {data.wallpaper && (
                    <button onClick={() => setData(d => ({ ...d, wallpaper: null }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                      Remover wallpaper
                    </button>
                  )}
                </div>
              </div>
              <input ref={wallpaperRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaper} />
              {data.wallpaper && (
                <p className="font-mono text-[10px] text-amber-400/70 mt-1.5">⚠ Wallpaper ativo — o tema de cor é ignorado</p>
              )}
            </div>

          {/* Descrição */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />DESCRIÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <textarea value={data.descricao} onChange={e => setData(d => ({ ...d, descricao: e.target.value }))}
              placeholder="Escreva aqui o texto do relatório..." rows={4}
              className={`${inp} resize-none w-full`} />
          </div>

          {/* Ministros Presentes */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />MINISTROS PRESENTES<span className="h-px flex-1 bg-primary/15" /></p>
            <ListSection icon={CheckCircle2} label="Presentes" items={data.presentes}
              placeholder="Nome do ministro presente..." onAdd={addPresente} onRemove={removePresente} />
          </div>

          {/* Ministros Ausentes */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />MINISTROS AUSENTES<span className="h-px flex-1 bg-primary/15" /></p>
            <ListSection icon={XCircle} label="Ausentes" items={data.ausentes}
              placeholder="Nome do ministro ausente..." onAdd={addAusente} onRemove={removeAusente} />
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <PremiereScaledPreview data={data} theme={theme} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Procurador Geral Report ──────────────────────────────────────────────────

interface PessoaKitada {
  id: string;
  nome: string;
  descricao: string;
}

interface ProcuradorReportData {
  responsavel: string;
  fotoResponsavel: string | null;
  wallpaper: string | null;
  dataRelatorio: string;
  kitados: PessoaKitada[];
}

const emptyProcuradorReport = (): ProcuradorReportData => ({
  responsavel: '', fotoResponsavel: null, wallpaper: null, dataRelatorio: '', kitados: [],
});

function PessoaKitadaCard({ pessoa, onChange, onRemove }: {
  pessoa: PessoaKitada;
  onChange: (p: PessoaKitada) => void;
  onRemove: () => void;
}) {
  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2 font-mono text-xs text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  return (
    <div className="rounded-xl p-3 sm:p-4 space-y-2.5 relative"
      style={{ background: 'hsl(220 35% 8%)', border: '1px solid hsl(var(--primary)/0.2)' }}>
      <button onClick={onRemove} className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors">
        <Trash2 size={13} />
      </button>
      <div className="pr-8">
        <label className="font-mono text-[9px] text-primary/50 tracking-widest uppercase block mb-1">Nome</label>
        <input value={pessoa.nome} onChange={e => onChange({ ...pessoa, nome: e.target.value })}
          placeholder="Nome do kitado..." className={inp} />
      </div>
      <div>
        <label className="font-mono text-[9px] text-primary/50 tracking-widest uppercase block mb-1">Motivo / Descrição</label>
        <textarea value={pessoa.descricao} onChange={e => onChange({ ...pessoa, descricao: e.target.value })}
          placeholder="O que a pessoa fez..." rows={2}
          className={`${inp} resize-none`} />
      </div>
    </div>
  );
}

function ProcuradorReportCard({ data, theme }: { data: ProcuradorReportData; theme: Theme }) {
  const mono = "'Courier New', Courier, monospace";
  const w = '#ffffff';
  const wA = (a: number) => `rgba(255,255,255,${a})`;

  const base  = gradientBase(theme.gradient);
  const panel = kOver(0.28, base);
  const bdr   = wOver(0.14, base);
  const c18   = wOver(0.18, base);
  const c35   = wOver(0.35, base);
  const c12   = wOver(0.12, base);
  const c10   = wOver(0.10, base);
  const c50   = wOver(0.50, base);

  const hasWall = !!data.wallpaper;
  const outerStyle: React.CSSProperties = hasWall
    ? { width: 400, backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }
    : { width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const };

  return (
    <div style={outerStyle}>
      {hasWall && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)', zIndex: 0 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ height: 3, background: c35 }} />
      <div style={{ padding: '24px 22px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: c18, border: `1.5px solid ${c35}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Gavel size={18} color={w} />
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.25em', marginBottom: 2 }}>Sistema Operacional</div>
              <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 900, color: w, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>PROC. GERAL</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Responsável</div>
              <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w }}>{data.responsavel || '—'}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), marginTop: 2 }}>{formatDate(data.dataRelatorio)}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: `2px solid ${c50}`, overflow: 'hidden', background: c12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.fotoResponsavel
                ? <img src={data.fotoResponsavel} width={44} height={44} style={{ objectFit: 'cover', display: 'block', width: 44, height: 44 }} alt="" />
                : <User size={20} color={wA(0.5)} />
              }
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: bdr, marginBottom: 16 }} />

        {/* ── Total kitados ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: c18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Gavel size={15} color={w} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
              <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.15em', lineHeight: 1, display: 'block' }}>Total de Kitados</span>
              <span style={{ fontFamily: mono, fontSize: 22, fontWeight: 900, color: w, lineHeight: 1, display: 'block' }}>{data.kitados.length}</span>
            </div>
          </div>
        </div>

        {/* ── Lista de kitados ── */}
        {data.kitados.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <Gavel size={13} color={w} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: w, flex: 1 }}>Pessoas Kitadas</span>
            </div>
            {data.kitados.map((p, i) => (
              <div key={p.id} style={{
                paddingBottom: i < data.kitados.length - 1 ? 12 : 0,
                marginBottom: i < data.kitados.length - 1 ? 12 : 0,
                borderBottom: i < data.kitados.length - 1 ? `1px solid ${c10}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: p.descricao.trim() ? 5 : 0 }}>
                  <span style={{ fontFamily: mono, fontSize: 9, color: wA(0.4), minWidth: 20 }}>{String(i + 1).padStart(2, '0')}.</span>
                  <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: w }}>{p.nome || '—'}</span>
                </div>
                {p.descricao.trim() && (
                  <div style={{ marginLeft: 28 }}>
                    <p style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' as const }}>{p.descricao}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.45), textTransform: 'uppercase' as const, letterSpacing: '0.1em', lineHeight: 1 }}>Documento Oficial — NEEXT LTDA</span>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.3), lineHeight: 1 }}>VAULT-TEC</span>
        </div>
      </div>
      <div style={{ height: 3, background: c18 }} />
      </div>
    </div>
  );
}

function ProcuradorScaledPreview({ data, theme, cardRef }: { data: ProcuradorReportData; theme: Theme; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / 400)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}><ProcuradorReportCard data={data} theme={theme} /></div>
      </div>
    </div>
  );
}

function ProcuradorGenerator({ onBack }: { onBack: () => void }) {
  const captureRef  = useRef<HTMLDivElement>(null);
  const fotoRef     = useRef<HTMLInputElement>(null);
  const [data, setData]               = useState<ProcuradorReportData>(emptyProcuradorReport());
  const [themeId, setThemeId]         = useState('midnight-gold');
  const [themeOpen, setThemeOpen]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setData(d => ({ ...d, fotoResponsavel: null }));
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, fotoResponsavel: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const wallpaperRef = useRef<HTMLInputElement>(null);

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, wallpaper: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const addKitado    = () => setData(d => ({ ...d, kitados: [...d.kitados, { id: uid(), nome: '', descricao: '' }] }));
  const updateKitado = (id: string, p: PessoaKitada) => setData(d => ({ ...d, kitados: d.kitados.map(x => x.id === id ? p : x) }));
  const removeKitado = (id: string) => setData(d => ({ ...d, kitados: d.kitados.filter(x => x.id !== id) }));

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `relatorio-procurador-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Gavel size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">Procurador Geral</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="flex items-end gap-3">
              <div className="shrink-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Foto</label>
                <button onClick={() => fotoRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center relative group transition-opacity hover:opacity-80"
                  style={{ border: '1.5px solid hsl(var(--primary)/0.45)', background: 'hsl(var(--primary)/0.08)' }}>
                  {data.fotoResponsavel
                    ? <img src={data.fotoResponsavel} className="w-full h-full object-cover" alt="" />
                    : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={14} className="text-white" />
                  </div>
                </button>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                  placeholder="Seu nome" className={inp} />
              </div>
            </div>
            {data.fotoResponsavel && (
              <button onClick={() => setData(d => ({ ...d, fotoResponsavel: null }))}
                className="font-mono text-[10px] text-destructive/50 hover:text-destructive transition-colors">
                Remover foto
              </button>
            )}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
              <input type="date" value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Tema do Relatório</label>
              <div className="relative">
                <button onClick={() => setThemeOpen(o => !o)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 flex items-center gap-3 hover:border-primary/40 transition-colors">
                  <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: theme.gradient }} />
                  <span className="flex-1 text-left truncate">{theme.name}</span>
                  <ChevronDown size={14} className={`text-primary/50 shrink-0 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeOpen && (
                  <div className="absolute top-full mt-1 w-full z-20 rounded-xl border border-primary/20 overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                    style={{ background: 'hsl(220 35% 8%)' }}>
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm hover:bg-primary/10 transition-colors ${t.id === themeId ? 'text-primary' : 'text-foreground/70'}`}>
                        <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: t.gradient }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* ── Wallpaper (opcional) ── */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Wallpaper de Fundo <span className="text-muted-foreground/40 normal-case tracking-normal">(opcional — substitui o tema)</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => wallpaperRef.current?.click()}
                  className="w-16 h-10 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/60 transition-all shrink-0 relative group"
                  style={data.wallpaper ? { backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!data.wallpaper && <Camera size={14} className="text-primary/40 group-hover:text-primary transition-colors" />}
                  {data.wallpaper && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={12} className="text-white" /></div>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => wallpaperRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <Camera size={11} /> {data.wallpaper ? 'Trocar wallpaper' : 'Carregar wallpaper'}
                  </button>
                  {data.wallpaper && (
                    <button onClick={() => setData(d => ({ ...d, wallpaper: null }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                      Remover wallpaper
                    </button>
                  )}
                </div>
              </div>
              <input ref={wallpaperRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaper} />
              {data.wallpaper && (
                <p className="font-mono text-[10px] text-amber-400/70 mt-1.5">⚠ Wallpaper ativo — o tema de cor é ignorado</p>
              )}
            </div>

          {/* Kitados */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />PESSOAS KITADAS<span className="h-px flex-1 bg-primary/15" /></p>
            {data.kitados.length === 0 && (
              <p className="font-mono text-[11px] text-muted-foreground/50 text-center py-1">Nenhum kitado adicionado.</p>
            )}
            <div className="space-y-3">
              {data.kitados.map(p => (
                <PessoaKitadaCard key={p.id} pessoa={p}
                  onChange={updated => updateKitado(p.id, updated)}
                  onRemove={() => removeKitado(p.id)} />
              ))}
            </div>
            <button onClick={addKitado}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest border border-dashed border-primary/30 text-primary/60 hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all">
              <Gavel size={13} />Adicionar Kitado
            </button>
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <ProcuradorScaledPreview data={data} theme={theme} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Ban Report ───────────────────────────────────────────────────────────────

interface PessoaBanida {
  id: string;
  nome: string;
  descricao: string;
}

interface BanReportData {
  responsavel: string;
  fotoResponsavel: string | null;
  wallpaper: string | null;
  dataRelatorio: string;
  banidos: PessoaBanida[];
}

const emptyBanReport = (): BanReportData => ({
  responsavel: '', fotoResponsavel: null, wallpaper: null, dataRelatorio: '', banidos: [],
});

function PessoaBanidaCard({ pessoa, onChange, onRemove }: {
  pessoa: PessoaBanida;
  onChange: (p: PessoaBanida) => void;
  onRemove: () => void;
}) {
  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2 font-mono text-xs text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  return (
    <div className="rounded-xl p-3 sm:p-4 space-y-2.5 relative"
      style={{ background: 'hsl(220 35% 8%)', border: '1px solid hsl(var(--primary)/0.2)' }}>
      <button onClick={onRemove} className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors">
        <Trash2 size={13} />
      </button>
      <div className="pr-8">
        <label className="font-mono text-[9px] text-primary/50 tracking-widest uppercase block mb-1">Nome</label>
        <input value={pessoa.nome} onChange={e => onChange({ ...pessoa, nome: e.target.value })}
          placeholder="Nome do banido..." className={inp} />
      </div>
      <div>
        <label className="font-mono text-[9px] text-primary/50 tracking-widest uppercase block mb-1">Motivo / Descrição</label>
        <textarea value={pessoa.descricao} onChange={e => onChange({ ...pessoa, descricao: e.target.value })}
          placeholder="O que a pessoa fez..." rows={2}
          className={`${inp} resize-none`} />
      </div>
    </div>
  );
}

function BanReportCard({ data, theme }: { data: BanReportData; theme: Theme }) {
  const mono = "'Courier New', Courier, monospace";
  const w = '#ffffff';
  const wA = (a: number) => `rgba(255,255,255,${a})`;

  const base  = gradientBase(theme.gradient);
  const panel = kOver(0.28, base);
  const bdr   = wOver(0.14, base);
  const c18   = wOver(0.18, base);
  const c35   = wOver(0.35, base);
  const c12   = wOver(0.12, base);
  const c10   = wOver(0.10, base);
  const c50   = wOver(0.50, base);

  const hasWall = !!data.wallpaper;
  const outerStyle: React.CSSProperties = hasWall
    ? { width: 400, backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }
    : { width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const };

  return (
    <div style={outerStyle}>
      {hasWall && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)', zIndex: 0 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ height: 3, background: c35 }} />
      <div style={{ padding: '24px 22px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: c18, border: `1.5px solid ${c35}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ban size={18} color={w} />
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.25em', marginBottom: 2 }}>Sistema Operacional</div>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 900, color: w, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>BANIMENTOS</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Responsável</div>
              <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w }}>{data.responsavel || '—'}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), marginTop: 2 }}>{formatDate(data.dataRelatorio)}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: `2px solid ${c50}`, overflow: 'hidden', background: c12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.fotoResponsavel
                ? <img src={data.fotoResponsavel} width={44} height={44} style={{ objectFit: 'cover', display: 'block', width: 44, height: 44 }} alt="" />
                : <User size={20} color={wA(0.5)} />
              }
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: bdr, marginBottom: 16 }} />

        {/* ── Total banimentos ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: c18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ban size={15} color={w} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
              <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.15em', lineHeight: 1, display: 'block' }}>Total de Banimentos</span>
              <span style={{ fontFamily: mono, fontSize: 22, fontWeight: 900, color: w, lineHeight: 1, display: 'block' }}>{data.banidos.length}</span>
            </div>
          </div>
        </div>

        {/* ── Lista de banidos ── */}
        {data.banidos.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <Ban size={13} color={w} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: w, flex: 1 }}>Pessoas Banidas</span>
            </div>
            {data.banidos.map((p, i) => (
              <div key={p.id} style={{
                paddingBottom: i < data.banidos.length - 1 ? 12 : 0,
                marginBottom: i < data.banidos.length - 1 ? 12 : 0,
                borderBottom: i < data.banidos.length - 1 ? `1px solid ${c10}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: p.descricao.trim() ? 5 : 0 }}>
                  <span style={{ fontFamily: mono, fontSize: 9, color: wA(0.4), minWidth: 20 }}>{String(i + 1).padStart(2, '0')}.</span>
                  <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: w }}>{p.nome || '—'}</span>
                </div>
                {p.descricao.trim() && (
                  <div style={{ marginLeft: 28 }}>
                    <p style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' as const }}>{p.descricao}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.45), textTransform: 'uppercase' as const, letterSpacing: '0.1em', lineHeight: 1 }}>Documento Oficial — NEEXT LTDA</span>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.3), lineHeight: 1 }}>VAULT-TEC</span>
        </div>
      </div>
      <div style={{ height: 3, background: c18 }} />
      </div>
    </div>
  );
}

function BanScaledPreview({ data, theme, cardRef }: { data: BanReportData; theme: Theme; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / 400)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}><BanReportCard data={data} theme={theme} /></div>
      </div>
    </div>
  );
}

function BanGenerator({ onBack }: { onBack: () => void }) {
  const captureRef  = useRef<HTMLDivElement>(null);
  const fotoRef     = useRef<HTMLInputElement>(null);
  const [data, setData]               = useState<BanReportData>(emptyBanReport());
  const [themeId, setThemeId]         = useState('sunset-fire');
  const [themeOpen, setThemeOpen]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setData(d => ({ ...d, fotoResponsavel: null }));
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, fotoResponsavel: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const wallpaperRef = useRef<HTMLInputElement>(null);

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, wallpaper: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const addBanido    = () => setData(d => ({ ...d, banidos: [...d.banidos, { id: uid(), nome: '', descricao: '' }] }));
  const updateBanido = (id: string, p: PessoaBanida) => setData(d => ({ ...d, banidos: d.banidos.map(x => x.id === id ? p : x) }));
  const removeBanido = (id: string) => setData(d => ({ ...d, banidos: d.banidos.filter(x => x.id !== id) }));

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `relatorio-ban-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Ban size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">Banimentos</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="flex items-end gap-3">
              <div className="shrink-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Foto</label>
                <button onClick={() => fotoRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center relative group transition-opacity hover:opacity-80"
                  style={{ border: '1.5px solid hsl(var(--primary)/0.45)', background: 'hsl(var(--primary)/0.08)' }}>
                  {data.fotoResponsavel
                    ? <img src={data.fotoResponsavel} className="w-full h-full object-cover" alt="" />
                    : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={14} className="text-white" />
                  </div>
                </button>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                  placeholder="Seu nome" className={inp} />
              </div>
            </div>
            {data.fotoResponsavel && (
              <button onClick={() => setData(d => ({ ...d, fotoResponsavel: null }))}
                className="font-mono text-[10px] text-destructive/50 hover:text-destructive transition-colors">
                Remover foto
              </button>
            )}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
              <input type="date" value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Tema do Relatório</label>
              <div className="relative">
                <button onClick={() => setThemeOpen(o => !o)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 flex items-center gap-3 hover:border-primary/40 transition-colors">
                  <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: theme.gradient }} />
                  <span className="flex-1 text-left truncate">{theme.name}</span>
                  <ChevronDown size={14} className={`text-primary/50 shrink-0 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeOpen && (
                  <div className="absolute top-full mt-1 w-full z-20 rounded-xl border border-primary/20 overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                    style={{ background: 'hsl(220 35% 8%)' }}>
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm hover:bg-primary/10 transition-colors ${t.id === themeId ? 'text-primary' : 'text-foreground/70'}`}>
                        <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: t.gradient }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* ── Wallpaper (opcional) ── */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Wallpaper de Fundo <span className="text-muted-foreground/40 normal-case tracking-normal">(opcional — substitui o tema)</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => wallpaperRef.current?.click()}
                  className="w-16 h-10 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/60 transition-all shrink-0 relative group"
                  style={data.wallpaper ? { backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!data.wallpaper && <Camera size={14} className="text-primary/40 group-hover:text-primary transition-colors" />}
                  {data.wallpaper && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={12} className="text-white" /></div>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => wallpaperRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <Camera size={11} /> {data.wallpaper ? 'Trocar wallpaper' : 'Carregar wallpaper'}
                  </button>
                  {data.wallpaper && (
                    <button onClick={() => setData(d => ({ ...d, wallpaper: null }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                      Remover wallpaper
                    </button>
                  )}
                </div>
              </div>
              <input ref={wallpaperRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaper} />
              {data.wallpaper && (
                <p className="font-mono text-[10px] text-amber-400/70 mt-1.5">⚠ Wallpaper ativo — o tema de cor é ignorado</p>
              )}
            </div>

          {/* Banidos */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />PESSOAS BANIDAS<span className="h-px flex-1 bg-primary/15" /></p>
            {data.banidos.length === 0 && (
              <p className="font-mono text-[11px] text-muted-foreground/50 text-center py-1">Nenhum banimento adicionado.</p>
            )}
            <div className="space-y-3">
              {data.banidos.map(p => (
                <PessoaBanidaCard key={p.id} pessoa={p}
                  onChange={updated => updateBanido(p.id, updated)}
                  onRemove={() => removeBanido(p.id)} />
              ))}
            </div>
            <button onClick={addBanido}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest border border-dashed border-primary/30 text-primary/60 hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all">
              <Ban size={13} />Adicionar Banimento
            </button>
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <BanScaledPreview data={data} theme={theme} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Contador de Mensagens Report ────────────────────────────────────────────

interface GrupoMensagem {
  id: string;
  nome: string;
  total: string;
}

interface ContadorMsgData {
  responsavel: string;
  fotoResponsavel: string | null;
  wallpaper: string | null;
  dataRelatorio: string;
  grupos: GrupoMensagem[];
}

const emptyContadorMsg = (): ContadorMsgData => ({
  responsavel: '', fotoResponsavel: null, wallpaper: null, dataRelatorio: '', grupos: [],
});

function GrupoCard({ grupo, onChange, onRemove }: {
  grupo: GrupoMensagem;
  onChange: (g: GrupoMensagem) => void;
  onRemove: () => void;
}) {
  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2 font-mono text-xs text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  return (
    <div className="rounded-xl p-3 sm:p-4 space-y-2.5 relative"
      style={{ background: 'hsl(220 35% 8%)', border: '1px solid hsl(var(--primary)/0.2)' }}>
      <button onClick={onRemove} className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors">
        <Trash2 size={13} />
      </button>
      <div className="grid grid-cols-2 gap-2 pr-8">
        <div>
          <label className="font-mono text-[9px] text-primary/50 tracking-widest uppercase block mb-1">Grupo</label>
          <input value={grupo.nome} onChange={e => onChange({ ...grupo, nome: e.target.value })}
            placeholder="Nome do grupo..." className={inp} />
        </div>
        <div>
          <label className="font-mono text-[9px] text-primary/50 tracking-widest uppercase block mb-1">Total de Mensagens</label>
          <input type="number" min={0} value={grupo.total} onChange={e => onChange({ ...grupo, total: e.target.value })}
            placeholder="0" className={inp} />
        </div>
      </div>
    </div>
  );
}

function ContadorMsgReportCard({ data, theme }: { data: ContadorMsgData; theme: Theme }) {
  const mono = "'Courier New', Courier, monospace";
  const w = '#ffffff';
  const wA = (a: number) => `rgba(255,255,255,${a})`;

  const base  = gradientBase(theme.gradient);
  const panel = kOver(0.28, base);
  const bdr   = wOver(0.14, base);
  const c18   = wOver(0.18, base);
  const c35   = wOver(0.35, base);
  const c12   = wOver(0.12, base);
  const c10   = wOver(0.10, base);
  const c50   = wOver(0.50, base);
  const c22   = wOver(0.22, base);

  const totalMsgs = data.grupos.reduce((sum, g) => sum + (parseInt(g.total) || 0), 0);

  const hasWall = !!data.wallpaper;
  const outerStyle: React.CSSProperties = hasWall
    ? { width: 400, backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }
    : { width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const };

  return (
    <div style={outerStyle}>
      {hasWall && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)', zIndex: 0 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ height: 3, background: c35 }} />
      <div style={{ padding: '24px 22px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: c18, border: `1.5px solid ${c35}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageSquare size={18} color={w} />
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.25em', marginBottom: 2 }}>Sistema Operacional</div>
              <div style={{ fontFamily: mono, fontSize: 14, fontWeight: 900, color: w, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>MENSAGENS</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' as const }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Responsável</div>
              <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w }}>{data.responsavel || '—'}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), marginTop: 2 }}>{formatDate(data.dataRelatorio)}</div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: `2px solid ${c50}`, overflow: 'hidden', background: c12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.fotoResponsavel
                ? <img src={data.fotoResponsavel} width={44} height={44} style={{ objectFit: 'cover', display: 'block', width: 44, height: 44 }} alt="" />
                : <User size={20} color={wA(0.5)} />
              }
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: bdr, marginBottom: 16 }} />

        {/* ── Total geral ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: c18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageSquare size={15} color={w} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
              <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.15em', lineHeight: 1, display: 'block' }}>Total de Mensagens</span>
              <span style={{ fontFamily: mono, fontSize: 22, fontWeight: 900, color: w, lineHeight: 1, display: 'block' }}>{totalMsgs.toLocaleString('pt-BR')}</span>
            </div>
          </div>
          <div style={{ flex: 1, background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: c18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={15} color={w} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3 }}>
              <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.15em', lineHeight: 1, display: 'block' }}>Grupos</span>
              <span style={{ fontFamily: mono, fontSize: 22, fontWeight: 900, color: w, lineHeight: 1, display: 'block' }}>{data.grupos.length}</span>
            </div>
          </div>
        </div>

        {/* ── Grupos ── */}
        {data.grupos.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <MessageSquare size={13} color={w} />
              <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: w, flex: 1 }}>Mensagens por Grupo</span>
            </div>
            {data.grupos.map((g, i) => {
              const val = parseInt(g.total) || 0;
              const pct = totalMsgs > 0 ? Math.round((val / totalMsgs) * 100) : 0;
              const barFill = wOver(0.35, base);
              return (
                <div key={g.id} style={{
                  paddingBottom: i < data.grupos.length - 1 ? 10 : 0,
                  marginBottom: i < data.grupos.length - 1 ? 10 : 0,
                  borderBottom: i < data.grupos.length - 1 ? `1px solid ${c10}` : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: w }}>{g.nome || '—'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: mono, fontSize: 10, color: wA(0.5) }}>{pct}%</span>
                      <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 900, color: w }}>{val.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  {/* progress bar */}
                  <div style={{ height: 4, borderRadius: 99, background: c18, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: barFill, transition: 'width 0.3s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{ marginTop: 18, paddingTop: 12, borderTop: `1px solid ${bdr}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.45), textTransform: 'uppercase' as const, letterSpacing: '0.1em', lineHeight: 1 }}>Documento Oficial — NEEXT LTDA</span>
          <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.3), lineHeight: 1 }}>VAULT-TEC</span>
        </div>
      </div>
      <div style={{ height: 3, background: c22 }} />
      </div>
    </div>
  );
}

function ContadorMsgScaledPreview({ data, theme, cardRef }: { data: ContadorMsgData; theme: Theme; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / 400)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}><ContadorMsgReportCard data={data} theme={theme} /></div>
      </div>
    </div>
  );
}

function ContadorMsgGenerator({ onBack }: { onBack: () => void }) {
  const captureRef  = useRef<HTMLDivElement>(null);
  const fotoRef     = useRef<HTMLInputElement>(null);
  const [data, setData]               = useState<ContadorMsgData>(emptyContadorMsg());
  const [themeId, setThemeId]         = useState('purple-cosmic');
  const [themeOpen, setThemeOpen]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setData(d => ({ ...d, fotoResponsavel: null }));
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, fotoResponsavel: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const wallpaperRef = useRef<HTMLInputElement>(null);

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, wallpaper: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const addGrupo    = () => setData(d => ({ ...d, grupos: [...d.grupos, { id: uid(), nome: '', total: '' }] }));
  const updateGrupo = (id: string, g: GrupoMensagem) => setData(d => ({ ...d, grupos: d.grupos.map(x => x.id === id ? g : x) }));
  const removeGrupo = (id: string) => setData(d => ({ ...d, grupos: d.grupos.filter(x => x.id !== id) }));

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `relatorio-mensagens-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <MessageSquare size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">Contador de Mensagens</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="flex items-end gap-3">
              <div className="shrink-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Foto</label>
                <button onClick={() => fotoRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center relative group transition-opacity hover:opacity-80"
                  style={{ border: '1.5px solid hsl(var(--primary)/0.45)', background: 'hsl(var(--primary)/0.08)' }}>
                  {data.fotoResponsavel
                    ? <img src={data.fotoResponsavel} className="w-full h-full object-cover" alt="" />
                    : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={14} className="text-white" />
                  </div>
                </button>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                  placeholder="Seu nome" className={inp} />
              </div>
            </div>
            {data.fotoResponsavel && (
              <button onClick={() => setData(d => ({ ...d, fotoResponsavel: null }))}
                className="font-mono text-[10px] text-destructive/50 hover:text-destructive transition-colors">
                Remover foto
              </button>
            )}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
              <input type="date" value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Tema do Relatório</label>
              <div className="relative">
                <button onClick={() => setThemeOpen(o => !o)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 flex items-center gap-3 hover:border-primary/40 transition-colors">
                  <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: theme.gradient }} />
                  <span className="flex-1 text-left truncate">{theme.name}</span>
                  <ChevronDown size={14} className={`text-primary/50 shrink-0 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeOpen && (
                  <div className="absolute top-full mt-1 w-full z-20 rounded-xl border border-primary/20 overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                    style={{ background: 'hsl(220 35% 8%)' }}>
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm hover:bg-primary/10 transition-colors ${t.id === themeId ? 'text-primary' : 'text-foreground/70'}`}>
                        <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: t.gradient }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* ── Wallpaper (opcional) ── */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Wallpaper de Fundo <span className="text-muted-foreground/40 normal-case tracking-normal">(opcional — substitui o tema)</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => wallpaperRef.current?.click()}
                  className="w-16 h-10 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/60 transition-all shrink-0 relative group"
                  style={data.wallpaper ? { backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!data.wallpaper && <Camera size={14} className="text-primary/40 group-hover:text-primary transition-colors" />}
                  {data.wallpaper && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={12} className="text-white" /></div>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => wallpaperRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <Camera size={11} /> {data.wallpaper ? 'Trocar wallpaper' : 'Carregar wallpaper'}
                  </button>
                  {data.wallpaper && (
                    <button onClick={() => setData(d => ({ ...d, wallpaper: null }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                      Remover wallpaper
                    </button>
                  )}
                </div>
              </div>
              <input ref={wallpaperRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaper} />
              {data.wallpaper && (
                <p className="font-mono text-[10px] text-amber-400/70 mt-1.5">⚠ Wallpaper ativo — o tema de cor é ignorado</p>
              )}
            </div>

          {/* Grupos */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />GRUPOS E MENSAGENS<span className="h-px flex-1 bg-primary/15" /></p>
            {data.grupos.length === 0 && (
              <p className="font-mono text-[11px] text-muted-foreground/50 text-center py-1">Nenhum grupo adicionado.</p>
            )}
            <div className="space-y-3">
              {data.grupos.map(g => (
                <GrupoCard key={g.id} grupo={g}
                  onChange={updated => updateGrupo(g.id, updated)}
                  onRemove={() => removeGrupo(g.id)} />
              ))}
            </div>
            <button onClick={addGrupo}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest border border-dashed border-primary/30 text-primary/60 hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all">
              <Plus size={13} />Adicionar Grupo
            </button>
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <ContadorMsgScaledPreview data={data} theme={theme} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Hospital NEEXT ──────────────────────────────────────────────────────────

interface PacienteHospital {
  id: string;
  nome: string;
  diagnostico: string;
  afastamento: string;
}

interface HospitalData {
  responsavel: string;
  fotoResponsavel: string | null;
  dataRelatorio: string;
  assinaturaMedico: string;
  pacientes: PacienteHospital[];
}

const AFASTAMENTO_OPCOES = [
  'Indeterminado',
  '7 dias',
  '15 dias',
  '30 dias',
  '45 dias',
  '60 dias',
  '3 meses',
  '6 meses',
  '1 ano',
];

function emptyHospitalData(): HospitalData {
  return {
    responsavel: '',
    fotoResponsavel: null,
    dataRelatorio: new Date().toLocaleDateString('pt-BR'),
    assinaturaMedico: '',
    pacientes: [],
  };
}

function HospitalReportCard({ data }: { data: HospitalData }) {
  const red     = '#dc2626';
  const dark    = '#111827';
  const gray    = '#6b7280';
  const border  = '#e5e7eb';
  const sans    = "'Segoe UI', Arial, sans-serif";
  const cursive = "'Dancing Script', 'Brush Script MT', 'Comic Sans MS', cursive";

  return (
    <div style={{ width: 440, background: '#ffffff', borderRadius: 12, overflow: 'hidden', fontFamily: sans, boxShadow: '0 4px 32px rgba(0,0,0,0.22)' }}>

      {/* ── Red header ── */}
      <div style={{ background: red, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* CSS cross */}
        <div style={{ position: 'relative', width: 38, height: 38, flexShrink: 0 }}>
          <div style={{ position: 'absolute', background: '#fff', width: 14, height: 38, left: 12, top: 0, borderRadius: 3 }} />
          <div style={{ position: 'absolute', background: '#fff', width: 38, height: 14, left: 0, top: 12, borderRadius: 3 }} />
        </div>
        <div>
          <div style={{ color: '#fff', fontSize: 19, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase' as const }}>Hospital NEEXT</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' as const, marginTop: 2 }}>Relatório Médico Oficial</div>
        </div>
      </div>

      {/* ── Identity row ── */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: `2.5px solid ${red}`, flexShrink: 0, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {data.fotoResponsavel
            ? <img src={data.fotoResponsavel} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 26, color: gray }}>👤</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{data.responsavel || 'Nome do Responsável'}</div>
          <div style={{ fontSize: 11, color: gray, marginTop: 3 }}>Data: <strong>{data.dataRelatorio}</strong></div>
        </div>
      </div>

      {/* ── Patients table ── */}
      {data.pacientes.length > 0 && (
        <div style={{ padding: '14px 20px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: red, textTransform: 'uppercase' as const, letterSpacing: 1.5, marginBottom: 10 }}>
            Pacientes em Afastamento
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fef2f2' }}>
                {(['Paciente', 'Diagnóstico', 'Afastamento'] as const).map(h => (
                  <th key={h} style={{ padding: '6px 8px', textAlign: 'left' as const, fontSize: 10, color: gray, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5, borderBottom: `2px solid ${border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.pacientes.map((p, i) => (
                <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '7px 8px', fontSize: 12, color: dark, fontWeight: 600, borderBottom: `1px solid ${border}` }}>{p.nome || '—'}</td>
                  <td style={{ padding: '7px 8px', fontSize: 12, color: gray, borderBottom: `1px solid ${border}` }}>{p.diagnostico || '—'}</td>
                  <td style={{ padding: '7px 8px', fontSize: 11, color: red, fontWeight: 700, borderBottom: `1px solid ${border}` }}>{p.afastamento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Signature ── */}
      <div style={{ padding: '16px 20px 20px', borderTop: `1px solid ${border}`, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6 }}>
        <div style={{ fontFamily: cursive, fontSize: 30, color: dark, letterSpacing: 1, lineHeight: 1.2, minHeight: 40 }}>
          {data.assinaturaMedico || 'Assinatura do Médico'}
        </div>
        <div style={{ width: 180, height: 1, background: dark, opacity: 0.25 }} />
        <div style={{ fontSize: 10, color: gray, textTransform: 'uppercase' as const, letterSpacing: 1.5 }}>Assinatura do Responsável</div>
      </div>

      {/* ── Footer ── */}
      <div style={{ background: dark, padding: '8px 20px', textAlign: 'center' as const, fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 2, textTransform: 'uppercase' as const }}>
        Hospital NEEXT • Documento Oficial
      </div>
    </div>
  );
}

function HospitalScaledPreview({ data, cardRef }: { data: HospitalData; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / 440)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}><HospitalReportCard data={data} /></div>
      </div>
    </div>
  );
}

function HospitalGenerator({ onBack }: { onBack: () => void }) {
  const captureRef  = useRef<HTMLDivElement>(null);
  const fotoRef     = useRef<HTMLInputElement>(null);
  const [data, setData]               = useState<HospitalData>(emptyHospitalData);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!document.getElementById('dancing-script-font')) {
      const link = document.createElement('link');
      link.id   = 'dancing-script-font';
      link.rel  = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setData(d => ({ ...d, fotoResponsavel: null }));
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, fotoResponsavel: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const addPaciente    = () => setData(d => ({ ...d, pacientes: [...d.pacientes, { id: uid(), nome: '', diagnostico: '', afastamento: 'Indeterminado' }] }));
  const updatePaciente = (id: string, k: keyof PacienteHospital, v: string) =>
    setData(d => ({ ...d, pacientes: d.pacientes.map(p => p.id === id ? { ...p, [k]: v } : p) }));
  const removePaciente = (id: string) =>
    setData(d => ({ ...d, pacientes: d.pacientes.filter(p => p.id !== id) }));

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `hospital-neext-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp      = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec      = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Header bar ── */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Stethoscope size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">Hospital NEEXT</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
          <button onClick={download} disabled={downloading}
            className="ml-auto flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50">
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Baixar PNG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><User size={11} /> Identificação</p>
            <input className={inp} value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))} placeholder="Nome do responsável" />
            <input className={inp} value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))} placeholder="Data (DD/MM/AAAA)" />
            <div>
              <p className="font-mono text-[10px] text-primary/60 tracking-[0.2em] uppercase mb-1.5">Foto de Perfil</p>
              <div className="flex items-center gap-2">
                <button onClick={() => fotoRef.current?.click()} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold border border-primary/25 text-primary/70 hover:border-primary/50 hover:text-primary hover:bg-primary/10 transition-all">
                  <Camera size={13} /> Carregar foto
                </button>
                {data.fotoResponsavel && <span className="text-xs text-emerald-400 font-mono">✓ carregada</span>}
              </div>
              <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
            </div>
          </div>

          {/* Assinatura */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}>✍ Assinatura do Médico</p>
            <input
              className={inp}
              value={data.assinaturaMedico}
              onChange={e => setData(d => ({ ...d, assinaturaMedico: e.target.value }))}
              placeholder="Digite o nome em cursivo..."
              style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive", fontSize: 22 }}
            />
            <p className="font-mono text-[10px] text-muted-foreground/40">A assinatura aparece em letra cursiva no relatório.</p>
          </div>

          {/* Pacientes */}
          <div className={sec} style={secStyle}>
            <div className="flex items-center justify-between">
              <p className={secLabel}><Users size={11} /> Pacientes ({data.pacientes.length})</p>
              <button onClick={addPaciente} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold bg-red-600/15 text-red-400 border border-red-500/20 hover:bg-red-600/25 transition-all">
                <Plus size={12} /> Adicionar
              </button>
            </div>
            <div className="space-y-3">
              {data.pacientes.map((p, i) => (
                <div key={p.id} className="rounded-lg p-3 space-y-2" style={{ border: '1px solid hsl(var(--primary)/0.12)', background: 'hsl(220 35% 6%)' }}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-primary/40 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <input className={inp} value={p.nome} onChange={e => updatePaciente(p.id, 'nome', e.target.value)} placeholder="Nome do paciente" />
                    <button onClick={() => removePaciente(p.id)} className="text-red-400/60 hover:text-red-400 transition-colors shrink-0"><Trash2 size={14} /></button>
                  </div>
                  <input className={inp} value={p.diagnostico} onChange={e => updatePaciente(p.id, 'diagnostico', e.target.value)} placeholder="Diagnóstico" />
                  <select className={inp} value={p.afastamento} onChange={e => updatePaciente(p.id, 'afastamento', e.target.value)}>
                    {AFASTAMENTO_OPCOES.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                </div>
              ))}
              {data.pacientes.length === 0 && (
                <p className="text-center font-mono text-[10px] text-muted-foreground/40 py-4">Nenhum paciente adicionado</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Preview ── */}
        <div className="rounded-xl overflow-hidden sticky top-4" style={{ border: '1px solid hsl(var(--primary)/0.2)', background: 'hsl(220 25% 5%)' }}>
          <div className="px-4 py-2 border-b border-primary/10">
            <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase">Pré-visualização</p>
          </div>
          <div className="p-4">
            <HospitalScaledPreview data={data} cardRef={captureRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Report Hub (landing) ─────────────────────────────────────────────────────

// ─── Justiça NeexT Report ─────────────────────────────────────────────────────

type TipoDocumento =
  | 'mandadoPrisao'
  | 'pedidoRegulatorio'
  | 'notificacaoAviso'
  | 'notificacaoRegras'
  | 'burlamentoRegras'
  | 'pedidoAlteracao';

const TIPO_DOCUMENTO_MAP: Record<TipoDocumento, string> = {
  mandadoPrisao:      'MANDADO DE PRISÃO',
  pedidoRegulatorio:  'PEDIDO REGULATÓRIO',
  notificacaoAviso:   'NOTIFICAÇÃO DE AVISO',
  notificacaoRegras:  'NOTIFICAÇÃO DE REGRAS NOVAS',
  burlamentoRegras:   'NOTIFICAÇÃO DE BURLAMENTO DE REGRAS',
  pedidoAlteracao:    'PEDIDO DE ALTERAÇÃO',
};

const TIPO_DOCUMENTO_COLOR: Record<TipoDocumento, string> = {
  mandadoPrisao:      '#7f1d1d',
  pedidoRegulatorio:  '#1a237e',
  notificacaoAviso:   '#7c5f00',
  notificacaoRegras:  '#1a237e',
  burlamentoRegras:   '#4a1d96',
  pedidoAlteracao:    '#14532d',
};

interface JusticaReportData {
  tipoDocumento: TipoDocumento;
  nome: string;
  descricao: string;
  dataEmissao: string;
  assinatura: string;
}

const emptyJusticaReport = (): JusticaReportData => ({
  tipoDocumento: 'mandadoPrisao',
  nome: '',
  descricao: '',
  dataEmissao: new Date().toISOString().split('T')[0],
  assinatura: '',
});

// ─── Justiça Report Card (official document look) ─────────────────────────────

function JusticaReportCard({ data }: { data: JusticaReportData }) {
  const sans = '"Helvetica Neue", Helvetica, Arial, sans-serif';
  const mono = "'Courier New', Courier, monospace";
  const navy   = '#1a237e';
  const indigo = '#3949ab';
  const gold   = '#ffab00';
  const dark   = '#0d1238';
  const midGray = '#444e6a';
  const lightBg = '#f4f6fb';
  const white  = '#ffffff';
  const tipoColor = TIPO_DOCUMENTO_COLOR[data.tipoDocumento] ?? navy;

  return (
    <div style={{ width: 400, background: white, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const, boxShadow: '0 8px 32px rgba(26,35,126,0.18)' }}>

      {/* ── Rainbow top stripe ── */}
      <div style={{ height: 7, background: `linear-gradient(90deg, ${navy} 0%, ${indigo} 55%, ${gold} 100%)` }} />

      {/* ── Navy header ── */}
      <div style={{ background: navy, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,171,0,0.18)', border: `2px solid ${gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Scale size={22} color={gold} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: sans, fontSize: 17, fontWeight: 800, color: white, textTransform: 'uppercase' as const, letterSpacing: '0.12em', lineHeight: 1 }}>Justiça NeexT</div>
          <div style={{ fontFamily: sans, fontSize: 8, color: gold, textTransform: 'uppercase' as const, letterSpacing: '0.22em', marginTop: 4 }}>Sistema Judicial Oficial</div>
        </div>
        <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
          <div style={{ fontFamily: mono, fontSize: 8, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 3 }}>Emissão</div>
          <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{formatDate(data.dataEmissao) || '—'}</div>
        </div>
      </div>

      {/* ── Light body ── */}
      <div style={{ background: lightBg, padding: '20px 22px' }}>

        {/* Document type badge */}
        <div style={{ background: tipoColor, borderRadius: 8, padding: '9px 16px', marginBottom: 16, textAlign: 'center' as const, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
          <span style={{ fontFamily: sans, fontSize: 12, fontWeight: 800, color: gold, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>
            {TIPO_DOCUMENTO_MAP[data.tipoDocumento]}
          </span>
        </div>

        {/* Gradient divider */}
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${indigo}, transparent)`, marginBottom: 16 }} />

        {/* ── Fields ── */}
        {/* Nome */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
            <User size={13} color={gold} />
          </div>
          <div>
            <div style={{ fontFamily: sans, fontSize: 8, fontWeight: 700, color: indigo, textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Nome</div>
            <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 700, color: dark }}>{data.nome || '[NÃO INFORMADO]'}</div>
          </div>
        </div>

        {/* Descrição */}
        {data.descricao.trim() && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
              <FileText size={13} color={gold} />
            </div>
            <div>
              <div style={{ fontFamily: sans, fontSize: 8, fontWeight: 700, color: indigo, textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Descrição</div>
              <div style={{ fontFamily: sans, fontSize: 11, color: midGray, lineHeight: 1.65, whiteSpace: 'pre-wrap' as const }}>{data.descricao}</div>
            </div>
          </div>
        )}

        {/* Data */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
            <Calendar size={13} color={gold} />
          </div>
          <div>
            <div style={{ fontFamily: sans, fontSize: 8, fontWeight: 700, color: indigo, textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Data de Emissão</div>
            <div style={{ fontFamily: sans, fontSize: 12, fontWeight: 600, color: dark }}>{formatDate(data.dataEmissao) || '[NÃO INFORMADA]'}</div>
          </div>
        </div>

        {/* Signature divider */}
        <div style={{ height: 2, borderTop: `2px solid ${dark}`, marginBottom: 12 }} />

        {/* Assinatura */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PenLine size={13} color={gold} />
          </div>
          <div>
            <div style={{ fontFamily: sans, fontSize: 8, fontWeight: 700, color: indigo, textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Assinatura</div>
            <div style={{ fontFamily: "'Brush Script MT', 'Segoe Script', 'Dancing Script', cursive", fontSize: 18, fontWeight: 700, color: dark }}>{data.assinatura || '[NÃO INFORMADA]'}</div>
          </div>
        </div>

        {/* ── Bottom row: stamp + watermark ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {/* Circular stamp */}
          <div style={{
            width: 72, height: 72,
            border: `2.5px solid ${gold}`,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: 'rotate(-15deg)',
            color: gold,
            fontSize: 8,
            fontWeight: 800,
            fontFamily: sans,
            textAlign: 'center' as const,
            lineHeight: 1.35,
            opacity: 0.75,
            flexShrink: 0,
          }}>
            SELO<br/>OFICIAL<br/>JUSTIÇA<br/>NEEXT
          </div>
          {/* Watermark */}
          <div style={{ fontFamily: mono, fontSize: 8, color: 'rgba(0,0,0,0.22)', textAlign: 'right' as const, lineHeight: 1.6, maxWidth: 200 }}>
            Documento gerado eletronicamente<br/>Sistema Justiça NeexT
          </div>
        </div>
      </div>

      {/* ── Bottom stripe ── */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${navy} 0%, ${indigo} 55%, ${gold} 100%)` }} />
    </div>
  );
}

// ─── Scaled preview for Justiça ───────────────────────────────────────────────

function JusticaScaledPreview({ data, cardRef }: { data: JusticaReportData; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / 400)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}>
          <JusticaReportCard data={data} />
        </div>
      </div>
    </div>
  );
}

// ─── Justiça Generator ────────────────────────────────────────────────────────

function JusticaGenerator({ onBack }: { onBack: () => void }) {
  const captureRef  = useRef<HTMLDivElement>(null);
  const [data, setData]               = useState<JusticaReportData>(emptyJusticaReport());
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      const tipo = TIPO_DOCUMENTO_MAP[data.tipoDocumento].toLowerCase().replace(/ /g, '_');
      link.download = `justica-neext-${tipo}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Scale size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">Justiça NeexT</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">

        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Tipo de Documento */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />TIPO DE DOCUMENTO<span className="h-px flex-1 bg-primary/15" /></p>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Selecione o documento</label>
              <div className="relative">
                <select
                  value={data.tipoDocumento}
                  onChange={e => setData(d => ({ ...d, tipoDocumento: e.target.value as TipoDocumento }))}
                  className={`${inp} appearance-none pr-8`}
                >
                  {(Object.entries(TIPO_DOCUMENTO_MAP) as [TipoDocumento, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Nome do Destinatário / Acusado</label>
              <input
                value={data.nome}
                onChange={e => setData(d => ({ ...d, nome: e.target.value }))}
                placeholder="Nome completo..."
                className={inp}
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data de Emissão</label>
              <input
                type="date"
                value={data.dataEmissao}
                onChange={e => setData(d => ({ ...d, dataEmissao: e.target.value }))}
                className={`${inp} [color-scheme:dark]`}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />DESCRIÇÃO / MOTIVO<span className="h-px flex-1 bg-primary/15" /></p>
            <textarea
              value={data.descricao}
              onChange={e => setData(d => ({ ...d, descricao: e.target.value }))}
              placeholder="Descreva o motivo do documento..."
              rows={5}
              className={`${inp} resize-none w-full`}
            />
          </div>

          {/* Assinatura */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />ASSINATURA<span className="h-px flex-1 bg-primary/15" /></p>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Nome do Signatário</label>
              <input
                value={data.assinatura}
                onChange={e => setData(d => ({ ...d, assinatura: e.target.value }))}
                placeholder="Nome de quem assina..."
                className={inp}
              />
            </div>
          </div>

          {/* Download */}
          <button
            onClick={download}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}
          >
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Documento como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <JusticaScaledPreview data={data} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Unidades de Defesa (Tático) Report ──────────────────────────────────────

type TaticoUnitId = 'swat' | 'ssa' | 'gign' | 'bope' | 'defesa';

interface TaticoUnit {
  id: TaticoUnitId;
  name: string;
  main: string;
  secondary: string;
  accent: string;
}

const TATICO_UNITS: TaticoUnit[] = [
  { id: 'swat',   name: 'SWAT',   main: '#1a2a6c', secondary: '#0a0e23', accent: '#d4af37' },
  { id: 'ssa',    name: 'SSA',    main: '#8B0000', secondary: '#400000', accent: '#ffd700' },
  { id: 'gign',   name: 'GIGN',   main: '#2F4F4F', secondary: '#111',   accent: '#c0c0c0' },
  { id: 'bope',   name: 'BOPE',   main: '#006400', secondary: '#003300', accent: '#32cd32' },
  { id: 'defesa', name: 'DEFESA', main: '#000080', secondary: '#00004d', accent: '#add8e6' },
];

type NivelConfidencialidade = 'normal' | 'confidencial' | 'ultrassecreto';

const NIVEL_LABEL: Record<NivelConfidencialidade, string> = {
  normal:        '',
  confidencial:  'CONFIDENCIAL',
  ultrassecreto: 'ULTRA-SECRETO',
};

interface TaticoReportData {
  unitId: TaticoUnitId;
  operador: string;
  dataHoraOperacao: string;
  codigoOperacao: string;
  tituloRelatorio: string;
  detalhes: string;
  assinatura: string;
  confidencialidade: NivelConfidencialidade;
}

function generateOpCode(): string {
  const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const N = '0123456789';
  const pick = (src: string) => src[Math.floor(Math.random() * src.length)];
  return pick(L)+pick(L) + pick(N)+pick(N)+pick(N)+pick(N) + pick(L)+pick(L);
}

function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const emptyTaticoReport = (): TaticoReportData => ({
  unitId: 'swat',
  operador: '',
  dataHoraOperacao: new Date().toISOString().slice(0, 16),
  codigoOperacao: generateOpCode(),
  tituloRelatorio: '',
  detalhes: '',
  assinatura: '',
  confidencialidade: 'normal',
});

// ─── Tático Report Card ───────────────────────────────────────────────────────

function TaticoReportCard({ data }: { data: TaticoReportData }) {
  const unit  = TATICO_UNITS.find(u => u.id === data.unitId) ?? TATICO_UNITS[0];
  const sans  = '"Helvetica Neue", Helvetica, Arial, sans-serif';
  const mono  = "'Courier New', Courier, monospace";
  const { main, secondary, accent } = unit;

  const headerGrad = `linear-gradient(135deg, ${main} 0%, ${secondary} 100%)`;
  const footerGrad = `linear-gradient(135deg, ${secondary} 0%, ${main} 100%)`;

  const stamp = NIVEL_LABEL[data.confidencialidade];

  const today = new Date();
  const reportNum = `${unit.name}-${today.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

  const Field = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: main, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, boxShadow: `0 2px 8px ${main}55` }}>
        {icon}
      </div>
      <div style={{ flex: 1, borderBottom: '1px solid #e8ecf4', paddingBottom: 12 }}>
        <div style={{ fontFamily: sans, fontSize: 9, fontWeight: 700, color: main, textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
          {label}
        </div>
        <div style={{ fontFamily: sans, fontSize: 12, color: '#1a1f36', lineHeight: 1.6, whiteSpace: 'pre-wrap' as const, minHeight: 16 }}>
          {value || '[NÃO INFORMADO]'}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ width: 400, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const, boxShadow: '0 8px 32px rgba(0,0,0,0.22)' }}>

      {/* ── Accent top bar ── */}
      <div style={{ height: 6, background: `linear-gradient(90deg, ${accent}, ${main})` }} />

      {/* ── Header ── */}
      <div style={{ background: headerGrad, padding: '22px 22px 18px', position: 'relative' as const, overflow: 'hidden' as const }}>
        {/* Faint watermark bg text */}
        <div style={{ position: 'absolute' as const, right: -10, bottom: -18, fontFamily: sans, fontSize: 80, fontWeight: 900, color: 'rgba(255,255,255,0.05)', lineHeight: 1, pointerEvents: 'none' as const, letterSpacing: '-4px' }}>
          {unit.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' as const, zIndex: 1 }}>
          {/* Unit badge */}
          <div style={{
            width: 64, height: 72,
            background: 'rgba(0,0,0,0.35)',
            border: `2.5px solid ${accent}`,
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            flexDirection: 'column' as const,
            gap: 4,
            boxShadow: `inset 0 0 20px rgba(0,0,0,0.3), 0 0 12px ${accent}33`,
          }}>
            <Shield size={22} color={accent} />
            <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 900, color: accent, letterSpacing: '0.05em' }}>{unit.name}</span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: sans, fontSize: 8, color: `${accent}cc`, textTransform: 'uppercase' as const, letterSpacing: '0.28em', marginBottom: 4 }}>Unidade Tática Especial</div>
            <div style={{ fontFamily: sans, fontSize: 16, fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' as const, letterSpacing: '0.08em', lineHeight: 1.1, marginBottom: 6 }}>
              {data.tituloRelatorio || 'RELATÓRIO DE OPERAÇÃO'}
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>
              Relatório Oficial — {unit.name}
            </div>
          </div>
        </div>
      </div>

      {/* ── White body ── */}
      <div style={{ background: '#ffffff', padding: '20px 22px 16px', position: 'relative' as const }}>

        {/* Confidential stamp (diagonal) */}
        {stamp && (
          <div style={{
            position: 'absolute' as const,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%) rotate(-20deg)',
            fontFamily: sans, fontSize: 36, fontWeight: 900,
            color: main,
            opacity: 0.07,
            pointerEvents: 'none' as const,
            whiteSpace: 'nowrap' as const,
            letterSpacing: '0.05em',
            zIndex: 0,
          }}>
            {stamp}
          </div>
        )}

        {/* Unit watermark */}
        <div style={{ position: 'absolute' as const, bottom: 10, right: 16, fontFamily: sans, fontSize: 56, fontWeight: 900, color: main, opacity: 0.04, lineHeight: 1, pointerEvents: 'none' as const }}>
          {unit.name}
        </div>

        <div style={{ position: 'relative' as const, zIndex: 1 }}>
          <Field icon={<User size={16} color="#fff" />}      label="Operador Responsável"  value={data.operador} />
          <Field icon={<Clock size={16} color="#fff" />}     label="Data / Hora da Operação" value={formatDateTime(data.dataHoraOperacao)} />
          <Field icon={<Key size={16} color="#fff" />}       label="Código da Operação"    value={data.codigoOperacao} />
          <Field icon={<FileText size={16} color="#fff" />}  label="Detalhes da Operação"  value={data.detalhes} />
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ background: footerGrad, padding: '14px 22px 16px', textAlign: 'center' as const }}>
        <div style={{ fontFamily: mono, fontSize: 9, color: `${accent}bb`, letterSpacing: '0.2em', textTransform: 'uppercase' as const, marginBottom: 10 }}>
          RELATÓRIO Nº: {reportNum}
        </div>

        {/* Signature */}
        <div style={{ borderTop: `1.5px solid ${accent}66`, width: 220, margin: '0 auto 6px', paddingTop: 8 }}>
          <div style={{
            fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
            fontSize: 20,
            color: '#ffffff',
            letterSpacing: '0.04em',
            minHeight: 26,
          }}>
            {data.assinatura || 'Assinatura do Operador'}
          </div>
        </div>

        <div style={{ fontFamily: sans, fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.2em', textTransform: 'uppercase' as const }}>
          {unit.name} — DEPARTAMENTO DE DEFESA
        </div>

        {/* Confidential badge */}
        {stamp && (
          <div style={{ marginTop: 8, display: 'inline-block', border: `1.5px solid ${accent}`, borderRadius: 4, padding: '2px 10px', fontFamily: sans, fontSize: 9, fontWeight: 700, color: accent, letterSpacing: '0.18em', textTransform: 'uppercase' as const }}>
            ⚠ {stamp}
          </div>
        )}
      </div>

      {/* ── Accent bottom bar ── */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${main}, ${accent})` }} />
    </div>
  );
}

// ─── Scaled preview for Tático ────────────────────────────────────────────────

function TaticoScaledPreview({ data, cardRef }: { data: TaticoReportData; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / 400)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}>
          <TaticoReportCard data={data} />
        </div>
      </div>
    </div>
  );
}

// ─── Tático Generator ─────────────────────────────────────────────────────────

function TaticoGenerator({ onBack }: { onBack: () => void }) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [data, setData]               = useState<TaticoReportData>(emptyTaticoReport);
  const [downloading, setDownloading] = useState(false);

  const unit = TATICO_UNITS.find(u => u.id === data.unitId) ?? TATICO_UNITS[0];

  const regenCode = () => setData(d => ({ ...d, codigoOperacao: generateOpCode() }));

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `relatorio-${data.unitId}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Flag size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">Unidades de Defesa</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">

        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Unidade */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />UNIDADE TÁTICA<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="flex flex-wrap gap-2">
              {TATICO_UNITS.map(u => (
                <button
                  key={u.id}
                  onClick={() => setData(d => ({ ...d, unitId: u.id }))}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-xs font-bold uppercase tracking-widest border transition-all"
                  style={data.unitId === u.id
                    ? { background: u.main, borderColor: u.accent, color: u.accent }
                    : { background: 'rgba(255,255,255,0.05)', borderColor: 'hsl(var(--primary)/0.2)', color: 'hsl(var(--foreground)/0.6)' }
                  }
                >
                  <Shield size={11} />
                  {u.name}
                </button>
              ))}
            </div>
            {/* Unit color preview */}
            <div className="h-1 rounded-full mt-1 transition-all" style={{ background: `linear-gradient(90deg, ${unit.main}, ${unit.accent})` }} />
          </div>

          {/* Operação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />OPERAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Título do Relatório</label>
              <input value={data.tituloRelatorio} onChange={e => setData(d => ({ ...d, tituloRelatorio: e.target.value }))}
                placeholder="Título da operação..." className={inp} />
            </div>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Nome do Operador</label>
              <input value={data.operador} onChange={e => setData(d => ({ ...d, operador: e.target.value }))}
                placeholder="Nome do operador responsável..." className={inp} />
            </div>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data e Hora da Operação</label>
              <input type="datetime-local" value={data.dataHoraOperacao}
                onChange={e => setData(d => ({ ...d, dataHoraOperacao: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Código da Operação</label>
              <div className="flex gap-2">
                <input value={data.codigoOperacao} onChange={e => setData(d => ({ ...d, codigoOperacao: e.target.value }))}
                  placeholder="AUTO" className={`${inp} flex-1 font-mono tracking-widest`} />
                <button onClick={regenCode}
                  className="px-3 rounded-lg border border-primary/30 text-primary/60 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all font-mono text-[10px] uppercase tracking-widest shrink-0">
                  Gerar
                </button>
              </div>
            </div>
          </div>

          {/* Detalhes */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />DETALHES DA OPERAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <textarea value={data.detalhes} onChange={e => setData(d => ({ ...d, detalhes: e.target.value }))}
              placeholder="Descreva os detalhes da operação..." rows={5}
              className={`${inp} resize-none w-full`} />
          </div>

          {/* Assinatura + Confidencialidade */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />FINALIZAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Assinatura do Operador</label>
              <input value={data.assinatura} onChange={e => setData(d => ({ ...d, assinatura: e.target.value }))}
                placeholder="Assine aqui..." className={`${inp}`}
                style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive", fontSize: '1.1rem' }} />
            </div>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Nível de Confidencialidade</label>
              <div className="relative">
                <select value={data.confidencialidade}
                  onChange={e => setData(d => ({ ...d, confidencialidade: e.target.value as NivelConfidencialidade }))}
                  className={`${inp} appearance-none pr-8`}>
                  <option value="normal">Normal</option>
                  <option value="confidencial">Confidencial</option>
                  <option value="ultrassecreto">Ultra-secreto</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/50 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <TaticoScaledPreview data={data} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Relatório de Divulgação ──────────────────────────────────────────────────

interface DivulgacaoData {
  foto: string | null;
  responsavel: string;
  dataRelatorio: string;
  totalNovos: number;
  meta: number;
  descricao: string;
  assinatura: string;
}

const emptyDivulgacao = (): DivulgacaoData => ({
  foto: null,
  responsavel: '',
  dataRelatorio: new Date().toISOString().split('T')[0],
  totalNovos: 0,
  meta: 100,
  descricao: '',
  assinatura: '',
});

// SVG donut chart — works perfectly with html-to-image (pure markup, no canvas)
function DonutChart({
  atual, meta, cor, tamanho = 140,
}: { atual: number; meta: number; cor: string; tamanho?: number }) {
  const pct      = meta > 0 ? Math.min(atual / meta, 1) : 0;
  const r        = 48;
  const cx       = tamanho / 2;
  const circ     = 2 * Math.PI * r;
  const dash     = pct * circ;
  const gap      = circ - dash;
  const pctLabel = Math.round(pct * 100);

  return (
    <svg width={tamanho} height={tamanho} viewBox={`0 0 ${tamanho} ${tamanho}`}>
      {/* Background track */}
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e8ecf4" strokeWidth={14} />
      {/* Progress arc */}
      <circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke={cor}
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={circ / 4}   /* start at top */
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      {/* Centre label */}
      <text x={cx} y={cx - 6} textAnchor="middle" fontFamily='"Helvetica Neue",Helvetica,Arial,sans-serif' fontSize={22} fontWeight={800} fill={cor}>{pctLabel}%</text>
      <text x={cx} y={cx + 12} textAnchor="middle" fontFamily='"Helvetica Neue",Helvetica,Arial,sans-serif' fontSize={9} fontWeight={600} fill="#8892a4" letterSpacing="0.1em">DA META</text>
    </svg>
  );
}

// ─── Divulgação Card ──────────────────────────────────────────────────────────

function DivulgacaoReportCard({ data }: { data: DivulgacaoData }) {
  const sans    = '"Helvetica Neue",Helvetica,Arial,sans-serif';
  const mono    = "'Courier New',Courier,monospace";
  const cor1    = '#4f46e5';   // indigo
  const cor2    = '#7c3aed';   // violet
  const accent  = '#a78bfa';
  const gold    = '#fbbf24';

  const pct     = data.meta > 0 ? Math.min(data.totalNovos / data.meta, 1) : 0;
  const faltam  = Math.max(data.meta - data.totalNovos, 0);

  const formatDate = (s: string) => {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div style={{ width: 400, borderRadius: 18, overflow: 'hidden', boxShadow: '0 12px 40px rgba(79,70,229,0.22)', boxSizing: 'border-box' as const }}>

      {/* ── Accent stripe ── */}
      <div style={{ height: 5, background: `linear-gradient(90deg,${cor1},${cor2},${accent})` }} />

      {/* ── Header ── */}
      <div style={{ background: `linear-gradient(135deg,${cor1} 0%,${cor2} 100%)`, padding: '24px 24px 20px', position: 'relative' as const, overflow: 'hidden' as const }}>
        {/* watermark */}
        <div style={{ position: 'absolute' as const, right: -16, top: -10, fontFamily: sans, fontSize: 90, fontWeight: 900, color: 'rgba(255,255,255,0.05)', lineHeight: 1, pointerEvents: 'none' as const, letterSpacing: '-6px' }}>DIVULG</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative' as const, zIndex: 1 }}>
          {/* Profile photo */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', border: `3px solid ${accent}`, overflow: 'hidden' as const, flexShrink: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 18px ${accent}55` }}>
            {data.foto
              ? <img src={data.foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
              : <span style={{ fontFamily: sans, fontSize: 28, color: accent, fontWeight: 700, lineHeight: 1 }}>?</span>
            }
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: sans, fontSize: 8, color: `${accent}cc`, textTransform: 'uppercase' as const, letterSpacing: '0.28em', marginBottom: 4 }}>Relatório de Divulgação</div>
            <div style={{ fontFamily: sans, fontSize: 17, fontWeight: 800, color: '#ffffff', lineHeight: 1.15, marginBottom: 4 }}>{data.responsavel || 'Nome do Responsável'}</div>
            <div style={{ fontFamily: sans, fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em' }}>Relatório de Entradas</div>
          </div>

          {/* Date badge */}
          <div style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${accent}55`, borderRadius: 10, padding: '6px 10px', textAlign: 'center' as const, flexShrink: 0 }}>
            <div style={{ fontFamily: mono, fontSize: 8, color: `${accent}aa`, textTransform: 'uppercase' as const, letterSpacing: '0.15em', marginBottom: 2 }}>DATA</div>
            <div style={{ fontFamily: mono, fontSize: 11, color: '#fff', fontWeight: 700 }}>{formatDate(data.dataRelatorio)}</div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ background: '#ffffff', padding: '20px 22px', position: 'relative' as const }}>

        {/* ── Pizza + stats row ── */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>

          {/* Donut */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4 }}>
            <DonutChart atual={data.totalNovos} meta={data.meta} cor={cor1} tamanho={130} />
            <div style={{ fontFamily: sans, fontSize: 8, color: '#8892a4', textTransform: 'uppercase' as const, letterSpacing: '0.15em' }}>progresso</div>
          </div>

          {/* Stat cards */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>

            {/* Entradas */}
            <div style={{ background: `${cor1}12`, border: `1.5px solid ${cor1}30`, borderRadius: 10, padding: '8px 12px' }}>
              <div style={{ fontFamily: sans, fontSize: 8, color: cor1, textTransform: 'uppercase' as const, letterSpacing: '0.18em', fontWeight: 700, marginBottom: 2 }}>Entradas</div>
              <div style={{ fontFamily: sans, fontSize: 26, fontWeight: 900, color: cor1, lineHeight: 1 }}>+{data.totalNovos}</div>
            </div>

            {/* Meta */}
            <div style={{ background: `${gold}18`, border: `1.5px solid ${gold}50`, borderRadius: 10, padding: '8px 12px' }}>
              <div style={{ fontFamily: sans, fontSize: 8, color: '#b45309', textTransform: 'uppercase' as const, letterSpacing: '0.18em', fontWeight: 700, marginBottom: 2 }}>Meta</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: sans, fontSize: 26, fontWeight: 900, color: '#b45309', lineHeight: 1 }}>{data.meta}</span>
                <span style={{ fontFamily: sans, fontSize: 10, color: '#b45309', fontWeight: 600 }}>({faltam} faltam)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontFamily: sans, fontSize: 9, color: '#8892a4', textTransform: 'uppercase' as const, letterSpacing: '0.15em' }}>Progresso para a meta</span>
            <span style={{ fontFamily: mono, fontSize: 9, color: cor1, fontWeight: 700 }}>{data.totalNovos}/{data.meta}</span>
          </div>
          <div style={{ background: '#e8ecf4', borderRadius: 99, height: 8, overflow: 'hidden' as const }}>
            <div style={{ height: '100%', width: `${Math.round(pct * 100)}%`, background: `linear-gradient(90deg,${cor1},${cor2})`, borderRadius: 99, transition: 'width 0.6s ease' }} />
          </div>
        </div>

        {/* ── Descrição ── */}
        {data.descricao ? (
          <div style={{ borderTop: '1px solid #e8ecf4', paddingTop: 14, marginBottom: 0 }}>
            <div style={{ fontFamily: sans, fontSize: 8, color: cor1, textTransform: 'uppercase' as const, letterSpacing: '0.2em', fontWeight: 700, marginBottom: 6 }}>Observações</div>
            <div style={{ fontFamily: sans, fontSize: 11, color: '#2d3748', lineHeight: 1.65, whiteSpace: 'pre-wrap' as const }}>{data.descricao}</div>
          </div>
        ) : null}
      </div>

      {/* ── Footer ── */}
      <div style={{ background: `linear-gradient(135deg,${cor2} 0%,${cor1} 100%)`, padding: '14px 22px 16px', textAlign: 'center' as const }}>
        <div style={{ borderBottom: `1px solid ${accent}55`, width: 200, margin: '0 auto 6px', paddingBottom: 8 }}>
          <div style={{ fontFamily: "'Brush Script MT','Segoe Script',cursive", fontSize: 22, color: '#fff', letterSpacing: '0.04em', minHeight: 28 }}>
            {data.assinatura || 'Assinatura'}
          </div>
        </div>
        <div style={{ fontFamily: sans, fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.2em', textTransform: 'uppercase' as const }}>
          Divulgação — NEEXT
        </div>
      </div>

      {/* ── Accent bottom ── */}
      <div style={{ height: 4, background: `linear-gradient(90deg,${cor2},${accent})` }} />
    </div>
  );
}

// ─── Divulgação Scaled Preview ────────────────────────────────────────────────

function DivulgacaoScaledPreview({ data, cardRef }: { data: DivulgacaoData; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / 400)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}>
          <DivulgacaoReportCard data={data} />
        </div>
      </div>
    </div>
  );
}

// ─── Divulgação Generator ─────────────────────────────────────────────────────

function DivulgacaoGenerator({ onBack }: { onBack: () => void }) {
  const captureRef = useRef<HTMLDivElement>(null);
  const fotoRef    = useRef<HTMLInputElement>(null);
  const [data, setData]               = useState<DivulgacaoData>(emptyDivulgacao);
  const [downloading, setDownloading] = useState(false);

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setData(d => ({ ...d, foto: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const url = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const a = document.createElement('a');
      a.download = `divulgacao-${data.dataRelatorio}.png`;
      a.href = url;
      a.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Megaphone size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">Relatório de Divulgação</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">

        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>

            {/* Foto */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Foto de Perfil</label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => fotoRef.current?.click()}
                  className="group w-14 h-14 rounded-full border-2 border-primary/30 border-dashed flex items-center justify-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all overflow-hidden shrink-0 relative"
                >
                  {data.foto
                    ? <img src={data.foto} className="w-full h-full object-cover rounded-full" alt="" />
                    : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
                  }
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => fotoRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <Camera size={11} /> Carregar foto
                  </button>
                  {data.foto && (
                    <button onClick={() => setData(d => ({ ...d, foto: null }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                      Remover
                    </button>
                  )}
                </div>
              </div>
              <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
            </div>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Nome do Responsável</label>
              <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                placeholder="Seu nome aqui..." className={inp} />
            </div>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
              <input type="date" value={data.dataRelatorio}
                onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>
          </div>

          {/* Membros */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />MEMBROS<span className="h-px flex-1 bg-primary/15" /></p>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Entradas de Membros</label>
              <input type="number" min={0} value={data.totalNovos}
                onChange={e => setData(d => ({ ...d, totalNovos: Number(e.target.value) }))}
                placeholder="0" className={inp} />
            </div>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Meta de Membros</label>
              <input type="number" min={1} value={data.meta}
                onChange={e => setData(d => ({ ...d, meta: Number(e.target.value) || 1 }))}
                placeholder="100" className={inp} />
            </div>

            {/* Mini progress preview */}
            <div className="mt-1">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[10px] text-muted-foreground tracking-widest">Progresso</span>
                <span className="font-mono text-[10px] text-primary font-bold">{Math.round(Math.min(data.totalNovos / (data.meta || 1), 1) * 100)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(Math.min(data.totalNovos / (data.meta || 1), 1) * 100)}%`, background: 'linear-gradient(90deg, #4f46e5, #7c3aed)' }} />
              </div>
            </div>
          </div>

          {/* Descrição + Assinatura */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />FINALIZAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Observações</label>
              <textarea value={data.descricao} onChange={e => setData(d => ({ ...d, descricao: e.target.value }))}
                placeholder="Observações sobre a divulgação..." rows={4}
                className={`${inp} resize-none w-full`} />
            </div>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Assinatura</label>
              <input value={data.assinatura} onChange={e => setData(d => ({ ...d, assinatura: e.target.value }))}
                placeholder="Assine aqui..." className={inp}
                style={{ fontFamily: "'Brush Script MT','Segoe Script',cursive", fontSize: '1.1rem' }} />
            </div>
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <DivulgacaoScaledPreview data={data} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// ─── Cobrança Report ──────────────────────────────────────────────────────────

interface CobrancaReportData {
  responsavel: string;
  fotoResponsavel: string | null;
  wallpaper: string | null;
  dataRelatorio: string;
  tipo: 'bug' | 'novidade' | '';
  titulo: string;
  descricao: string;
  prioridade: '' | 'baixa' | 'media' | 'alta' | 'critica';
  prazo: string;
}

const emptyCobranca = (): CobrancaReportData => ({
  responsavel: '', fotoResponsavel: null, wallpaper: null, dataRelatorio: '',
  tipo: '', titulo: '', descricao: '', prioridade: '', prazo: '',
});

function CobrancaReportCard({ data, theme }: { data: CobrancaReportData; theme: Theme }) {
  const mono = "'Courier New', Courier, monospace";
  const w    = '#ffffff';
  const wA   = (a: number) => `rgba(255,255,255,${a})`;

  const base  = gradientBase(theme.gradient);
  const panel = kOver(0.28, base);
  const bdr   = wOver(0.14, base);
  const c18   = wOver(0.18, base);
  const c35   = wOver(0.35, base);
  const c12   = wOver(0.12, base);
  const c50   = wOver(0.50, base);
  const c10   = wOver(0.10, base);

  const hasWall = !!data.wallpaper;
  const outerStyle: React.CSSProperties = hasWall
    ? { width: 400, backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }
    : { width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const };

  const tipoLabel  = data.tipo === 'bug' ? 'CORREÇÃO DE BUG' : data.tipo === 'novidade' ? 'NOVA FUNCIONALIDADE' : '';
  const prioLabel  = { baixa: 'BAIXA', media: 'MÉDIA', alta: 'ALTA', critica: 'CRÍTICA', '': '' }[data.prioridade];
  const prioColor  = { baixa: '#22c55e', media: '#f59e0b', alta: '#f97316', critica: '#ef4444', '': w }[data.prioridade];

  return (
    <div style={outerStyle}>
      {hasWall && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.60)', zIndex: 0 }} />}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ height: 3, background: c35 }} />
        <div style={{ padding: '22px 22px' }}>

          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: c18, border: `1.5px solid ${c35}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Receipt size={18} color={w} />
              </div>
              <div>
                <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.25em', marginBottom: 2 }}>Sistema Operacional</div>
                <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 900, color: w, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>COBRANÇA</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Responsável</div>
                <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w }}>{data.responsavel || '—'}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), marginTop: 2 }}>{formatDate(data.dataRelatorio)}</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: `2px solid ${c50}`, overflow: 'hidden', background: c12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {data.fotoResponsavel
                  ? <img src={data.fotoResponsavel} width={44} height={44} style={{ objectFit: 'cover', display: 'block', width: 44, height: 44 }} alt="" />
                  : <User size={20} color={wA(0.5)} />
                }
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: bdr, marginBottom: 12 }} />

          {/* ── Tipo badge ── */}
          {tipoLabel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 11 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: panel, border: `1px solid ${bdr}`, borderRadius: 6, padding: '5px 10px' }}>
                {data.tipo === 'bug'
                  ? <Wrench size={11} color={wA(0.8)} />
                  : <Lightbulb size={11} color={wA(0.8)} />
                }
                <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: wA(0.9), textTransform: 'uppercase' as const, letterSpacing: '0.18em' }}>{tipoLabel}</span>
              </div>
              {prioLabel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: panel, border: `1px solid ${bdr}`, borderRadius: 6, padding: '5px 10px' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: prioColor, flexShrink: 0 }} />
                  <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, color: prioColor, textTransform: 'uppercase' as const, letterSpacing: '0.15em' }}>{prioLabel}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Título ── */}
          {data.titulo && (
            <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '10px 13px', marginBottom: 10 }}>
              <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.22em', marginBottom: 5 }}>Título</div>
              <p style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: w, margin: 0, lineHeight: 1.4 }}>{data.titulo}</p>
            </div>
          )}

          {/* ── Descrição ── */}
          {data.descricao && (
            <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '10px 13px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 4, height: 14, borderRadius: 2, background: c35, flexShrink: 0 }} />
                <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.22em', color: wA(0.75) }}>Descrição</span>
              </div>
              <p style={{ fontFamily: mono, fontSize: 11, color: wA(0.85), lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' as const }}>{data.descricao}</p>
            </div>
          )}

          {/* ── Prazo ── */}
          {data.prazo && (
            <div style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '9px 13px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={13} color={wA(0.65)} />
              <div>
                <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.18em' }}>Prazo sugerido</div>
                <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: w, marginTop: 2 }}>{formatDate(data.prazo)}</div>
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${c10}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.45), textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>Documento Oficial — NEEXT LTDA</span>
            <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.35), letterSpacing: '0.08em' }}>{formatDate(data.dataRelatorio)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CobrancaScaledPreview({ data, theme, cardRef }: { data: CobrancaReportData; theme: Theme; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom]   = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => { setZoom(Math.min(1, entry.contentRect.width / 400)); });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}><CobrancaReportCard data={data} theme={theme} /></div>
      </div>
    </div>
  );
}

function CobrancaGenerator({ onBack }: { onBack: () => void }) {
  const captureRef   = useRef<HTMLDivElement>(null);
  const fotoRef      = useRef<HTMLInputElement>(null);
  const wallpaperRef = useRef<HTMLInputElement>(null);
  const [data, setData]               = useState<CobrancaReportData>(emptyCobranca());
  const [themeId, setThemeId]         = useState('vault-amber');
  const [themeOpen, setThemeOpen]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setData(d => ({ ...d, fotoResponsavel: null }));
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, fotoResponsavel: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, wallpaper: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `relatorio-cobranca-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp     = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const inpArea = "bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors resize-none";
  const sec     = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle  = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel  = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  const TIPOS: { value: CobrancaReportData['tipo']; label: string; icon: React.ElementType }[] = [
    { value: 'bug',      label: 'Correção de Bug',    icon: Wrench    },
    { value: 'novidade', label: 'Nova Funcionalidade', icon: Lightbulb },
  ];

  const PRIOS: { value: CobrancaReportData['prioridade']; label: string; color: string }[] = [
    { value: 'baixa',   label: 'Baixa',    color: '#22c55e' },
    { value: 'media',   label: 'Média',    color: '#f59e0b' },
    { value: 'alta',    label: 'Alta',     color: '#f97316' },
    { value: 'critica', label: 'Crítica',  color: '#ef4444' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Receipt size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">Cobrança</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">

        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>

            <div className="flex items-end gap-3">
              <div className="shrink-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Foto</label>
                <button onClick={() => fotoRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center relative group transition-opacity hover:opacity-80"
                  style={{ border: '1.5px solid hsl(var(--primary)/0.45)', background: 'hsl(var(--primary)/0.08)' }}>
                  {data.fotoResponsavel
                    ? <img src={data.fotoResponsavel} className="w-full h-full object-cover" alt="" />
                    : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={14} className="text-white" />
                  </div>
                </button>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                  <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                    placeholder="Seu nome" className={inp} />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data</label>
                  <input type="date" value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                    className={`${inp} [color-scheme:dark]`} />
                </div>
              </div>
            </div>
          </div>

          {/* Tipo de cobrança */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />TIPO DE COBRANÇA<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS.map(({ value, label, icon: Icon }) => (
                <button key={value}
                  onClick={() => setData(d => ({ ...d, tipo: d.tipo === value ? '' : value }))}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 border font-mono text-xs transition-all"
                  style={{
                    borderColor: data.tipo === value ? 'hsl(var(--primary)/0.7)' : 'hsl(var(--primary)/0.2)',
                    background:  data.tipo === value ? 'hsl(var(--primary)/0.15)' : 'hsl(220 35% 6%)',
                    color: data.tipo === value ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                  }}>
                  <Icon size={13} />
                  <span className="leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Título e descrição */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />DETALHES<span className="h-px flex-1 bg-primary/15" /></p>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Título</label>
              <input value={data.titulo} onChange={e => setData(d => ({ ...d, titulo: e.target.value }))}
                placeholder={data.tipo === 'bug' ? 'Ex: Crash ao clicar em salvar' : 'Ex: Adicionar exportar para PDF'}
                className={inp} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Descrição</label>
              <textarea value={data.descricao} onChange={e => setData(d => ({ ...d, descricao: e.target.value }))}
                placeholder={data.tipo === 'bug'
                  ? 'Descreva o bug, como reproduzir e o impacto...'
                  : 'Descreva a funcionalidade, o benefício e o contexto...'}
                rows={5} className={`${inpArea} w-full`} />
            </div>
          </div>

          {/* Prioridade e prazo */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />PRIORIDADE & PRAZO<span className="h-px flex-1 bg-primary/15" /></p>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Prioridade</label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRIOS.map(({ value, label, color }) => (
                  <button key={value}
                    onClick={() => setData(d => ({ ...d, prioridade: d.prioridade === value ? '' : value }))}
                    className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 border font-mono text-[10px] transition-all"
                    style={{
                      borderColor: data.prioridade === value ? color : 'hsl(var(--primary)/0.2)',
                      background:  data.prioridade === value ? `${color}22` : 'hsl(220 35% 6%)',
                      color: data.prioridade === value ? color : 'hsl(var(--muted-foreground))',
                    }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: data.prioridade === value ? color : 'hsl(var(--muted-foreground)/0.4)' }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Prazo sugerido (opcional)</label>
              <input type="date" value={data.prazo} onChange={e => setData(d => ({ ...d, prazo: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>
          </div>

          {/* Wallpaper */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />WALLPAPER (OPCIONAL)<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="flex items-center gap-3">
              <button onClick={() => wallpaperRef.current?.click()}
                className="flex items-center gap-2 rounded-lg px-3 py-2 border font-mono text-xs transition-all hover:bg-primary/10"
                style={{ borderColor: 'hsl(var(--primary)/0.35)', color: 'hsl(var(--primary)/0.8)' }}>
                <Camera size={13} />
                {data.wallpaper ? 'Trocar wallpaper' : 'Carregar wallpaper'}
              </button>
              {data.wallpaper && (
                <button onClick={() => setData(d => ({ ...d, wallpaper: null }))}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 border font-mono text-xs transition-all hover:bg-destructive/10 hover:text-destructive"
                  style={{ borderColor: 'hsl(var(--destructive)/0.35)', color: 'hsl(var(--destructive)/0.7)' }}>
                  <Trash2 size={12} />
                  Remover
                </button>
              )}
              <input ref={wallpaperRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaper} />
            </div>
            {data.wallpaper && (
              <div className="rounded-lg overflow-hidden" style={{ height: 60, border: '1px solid hsl(var(--primary)/0.2)' }}>
                <img src={data.wallpaper} className="w-full h-full object-cover opacity-70" alt="wallpaper preview" />
              </div>
            )}
          </div>

          {/* Tema */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />TEMA<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="relative">
              <button onClick={() => setThemeOpen(o => !o)}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 border font-mono text-sm transition-all hover:border-primary/40"
                style={{ borderColor: 'hsl(var(--primary)/0.2)', background: 'hsl(220 35% 6%)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded" style={{ background: theme.gradient }} />
                  <span className="text-foreground/80">{theme.name}</span>
                </div>
                <ChevronDown size={13} className={`text-primary/50 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
              </button>
              {themeOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-xl overflow-hidden shadow-2xl"
                  style={{ border: '1px solid hsl(var(--primary)/0.25)', background: 'hsl(220 35% 7%)' }}>
                  <div className="max-h-48 overflow-y-auto">
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-primary/10 transition-colors text-left"
                        style={{ background: themeId === t.id ? 'hsl(var(--primary)/0.12)' : 'transparent' }}>
                        <div className="w-5 h-5 rounded shrink-0" style={{ background: t.gradient }} />
                        <span className="font-mono text-xs text-foreground/80">{t.name}</span>
                        {themeId === t.id && <CheckCircle2 size={12} className="ml-auto text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <CobrancaScaledPreview data={data} theme={theme} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const REPORT_TYPES = [
  {
    id: 'ceo-regente',
    title: 'CEO Regente',
    description: 'Relatório de gestão semanal com recrutamentos, promoções e estatísticas do grupo.',
    gradient: 'linear-gradient(135deg,#78350f 0%,#b45309 50%,#d97706 100%)',
    Icon: Shield,
  },
  {
    id: 'ceo',
    title: 'CEO',
    description: 'Relatório executivo com oligarcas, promoções e recrutamentos.',
    gradient: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 40%,#4f46e5 100%)',
    Icon: Crown,
  },
  {
    id: 'adm',
    title: 'ADM',
    description: 'Relatório administrativo com descrição e amigos recrutados.',
    gradient: 'linear-gradient(135deg,#052e16 0%,#059669 50%,#10b981 100%)',
    Icon: Star,
  },
  {
    id: 'recrutamento',
    title: 'Recrutamento',
    description: 'Relatório de recrutamento com lista de recrutados e datas.',
    gradient: 'linear-gradient(135deg,#0c1445 0%,#1d4ed8 50%,#3b82f6 100%)',
    Icon: UserCheck,
  },
  {
    id: 'contador-msg',
    title: 'Contador de Mensagens',
    description: 'Relatório de mensagens por grupo com total geral e barra de progresso.',
    gradient: 'linear-gradient(135deg,#3b0764 0%,#7c3aed 50%,#a855f7 100%)',
    Icon: MessageSquare,
  },
  {
    id: 'ban',
    title: 'Banimentos',
    description: 'Relatório de banimentos com nome, motivo e total de banidos.',
    gradient: 'linear-gradient(135deg,#7f1d1d 0%,#dc2626 40%,#f97316 100%)',
    Icon: Ban,
  },
  {
    id: 'procurador',
    title: 'Procurador Geral',
    description: 'Relatório de kitados com nome, motivo e total de ocorrências.',
    gradient: 'linear-gradient(135deg,#0d0d0d 0%,#1a1200 40%,#7c5f00 100%)',
    Icon: Gavel,
  },
  {
    id: 'premiere',
    title: 'Premiê',
    description: 'Relatório de reunião com ministros presentes, ausentes e descrição.',
    gradient: 'linear-gradient(135deg,#0c1445 0%,#1e40af 40%,#0891b2 100%)',
    Icon: Landmark,
  },
  {
    id: 'defesa',
    title: 'Ministério da Defesa',
    description: 'Relatório militar com total de forças ativas, reservistas e descrição.',
    gradient: 'linear-gradient(135deg,#052e16 0%,#14532d 40%,#84cc16 100%)',
    Icon: ShieldCheck,
  },
  {
    id: 'parlamento',
    title: 'Parlamento',
    description: 'Relatório de grupos com total de ADMs e membros somados automaticamente.',
    gradient: 'linear-gradient(135deg,#1e1b4b 0%,#581c87 30%,#be185d 70%,#f97316 100%)',
    Icon: Vote,
  },
  {
    id: 'hospital',
    title: 'Hospital NEEXT',
    description: 'Relatório médico com pacientes, diagnósticos, dias de afastamento e assinatura cursiva.',
    gradient: 'linear-gradient(135deg,#450a0a 0%,#dc2626 50%,#f87171 100%)',
    Icon: Stethoscope,
  },
  {
    id: 'justica',
    title: 'Justiça NeexT',
    description: 'Documentos oficiais: mandado de prisão, notificações, pedidos regulatórios e mais.',
    gradient: 'linear-gradient(135deg,#0d1238 0%,#1a237e 50%,#ffab00 100%)',
    Icon: Scale,
  },
  {
    id: 'tatico',
    title: 'Unidades de Defesa',
    description: 'Relatório tático oficial para SWAT, SSA, GIGN, BOPE e DEFESA com código de operação e confidencialidade.',
    gradient: 'linear-gradient(135deg,#0a0e23 0%,#1a2a6c 50%,#d4af37 100%)',
    Icon: Flag,
  },
  {
    id: 'divulgacao',
    title: 'Divulgação',
    description: 'Relatório de divulgação com foto de perfil, novos membros, total atual, meta e gráfico de pizza.',
    gradient: 'linear-gradient(135deg,#1e1b4b 0%,#4f46e5 50%,#a78bfa 100%)',
    Icon: Megaphone,
  },
  {
    id: 'fiscalizacao',
    title: 'Fiscalização',
    description: 'Relatório de fiscalização com atuação, erros encontrados, solução e consequências.',
    gradient: 'linear-gradient(135deg,#1c1917 0%,#44403c 40%,#f97316 100%)',
    Icon: ClipboardCheck,
  },
  {
    id: 'cobranca',
    title: 'Cobrança',
    description: 'Cobrar a NEEXT pela solução de um bug ou sugerir uma nova funcionalidade com prioridade e prazo.',
    gradient: 'linear-gradient(135deg,#1a0533 0%,#4c1d95 40%,#f59e0b 100%)',
    Icon: Receipt,
  },
];

function RelatoriosHub({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <FileText size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">
              Gerador de Relatórios
            </p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">SELECIONE O TIPO DE RELATÓRIO</p>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map(rt => (
          <button
            key={rt.id}
            onClick={() => onOpen(rt.id)}
            className="group text-left rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.99]"
            style={{ border: '1px solid hsl(var(--primary)/0.25)' }}
          >
            {/* Gradient banner */}
            <div className="h-20 flex items-center justify-center relative" style={{ background: rt.gradient }}>
              <rt.Icon size={32} color="rgba(255,255,255,0.85)" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            {/* Info */}
            <div className="p-4 space-y-1" style={{ background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' }}>
              <p className="font-display font-bold text-sm tracking-widest text-primary uppercase">{rt.title}</p>
              <p className="font-mono text-[11px] text-muted-foreground/70 leading-relaxed">{rt.description}</p>
              <p className="font-mono text-[10px] text-primary/50 uppercase tracking-widest pt-1 group-hover:text-primary transition-colors">
                Abrir gerador →
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── CEO Regente generator ────────────────────────────────────────────────────

function CeoRegenteGenerator({ onBack }: { onBack: () => void }) {
  const captureRef    = useRef<HTMLDivElement>(null);
  const fotoRef       = useRef<HTMLInputElement>(null);
  const wallpaperRef  = useRef<HTMLInputElement>(null);
  const [data, setData]           = useState<ReportData>(emptyReport());
  const [themeId, setThemeId]     = useState('vault-amber');
  const [themeOpen, setThemeOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const handleFotoResponsavel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setData(d => ({ ...d, fotoResponsavel: null }));
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, fotoResponsavel: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, wallpaper: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const addRecruta    = () => setData(d => ({ ...d, recrutamentos: [...d.recrutamentos, { id: uid(), nome: '', data: '' }] }));
  const updateRecruta = (id: string, r: Recruta) => setData(d => ({ ...d, recrutamentos: d.recrutamentos.map(x => x.id === id ? r : x) }));
  const removeRecruta = (id: string) => setData(d => ({ ...d, recrutamentos: d.recrutamentos.filter(x => x.id !== id) }));
  const addSubiu      = (v: string) => setData(d => ({ ...d, subiuDeCargo: [...d.subiuDeCargo, v] }));
  const removeSubiu   = (i: number) => setData(d => ({ ...d, subiuDeCargo: d.subiuDeCargo.filter((_, idx) => idx !== i) }));

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const el = captureRef.current;
      const dataUrl = await toPng(el, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `relatorio-ceo-regente-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const sec = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header with back button */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Shield size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">
              CEO Regente
            </p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">

        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>

            <div className="flex items-end gap-3">
              <div className="shrink-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Foto</label>
                <button onClick={() => fotoRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center relative group transition-opacity hover:opacity-80"
                  style={{ border: '1.5px solid hsl(var(--primary)/0.45)', background: 'hsl(var(--primary)/0.08)' }}>
                  {data.fotoResponsavel
                    ? <img src={data.fotoResponsavel} className="w-full h-full object-cover" alt="" />
                    : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={14} className="text-white" />
                  </div>
                </button>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFotoResponsavel} />
              </div>

              <div className="flex-1 min-w-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                  placeholder="Seu nome" className={inp} />
              </div>
            </div>

            {data.fotoResponsavel && (
              <button onClick={() => setData(d => ({ ...d, fotoResponsavel: null }))}
                className="font-mono text-[10px] text-destructive/50 hover:text-destructive transition-colors">
                Remover foto
              </button>
            )}

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
              <input type="date" value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Tema do Relatório</label>
              <div className="relative">
                <button onClick={() => setThemeOpen(o => !o)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 flex items-center gap-3 hover:border-primary/40 transition-colors">
                  <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: theme.gradient }} />
                  <span className="flex-1 text-left truncate">{theme.name}</span>
                  <ChevronDown size={14} className={`text-primary/50 shrink-0 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeOpen && (
                  <div className="absolute top-full mt-1 w-full z-20 rounded-xl border border-primary/20 overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                    style={{ background: 'hsl(220 35% 8%)' }}>
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm hover:bg-primary/10 transition-colors ${t.id === themeId ? 'text-primary' : 'text-foreground/70'}`}>
                        <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: t.gradient }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

            {/* ── Wallpaper (opcional) ── */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Wallpaper de Fundo <span className="text-muted-foreground/40 normal-case tracking-normal">(opcional — substitui o tema)</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => wallpaperRef.current?.click()}
                  className="w-16 h-10 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/60 transition-all shrink-0 relative group"
                  style={data.wallpaper ? { backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!data.wallpaper && <Camera size={14} className="text-primary/40 group-hover:text-primary transition-colors" />}
                  {data.wallpaper && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={12} className="text-white" /></div>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => wallpaperRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <Camera size={11} /> {data.wallpaper ? 'Trocar wallpaper' : 'Carregar wallpaper'}
                  </button>
                  {data.wallpaper && (
                    <button onClick={() => setData(d => ({ ...d, wallpaper: null }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                      Remover wallpaper
                    </button>
                  )}
                </div>
              </div>
              <input ref={wallpaperRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaper} />
              {data.wallpaper && (
                <p className="font-mono text-[10px] text-amber-400/70 mt-1.5">⚠ Wallpaper ativo — o tema de cor é ignorado</p>
              )}
            </div>

          {/* Contagens */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />CONTAGENS<span className="h-px flex-1 bg-primary/15" /></p>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Número do Grupo <span className="normal-case tracking-normal text-muted-foreground/40">(1–10)</span></label>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button key={n} type="button"
                    onClick={() => setData(d => ({ ...d, numeroGrupo: d.numeroGrupo === String(n) ? '' : String(n) }))}
                    className={`w-9 h-9 rounded-lg border font-mono text-sm font-bold transition-all ${data.numeroGrupo === String(n) ? 'border-primary bg-primary/20 text-primary' : 'border-primary/20 bg-black/30 text-foreground/50 hover:border-primary/40 hover:text-foreground/80'}`}>
                    {n}
                  </button>
                ))}
              </div>
              {data.numeroGrupo && (
                <p className="font-mono text-[10px] text-primary/60 mt-1.5 tracking-widest uppercase">Título: Grupo {data.numeroGrupo}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Membros no Grupo</label>
                <input type="number" min={0} value={data.totalGrupo} onChange={e => setData(d => ({ ...d, totalGrupo: e.target.value }))}
                  placeholder="0" className={inp} />
              </div>
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Quadro Diretivo</label>
                <input type="number" min={0} value={data.totalNYPD} onChange={e => setData(d => ({ ...d, totalNYPD: e.target.value }))}
                  placeholder="0" className={inp} />
              </div>
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Testes</label>
                <input type="number" min={0} value={data.totalTestes} onChange={e => setData(d => ({ ...d, totalTestes: e.target.value }))}
                  placeholder="0" className={inp} />
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />DESCRIÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <textarea
              value={data.descricao}
              onChange={e => setData(d => ({ ...d, descricao: e.target.value }))}
              placeholder="Escreva aqui o texto do relatório..."
              rows={5}
              className={`${inp} resize-none w-full`}
            />
          </div>

          {/* Subiu de Cargo */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />SUBIU DE CARGO<span className="h-px flex-1 bg-primary/15" /></p>
            <ListSection icon={TrendingUp} label="Promoções" items={data.subiuDeCargo}
              placeholder="Nome do promovido..." onAdd={addSubiu} onRemove={removeSubiu} />
          </div>

          {/* Recrutamentos */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />RECRUTAMENTOS<span className="h-px flex-1 bg-primary/15" /></p>
            {data.recrutamentos.length === 0 && (
              <p className="font-mono text-[11px] text-muted-foreground/50 text-center py-1">Nenhum recrutamento adicionado.</p>
            )}
            <div className="space-y-3">
              {data.recrutamentos.map(r => (
                <RecrutaCard key={r.id} recruta={r}
                  onChange={updated => updateRecruta(r.id, updated)}
                  onRemove={() => removeRecruta(r.id)} />
              ))}
            </div>
            <button onClick={addRecruta}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest border border-dashed border-primary/30 text-primary/60 hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all">
              <UserCheck size={13} />Adicionar Recrutado
            </button>
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <ScaledPreview data={data} theme={theme} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Fiscalização Report ──────────────────────────────────────────────────────

interface FiscalizacaoReportData {
  responsavel: string;
  fotoResponsavel: string | null;
  wallpaper: string | null;
  dataRelatorio: string;
  atuacao: string;
  erros: string;
  solucao: string;
  consequencias: string;
}

const emptyFiscalizacao = (): FiscalizacaoReportData => ({
  responsavel: '', fotoResponsavel: null, wallpaper: null, dataRelatorio: '',
  atuacao: '', erros: '', solucao: '', consequencias: '',
});

function FiscalizacaoReportCard({ data, theme }: { data: FiscalizacaoReportData; theme: Theme }) {
  const mono = "'Courier New', Courier, monospace";
  const w = '#ffffff';
  const wA = (a: number) => `rgba(255,255,255,${a})`;

  const base  = gradientBase(theme.gradient);
  const panel = kOver(0.28, base);
  const bdr   = wOver(0.14, base);
  const c18   = wOver(0.18, base);
  const c35   = wOver(0.35, base);
  const c12   = wOver(0.12, base);
  const c50   = wOver(0.50, base);
  const c10   = wOver(0.10, base);

  const hasWall = !!data.wallpaper;
  const outerStyle: React.CSSProperties = hasWall
    ? { width: 400, backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }
    : { width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const };

  const sections: { label: string; value: string }[] = [
    { label: 'Atuação',           value: data.atuacao },
    { label: 'Erros Encontrados', value: data.erros },
    { label: 'Solução',           value: data.solucao },
    { label: 'Consequências',     value: data.consequencias },
  ];

  return (
    <div style={outerStyle}>
      {hasWall && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)', zIndex: 0 }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ height: 3, background: c35 }} />
        <div style={{ padding: '22px 22px' }}>

          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: c18, border: `1.5px solid ${c35}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ClipboardCheck size={18} color={w} />
              </div>
              <div>
                <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.25em', marginBottom: 2 }}>Sistema Operacional</div>
                <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 900, color: w, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>FISCALIZAÇÃO</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ textAlign: 'right' as const }}>
                <div style={{ fontFamily: mono, fontSize: 8, color: wA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.18em', marginBottom: 3 }}>Responsável</div>
                <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: w }}>{data.responsavel || '—'}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: wA(0.6), marginTop: 2 }}>{formatDate(data.dataRelatorio)}</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: `2px solid ${c50}`, overflow: 'hidden', background: c12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {data.fotoResponsavel
                  ? <img src={data.fotoResponsavel} width={44} height={44} style={{ objectFit: 'cover', display: 'block', width: 44, height: 44 }} alt="" />
                  : <User size={20} color={wA(0.5)} />
                }
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: bdr, marginBottom: 14 }} />

          {/* ── Sections ── */}
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
            {sections.map(({ label, value }) => value.trim() ? (
              <div key={label} style={{ background: panel, border: `1px solid ${bdr}`, borderRadius: 10, padding: '11px 13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                  <div style={{ width: 4, height: 14, borderRadius: 2, background: c35, flexShrink: 0 }} />
                  <span style={{ fontFamily: mono, fontSize: 8, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.22em', color: wA(0.75) }}>{label}</span>
                </div>
                <p style={{ fontFamily: mono, fontSize: 11, color: wA(0.85), lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' as const }}>{value}</p>
              </div>
            ) : null)}
          </div>

          {/* ── Footer ── */}
          <div style={{ marginTop: 16, paddingTop: 11, borderTop: `1px solid ${c10}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.45), textTransform: 'uppercase' as const, letterSpacing: '0.1em', lineHeight: 1 }}>Documento Oficial — NEEXT LTDA</span>
            <span style={{ fontFamily: mono, fontSize: 8, color: wA(0.3), lineHeight: 1 }}>VAULT-TEC</span>
          </div>
        </div>
        <div style={{ height: 3, background: c18 }} />
      </div>
    </div>
  );
}

function FiscalizacaoScaledPreview({ data, theme, cardRef }: { data: FiscalizacaoReportData; theme: Theme; cardRef?: React.RefObject<HTMLDivElement> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => setZoom(Math.min(1, entry.contentRect.width / 400)));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <div style={{ zoom }}>
        <div ref={cardRef}><FiscalizacaoReportCard data={data} theme={theme} /></div>
      </div>
    </div>
  );
}

function FiscalizacaoGenerator({ onBack }: { onBack: () => void }) {
  const captureRef  = useRef<HTMLDivElement>(null);
  const fotoRef     = useRef<HTMLInputElement>(null);
  const wallpaperRef = useRef<HTMLInputElement>(null);
  const [data, setData]               = useState<FiscalizacaoReportData>(emptyFiscalizacao());
  const [themeId, setThemeId]         = useState('midnight-gold');
  const [themeOpen, setThemeOpen]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setData(d => ({ ...d, fotoResponsavel: null }));
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, fotoResponsavel: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const handleWallpaper = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await readFileAsBase64(file);
      setData(d => ({ ...d, wallpaper: b64 }));
    } catch { /* ignore */ }
    e.target.value = '';
  };

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, { pixelRatio: 2, skipAutoScale: true });
      const link = document.createElement('a');
      link.download = `relatorio-fiscalizacao-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  const inp       = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const inpArea   = `${inp} resize-none`;
  const sec       = "rounded-xl p-4 sm:p-5 space-y-3";
  const secStyle  = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const secLabel  = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-lg border border-primary/25 flex items-center justify-center shrink-0 text-primary/60 hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all"
            title="Voltar">
            <ChevronDown size={15} className="rotate-90" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <ClipboardCheck size={15} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">Fiscalização</p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">PREENCHA OS CAMPOS E BAIXE COMO IMAGEM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="flex items-end gap-3">
              <div className="shrink-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Foto</label>
                <button onClick={() => fotoRef.current?.click()}
                  className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center relative group transition-opacity hover:opacity-80"
                  style={{ border: '1.5px solid hsl(var(--primary)/0.45)', background: 'hsl(var(--primary)/0.08)' }}>
                  {data.fotoResponsavel
                    ? <img src={data.fotoResponsavel} className="w-full h-full object-cover" alt="" />
                    : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
                  }
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera size={14} className="text-white" />
                  </div>
                </button>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </div>
              <div className="flex-1 min-w-0">
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                  placeholder="Seu nome" className={inp} />
              </div>
            </div>
            {data.fotoResponsavel && (
              <button onClick={() => setData(d => ({ ...d, fotoResponsavel: null }))}
                className="font-mono text-[10px] text-destructive/50 hover:text-destructive transition-colors">
                Remover foto
              </button>
            )}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
              <input type="date" value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                className={`${inp} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Tema do Relatório</label>
              <div className="relative">
                <button onClick={() => setThemeOpen(o => !o)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 flex items-center gap-3 hover:border-primary/40 transition-colors">
                  <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: theme.gradient }} />
                  <span className="flex-1 text-left truncate">{theme.name}</span>
                  <ChevronDown size={14} className={`text-primary/50 shrink-0 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeOpen && (
                  <div className="absolute top-full mt-1 w-full z-20 rounded-xl border border-primary/20 overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                    style={{ background: 'hsl(220 35% 8%)' }}>
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm hover:bg-primary/10 transition-colors ${t.id === themeId ? 'text-primary' : 'text-foreground/70'}`}>
                        <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: t.gradient }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Wallpaper */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Wallpaper de Fundo <span className="text-muted-foreground/40 normal-case tracking-normal">(opcional — substitui o tema)</span>
              </label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => wallpaperRef.current?.click()}
                  className="w-16 h-10 rounded-lg border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/60 transition-all shrink-0 relative group"
                  style={data.wallpaper ? { backgroundImage: `url(${data.wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {!data.wallpaper && <Camera size={14} className="text-primary/40 group-hover:text-primary transition-colors" />}
                  {data.wallpaper && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Camera size={12} className="text-white" /></div>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => wallpaperRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary/70 hover:text-primary hover:bg-primary/10 hover:border-primary/50 transition-all font-mono text-[10px] uppercase tracking-widest">
                    <Camera size={11} /> {data.wallpaper ? 'Trocar wallpaper' : 'Carregar wallpaper'}
                  </button>
                  {data.wallpaper && (
                    <button onClick={() => setData(d => ({ ...d, wallpaper: null }))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all font-mono text-[10px] uppercase tracking-widest">
                      Remover wallpaper
                    </button>
                  )}
                </div>
              </div>
              <input ref={wallpaperRef} type="file" accept="image/*" className="hidden" onChange={handleWallpaper} />
              {data.wallpaper && (
                <p className="font-mono text-[10px] text-amber-400/70 mt-1.5">⚠ Wallpaper ativo — o tema de cor é ignorado</p>
              )}
            </div>
          </div>

          {/* Atuação */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />ATUAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <textarea value={data.atuacao} onChange={e => setData(d => ({ ...d, atuacao: e.target.value }))}
              placeholder="Descreva a atuação realizada..." rows={4}
              className={`${inpArea} w-full`} />
          </div>

          {/* Erros Encontrados */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />ERROS ENCONTRADOS<span className="h-px flex-1 bg-primary/15" /></p>
            <textarea value={data.erros} onChange={e => setData(d => ({ ...d, erros: e.target.value }))}
              placeholder="Liste os erros ou irregularidades encontradas..." rows={4}
              className={`${inpArea} w-full`} />
          </div>

          {/* Solução */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />SOLUÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <textarea value={data.solucao} onChange={e => setData(d => ({ ...d, solucao: e.target.value }))}
              placeholder="Descreva a solução aplicada ou proposta..." rows={4}
              className={`${inpArea} w-full`} />
          </div>

          {/* Consequências */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />CONSEQUÊNCIAS<span className="h-px flex-1 bg-primary/15" /></p>
            <textarea value={data.consequencias} onChange={e => setData(d => ({ ...d, consequencias: e.target.value }))}
              placeholder="Descreva as consequências ou medidas disciplinares..." rows={4}
              className={`${inpArea} w-full`} />
          </div>

          {/* Download */}
          <button onClick={download} disabled={downloading}
            className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: 'hsl(var(--primary)/0.15)', borderColor: 'hsl(var(--primary)/0.5)', color: 'hsl(var(--primary))', boxShadow: '0 0 20px hsl(var(--primary)/0.1)' }}>
            {downloading
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>}
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <FiscalizacaoScaledPreview data={data} theme={theme} cardRef={captureRef} />
        </div>
      </div>
    </div>
  );
}

// ─── Main (router) ────────────────────────────────────────────────────────────

export default function VaultRelatorios() {
  const [view, setView] = useState<'hub' | string>('hub');

  if (view === 'ceo-regente') return <CeoRegenteGenerator onBack={() => setView('hub')} />;
  if (view === 'ceo') return <CeoGenerator onBack={() => setView('hub')} />;
  if (view === 'adm') return <AdmGenerator onBack={() => setView('hub')} />;
  if (view === 'recrutamento') return <RecrutamentoGenerator onBack={() => setView('hub')} />;
  if (view === 'contador-msg') return <ContadorMsgGenerator onBack={() => setView('hub')} />;
  if (view === 'ban') return <BanGenerator onBack={() => setView('hub')} />;
  if (view === 'procurador') return <ProcuradorGenerator onBack={() => setView('hub')} />;
  if (view === 'premiere') return <PremiereGenerator onBack={() => setView('hub')} />;
  if (view === 'defesa') return <DefesaGenerator onBack={() => setView('hub')} />;
  if (view === 'parlamento') return <ParlamentoGenerator onBack={() => setView('hub')} />;
  if (view === 'hospital')  return <HospitalGenerator  onBack={() => setView('hub')} />;
  if (view === 'justica')   return <JusticaGenerator   onBack={() => setView('hub')} />;
  if (view === 'tatico')      return <TaticoGenerator      onBack={() => setView('hub')} />;
  if (view === 'divulgacao')    return <DivulgacaoGenerator    onBack={() => setView('hub')} />;
  if (view === 'fiscalizacao')  return <FiscalizacaoGenerator  onBack={() => setView('hub')} />;
  if (view === 'cobranca')      return <CobrancaGenerator      onBack={() => setView('hub')} />;
  return <RelatoriosHub onOpen={setView} />;
}
