import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import "./index.css";

const isAuthCallback = window.location.pathname === '/auth/callback';

createRoot(document.getElementById("root")!).render(
  isAuthCallback ? <AuthCallback /> : <App />
);
