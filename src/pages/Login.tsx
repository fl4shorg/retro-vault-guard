import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import VaultBackground from '@/components/VaultBackground';
import VaultHeader from '@/components/VaultHeader';
import VaultLoginScreen from '@/components/VaultLoginScreen';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const { user, loading, signUp, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

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
  };

  return (
    <>
      <VaultBackground />
      <div className="min-h-screen flex flex-col pt-[57px]">
        <VaultHeader
          userName={null}
          isLoggedIn={false}
          sidebarOpen={false}
          onToggleSidebar={() => {}}
          onLogout={() => {}}
          positionFixed
        />
        <VaultLoginScreen
          onSignUp={signUp}
          onSignIn={handleSignIn}
          onResetPassword={resetPassword}
        />
      </div>
    </>
  );
}
