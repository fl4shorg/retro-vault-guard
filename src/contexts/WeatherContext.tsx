import { createContext, useContext, useState, useEffect } from 'react';

export type WeatherEffect = 'none' | 'snow' | 'rain' | 'fog';

interface WeatherCtx {
  effect: WeatherEffect;
  setEffect: (e: WeatherEffect) => void;
}

const WeatherContext = createContext<WeatherCtx | null>(null);

const STORAGE_KEY = 'vault-weather-effect';

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [effect, setEffectState] = useState<WeatherEffect>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'snow' || saved === 'rain' || saved === 'fog') return saved;
    return 'none';
  });

  const setEffect = (e: WeatherEffect) => {
    setEffectState(e);
    localStorage.setItem(STORAGE_KEY, e);
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'snow' || saved === 'rain' || saved === 'fog') setEffectState(saved);
  }, []);

  return (
    <WeatherContext.Provider value={{ effect, setEffect }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used inside WeatherProvider');
  return ctx;
}
