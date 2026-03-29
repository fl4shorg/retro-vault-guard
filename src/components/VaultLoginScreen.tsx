import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Rocket, ArrowRight, Key, Loader2, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

interface VaultLoginScreenProps {
  onSignUp: (email: string, password: string, nome: string) => Promise<void>;
  onSignIn: (email: string, password: string) => Promise<void>;
  onGetGoogleUrl: () => Promise<string>;
  onResetPassword: (email: string) => Promise<void>;
}

const VaultLoginScreen = ({ onSignUp, onSignIn, onGetGoogleUrl, onResetPassword }: VaultLoginScreenProps) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showForgot, setShowForgot] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    let oauthUrl: string;
    try {
      oauthUrl = await onGetGoogleUrl();
    } catch (err: any) {
      setGoogleLoading(false);
      toast.error(err.message || 'Erro ao obter URL do Google');
      return;
    }
    setGoogleLoading(false);

    // Abre o SweetAlert2 com o botão de confirmar.
    // O preConfirm é chamado direto no clique do usuário (gesto síncrono),
    // então window.open NÃO é bloqueado em celular nem desktop.
    await Swal.fire({
      background: '#0f1117',
      color: '#f5c518',
      title: '<span style="font-family:\'Courier New\',monospace;letter-spacing:0.15em;font-size:1rem">AUTENTICAR VIA GOOGLE</span>',
      html: `
        <div style="font-family:'Courier New',monospace;font-size:0.78rem;color:#a0a0b0;line-height:1.6">
          Toque em <strong style="color:#f5c518">ABRIR GOOGLE</strong> para autenticar.<br/>
          Após o login, esta janela fecha automaticamente.
        </div>
      `,
      confirmButtonText: '→ ABRIR GOOGLE',
      showCancelButton: true,
      cancelButtonText: 'CANCELAR',
      reverseButtons: true,
      focusConfirm: false,
      customClass: {
        popup: 'vault-swal-popup',
        confirmButton: 'vault-swal-confirm',
        cancelButton: 'vault-swal-cancel',
        title: 'vault-swal-title',
      },
      preConfirm: () => {
        // Chamado sincronamente no clique — popup nunca bloqueado
        window.open(oauthUrl, '_blank');
      },
    });
  };

  const inputClass = "w-full bg-muted/60 border border-border/60 rounded px-4 py-3 pl-11 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all font-mono text-sm";
  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60";

  return (
    <>
      {/* SweetAlert2 global styles */}
      <style>{`
        .vault-swal-popup {
          border: 1px solid rgba(245, 197, 24, 0.25) !important;
          border-radius: 10px !important;
        }
        .vault-swal-confirm {
          background: #f5c518 !important;
          color: #0a0a0a !important;
          font-family: 'Courier New', monospace !important;
          font-weight: 700 !important;
          letter-spacing: 0.1em !important;
          font-size: 0.8rem !important;
          border-radius: 6px !important;
          padding: 10px 20px !important;
          border: none !important;
        }
        .vault-swal-confirm:hover {
          background: #ffd740 !important;
        }
        .vault-swal-cancel {
          background: transparent !important;
          color: #666 !important;
          font-family: 'Courier New', monospace !important;
          font-size: 0.78rem !important;
          letter-spacing: 0.08em !important;
          border: 1px solid #333 !important;
          border-radius: 6px !important;
          padding: 10px 20px !important;
        }
        .vault-swal-cancel:hover {
          background: rgba(255,255,255,0.05) !important;
          color: #999 !important;
        }
        .swal2-actions { gap: 10px !important; }
      `}</style>

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
                    <input className={inputClass} type="password" placeholder="Senha" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
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

                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-border/40" />
                    <span className="text-[10px] font-mono text-muted-foreground tracking-widest">OU</span>
                    <div className="flex-1 h-px bg-border/40" />
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    className="w-full py-3 rounded border border-border/60 text-muted-foreground font-body font-semibold text-sm hover:bg-muted/40 hover:text-foreground hover:border-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {googleLoading
                      ? <Loader2 size={16} className="animate-spin" />
                      : (
                        <svg width="16" height="16" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )
                    }
                    {googleLoading ? 'Preparando...' : 'Entrar com Google'}
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
      </div>

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
                <h3 className="font-display text-base font-bold text-foreground tracking-[0.15em] mb-1">REGISTRO CONCLUÍDO</h3>
                <p className="font-mono text-[10px] text-primary/60 tracking-widest mb-4">// PROTOCOLO DE VERIFICAÇÃO INICIADO</p>
                <div className="h-px bg-border/30 mb-4" />
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-2">Um link de verificação foi enviado para:</p>
                <div className="rounded-lg border border-primary/20 px-4 py-2.5 mb-4" style={{ background: 'hsl(220 30% 8% / 0.8)' }}>
                  <p className="font-mono text-sm text-primary font-bold tracking-wide break-all">{verifyEmail}</p>
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
                  <ArrowRight size={15} /> IR PARA O ACESSO
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
    </>
  );
};

export default VaultLoginScreen;
