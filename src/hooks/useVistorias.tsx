
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface VistoriaListItem {
  id: string;
  nome_obra: string;
  localizacao: string;
  data_vistoria: string;
  status: string;
  created_at: string;
  empresa_responsavel: string | null;
  engenheiro_responsavel: string | null;
  numero_contrato: string | null;
  situacao_conformidade: boolean | null;
  situacao_irregularidades: boolean | null;
  situacao_pendencias: boolean | null;
  situacao_paralisada: boolean | null;
  situacao_finalizada: boolean | null;
}

export const useVistorias = () => {
  const { user } = useAuth();
  const [vistorias, setVistorias] = useState<VistoriaListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVistorias = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('obra_vistorias')
        .select(`
          id,
          nome_obra,
          localizacao,
          data_vistoria,
          status,
          created_at,
          empresa_responsavel,
          engenheiro_responsavel,
          numero_contrato,
          situacao_conformidade,
          situacao_irregularidades,
          situacao_pendencias,
          situacao_paralisada,
          situacao_finalizada
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVistorias(data || []);
    } catch (error) {
      console.error('Erro ao carregar vistorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as vistorias",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVistorias();
  }, [user]);

  return {
    vistorias,
    isLoading,
    refetch: fetchVistorias
  };
};
