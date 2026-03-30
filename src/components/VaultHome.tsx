import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, ShieldAlert, MessageSquare, Gavel, Radiation,
  Zap, Radio, AlertTriangle, Terminal, Users,
  ChevronRight, Activity, Cpu, Lock, Atom
} from 'lucide-react';

interface VaultHomeProps {
  userName: string;
  totalFBI: number;
  totalSKUR: number;
  onNavigate: (section: string) => void;
}

const BOOT_LINES = [
  'VAULT-TEC INDUSTRIES — SISTEMA OPERACIONAL v3.11',
  'Inicializando módulos de segurança...',
  'Verificando credenciais de acesso...',
  'Carregando dossiê operacional NEEXT...',
  'Sincronizando banco de dados FBI & SKUR...',
  'STATUS: TODOS OS SISTEMAS OPERACIONAIS.',
];

const FALLOUT_QUOTES = [
  { quote: 'A guerra. A guerra nunca muda.', source: '— Ron Perlman, Fallout' },
  { quote: 'Vault-Tec: Construindo um amanhã melhor, hoje.', source: '— Slogan Vault-Tec' },
  { quote: 'Por favor, siga o protocolo de segurança em todos os momentos.', source: '— Protocolo 7-G, Vault-Tec' },
  { quote: 'Um Vault é apenas tão forte quanto seus habitantes.', source: '— Manual Vault-Tec, p. 42' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.5 } }),
};

const quoteIdx = Math.floor(Math.random() * FALLOUT_QUOTES.length);

