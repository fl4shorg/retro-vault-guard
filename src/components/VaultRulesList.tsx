import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ChevronDown, ChevronUp, Download, X,
  FileText, ImageIcon, Loader2, AlertTriangle, Radio, Hash
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'https://www.api.neext.online/api/regras';

interface Rule {
  id: string;
  nome: string;
  descricao: string;
  paragrafos: string[];
  artigdcards: string[];
}

function parseRules(data: Record<string, any>): Rule[] {
  if (!data || typeof data !== 'object') return [];
  return Object.entries(data).map(([id, item]: [string, any]) => ({
    id,
    nome: item.nome || 'Sem título',
    descricao: item.descricao || '',
    paragrafos: Array.isArray(item.paragrafos) ? item.paragrafos : [],
    artigdcards: Array.isArray(item.artigdcards) ? item.artigdcards : [],
  }));
}

/* ─── Cards Modal ─────────────────────────────────────────────────────── */

function CardsModal({ rule, onClose }: { rule: Rule; onClose: () => void }) {
  const handleDownload = async (url: string, index: number) => {
    try {
      const res = await fetch(url, { mode: 'cors' });
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `artigcard-${rule.nome.replace(/\s+/g, '-').toLowerCase()}-${index + 1}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(`Card ${index + 1} baixado`);
    } catch {
      window.open(url, '_blank');
      toast.info('Abrindo card em nova aba');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-2xl rounded-xl overflow-hidden border border-border/50"
        style={{ background: 'hsl(220 35% 9% / 0.98)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <ImageIcon size={15} className="text-primary" />
            </div>
            <div>
              <p className="font-display text-xs font-bold text-primary tracking-[0.2em] vault-text-glow">
                ARTIGCARDS
              </p>
              <p className="font-mono text-[9px] text-muted-foreground tracking-widest truncate max-w-[280px]">
                {rule.nome}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border/40 hover:border-destructive/50 hover:text-destructive text-muted-foreground transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Cards grid */}
        <div className="p-6">
          <p className="font-mono text-[10px] text-primary/60 tracking-[0.3em] mb-4 flex items-center gap-2">
            <span className="h-px flex-1 bg-primary/20" />
            {rule.artigdcards.length} CARD{rule.artigdcards.length !== 1 ? 'S' : ''} DISPONÍVEIS
            <span className="h-px flex-1 bg-primary/20" />
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rule.artigdcards.map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="group relative rounded-lg overflow-hidden border border-border/40 hover:border-primary/40 transition-all"
                style={{ background: 'hsl(220 30% 12% / 0.8)' }}
              >
                <img
                  src={url}
                  alt={`ArtigCard ${i + 1}`}
                  className="w-full object-contain max-h-52"
                  loading="lazy"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <p className="font-mono text-[10px] text-primary/80 tracking-widest">
                    CARD {String(i + 1).padStart(2, '0')}
                  </p>
                  <button
                    onClick={() => handleDownload(url, i)}
                    data-testid={`btn-download-card-${i}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded vault-badge border border-primary/50 text-[11px] font-mono font-bold tracking-widest text-background hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Download size={12} />
                    BAIXAR
                  </button>
                </div>

                {/* Card index badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 border border-primary/30 text-primary">
                  #{String(i + 1).padStart(2, '0')}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </motion.div>
    </motion.div>
  );
}

/* ─── Rule Card ───────────────────────────────────────────────────────── */

function RuleCard({ rule, index }: { rule: Rule; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showCards, setShowCards] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07 }}
        className="rounded-xl overflow-hidden border border-border/40 hover:border-primary/30 transition-colors"
        style={{ background: 'hsl(220 30% 12% / 0.7)' }}
      >
        {/* Top accent line */}
        <div className="h-0.5 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />

        {/* Rule header */}
        <div className="px-5 py-4">
          {/* Rule identifier row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                <BookOpen size={15} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[9px] text-primary/50 tracking-[0.3em] mb-0.5">
                  // ARTIGO {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="font-display text-sm font-bold text-foreground tracking-wider leading-tight vault-text-glow">
                  {rule.nome}
                </h3>
              </div>
            </div>

            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(v => !v)}
              data-testid={`btn-expand-rule-${rule.id}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-border/40 hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all shrink-0 mt-0.5"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Descrição */}
          <p className="font-body text-sm text-muted-foreground leading-relaxed pl-[44px]">
            {rule.descricao}
          </p>

          {/* Footer row: paragraph count + cards button */}
          <div className="flex items-center gap-3 mt-4 pl-[44px] flex-wrap">
            {rule.paragrafos.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-border/40 bg-muted/20">
                <FileText size={11} className="text-primary/60" />
                <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
                  {rule.paragrafos.length} PARÁGRAFO{rule.paragrafos.length !== 1 ? 'S' : ''}
                </span>
              </div>
            )}

            {rule.artigdcards.length > 0 && (
              <button
                onClick={() => setShowCards(true)}
                data-testid={`btn-cards-rule-${rule.id}`}
                className="flex items-center gap-1.5 px-3 py-1 rounded border border-primary/30 bg-primary/8 hover:bg-primary/15 hover:border-primary/50 text-primary transition-all active:scale-95"
              >
                <ImageIcon size={11} />
                <span className="font-mono text-[10px] font-bold tracking-widest">
                  {rule.artigdcards.length} ARTIGCARD{rule.artigdcards.length !== 1 ? 'S' : ''}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable paragraphs */}
        <AnimatePresence>
          {expanded && rule.paragrafos.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border/30 px-5 py-4 space-y-4"
                style={{ background: 'hsl(220 35% 10% / 0.6)' }}>
                <p className="font-mono text-[10px] text-primary/50 tracking-[0.3em] flex items-center gap-2">
                  <span className="h-px flex-1 bg-primary/15" />
                  PARÁGRAFOS
                  <span className="h-px flex-1 bg-primary/15" />
                </p>

                {rule.paragrafos.map((para, pi) => (
                  <motion.div
                    key={pi}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: pi * 0.05 }}
                    className="flex gap-3"
                  >
                    {/* Paragraph number badge */}
                    <div className="shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded flex items-center justify-center bg-primary/10 border border-primary/25">
                        <Hash size={10} className="text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[9px] text-primary/50 tracking-widest mb-1">
                        PARÁGRAFO {pi + 1}
                      </p>
                      <p className="font-body text-sm text-foreground/85 leading-relaxed">
                        {para}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cards modal */}
      <AnimatePresence>
        {showCards && <CardsModal rule={rule} onClose={() => setShowCards(false)} />}
      </AnimatePresence>
    </>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────── */

export default function VaultRulesList() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRules(parseRules(data));
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded flex items-center justify-center bg-primary/10 border border-primary/20">
            <BookOpen size={20} className="text-primary" />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-wider">
            Regras
          </h2>
        </div>
        {!loading && !error && (
          <div className="vault-badge rounded px-4 py-1.5 text-[11px] flex items-center gap-2">
            <Radio size={10} className="animate-pulse" />
            {rules.length} ARTIG{rules.length !== 1 ? 'OS' : 'O'}
          </div>
        )}
      </div>

      {/* Warning banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-primary/20 p-4 mb-6 flex items-center gap-3"
        style={{ background: 'hsl(45 100% 55% / 0.04)' }}
      >
        <AlertTriangle size={16} className="text-primary/70 shrink-0" />
        <p className="font-mono text-[11px] text-primary/60 tracking-wide">
          REGULAMENTO OFICIAL VAULT-TEC — LEIA COM ATENÇÃO ANTES DE OPERAR
        </p>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 size={30} className="animate-spin text-primary mx-auto mb-3" />
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              CARREGANDO REGULAMENTO...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <AlertTriangle size={30} className="text-destructive mx-auto mb-3" />
            <p className="font-mono text-xs text-muted-foreground tracking-widest mb-4">
              FALHA AO CARREGAR REGULAMENTO
            </p>
            <button
              onClick={fetchRules}
              className="vault-badge rounded px-5 py-2 text-[11px] font-bold tracking-widest hover:opacity-90 active:scale-95 transition-all"
            >
              TENTAR NOVAMENTE
            </button>
          </div>
        </div>
      ) : rules.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <BookOpen size={30} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              NENHUMA REGRA ENCONTRADA
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule, i) => (
            <RuleCard key={rule.id} rule={rule} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
