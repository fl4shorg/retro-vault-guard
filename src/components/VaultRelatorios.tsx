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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
}

// ─── Report Preview (captured by html2canvas) ─────────────────────────────────
interface PreviewProps {
  name: string; date: string; title: string;
  theme: typeof THEMES[number];
  data: SectionData;
  ref?: React.Ref<HTMLDivElement>;
}

function ReportPreview({ name, date, title, theme, data }: PreviewProps & { divRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div
      style={{
        background: `${theme.gradient}`,
        fontFamily: "'Courier New', Courier, monospace",
        minWidth: 640,
      }}
      className="w-full rounded-xl p-8 text-white shadow-2xl"
    >
      {/* ── Header row ── */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs uppercase tracking-widest">Responsável</p>
            <p className="text-white font-bold text-base">{name || 'Nome do Responsável'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs uppercase tracking-widest">Data do Relatório</p>
            <p className="text-white font-bold text-base">{formatDate(date)}</p>
          </div>
        </div>
      </div>

      {/* ── Title block ── */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-3 bg-white/20 rounded-full">
            <Radiation className="h-7 w-7 text-white" />
          </div>
        </div>
        <div className="inline-block bg-white/20 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-3">
          Documento Oficial
        </div>
        <h1 className="text-2xl font-black uppercase tracking-wider mb-1">
          {title || 'Título do Relatório'}
        </h1>
        <p className="text-white/70 text-xs uppercase tracking-[0.3em]">Relatório Oficial — NEEXT LTDA</p>
        <div className="h-px bg-white/20 mt-5" />
      </div>

      {/* ── Sections ── */}
      <div className="space-y-4">
        {SECTIONS.map(({ key, title: sTitle, icon: Icon }) => {
          const items = data[key];
          return (
            <div key={key} className="bg-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-white/80" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/90">{sTitle}</span>
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 font-mono">{items.length}</span>
              </div>
              {items.length === 0 ? (
                <p className="text-white/40 text-xs italic">Nenhum item registrado.</p>
              ) : (
                <ul className="space-y-1">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/90">
                      <span className="text-white/50 font-mono shrink-0 mt-0.5 text-xs">{String(i + 1).padStart(2, '0')}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="mt-8 pt-4 border-t border-white/20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="h-3 w-3 text-white/50" />
          <p className="text-white/50 text-[10px] uppercase tracking-widest">
            Relatório gerado automaticamente pelo Sistema Neext
          </p>
        </div>
        <p className="text-white/40 text-[10px] font-mono">Sistema Avançado v2.0</p>
      </div>
    </div>
  );
}

// ─── Section input row ────────────────────────────────────────────────────────
function SectionInput({
  section, items, onAdd, onRemove,
}: {
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
    <div
      className="rounded-lg border border-primary/20 overflow-hidden"
      style={{ background: 'hsl(220 35% 8%)' }}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-primary/15"
        style={{ background: 'hsl(var(--primary) / 0.07)' }}>
        <Icon size={14} className="text-primary/70" />
        <span className="font-mono text-[11px] text-primary/80 uppercase tracking-[0.2em] font-bold">
          {section.title}
        </span>
        <span className="ml-auto font-mono text-[10px] bg-primary/15 text-primary/70 rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <ul className="px-3 py-2 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2 group">
              <span className="font-mono text-[10px] text-primary/40 shrink-0">{String(i + 1).padStart(2, '0')}.</span>
              <span className="flex-1 font-mono text-xs text-foreground/80 truncate">{item}</span>
              <button
                onClick={() => onRemove(i)}
                className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded text-destructive/60 hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add input */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-primary/10">
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commit()}
          placeholder={section.placeholder}
          className="flex-1 bg-transparent font-mono text-xs text-foreground/70 placeholder:text-muted-foreground/40 outline-none"
        />
        <button
          onClick={commit}
          disabled={!val.trim()}
          className="w-6 h-6 rounded flex items-center justify-center border border-primary/30 text-primary hover:bg-primary/15 disabled:opacity-30 transition-all"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VaultRelatorios() {
  const reportRef = useRef<HTMLDivElement>(null);

  const [name,  setName]  = useState('');
  const [date,  setDate]  = useState('');
  const [title, setTitle] = useState('');
  const [themeId, setThemeId] = useState('vault-amber');
  const [data,  setData]  = useState<SectionData>(emptyData());
  const [downloading, setDownloading] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const theme = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  const addItem    = (key: SectionKey, val: string) =>
    setData(d => ({ ...d, [key]: [...d[key], val] }));
  const removeItem = (key: SectionKey, i: number) =>
    setData(d => ({ ...d, [key]: d[key].filter((_, idx) => idx !== i) }));

  const download = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
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

  return (
    <div className="space-y-6">

      {/* ── Page title ── */}
      <div
        className="vault-scanline rounded-xl px-5 py-4"
        style={{
          border: '1px solid hsl(var(--primary) / 0.35)',
          background: 'linear-gradient(135deg, hsl(220 35% 8% / 0.97) 0%, hsl(220 30% 11% / 0.92) 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <FileText size={16} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-sm font-bold tracking-widest text-primary vault-text-glow uppercase">
              Gerador de Relatório de CTO
            </p>
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">
              PREENCHA OS CAMPOS E BAIXE COMO IMAGEM
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── LEFT: form ── */}
        <div className="space-y-4">

          {/* Basic fields */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{
              border: '1px solid hsl(var(--primary) / 0.2)',
              background: 'linear-gradient(135deg, hsl(220 35% 8%) 0%, hsl(220 30% 10%) 100%)',
            }}
          >
            <p className="font-mono text-[10px] text-primary/60 tracking-[0.3em] uppercase flex items-center gap-2">
              <span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" />
            </p>

            {/* Title */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Título do Relatório
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Relatório Semanal — FBI"
                className="w-full bg-black/30 border border-primary/20 rounded-lg px-4 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Name + Date */}
            <div className="grid grid-cols-2 gap-3">
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

            {/* Theme selector */}
            <div>
              <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">
                Escolha o Tema
              </label>
              <div className="relative">
                <button
                  onClick={() => setThemeOpen(o => !o)}
                  className="w-full bg-black/30 border border-primary/20 rounded-lg px-4 py-2.5 font-mono text-sm text-foreground/90 flex items-center gap-3 hover:border-primary/40 transition-colors"
                >
                  <span
                    className="w-5 h-5 rounded-full shrink-0 border border-white/20"
                    style={{ background: theme.gradient }}
                  />
                  <span className="flex-1 text-left">{theme.name}</span>
                  <ChevronDown size={14} className={`text-primary/50 transition-transform ${themeOpen ? 'rotate-180' : ''}`} />
                </button>
                {themeOpen && (
                  <div
                    className="absolute top-full mt-1 w-full z-10 rounded-xl border border-primary/20 overflow-hidden shadow-2xl"
                    style={{ background: 'hsl(220 35% 8%)' }}
                  >
                    {THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setThemeId(t.id); setThemeOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm hover:bg-primary/10 transition-colors ${t.id === themeId ? 'text-primary' : 'text-foreground/70'}`}
                      >
                        <span className="w-5 h-5 rounded-full shrink-0 border border-white/20" style={{ background: t.gradient }} />
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section inputs */}
          <div
            className="rounded-xl p-5 space-y-3"
            style={{
              border: '1px solid hsl(var(--primary) / 0.2)',
              background: 'linear-gradient(135deg, hsl(220 35% 8%) 0%, hsl(220 30% 10%) 100%)',
            }}
          >
            <p className="font-mono text-[10px] text-primary/60 tracking-[0.3em] uppercase flex items-center gap-2">
              <span className="h-px flex-1 bg-primary/15" />SEÇÕES DO RELATÓRIO<span className="h-px flex-1 bg-primary/15" />
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

          {/* Download button */}
          <button
            onClick={download}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-display font-bold tracking-widest text-sm uppercase border transition-all"
            style={{
              background: 'hsl(var(--primary) / 0.15)',
              borderColor: 'hsl(var(--primary) / 0.5)',
              color: 'hsl(var(--primary))',
              boxShadow: '0 0 20px hsl(var(--primary) / 0.1)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--primary) / 0.25)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'hsl(var(--primary) / 0.15)')}
          >
            {downloading
              ? <><Loader2 size={16} className="animate-spin" /> Gerando Imagem...</>
              : <><Download size={16} /> Baixar Relatório como Imagem</>
            }
          </button>
        </div>

        {/* ── RIGHT: report preview ── */}
        <div className="overflow-auto">
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.3em] uppercase mb-3">
            — Pré-visualização —
          </p>
          <div ref={reportRef}>
            <ReportPreview
              divRef={reportRef as React.RefObject<HTMLDivElement>}
              name={name} date={date} title={title}
              theme={theme} data={data}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
