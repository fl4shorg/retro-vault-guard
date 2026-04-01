import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useCargos } from '@/hooks/useCargos';
import VaultBackground from '@/components/VaultBackground';
import VaultHeader from '@/components/VaultHeader';
import VaultSidebar from '@/components/VaultSidebar';
import VaultCargoList from '@/components/VaultCargoList';
import VaultProtocolList from '@/components/VaultProtocolList';
import VaultRulesList from '@/components/VaultRulesList';
import VaultChat from '@/components/VaultChat';
import VaultHome from '@/components/VaultHome';
import { Loader2, Zap } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, getUserName, signOut } = useAuth();
  const { fbi, skur, totalFBI, totalSKUR, loading: cargosLoading, loadCargos } = useCargos();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    if (user) loadCargos();
  }, [user, loadCargos]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <>
        <VaultBackground />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
            <p className="font-mono text-sm text-muted-foreground tracking-widest">INICIALIZANDO VAULT-TEC...</p>
          </div>
        </div>
      </>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url ?? null;
  const userName = getUserName(user);

  return (
    <>
      <VaultBackground />
      <div className="min-h-screen flex flex-col vault-flicker">
        <VaultHeader
          user={user}
          userName={userName}
          isLoggedIn={!!user}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogout={signOut}
        />

        <VaultSidebar
          open={sidebarOpen}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onClose={() => setSidebarOpen(false)}
        />

        <main className={`flex-1 w-full ${activeSection === 'nickname' ? 'px-0 py-0' : 'max-w-[1200px] mx-auto px-4 sm:px-6 py-6'}`}>
          {activeSection !== 'chat' && activeSection !== 'nickname' && activeSection !== 'inicio' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border/50 p-5 mb-6 vault-scanline"
              style={{ background: 'hsl(220 30% 11% / 0.8)' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/40 flex items-center justify-center vault-glow shrink-0"
                  style={{ background: 'hsl(var(--primary) / 0.1)' }}>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary font-bold text-lg font-mono">
                      {userName?.charAt(0).toUpperCase() || 'H'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-mono text-[10px] text-muted-foreground tracking-[0.3em]">// BEM-VINDO AO VAULT</p>
                  <h2 className="font-display text-lg font-bold text-foreground tracking-wider vault-text-glow">
                    Olá, <span className="text-primary">{userName}</span>
                  </h2>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <Zap size={10} className="text-primary" />
                    VAULT-TEC TERMINAL • STATUS: <span className="text-primary font-semibold">OPERACIONAL</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'inicio' ? (
            <VaultHome
              userName={userName}
              totalFBI={totalFBI}
              totalSKUR={totalSKUR}
            />
          ) : activeSection === 'fbi' ? (
            <VaultCargoList section="fbi" cargos={fbi} total={totalFBI} loading={cargosLoading} />
          ) : activeSection === 'skur' ? (
            <VaultCargoList section="skur" cargos={skur} total={totalSKUR} loading={cargosLoading} />
          ) : activeSection === 'protocolos' ? (
            <VaultProtocolList />
          ) : activeSection === 'regras' ? (
            <VaultRulesList />
          ) : activeSection === 'chat' ? (
            <VaultChat userName={userName ?? 'Habitante'} />
          ) : activeSection === 'nickname' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full overflow-hidden"
              style={{ height: 'calc(100vh - 64px)', background: 'hsl(220 30% 8%)' }}
            >
              <iframe
                src="https://www.neext.online/nickname"
                title="Nickname - Criador de Nicks"
                className="w-full h-full border-0"
                allow="clipboard-write"
              />
            </motion.div>
          ) : null}
        </main>
      </div>
    </>
  );
};

export default Index;
