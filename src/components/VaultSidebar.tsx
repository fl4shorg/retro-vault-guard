import { Briefcase, ShieldAlert, X, Radiation, ChevronRight, MessageSquare, Gavel, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VaultSidebarProps {
  open: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClose: () => void;
}

const sections = [
  { id: 'inicio', label: 'INÍCIO', desc: 'Bem-vindo ao Dossiê Operacional', icon: Home },
  { id: 'fbi', label: 'CARGOS FBI', desc: 'Cargos Operacionais do FBI', icon: Briefcase },
  { id: 'skur', label: 'CARGOS SKUR', desc: 'Cargos Operacionais do SKUR', icon: Briefcase },
  { id: 'protocolos', label: 'PROTOCOLOS', desc: 'Protocolos de Segurança DEFCON', icon: ShieldAlert },
  { id: 'regras', label: 'REGRAS', desc: 'Regulamento Oficial Vault-Tec', icon: Gavel },
  { id: 'chat', label: 'VAULT COMMS', desc: 'Canal de Comunicação Operacional', icon: MessageSquare },
];

const VaultSidebar = ({ open, activeSection, onSectionChange, onClose }: VaultSidebarProps) => (
  <>
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="fixed top-0 left-0 w-[280px] h-full z-50 flex flex-col overflow-hidden border-r border-primary/20"
          style={{ background: 'linear-gradient(180deg, hsl(220 35% 10%), hsl(220 40% 6%))' }}
        >
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Radiation size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-display text-xs font-bold text-primary tracking-[0.2em] vault-text-glow">
                  VAULT-TEC
                </p>
                <p className="font-mono text-[9px] text-muted-foreground tracking-widest">
                  TERMINAL v3.11
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-border/40 hover:border-primary/50 hover:bg-primary/10 transition-all text-muted-foreground hover:text-primary"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scanline decoration */}
          <div className="px-5 pt-5 pb-2">
            <p className="font-mono text-[10px] text-primary/50 tracking-[0.3em] flex items-center gap-2">
              <span className="h-px flex-1 bg-primary/20" />
              SEÇÕES
              <span className="h-px flex-1 bg-primary/20" />
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-2 overflow-y-auto">
            {sections.map(({ id, label, desc, icon: Icon }, index) => {
              const isActive = activeSection === id;
              return (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.15 }}
                  onClick={() => { onSectionChange(id); onClose(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-lg transition-all relative group ${
                    isActive
                      ? 'bg-primary/15 border border-primary/40'
                      : 'border border-transparent hover:bg-muted/30 hover:border-border/30'
                  }`}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary"
                      style={{ boxShadow: '0 0 12px hsl(var(--primary) / 0.6)' }}
                    />
                  )}

                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? 'bg-primary/20 border border-primary/40'
                      : 'bg-muted/30 border border-border/30 group-hover:border-primary/20'
                  }`}>
                    <Icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
                  </div>

                  <div className="flex-1 text-left">
                    <p className={`font-display text-sm font-bold tracking-wider ${
                      isActive ? 'text-primary vault-text-glow' : 'text-foreground/80 group-hover:text-foreground'
                    }`}>
                      {label}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground/60 mt-0.5">
                      {desc}
                    </p>
                  </div>

                  <ChevronRight size={14} className={`shrink-0 transition-all ${
                    isActive ? 'text-primary' : 'text-muted-foreground/30 group-hover:text-muted-foreground/60'
                  }`} />
                </motion.button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ boxShadow: '0 0 8px hsl(var(--primary) / 0.5)' }} />
              <p className="font-mono text-[9px] text-muted-foreground/50 tracking-widest">
                SISTEMA OPERACIONAL
              </p>
            </div>
            <p className="font-mono text-[9px] text-muted-foreground/30 tracking-[0.3em] mt-1">
              VAULT-TEC INDUSTRIES © 2077
            </p>
          </div>

          {/* Bottom accent */}
          <div className="h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent shrink-0" />
        </motion.aside>
      )}
    </AnimatePresence>
  </>
);

export default VaultSidebar;
