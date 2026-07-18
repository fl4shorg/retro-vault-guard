import { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import {
  FileText, Plus, Trash2, Download, User,
  Loader2, Camera, UserCheck, TrendingUp, Users,
  Building2, Shield, Radiation, ChevronDown,
} from 'lucide-react';

// ─── Themes ──────────────────────────────────────────────────────────────────

const THEMES = [
  { id: 'vault-amber',    name: 'Vault Âmbar',          gradient: 'linear-gradient(135deg,#78350f 0%,#b45309 50%,#d97706 100%)' },
  { id: 'midnight-gold',  name: 'Ouro Noir',             gradient: 'linear-gradient(135deg,#0d0d0d 0%,#1a1200 40%,#7c5f00 100%)' },
  { id: 'purple-cosmic',  name: 'Cósmico Roxo',          gradient: 'linear-gradient(135deg,#3b0764 0%,#7c3aed 50%,#a855f7 100%)' },
  { id: 'cyber-blue',     name: 'Cibernético Azul',      gradient: 'linear-gradient(135deg,#0c1445 0%,#1d4ed8 50%,#3b82f6 100%)' },
  { id: 'emerald-tech',   name: 'Esmeralda Tech',        gradient: 'linear-gradient(135deg,#052e16 0%,#059669 50%,#10b981 100%)' },
  { id: 'sunset-fire',    name: 'Pôr do Sol',            gradient: 'linear-gradient(135deg,#7f1d1d 0%,#dc2626 40%,#f97316 100%)' },
  { id: 'ocean-depths',   name: 'Oceano Profundo',       gradient: 'linear-gradient(135deg,#0c1445 0%,#1e40af 40%,#0891b2 100%)' },
  { id: 'galaxy-spiral',  name: 'Espiral Galáctica',     gradient: 'linear-gradient(135deg,#1e1b4b 0%,#581c87 30%,#be185d 70%,#f97316 100%)' },
  { id: 'neon-cyberpunk', name: 'Neon Cyberpunk',        gradient: 'linear-gradient(135deg,#0f0c29 0%,#302b63 40%,#24243e 100%)' },
  { id: 'volcanic',       name: 'Erupção Vulcânica',     gradient: 'linear-gradient(135deg,#1c0000 0%,#7c2d12 30%,#dc2626 70%,#f97316 100%)' },
  { id: 'aurora',         name: 'Aurora Boreal',         gradient: 'linear-gradient(135deg,#064e3b 0%,#0f172a 35%,#4c1d95 70%,#be185d 100%)' },
  { id: 'rose-gold',      name: 'Rosé Gold',             gradient: 'linear-gradient(135deg,#4a0019 0%,#9d174d 45%,#f59e0b 100%)' },
  { id: 'toxic-green',    name: 'Verde Tóxico',          gradient: 'linear-gradient(135deg,#052e16 0%,#14532d 40%,#84cc16 100%)' },
  { id: 'ice-cold',       name: 'Gelo Ártico',           gradient: 'linear-gradient(135deg,#0c1a3a 0%,#1e3a5f 40%,#7dd3fc 100%)' },
  { id: 'blood-moon',     name: 'Lua de Sangue',         gradient: 'linear-gradient(135deg,#0d0000 0%,#450a0a 35%,#991b1b 70%,#b45309 100%)' },
  { id: 'deep-space',     name: 'Espaço Profundo',       gradient: 'linear-gradient(135deg,#000000 0%,#0f172a 40%,#1e1b4b 70%,#312e81 100%)' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Recruta {
  id: string;
  nome: string;
  data: string;
  descricao: string;
  foto: string | null;
}

interface ReportData {
  responsavel: string;
  dataRelatorio: string;
  recrutamentos: Recruta[];
  subiuDeCargo: string[];
  totalGrupo: string;
  totalNYPD: string;
}

type Theme = typeof THEMES[number];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

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
  responsavel: '', dataRelatorio: '',
  recrutamentos: [], subiuDeCargo: [],
  totalGrupo: '', totalNYPD: '',
});

// ─── Report Card (inline styles — renders identically on screen & in download) ─

function ReportCard({ data, theme }: { data: ReportData; theme: Theme }) {
  const mono = "'Courier New', Courier, monospace";
  const white = '#ffffff';
  const whiteA = (a: number) => `rgba(255,255,255,${a})`;
  const panel = 'rgba(0,0,0,0.28)';
  const panelBorder = 'rgba(255,255,255,0.14)';

  const Row = ({ label, val }: { label: string; val: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      <span style={{ fontFamily: mono, fontSize: 9, color: whiteA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.2em' }}>{label}</span>
      <span style={{ fontFamily: mono, fontSize: 20, fontWeight: 900, color: white }}>{val || '—'}</span>
    </div>
  );

  return (
    <div style={{
      width: 680,
      background: theme.gradient,
      borderRadius: 16,
      overflow: 'hidden',
      boxSizing: 'border-box' as const,
    }}>
      {/* Top accent */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.35)' }} />

      <div style={{ padding: '32px 36px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radiation size={22} color={white} />
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 9, color: whiteA(0.6), textTransform: 'uppercase' as const, letterSpacing: '0.3em', marginBottom: 3 }}>Sistema Operacional</div>
              <div style={{ fontFamily: mono, fontSize: 19, fontWeight: 900, color: white, textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>CEO REGENTE</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' as const }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: whiteA(0.55), textTransform: 'uppercase' as const, letterSpacing: '0.2em', marginBottom: 4 }}>Relatório Oficial</div>
            <div style={{ fontFamily: mono, fontSize: 15, fontWeight: 700, color: white }}>{data.responsavel || '—'}</div>
            <div style={{ fontFamily: mono, fontSize: 11, color: whiteA(0.65), marginTop: 3 }}>{formatDate(data.dataRelatorio)}</div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: panelBorder, marginBottom: 20 }} />

        {/* Counts */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
          {[
            { label: 'Membros no Grupo', value: data.totalGrupo, Icon: Users },
            { label: 'Membros NYPD',     value: data.totalNYPD,  Icon: Building2 },
          ].map(({ label, value, Icon }) => (
            <div key={label} style={{ flex: 1, background: panel, border: `1px solid ${panelBorder}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={white} />
              </div>
              <Row label={label} val={value} />
            </div>
          ))}
        </div>

        {/* Subiu de Cargo */}
        {data.subiuDeCargo.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${panelBorder}`, borderRadius: 10, padding: '14px 16px', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <TrendingUp size={14} color={white} />
              <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: white, flex: 1 }}>Subiu de Cargo</span>
              <span style={{ fontFamily: mono, fontSize: 10, background: 'rgba(255,255,255,0.18)', borderRadius: 99, padding: '2px 10px', color: white }}>{data.subiuDeCargo.length}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
              {data.subiuDeCargo.map((nome, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 6, padding: '4px 10px', fontFamily: mono, fontSize: 12, color: white, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 11 }}>&#8593;</span>{nome}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recrutamentos */}
        {data.recrutamentos.length > 0 && (
          <div style={{ background: panel, border: `1px solid ${panelBorder}`, borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Users size={14} color={white} />
              <span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: white, flex: 1 }}>Recrutamentos</span>
              <span style={{ fontFamily: mono, fontSize: 10, background: 'rgba(255,255,255,0.18)', borderRadius: 99, padding: '2px 10px', color: white }}>{data.recrutamentos.length}</span>
            </div>
            {data.recrutamentos.map((r, i) => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                paddingBottom: i < data.recrutamentos.length - 1 ? 14 : 0,
                marginBottom: i < data.recrutamentos.length - 1 ? 14 : 0,
                borderBottom: i < data.recrutamentos.length - 1 ? `1px solid rgba(255,255,255,0.1)` : 'none',
              }}>
                {/* Photo */}
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                  border: '2px solid rgba(255,255,255,0.4)', overflow: 'hidden',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {r.foto
                    ? <img src={r.foto} width={48} height={48} style={{ objectFit: 'cover', display: 'block', width: 48, height: 48 }} alt="" />
                    : <User size={22} color="rgba(255,255,255,0.5)" />
                  }
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' as const }}>
                    <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 700, color: white }}>{r.nome || '—'}</span>
                    <span style={{ fontFamily: mono, fontSize: 10, color: whiteA(0.55) }}>{formatDate(r.data)}</span>
                  </div>
                  {r.descricao && (
                    <p style={{ fontFamily: mono, fontSize: 11, color: whiteA(0.6), lineHeight: 1.55, margin: 0 }}>{r.descricao}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 22, paddingTop: 14, borderTop: `1px solid ${panelBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={11} color={whiteA(0.45)} />
            <span style={{ fontFamily: mono, fontSize: 9, color: whiteA(0.45), textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>
              Documento Oficial — NEEXT LTDA
            </span>
          </div>
          <span style={{ fontFamily: mono, fontSize: 9, color: whiteA(0.3) }}>CEO Regente v1.0</span>
        </div>
      </div>

      {/* Bottom accent */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.18)' }} />
    </div>
  );
}

// ─── Recruit card form ────────────────────────────────────────────────────────

function RecrutaCard({ recruta, onChange, onRemove }: {
  recruta: Recruta;
  onChange: (r: Recruta) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { onChange({ ...recruta, foto: await readFileAsBase64(file) }); }
    catch { /* ignore */ }
    e.target.value = '';
  }, [recruta, onChange]);

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2 font-mono text-xs text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="rounded-xl p-3 sm:p-4 space-y-3 relative"
      style={{ background: 'hsl(220 35% 8%)', border: '1px solid hsl(var(--primary)/0.2)' }}>
      <button onClick={onRemove} className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors">
        <Trash2 size={12} />
      </button>

      <div className="flex items-start gap-3 pr-8">
        {/* Avatar picker */}
        <button onClick={() => fileRef.current?.click()}
          className="w-14 h-14 rounded-full shrink-0 overflow-hidden flex items-center justify-center relative group transition-opacity hover:opacity-80"
          style={{ border: '1.5px solid hsl(var(--primary)/0.4)', background: 'hsl(var(--primary)/0.08)' }}>
          {recruta.foto
            ? <img src={recruta.foto} className="w-full h-full object-cover" alt="" />
            : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
            <Camera size={14} className="text-white" />
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        <div className="flex-1 min-w-0 space-y-2">
          <input value={recruta.nome} onChange={e => onChange({ ...recruta, nome: e.target.value })}
            placeholder="Nome do recrutado" className={inp} />
          <input type="date" value={recruta.data} onChange={e => onChange({ ...recruta, data: e.target.value })}
            className={`${inp} [color-scheme:dark]`} />
        </div>
      </div>

      <textarea value={recruta.descricao} onChange={e => onChange({ ...recruta, descricao: e.target.value })}
        placeholder="Descrição (opcional)..." rows={2}
        className={`${inp} resize-none`} />
    </div>
  );
}

// ─── Simple list input section ────────────────────────────────────────────────

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
        <span className="font-mono text-[10px] rounded-full px-2 py-0.5"
          style={{ background: 'hsl(var(--primary)/0.15)', color: 'hsl(var(--primary))' }}>{items.length}</span>
      </div>
      {items.length > 0 && (
        <ul className="px-3 py-2 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-primary/40 shrink-0">{String(i + 1).padStart(2, '0')}.</span>
              <span className="flex-1 font-mono text-xs text-foreground/80 break-words min-w-0">{item}</span>
              <button onClick={() => onRemove(i)}
                className="w-6 h-6 flex items-center justify-center rounded text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function VaultRelatorios() {
  const captureRef = useRef<HTMLDivElement>(null);
  const [data, setData]         = useState<ReportData>(emptyReport());
  const [themeId, setThemeId]   = useState('vault-amber');
  const [themeOpen, setThemeOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const addRecruta    = () => setData(d => ({ ...d, recrutamentos: [...d.recrutamentos, { id: uid(), nome: '', data: '', descricao: '', foto: null }] }));
  const updateRecruta = (id: string, r: Recruta) => setData(d => ({ ...d, recrutamentos: d.recrutamentos.map(x => x.id === id ? r : x) }));
  const removeRecruta = (id: string) => setData(d => ({ ...d, recrutamentos: d.recrutamentos.filter(x => x.id !== id) }));
  const addSubiu      = (v: string) => setData(d => ({ ...d, subiuDeCargo: [...d.subiuDeCargo, v] }));
  const removeSubiu   = (i: number) => setData(d => ({ ...d, subiuDeCargo: d.subiuDeCargo.filter((_, idx) => idx !== i) }));

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const el = captureRef.current;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        width: el.scrollWidth,
        height: el.scrollHeight,
        windowWidth: el.scrollWidth,
        imageTimeout: 0,
      });
      const link = document.createElement('a');
      link.download = `relatorio-ceo-regente-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Erro ao gerar imagem:', e);
    } finally {
      setDownloading(false);
    }
  };

  const inp = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";
  const section = "rounded-xl p-4 sm:p-5 space-y-3" as const;
  const sectionStyle = { border: '1px solid hsl(var(--primary)/0.2)', background: 'linear-gradient(135deg,hsl(220 35% 8%) 0%,hsl(220 30% 10%) 100%)' };
  const sectionLabel = "font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2" as const;

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Hidden fixed-size card for html2canvas — identical to preview card */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, pointerEvents: 'none' }} aria-hidden>
        <div ref={captureRef}>
          <ReportCard data={data} theme={theme} />
        </div>
      </div>

      {/* Page header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary)/0.35)', background: 'linear-gradient(135deg,hsl(220 35% 8%/0.97) 0%,hsl(220 30% 11%/0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <FileText size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">
              Gerador de Relatório — CEO Regente
            </p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">
              PREENCHA OS CAMPOS E BAIXE COMO IMAGEM
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-start">

        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identificação */}
          <div className={section} style={sectionStyle}>
            <p className={sectionLabel}><span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                <input value={data.responsavel} onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                  placeholder="Seu nome" className={inp} />
              </div>
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
                <input type="date" value={data.dataRelatorio} onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                  className={`${inp} [color-scheme:dark]`} />
              </div>
            </div>

            {/* Theme picker */}
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
          <div className={section} style={sectionStyle}>
            <p className={sectionLabel}><span className="h-px flex-1 bg-primary/15" />CONTAGENS<span className="h-px flex-1 bg-primary/15" /></p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Membros no Grupo</label>
                <input type="number" min={0} value={data.totalGrupo} onChange={e => setData(d => ({ ...d, totalGrupo: e.target.value }))}
                  placeholder="0" className={inp} />
              </div>
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Membros NYPD</label>
                <input type="number" min={0} value={data.totalNYPD} onChange={e => setData(d => ({ ...d, totalNYPD: e.target.value }))}
                  placeholder="0" className={inp} />
              </div>
            </div>
          </div>

          {/* Subiu de Cargo */}
          <div className={section} style={sectionStyle}>
            <p className={sectionLabel}><span className="h-px flex-1 bg-primary/15" />SUBIU DE CARGO<span className="h-px flex-1 bg-primary/15" /></p>
            <ListSection icon={TrendingUp} label="Promoções" items={data.subiuDeCargo}
              placeholder="Nome do promovido..." onAdd={addSubiu} onRemove={removeSubiu} />
          </div>

          {/* Recrutamentos */}
          <div className={section} style={sectionStyle}>
            <p className={sectionLabel}><span className="h-px flex-1 bg-primary/15" />RECRUTAMENTOS<span className="h-px flex-1 bg-primary/15" /></p>
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
          {/* Scrollable wrapper so the 680px card doesn't break mobile layout */}
          <div className="overflow-x-auto pb-2 rounded-xl">
            <div style={{ minWidth: 340 }}>
              <ReportCard data={data} theme={theme} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