export default function VaultHome({ userName, totalFBI, totalSKUR, onNavigate }: VaultHomeProps) {
  const [bootStep, setBootStep] = useState(0);
  const [bootDone, setBootDone] = useState(false);
  const [tick, setTick] = useState(true);

  useEffect(() => {
    if (bootStep < BOOT_LINES.length) {
      const t = setTimeout(() => setBootStep(s => s + 1), 340);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setBootDone(true), 400);
      return () => clearTimeout(t);
    }
  }, [bootStep]);

  useEffect(() => {
    const t = setInterval(() => setTick(v => !v), 600);
    return () => clearInterval(t);
  }, []);

  const { quote, source } = FALLOUT_QUOTES[quoteIdx];

  const quickLinks = [
    { id: 'fbi', label: 'CARGOS FBI', desc: 'Ver hierarquia operacional FBI', icon: Briefcase, count: totalFBI, color: 'from-blue-900/30 to-blue-950/10', border: 'border-blue-500/20', accent: 'text-blue-400' },
    { id: 'skur', label: 'CARGOS SKUR', desc: 'Ver hierarquia operacional SKUR', icon: Briefcase, count: totalSKUR, color: 'from-amber-900/20 to-amber-950/10', border: 'border-amber-500/20', accent: 'text-amber-400' },
    { id: 'chat', label: 'VAULT COMMS', desc: 'Canal de comunicação operacional', icon: MessageSquare, count: null, color: 'from-green-900/20 to-green-950/10', border: 'border-green-500/20', accent: 'text-green-400' },
    { id: 'protocolos', label: 'PROTOCOLOS', desc: 'Diretivas e ordens de missão', icon: ShieldAlert, count: null, color: 'from-red-900/20 to-red-950/10', border: 'border-red-500/20', accent: 'text-red-400' },
    { id: 'regras', label: 'REGRAS', desc: 'Regulamento oficial Vault-Tec', icon: Gavel, count: null, color: 'from-purple-900/20 to-purple-950/10', border: 'border-purple-500/20', accent: 'text-purple-400' },
  ];

  const statusItems = [
    { label: 'NÍVEL DE RADIAÇÃO', value: '0.02 RAD/H', icon: Radiation, ok: true },
    { label: 'SISTEMA DE ENERGIA', value: 'NUCLEAR ATIVO', icon: Atom, ok: true },
    { label: 'COMUNICAÇÕES', value: 'OPERACIONAL', icon: Radio, ok: true },
    { label: 'SEGURANÇA', value: 'DEFCON 3', icon: Lock, ok: true },
    { label: 'CPU CENTRAL', value: '98.2% EFIC.', icon: Cpu, ok: true },
    { label: 'PESSOAL ATIVO', value: `${totalFBI + totalSKUR} AGENTES`, icon: Users, ok: true },
  ];

  return (
    <div className="space-y-6 pb-10">

      {/* ── Terminal Boot ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-lg border border-primary/20 overflow-hidden"
        style={{ background: 'hsl(220 30% 8% / 0.95)' }}
      >
        <div className="flex items-center gap-2 px-4 py-2 border-b border-primary/10" style={{ background: 'hsl(220 30% 6%)' }}>
          <Terminal size={12} className="text-primary" />
          <span className="font-mono text-[10px] text-primary/60 tracking-[0.3em]">VAULT-TEC TERMINAL — BOOT SEQUENCE</span>
          <div className="ml-auto flex gap-1.5">
            {[0,1,2].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/20" />)}
          </div>
        </div>
        <div className="px-4 py-3 font-mono text-[11px] space-y-1 min-h-[100px]">
          <AnimatePresence>
            {BOOT_LINES.slice(0, bootStep).map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={i === 0 ? 'text-primary font-bold tracking-wider' : i === BOOT_LINES.length - 1 ? 'text-green-400 font-semibold' : 'text-muted-foreground/70'}
              >
                {i > 0 && i < BOOT_LINES.length - 1 && <span className="text-primary/40 mr-2">&gt;</span>}
                {line}
              </motion.p>
            ))}
          </AnimatePresence>
          {!bootDone && (
            <span className="text-primary/60">{tick ? '█' : ' '}</span>
          )}
          {bootDone && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary/40 mt-1">
              {'> '}<span className="text-primary/60">Aguardando comando...</span>{tick ? '█' : ' '}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* ── Welcome Banner ── */}
      <AnimatePresence>
        {bootDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-lg border border-primary/30 overflow-hidden relative"
            style={{ background: 'linear-gradient(135deg, hsl(220 35% 11% / 0.98), hsl(45 30% 10% / 0.6))' }}
          >
            {/* hazard stripe top */}
            <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
            {/* decorative orb */}
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, hsl(45 100% 55%), transparent 70%)' }} />

            <div className="px-6 py-7 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-xl border-2 border-primary/40 bg-primary/10 flex items-center justify-center shrink-0 vault-glow">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/archive/1/12/20240105055907%21Vault-Tec_Logo.svg"
                    alt="Vault-Tec"
                    className="w-10 h-10"
                    style={{ filter: 'brightness(0) saturate(100%) invert(82%) sepia(60%) saturate(700%) hue-rotate(5deg) brightness(105%)' }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-mono text-[10px] text-primary/50 tracking-[0.4em] mb-1">// ACESSO AUTORIZADO — AGENTE CLASSIFICADO</p>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary vault-text-glow tracking-[0.15em]">
                    BEM-VINDO, <span className="text-foreground">{userName.toUpperCase()}</span>
                  </h1>
                  <p className="font-mono text-xs text-muted-foreground mt-2 leading-relaxed max-w-xl">
                    Você está acessando o <span className="text-primary font-semibold">Dossiê Operacional NEEXT</span> — sistema de gestão interna da Vault-Tec Industries.
                    Todos os acessos são registrados e monitorados. Aja com discrição, Agente.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2 shrink-0">
                  <Activity size={12} className="text-green-400 animate-pulse" />
                  <span className="font-mono text-[10px] text-green-400 tracking-widest font-semibold">ONLINE</span>
                </div>
              </div>

              {/* Quote */}
              <div className="mt-5 pt-4 border-t border-primary/10">
                <p className="font-mono text-xs text-muted-foreground/60 italic leading-relaxed">
                  <span className="text-primary/40 text-lg leading-none mr-1">"</span>
                  {quote}
                  <span className="text-primary/40 text-lg leading-none ml-1">"</span>
                </p>
                <p className="font-mono text-[10px] text-primary/40 mt-1 tracking-widest">{source}</p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick Access Cards ── */}
      <AnimatePresence>
        {bootDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Zap size={13} className="text-primary" />
              <span className="font-mono text-[10px] text-primary/60 tracking-[0.3em]">ACESSO RÁPIDO</span>
              <div className="flex-1 h-px bg-primary/10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickLinks.map(({ id, label, desc, icon: Icon, count, color, border, accent }, i) => (
                <motion.button
                  key={id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNavigate(id)}
                  className={`w-full text-left rounded-lg border ${border} bg-gradient-to-br ${color} p-4 transition-all hover:brightness-125 relative overflow-hidden group`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, transparent, hsl(45 100% 55% / 0.03))' }} />
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-black/30 border ${border}`}>
                      <Icon size={16} className={accent} />
                    </div>
                    {count !== null && (
                      <span className={`font-mono text-lg font-bold ${accent}`}>{count}</span>
                    )}
                    <ChevronRight size={14} className={`${accent} opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${count !== null ? 'hidden' : ''}`} />
                  </div>
                  <p className={`font-display text-sm font-bold tracking-wider ${accent} mb-0.5`}>{label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground/60 leading-relaxed">{desc}</p>
                  {count !== null && (
                    <p className="font-mono text-[10px] text-muted-foreground/40 mt-2">{count} registros ativos</p>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Status do Sistema ── */}
      <AnimatePresence>
        {bootDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            <div className="flex items-center gap-3 mb-3">
              <Cpu size={13} className="text-primary" />
              <span className="font-mono text-[10px] text-primary/60 tracking-[0.3em]">STATUS DO SISTEMA</span>
              <div className="flex-1 h-px bg-primary/10" />
            </div>
            <div className="rounded-lg border border-border/30 overflow-hidden" style={{ background: 'hsl(220 30% 10% / 0.8)' }}>
              <div className="grid grid-cols-2 sm:grid-cols-3">
                {statusItems.map(({ label, value, icon: Icon, ok }, i) => (
                  <div
                    key={label}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i % 3 !== 2 ? 'border-r border-border/20' : ''
                    } ${i < 3 ? 'border-b border-border/20' : ''}`}
                  >
                    <Icon size={14} className="text-primary/50 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-mono text-[9px] text-muted-foreground/40 tracking-widest truncate">{label}</p>
                      <p className={`font-mono text-[11px] font-semibold ${ok ? 'text-green-400' : 'text-red-400'} tracking-wide`}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Aviso de Segurança ── */}
      <AnimatePresence>
        {bootDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
            <div className="rounded-lg border border-destructive/30 overflow-hidden" style={{ background: 'hsl(0 30% 9% / 0.8)' }}>
              <div className="flex">
                <div className="w-2 shrink-0" style={{
                  background: 'repeating-linear-gradient(135deg, hsl(45 100% 50%), hsl(45 100% 50%) 4px, hsl(0 0% 8%) 4px, hsl(0 0% 8%) 8px)'
                }} />
                <div className="px-5 py-4 flex items-start gap-4">
                  <AlertTriangle size={20} className="text-destructive mt-0.5 shrink-0 animate-pulse" />
                  <div>
                    <p className="font-display text-[10px] font-bold text-destructive tracking-[0.25em] mb-2">
                      ☢ AVISO DE SEGURANÇA VAULT-TEC — PROTOCOLO 7-G
                    </p>
                    <div className="space-y-1.5 font-mono text-[10px] text-muted-foreground/60 leading-relaxed">
                      <p>• Todo acesso não autorizado às instalações será tratado como AMEAÇA NÍVEL VERMELHO.</p>
                      <p>• A divulgação de informações classificadas a civis é punível conforme o Artigo 12 do Código Vault-Tec.</p>
                      <p>• Em caso de brecha de segurança, acione imediatamente o Protocolo de Contenção DEFCON-1.</p>
                      <p>• <span className="text-primary/70">Lembre-se: Vault-Tec está construindo um amanhã melhor — mas apenas para os merecedores.</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footer Vault-Tec ── */}
      {bootDone && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="text-center font-mono text-[9px] text-muted-foreground/25 tracking-[0.4em] pt-2"
        >
          VAULT-TEC INDUSTRIES © 2077 — TODOS OS DIREITOS RESERVADOS — ACESSO MONITORADO
        </motion.p>
      )}
    </div>
  );
}
