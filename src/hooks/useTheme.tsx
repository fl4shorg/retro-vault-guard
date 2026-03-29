import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeId = 'vault-tec' | 'pip-boy' | 'nuka-cola' | 'brotherhood' | 'institute';

interface Theme {
  id: ThemeId;
  name: string;
  description: string;
}

export const themes: Theme[] = [
  { id: 'vault-tec', name: 'Vault-Tec', description: 'Amarelo clássico da Vault-Tec' },
  { id: 'pip-boy', name: 'Pip-Boy', description: 'Verde fosforescente do Pip-Boy' },
  { id: 'nuka-cola', name: 'Nuka-Cola', description: 'Vermelho Nuka-Cola' },
  { id: 'brotherhood', name: 'Brotherhood of Steel', description: 'Cinza metálico da Irmandade' },
  { id: 'institute', name: 'Institute', description: 'Azul ciano do Instituto' },
];

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'vault-tec', setTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    return (localStorage.getItem('vault-theme') as ThemeId) || 'vault-tec';
  });

  const setTheme = (t: ThemeId) => {
    setThemeState(t);
    localStorage.setItem('vault-theme', t);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
