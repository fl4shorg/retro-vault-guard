import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  Users, ArrowRightLeft, TrendingUp, Hash, FileText,
  Plus, Trash2, Download, Calendar, User, ChevronDown,
  Radiation, Shield, Loader2,
} from 'lucide-react';

// ─── Themes ──────────────────────────────────────────────────────────────────
const THEMES = [
  { id: 'vault-amber',    name: 'Vault Âmbar',          gradient: 'linear-gradient(135deg, #78350f 0%, #b45309 50%, #d97706 100%)' },
  { id: 'purple-cosmic',  name: 'Cósmico Roxo',          gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #C084FC 100%)' },
  { id: 'cyber-blue',     name: 'Cibernético Azul',      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)' },
  { id: 'emerald-tech',   name: 'Esmeralda Tech',        gradient: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)' },
  { id: 'sunset-fire',    name: 'Pôr do Sol',            gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #DC2626 100%)' },
  { id: 'ocean-depths',   name: 'Profundezas Oceânicas', gradient: 'linear-gradient(135deg, #0891B2 0%, #1E40AF 50%, #581C87 100%)' },
  { id: 'galaxy-spiral',  name: 'Espiral Galáctica',     gradient: 'linear-gradient(135deg, #1E1B4B 0%, #581C87 30%, #BE185D 70%, #F97316 100%)' },
  { id: 'neon-cyberpunk', name: 'Neon Cyberpunk',        gradient: 'linear-gradient(135deg, #06B6D4 0%, #EC4899 50%, #FBBF24 100%)' },
  { id: 'volcanic',       name: 'Erupção Vulcânica',     gradient: 'linear-gradient(135deg, #7C2D12 0%, #DC2626 30%, #F97316 70%, #FBBF24 100%)' },
  { id: 'aurora',         name: 'Aurora Boreal',         gradient: 'linear-gradient(135deg, #10B981 0%, #3B82F6 30%, #8B5CF6 60%, #EC4899 100%)' },
];

// ─── Section config ───────────────────────────────────────────────────────────
const SECTIONS = [
  { key: 'recruitment',  title: 'Recrutamento',           placeholder: 'Adicionar novo recrutamento...', icon: Users },
  { key: 'movement',     title: 'Movimento',              placeholder: 'Adicionar movimento...',         icon: ArrowRightLeft },
  { key: 'promotion',    title: 'Subiu de Cargo',         placeholder: 'Adicionar promoção...',          icon: TrendingUp },
  { key: 'totalMembers', title: 'Membros Total no Grupo', placeholder: 'Adicionar membro total...',      icon: Hash },
  { key: 'description',  title: 'Descrição',              placeholder: 'Adicionar descrição...',         icon: FileText },
] as const;

type SectionKey = typeof SECTIONS[number]['key'];
type SectionData = Record<SectionKey, string[]>;

const emptyData = (): SectionData => ({
  recruitment: [], movement: [], promotion: [], totalMembers: [], description: [],
});

function formatDate(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
}

// ─── Shared report props ──────────────────────────────────────────────────────
interface ReportProps {
  name: string;
  date: string;
  title: string;
  theme: typeof THEMES[number];
  data: SectionData;
}

// ─── FIXED-SIZE report — used only by html2canvas (off-screen) ────────────────
// All sizes in px via inline styles. Never changes regardless of screen size.
function ReportFixed({ name, date, title, theme, data }: ReportProps) {
  const mono = "'Courier New', Courier, monospace";

  const sectionBlock = (key: SectionKey, sTitle: string) => {
    const items = data[key];
    return (
      <div key={key} style={{
        background: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        padding: '14px 16px',
        marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.9)', flex: 1 }}>{sTitle}</span>
          <span style={{ fontFamily: mono, fontSize: 11, background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '1px 8px', color: '#fff' }}>{items.length}</span>
        </div>
        {items.length === 0
          ? <p style={{ fontFamily: mono, fontSize: 12, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Nenhum item registrado.</p>
          : items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: mono, fontSize: 12, color: 'rgba(255,255,255,0.5)', minWidth: 22 }}>{String(i + 1).padStart(2, '0')}.</span>
              <span style={{ fontFamily: mono, fontSize: 13, color: 'rgba(255,255,255,0.92)', lineHeight: 1.5 }}>{item}</span>
            </div>
          ))
        }
      </div>
    );
  };

  return (
    <div style={{
      width: 680,
      background: theme.gradient,
      fontFamily: mono,
      borderRadius: 16,
      padding: 40,
      color: '#fff',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 2 }}>Responsável</p>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{name || 'Nome do Responsável'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={20} color="#fff" />
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 2 }}>Data do Relatório</p>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{formatDate(date)}</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radiation size={28} color="#fff" />
          </div>
        </div>
        <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '4px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', display: 'inline-block', marginBottom: 12 }}>
          Documento Oficial
        </span>
        <h1 style={{ fontSize: 26, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4, lineHeight: 1.2 }}>
          {title || 'Título do Relatório'}
        </h1>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
          Relatório Oficial — NEEXT LTDA
        </p>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', marginTop: 20 }} />
      </div>

      {/* Sections */}
      <div>
        {SECTIONS.map(({ key, title: t }) => sectionBlock(key, t))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={12} color="rgba(255,255,255,0.5)" />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Relatório gerado automaticamente pelo Sistema Neext
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: mono }}>Sistema Avançado v2.0</span>
      </div>
    </div>
  );
}

