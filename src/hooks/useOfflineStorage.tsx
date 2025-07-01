
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OfflineVistoriaData {
  id: string;
  data: any;
  fotos: any[];
  timestamp: number;
  userId: string;
  synced?: boolean;
}

export const useOfflineStorage = () => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitorar status da conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Contar vistorias pendentes
  useEffect(() => {
    updatePendingCount();
  }, [user]);

  const updatePendingCount = () => {
    if (!user) return;
    
    const pending = getPendingVistorias();
    setPendingCount(pending.length);
  };

  const saveOfflineVistoria = async (vistoriaData: any, fotos: any[]): Promise<void> => {
    if (!user) throw new Error('Usuário não autenticado');

    console.log('Salvando vistoria offline:', { vistoriaData, fotosCount: fotos.length });

    const offlineData: OfflineVistoriaData = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: vistoriaData,
      fotos: fotos,
      timestamp: Date.now(),
      userId: user.id,
      synced: false
    };

    const existingData = localStorage.getItem('offlineVistorias') || '[]';
    const offlineVistorias = JSON.parse(existingData);
    offlineVistorias.push(offlineData);
    
    localStorage.setItem('offlineVistorias', JSON.stringify(offlineVistorias));
    updatePendingCount();
    
    console.log('Vistoria salva offline com sucesso');
  };

  const getPendingVistorias = (): OfflineVistoriaData[] => {
    if (!user) return [];
    
    const existingData = localStorage.getItem('offlineVistorias') || '[]';
    const offlineVistorias = JSON.parse(existingData);
    
    return offlineVistorias.filter((vistoria: OfflineVistoriaData) => 
      vistoria.userId === user.id && !vistoria.synced
    );
  };

  const uploadFoto = async (foto: any, vistoriaId: string, ordem: number): Promise<string> => {
    console.log('Fazendo upload da foto:', { vistoriaId, ordem, fotoSize: foto.file?.size });
    
    if (!user) throw new Error('Usuário não autenticado');
    
    const fileName = `${user.id}/${vistoriaId}/${Date.now()}-${ordem}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('vistoria-fotos')
      .upload(fileName, foto.file);

    if (uploadError) {
      console.error('Erro no upload da foto:', uploadError);
      throw uploadError;
    }

    console.log('Upload da foto concluído:', uploadData);

    const { data: urlData } = supabase.storage
      .from('vistoria-fotos')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from('vistoria_fotos')
      .insert({
        vistoria_id: vistoriaId,
        arquivo_url: urlData.publicUrl,
        legenda: foto.legenda || '',
        ordem: ordem,
        tamanho_arquivo: foto.file?.size || 0,
        tipo_arquivo: foto.file?.type || 'image/jpeg'
      });

    if (dbError) {
      console.error('Erro ao salvar foto no banco:', dbError);
      throw dbError;
    }

    console.log('Foto salva no banco com sucesso');
    return urlData.publicUrl;
  };

  const syncPendingVistorias = useCallback(async (): Promise<void> => {
    if (!user || !isOnline || isSyncing) {
      console.log('Sincronização cancelada:', { user: !!user, isOnline, isSyncing });
      return;
    }

    const pendingVistorias = getPendingVistorias();
    if (pendingVistorias.length === 0) {
      console.log('Nenhuma vistoria pendente para sincronizar');
      return;
    }

    console.log(`Iniciando sincronização de ${pendingVistorias.length} vistorias pendentes...`);
    setIsSyncing(true);

    let syncedCount = 0;
    let errorCount = 0;

    for (const offlineVistoria of pendingVistorias) {
      try {
        console.log(`Sincronizando vistoria ${offlineVistoria.id}...`);

        // Preparar dados para o banco
        const vistoriaData = {
          user_id: user.id,
          nome_obra: offlineVistoria.data.nomeObra,
          localizacao: offlineVistoria.data.localizacao,
          numero_contrato: offlineVistoria.data.numeroContrato || null,
          empresa_responsavel: offlineVistoria.data.empresaResponsavel || null,
          engenheiro_responsavel: offlineVistoria.data.engenheiroResponsavel || null,
          fiscal_prefeitura: offlineVistoria.data.fiscalPrefeitura || null,
          data_vistoria: offlineVistoria.data.dataVistoria,
          hora_vistoria: offlineVistoria.data.horaVistoria,
          
          // Coordenadas GPS
          latitude: offlineVistoria.data.latitude || null,
          longitude: offlineVistoria.data.longitude || null,
          
          // Objetivos
          objetivo_inicio_obra: offlineVistoria.data.objetivoVistoria?.includes('Início de Obra') || false,
          objetivo_vistoria_rotina: offlineVistoria.data.objetivoVistoria?.includes('Vistoria de Rotina') || false,
          objetivo_medicao: offlineVistoria.data.objetivoVistoria?.includes('Medição') || false,
          objetivo_vistoria_tecnica: offlineVistoria.data.objetivoVistoria?.includes('Vistoria Técnica/Análise de Conformidade') || false,
          objetivo_encerramento: offlineVistoria.data.objetivoVistoria?.includes('Encerramento/Entrega da Obra') || false,
          objetivo_outros: offlineVistoria.data.outroObjetivo || null,
          
          // Descrição
          descricao_atividades: offlineVistoria.data.descricaoAtividades,
          
          // Situação
          situacao_conformidade: offlineVistoria.data.situacaoObra === 'Em Conformidade',
          situacao_pendencias: offlineVistoria.data.situacaoObra === 'Com Pendências',
          situacao_irregularidades: offlineVistoria.data.situacaoObra === 'Irregularidades Graves',
          situacao_paralisada: offlineVistoria.data.situacaoObra === 'Paralisada',
          situacao_finalizada: offlineVistoria.data.situacaoObra === 'Finalizada',
          detalhes_pendencias: offlineVistoria.data.detalhesPendencias || null,
          
          // Recomendações
          recomendacoes: offlineVistoria.data.recomendacoes || null,
          
          // Assinaturas
          fiscal_nome: offlineVistoria.data.fiscalNome || null,
          fiscal_matricula: offlineVistoria.data.fiscalMatricula || null,
          representante_nome: offlineVistoria.data.representanteNome || null,
          representante_cargo: offlineVistoria.data.representanteCargo || null,
          
          status: 'finalizado'
        };

        // Inserir vistoria
        const { data: vistoriaResult, error: vistoriaError } = await supabase
          .from('obra_vistorias')
          .insert(vistoriaData)
          .select('id')
          .single();

        if (vistoriaError) {
          console.error('Erro ao inserir vistoria:', vistoriaError);
          throw vistoriaError;
        }

        console.log(`Vistoria inserida com ID: ${vistoriaResult.id}`);

        // Upload das fotos se existirem
        if (offlineVistoria.fotos && offlineVistoria.fotos.length > 0) {
          console.log(`Fazendo upload de ${offlineVistoria.fotos.length} fotos...`);
          
          for (let i = 0; i < offlineVistoria.fotos.length; i++) {
            const foto = offlineVistoria.fotos[i];
            try {
              await uploadFoto(foto, vistoriaResult.id, i + 1);
              console.log(`Foto ${i + 1} enviada com sucesso`);
            } catch (fotoError) {
              console.error(`Erro ao enviar foto ${i + 1}:`, fotoError);
              // Continua mesmo se uma foto falhar
            }
          }
        }

        // Marcar como sincronizada
        markVistoriaAsSynced(offlineVistoria.id);
        syncedCount++;
        
        console.log(`Vistoria ${offlineVistoria.id} sincronizada com sucesso`);
        
      } catch (error) {
        console.error(`Erro ao sincronizar vistoria ${offlineVistoria.id}:`, error);
        errorCount++;
      }
    }

    setIsSyncing(false);
    updatePendingCount();

    if (syncedCount > 0) {
      toast({
        title: "Sincronização concluída",
        description: `${syncedCount} vistoria(s) foram sincronizadas com sucesso.`,
      });
    }

    if (errorCount > 0) {
      toast({
        title: "Alguns erros ocorreram",
        description: `${errorCount} vistoria(s) falharam na sincronização.`,
        variant: "destructive"
      });
    }

    console.log(`Sincronização finalizada: ${syncedCount} sucesso, ${errorCount} erro(s)`);
  }, [user, isOnline, isSyncing]);

  const markVistoriaAsSynced = (vistoriaId: string): void => {
    const existingData = localStorage.getItem('offlineVistorias') || '[]';
    const offlineVistorias = JSON.parse(existingData);
    
    const updatedVistorias = offlineVistorias.map((vistoria: OfflineVistoriaData) => 
      vistoria.id === vistoriaId ? { ...vistoria, synced: true } : vistoria
    );
    
    localStorage.setItem('offlineVistorias', JSON.stringify(updatedVistorias));
  };

  const removePendingVistoria = (vistoriaId: string): void => {
    const existingData = localStorage.getItem('offlineVistorias') || '[]';
    const offlineVistorias = JSON.parse(existingData);
    
    const updatedVistorias = offlineVistorias.filter(
      (vistoria: OfflineVistoriaData) => vistoria.id !== vistoriaId
    );
    
    localStorage.setItem('offlineVistorias', JSON.stringify(updatedVistorias));
    updatePendingCount();
  };

  const clearAllPendingVistorias = (): void => {
    if (!user) return;
    
    const existingData = localStorage.getItem('offlineVistorias') || '[]';
    const offlineVistorias = JSON.parse(existingData);
    
    const otherUsersVistorias = offlineVistorias.filter(
      (vistoria: OfflineVistoriaData) => vistoria.userId !== user.id
    );
    
    localStorage.setItem('offlineVistorias', JSON.stringify(otherUsersVistorias));
    updatePendingCount();
  };

  return {
    isOnline,
    pendingCount,
    isSyncing,
    saveOfflineVistoria,
    getPendingVistorias,
    syncPendingVistorias,
    removePendingVistoria,
    clearAllPendingVistorias
  };
};
