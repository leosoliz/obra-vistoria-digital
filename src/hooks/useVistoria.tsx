
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error("Erro ao converter para base64"));
      }
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

interface VistoriaData {
  // Identificação da obra
  nomeObra: string;
  localizacao: string;
  numeroContrato: string;
  empresaResponsavel: string;
  engenheiroResponsavel: string;
  fiscalPrefeitura: string;
  dataVistoria: string;
  horaVistoria: string;
  
  // Objetivos
  objetivoVistoria: string[];
  outroObjetivo: string;
  
  // Descrição
  descricaoAtividades: string;
  
  // Situação
  situacaoObra: string;
  detalhesPendencias: string;
  
  // Recomendações
  recomendacoes: string;
  
  // Assinaturas
  fiscalNome: string;
  fiscalMatricula: string;
  representanteNome: string;
  representanteCargo: string;

  // Coordenadas GPS
  latitude?: number;
  longitude?: number;
}

interface CapturedPhoto {
  file: File;
  preview: string;
  legenda: string;
}

export const useVistoria = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [fotos, setFotos] = useState<CapturedPhoto[]>([]);

  const uploadFoto = async (foto: CapturedPhoto, vistoriaId: string, ordem: number) => {
    if (!user) throw new Error('Usuário não autenticado');
    console.log('Fazendo upload....', foto.preview);
    const fileName = `${user.id}/${vistoriaId}/${Date.now()}-${ordem}.png`;
    console.log(fileToBase64(foto.file));
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vistoria-fotos')
      .upload(fileName, foto.file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('vistoria-fotos')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from('vistoria_fotos')
      .insert({
        vistoria_id: vistoriaId,
        arquivo_url: urlData.publicUrl,
        legenda: foto.legenda,
        ordem: ordem,
        tamanho_arquivo: foto.file.size,
        tipo_arquivo: foto.file.type
      });

    if (dbError) throw dbError;

    return urlData.publicUrl;
  };

  const salvarVistoria = async (data: VistoriaData): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);

    try {
      // Preparar dados para o banco
      const vistoriaData = {
        user_id: user.id,
        nome_obra: data.nomeObra,
        localizacao: data.localizacao,
        numero_contrato: data.numeroContrato || null,
        empresa_responsavel: data.empresaResponsavel || null,
        engenheiro_responsavel: data.engenheiroResponsavel || null,
        fiscal_prefeitura: data.fiscalPrefeitura || null,
        data_vistoria: data.dataVistoria,
        hora_vistoria: data.horaVistoria,
        
        // Coordenadas GPS
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        
        // Objetivos
        objetivo_inicio_obra: data.objetivoVistoria.includes('Início de Obra'),
        objetivo_vistoria_rotina: data.objetivoVistoria.includes('Vistoria de Rotina'),
        objetivo_medicao: data.objetivoVistoria.includes('Medição'),
        objetivo_vistoria_tecnica: data.objetivoVistoria.includes('Vistoria Técnica/Análise de Conformidade'),
        objetivo_encerramento: data.objetivoVistoria.includes('Encerramento/Entrega da Obra'),
        objetivo_outros: data.outroObjetivo || null,
        
        // Descrição
        descricao_atividades: data.descricaoAtividades,
        
        // Situação
        situacao_conformidade: data.situacaoObra === 'Em Conformidade',
        situacao_pendencias: data.situacaoObra === 'Com Pendências',
        situacao_irregularidades: data.situacaoObra === 'Irregularidades Graves',
        situacao_paralisada: data.situacaoObra === 'Paralisada',
        situacao_finalizada: data.situacaoObra === 'Finalizada',
        detalhes_pendencias: data.detalhesPendencias || null,
        
        // Recomendações
        recomendacoes: data.recomendacoes || null,
        
        // Assinaturas
        fiscal_nome: data.fiscalNome || null,
        fiscal_matricula: data.fiscalMatricula || null,
        representante_nome: data.representanteNome || null,
        representante_cargo: data.representanteCargo || null,
        
        status: 'finalizado'
      };

      // Inserir vistoria
      const { data: vistoriaResult, error: vistoriaError } = await supabase
        .from('obra_vistorias')
        .insert(vistoriaData)
        .select('id')
        .single();

      if (vistoriaError) throw vistoriaError;

      // Upload das fotos
      for (let i = 0; i < fotos.length; i++) {
        await uploadFoto(fotos[i], vistoriaResult.id, i + 1);
      }

      toast({
        title: "Sucesso!",
        description: "Relatório de vistoria salvo com sucesso!",
      });

      // Limpar fotos após salvar
      setFotos([]);

      return vistoriaResult.id;

    } catch (error) {
      console.error('Erro ao salvar vistoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar relatório. Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarFoto = (foto: CapturedPhoto) => {
    setFotos(prev => [...prev, foto]);
  };

  const removerFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  return {
    salvarVistoria,
    adicionarFoto,
    removerFoto,
    fotos,
    isLoading
  };
};
