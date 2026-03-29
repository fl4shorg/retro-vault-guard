import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Rocket, ArrowRight, Key, Loader2, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VaultLoginScreenProps {
  onSignUp: (email: string, password: string, nome: string) => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
}

const VaultLoginScreen = ({ onSignUp, onSignIn, onResetPassword }: VaultLoginScreenProps) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showForgot, setShowForgot] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) { toast.error('Preencha todos os campos'); return; }
    setLoading(true);
    try {
      await onSignIn(loginEmail, loginPassword);
      toast.success('Acesso autorizado. Bem-vindo ao Vault!');
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword || !regConfirm) { toast.error('Preencha todos os campos'); return; }
    if (regPassword !== regConfirm) { toast.error('As senhas não conferem'); return; }
    if (regPassword.length < 6) { toast.error('Senha deve ter pelo menos 6 caracteres'); return; }
    setLoading(true);
    try {
      await onSignUp(regEmail, regPassword, regName);
      setVerifyEmail(regEmail);
      setShowVerify(true);
      setRegName(''); setRegEmail(''); setRegPassword(''); setRegConfirm('');
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleForgot = async () => {
    if (!forgotEmail) { toast.error('Digite seu e-mail'); return; }
    setLoading(true);
    try {
      await onResetPassword(forgotEmail);
      toast.success('Link de recuperação enviado!');
      setShowForgot(false);
      setForgotEmail('');
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const inputClass = "w-full bg-muted/60 border border-border/60 rounded px-4 py-3 pl-11 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all font-mono text-sm";
  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60";

  return (
    <div className="min-h-[calc(100vh-57px)] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-20" style={{ background: 'hsl(var(--vault-yellow))' }} />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/archive/1/12/20240105055907%21Vault-Tec_Logo.svg"
              alt="Vault-Tec"
              className="w-28 h-28 mx-auto mb-4 relative"
              style={{ filter: 'brightness(0) saturate(100%) invert(82%) sepia(60%) saturate(700%) hue-rotate(5deg) brightness(105%)' }}
            />
          </div>
          <h2 className="font-display text-3xl font-bold text-primary vault-text-glow tracking-[0.3em]">
            VAULT-TEC
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-px w-8 bg-primary/40" />
            <p className="font-mono text-[10px] text-muted-foreground tracking-[0.25em]">
              DOSSIÊ OPERACIONAL NEEXT
            </p>
            <div className="h-px w-8 bg-primary/40" />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-lg overflow-hidden border border-border/60" style={{ background: 'hsl(220 30% 11% / 0.95)', backdropFilter: 'blur(20px)' }}>
          {/* Yellow top bar */}
          <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />

          <div className="p-6">
            {/* Tabs */}
            <div className="flex mb-6 bg-muted/30 rounded p-1 border border-border/30">
              {(['login', 'register'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 rounded text-xs font-display font-semibold tracking-[0.15em] transition-all ${
                    tab === t
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'login' ? 'ACESSAR' : 'REGISTRAR'}
                </button>
              ))}
            </div>

            {tab === 'login' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Mail size={16} className={iconClass} />
                  <input className={inputClass} type="email" placeholder="E-mail" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                </div>
                <div className="relative">
                  <Lock size={16} className={iconClass} />
                  <input className={inputClass} type="password" placeholder="Senha" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-3 rounded font-display font-bold text-sm tracking-[0.15em] transition-all disabled:opacity-50 flex items-center justify-center gap-2 vault-badge"
                  style={{ boxShadow: '0 0 20px hsl(45 100% 55% / 0.2)' }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  AUTORIZAR ACESSO
                </button>
                <button onClick={() => setShowForgot(true)} className="w-full text-center text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
                  <Key size={12} className="inline mr-1" /> Esqueceu a senha?
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <User size={16} className={iconClass} />
                  <input className={inputClass} type="text" placeholder="Nome" value={regName} onChange={e => setRegName(e.target.value)} />
                </div>
                <div className="relative">
                  <Mail size={16} className={iconClass} />
                  <input className={inputClass} type="email" placeholder="E-mail" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                </div>
                <div className="relative">
                  <Lock size={16} className={iconClass} />
                  <input className={inputClass} type="password" placeholder="Senha (mín. 6 caracteres)" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                </div>
                <div className="relative">
                  <Lock size={16} className={iconClass} />
                  <input className={inputClass} type="password" placeholder="Confirmar senha" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} />
                </div>
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full py-3 rounded font-display font-bold text-sm tracking-[0.15em] transition-all disabled:opacity-50 flex items-center justify-center gap-2 vault-badge"
                  style={{ boxShadow: '0 0 20px hsl(45 100% 55% / 0.2)' }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                  INICIAR REGISTRO
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Fallout Warning */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 rounded-lg border border-destructive/40 overflow-hidden"
          style={{ background: 'hsl(0 40% 12% / 0.6)' }}
        >
          <div className="flex">
            <div className="w-2 shrink-0" style={{
              background: 'repeating-linear-gradient(135deg, hsl(45 100% 50%), hsl(45 100% 50%) 4px, hsl(0 0% 10%) 4px, hsl(0 0% 10%) 8px)',
            }} />
            <div className="px-4 py-3 flex items-start gap-3">
              <span className="text-lg mt-0.5">☢</span>
              <div>
                <p className="font-display text-[10px] font-bold text-destructive tracking-[0.2em] mb-1">
                  ⚠ AVISO DE SEGURANÇA — VAULT-TEC
                </p>
                <p className="font-mono text-[10px] text-muted-foreground/70 leading-relaxed">
                  Área com níveis elevados de radiação. Acesso não autorizado resultará em exposição letal. Violadores serão processados conforme o Protocolo 7-G da Vault-Tec Industries.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-center font-mono text-[10px] text-muted-foreground/40 mt-4 tracking-[0.3em]">
          VAULT-TEC INDUSTRIES © 2077
        </p>
      </motion.div>

      {/* Email Verification Modal */}
      <AnimatePresence>
        {showVerify && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            onClick={() => setShowVerify(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="w-full max-w-sm rounded-xl overflow-hidden border border-primary/30"
              style={{ background: 'hsl(220 35% 10% / 0.98)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

              <div className="flex items-center justify-between px-5 pt-5 pb-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <Mail size={14} className="text-primary" />
                  </div>
                  <p className="font-display text-xs font-bold text-primary tracking-[0.2em] vault-text-glow">
                    VAULT-TEC COMMS
                  </p>
                </div>
                <button
                  onClick={() => setShowVerify(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-border/40 hover:border-destructive/50 hover:text-destructive text-muted-foreground transition-all"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="px-5 py-5 text-center">
                <div className="relative inline-flex mb-4">
                  <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{ background: 'hsl(var(--vault-yellow))' }} />
                  <div className="relative w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center">
                    <CheckCircle size={30} className="text-primary vault-text-glow" />
                  </div>
                </div>

                <h3 className="font-display text-base font-bold text-foreground tracking-[0.15em] mb-1">
                  REGISTRO CONCLUÍDO
                </h3>
                <p className="font-mono text-[10px] text-primary/60 tracking-widest mb-4">
                  // PROTOCOLO DE VERIFICAÇÃO INICIADO
                </p>

                <div className="h-px bg-border/30 mb-4" />

                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-2">
                  Um link de verificação foi enviado para:
                </p>
                <div className="rounded-lg border border-primary/20 px-4 py-2.5 mb-4" style={{ background: 'hsl(220 30% 8% / 0.8)' }}>
                  <p className="font-mono text-sm text-primary font-bold tracking-wide break-all">
                    {verifyEmail}
                  </p>
                </div>
                <p className="font-mono text-[11px] text-muted-foreground/60 leading-relaxed">
                  Acesse seu e-mail e clique no link para ativar seu acesso ao Vault. Verifique também a pasta de spam.
                </p>
              </div>

              <div className="px-5 pb-5">
                <button
                  onClick={() => { setShowVerify(false); setTab('login'); }}
                  className="w-full py-3 rounded font-display font-bold text-sm tracking-[0.15em] transition-all flex items-center justify-center gap-2 vault-badge active:scale-[0.98]"
                >
                  <ArrowRight size={15} />
                  IR PARA O ACESSO
                </button>
              </div>

              <div className="h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4" onClick={() => setShowForgot(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-lg border border-border/60 p-6 w-full max-w-sm"
            style={{ background: 'hsl(220 30% 11% / 0.97)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 -mt-6 -mx-6 mb-5 rounded-t-lg" />
            <h3 className="font-display text-lg font-bold text-primary mb-2 tracking-[0.15em]">RECUPERAR SENHA</h3>
            <p className="font-mono text-xs text-muted-foreground mb-4">Digite seu e-mail para receber o link de recuperação.</p>
            <div className="relative mb-4">
              <Mail size={16} className={iconClass} />
              <input className={inputClass} type="email" placeholder="Seu e-mail" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
            </div>
            <button
              onClick={handleForgot}
              disabled={loading}
              className="w-full py-3 rounded font-display font-bold text-sm tracking-[0.15em] transition-all disabled:opacity-50 flex items-center justify-center gap-2 vault-badge"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              ENVIAR LINK
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VaultLoginScreen;
