
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface VistoriaDetails {
  id: string;
  nome_obra: string;
  localizacao: string;
  data_vistoria: string;
  hora_vistoria: string;
  numero_contrato: string | null;
  empresa_responsavel: string | null;
  engenheiro_responsavel: string | null;
  fiscal_prefeitura: string | null;
  latitude: number | null;
  longitude: number | null;
  objetivo_inicio_obra: boolean;
  objetivo_vistoria_rotina: boolean;
  objetivo_medicao: boolean;
  objetivo_vistoria_tecnica: boolean;
  objetivo_encerramento: boolean;
  objetivo_outros: string | null;
  descricao_atividades: string;
  situacao_conformidade: boolean;
  situacao_irregularidades: boolean;
  situacao_pendencias: boolean;
  situacao_paralisada: boolean;
  situacao_finalizada: boolean;
  detalhes_pendencias: string | null;
  recomendacoes: string | null;
  fiscal_nome: string | null;
  representante_nome: string | null;
  representante_cargo: string | null;
  created_at: string;
  fotos: Array<{
    id: string;
    arquivo_url: string;
    legenda: string;
    ordem: number;
  }>;
}

export const useVistoriaDetails = (vistoriaId: string | undefined) => {
  const [vistoria, setVistoria] = useState<VistoriaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVistoriaDetails = async () => {
    if (!vistoriaId) return;

    setIsLoading(true);
    try {
      // Buscar dados da vistoria
      const { data: vistoriaData, error: vistoriaError } = await supabase
        .from('obra_vistorias')
        .select('*')
        .eq('id', vistoriaId)
        .single();

      if (vistoriaError) throw vistoriaError;

      // Buscar fotos da vistoria
      const { data: fotosData, error: fotosError } = await supabase
        .from('vistoria_fotos')
        .select('*')
        .eq('vistoria_id', vistoriaId)
        .order('ordem');

      if (fotosError) throw fotosError;

      setVistoria({
        ...vistoriaData,
        fotos: fotosData || []
      });
    } catch (error) {
      console.error('Erro ao carregar vistoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da vistoria",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVistoriaDetails();
  }, [vistoriaId]);

  return {
    vistoria,
    isLoading,
    refetch: fetchVistoriaDetails
  };
};
