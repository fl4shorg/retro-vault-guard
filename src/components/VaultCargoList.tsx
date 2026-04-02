import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Tag, BookOpen, Loader2, Inbox, Check, User, X, Copy, Shield } from 'lucide-react';
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

const TreeNode = ({ cargo, isLast, index }: { cargo: CargoItem; isLast: boolean; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-stretch relative"
    >
      {/* Vertical line segment + horizontal branch */}
      <div className="flex flex-col items-center relative shrink-0" style={{ width: 36 }}>
        {/* Top vertical segment */}
        <div
          className="w-px flex-1"
          style={{
            background: 'linear-gradient(to bottom, hsl(var(--primary)/0.5), hsl(var(--primary)/0.5))',
            minHeight: 20,
          }}
        />
        {/* Node dot */}
        <div
          className="w-2 h-2 rounded-full border border-primary shrink-0 z-10"
          style={{
            background: 'hsl(var(--primary)/0.3)',
            boxShadow: '0 0 6px hsl(var(--primary)/0.6)',
          }}
        />
        {/* Bottom vertical segment — hidden for last item */}
        {!isLast ? (
          <div
            className="w-px flex-1"
            style={{
              background: 'hsl(var(--primary)/0.5)',
              minHeight: 20,
            }}
          />
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {/* Horizontal branch line */}
      <div
        className="shrink-0 self-center"
        style={{
          width: 20,
          height: 1,
          background: 'hsl(var(--primary)/0.5)',
          boxShadow: '0 0 4px hsl(var(--primary)/0.4)',
        }}
      />

      {/* Cargo card */}
      <div className="flex-1 my-1.5 min-w-0">
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all group hover:border-primary/50 hover:bg-primary/[0.04]"
          style={{
            background: 'hsl(220 30% 9% / 0.8)',
            borderColor: 'hsl(var(--border)/0.5)',
          }}
        >
          {/* Position badge */}
          <span
            className="font-mono text-[10px] text-primary/70 shrink-0 w-5 text-center"
            style={{ textShadow: '0 0 8px hsl(var(--primary)/0.4)' }}
          >
            {String(cargo.posicao || index + 1).padStart(2, '0')}
          </span>

          {/* Name + creator */}
          <div className="flex-1 min-w-0">
            <span className="font-body text-sm font-semibold text-foreground/90 block truncate group-hover:text-foreground transition-colors">
              {cargo.cargo}
            </span>
            {cargo.criadoPor && (
              <span className="font-mono text-[10px] text-muted-foreground/50 flex items-center gap-1 mt-0.5">
                <User size={9} /> {cargo.criadoPor}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {cargo.descricao && <DescriptionButton cargo={cargo} />}
            <CopyButton value={cargo.tag} icon={Tag} label="Tag" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CategoryTree = ({ cat, items, catIndex }: { cat: string; items: CargoItem[]; catIndex: number }) => {
  return (
    <motion.div
      key={cat}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: catIndex * 0.08 }}
      className="relative"
    >
      {/* Category root node */}
      <div className="flex items-center gap-3 mb-1">
        {/* Root node icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-primary/40"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)/0.2), hsl(var(--primary)/0.05))',
            boxShadow: '0 0 12px hsl(var(--primary)/0.2)',
          }}
        >
          <Shield size={14} className="text-primary" />
        </div>

        {/* Category label */}
        <div
          className="flex-1 flex items-center justify-between px-4 py-2.5 rounded-lg border border-primary/30"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)/0.15), hsl(var(--primary)/0.05))',
            boxShadow: '0 0 16px hsl(var(--primary)/0.1)',
          }}
        >
          <span
            className="font-display text-sm font-bold text-primary tracking-[0.2em] uppercase"
            style={{ textShadow: '0 0 10px hsl(var(--primary)/0.5)' }}
          >
            {cat}
          </span>
          <span
            className="font-mono text-[10px] text-primary/60 border border-primary/20 rounded px-2 py-0.5"
            style={{ background: 'hsl(var(--primary)/0.08)' }}
          >
            {items.length} {items.length === 1 ? 'CARGO' : 'CARGOS'}
          </span>
        </div>
      </div>

      {/* Tree branches */}
      <div className="pl-4">
        {items.map((cargo, i) => (
          <TreeNode
            key={cargo.id}
            cargo={cargo}
            isLast={i === items.length - 1}
            index={i}
          />
        ))}
      </div>
    </motion.div>
  );
};

const VaultCargoList = ({ section, cargos, total, loading }: VaultCargoListProps) => {
  const isFBI = section === 'fbi';
  const SectionIcon = Briefcase;
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
            <SectionIcon size={20} className="text-primary" />
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
      <div className="relative mb-6">
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
        <div className="space-y-6">
          {filteredGroups.map(([cat, items], catIndex) => (
            <CategoryTree
              key={cat}
              cat={cat as string}
              items={items as CargoItem[]}
              catIndex={catIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VaultCargoList;