// ─── RESPONSIVE preview — shown to the user ───────────────────────────────────
function ReportPreview({ name, date, title, theme, data }: ReportProps) {
  return (
    <div
      style={{ background: theme.gradient, fontFamily: "'Courier New', Courier, monospace" }}
      className="w-full rounded-xl p-4 sm:p-6 text-white shadow-2xl"
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-5 sm:mb-7">
        <div className="flex items-center gap-2">
          <div className="p-1.5 sm:p-2 bg-white/20 rounded-full shrink-0">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-white/70 text-[10px] sm:text-xs uppercase tracking-widest">Responsável</p>
            <p className="text-white font-bold text-sm sm:text-base truncate">{name || 'Nome do Responsável'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-right">
          <div className="p-1.5 sm:p-2 bg-white/20 rounded-full shrink-0">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-white/70 text-[10px] sm:text-xs uppercase tracking-widest">Data</p>
            <p className="text-white font-bold text-sm sm:text-base">{formatDate(date)}</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-5 sm:mb-7">
        <div className="flex justify-center mb-2 sm:mb-3">
          <div className="p-2 sm:p-3 bg-white/20 rounded-full">
            <Radiation className="h-5 w-5 sm:h-7 sm:w-7" />
          </div>
        </div>
        <span className="inline-block bg-white/20 rounded-full px-3 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3">
          Documento Oficial
        </span>
        <h1 className="text-base sm:text-2xl font-black uppercase tracking-wider leading-tight mb-1">
          {title || 'Título do Relatório'}
        </h1>
        <p className="text-white/70 text-[10px] sm:text-xs uppercase tracking-widest">
          Relatório Oficial — NEEXT LTDA
        </p>
        <div className="h-px bg-white/20 mt-4" />
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map(({ key, title: sTitle, icon: Icon }) => {
          const items = data[key];
          return (
            <div key={key} className="bg-white/10 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest flex-1 min-w-0 truncate">
                  {sTitle}
                </span>
                <span className="text-[10px] bg-white/20 rounded-full px-2 py-0.5 font-mono shrink-0">{items.length}</span>
              </div>
              {items.length === 0
                ? <p className="text-white/40 text-[10px] sm:text-xs italic">Nenhum item registrado.</p>
                : <ul className="space-y-1">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                        <span className="text-white/50 font-mono shrink-0 text-[10px] mt-0.5">{String(i + 1).padStart(2, '0')}.</span>
                        <span className="break-words min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
              }
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3 border-t border-white/20 flex flex-col sm:flex-row gap-1 justify-between items-start sm:items-center">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-white/50 shrink-0" />
          <p className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-wider">
            Gerado automaticamente pelo Sistema Neext
          </p>
        </div>
        <p className="text-white/40 text-[9px] sm:text-[10px] font-mono">Sistema Avançado v2.0</p>
      </div>
    </div>
  );
}

// ─── Section input ────────────────────────────────────────────────────────────
function SectionInput({ section, items, onAdd, onRemove }: {
  section: typeof SECTIONS[number];
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
}) {
  const [val, setVal] = useState('');
  const Icon = section.icon;

  const commit = () => {
    const trimmed = val.trim();
    if (trimmed) { onAdd(trimmed); setVal(''); }
  };

  return (
    <div className="rounded-lg border border-primary/20 overflow-hidden" style={{ background: 'hsl(220 35% 8%)' }}>
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-primary/15" style={{ background: 'hsl(var(--primary) / 0.07)' }}>
        <Icon size={13} className="text-primary/70 shrink-0" />
        <span className="font-mono text-[11px] text-primary/80 uppercase tracking-[0.15em] font-bold flex-1 min-w-0 truncate">
          {section.title}
        </span>
        <span className="font-mono text-[10px] bg-primary/15 text-primary/70 rounded-full px-2 py-0.5 shrink-0">
          {items.length}
        </span>
      </div>

      {items.length > 0 && (
        <ul className="px-3 py-2 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-primary/40 shrink-0">{String(i + 1).padStart(2, '0')}.</span>
              <span className="flex-1 font-mono text-xs text-foreground/80 min-w-0 break-words">{item}</span>
              <button
                onClick={() => onRemove(i)}
                className="w-6 h-6 flex items-center justify-center rounded text-destructive/50 hover:text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-colors shrink-0"
              >
                <Trash2 size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 px-3 py-2 border-t border-primary/10">
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commit()}
          placeholder={section.placeholder}
          className="flex-1 min-w-0 bg-transparent font-mono text-xs text-foreground/70 placeholder:text-muted-foreground/40 outline-none"
        />
        <button
          onClick={commit}
          disabled={!val.trim()}
          className="w-7 h-7 rounded flex items-center justify-center border border-primary/30 text-primary hover:bg-primary/15 active:bg-primary/25 disabled:opacity-30 transition-all shrink-0"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function VaultRelatorios() {
  // This ref points to the hidden fixed-size card captured by html2canvas
  const captureRef = useRef<HTMLDivElement>(null);

  const [name,        setName]        = useState('');
  const [date,        setDate]        = useState('');
  const [title,       setTitle]       = useState('');
  const [themeId,     setThemeId]     = useState('vault-amber');
  const [data,        setData]        = useState<SectionData>(emptyData());
  const [downloading, setDownloading] = useState(false);
  const [themeOpen,   setThemeOpen]   = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const addItem    = (key: SectionKey, v: string) =>
    setData(d => ({ ...d, [key]: [...d[key], v] }));
  const removeItem = (key: SectionKey, i: number) =>
    setData(d => ({ ...d, [key]: d[key].filter((_, idx) => idx !== i) }));

  const download = async () => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        // Force capture at the element's full scrollWidth/Height
        width: captureRef.current.scrollWidth,
        height: captureRef.current.scrollHeight,
        windowWidth: captureRef.current.scrollWidth,
      });
      const link = document.createElement('a');
      link.download = `relatorio-cto-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Erro ao gerar imagem:', e);
    } finally {
      setDownloading(false);
    }
  };

  const reportProps: ReportProps = { name, date, title, theme, data };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Hidden fixed-size card for html2canvas — off screen, never visible */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          zIndex: -1,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <div ref={captureRef}>
          <ReportFixed {...reportProps} />
        </div>
      </div>

      {/* Page header */}
      <div
        className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{
          border: '1px solid hsl(var(--primary) / 0.35)',
          background: 'linear-gradient(135deg, hsl(220 35% 8% / 0.97) 0%, hsl(220 30% 11% / 0.92) 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <FileText size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase truncate">
              Gerador de Relatório de CTO
            </p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">
              PREENCHA OS CAMPOS E BAIXE COMO IMAGEM
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">

        {/* ── Form ── */}
        <div className="space-y-4">

          {/* Identity */}
          <div
            className="rounded-xl p-4 sm:p-5 space-y-4"
            style={{
              border: '1px solid hsl(var(--primary) / 0.2)',
              background: 'linear-gradient(135deg, hsl(220 35% 8%) 0%, hsl(220 30% 10%) 100%)',
            }}
          >
            <p className="font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2">
              <span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" />
            </p>

            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Título do Relatório
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Relatório Semanal — FBI"
                className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 sm:px-4 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                  Responsável
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                  Data do Relatório
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 outline-none focus:border-primary/50 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Theme */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Tema
              </label>
              <div className="relative">
                <button
                  onClick={() => setThemeOpen(o => !o)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-3 sm:px-4 py-2.5 font-mono text-sm text-foreground/90 flex items-center gap-3 hover:border-primary/40 transition-colors"
                >
                  <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: theme.gradient }} />
                  <span className="flex-1 text-left truncate">{theme.name}</span>
                  <ChevronDown size={14} className={`text-primary/50 shrink-0 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeOpen && (
                  <div
                    className="absolute top-full mt-1 w-full z-20 rounded-xl border border-primary/20 overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                    style={{ background: 'hsl(220 35% 8%)' }}
                  >
                    {THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm hover:bg-primary/10 transition-colors ${t.id === themeId ? 'text-primary' : 'text-foreground/70'}`}
                      >
                        <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: t.gradient }} />
                        <span className="truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sections */}
          <div
            className="rounded-xl p-4 sm:p-5 space-y-3"
            style={{
              border: '1px solid hsl(var(--primary) / 0.2)',
              background: 'linear-gradient(135deg, hsl(220 35% 8%) 0%, hsl(220 30% 10%) 100%)',
            }}
          >
            <p className="font-mono text-[10px] text-primary/60 tracking-[0.2em] uppercase flex items-center gap-2">
              <span className="h-px flex-1 bg-primary/15" />SEÇÕES<span className="h-px flex-1 bg-primary/15" />
            </p>
            {SECTIONS.map(section => (
              <SectionInput
                key={section.key}
                section={section}
                items={data[section.key]}
                onAdd={v => addItem(section.key, v)}
                onRemove={i => removeItem(section.key, i)}
              />
            ))}
          </div>

          {/* Download */}
          <button
            onClick={download}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-3.5 rounded-xl font-display font-bold tracking-widest text-xs sm:text-sm uppercase border transition-all active:scale-[0.98]"
            style={{
              background: 'hsl(var(--primary) / 0.15)',
              borderColor: 'hsl(var(--primary) / 0.5)',
              color: 'hsl(var(--primary))',
              boxShadow: '0 0 20px hsl(var(--primary) / 0.1)',
            }}
          >
            {downloading
              ? <><Loader2 size={15} className="animate-spin" /> Gerando Imagem...</>
              : <><Download size={15} /> Baixar Relatório como Imagem</>
            }
          </button>
        </div>

        {/* ── Preview (responsive) ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">
            — Pré-visualização —
          </p>
          <ReportPreview {...reportProps} />
        </div>
      </div>
    </div>
  );
}
