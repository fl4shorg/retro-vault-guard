import { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import {
  Users, TrendingUp, Hash, FileText, Plus, Trash2,
  Download, Calendar, User, Radiation, Shield,
  Loader2, Camera, UserCheck, Building2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Recruta {
  id: string;
  nome: string;
  data: string;
  descricao: string;
  foto: string | null; // base64 or URL
}

interface ReportData {
  responsavel: string;
  dataRelatorio: string;
  recrutamentos: Recruta[];
  subiuDeCargo: string[];
  totalGrupo: string;
  totalNYPD: string;
}

const emptyReport = (): ReportData => ({
  responsavel: '',
  dataRelatorio: '',
  recrutamentos: [],
  subiuDeCargo: [],
  totalGrupo: '',
  totalNYPD: '',
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function formatDate(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR');
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Fixed-size card (html2canvas capture) ────────────────────────────────────

function ReportFixed({ data }: { data: ReportData }) {
  const mono = "'Courier New', Courier, monospace";
  const gold = '#f5c842';
  const goldDim = 'rgba(245,200,66,0.55)';
  const bg = '#0d1117';
  const panel = 'rgba(245,200,66,0.06)';
  const border = 'rgba(245,200,66,0.22)';

  return (
    <div style={{
      width: 720,
      background: `linear-gradient(160deg, #0d1117 0%, #101820 50%, #0a0e14 100%)`,
      fontFamily: mono,
      borderRadius: 16,
      padding: '36px 40px',
      color: '#fff',
      border: `1.5px solid ${border}`,
      boxSizing: 'border-box',
    }}>

      {/* Accent bar top */}
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, marginBottom: 28, borderRadius: 2 }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: `rgba(245,200,66,0.12)`, border: `1.5px solid ${goldDim}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radiation size={20} color={gold} />
          </div>
          <div>
            <p style={{ fontSize: 9, color: goldDim, textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 2 }}>Sistema Operacional</p>
            <p style={{ fontSize: 18, fontWeight: 900, color: gold, textTransform: 'uppercase', letterSpacing: '0.12em' }}>CEO REGENTE</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 9, color: goldDim, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>Relatório Oficial</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Responsável</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{data.responsavel || '—'}</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: goldDim, marginTop: 4 }}>{formatDate(data.dataRelatorio)}</p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: border, marginBottom: 24 }} />

      {/* Member counts */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Membros no Grupo', value: data.totalGrupo || '—', icon: '👥' },
          { label: 'Membros NYPD', value: data.totalNYPD || '—', icon: '🏛️' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{
            flex: 1, background: panel, border: `1px solid ${border}`, borderRadius: 10, padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <div>
              <p style={{ fontSize: 9, color: goldDim, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 26, fontWeight: 900, color: gold }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Subiu de Cargo */}
      {data.subiuDeCargo.length > 0 && (
        <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <TrendingUp size={14} color={gold} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: gold }}>Subiu de Cargo</span>
            <span style={{ fontSize: 10, background: `rgba(245,200,66,0.15)`, borderRadius: 99, padding: '1px 8px', color: gold, marginLeft: 'auto' }}>
              {data.subiuDeCargo.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.subiuDeCargo.map((nome, i) => (
              <div key={i} style={{
                background: 'rgba(245,200,66,0.1)', border: `1px solid rgba(245,200,66,0.3)`,
                borderRadius: 6, padding: '4px 10px', fontSize: 12, color: '#fff',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ color: gold, fontSize: 10 }}>↑</span>
                {nome}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recrutamentos */}
      {data.recrutamentos.length > 0 && (
        <div style={{ background: panel, border: `1px solid ${border}`, borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Users size={14} color={gold} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: gold }}>Recrutamentos</span>
            <span style={{ fontSize: 10, background: `rgba(245,200,66,0.15)`, borderRadius: 99, padding: '1px 8px', color: gold, marginLeft: 'auto' }}>
              {data.recrutamentos.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.recrutamentos.map((r, i) => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                paddingBottom: i < data.recrutamentos.length - 1 ? 12 : 0,
                borderBottom: i < data.recrutamentos.length - 1 ? `1px solid rgba(245,200,66,0.1)` : 'none',
              }}>
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${goldDim}`, overflow: 'hidden',
                  background: 'rgba(245,200,66,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {r.foto
                    ? <img src={r.foto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : <User size={20} color={goldDim} />
                  }
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{r.nome || '—'}</span>
                    <span style={{ fontSize: 10, color: goldDim }}>{formatDate(r.data)}</span>
                  </div>
                  {r.descricao && (
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{r.descricao}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Shield size={11} color={goldDim} />
          <span style={{ fontSize: 9, color: goldDim, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Documento Oficial — NEEXT LTDA
          </span>
        </div>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: mono }}>CEO Regente — v1.0</span>
      </div>

      {/* Accent bar bottom */}
      <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${gold}, transparent)`, marginTop: 20, borderRadius: 2 }} />
    </div>
  );
}

// ─── Responsive preview ───────────────────────────────────────────────────────

function ReportPreview({ data }: { data: ReportData }) {
  return (
    <div className="w-full rounded-xl overflow-hidden text-white shadow-2xl"
      style={{
        background: 'linear-gradient(160deg, #0d1117 0%, #101820 50%, #0a0e14 100%)',
        border: '1.5px solid rgba(245,200,66,0.22)',
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      {/* Top bar */}
      <div className="h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #f5c842, transparent)' }} />

      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(245,200,66,0.12)', border: '1.5px solid rgba(245,200,66,0.4)' }}>
              <Radiation className="h-4 w-4" style={{ color: '#f5c842' }} />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(245,200,66,0.55)' }}>Sistema Operacional</p>
              <p className="text-sm font-black uppercase tracking-widest" style={{ color: '#f5c842' }}>CEO REGENTE</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'rgba(245,200,66,0.55)' }}>Responsável</p>
            <p className="text-sm font-bold">{data.responsavel || '—'}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(245,200,66,0.55)' }}>{formatDate(data.dataRelatorio)}</p>
          </div>
        </div>

        <div className="h-px mb-4" style={{ background: 'rgba(245,200,66,0.2)' }} />

        {/* Counts */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Membros no Grupo', value: data.totalGrupo || '—', Icon: Users },
            { label: 'Membros NYPD', value: data.totalNYPD || '—', Icon: Building2 },
          ].map(({ label, value, Icon }) => (
            <div key={label} className="rounded-lg p-3 flex items-center gap-2.5"
              style={{ background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.18)' }}>
              <Icon className="h-4 w-4 shrink-0" style={{ color: '#f5c842' }} />
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wider truncate" style={{ color: 'rgba(245,200,66,0.55)' }}>{label}</p>
                <p className="text-xl font-black" style={{ color: '#f5c842' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Subiu de Cargo */}
        {data.subiuDeCargo.length > 0 && (
          <div className="rounded-lg p-3 mb-4"
            style={{ background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.18)' }}>
            <div className="flex items-center gap-2 mb-2.5">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" style={{ color: '#f5c842' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest flex-1" style={{ color: '#f5c842' }}>Subiu de Cargo</span>
              <span className="text-[9px] rounded-full px-2 py-0.5" style={{ background: 'rgba(245,200,66,0.15)', color: '#f5c842' }}>
                {data.subiuDeCargo.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.subiuDeCargo.map((nome, i) => (
                <span key={i} className="text-[11px] rounded px-2 py-0.5 flex items-center gap-1"
                  style={{ background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.28)', color: '#fff' }}>
                  <span style={{ color: '#f5c842' }}>↑</span>{nome}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recrutamentos */}
        {data.recrutamentos.length > 0 && (
          <div className="rounded-lg p-3"
            style={{ background: 'rgba(245,200,66,0.06)', border: '1px solid rgba(245,200,66,0.18)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-3.5 w-3.5 shrink-0" style={{ color: '#f5c842' }} />
              <span className="text-[10px] font-bold uppercase tracking-widest flex-1" style={{ color: '#f5c842' }}>Recrutamentos</span>
              <span className="text-[9px] rounded-full px-2 py-0.5" style={{ background: 'rgba(245,200,66,0.15)', color: '#f5c842' }}>
                {data.recrutamentos.length}
              </span>
            </div>
            <div className="space-y-3">
              {data.recrutamentos.map((r, i) => (
                <div key={r.id} className={`flex items-start gap-2.5 ${i < data.recrutamentos.length - 1 ? 'pb-3 border-b' : ''}`}
                  style={{ borderColor: 'rgba(245,200,66,0.1)' }}>
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ border: '1.5px solid rgba(245,200,66,0.4)', background: 'rgba(245,200,66,0.08)' }}>
                    {r.foto
                      ? <img src={r.foto} className="w-full h-full object-cover" alt="" />
                      : <User className="h-4 w-4" style={{ color: 'rgba(245,200,66,0.5)' }} />
                    }
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold">{r.nome || '—'}</span>
                      <span className="text-[10px]" style={{ color: 'rgba(245,200,66,0.55)' }}>{formatDate(r.data)}</span>
                    </div>
                    {r.descricao && (
                      <p className="text-xs mt-0.5 break-words" style={{ color: 'rgba(255,255,255,0.55)' }}>{r.descricao}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.recrutamentos.length === 0 && data.subiuDeCargo.length === 0 && !data.totalGrupo && !data.totalNYPD && (
          <p className="text-center text-xs py-4" style={{ color: 'rgba(245,200,66,0.3)' }}>
            Preencha os campos para visualizar o relatório...
          </p>
        )}
      </div>

      <div className="h-0.5" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,200,66,0.5), transparent)' }} />
    </div>
  );
}

// ─── Recruit Card (form) ──────────────────────────────────────────────────────

function RecrutaCard({
  recruta, onChange, onRemove,
}: {
  recruta: Recruta;
  onChange: (updated: Recruta) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const b64 = await readFileAsBase64(file);
      onChange({ ...recruta, foto: b64 });
    } catch {
      /* ignore */
    }
  }, [recruta, onChange]);

  const inputCls = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2 font-mono text-xs text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="rounded-xl p-3 sm:p-4 space-y-3 relative"
      style={{ background: 'hsl(220 35% 8%)', border: '1px solid hsl(var(--primary) / 0.2)' }}>

      {/* Remove */}
      <button onClick={onRemove}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors">
        <Trash2 size={12} />
      </button>

      {/* Photo + name row */}
      <div className="flex items-start gap-3">
        {/* Avatar picker */}
        <button onClick={() => fileRef.current?.click()}
          className="w-14 h-14 rounded-full shrink-0 overflow-hidden flex items-center justify-center transition-all hover:opacity-80 relative group"
          style={{ border: '1.5px solid hsl(var(--primary) / 0.4)', background: 'hsl(var(--primary) / 0.08)' }}>
          {recruta.foto
            ? <img src={recruta.foto} className="w-full h-full object-cover" alt="" />
            : <Camera size={18} className="text-primary/50 group-hover:text-primary transition-colors" />
          }
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
            <Camera size={14} className="text-white" />
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

        {/* Name + date */}
        <div className="flex-1 min-w-0 space-y-2">
          <input
            value={recruta.nome}
            onChange={e => onChange({ ...recruta, nome: e.target.value })}
            placeholder="Nome do recrutado"
            className={inputCls}
          />
          <input
            type="date"
            value={recruta.data}
            onChange={e => onChange({ ...recruta, data: e.target.value })}
            className={`${inputCls} [color-scheme:dark]`}
          />
        </div>
      </div>

      {/* Description */}
      <textarea
        value={recruta.descricao}
        onChange={e => onChange({ ...recruta, descricao: e.target.value })}
        placeholder="Descrição (opcional)..."
        rows={2}
        className={`${inputCls} resize-none`}
      />
    </div>
  );
}

// ─── Simple list section ──────────────────────────────────────────────────────

function ListSection({
  icon: Icon, label, items, placeholder, onAdd, onRemove,
}: {
  icon: React.ElementType;
  label: string;
  items: string[];
  placeholder: string;
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
}) {
  const [val, setVal] = useState('');
  const commit = () => {
    const t = val.trim();
    if (t) { onAdd(t); setVal(''); }
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid hsl(var(--primary) / 0.2)', background: 'hsl(220 35% 8%)' }}>
      <div className="flex items-center gap-2 px-3 py-2.5 border-b"
        style={{ borderColor: 'hsl(var(--primary) / 0.15)', background: 'hsl(var(--primary) / 0.07)' }}>
        <Icon size={13} className="text-primary/70 shrink-0" />
        <span className="font-mono text-[11px] text-primary/80 uppercase tracking-[0.15em] font-bold flex-1">{label}</span>
        <span className="font-mono text-[10px] rounded-full px-2 py-0.5 shrink-0"
          style={{ background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}>
          {items.length}
        </span>
      </div>

      {items.length > 0 && (
        <ul className="px-3 py-2 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-primary/40 shrink-0">{String(i + 1).padStart(2, '0')}.</span>
              <span className="flex-1 font-mono text-xs text-foreground/80 min-w-0 break-words">{item}</span>
              <button onClick={() => onRemove(i)}
                className="w-6 h-6 flex items-center justify-center rounded text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0">
                <Trash2 size={11} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2 px-3 py-2 border-t" style={{ borderColor: 'hsl(var(--primary) / 0.1)' }}>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commit()}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent font-mono text-xs text-foreground/70 placeholder:text-muted-foreground/40 outline-none"
        />
        <button onClick={commit} disabled={!val.trim()}
          className="w-7 h-7 rounded flex items-center justify-center border border-primary/30 text-primary hover:bg-primary/15 active:bg-primary/25 disabled:opacity-30 transition-all shrink-0">
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function VaultRelatorios() {
  const captureRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ReportData>(emptyReport());
  const [downloading, setDownloading] = useState(false);

  // Recruta helpers
  const addRecruta = () =>
    setData(d => ({ ...d, recrutamentos: [...d.recrutamentos, { id: uid(), nome: '', data: '', descricao: '', foto: null }] }));
  const updateRecruta = (id: string, updated: Recruta) =>
    setData(d => ({ ...d, recrutamentos: d.recrutamentos.map(r => r.id === id ? updated : r) }));
  const removeRecruta = (id: string) =>
    setData(d => ({ ...d, recrutamentos: d.recrutamentos.filter(r => r.id !== id) }));

  // Subiu helpers
  const addSubiu = (v: string) => setData(d => ({ ...d, subiuDeCargo: [...d.subiuDeCargo, v] }));
  const removeSubiu = (i: number) => setData(d => ({ ...d, subiuDeCargo: d.subiuDeCargo.filter((_, idx) => idx !== i) }));

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

  const inputCls = "w-full bg-black/30 border border-primary/20 rounded-lg px-3 py-2.5 font-mono text-sm text-foreground/90 placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Hidden fixed card for html2canvas */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, pointerEvents: 'none' }} aria-hidden="true">
        <div ref={captureRef}>
          <ReportFixed data={data} />
        </div>
      </div>

      {/* Page header */}
      <div className="vault-scanline rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        style={{ border: '1px solid hsl(var(--primary) / 0.35)', background: 'linear-gradient(135deg, hsl(220 35% 8% / 0.97) 0%, hsl(220 30% 11% / 0.92) 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <FileText size={15} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-xs sm:text-sm font-bold tracking-widest text-primary vault-text-glow uppercase truncate">
              Gerador de Relatório — CEO Regente
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

          {/* Identificação */}
          <div className="rounded-xl p-4 sm:p-5 space-y-3"
            style={{ border: '1px solid hsl(var(--primary) / 0.2)', background: 'linear-gradient(135deg, hsl(220 35% 8%) 0%, hsl(220 30% 10%) 100%)' }}>
            <p className="font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2">
              <span className="h-px flex-1 bg-primary/15" />IDENTIFICAÇÃO<span className="h-px flex-1 bg-primary/15" />
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Responsável</label>
                <input
                  value={data.responsavel}
                  onChange={e => setData(d => ({ ...d, responsavel: e.target.value }))}
                  placeholder="Seu nome"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5">Data do Relatório</label>
                <input
                  type="date"
                  value={data.dataRelatorio}
                  onChange={e => setData(d => ({ ...d, dataRelatorio: e.target.value }))}
                  className={`${inputCls} [color-scheme:dark]`}
                />
              </div>
            </div>
          </div>

          {/* Contagens */}
          <div className="rounded-xl p-4 sm:p-5 space-y-3"
            style={{ border: '1px solid hsl(var(--primary) / 0.2)', background: 'linear-gradient(135deg, hsl(220 35% 8%) 0%, hsl(220 30% 10%) 100%)' }}>
            <p className="font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2">
              <span className="h-px flex-1 bg-primary/15" />CONTAGENS<span className="h-px flex-1 bg-primary/15" />
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5 flex items-center gap-1.5">
                  <Users size={10} className="shrink-0" />Membros no Grupo
                </label>
                <input
                  type="number"
                  min={0}
                  value={data.totalGrupo}
                  onChange={e => setData(d => ({ ...d, totalGrupo: e.target.value }))}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-primary/60 tracking-widest uppercase block mb-1.5 flex items-center gap-1.5">
                  <Building2 size={10} className="shrink-0" />Membros NYPD
                </label>
                <input
                  type="number"
                  min={0}
                  value={data.totalNYPD}
                  onChange={e => setData(d => ({ ...d, totalNYPD: e.target.value }))}
                  placeholder="0"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Subiu de cargo */}
          <div className="rounded-xl p-4 sm:p-5 space-y-3"
            style={{ border: '1px solid hsl(var(--primary) / 0.2)', background: 'linear-gradient(135deg, hsl(220 35% 8%) 0%, hsl(220 30% 10%) 100%)' }}>
            <p className="font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2">
              <span className="h-px flex-1 bg-primary/15" />SUBIU DE CARGO<span className="h-px flex-1 bg-primary/15" />
            </p>
            <ListSection
              icon={TrendingUp}
              label="Promoções"
              items={data.subiuDeCargo}
              placeholder="Nome do promovido..."
              onAdd={addSubiu}
              onRemove={removeSubiu}
            />
          </div>

          {/* Recrutamentos */}
          <div className="rounded-xl p-4 sm:p-5 space-y-3"
            style={{ border: '1px solid hsl(var(--primary) / 0.2)', background: 'linear-gradient(135deg, hsl(220 35% 8%) 0%, hsl(220 30% 10%) 100%)' }}>
            <p className="font-mono text-[10px] text-primary/60 tracking-[0.25em] uppercase flex items-center gap-2">
              <span className="h-px flex-1 bg-primary/15" />RECRUTAMENTOS<span className="h-px flex-1 bg-primary/15" />
            </p>

            {data.recrutamentos.length === 0 && (
              <p className="font-mono text-[11px] text-muted-foreground/50 text-center py-2">
                Nenhum recrutamento adicionado.
              </p>
            )}

            <div className="space-y-3">
              {data.recrutamentos.map(r => (
                <RecrutaCard
                  key={r.id}
                  recruta={r}
                  onChange={updated => updateRecruta(r.id, updated)}
                  onRemove={() => removeRecruta(r.id)}
                />
              ))}
            </div>

            <button
              onClick={addRecruta}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-mono text-xs uppercase tracking-widest border border-dashed border-primary/30 text-primary/60 hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all"
            >
              <UserCheck size={13} />
              Adicionar Recrutado
            </button>
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
              ? <><Loader2 size={15} className="animate-spin" />Gerando Imagem...</>
              : <><Download size={15} />Baixar Relatório como Imagem</>
            }
          </button>
        </div>

        {/* ── Preview ── */}
        <div>
          <p className="font-mono text-[10px] text-primary/40 tracking-[0.25em] uppercase mb-3">— Pré-visualização —</p>
          <ReportPreview data={data} />
        </div>
      </div>
    </div>
  );
}
