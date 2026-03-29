import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase OAuth callback: tokens arrive in the URL hash.
    // HashRouter treats the hash as a route, so it ends up here.
    // Redirect to home so Supabase can process the session.
    const hash = window.location.hash;
    if (hash.includes("access_token") || hash.includes("error_description")) {
      navigate("/", { replace: true });
      return;
    }

    console.error("404 Error: User attempted to access non-existent route:", window.location.href);
  }, [navigate]);

  // If there's an auth token in the hash, don't render 404 — redirect is in progress.
  if (window.location.hash.includes("access_token") || window.location.hash.includes("error_description")) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/#/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
