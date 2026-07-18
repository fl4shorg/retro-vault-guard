import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useCargos } from '@/hooks/useCargos';
import { useWallpaperContext } from '@/contexts/WallpaperContext';
import VaultBackground from '@/components/VaultBackground';
import VaultHeader from '@/components/VaultHeader';
import VaultSidebar from '@/components/VaultSidebar';
import VaultCargoList from '@/components/VaultCargoList';
import VaultProtocolList from '@/components/VaultProtocolList';
import VaultRulesList from '@/components/VaultRulesList';
import VaultChat from '@/components/VaultChat';
import VaultHome from '@/components/VaultHome';
import VaultRank from '@/components/VaultRank';
import VaultRelatorios from '@/components/VaultRelatorios';
import { useUserAccess } from '@/hooks/useUserAccess';
import { Loader2, Zap } from 'lucide-react';

const FALLOUT_QUOTES = [
  '"A guerra. A guerra nunca muda." — Ron Perlman',
  '"Nunca deveríamos ter saído do Vault." — Overseer Almodovar',
  '"O futuro pertence àqueles que sobrevivem." — Vault-Tec',
  '"Você pode fazer mais com palavras gentis e uma arma do que só com palavras gentis." — Vault City',
  '"O átomo nos une a todos." — Igreja do Átomo',
  '"Sobrevivência é minha especialidade." — Harold',
  '"A morte é apenas o começo de outra aventura." — Fallout Lore',
  '"Todo homem tem um preço. O meu só é um pouco mais alto." — Mr. House',
  '"Escolha com sabedoria, habitante. O Vault depende de você." — Vault-Tec',
  '"Melhor estar preparado para o pior. O pior sempre chega." — Overseer',
  '"A esperança é a última coisa a morrer no Ermo." — Fallout Lore',
  '"Nossas ações definem quem somos, não nossas origens." — Lone Wanderer',
  '"Se você quer paz, prepare-se para a guerra." — Brotherhood of Steel',
  '"O passado está morto. O futuro ainda pode ser salvo." — Fallout Lore',
  '"A liberdade é cara. Mas a escravidão custa ainda mais." — NCR',
];

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, getUserName, signOut } = useAuth();
  const { fbi, skur, totalFBI, totalSKUR, totalRegras, loading: cargosLoading, loadCargos } = useCargos();
  const { setCustom, reset } = useWallpaperContext();
  const { ranking, loading: rankLoading, error: rankError, fetchRanking, registerAccess } = useUserAccess();
  const totalProtocols = 4;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const randomQuote = useMemo(() => FALLOUT_QUOTES[Math.floor(Math.random() * FALLOUT_QUOTES.length)], []);

  useEffect(() => {
    if (user) loadCargos();
  }, [user, loadCargos]);

  // Sync wallpaper + register access on login
  useEffect(() => {
    if (!user) return;
    const wallpaperUrl = user.user_metadata?.wallpaper_url;
    if (wallpaperUrl) {
      setCustom(wallpaperUrl);
    } else {
      reset();
    }
    const name = getUserName(user) ?? 'Habitante';
    registerAccess(user.id, name);
  }, [user?.id]);

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

        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
          {activeSection !== 'chat' && activeSection !== 'inicio' && activeSection !== 'rank' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 vault-scanline"
              style={{
                border: '1px solid hsl(var(--primary) / 0.45)',
                background: 'linear-gradient(135deg, hsl(220 35% 8% / 0.97) 0%, hsl(220 30% 11% / 0.92) 100%)',
                boxShadow: '0 0 24px hsl(var(--primary) / 0.08), inset 0 0 40px hsl(220 40% 5% / 0.5)',
              }}
            >
              {/* Terminal header bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 py-1.5 border-b gap-0.5 sm:gap-2"
                style={{ borderColor: 'hsl(var(--primary) / 0.35)', background: 'hsl(var(--primary) / 0.07)' }}>
                <span className="font-mono text-[9px] tracking-[0.12em] sm:tracking-[0.25em] text-primary/70 uppercase">
                  ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL
                </span>
                <span className="font-mono text-[9px] tracking-widest text-primary/50">v2.3.7-STABLE</span>
              </div>

              <div className="flex items-stretch">
                {/* Left: Avatar block */}
                <div className="flex flex-col items-center justify-center gap-1.5 px-3 py-3 border-r shrink-0"
                  style={{ borderColor: 'hsl(var(--primary) / 0.25)', minWidth: 72 }}>
                  <div className="w-12 h-12 rounded-sm overflow-hidden border-2 vault-glow shrink-0 flex items-center justify-center"
                    style={{ borderColor: 'hsl(var(--primary) / 0.55)', background: 'hsl(var(--primary) / 0.08)' }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary font-bold text-xl font-mono">
                        {userName?.charAt(0).toUpperCase() || 'H'}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="font-mono text-[7px] tracking-[0.1em] text-primary/60 uppercase leading-tight">VAULT-TEC</p>
                    <p className="font-mono text-[7px] tracking-[0.1em] text-primary/60 uppercase leading-tight">CERTIFIED</p>
                  </div>
                </div>

                {/* Right: Info block */}
                <div className="flex-1 min-w-0 px-3 py-3 flex flex-col justify-between gap-2">
                  {/* Header line */}
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] text-primary/50 tracking-[0.1em] sm:tracking-[0.3em] uppercase mb-0.5 leading-snug">
                      ── IDENTIFICAÇÃO DO HABITANTE ──
                    </p>
                    <h2 className="font-display text-sm sm:text-base font-bold tracking-[0.1em] vault-text-glow flex items-baseline gap-1.5 min-w-0"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      <span className="text-primary/60 text-sm font-mono font-normal shrink-0">&gt;</span>
                      <span className="truncate">{userName}</span>
                      <span className="terminal-cursor text-primary text-xs font-mono font-normal shrink-0" />
                    </h2>
                  </div>

                  {/* Status grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-0.5 mt-0.5">
                    {[
                      { label: 'STATUS', value: 'OPERACIONAL' },
                      { label: 'ACESSO', value: 'AUTORIZADO' },
                      { label: 'SISTEMA', value: 'VAULT-TEC OS' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center gap-1 min-w-0">
                        <span className="font-mono text-[9px] text-primary shrink-0">●</span>
                        <span className="font-mono text-[9px] text-muted-foreground shrink-0">{label}:</span>
                        <span className="font-mono text-[9px] font-semibold text-primary truncate">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Boot log line — random Fallout quote */}
                  <div className="flex items-start gap-1.5 pt-1 border-t min-w-0" style={{ borderColor: 'hsl(var(--primary) / 0.15)' }}>
                    <Zap size={9} className="text-primary/60 shrink-0 mt-0.5" />
                    <p className="font-mono text-[9px] text-primary/60 tracking-[0.05em] sm:tracking-[0.1em] leading-snug italic">
                      {randomQuote}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'inicio' ? (
            <VaultHome
              userName={userName}
              totalFBI={totalFBI}
              totalSKUR={totalSKUR}
              totalRegras={totalRegras}
              totalProtocols={totalProtocols}
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
          ) : activeSection === 'rank' ? (
            <VaultRank
              ranking={ranking}
              loading={rankLoading}
              error={rankError}
              currentUserId={user.id}
              onRefresh={fetchRanking}
            />
          ) : activeSection === 'relatorios' ? (
            <VaultRelatorios />
          ) : null}
        </main>
      </div>
    </>
  );
};

export default Index;
