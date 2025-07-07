
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useVistoria } from '@/hooks/useVistoria';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { IdentificacaoObraForm } from '@/components/forms/IdentificacaoObraForm';
import { ObjetivosVistoriaForm } from '@/components/forms/ObjetivosVistoriaForm';
import { SituacaoObraForm } from '@/components/forms/SituacaoObraForm';
import { AssinaturasForm } from '@/components/forms/AssinaturasForm';
import { RegistroFotograficoForm } from '@/components/forms/RegistroFotograficoForm';
import { CameraCapture } from '@/components/CameraCapture';
import { Save, Send, MapPin, LogOut, List, Wifi, WifiOff } from 'lucide-react';

interface Coordinates {
  latitude: number;
  longitude: number;
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

const vistoriaSchema = z.object({
  // Identificação da obra
  nomeObra: z.string().min(1, 'Nome da obra é obrigatório'),
  localizacao: z.string().min(1, 'Localização é obrigatória'),
  numeroContrato: z.string().min(1, 'Número do contrato é obrigatório'),
  empresaResponsavel: z.string().min(1, 'Empresa responsável é obrigatória'),
  engenheiroResponsavel: z.string().min(1, 'Engenheiro responsável é obrigatório'),
  fiscalPrefeitura: z.string().min(1, 'Fiscal da prefeitura é obrigatório'),
  dataVistoria: z.string().min(1, 'Data da vistoria é obrigatória'),
  horaVistoria: z.string().min(1, 'Hora da vistoria é obrigatória'),
  
  // Objetivos
  objetivoVistoria: z.array(z.string()).min(1, 'Selecione pelo menos um objetivo'),
  outroObjetivo: z.string().optional(),
  
  // Descrição
  descricaoAtividades: z.string().min(1, 'Descrição das atividades é obrigatória'),
  
  // Situação
  situacaoObra: z.string().min(1, 'Situação da obra é obrigatória'),
  detalhesPendencias: z.string().optional(),
  
  // Recomendações
  recomendacoes: z.string().optional(),
  
  // Assinaturas
  fiscalNome: z.string().optional(),
  fiscalMatricula: z.string().optional(),
  representanteNome: z.string().optional(),
  representanteCargo: z.string().optional(),
});

interface CapturedPhoto {
  file: File;
  preview: string;
  legenda: string;
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { salvarVistoria, isLoading } = useVistoria();
  const { 
    isOnline, 
    saveOfflineVistoria 
  } = useOfflineStorage();
  const { autocompleteData, getVistoriaByContract } = useAutocomplete();
  const { latitude, longitude, requestLocation, isLoading: gpsLoading } = useGeolocation();
  const { profile } = useUserProfile();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [fotosCapturadas, setFotosCapturadas] = useState<CapturedPhoto[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showSaveImagesDialog, setShowSaveImagesDialog] = useState(false);
  const [pendingVistoriaData, setPendingVistoriaData] = useState<z.infer<typeof vistoriaSchema> | null>(null);

  const form = useForm<z.infer<typeof vistoriaSchema>>({
    resolver: zodResolver(vistoriaSchema),
    defaultValues: {
      nomeObra: '',
      localizacao: '',
      numeroContrato: '',
      empresaResponsavel: '',
      engenheiroResponsavel: '',
      fiscalPrefeitura: '',
      dataVistoria: new Date().toISOString().split('T')[0],
      horaVistoria: new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      objetivoVistoria: [],
      outroObjetivo: '',
      descricaoAtividades: '',
      situacaoObra: '',
      detalhesPendencias: '',
      recomendacoes: '',
      fiscalNome: '',
      fiscalMatricula: '',
      representanteNome: '',
      representanteCargo: '',
    },
    mode: 'onChange'
  });

  // Cache para nome do usuário
  const getUserNameFromCache = () => {
    const cachedName = localStorage.getItem('user_name_cache');
    return cachedName;
  };

  const saveUserNameToCache = (name: string) => {
    localStorage.setItem('user_name_cache', name);
  };

