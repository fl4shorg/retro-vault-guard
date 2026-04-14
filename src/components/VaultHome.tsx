import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, CloudMoon, Activity } from 'lucide-react';

interface VaultHomeProps {
  userName: string;
  totalFBI: number;
  totalSKUR: number;
  totalRegras: number;
  totalProtocols: number;
}

const FALLOUT_QUOTES = [
  { quote: 'A guerra. A guerra nunca muda.', source: '— Ron Perlman, Fallout' },
  { quote: 'Vault-Tec: Construindo um amanhã melhor, hoje.', source: '— Slogan Vault-Tec' },
  { quote: 'Por favor, siga o protocolo de segurança em todos os momentos.', source: '— Protocolo 7-G' },
  { quote: 'Um Vault é apenas tão forte quanto seus habitantes.', source: '— Manual Vault-Tec, p. 42' },
  { quote: 'Sobreviver é a única missão que importa.', source: '— Protocolo de Emergência Vault-Tec' },
  { quote: 'Toda ameaça ao Vault é uma ameaça a todos nós.', source: '— Código Vault-Tec, Art. 1' },
];

const DAYS = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const quoteIdx = Math.floor(Math.random() * FALLOUT_QUOTES.length);

function getGreeting(hour: number) {
  if (hour >= 5 && hour < 12) return {
    text: 'BOM DIA',
    sub: 'TURNO DA MANHÃ',
    Icon: Sun,
    color: '#fbbf24',
  };
  if (hour >= 12 && hour < 18) return {
    text: 'BOA TARDE',
    sub: 'TURNO DA TARDE',
    Icon: Sunset,
    color: '#f97316',
  };
  if (hour >= 18 && hour < 24) return {
    text: 'BOA NOITE',
    sub: 'TURNO NOTURNO',
    Icon: Moon,
    color: '#818cf8',
  };
  return {
    text: 'BOA MADRUGADA',
    sub: 'TURNO DA MADRUGADA',
    Icon: CloudMoon,
    color: '#64748b',
  };
}

/* ── Pip-Boy SVG Clock ── */
function ClockFace({ time }: { time: Date }) {
  const h = time.getHours() % 12;
  const m = time.getMinutes();
  const s = time.getSeconds();
  const ms = time.getMilliseconds();
  const secDeg = (s + ms / 1000) * 6;
  const minDeg = (m + (s + ms / 1000) / 60) * 6;
  const hourDeg = (h + m / 60) * 30;
  const cx = 100; const cy = 100; const R = 90;

  const handLine = (deg: number, len: number, w: number, color: string) => {
    const r = (deg - 90) * (Math.PI / 180);
    return <line x1={cx} y1={cy} x2={cx + len * Math.cos(r)} y2={cy + len * Math.sin(r)}
      stroke={color} strokeWidth={w} strokeLinecap="round"
      style={{ filter: `drop-shadow(0 0 3px ${color})` }} />;
  };

  const tailLine = (deg: number, len: number, w: number, color: string) => {
    const r = (deg + 90) * (Math.PI / 180);
    return <line x1={cx} y1={cy} x2={cx + len * Math.cos(r)} y2={cy + len * Math.sin(r)}
      stroke={color} strokeWidth={w} strokeLinecap="round" opacity={0.5} />;
  };

  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      <defs>
        <filter id="clkGlow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle cx={cx} cy={cy} r={R + 5} fill="none" stroke="#f5c518" strokeWidth="0.4" opacity="0.15" filter="url(#clkGlow)" />
      <circle cx={cx} cy={cy} r={R + 1} fill="none" stroke="#f5c518" strokeWidth="1.8" opacity="0.6" />
      <circle cx={cx} cy={cy} r={R - 1} fill="none" stroke="#f5c51825" strokeWidth="0.5" />
      {Array.from({ length: 60 }, (_, i) => {
        const isHour = i % 5 === 0;
        const rad = (i * 6 - 90) * (Math.PI / 180);
        const r1 = isHour ? R - 10 : R - 5;
        return <line key={i}
          x1={cx + r1 * Math.cos(rad)} y1={cy + r1 * Math.sin(rad)}
          x2={cx + R * Math.cos(rad)} y2={cy + R * Math.sin(rad)}
          stroke={isHour ? '#f5c518' : '#f5c51840'}
          strokeWidth={isHour ? 2.5 : 1} />;
      })}
      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
        const rad = (i * 30 - 90) * (Math.PI / 180);
        const nr = R - 20;
        return <text key={n} x={cx + nr * Math.cos(rad)} y={cy + nr * Math.sin(rad)}
          textAnchor="middle" dominantBaseline="central"
          fontSize="9" fontFamily="Share Tech Mono, monospace" fontWeight="bold"
          fill="#f5c518" style={{ filter: 'drop-shadow(0 0 2px #f5c518aa)' }}>{n}</text>;
      })}
      <circle cx={cx} cy={cy} r={26} fill="none" stroke="#f5c51815" strokeWidth="1" />
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize="5.5"
        fontFamily="Share Tech Mono, monospace" fill="#f5c518" opacity="0.6" letterSpacing="2">VAULT-TEC</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="4"
        fontFamily="Share Tech Mono, monospace" fill="#f5c51870" letterSpacing="1">v3.11</text>
      {tailLine(hourDeg, 10, 5, '#f5c518')}
      {handLine(hourDeg, 42, 5, '#f5c518')}
      {tailLine(minDeg, 12, 3, '#f5c518')}
      {handLine(minDeg, 60, 3, '#f5c518')}
      {tailLine(secDeg, 14, 1.5, '#ff5555')}
      {handLine(secDeg, 68, 1.5, '#ff5555')}
      <circle cx={cx} cy={cy} r={5} fill="#f5c518" filter="url(#clkGlow)" />
      <circle cx={cx} cy={cy} r={2} fill="#0a0c14" />
    </svg>
  );
}

