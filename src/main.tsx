import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import "./index.css";

// Detecta callback OAuth tanto pelo path quanto por tokens no hash (quando o servidor
// não suporta /auth/callback e o Supabase redireciona pro domínio raiz)
const isAuthCallback =
  window.location.pathname === '/auth/callback' ||
  window.location.hash.startsWith('#access_token=');

createRoot(document.getElementById("root")!).render(
  isAuthCallback ? <AuthCallback /> : <App />
);
