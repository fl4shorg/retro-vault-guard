import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface RankEntry {
  user_id: string;
  user_name: string;
  access_count: number;
  last_seen: string;
}

export function useUserAccess() {
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('user_access')
        .select('*')
        .order('access_count', { ascending: false })
        .limit(10);
      if (err) throw err;
      setRanking(data ?? []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const registerAccess = useCallback(async (userId: string, userName: string) => {
    try {
      const { data: existing } = await supabase
        .from('user_access')
        .select('access_count')
        .eq('user_id', userId)
        .single();

      if (existing) {
        await supabase
          .from('user_access')
          .update({
            access_count: existing.access_count + 1,
            last_seen: new Date().toISOString(),
            user_name: userName,
          })
          .eq('user_id', userId);
      } else {
        await supabase
          .from('user_access')
          .insert({
            user_id: userId,
            user_name: userName,
            access_count: 1,
            last_seen: new Date().toISOString(),
          });
      }
    } catch {
      // silently fail — ranking is non-critical
    }
  }, []);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  return { ranking, loading, error, fetchRanking, registerAccess };
}
