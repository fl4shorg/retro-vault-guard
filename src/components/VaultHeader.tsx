import { LogOut, Menu, X, Radio } from 'lucide-react';
import VaultSettings from './VaultSettings';

interface VaultHeaderProps {
  userName: string | null;
  isLoggedIn: boolean;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onLogout: () => void;
  positionFixed?: boolean;
}

const VaultHeader = ({ userName, isLoggedIn, sidebarOpen, onToggleSidebar, onLogout, positionFixed }: VaultHeaderProps) => (
  <header className={`${positionFixed ? 'fixed top-0 left-0 right-0' : 'sticky top-0'} z-50 border-b-2 border-primary/40`} style={{ background: 'linear-gradient(180deg, hsl(220 35% 11%), hsl(220 35% 8%))' }}>
    {/* Yellow accent bar */}
    <div className="h-[3px] bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
    <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
      <div className="flex items-center gap-3">
        {isLoggedIn && (
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-lg flex items-center justify-center border border-border/60 hover:border-primary/50 hover:bg-primary/10 transition-all text-foreground"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/archive/1/12/20210824090008%21Vault-Tec_Logo.svg"
              alt="Vault-Tec"
              className="w-9 h-9 sm:w-11 sm:h-11"
              style={{ filter: 'brightness(0) saturate(100%) invert(82%) sepia(60%) saturate(700%) hue-rotate(5deg) brightness(105%)' }}
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-[0.2em] text-primary vault-text-glow leading-none">
              VAULT-TEC
            </h1>
            <p className="font-mono text-[8px] sm:text-[9px] text-muted-foreground tracking-[0.25em] mt-0.5">
              DOSSIÊ OPERACIONAL NEEXT
            </p>
          </div>
        </div>
      </div>

      {isLoggedIn && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-muted/40 border border-border/50 rounded-lg px-3 py-1.5">
            <Radio size={10} className="text-primary animate-pulse" />
            <span className="font-mono text-xs text-muted-foreground">
              <span className="text-primary font-semibold">{userName}</span>
            </span>
          </div>
          <VaultSettings />
          <button
            onClick={onLogout}
            className="w-10 h-10 rounded-lg flex items-center justify-center border border-border/60 hover:border-destructive/50 hover:bg-destructive/10 transition-all text-muted-foreground hover:text-destructive"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </div>
  </header>
);

export default VaultHeader;
