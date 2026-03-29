import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  useEffect(() => {
    const isPopup = !!window.opener;

    const handleSession = async () => {
      // Aguarda o Supabase processar a sessão da URL
      const { data: { session } } = await supabase.auth.getSession();

      if (isPopup) {
        // Estamos dentro do popup — fecha e o pai busca a sessão
        window.close();
      } else {
        // Mobile redirect — vai direto pro app
        window.location.replace(window.location.origin + '/#/');
      }

      return session;
    };

    // Supabase dispara onAuthStateChange ao processar o código OAuth da URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        subscription.unsubscribe();
        if (isPopup) {
          window.close();
        } else {
          window.location.replace(window.location.origin + '/#/');
        }
      }
    });

    // Tenta obter a sessão imediatamente também
    handleSession();

    // Fallback: se nada acontecer em 5s, redireciona de volta
    const timeout = setTimeout(() => {
      if (isPopup) {
        window.close();
      } else {
        window.location.replace(window.location.origin + '/#/');
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0a0a0f',
      color: '#f5c518',
      fontFamily: 'Share Tech Mono, monospace',
      gap: '16px',
    }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" stroke="#f5c518" strokeWidth="2" opacity="0.3" />
        <circle cx="24" cy="24" r="10" stroke="#f5c518" strokeWidth="2" />
        <circle cx="24" cy="24" r="4" fill="#f5c518" />
        <line x1="24" y1="2" x2="24" y2="14" stroke="#f5c518" strokeWidth="2" />
        <line x1="24" y1="34" x2="24" y2="46" stroke="#f5c518" strokeWidth="2" />
        <line x1="2" y1="24" x2="14" y2="24" stroke="#f5c518" strokeWidth="2" />
        <line x1="34" y1="24" x2="46" y2="24" stroke="#f5c518" strokeWidth="2" />
      </svg>
      <span style={{ fontSize: '13px', letterSpacing: '0.15em', opacity: 0.8 }}>
        AUTORIZANDO ACESSO...
      </span>
    </div>
  );
}
