import { motion } from 'framer-motion';
import { Trophy, Medal, RefreshCw, Loader2, AlertTriangle, Crown, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RankEntry } from '@/hooks/useUserAccess';

interface VaultRankProps {
  ranking: RankEntry[];
  loading: boolean;
  error: boolean;
  currentUserId?: string;
  onRefresh: () => void;
}

const MEDALS = [
  { color: 'hsl(45,100%,55%)',  border: 'border-[hsl(45,100%,55%)]',  bg: 'bg-[hsl(45,100%,55%)]',  shadow: '0 0 20px hsl(45,100%,55%,0.4)', label: '1º', icon: Crown },
  { color: 'hsl(220,10%,72%)',  border: 'border-[hsl(220,10%,72%)]',  bg: 'bg-[hsl(220,10%,72%)]',  shadow: '0 0 14px hsl(220,10%,72%,0.3)', label: '2º', icon: Medal },
  { color: 'hsl(25,70%,50%)',   border: 'border-[hsl(25,70%,50%)]',   bg: 'bg-[hsl(25,70%,50%)]',   shadow: '0 0 14px hsl(25,70%,50%,0.3)',  label: '3º', icon: Medal },
];

function timeAgo(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR });
  } catch {
    return '—';
  }
}

export default function VaultRank({ ranking, loading, error, currentUserId, onRefresh }: VaultRankProps) {
  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded flex items-center justify-center bg-primary/10 border border-primary/20">
            <Trophy size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-wider">
              Ranking
            </h2>
            <p className="font-mono text-[9px] text-muted-foreground/50 tracking-[0.25em]">
              TOP ACESSOS — VAULT-TEC
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="vault-badge rounded px-3 py-1.5 text-[11px] flex items-center gap-2 hover:opacity-80 active:scale-95 transition-all disabled:opacity-40"
        >
          <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
          ATUALIZAR
        </button>
      </div>

      {/* Notice */}
      <div
        className="rounded-lg border border-primary/20 px-4 py-3 mb-6 flex items-center gap-3"
        style={{ background: 'hsl(45 100% 55% / 0.04)' }}
      >
        <Zap size={14} className="text-primary/70 shrink-0" />
        <p className="font-mono text-[10px] sm:text-[11px] text-primary/60 tracking-wide">
          OPERADORES MAIS ATIVOS DO VAULT — ATUALIZADO EM TEMPO REAL
        </p>
      </div>

      {/* States */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Loader2 size={30} className="animate-spin text-primary mx-auto mb-3" />
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              CARREGANDO RANKING...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <AlertTriangle size={30} className="text-destructive mx-auto mb-3" />
            <p className="font-mono text-xs text-muted-foreground tracking-widest mb-4">
              FALHA AO CARREGAR RANKING
            </p>
            <button
              onClick={onRefresh}
              className="vault-badge rounded px-5 py-2 text-[11px] font-bold tracking-widest hover:opacity-90 active:scale-95 transition-all"
            >
              TENTAR NOVAMENTE
            </button>
          </div>
        </div>
      ) : ranking.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <Trophy size={30} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              NENHUM OPERADOR REGISTRADO
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Top 3 */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {top3.map((entry, i) => {
                const medal = MEDALS[i];
                const IconComp = medal.icon;
                const isMe = entry.user_id === currentUserId;
                return (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={`relative rounded-xl border-2 p-4 flex flex-col items-center text-center gap-2 overflow-hidden ${medal.border}`}
                    style={{
                      background: `hsl(220 30% 10% / 0.9)`,
                      boxShadow: isMe ? medal.shadow : 'none',
                    }}
                  >
                    {/* Glow top bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ background: `linear-gradient(90deg, transparent, ${medal.color}, transparent)` }}
                    />

                    {/* Medal badge */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0"
                      style={{ borderColor: medal.color, background: `${medal.color}18` }}
                    >
                      <IconComp size={18} style={{ color: medal.color }} />
                    </div>

                    {/* Position */}
                    <p className="font-mono text-[9px] tracking-[0.3em]" style={{ color: medal.color }}>
                      {medal.label} LUGAR
                    </p>

                    {/* Name */}
                    <p className="font-display text-sm font-bold text-foreground tracking-wide leading-tight break-all">
                      {entry.user_name}
                      {isMe && (
                        <span className="ml-1.5 font-mono text-[8px] text-primary/70 tracking-widest">(VOCÊ)</span>
                      )}
                    </p>

                    {/* Count */}
                    <div
                      className="px-3 py-1 rounded-full border font-mono text-xs font-bold tracking-widest"
                      style={{ borderColor: `${medal.color}50`, color: medal.color, background: `${medal.color}0f` }}
                    >
                      {entry.access_count.toLocaleString('pt-BR')} ACESSOS
                    </div>

                    {/* Last seen */}
                    <p className="font-mono text-[8px] text-muted-foreground/40 tracking-wider">
                      {timeAgo(entry.last_seen)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* 4th–10th */}
          {rest.length > 0 && (
            <div>
              <p className="font-mono text-[10px] text-primary/40 tracking-[0.3em] flex items-center gap-2 mb-3">
                <span className="h-px flex-1 bg-primary/15" />
                OUTROS CLASSIFICADOS
                <span className="h-px flex-1 bg-primary/15" />
              </p>

              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded flex items-center justify-center shrink-0 bg-primary border border-primary text-primary-foreground">
                  <Trophy size={12} />
                </div>
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-card border-y border-r border-primary/30 border-l-4 border-l-primary/60">
                  <span className="font-mono text-[9px] text-primary/60 tracking-[0.2em]">POSIÇÃO</span>
                  <span className="flex-1" />
                  <span className="font-mono text-[9px] text-primary/60 tracking-[0.2em]">OPERADOR</span>
                  <span className="flex-1" />
                  <span className="font-mono text-[9px] text-primary/60 tracking-[0.2em] hidden sm:block">ACESSOS</span>
                </div>
              </div>

              <div className="ml-3 border-l-2 border-primary/20 pl-3 space-y-1.5">
                {rest.map((entry, i) => {
                  const pos = i + 4;
                  const isMe = entry.user_id === currentUserId;
                  return (
                    <motion.div
                      key={entry.user_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 + 0.25 }}
                      className="relative"
                    >
                      <div className="absolute top-1/2 -left-3 w-3 h-px bg-primary/20" style={{ transform: 'translateY(-50%)' }} />
                      <div className="absolute top-1/2 -left-[15px] w-2 h-2 rounded-full bg-primary/25 border border-primary/40" style={{ transform: 'translateY(-50%)' }} />
                      <div
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                          isMe
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-border/30 bg-card/50 hover:border-primary/20'
                        }`}
                      >
                        <span className="font-mono text-[10px] text-primary/50 shrink-0 w-5 text-right font-bold">
                          {String(pos).padStart(2, '0')}
                        </span>
                        <p className="flex-1 font-body text-sm font-semibold text-foreground truncate">
                          {entry.user_name}
                          {isMe && (
                            <span className="ml-2 font-mono text-[8px] text-primary/60 tracking-widest">(VOCÊ)</span>
                          )}
                        </p>
                        <span className="font-mono text-[10px] text-muted-foreground/60 shrink-0">
                          {entry.access_count.toLocaleString('pt-BR')}×
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
