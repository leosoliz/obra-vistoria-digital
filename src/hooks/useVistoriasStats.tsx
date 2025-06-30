
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface VistoriasStats {
  total: number;
  finalizado: number;
  emConformidade: number;
  irregularidades: number;
  pendencias: number;
  paralisada: number;
}

export const useVistoriasStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<VistoriasStats>({
    total: 0,
    finalizado: 0,
    emConformidade: 0,
    irregularidades: 0,
    pendencias: 0,
    paralisada: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('obra_vistorias')
        .select(`
          situacao_conformidade,
          situacao_irregularidades,
          situacao_pendencias,
          situacao_paralisada,
          situacao_finalizada
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const statsData = data.reduce((acc, vistoria) => {
        acc.total++;

        if (vistoria.situacao_finalizada) acc.finalizado++;
        else if (vistoria.situacao_conformidade) acc.emConformidade++;
        else if (vistoria.situacao_irregularidades) acc.irregularidades++;
        else if (vistoria.situacao_pendencias) acc.pendencias++;
        else if (vistoria.situacao_paralisada) acc.paralisada++;

        return acc;
      }, {
        total: 0,
        finalizado: 0,
        emConformidade: 0,
        irregularidades: 0,
        pendencias: 0,
        paralisada: 0
      });

      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    isLoading,
    refetch: fetchStats
  };
};
