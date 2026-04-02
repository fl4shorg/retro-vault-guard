import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Tag, BookOpen, Loader2, Inbox, Check, User, X, Copy, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import type { CargoItem } from '@/hooks/useCargos';

interface VaultCargoListProps {
  section: string;
  cargos: CargoItem[];
  total: number;
  loading: boolean;
}

const CopyButton = ({ value, icon: Icon, label }: { value: string; icon: typeof Tag; label: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copiada!`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Erro ao copiar');
    }
  };
  if (!value) return null;
  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center w-7 h-7 rounded border border-primary/30 text-primary/70 hover:bg-primary/10 hover:border-primary/60 hover:text-primary active:scale-95 transition-all"
      title={`Copiar ${label}`}
    >
      {copied ? <Check size={11} /> : <Icon size={11} />}
    </button>
  );
};

const DescriptionPopup = ({ cargo, onClose }: { cargo: CargoItem; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cargo.descricao);
      setCopied(true);
      toast.success('Manual copiado!');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Erro ao copiar');
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="rounded-lg border border-border/60 w-full max-w-md overflow-hidden"
        style={{ background: 'hsl(220 30% 11% / 0.97)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-bold text-primary tracking-[0.15em]">
              MANUAL — {cargo.cargo}
            </h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>
          </div>
          <p className="font-body text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap mb-5">
            {cargo.descricao}
          </p>
          <button
            onClick={handleCopy}
            className="w-full py-2.5 rounded font-display font-bold text-xs tracking-[0.15em] transition-all flex items-center justify-center gap-2 vault-badge active:scale-[0.98]"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'COPIADO!' : 'COPIAR MANUAL'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DescriptionButton = ({ cargo }: { cargo: CargoItem }) => {
  const [open, setOpen] = useState(false);
  if (!cargo.descricao) return null;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-7 h-7 rounded border border-primary/30 text-primary/70 hover:bg-primary/10 hover:border-primary/60 hover:text-primary active:scale-95 transition-all"
        title="Ver manual"
      >
        <BookOpen size={11} />
      </button>
      <AnimatePresence>
        {open && <DescriptionPopup cargo={cargo} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

/* ── Horizontal connector between nodes ──────────────────────────────── */
const HorizontalConnector = () => (
  <div className="flex items-center shrink-0" style={{ width: 40 }}>
    <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-primary/30" />
    {/* Arrow tip */}
    <svg width="8" height="10" viewBox="0 0 8 10" fill="none" className="shrink-0 -ml-px">
      <path d="M1 1l6 4-6 4" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.6" />
    </svg>
  </div>
);

/* ── Single cargo node ────────────────────────────────────────────────── */
const CargoNode = ({ cargo, index }: { cargo: CargoItem; index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.88 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.06 }}
    className="group relative flex flex-col shrink-0"
    style={{ width: 160 }}
  >
    {/* Glow border card */}
    <div
      className="relative rounded-xl border border-border/40 hover:border-primary/50 transition-all duration-200 hover:shadow-[0_0_16px_hsl(var(--primary)/0.18)] overflow-hidden h-full flex flex-col"
      style={{ background: 'hsl(220 30% 9% / 0.95)' }}
    >
      {/* Top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent group-hover:via-primary transition-all duration-300" />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025] rounded-xl"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,hsl(var(--primary)) 2px,hsl(var(--primary)) 3px)' }}
      />

      <div className="flex flex-col gap-2 p-3 flex-1">
        {/* Position badge */}
        <div className="flex items-center justify-between">
          <div
            className="w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-[11px] border shrink-0"
            style={{
              background: 'hsl(var(--primary)/0.1)',
              borderColor: 'hsl(var(--primary)/0.35)',
              color: 'hsl(var(--primary))',
              textShadow: '0 0 8px hsl(var(--primary)/0.6)',
              boxShadow: '0 0 6px hsl(var(--primary)/0.12)',
            }}
          >
            {cargo.posicao || index + 1}
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <DescriptionButton cargo={cargo} />
            <CopyButton value={cargo.tag} icon={Tag} label="Tag" />
          </div>
        </div>

        {/* Cargo name */}
        <p className="font-body font-semibold text-foreground text-[13px] leading-snug">
          {cargo.cargo}
        </p>

        {/* Tag + creator */}
        <div className="mt-auto flex flex-col gap-1">
          {cargo.tag && (
            <span className="font-mono text-[10px] text-primary/55 bg-primary/5 border border-primary/10 rounded px-1.5 py-0.5 w-fit max-w-full truncate">
              {cargo.tag}
            </span>
          )}
          {cargo.criadoPor && (
            <span className="font-mono text-[10px] text-muted-foreground/45 flex items-center gap-1">
              <User size={9} className="shrink-0" />
              <span className="truncate">{cargo.criadoPor}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

/* ── Category row (horizontal tech tree) ─────────────────────────────── */
const TechTreeRow = ({ cat, items, index }: { cat: string; items: CargoItem[]; index: number }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex flex-col gap-3"
    >
      {/* Category label */}
      <button
        onClick={() => setCollapsed(v => !v)}
        className="group flex items-center gap-2.5 w-fit"
      >
        <div
          className="flex items-center gap-2.5 rounded-lg border border-primary/40 px-3.5 py-2 transition-all hover:border-primary/70 hover:shadow-[0_0_12px_hsl(var(--primary)/0.2)] relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)/0.15), hsl(45 100% 42%/0.08))' }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,hsl(var(--primary)) 2px,hsl(var(--primary)) 3px)' }}
          />
          <Shield size={13} className="text-primary shrink-0" />
          <span className="font-display font-bold text-primary text-xs tracking-[0.18em] uppercase whitespace-nowrap">
            {cat}
          </span>
          <span className="font-mono text-[10px] text-primary/40 ml-1">
            [{items.length}]
          </span>
          <div className="text-primary/40 group-hover:text-primary/70 transition-colors ml-1">
            {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </div>
        </div>
      </button>

      {/* Horizontal chain */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--primary)/0.2) transparent' }}
          >
            <div className="flex items-stretch gap-0 min-w-max pl-2">
              {items.map((cargo, i) => (
                <div key={cargo.id} className="flex items-center">
                  <CargoNode cargo={cargo} index={i} />
                  {i < items.length - 1 && <HorizontalConnector />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category separator */}
      <div className="h-px bg-gradient-to-r from-primary/20 via-border/30 to-transparent mt-1" />
    </motion.div>
  );
};

/* ── Main component ───────────────────────────────────────────────────── */
const VaultCargoList = ({ section, cargos, total, loading }: VaultCargoListProps) => {
  const isFBI = section === 'fbi';
  const title = isFBI ? 'Cargos FBI' : 'Cargos SKUR';
  const [searchTerm, setSearchTerm] = useState('');

  const grouped: Record<string, CargoItem[]> = {};
  cargos.forEach(c => {
    const cat = c.categoria || 'Outros';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(c);
  });
  Object.values(grouped).forEach(arr => arr.sort((a, b) => a.posicao - b.posicao));

  const filteredGroups = Object.entries(grouped)
    .map(([cat, items]) => {
      if (!searchTerm) return [cat, items] as [string, CargoItem[]];
      const filtered = items.filter(c =>
        c.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return [cat, filtered] as [string, CargoItem[]];
    })
    .filter(([, items]) => items.length > 0)
    .sort(([, itemsA], [, itemsB]) => {
      const posA = itemsA[0]?.categoriaPosicao ?? 999;
      const posB = itemsB[0]?.categoriaPosicao ?? 999;
      return posA - posB;
    });

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded flex items-center justify-center bg-primary/10 border border-primary/20">
            <Briefcase size={20} className="text-primary" />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-wider">
            {title}
          </h2>
        </div>
        <div className="vault-badge rounded px-4 py-1.5 text-[11px]">
          {total} CARGOS
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Buscar cargos..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-card/80 border border-border/60 rounded-lg px-4 py-3 pl-10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all font-body text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-muted-foreground">
          <Loader2 size={32} className="animate-spin mx-auto mb-3 text-primary" />
          <p className="font-mono text-sm">Carregando dados do terminal...</p>
        </div>
      ) : cargos.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Inbox size={40} className="mx-auto mb-3 opacity-50" />
          <p className="font-mono text-sm">Nenhum cargo registrado</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="font-mono text-sm">Nenhum resultado para "{searchTerm}"</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredGroups.map(([cat, items], index) => (
            <TechTreeRow key={cat} cat={cat} items={items} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VaultCargoList;
