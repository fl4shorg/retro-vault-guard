import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Radiation, Radio, AlertTriangle, Users,
  Activity, Cpu, Lock, Atom
} from 'lucide-react';

interface VaultHomeProps {
  userName: string;
  totalFBI: number;
  totalSKUR: number;
}

const FALLOUT_QUOTES = [
  { quote: 'A guerra. A guerra nunca muda.', source: '— Ron Perlman, Fallout' },
  { quote: 'Vault-Tec: Construindo um amanhã melhor, hoje.', source: '— Slogan Vault-Tec' },
  { quote: 'Por favor, siga o protocolo de segurança em todos os momentos.', source: '— Protocolo 7-G, Vault-Tec' },
  { quote: 'Um Vault é apenas tão forte quanto seus habitantes.', source: '— Manual Vault-Tec, p. 42' },
];

const DAYS = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const quoteIdx = Math.floor(Math.random() * FALLOUT_QUOTES.length);

function PipBoyClockFace({ time }: { time: Date }) {
  const h = time.getHours() % 12;
  const m = time.getMinutes();
  const s = time.getSeconds();
  const ms = time.getMilliseconds();

  const secAngle = (s + ms / 1000) * 6;
  const minAngle = (m + (s + ms / 1000) / 60) * 6;
  const hourAngle = (h + m / 60) * 30;

  const cx = 100;
  const cy = 100;
  const R = 92;

  const hand = (angleDeg: number, length: number, width: number, color: string, glow: boolean) => {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    const x2 = cx + length * Math.cos(rad);
    const y2 = cy + length * Math.sin(rad);
    return (
      <line
        x1={cx} y1={cy} x2={x2} y2={y2}
        stroke={color} strokeWidth={width} strokeLinecap="round"
        style={glow ? { filter: `drop-shadow(0 0 4px ${color})` } : undefined}
      />
    );
  };

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const isHour = i % 5 === 0;
    const rad = (i * 6 - 90) * (Math.PI / 180);
    const r1 = isHour ? R - 10 : R - 5;
    const r2 = R;
    return (
      <line
        key={i}
        x1={cx + r1 * Math.cos(rad)} y1={cy + r1 * Math.sin(rad)}
        x2={cx + r2 * Math.cos(rad)} y2={cy + r2 * Math.sin(rad)}
        stroke={isHour ? '#f5c518' : '#f5c51850'}
        strokeWidth={isHour ? 2.5 : 1}
      />
    );
  });

  const numerals = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
    const rad = (i * 30 - 90) * (Math.PI / 180);
    const nr = R - 20;
    return (
      <text
        key={n}
        x={cx + nr * Math.cos(rad)}
        y={cy + nr * Math.sin(rad)}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="9"
        fontFamily="Share Tech Mono, monospace"
        fontWeight="bold"
        fill="#f5c518"
        style={{ filter: 'drop-shadow(0 0 3px #f5c518aa)' }}
      >
        {n}
      </text>
    );
  });

  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="face-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1f2e" />
          <stop offset="100%" stopColor="#0a0d15" />
        </radialGradient>
        <pattern id="scanlines" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="2" height="1" fill="rgba(0,0,0,0.15)" />
        </pattern>
      </defs>

      {/* Outer ring glow */}
      <circle cx={cx} cy={cy} r={R + 4} fill="none" stroke="#f5c518" strokeWidth="0.5" opacity="0.2" filter="url(#glow)" />

      {/* Outer decorative ring */}
      <circle cx={cx} cy={cy} r={R + 2} fill="none" stroke="#f5c518" strokeWidth="1.5" opacity="0.5" />

      {/* Second ring */}
      <circle cx={cx} cy={cy} r={R - 0.5} fill="none" stroke="#f5c51830" strokeWidth="0.5" />

      {/* Face background */}
      <circle cx={cx} cy={cy} r={R} fill="url(#face-bg)" />

      {/* Scanlines overlay */}
      <circle cx={cx} cy={cy} r={R} fill="url(#scanlines)" opacity="0.4" />

      {/* Tick marks */}
      {ticks}

      {/* Numerals */}
      {numerals}

      {/* Inner decorative circle */}
      <circle cx={cx} cy={cy} r={28} fill="none" stroke="#f5c51820" strokeWidth="1" />

      {/* VAULT-TEC text */}
      <text x={cx} y={cy - 14} textAnchor="middle" fontSize="5.5" fontFamily="Share Tech Mono, monospace"
        fill="#f5c518" opacity="0.7" letterSpacing="2">VAULT-TEC</text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="4.5" fontFamily="Share Tech Mono, monospace"
        fill="#f5c51880" letterSpacing="1">INDUSTRIES</text>

      {/* Hour hand */}
      {hand(hourAngle, 42, 5, '#f5c518', true)}
      {/* Hour hand tail */}
      <line x1={cx} y1={cy} x2={cx + 10 * Math.cos((hourAngle + 90 + 180) * Math.PI / 180)}
        y2={cy + 10 * Math.sin((hourAngle + 90 + 180) * Math.PI / 180)}
        stroke="#f5c518" strokeWidth={5} strokeLinecap="round" opacity="0.4" />

      {/* Minute hand */}
      {hand(minAngle, 60, 3, '#f5c518', true)}
      <line x1={cx} y1={cy} x2={cx + 12 * Math.cos((minAngle + 90 + 180) * Math.PI / 180)}
        y2={cy + 12 * Math.sin((minAngle + 90 + 180) * Math.PI / 180)}
        stroke="#f5c518" strokeWidth={3} strokeLinecap="round" opacity="0.4" />

      {/* Second hand */}
      {hand(secAngle, 68, 1.5, '#ff4444', true)}
      <line x1={cx} y1={cy} x2={cx + 15 * Math.cos((secAngle + 90 + 180) * Math.PI / 180)}
        y2={cy + 15 * Math.sin((secAngle + 90 + 180) * Math.PI / 180)}
        stroke="#ff4444" strokeWidth={1.5} strokeLinecap="round" opacity="0.7" />

      {/* Center cap */}
      <circle cx={cx} cy={cy} r={5} fill="#f5c518" filter="url(#glow)" />
      <circle cx={cx} cy={cy} r={2.5} fill="#0a0d15" />
    </svg>
  );
}

function FalloutClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 50);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const day = DAYS[time.getDay()];
  const date = `${pad(time.getDate())} ${MONTHS[time.getMonth()]} ${time.getFullYear()}`;
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;

  return (
    <div className="rounded-lg border border-primary/30 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(220 35% 9%), hsl(220 40% 6%))' }}>
      <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
      <div className="flex flex-col sm:flex-row items-center gap-6 px-6 py-6">

        {/* Clock face */}
        <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
          <div className="absolute inset-0 rounded-full opacity-20" style={{
            background: 'radial-gradient(circle, hsl(45 100% 55%), transparent 70%)',
            filter: 'blur(20px)',
          }} />
          <PipBoyClockFace time={time} />
        </div>

        {/* Digital info panel */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          {/* Digital time */}
          <div>
            <p className="font-mono text-[9px] text-primary/40 tracking-[0.4em] mb-1">// HORA LOCAL DO VAULT</p>
            <p className="font-mono text-4xl sm:text-5xl font-bold text-primary vault-text-glow tracking-widest tabular-nums">
              {timeStr}
            </p>
          </div>

          {/* Date & day */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <p className="font-mono text-[9px] text-muted-foreground/40 tracking-[0.3em]">DIA</p>
              <p className="font-mono text-sm font-bold text-primary/80 tracking-widest">{day}</p>
            </div>
            <div className="w-px h-8 bg-primary/20" />
            <div className="flex flex-col">
              <p className="font-mono text-[9px] text-muted-foreground/40 tracking-[0.3em]">DATA</p>
              <p className="font-mono text-sm font-bold text-primary/80 tracking-widest">{date}</p>
            </div>
          </div>

          {/* Status row */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-primary/10">
            {[
              { label: 'VAULT', value: '101', ok: true },
              { label: 'SETOR', value: 'NEEXT', ok: true },
              { label: 'STATUS', value: 'OPERACIONAL', ok: true },
              { label: 'DEFCON', value: '3', ok: true },
            ].map(({ label, value, ok }) => (
              <div key={label} className="flex items-center gap-1.5 bg-black/30 border border-primary/10 rounded px-2 py-1">
                <span className="font-mono text-[8px] text-muted-foreground/40 tracking-widest">{label}:</span>
                <span className={`font-mono text-[10px] font-bold tracking-wider ${ok ? 'text-green-400' : 'text-red-400'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
}

export default function VaultHome({ userName, totalFBI, totalSKUR }: VaultHomeProps) {
  const { quote, source } = FALLOUT_QUOTES[quoteIdx];

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

      {/* ── Pip-Boy Clock ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <FalloutClock />
      </motion.div>

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-lg border border-primary/30 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, hsl(220 35% 11% / 0.98), hsl(45 30% 10% / 0.6))' }}
      >
        <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
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

      {/* ── Status do Sistema ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
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
                className={`flex items-center gap-3 px-4 py-3 ${i % 3 !== 2 ? 'border-r border-border/20' : ''} ${i < 3 ? 'border-b border-border/20' : ''}`}
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

      {/* ── Aviso de Segurança ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
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

      {/* ── Footer ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center font-mono text-[9px] text-muted-foreground/25 tracking-[0.4em] pt-2"
      >
        VAULT-TEC INDUSTRIES © 2077 — TODOS OS DIREITOS RESERVADOS — ACESSO MONITORADO
      </motion.p>
    </div>
  );
}
