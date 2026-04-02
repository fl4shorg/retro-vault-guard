import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gavel, ChevronDown, ChevronUp, Download, X,
  FileText, ImageIcon, Loader2, AlertTriangle, Hash,
  Search, Copy, Check
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

function buildRuleText(rule: Rule): string {
  const lines: string[] = [rule.nome];
  if (rule.descricao) lines.push(`\n${rule.descricao}`);
  if (rule.paragrafos.length > 0) {
    lines.push('');
    rule.paragrafos.forEach((p, i) => lines.push(`Parágrafo ${i + 1}: ${p}`));
  }
  return lines.join('\n');
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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-xl overflow-hidden border border-border/50 flex flex-col max-h-[90vh]"
        style={{ background: 'hsl(220 35% 9% / 0.99)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent shrink-0" />

        <div className="flex justify-center pt-2 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-border/60" />
        </div>

        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <ImageIcon size={15} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-display text-xs font-bold text-primary tracking-[0.2em]">
                ARTIGCARDS
              </p>
              <p className="font-mono text-[9px] text-muted-foreground tracking-widest truncate max-w-[200px] sm:max-w-[320px]">
                {rule.nome}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border/40 hover:border-destructive/50 hover:text-destructive text-muted-foreground transition-all shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6">
          <p className="font-mono text-[10px] text-primary/60 tracking-[0.3em] mb-4 flex items-center gap-2">
            <span className="h-px flex-1 bg-primary/20" />
            {rule.artigdcards.length} CARD{rule.artigdcards.length !== 1 ? 'S' : ''} DISPONÍVEIS
            <span className="h-px flex-1 bg-primary/20" />
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rule.artigdcards.map((url, i) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden border border-border/40 hover:border-primary/40 transition-colors"
                style={{ background: 'hsl(220 30% 12% / 0.8)' }}
              >
                <div className="relative group">
                  <img
                    src={url}
                    alt={`ArtigCard ${i + 1}`}
                    className="w-full object-contain max-h-52"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex flex-col items-center justify-center gap-2">
                    <p className="font-mono text-[10px] text-primary/80 tracking-widest">
                      CARD {String(i + 1).padStart(2, '0')}
                    </p>
                    <button
                      onClick={() => handleDownload(url, i)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded vault-badge border border-primary/50 text-[11px] font-mono font-bold tracking-widest text-background hover:opacity-90 active:scale-95 transition-all"
                    >
                      <Download size={12} />
                      BAIXAR
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 border border-primary/30 text-primary">
                    #{String(i + 1).padStart(2, '0')}
                  </div>
                </div>

                <div className="sm:hidden p-2 border-t border-border/30">
                  <button
                    onClick={() => handleDownload(url, i)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded vault-badge border border-primary/40 text-[11px] font-mono font-bold tracking-widest text-background active:scale-95 transition-all"
                  >
                    <Download size={12} />
                    BAIXAR CARD {String(i + 1).padStart(2, '0')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent shrink-0" />
      </motion.div>
    </motion.div>
  );
}

/* ─── Rule Card ───────────────────────────────────────────────────────── */

const RuleCard = memo(function RuleCard({ rule, index }: { rule: Rule; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildRuleText(rule));
      setCopied(true);
      toast.success('Regra copiada!');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Erro ao copiar');
    }
  }, [rule]);

  return (
    <>
      {/* Sem motion.div aqui — plain div para não travar o scroll */}
      <div
        className="rounded-xl overflow-hidden border border-border/40 hover:border-primary/30 transition-colors"
        style={{ background: 'hsl(220 30% 12% / 0.7)' }}
      >
        <div className="h-0.5 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />

        <div className="px-4 sm:px-5 py-4">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
              <Gavel size={15} className="text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-mono text-[9px] text-primary/50 tracking-[0.3em] mb-0.5">
                // ARTIGO {String(index + 1).padStart(2, '0')}
              </p>
              {/* Sem vault-text-glow — animação contínua em todos os cards trava o scroll */}
              <h3 className="font-display text-sm font-bold text-foreground tracking-wider leading-tight break-words">
                {rule.nome}
              </h3>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={handleCopy}
                title="Copiar regra"
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-border/40 hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
              >
                {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
              </button>
              {(rule.paragrafos.length > 0) && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  title={expanded ? 'Recolher' : 'Expandir parágrafos'}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-border/40 hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                >
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>
          </div>

          {rule.descricao && (
            <p className="font-body text-sm text-muted-foreground leading-relaxed mt-3 ml-[42px]">
              {rule.descricao}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-4 ml-[42px]">
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
                className="flex items-center gap-1.5 px-3 py-1 rounded border border-primary/30 hover:bg-primary/15 hover:border-primary/50 text-primary transition-all active:scale-95"
              >
                <ImageIcon size={11} />
                <span className="font-mono text-[10px] font-bold tracking-widest">
                  {rule.artigdcards.length} ARTIGCARD{rule.artigdcards.length !== 1 ? 'S' : ''}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable paragraphs — CSS transition simples, sem height:auto animation */}
        {rule.paragrafos.length > 0 && (
          <div
            className="overflow-hidden transition-all duration-200 ease-in-out"
            style={{ maxHeight: expanded ? `${rule.paragrafos.length * 120 + 80}px` : '0px' }}
          >
            <div
              className="border-t border-border/30 px-4 sm:px-5 py-4 space-y-4"
              style={{ background: 'hsl(220 35% 10% / 0.6)' }}
            >
              <p className="font-mono text-[10px] text-primary/50 tracking-[0.3em] flex items-center gap-2">
                <span className="h-px flex-1 bg-primary/15" />
                PARÁGRAFOS
                <span className="h-px flex-1 bg-primary/15" />
              </p>

              {rule.paragrafos.map((para, pi) => (
                <div key={pi} className="flex gap-3">
                  <div className="shrink-0 mt-0.5">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-primary/10 border border-primary/25">
                      <Hash size={10} className="text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[9px] text-primary/50 tracking-widest mb-1">
                      PARÁGRAFO {pi + 1}
                    </p>
                    <p className="font-body text-sm text-foreground/85 leading-relaxed break-words">
                      {para}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCards && <CardsModal rule={rule} onClose={() => setShowCards(false)} />}
      </AnimatePresence>
    </>
  );
});

/* ─── Main Component ──────────────────────────────────────────────────── */

export default function VaultRulesList() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

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

  const filtered = rules.filter(r => {
    const q = search.toLowerCase();
    return (
      r.nome.toLowerCase().includes(q) ||
      r.descricao.toLowerCase().includes(q) ||
      r.paragrafos.some(p => p.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded flex items-center justify-center bg-primary/10 border border-primary/20">
            <Gavel size={20} className="text-primary" />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-wider">
            Regras
          </h2>
        </div>
        {!loading && !error && (
          <div className="vault-badge rounded px-4 py-1.5 text-[11px] flex items-center gap-2">
            <Gavel size={10} />
            {filtered.length}/{rules.length} ARTIG{rules.length !== 1 ? 'OS' : 'O'}
          </div>
        )}
      </div>

      {!loading && !error && rules.length > 0 && (
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="PESQUISAR REGRAS..."
            className="w-full bg-transparent border border-border/50 rounded-lg pl-10 pr-4 py-2.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/40 placeholder:tracking-widest focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      <div
        className="rounded-lg border border-primary/20 p-3 sm:p-4 mb-6 flex items-center gap-3"
        style={{ background: 'hsl(45 100% 55% / 0.04)' }}
      >
        <AlertTriangle size={15} className="text-primary/70 shrink-0" />
        <p className="font-mono text-[10px] sm:text-[11px] text-primary/60 tracking-wide">
          REGULAMENTO OFICIAL VAULT-TEC — LEIA COM ATENÇÃO ANTES DE OPERAR
        </p>
      </div>

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
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Search size={30} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              {search ? `NENHUMA REGRA PARA "${search.toUpperCase()}"` : 'NENHUMA REGRA ENCONTRADA'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-3 font-mono text-[10px] text-primary/60 hover:text-primary tracking-widest underline underline-offset-2 transition-colors"
              >
                LIMPAR PESQUISA
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rule, i) => (
            <RuleCard key={rule.id} rule={rule} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
