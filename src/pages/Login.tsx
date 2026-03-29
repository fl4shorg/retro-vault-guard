import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/hooks/useTheme.tsx';
import VaultBackground from '@/components/VaultBackground';
import VaultLoginScreen from '@/components/VaultLoginScreen';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

function LoginInner() {
  const { user, loading, signUp, signIn, signInWithGoogle, resetPassword } = useAuth();

  const goToApp = () => {
    window.location.replace(window.location.pathname + '#/');
  };

  useEffect(() => {
    if (!loading && user) {
      goToApp();
    }
  }, [user, loading]);

  if (loading) {
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

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
    goToApp();
  };

  return (
    <>
      <VaultBackground />
      <VaultLoginScreen
        onSignUp={signUp}
        onSignIn={handleSignIn}
        onGoogleSignIn={signInWithGoogle}
        onResetPassword={resetPassword}
      />
    </>
  );
}

export default function Login() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Toaster />
        <Sonner
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(220 30% 12% / 0.97)',
              border: '1px solid hsl(45 40% 22% / 0.5)',
              color: 'hsl(45 100% 90%)',
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '13px',
            },
          }}
        />
        <LoginInner />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
