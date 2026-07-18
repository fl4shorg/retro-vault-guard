import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import {
  FileText, Plus, Trash2, Download, User,
  Loader2, Camera, UserCheck, TrendingUp, Users,
  Building2, Shield, Radiation, ChevronDown, Crown, Star, MessageSquare, Ban, Gavel, Landmark,
  CheckCircle2, XCircle, ShieldCheck, Sword,
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
  dataRelatorio: string;
  recrutamentos: Recruta[];
  subiuDeCargo: string[];
  totalGrupo: string;
  totalNYPD: string;
  descricao: string;
}

type Theme = typeof THEMES[number];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

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
  responsavel: '', fotoResponsavel: null, dataRelatorio: '',
  recrutamentos: [], subiuDeCargo: [],
  totalGrupo: '', totalNYPD: '',
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

  return (
    <div style={{ width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const }}>
      <div style={{ height: 3, background: c35 }} />

      <div style={{ padding: '24px 22px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: c18, border: `1.5px solid ${c35}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Radiation size={18} color={w} />
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

        {/* ── Contagens ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[
            { label: 'Membros no Grupo', value: data.totalGrupo, Icon: Users },
            { label: 'Quadro Diretivo',   value: data.totalNYPD,  Icon: Building2 },
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
  dataRelatorio: string;
  descricao: string;
  recrutamentos: Recruta[];
  subiuDeCargo: string[];
  oligarcas: string[];
}

const emptyCeoReport = (): CeoReportData => ({
  responsavel: '', fotoResponsavel: null, dataRelatorio: '',
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

  return (
    <div style={{ width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const }}>
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
  dataRelatorio: string;
  descricao: string;
  amigosRecrutados: string[];
}

const emptyAdmReport = (): AdmReportData => ({
  responsavel: '', fotoResponsavel: null, dataRelatorio: '',
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

  return (
    <div style={{ width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const }}>
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
  dataRelatorio: string;
  recrutamentos: Recruta[];
}

const emptyRecrutamentoReport = (): RecrutamentoReportData => ({
  responsavel: '', fotoResponsavel: null, dataRelatorio: '', recrutamentos: [],
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

  return (
    <div style={{ width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const }}>
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

// ─── Ministério da Defesa Report ─────────────────────────────────────────────

interface DefesaReportData {
  responsavel: string;
  fotoResponsavel: string | null;
  dataRelatorio: string;
  forcasAtivas: string;
  reservistas: string;
  descricao: string;
}

const emptyDefesaReport = (): DefesaReportData => ({
  responsavel: '', fotoResponsavel: null, dataRelatorio: '',
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

  return (
    <div style={{ width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const }}>
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
  dataRelatorio: string;
  descricao: string;
  presentes: string[];
  ausentes: string[];
}

const emptyPremiereReport = (): PremiereReportData => ({
  responsavel: '', fotoResponsavel: null, dataRelatorio: '',
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

  return (
    <div style={{ width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const }}>
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
  dataRelatorio: string;
  kitados: PessoaKitada[];
}

const emptyProcuradorReport = (): ProcuradorReportData => ({
  responsavel: '', fotoResponsavel: null, dataRelatorio: '', kitados: [],
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

  return (
    <div style={{ width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const }}>
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
  dataRelatorio: string;
  banidos: PessoaBanida[];
}

const emptyBanReport = (): BanReportData => ({
  responsavel: '', fotoResponsavel: null, dataRelatorio: '', banidos: [],
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

  return (
    <div style={{ width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const }}>
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
  dataRelatorio: string;
  grupos: GrupoMensagem[];
}

const emptyContadorMsg = (): ContadorMsgData => ({
  responsavel: '', fotoResponsavel: null, dataRelatorio: '', grupos: [],
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

  return (
    <div style={{ width: 400, background: theme.gradient, borderRadius: 16, overflow: 'hidden', boxSizing: 'border-box' as const }}>
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

// ─── Report Hub (landing) ─────────────────────────────────────────────────────

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
  const captureRef  = useRef<HTMLDivElement>(null);
  const fotoRef     = useRef<HTMLInputElement>(null);
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

          {/* Contagens */}
          <div className={sec} style={secStyle}>
            <p className={secLabel}><span className="h-px flex-1 bg-primary/15" />CONTAGENS<span className="h-px flex-1 bg-primary/15" /></p>
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
  return <RelatoriosHub onOpen={setView} />;
}
