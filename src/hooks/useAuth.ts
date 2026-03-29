import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    const mobile = isMobileDevice();
    // Usa a URL atual da página (sem hash/query), funciona em qualquer subpath
    const callbackUrl = window.location.href.split('#')[0].split('?')[0];

    if (mobile) {
      // Em celular popup é bloqueado — usa redirect direto para o domínio raiz
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl },
      });
      if (error) throw error;
      return;
    }

    // Desktop: abre popup centralizado
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        skipBrowserRedirect: true,
        redirectTo: callbackUrl,
      },
    });
    if (error) throw error;
    if (!data.url) throw new Error('URL OAuth não retornada');

    const width = 500;
    const height = 620;
    const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - height) / 2);

    const popup = window.open(
      data.url,
      'google-oauth-popup',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    if (!popup || popup.closed) {
      // Popup bloqueado pelo navegador — fallback para redirect
      const { error: fallbackError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: callbackUrl },
      });
      if (fallbackError) throw fallbackError;
      return;
    }

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

      // Timeout de 5 minutos
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
