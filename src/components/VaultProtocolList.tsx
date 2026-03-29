import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, AlertTriangle, ShieldAlert, Radio, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Protocol {
  level: string;
  title: string;
  severity: 'maximum' | 'critical' | 'alert' | 'elevated';
  description: string;
  details: string[];
}

const protocols: Protocol[] = [
  {
    level: 'DEFCON 1',
    title: 'Emergência Máxima',
    severity: 'maximum',
    description: 'Estado de colapso ou ameaça extrema.',
    details: [
      'Todos os protocolos de emergência são executados. A situação exige resposta imediata e total, com prioridade máxima na contenção e controle.',
      'Apenas o número proprietário da Neext e os Imperadores podem ter adm.',
    ],
  },
  {
    level: 'DEFCON 2',
    title: 'Estado Crítico',
    severity: 'critical',
    description: 'Risco elevado e iminente.',
    details: [
      'Medidas de emergência são ativadas. O sistema opera em capacidade máxima de resposta, com preparação imediata para contenção total.',
      'Apenas Diretores podem manter acesso administrativo. Todos os demais administradores devem ser removidos.',
      'Verificações rigorosas de membros devem ser realizadas, incluindo análise de IDs e validação de informações.',
    ],
  },
  {
    level: 'DEFCON 3',
    title: 'Estado de Alerta',
    severity: 'alert',
    description: 'Situação de risco moderado.',
    details: [
      'O sistema entra em prontidão elevada, com redução no tempo de resposta e início de protocolos de contenção.',
      'Múltiplas ameaças identificadas no radar. O Ministro da Defesa deve ativar o protocolo imediatamente.',
      'Todos os IDs devem ser verificados, e as informações analisadas para identificação de possíveis invasores.',
    ],
  },
  {
    level: 'DEFCON 4',
    title: 'Atenção Elevada',
    severity: 'elevated',
    description: 'Nível de vigilância aumentado.',
    details: [
      'Atividades fora do padrão estão sendo monitoradas. Medidas preventivas são iniciadas para evitar possíveis incidentes.',
      'Deve ser ativado quando houver dois ou mais suspeitos identificados no radar.',
    ],
  },
];

const severityConfig = {
  maximum: {
    icon: ShieldAlert,
    barColor: 'bg-red-500',
    glowColor: '0 0 20px hsl(0 80% 50% / 0.4)',
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40',
    accentColor: 'hsl(0, 80%, 50%)',
  },
  critical: {
    icon: AlertTriangle,
    barColor: 'bg-orange-500',
    glowColor: '0 0 20px hsl(25 90% 50% / 0.4)',
    badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    accentColor: 'hsl(25, 90%, 50%)',
  },
  alert: {
    icon: Radio,
    barColor: 'bg-yellow-500',
    glowColor: '0 0 20px hsl(45 90% 50% / 0.3)',
    badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    accentColor: 'hsl(45, 90%, 50%)',
  },
  elevated: {
    icon: Eye,
    barColor: 'bg-primary',
    glowColor: '0 0 20px hsl(var(--primary) / 0.3)',
    badgeClass: 'bg-primary/20 text-primary border-primary/40',
    accentColor: 'hsl(var(--primary))',
  },
};

const ProtocolCard = ({ protocol, index }: { protocol: Protocol; index: number }) => {
  const [copied, setCopied] = useState(false);
  const config = severityConfig[protocol.severity];
  const Icon = config.icon;

  const fullText = `${protocol.level}, ${protocol.title}\n\n${protocol.description}\n\n${protocol.details.join('\n\n')}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      toast.success(`${protocol.level} copiado!`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl overflow-hidden border border-border/40"
      style={{ background: 'hsl(220 30% 11% / 0.6)', boxShadow: config.glowColor }}
    >
      {/* Top severity bar */}
      <div className={`h-1.5 ${config.barColor}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center border"
              style={{
                background: `${config.accentColor.replace(')', ' / 0.15)')}`,
                borderColor: `${config.accentColor.replace(')', ' / 0.4)')}`,
              }}
            >
              <Icon size={22} style={{ color: config.accentColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-foreground tracking-wider">
                  {protocol.level}
                </h3>
                <span className={`text-[10px] font-mono font-bold tracking-[0.15em] px-2 py-0.5 rounded border ${config.badgeClass}`}>
                  {protocol.title.toUpperCase()}
                </span>
              </div>
              <p className="font-mono text-[10px] text-muted-foreground/60 tracking-widest mt-0.5">
                // PROTOCOLO DE SEGURANÇA
              </p>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-10 h-10 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 active:scale-95 transition-all flex items-center justify-center shrink-0"
            title="Copiar protocolo"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>

        {/* Description */}
        <p className="font-body text-sm font-semibold text-foreground/90 mb-3">
          {protocol.description}
        </p>

        {/* Details */}
        <div className="space-y-2.5">
          {protocol.details.map((detail, i) => (
            <div key={i} className="flex gap-3">
              <div className={`w-1 shrink-0 rounded-full mt-1 ${config.barColor} opacity-60`} />
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {detail}
              </p>
            </div>
          ))}
        </div>

        {/* Scanline footer */}
        <div className="mt-4 pt-3 border-t border-border/20">
          <p className="font-mono text-[9px] text-muted-foreground/40 tracking-[0.3em]">
            VAULT-TEC SECURITY PROTOCOL • NÍVEL {4 - index} DE CLEARANCE
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const VaultProtocolList = () => {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded flex items-center justify-center bg-primary/10 border border-primary/20">
            <ShieldAlert size={20} className="text-primary" />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground tracking-wider">
            Protocolos
          </h2>
        </div>
        <div className="vault-badge rounded px-4 py-1.5 text-[11px]">
          {protocols.length} PROTOCOLOS
        </div>
      </div>

      {/* Warning banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-red-500/30 p-4 mb-6 flex items-center gap-3"
        style={{ background: 'hsl(0 60% 15% / 0.2)' }}
      >
        <AlertTriangle size={18} className="text-red-400 shrink-0" />
        <p className="font-mono text-xs text-red-400/90 tracking-wide">
          DOCUMENTOS CLASSIFICADOS — ACESSO RESTRITO A PESSOAL AUTORIZADO
        </p>
      </motion.div>

      {/* Protocol cards */}
      <div className="space-y-5">
        {protocols.map((protocol, i) => (
          <ProtocolCard key={protocol.level} protocol={protocol} index={i} />
        ))}
      </div>
    </div>
  );
};

export default VaultProtocolList;
