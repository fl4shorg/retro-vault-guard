import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
];

const DAYS = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const quoteIdx = Math.floor(Math.random() * FALLOUT_QUOTES.length);

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
        <radialGradient id="clkFace" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#13172200" />
          <stop offset="100%" stopColor="#080b1100" />
        </radialGradient>
      </defs>

      {/* Outer glow ring */}
      <circle cx={cx} cy={cy} r={R + 5} fill="none" stroke="#f5c518" strokeWidth="0.4" opacity="0.15" filter="url(#clkGlow)" />
      {/* Outer border */}
      <circle cx={cx} cy={cy} r={R + 1} fill="none" stroke="#f5c518" strokeWidth="1.8" opacity="0.6" />
      {/* Inner border */}
      <circle cx={cx} cy={cy} r={R - 1} fill="none" stroke="#f5c51825" strokeWidth="0.5" />

      {/* Tick marks */}
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

      {/* Hour numerals */}
      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
        const rad = (i * 30 - 90) * (Math.PI / 180);
        const nr = R - 20;
        return <text key={n} x={cx + nr * Math.cos(rad)} y={cy + nr * Math.sin(rad)}
          textAnchor="middle" dominantBaseline="central"
          fontSize="9" fontFamily="Share Tech Mono, monospace" fontWeight="bold"
          fill="#f5c518" style={{ filter: 'drop-shadow(0 0 2px #f5c518aa)' }}>{n}</text>;
      })}

      {/* Inner decoration */}
      <circle cx={cx} cy={cy} r={26} fill="none" stroke="#f5c51815" strokeWidth="1" />
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize="5.5"
        fontFamily="Share Tech Mono, monospace" fill="#f5c518" opacity="0.6" letterSpacing="2">VAULT-TEC</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="4"
        fontFamily="Share Tech Mono, monospace" fill="#f5c51870" letterSpacing="1">v3.11</text>

      {/* Hands */}
      {tailLine(hourDeg, 10, 5, '#f5c518')}
      {handLine(hourDeg, 42, 5, '#f5c518')}
      {tailLine(minDeg, 12, 3, '#f5c518')}
      {handLine(minDeg, 60, 3, '#f5c518')}
      {tailLine(secDeg, 14, 1.5, '#ff5555')}
      {handLine(secDeg, 68, 1.5, '#ff5555')}

      {/* Cap */}
      <circle cx={cx} cy={cy} r={5} fill="#f5c518" filter="url(#clkGlow)" />
      <circle cx={cx} cy={cy} r={2} fill="#0a0c14" />
    </svg>
  );
}

