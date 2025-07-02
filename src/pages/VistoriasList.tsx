
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVistorias } from '@/hooks/useVistorias';
import { useVistoriasStats } from '@/hooks/useVistoriasStats';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Building, Plus, LogOut, Eye, Download, BarChart3, Image, Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateVistoriaPDF } from '@/utils/pdfGenerator';
import { toast } from '@/hooks/use-toast';
import MobileMenu from '@/components/MobileMenu';

const VistoriasList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vistorias, isLoading, refetch } = useVistorias();
  const { stats, isLoading: statsLoading } = useVistoriasStats();
  const { 
    isOnline, 
    pendingCount, 
    isSyncing, 
    syncPendingVistorias, 
    getPendingVistorias 
  } = useOfflineStorage();

  // Recarregar dados toda vez que a tela é acessada
  useEffect(() => {
    refetch();
  }, []);

  const handleLogout = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleViewVistoria = (vistoriaId: string) => {
    navigate(`/vistoria/${vistoriaId}`);
  };

  const handleSyncVistorias = async () => {
    if (!isOnline) {
      toast({
        title: "Sem conexão",
        description: "Você precisa estar online para sincronizar as vistorias",
        variant: "destructive"
      });
      return;
    }

    try {
      await syncPendingVistorias();
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar algumas vistorias",
        variant: "destructive"
      });
    }
  };

  const handlePrintPDF = async (vistoria: any) => {
    try {
      // Buscar dados completos da vistoria incluindo fotos
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: vistoriaCompleta, error: vistoriaError } = await supabase
        .from('obra_vistorias')
        .select('*')
        .eq('id', vistoria.id)
        .single();

      if (vistoriaError) throw vistoriaError;

      const { data: fotos, error: fotosError } = await supabase
        .from('vistoria_fotos')
        .select('*')
        .eq('vistoria_id', vistoria.id)
        .order('ordem');

      if (fotosError) throw fotosError;

      const vistoriaComFotos = {
        ...vistoriaCompleta,
        fotos: fotos || []
      };

      await generateVistoriaPDF(vistoriaComFotos);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro", 
        description: "Não foi possível gerar o PDF",
        variant: "destructive"
      });
    }
  };

  const handleDownloadImages = async (vistoria: any) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: fotos, error } = await supabase
        .from('vistoria_fotos')
        .select('*')
        .eq('vistoria_id', vistoria.id)
        .order('ordem');

      if (error) throw error;

      if (!fotos || fotos.length === 0) {
        toast({
          title: "Aviso",
          description: "Esta vistoria não possui fotos para download",
          variant: "default"
        });
        return;
      }

      // Download das imagens
      for (const foto of fotos) {
        try {
          const response = await fetch(foto.arquivo_url);
          const blob = await response.blob();
          
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `vistoria_${vistoria.nome_obra}_foto_${foto.ordem}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (imgError) {
          console.warn(`Erro ao baixar imagem ${foto.ordem}:`, imgError);
        }
      }

      toast({
        title: "Sucesso",
        description: `${fotos.length} imagem(ns) baixada(s) com sucesso!`
      });

    } catch (error) {
      console.error('Erro ao baixar imagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar as imagens",
        variant: "destructive"
      });
    }
  };

  const getVistoriaStatus = (vistoria: any) => {
    // Determinar status baseado na situação da obra
    if (vistoria.situacao_finalizada) return 'finalizado';
    if (vistoria.situacao_conformidade) return 'em-conformidade';
    if (vistoria.situacao_irregularidades) return 'irregularidades';
    if (vistoria.situacao_pendencias) return 'pendencias';
    if (vistoria.situacao_paralisada) return 'paralisada';
    return 'em-andamento';
  };

  const getStatusColor = (vistoria: any) => {
    const status = getVistoriaStatus(vistoria);
    switch (status) {
      case 'finalizado':
        return 'bg-green-100 text-green-800';
      case 'em-conformidade':
        return 'bg-blue-100 text-blue-800';
      case 'irregularidades':
        return 'bg-red-100 text-red-800';
      case 'pendencias':
        return 'bg-yellow-100 text-yellow-800';
      case 'paralisada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getStatusText = (vistoria: any) => {
    const status = getVistoriaStatus(vistoria);
    switch (status) {
      case 'finalizado':
        return 'Finalizado';
      case 'em-conformidade':
        return 'Em Conformidade';
      case 'irregularidades':
        return 'Irregularidades';
      case 'pendencias':
        return 'Com Pendências';
      case 'paralisada':
        return 'Paralisada';
      default:
        return 'Em Andamento';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <img 
                src="/lovable-uploads/216f61c9-3d63-4dfe-9f04-239b1cb9cd3b.png" 
                alt="Brasão Presidente Getúlio" 
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    Minhas Vistorias
                  </h1>
                  {/* Indicador de Status Online/Offline */}
                  <div className="flex items-center gap-1">
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-green-600" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">
                  Bem-vindo, {user?.email}
                </p>
              </div>
            </div>
            
            {/* Desktop buttons */}
            <div className="hidden md:flex gap-3">
              <Button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Vistoria
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
            
            {/* Mobile menu */}
            <MobileMenu
              onNewVistoria={() => navigate('/')}
              onLogout={handleLogout}
              userEmail={user?.email}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Card de Status de Sincronização */}
        {pendingCount > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-800">
                      {pendingCount} vistoria{pendingCount > 1 ? 's' : ''} não sincronizada{pendingCount > 1 ? 's' : ''}
                    </h3>
                    <p className="text-sm text-orange-700">
                      {isOnline 
                        ? 'Clique em "Sincronizar" para enviar para o servidor'
                        : 'Aguardando conexão com a internet'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleSyncVistorias}
                  disabled={!isOnline || isSyncing}
                  variant="outline"
                  size="sm"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sincronizar
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BarChart3 className="w-5 h-5" />
              Dashboard de Vistorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-xs text-blue-600">Total</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.finalizado}</div>
                  <div className="text-xs text-green-600">Finalizado</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.emConformidade}</div>
                  <div className="text-xs text-blue-600">Conformidade</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.irregularidades}</div>
                  <div className="text-xs text-red-600">Irregularidades</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pendencias}</div>
                  <div className="text-xs text-yellow-600">Pendências</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-gray-600">{stats.paralisada}</div>
                  <div className="text-xs text-gray-600">Paralisada</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">{pendingCount}</div>
                  <div className="text-xs text-orange-600">Não Sincronizadas</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {vistorias.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 max-w-md mx-auto">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma vistoria encontrada
              </h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Você ainda não criou nenhuma vistoria. Comece criando sua primeira vistoria.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Vistoria
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vistorias.map((vistoria) => (
              <Card key={vistoria.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base sm:text-lg line-clamp-2 min-w-0 flex-1">
                      {vistoria.nome_obra}
                    </CardTitle>
                    <Badge className={`${getStatusColor(vistoria)} text-xs whitespace-nowrap flex-shrink-0`}>
                      {getStatusText(vistoria)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 line-clamp-2">
                      {vistoria.localizacao}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDate(vistoria.data_vistoria)}
                    </span>
                  </div>

                  {vistoria.empresa_responsavel && (
                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-500 line-clamp-1">
                        {vistoria.empresa_responsavel}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewVistoria(vistoria.id)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePrintPDF(vistoria)}
                      className="flex-1"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadImages(vistoria)}
                      className="flex-1"
                    >
                      <Image className="w-3 h-3 mr-1" />
                      Fotos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VistoriasList;
