import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import Login from "./pages/Login.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import "./index.css";

const hash = window.location.hash;
const search = window.location.search;

// 1. Retorno OAuth (tokens no hash ou código PKCE em query params)
const isAuthCallback =
  hash.startsWith('#access_token=') ||
  hash.startsWith('#error=') ||
  (search.includes('code=') && search.includes('state=')) ||
  search.includes('error_code=');

// 2. App (HashRouter) — quando o hash começa com #/ (rota do app)
const isApp = hash.startsWith('#/');

// 3. Tudo o mais é a tela de login (URL limpa, sem hash de app)
createRoot(document.getElementById("root")!).render(
  isAuthCallback ? <AuthCallback /> : isApp ? <App /> : <Login />
);