/* ── Stat bar ── */
function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(value / Math.max(max, 1), 1);
  const bars = 20;
  const filled = Math.round(pct * bars);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-mono text-[10px] tracking-[0.25em]" style={{ color }}>{label}</span>
        <span className="font-mono text-[10px] text-muted-foreground/40">{value} REG.</span>
      </div>
      <div className="flex gap-[3px]">
        {Array.from({ length: bars }, (_, i) => (
          <div key={i} className="h-2 flex-1 rounded-sm" style={{
            background: i < filled ? color : 'rgba(255,255,255,0.06)',
            boxShadow: i < filled ? `0 0 4px ${color}55` : 'none',
          }} />
        ))}
      </div>
    </div>
  );
}

export default function VaultHome({ userName, totalFBI, totalSKUR, totalRegras, totalProtocols }: VaultHomeProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 50);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`;
  const dateStr = `${pad(time.getDate())} ${MONTHS[time.getMonth()]} ${time.getFullYear()}`;
  const dayStr = DAYS[time.getDay()];
  const { quote, source } = FALLOUT_QUOTES[quoteIdx];
  const greeting = getGreeting(time.getHours());
  const GreetIcon = greeting.Icon;
  const maxCount = Math.max(totalFBI, totalSKUR, totalRegras, totalProtocols, 1);

  const stats = [
    { id: 'fbi',       label: 'F.B.I',      sub: 'DIVISÃO OPERACIONAL', count: totalFBI,       barLabel: 'CARGOS REGISTRADOS', color: '#60a5fa', border: 'hsl(215 80% 50% / 0.2)' },
    { id: 'skur',      label: 'S.K.U.R',     sub: 'DIVISÃO OPERACIONAL', count: totalSKUR,      barLabel: 'CARGOS REGISTRADOS', color: '#f5c518', border: 'hsl(45 100% 50% / 0.2)'  },
    { id: 'regras',    label: 'ARTIGOS',      sub: 'REGULAMENTO VAULT',   count: totalRegras,    barLabel: 'ARTIGOS ATIVOS',     color: '#a78bfa', border: 'hsl(265 80% 50% / 0.2)' },
    { id: 'protocols', label: 'PROTOCOLOS',   sub: 'SEGURANÇA DEFCON',    count: totalProtocols, barLabel: 'NÍVEIS ATIVOS',      color: '#f87171', border: 'hsl(0 70% 50% / 0.2)'   },
  ];

  return (
    <div className="space-y-4 pb-10">

      {/* ════ PAINEL PRINCIPAL — Clock + Greeting ════ */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-xl border border-primary/20 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, hsl(220 38% 9%), hsl(220 42% 6%))' }}
      >
        <div className="h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="flex flex-col sm:flex-row gap-0">
          {/* Clock */}
          <div className="flex flex-col items-center justify-center px-6 py-6 sm:border-r border-primary/10 shrink-0">
            <div className="relative" style={{ width: 160, height: 160 }}>
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                background: 'radial-gradient(circle, hsl(45 100% 55% / 0.1), transparent 70%)',
                filter: 'blur(14px)',
              }} />
              <ClockFace time={time} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col justify-between px-5 sm:px-6 py-5 gap-4">

            {/* Greeting block */}
            <div className="space-y-2">
              {/* Period label */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center border"
                  style={{ background: `${greeting.color}15`, borderColor: `${greeting.color}35` }}>
                  <GreetIcon size={14} style={{ color: greeting.color }} />
                </div>
                <span className="font-mono text-[9px] tracking-[0.35em]" style={{ color: greeting.color, opacity: 0.7 }}>
                  {greeting.text} — {greeting.sub}
                </span>
              </div>

              {/* Name */}
              <div>
                <p className="font-mono text-[9px] text-muted-foreground/30 tracking-[0.45em] mb-1">
                  // AGENTE AUTORIZADO — VAULT 101
                </p>
                <h1 className="font-display font-bold tracking-[0.1em] leading-tight">
                  <span className="text-muted-foreground/45 text-base sm:text-lg block">
                    BEM-VINDO, {greeting.text}
                  </span>
                  <span className="text-primary vault-text-glow text-2xl sm:text-3xl block break-words">
                    {userName.toUpperCase()}
                  </span>
                </h1>
              </div>
            </div>

            <div className="h-px bg-primary/8" />

            {/* Digital time + date */}
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="font-mono text-[8px] text-muted-foreground/25 tracking-[0.4em] mb-0.5">HORA LOCAL</p>
                <p className="font-mono text-2xl sm:text-3xl font-bold text-primary tracking-widest tabular-nums vault-text-glow">
                  {timeStr}
                </p>
              </div>
              <div className="pb-0.5">
                <p className="font-mono text-[8px] text-muted-foreground/25 tracking-[0.4em] mb-0.5">DATA</p>
                <p className="font-mono text-sm text-primary/65 tracking-widest font-semibold">{dayStr}</p>
                <p className="font-mono text-sm text-primary/45 tracking-widest">{dateStr}</p>
              </div>
            </div>

            {/* Status pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'STATUS', value: 'OPERACIONAL', color: '#4ade80' },
                { label: 'SETOR',  value: 'NEEXT',        color: '#f5c518' },
                { label: 'DEFCON', value: '3',            color: '#f5c518' },
                { label: 'RAD',    value: '0.02/H',       color: '#4ade80' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.025] px-2.5 py-1">
                  <span className="font-mono text-[8px] text-muted-foreground/25 tracking-widest">{label}</span>
                  <span className="font-mono text-[10px] font-bold tracking-wider" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
      </motion.div>

      {/* ════ ESTATÍSTICAS ════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="grid grid-cols-1 gap-4"
      >
        {stats.map(({ id, label, sub, count, barLabel, color, border }) => (
          <div
            key={id}
            className="rounded-xl overflow-hidden border"
            style={{ borderColor: border, background: 'linear-gradient(160deg, hsl(220 38% 9%), hsl(220 42% 7%))' }}
          >
            <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
            <div className="px-5 py-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[8px] tracking-[0.4em] mb-0.5" style={{ color, opacity: 0.5 }}>{sub}</p>
                  <p className="font-display text-xl font-bold tracking-[0.2em]" style={{ color }}>{label}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[8px] text-muted-foreground/30 tracking-[0.3em] mb-0.5">TOTAL</p>
                  <p className="font-mono text-4xl font-bold tabular-nums leading-none" style={{ color, filter: `drop-shadow(0 0 8px ${color}66)` }}>
                    {String(count).padStart(2, '0')}
                  </p>
                </div>
              </div>
              <StatBar label={barLabel} value={count} max={maxCount} color={color} />
            </div>
          </div>
        ))}
      </motion.div>

      {/* ════ SISTEMA ════ */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="rounded-xl border border-white/5 overflow-hidden"
        style={{ background: 'hsl(220 38% 8% / 0.7)' }}
      >
        <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2">
          <Activity size={11} className="text-primary/50" />
          <span className="font-mono text-[9px] text-muted-foreground/30 tracking-[0.3em]">DIAGNÓSTICO DO SISTEMA</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/5">
          {[
            { label: 'PROCESSADOR', value: 'ONLINE',    ok: true  },
            { label: 'SEGURANÇA',   value: 'ATIVA',     ok: true  },
            { label: 'BANCO',       value: 'SINCRON.',  ok: true  },
            { label: 'REDE',        value: 'ESTÁVEL',   ok: true  },
          ].map(({ label, value, ok }) => (
            <div key={label} className="px-3 py-3 flex flex-col gap-1">
              <span className="font-mono text-[8px] text-muted-foreground/25 tracking-[0.25em]">{label}</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ boxShadow: ok ? '0 0 5px #22c55e' : '0 0 5px #ef4444' }} />
                <span className="font-mono text-[10px] font-bold tracking-wider text-foreground/60">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ════ QUOTE ════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.24 }}
        className="rounded-xl border border-primary/8 px-5 py-4"
        style={{ background: 'hsl(220 38% 8% / 0.6)' }}
      >
        <div className="flex gap-3 items-center">
          <div className="text-4xl text-primary/12 font-serif leading-none select-none">"</div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] sm:text-xs text-muted-foreground/55 italic leading-relaxed">{quote}</p>
            <p className="font-mono text-[9px] text-primary/25 tracking-widest mt-1.5">{source}</p>
          </div>
          <div className="text-4xl text-primary/12 font-serif leading-none select-none self-end">"</div>
        </div>
      </motion.div>

      {/* ════ AVISO ════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-primary/8 overflow-hidden"
        style={{ background: 'hsl(220 38% 8% / 0.6)' }}
      >
        <div className="flex items-stretch">
          <div className="w-[5px] shrink-0" style={{
            background: 'repeating-linear-gradient(135deg, #f5c518 0px, #f5c518 4px, transparent 4px, transparent 8px)',
          }} />
          <div className="px-4 sm:px-5 py-4">
            <p className="font-mono text-[9px] text-primary/45 tracking-[0.3em] mb-2">
              ☢ PROTOCOLO 7-G — VAULT-TEC SECURITY ADVISORY
            </p>
            <div className="space-y-1 font-mono text-[10px] text-muted-foreground/40 leading-relaxed">
              <p>— Acesso não autorizado: <span className="text-red-400/60">AMEAÇA NÍVEL VERMELHO</span></p>
              <p>— Divulgação de dados classificados: punível conforme o Artigo 12 do Código Vault-Tec</p>
              <p>— Brecha detectada: acione imediatamente o <span className="text-primary/55">Protocolo DEFCON-1</span></p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.36 }}
        className="text-center font-mono text-[9px] text-muted-foreground/18 tracking-[0.4em]"
      >
        VAULT-TEC INDUSTRIES © 2077 — TODOS OS DIREITOS RESERVADOS
      </motion.p>
    </div>
  );
}
