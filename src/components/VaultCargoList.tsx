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
      className="flex items-center justify-center w-8 h-8 rounded border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 active:scale-95 transition-all"
      title={`Copiar ${label}`}
    >
      {copied ? <Check size={13} /> : <Icon size={13} />}
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
        className="flex items-center justify-center w-8 h-8 rounded border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/60 active:scale-95 transition-all"
        title="Ver manual"
      >
        <BookOpen size={13} />
      </button>
      <AnimatePresence>
        {open && <DescriptionPopup cargo={cargo} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

const TechTreeCategory = ({
  cat,
  items,
  index,
}: {
  cat: string;
  items: CargoItem[];
  index: number;
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      key={cat}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex flex-col items-center"
    >
      {/* Category root node */}
      <div className="relative w-full max-w-sm">
        <button
          onClick={() => setCollapsed(v => !v)}
          className="w-full group relative overflow-hidden rounded-xl border border-primary/50 px-5 py-3 flex items-center justify-between gap-3 transition-all hover:border-primary/80 hover:shadow-[0_0_18px_hsl(var(--primary)/0.25)] active:scale-[0.99]"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)/0.18), hsl(45 100% 42% / 0.12))',
          }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-5"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, hsl(var(--primary)) 3px, hsl(var(--primary)) 4px)' }}
          />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-primary/40 bg-primary/10 shrink-0">
              <Shield size={15} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="font-display font-bold text-primary text-sm tracking-widest uppercase leading-none">
                {cat}
              </p>
              <p className="font-mono text-[10px] text-primary/50 mt-0.5">
                {items.length} cargo{items.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="text-primary/50 group-hover:text-primary transition-colors shrink-0">
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </div>
        </button>
      </div>

      {/* Tree connector from category to first node */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col items-center w-full max-w-sm overflow-visible"
          >
            {items.map((cargo, i) => (
              <div key={cargo.id} className="flex flex-col items-center w-full">
                {/* Vertical connector line */}
                <div className="relative flex flex-col items-center" style={{ height: 28 }}>
                  <div className="w-px flex-1 bg-gradient-to-b from-primary/60 to-primary/30" />
                  {/* Diamond connector dot */}
                  <div
                    className="w-2.5 h-2.5 rotate-45 border border-primary/70 bg-background shrink-0"
                    style={{ boxShadow: '0 0 6px hsl(var(--primary)/0.4)' }}
                  />
                </div>

                {/* Cargo node */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="w-full group relative rounded-lg border border-border/40 hover:border-primary/40 transition-all hover:shadow-[0_0_12px_hsl(var(--primary)/0.12)] overflow-hidden"
                  style={{ background: 'hsl(220 30% 9% / 0.9)' }}
                >
                  {/* Left accent bar that pulses on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary/40 group-hover:bg-primary/80 transition-colors rounded-l-lg" />

                  <div className="flex items-center gap-3 pl-4 pr-3 py-3">
                    {/* Position badge */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-sm border"
                      style={{
                        background: 'hsl(var(--primary)/0.08)',
                        borderColor: 'hsl(var(--primary)/0.3)',
                        color: 'hsl(var(--primary))',
                        boxShadow: '0 0 8px hsl(var(--primary)/0.15)',
                        textShadow: '0 0 8px hsl(var(--primary)/0.5)',
                      }}
                    >
                      {cargo.posicao || i + 1}
                    </div>

                    {/* Cargo info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-foreground text-sm leading-snug truncate">
                        {cargo.cargo}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {cargo.tag && (
                          <span className="font-mono text-[10px] text-primary/60 bg-primary/5 border border-primary/15 rounded px-1.5 py-0.5">
                            {cargo.tag}
                          </span>
                        )}
                        {cargo.criadoPor && (
                          <span className="font-mono text-[10px] text-muted-foreground/50 flex items-center gap-1">
                            <User size={9} />
                            {cargo.criadoPor}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <DescriptionButton cargo={cargo} />
                      <CopyButton value={cargo.tag} icon={Tag} label="Tag" />
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

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
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {filteredGroups.map(([cat, items], index) => (
            <TechTreeCategory
              key={cat}
              cat={cat}
              items={items}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VaultCargoList;