/* ── Stat bar (Pip-Boy HP style) ── */
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
  const maxCount = Math.max(totalFBI, totalSKUR, totalRegras, totalProtocols, 1);

  return (
    <div className="space-y-5 pb-10">

      {/* ════ PAINEL PRINCIPAL — Clock + Welcome ════ */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl border border-primary/25 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, hsl(220 38% 9%), hsl(220 42% 6%))' }}
      >
        {/* Top accent */}
        <div className="h-[3px] bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="flex flex-col sm:flex-row gap-0">
          {/* Clock column */}
          <div className="flex flex-col items-center justify-center px-6 py-6 sm:border-r border-primary/10 shrink-0">
            <div className="relative" style={{ width: 170, height: 170 }}>
              <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                background: 'radial-gradient(circle, hsl(45 100% 55% / 0.12), transparent 70%)',
                filter: 'blur(16px)',
              }} />
              <ClockFace time={time} />
            </div>
          </div>

          {/* Info column */}
          <div className="flex-1 flex flex-col justify-center px-6 py-6 gap-5">
            {/* Agent label */}
            <div>
              <p className="font-mono text-[9px] text-primary/40 tracking-[0.5em] mb-2">// AGENTE AUTORIZADO — VAULT 101</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-[0.12em] leading-tight">
                <span className="text-muted-foreground/50 text-lg">BEM-VINDO,</span>
                <br />
                <span className="text-primary vault-text-glow">{userName.toUpperCase()}</span>
              </h1>
            </div>

            {/* Divider */}
            <div className="h-px bg-primary/10" />

            {/* Digital time + date */}
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="font-mono text-[8px] text-muted-foreground/30 tracking-[0.4em] mb-0.5">HORA LOCAL</p>
                <p className="font-mono text-3xl font-bold text-primary tracking-widest tabular-nums vault-text-glow">
                  {timeStr}
                </p>
              </div>
              <div className="pb-0.5">
                <p className="font-mono text-[8px] text-muted-foreground/30 tracking-[0.4em] mb-0.5">DATA</p>
                <p className="font-mono text-sm text-primary/70 tracking-widest font-semibold">{dayStr}</p>
                <p className="font-mono text-sm text-primary/50 tracking-widest">{dateStr}</p>
              </div>
            </div>

            {/* Status pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'STATUS', value: 'OPERACIONAL', color: '#4ade80' },
                { label: 'SETOR', value: 'NEEXT', color: '#f5c518' },
                { label: 'DEFCON', value: '3', color: '#f5c518' },
                { label: 'RAD', value: '0.02/H', color: '#4ade80' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-1.5 rounded border border-white/5 bg-white/[0.03] px-2.5 py-1">
                  <span className="font-mono text-[8px] text-muted-foreground/30 tracking-widest">{label}</span>
                  <span className="font-mono text-[10px] font-bold tracking-wider" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </motion.div>

      {/* ════ ESTATÍSTICAS ════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="grid grid-cols-1 gap-4"
      >
        {[
          { id: 'fbi',       label: 'F.B.I',       sub: 'DIVISÃO OPERACIONAL', count: totalFBI,       barLabel: 'CARGOS REGISTRADOS', color: '#60a5fa', borderColor: 'hsl(215 80% 50% / 0.2)' },
          { id: 'skur',      label: 'S.K.U.R',      sub: 'DIVISÃO OPERACIONAL', count: totalSKUR,      barLabel: 'CARGOS REGISTRADOS', color: '#f5c518', borderColor: 'hsl(45 100% 50% / 0.2)'  },
          { id: 'regras',    label: 'ARTIGOS',       sub: 'REGULAMENTO VAULT',   count: totalRegras,    barLabel: 'ARTIGOS ATIVOS',     color: '#a78bfa', borderColor: 'hsl(265 80% 50% / 0.2)' },
          { id: 'protocols', label: 'PROTOCOLOS',    sub: 'SEGURANÇA DEFCON',    count: totalProtocols, barLabel: 'NÍVEIS ATIVOS',      color: '#f87171', borderColor: 'hsl(0 70% 50% / 0.2)'   },
        ].map(({ id, label, sub, count, barLabel, color, borderColor }) => (
          <div
            key={id}
            className="rounded-xl overflow-hidden border"
            style={{ borderColor, background: 'linear-gradient(160deg, hsl(220 38% 9%), hsl(220 42% 7%))' }}
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

      {/* ════ QUOTE ════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.22 }}
        className="rounded-xl border border-primary/10 px-6 py-4"
        style={{ background: 'hsl(220 38% 8% / 0.6)' }}
      >
        <div className="flex gap-4 items-center">
          <div className="text-4xl text-primary/15 font-serif leading-none select-none">"</div>
          <div>
            <p className="font-mono text-xs text-muted-foreground/60 italic leading-relaxed">{quote}</p>
            <p className="font-mono text-[10px] text-primary/30 tracking-widest mt-1.5">{source}</p>
          </div>
          <div className="text-4xl text-primary/15 font-serif leading-none select-none self-end">"</div>
        </div>
      </motion.div>

      {/* ════ AVISO ════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-primary/10 overflow-hidden"
        style={{ background: 'hsl(220 38% 8% / 0.6)' }}
      >
        <div className="flex items-stretch">
          {/* Hazard strip */}
          <div className="w-[6px] shrink-0" style={{
            background: 'repeating-linear-gradient(135deg, #f5c518 0px, #f5c518 4px, transparent 4px, transparent 8px)',
          }} />
          <div className="px-5 py-4">
            <p className="font-mono text-[9px] text-primary/50 tracking-[0.35em] mb-2.5">
              ☢ PROTOCOLO 7-G — VAULT-TEC SECURITY ADVISORY
            </p>
            <div className="space-y-1.5 font-mono text-[10px] text-muted-foreground/45 leading-relaxed">
              <p>— Acesso não autorizado: <span className="text-red-400/70">AMEAÇA NÍVEL VERMELHO</span></p>
              <p>— Divulgação de dados classificados: punível conforme o Artigo 12 do Código Vault-Tec</p>
              <p>— Brecha detectada: acione imediatamente o <span className="text-primary/60">Protocolo DEFCON-1</span></p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.38 }}
        className="text-center font-mono text-[9px] text-muted-foreground/20 tracking-[0.4em]"
      >
        VAULT-TEC INDUSTRIES © 2077 — TODOS OS DIREITOS RESERVADOS
      </motion.p>
    </div>
  );
}
