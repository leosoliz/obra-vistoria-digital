
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useVistoria } from './useVistoria';
import { toast } from '@/hooks/use-toast';

interface OfflineVistoriaData {
  id: string;
  data: any;
  fotos: any[];
  timestamp: number;
  userId: string;
}

export const useOfflineStorage = () => {
  const { user } = useAuth();
  const { salvarVistoria } = useVistoria();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

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

    const offlineData: OfflineVistoriaData = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: vistoriaData,
      fotos: fotos,
      timestamp: Date.now(),
      userId: user.id
    };

    // Converter fotos para base64 para armazenamento local
    const fotosBase64 = await Promise.all(
      fotos.map(async (foto) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        return new Promise((resolve) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            resolve({
              ...foto,
              base64: base64
            });
          };
          img.src = foto.preview;
        });
      })
    );

    offlineData.fotos = fotosBase64;

    const existingData = localStorage.getItem('offlineVistorias') || '[]';
    const offlineVistorias = JSON.parse(existingData);
    offlineVistorias.push(offlineData);
    
    localStorage.setItem('offlineVistorias', JSON.stringify(offlineVistorias));
    updatePendingCount();
  };

  const getPendingVistorias = (): OfflineVistoriaData[] => {
    if (!user) return [];
    
    const existingData = localStorage.getItem('offlineVistorias') || '[]';
    const offlineVistorias = JSON.parse(existingData);
    
    return offlineVistorias.filter((vistoria: OfflineVistoriaData) => 
      vistoria.userId === user.id
    );
  };

  const syncPendingVistorias = useCallback(async (): Promise<void> => {
    if (!user || !isOnline) return;

    const pendingVistorias = getPendingVistorias();
    if (pendingVistorias.length === 0) return;

    console.log(`Sincronizando ${pendingVistorias.length} vistorias pendentes...`);

    for (const offlineVistoria of pendingVistorias) {
      try {
        // Reconverter fotos base64 para File objects
        const fotosReconstruidas = offlineVistoria.fotos.map((foto: any) => {
          if (foto.base64) {
            // Converter base64 para blob
            const arr = foto.base64.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const blob = new Blob([u8arr], { type: mime });
            const file = new File([blob], `foto_${Date.now()}.jpg`, { type: mime });
            
            return {
              file: file,
              preview: foto.base64,
              legenda: foto.legenda
            };
          }
          return foto;
        });

        // Temporariamente adicionar as fotos ao hook useVistoria
        fotosReconstruidas.forEach((foto: any) => {
          // Simular adição de foto (isso precisa ser ajustado conforme a implementação do useVistoria)
        });

        await salvarVistoria(offlineVistoria.data);
        
        // Remove da lista de pendentes
        removePendingVistoria(offlineVistoria.id);
        
        console.log(`Vistoria ${offlineVistoria.id} sincronizada com sucesso`);
        
      } catch (error) {
        console.error(`Erro ao sincronizar vistoria ${offlineVistoria.id}:`, error);
        // Mantém na lista para tentar novamente depois
      }
    }

    updatePendingCount();

    if (pendingCount > 0) {
      toast({
        title: "Sincronização concluída",
        description: `${pendingVistorias.length - pendingCount} vistorias foram sincronizadas.`,
      });
    }
  }, [user, isOnline, salvarVistoria, pendingCount]);

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
    saveOfflineVistoria,
    getPendingVistorias,
    syncPendingVistorias,
    removePendingVistoria,
    clearAllPendingVistorias
  };
};
