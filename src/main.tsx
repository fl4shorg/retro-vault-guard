import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import "./index.css";

const hash = window.location.hash;
const search = window.location.search;

// Detecta retorno OAuth tanto pelo hash (implicit) quanto por query params (PKCE)
const isAuthCallback =
  hash.startsWith('#access_token=') ||
  hash.startsWith('#error=') ||
  (search.includes('code=') && search.includes('state=')) ||
  search.includes('error=invalid_request') ||
  search.includes('error_code=');

createRoot(document.getElementById("root")!).render(
  isAuthCallback ? <AuthCallback /> : <App />
);