  // Função para obter nome do usuário (online ou offline)
  const getUserName = () => {
    if (isOnline && profile?.full_name) {
      saveUserNameToCache(profile.full_name);
      return profile.full_name;
    } else {
      return getUserNameFromCache() || '';
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Preencher automaticamente os campos de fiscal quando tiver dados do usuário
  useEffect(() => {
    const userName = getUserName();
    if (userName) {
      form.setValue('fiscalPrefeitura', userName);
      form.setValue('fiscalNome', userName);
    }
  }, [profile, isOnline, form]);

  const handleCapturarFoto = () => {
    setShowCamera(true);
  };

  const handleFotoCapturada = (photo: CapturedPhoto) => {
    setFotosCapturadas(prev => [...prev, photo]);
    setShowCamera(false);
  };

  const handleLogout = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Função para download das imagens no celular
  const downloadImageToDevice = async (photo: CapturedPhoto, index: number) => {
    try {
      // Cria um link para download
      const link = document.createElement('a');
      link.href = photo.preview;
      link.download = `vistoria_foto_${index + 1}_${new Date().toISOString().split('T')[0]}.jpg`;
      
      // Adiciona o link ao DOM e clica nele
      document.body.appendChild(link);
      link.click();
      
      // Remove o link do DOM
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao fazer download da imagem:', error);
    }
  };

  // Função para salvar todas as imagens
  const saveAllImagesToDevice = async () => {
    if (fotosCapturadas.length === 0) return;
    
    try {
      // Download de cada imagem com um pequeno delay
      for (let i = 0; i < fotosCapturadas.length; i++) {
        await downloadImageToDevice(fotosCapturadas[i], i);
        // Pequeno delay entre downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast({
        title: "Imagens salvas!",
        description: `${fotosCapturadas.length} imagens foram salvas no dispositivo.`,
      });
    } catch (error) {
      console.error('Erro ao salvar imagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar algumas imagens.",
        variant: "destructive"
      });
    }
  };

