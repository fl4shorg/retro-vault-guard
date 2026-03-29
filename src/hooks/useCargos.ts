import { useState, useCallback } from 'react';
import { API_CARGOS_FBI, API_CARGOS_SKUR } from '@/lib/supabase';

export interface CargoItem {
  id: string;
  cargo: string;
  categoria: string;
  posicao: number;
  descricao: string;
  tag: string;
  criadoPor: string;
  atualizadoEm?: string;
}

interface CargosData {
  fbi: CargoItem[];
  skur: CargoItem[];
  totalFBI: number;
  totalSKUR: number;
  loading: boolean;
}

function parseApiData(data: Record<string, any> | null): CargoItem[] {
  if (!data || typeof data !== 'object') return [];
  return Object.entries(data).map(([id, item]: [string, any]) => ({
    id,
    cargo: item.cargo || 'Sem título',
    categoria: item.categoria || 'Geral',
    posicao: item.posicao || 0,
    descricao: item.descricao || '',
    tag: item.tag || '',
    criadoPor: item.nome || item.criadoPor || '',
    atualizadoEm: item.atualizadoEm,
  }));
}

export function useCargos() {
  const [data, setData] = useState<CargosData>({
    fbi: [], skur: [], totalFBI: 0, totalSKUR: 0, loading: false,
  });

  const loadCargos = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true }));
    try {
      const [resFBI, resSKUR] = await Promise.all([
        fetch(API_CARGOS_FBI).catch(() => null),
        fetch(API_CARGOS_SKUR).catch(() => null),
      ]);

      const dadosFBI = resFBI?.ok ? await resFBI.json() : null;
      const dadosSKUR = resSKUR?.ok ? await resSKUR.json() : null;

      const fbi = parseApiData(dadosFBI);
      const skur = parseApiData(dadosSKUR);

      setData({ fbi, skur, totalFBI: fbi.length, totalSKUR: skur.length, loading: false });
    } catch {
      setData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  return { ...data, loadCargos };
}
