import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se estamos dentro de um popup com tokens OAuth no hash, seta a sessão e fecha o popup
    if (window.opener && window.location.hash.includes('access_token')) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        supabase.auth
          .setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(() => window.close());
        return;
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUserName = (u: User | null) => {
    if (!u) return 'Habitante';
    return u.user_metadata?.nome || u.user_metadata?.full_name || u.email?.split('@')[0] || 'Habitante';
  };

  const signUp = async (email: string, password: string, nome: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome }, emailRedirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const width = 480;
    const height = 620;
    const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - height) / 2);

    // 1. Abre o popup SINCRONAMENTE (antes de qualquer await) — nunca bloqueado
    const launchUrl = `${window.location.origin}/oauth-launch.html`;
    const popup = window.open(
      launchUrl,
      'vault-google-oauth',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    if (!popup || popup.closed) {
      throw new Error('Popup bloqueado. Permita popups para este site e tente novamente.');
    }

    // 2. Busca a URL do Google (async, enquanto o popup carrega)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        skipBrowserRedirect: true,
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      popup.close();
      throw error;
    }

    if (!data.url) {
      popup.close();
      throw new Error('URL OAuth não retornada');
    }

    const oauthUrl = data.url;

    // 3. Espera o popup avisar que carregou (VAULT_POPUP_READY) antes de enviar a URL.
    //    Se a URL já estava pronta antes do sinal chegar, manda imediatamente ao receber.
    //    Timeout de segurança de 10s caso o popup não responda.
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handler);
        popup.close();
        reject(new Error('Popup não respondeu a tempo'));
      }, 10000);

      function handler(e: MessageEvent) {
        if (e.data?.type === 'VAULT_POPUP_READY') {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          popup.postMessage({ type: 'VAULT_OAUTH_URL', url: oauthUrl }, window.location.origin);
          resolve();
        }
      }

      window.addEventListener('message', handler);
    });

    // 4. Monitora o popup até fechar após login bem-sucedido
    return new Promise<void>((resolve, reject) => {
      const interval = setInterval(async () => {
        if (popup.closed) {
          clearInterval(interval);
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setUser(session.user);
            resolve();
          } else {
            reject(new Error('Login cancelado'));
          }
        }
      }, 500);

      setTimeout(() => {
        clearInterval(interval);
        if (!popup.closed) popup.close();
        reject(new Error('Tempo de login esgotado'));
      }, 5 * 60 * 1000);
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  };

  return { user, loading, getUserName, signUp, signIn, signInWithGoogle, signOut, resetPassword };
}