  // Função para processar a vistoria após confirmação do usuário
  const processVistoria = async (data: z.infer<typeof vistoriaSchema>) => {
    console.log('=== INÍCIO processVistoria ===');
    console.log('Processando dados:', data);
    console.log('Fotos capturadas:', fotosCapturadas.length);

    const vistoriaData: VistoriaData = {
      nomeObra: data.nomeObra || '',
      localizacao: data.localizacao || '',
      numeroContrato: data.numeroContrato || '',
      empresaResponsavel: data.empresaResponsavel || '',
      engenheiroResponsavel: data.engenheiroResponsavel || '',
      fiscalPrefeitura: data.fiscalPrefeitura || '',
      dataVistoria: data.dataVistoria || '',
      horaVistoria: data.horaVistoria || '',
      objetivoVistoria: data.objetivoVistoria || [],
      outroObjetivo: data.outroObjetivo || '',
      descricaoAtividades: data.descricaoAtividades || '',
      situacaoObra: data.situacaoObra || '',
      detalhesPendencias: data.detalhesPendencias || '',
      recomendacoes: data.recomendacoes || '',
      fiscalNome: data.fiscalNome || '',
      fiscalMatricula: data.fiscalMatricula || '',
      representanteNome: data.representanteNome || '',
      representanteCargo: data.representanteCargo || '',
      latitude: latitude,
      longitude: longitude,
    };

    try {
      if (isOnline) {
        console.log('Salvando online...');
        const vistoriaId = await salvarVistoria(vistoriaData, fotosCapturadas);
        
        if (vistoriaId) {
          form.reset();
          setFotosCapturadas([]);
          setCurrentStep(1);
          
          toast({
            title: "Sucesso!",
            description: "Relatório de vistoria salvo com sucesso!",
          });
          
          setTimeout(() => {
            navigate('/vistorias');
          }, 1500);
        }
      } else {
        console.log('Salvando offline...');
        await saveOfflineVistoria(vistoriaData, fotosCapturadas);
        
        form.reset();
        setFotosCapturadas([]);
        setCurrentStep(1);
        
        toast({
          title: "Salvo offline!",
          description: "Relatório salvo localmente. Será sincronizado quando houver conexão.",
        });
        
        setTimeout(() => {
          navigate('/vistorias');
        }, 1500);
      }
    } catch (error) {
      console.error('Erro ao salvar vistoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o relatório. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const onSubmit = async (data: z.infer<typeof vistoriaSchema>) => {
    console.log('=== INÍCIO onSubmit ===');
    console.log('Submetendo dados:', data);
    console.log('Fotos capturadas:', fotosCapturadas.length);
    console.log('Current step:', currentStep);

    // Se há fotos, pergunta ao usuário se quer salvar no dispositivo
    if (fotosCapturadas.length > 0) {
      setPendingVistoriaData(data);
      setShowSaveImagesDialog(true);
      return;
    }

    // Se não há fotos, processa diretamente
    await processVistoria(data);
  };

  const handleContractSelect = async (numeroContrato: string) => {
    if (!numeroContrato) return;
    
    const vistoriaData = await getVistoriaByContract(numeroContrato);
    if (vistoriaData) {
      form.setValue('nomeObra', vistoriaData.nome_obra || '');
      form.setValue('empresaResponsavel', vistoriaData.empresa_responsavel || '');
      form.setValue('engenheiroResponsavel', vistoriaData.engenheiro_responsavel || '');
    }
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = (step: number) => {
    switch(step) {
      case 1: return 'Identificação da Obra';
      case 2: return 'Objetivos da Vistoria';
      case 3: return 'Descrição das Atividades';
      case 4: return 'Situação da Obra';
      case 5: return 'Registro Fotográfico';
      case 6: return 'Assinaturas';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
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
                    Nova Vistoria de Obra
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
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Prefeitura Municipal de Presidente Getúlio - SC
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/vistorias')}
                size="sm"
                className="hidden sm:flex"
              >
                <List className="w-4 h-4 mr-2" />
                Vistorias
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/vistorias')}
                size="sm"
                className="sm:hidden"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                size="sm"
                className="hidden sm:flex"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                size="sm"
                className="sm:hidden"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Coordenadas GPS */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Localização GPS</h3>
                  {latitude && longitude ? (
                    <p className="text-sm text-gray-600">
                      Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {gpsLoading ? 'Obtendo localização...' : 'Localização não disponível'}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={latitude && longitude ? 'default' : 'secondary'}>
                {latitude && longitude ? 'GPS Ativo' : 'GPS Inativo'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Indicador de Progresso */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900">
                Etapa {currentStep} de 6: {getStepTitle(currentStep)}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / 6) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <IdentificacaoObraForm 
                nomeObra={form.watch('nomeObra') || ''}
                setNomeObra={(value) => form.setValue('nomeObra', value)}
                localizacao={form.watch('localizacao') || ''}
                setLocalizacao={(value) => form.setValue('localizacao', value)}
                numeroContrato={form.watch('numeroContrato') || ''}
                setNumeroContrato={(value) => form.setValue('numeroContrato', value)}
                empresaResponsavel={form.watch('empresaResponsavel') || ''}
                setEmpresaResponsavel={(value) => form.setValue('empresaResponsavel', value)}
                engenheiroResponsavel={form.watch('engenheiroResponsavel') || ''}
                setEngenheiroResponsavel={(value) => form.setValue('engenheiroResponsavel', value)}
                fiscalPrefeitura={form.watch('fiscalPrefeitura') || ''}
                setFiscalPrefeitura={(value) => form.setValue('fiscalPrefeitura', value)}
                dataVistoria={form.watch('dataVistoria') || ''}
                setDataVistoria={(value) => form.setValue('dataVistoria', value)}
                horaVistoria={form.watch('horaVistoria') || ''}
                setHoraVistoria={(value) => form.setValue('horaVistoria', value)}
                autocompleteData={autocompleteData}
                onContractSelect={handleContractSelect}
                latitude={latitude}
                longitude={longitude}
                locationError={null}
                formatLocationString={(lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`}
                isOnline={isOnline}
              />
            )}
            
            {currentStep === 2 && (
              <ObjetivosVistoriaForm 
                objetivoVistoria={form.watch('objetivoVistoria') || []}
                handleObjetivoChange={(objetivo: string, checked: boolean) => {
                  const current = form.watch('objetivoVistoria') || [];
                  if (checked) {
                    form.setValue('objetivoVistoria', [...current, objetivo]);
                  } else {
                    form.setValue('objetivoVistoria', current.filter(o => o !== objetivo));
                  }
                }}
                outroObjetivo={form.watch('outroObjetivo') || ''}
                setOutroObjetivo={(value) => form.setValue('outroObjetivo', value)}
                autocompleteData={{
                  outros_objetivos: []
                }}
              />
            )}
            
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Descrição das Atividades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Descrição detalhada das atividades encontradas na obra *
                    </label>
                    <textarea
                      {...form.register('descricaoAtividades')}
                      placeholder="Descreva detalhadamente as atividades observadas durante a vistoria..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-vertical"
                    />
                    {form.formState.errors.descricaoAtividades && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.descricaoAtividades.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {currentStep === 4 && (
              <SituacaoObraForm 
                situacaoObra={form.watch('situacaoObra') || ''}
                setSituacaoObra={(value) => form.setValue('situacaoObra', value)}
                detalhesPendencias={form.watch('detalhesPendencias') || ''}
                setDetalhesPendencias={(value) => form.setValue('detalhesPendencias', value)}
              />
            )}
            
            {currentStep === 5 && (
              <RegistroFotograficoForm 
                fotos={fotosCapturadas}
                onCapturarFoto={handleCapturarFoto}
              />
            )}
            
            {currentStep === 6 && (
              <AssinaturasForm 
                fiscalNome={form.watch('fiscalNome') || ''}
                setFiscalNome={(value) => form.setValue('fiscalNome', value)}
                representanteNome={form.watch('representanteNome') || ''}
                setRepresentanteNome={(value) => form.setValue('representanteNome', value)}
                representanteCargo={form.watch('representanteCargo') || ''}
                setRepresentanteCargo={(value) => form.setValue('representanteCargo', value)}
                autocompleteData={{
                  representantes_nome: [],
                  representantes_cargo: []
                }}
                isOnline={isOnline}
              />
            )}

            {/* Navegação */}
            <div className="flex justify-between pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>
              
              {currentStep < 6 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Próximo
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    console.log('Botão finalizar clicado');
                    console.log('Form state:', form.formState.isValid);
                    console.log('Form errors:', form.formState.errors);
                  }}
                >
                  {isLoading ? (
                    <>
                      <Save className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      {isOnline ? (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Finalizar Vistoria
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Offline
                        </>
                      )}
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>

        {/* Modal da Câmera */}
        {showCamera && (
          <CameraCapture
            onCapture={handleFotoCapturada}
            onClose={() => setShowCamera(false)}
            latitude={latitude}
            longitude={longitude}
          />
        )}

        {/* Diálogo para salvar imagens */}
        <AlertDialog open={showSaveImagesDialog} onOpenChange={setShowSaveImagesDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Salvar Imagens no Dispositivo</AlertDialogTitle>
              <AlertDialogDescription>
                Foram capturadas {fotosCapturadas.length} imagens nesta vistoria. 
                Deseja salvar as imagens em uma pasta no seu dispositivo?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={async () => {
                setShowSaveImagesDialog(false);
                if (pendingVistoriaData) {
                  await processVistoria(pendingVistoriaData);
                  setPendingVistoriaData(null);
                }
              }}>
                Não, apenas finalizar
              </AlertDialogCancel>
              <AlertDialogAction onClick={async () => {
                setShowSaveImagesDialog(false);
                await saveAllImagesToDevice();
                if (pendingVistoriaData) {
                  await processVistoria(pendingVistoriaData);
                  setPendingVistoriaData(null);
                }
              }}>
                Sim, salvar imagens
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Index;
