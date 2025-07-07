
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AutocompleteData {
  nomes_obra: string[];
  numeros_contrato: string[];
  empresas_responsavel: string[];
  engenheiros_responsavel: string[];
  representantes_nome: string[];
  representantes_cargo: string[];
  outros_objetivos: string[];
}

interface VistoriaByContract {
  nome_obra: string;
  empresa_responsavel: string;
  engenheiro_responsavel: string;
}

export const useAutocomplete = () => {
  const { user } = useAuth();
  const [autocompleteData, setAutocompleteData] = useState<AutocompleteData>({
    nomes_obra: [],
    numeros_contrato: [],
    empresas_responsavel: [],
    engenheiros_responsavel: [],
    representantes_nome: [],
    representantes_cargo: [],
    outros_objetivos: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchAutocompleteData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('obra_vistorias')
        .select(`
          nome_obra,
          numero_contrato,
          empresa_responsavel,
          engenheiro_responsavel,
          representante_nome,
          representante_cargo,
          objetivo_outros
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Extrair valores únicos não nulos
      const uniqueData: AutocompleteData = {
        nomes_obra: [...new Set(data?.map(item => item.nome_obra).filter(Boolean) || [])],
        numeros_contrato: [...new Set(data?.map(item => item.numero_contrato).filter(Boolean) || [])],
        empresas_responsavel: [...new Set(data?.map(item => item.empresa_responsavel).filter(Boolean) || [])],
        engenheiros_responsavel: [...new Set(data?.map(item => item.engenheiro_responsavel).filter(Boolean) || [])],
        representantes_nome: [...new Set(data?.map(item => item.representante_nome).filter(Boolean) || [])],
        representantes_cargo: [...new Set(data?.map(item => item.representante_cargo).filter(Boolean) || [])],
        outros_objetivos: [...new Set(data?.map(item => item.objetivo_outros).filter(Boolean) || [])]
      };

      setAutocompleteData(uniqueData);
    } catch (error) {
      console.error('Erro ao carregar dados de autocomplete:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAutocompleteData();
  }, [user]);

  const getVistoriaByContract = async (numeroContrato: string): Promise<VistoriaByContract | null> => {
    if (!user || !numeroContrato) return null;

    try {
      const { data, error } = await supabase
        .from('obra_vistorias')
        .select('nome_obra, empresa_responsavel, engenheiro_responsavel')
        .eq('user_id', user.id)
        .eq('numero_contrato', numeroContrato)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Erro ao buscar vistoria por contrato:', error);
      return null;
    }
  };

  return {
    autocompleteData,
    isLoading,
    refetch: fetchAutocompleteData,
    getVistoriaByContract
  };
};
