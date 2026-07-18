import { useState, useCallback } from 'react';
import { API_CARGOS_FBI, API_CARGOS_SKUR } from '@/lib/supabase';

const API_REGRAS = 'https://www.esdeath-api.com.br/api/regras';

export interface CargoItem {
  id: string;
  cargo: string;
  categoria: string;
  categoriaPosicao: number;
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
  totalRegras: number;
  loading: boolean;
}

function parseApiData(data: Record<string, any> | null): CargoItem[] {
  if (!data || typeof data !== 'object') return [];
  return Object.entries(data).map(([id, item]: [string, any]) => ({
    id,
    cargo: item.cargo || 'Sem título',
    categoria: item.categoria || 'Geral',
    categoriaPosicao: item.categoriaPosicao ?? 999,
    posicao: item.posicao || 0,
    descricao: item.descricao || '',
    tag: item.tag || '',
    criadoPor: item.nome || item.criadoPor || '',
    atualizadoEm: item.atualizadoEm,
  }));
}

export function useCargos() {
  const [data, setData] = useState<CargosData>({
    fbi: [], skur: [], totalFBI: 0, totalSKUR: 0, totalRegras: 0, loading: false,
  });

  const loadCargos = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true }));
    try {
      const [resFBI, resSKUR, resRegras] = await Promise.all([
        fetch(API_CARGOS_FBI).catch(() => null),
        fetch(API_CARGOS_SKUR).catch(() => null),
        fetch(API_REGRAS).catch(() => null),
      ]);

      const dadosFBI = resFBI?.ok ? await resFBI.json() : null;
      const dadosSKUR = resSKUR?.ok ? await resSKUR.json() : null;
      const dadosRegras = resRegras?.ok ? await resRegras.json() : null;

      const fbi = parseApiData(dadosFBI);
      const skur = parseApiData(dadosSKUR);
      const totalRegras = dadosRegras && typeof dadosRegras === 'object'
        ? Object.keys(dadosRegras).length : 0;

      setData({ fbi, skur, totalFBI: fbi.length, totalSKUR: skur.length, totalRegras, loading: false });
    } catch {
      setData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  return { ...data, loadCargos };
}
