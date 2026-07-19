import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./hooks/useTheme.tsx";
import { WallpaperProvider } from "./contexts/WallpaperContext.tsx";
import { WeatherProvider } from "./contexts/WeatherContext.tsx";
import VaultWeather from "./components/VaultWeather.tsx";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <WallpaperProvider>
      <WeatherProvider>
      <VaultWeather />
      <TooltipProvider>
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
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
      </WeatherProvider>
      </WallpaperProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
