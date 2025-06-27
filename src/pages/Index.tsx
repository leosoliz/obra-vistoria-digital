import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  Camera, 
  MapPin, 
  Clock, 
  User, 
  Building,
  FileText,
  CheckCircle,
  X,
  Loader2,
  Navigation
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

import { useAuth } from '@/hooks/useAuth';
import { useVistoria } from '@/hooks/useVistoria';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { CameraCapture } from '@/components/CameraCapture';
import { generatePDF } from '@/utils/pdfGenerator';

const vistoriaSchema = z.object({
  nomeObra: z.string().min(1, 'Nome da obra é obrigatório'),
  localizacao: z.string().min(1, 'Localização é obrigatória'),
  numeroContrato: z.string().optional(),
  empresaResponsavel: z.string().optional(),
  engenheiroResponsavel: z.string().optional(),
  fiscalPrefeitura: z.string().optional(),
  dataVistoria: z.string().min(1, 'Data da vistoria é obrigatória'),
  horaVistoria: z.string().min(1, 'Hora da vistoria é obrigatória'),
  objetivoVistoria: z.array(z.string()).min(1, 'Selecione pelo menos um objetivo'),
  outroObjetivo: z.string().optional(),
  descricaoAtividades: z.string().min(1, 'Descrição das atividades é obrigatória'),
  situacaoObra: z.string().min(1, 'Situação da obra é obrigatória'),
  detalhesPendencias: z.string().optional(),
  recomendacoes: z.string().optional(),
  fiscalNome: z.string().optional(),
  fiscalMatricula: z.string().optional(),
  representanteNome: z.string().optional(),
  representanteCargo: z.string().optional(),
});

type VistoriaFormData = z.infer<typeof vistoriaSchema>;

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const { salvarVistoria, fotos, adicionarFoto, removerFoto, isLoading } = useVistoria();
  const { latitude, longitude, isLoading: geoLoading, requestLocation, formatLocationString } = useGeolocation();
  
  const [showCamera, setShowCamera] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<VistoriaFormData>({
    resolver: zodResolver(vistoriaSchema),
    defaultValues: {
      objetivoVistoria: [],
      dataVistoria: format(new Date(), 'yyyy-MM-dd'),
      horaVistoria: format(new Date(), 'HH:mm'),
    }
  });

  const watchedObjetivos = watch('objetivoVistoria');

  // Efeito para preencher automaticamente os dados quando o usuário e perfil estiverem carregados
  useEffect(() => {
    if (profile && !profileLoading) {
      setValue('fiscalPrefeitura', profile.full_name);
      setValue('fiscalNome', profile.full_name);
    }
  }, [profile, profileLoading, setValue]);

  // Efeito para obter localização automaticamente quando o componente carregar
  useEffect(() => {
    const getInitialLocation = async () => {
      const location = await requestLocation();
      if (location) {
        const locationString = formatLocationString(location.latitude, location.longitude);
        setCurrentLocation(locationString);
        setValue('localizacao', locationString);
      }
    };

    getInitialLocation();
  }, [requestLocation, formatLocationString, setValue]);

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleObjetivoChange = (objetivo: string, checked: boolean) => {
    const currentObjetivos = watchedObjetivos || [];
    if (checked) {
      setValue('objetivoVistoria', [...currentObjetivos, objetivo]);
    } else {
      setValue('objetivoVistoria', currentObjetivos.filter(o => o !== objetivo));
    }
  };

  const handleCameraCapture = (photo: { file: File; preview: string; legenda: string }) => {
    adicionarFoto(photo);
    setShowCamera(false);
    toast({
      title: "Foto adicionada",
      description: "Foto capturada e adicionada ao relatório"
    });
  };

  const handleGetLocation = async () => {
    const location = await requestLocation();
    if (location) {
      const locationString = formatLocationString(location.latitude, location.longitude);
      setCurrentLocation(locationString);
      setValue('localizacao', locationString);
    }
  };

  const onSubmit = async (data: VistoriaFormData) => {
    if (fotos.length === 0) {
      toast({
        title: "Atenção",
        description: "Adicione pelo menos uma foto antes de finalizar",
        variant: "destructive"
      });
      return;
    }

    const vistoriaId = await salvarVistoria({
      nomeObra: data.nomeObra,
      localizacao: data.localizacao,
      numeroContrato: data.numeroContrato || '',
      empresaResponsavel: data.empresaResponsavel || '',
      engenheiroResponsavel: data.engenheiroResponsavel || '',
      fiscalPrefeitura: data.fiscalPrefeitura || '',
      dataVistoria: data.dataVistoria,
      horaVistoria: data.horaVistoria,
      objetivoVistoria: data.objetivoVistoria,
      outroObjetivo: data.outroObjetivo || '',
      descricaoAtividades: data.descricaoAtividades,
      situacaoObra: data.situacaoObra,
      detalhesPendencias: data.detalhesPendencias || '',
      recomendacoes: data.recomendacoes || '',
      fiscalNome: data.fiscalNome || '',
      fiscalMatricula: data.fiscalMatricula || '',
      representanteNome: data.representanteNome || '',
      representanteCargo: data.representanteCargo || '',
      latitude: latitude || 0,
      longitude: longitude || 0
    });

    if (vistoriaId) {
      // Gerar PDF
      try {
        await generatePDF(data, fotos);

        toast({
          title: "Sucesso!",
          description: "Relatório salvo e PDF gerado com sucesso!"
        });

        // Limpar formulário
        reset();
        setCurrentLocation('');
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        toast({
          title: "PDF não gerado",
          description: "Relatório salvo, mas houve erro na geração do PDF",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Logotipo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <img 
              src="/uploaded-image.png" 
              alt="Logotipo da Prefeitura" 
              className="h-16 w-16 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Vistoria de Obras
              </h1>
              <p className="text-sm text-gray-600">
                Prefeitura Municipal - Fiscal: {profile?.full_name || 'Carregando...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Identificação da Obra */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Identificação da Obra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nomeObra">Nome da Obra *</Label>
                <Input
                  id="nomeObra"
                  {...register('nomeObra')}
                  className={errors.nomeObra ? 'border-red-500' : ''}
                />
                {errors.nomeObra && (
                  <span className="text-red-500 text-sm">{errors.nomeObra.message}</span>
                )}
              </div>

              <div>
                <Label htmlFor="localizacao">Localização *</Label>
                <div className="flex gap-2">
                  <Input
                    id="localizacao"
                    {...register('localizacao')}
                    className={errors.localizacao ? 'border-red-500' : ''}
                    value={currentLocation}
                    onChange={(e) => setCurrentLocation(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={geoLoading}
                    variant="outline"
                    size="sm"
                  >
                    {geoLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.localizacao && (
                  <span className="text-red-500 text-sm">{errors.localizacao.message}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numeroContrato">Número do Contrato</Label>
                  <Input id="numeroContrato" {...register('numeroContrato')} />
                </div>
                <div>
                  <Label htmlFor="empresaResponsavel">Empresa Responsável</Label>
                  <Input id="empresaResponsavel" {...register('empresaResponsavel')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="engenheiroResponsavel">Engenheiro Responsável</Label>
                  <Input id="engenheiroResponsavel" {...register('engenheiroResponsavel')} />
                </div>
                <div>
                  <Label htmlFor="fiscalPrefeitura">Fiscal da Prefeitura</Label>
                  <Input 
                    id="fiscalPrefeitura" 
                    {...register('fiscalPrefeitura')} 
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataVistoria">Data da Vistoria *</Label>
                  <Input
                    id="dataVistoria"
                    type="date"
                    {...register('dataVistoria')}
                    className={errors.dataVistoria ? 'border-red-500' : ''}
                  />
                  {errors.dataVistoria && (
                    <span className="text-red-500 text-sm">{errors.dataVistoria.message}</span>
                  )}
                </div>
                <div>
                  <Label htmlFor="horaVistoria">Hora da Vistoria *</Label>
                  <Input
                    id="horaVistoria"
                    type="time"
                    {...register('horaVistoria')}
                    className={errors.horaVistoria ? 'border-red-500' : ''}
                  />
                  {errors.horaVistoria && (
                    <span className="text-red-500 text-sm">{errors.horaVistoria.message}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Objetivos da Vistoria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Objetivos da Vistoria *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="objetivoInicioObra"
                    checked={watchedObjetivos?.includes('Início de Obra') || false}
                    onCheckedChange={(checked) => handleObjetivoChange('Início de Obra', Boolean(checked))}
                  />
                  <Label htmlFor="objetivoInicioObra">Início de Obra</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="objetivoVistoriaRotina"
                    checked={watchedObjetivos?.includes('Vistoria de Rotina') || false}
                    onCheckedChange={(checked) => handleObjetivoChange('Vistoria de Rotina', Boolean(checked))}
                  />
                  <Label htmlFor="objetivoVistoriaRotina">Vistoria de Rotina</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="objetivoMedicao"
                    checked={watchedObjetivos?.includes('Medição') || false}
                    onCheckedChange={(checked) => handleObjetivoChange('Medição', Boolean(checked))}
                  />
                  <Label htmlFor="objetivoMedicao">Medição</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="objetivoVistoriaTecnica"
                    checked={watchedObjetivos?.includes('Vistoria Técnica/Análise de Conformidade') || false}
                    onCheckedChange={(checked) => handleObjetivoChange('Vistoria Técnica/Análise de Conformidade', Boolean(checked))}
                  />
                  <Label htmlFor="objetivoVistoriaTecnica">Vistoria Técnica/Análise de Conformidade</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="objetivoEncerramento"
                    checked={watchedObjetivos?.includes('Encerramento/Entrega da Obra') || false}
                    onCheckedChange={(checked) => handleObjetivoChange('Encerramento/Entrega da Obra', Boolean(checked))}
                  />
                  <Label htmlFor="objetivoEncerramento">Encerramento/Entrega da Obra</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="outroObjetivo">Outros Objetivos</Label>
                <Input id="outroObjetivo" {...register('outroObjetivo')} />
              </div>
              {errors.objetivoVistoria && (
                <span className="text-red-500 text-sm">{errors.objetivoVistoria.message}</span>
              )}
            </CardContent>
          </Card>

          {/* Descrição das Atividades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Descrição das Atividades *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="descricaoAtividades">Descrição Detalhada</Label>
                <Textarea
                  id="descricaoAtividades"
                  {...register('descricaoAtividades')}
                  className={errors.descricaoAtividades ? 'border-red-500' : ''}
                />
                {errors.descricaoAtividades && (
                  <span className="text-red-500 text-sm">{errors.descricaoAtividades.message}</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Situação da Obra */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Situação da Obra *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup {...register('situacaoObra')} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Em Conformidade" id="situacaoConformidade" />
                  <Label htmlFor="situacaoConformidade">Em Conformidade</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Com Pendências" id="situacaoPendencias" />
                  <Label htmlFor="situacaoPendencias">Com Pendências</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Irregularidades Graves" id="situacaoIrregularidades" />
                  <Label htmlFor="situacaoIrregularidades">Irregularidades Graves</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Paralisada" id="situacaoParalisada" />
                  <Label htmlFor="situacaoParalisada">Paralisada</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Finalizada" id="situacaoFinalizada" />
                  <Label htmlFor="situacaoFinalizada">Finalizada</Label>
                </div>
              </RadioGroup>
              {errors.situacaoObra && (
                <span className="text-red-500 text-sm">{errors.situacaoObra.message}</span>
              )}

              <div>
                <Label htmlFor="detalhesPendencias">Detalhes das Pendências</Label>
                <Textarea id="detalhesPendencias" {...register('detalhesPendencias')} />
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recomendacoes">Recomendações e Providências</Label>
                <Textarea id="recomendacoes" {...register('recomendacoes')} />
              </div>
            </CardContent>
          </Card>

          {/* Assinaturas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Assinaturas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fiscalNome">Fiscal da Prefeitura</Label>
                  <Input id="fiscalNome" {...register('fiscalNome')} />
                </div>
                <div>
                  <Label htmlFor="fiscalMatricula">Matrícula do Fiscal</Label>
                  <Input id="fiscalMatricula" {...register('fiscalMatricula')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="representanteNome">Representante da Obra</Label>
                  <Input id="representanteNome" {...register('representanteNome')} />
                </div>
                <div>
                  <Label htmlFor="representanteCargo">Cargo do Representante</Label>
                  <Input id="representanteCargo" {...register('representanteCargo')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registro Fotográfico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Registro Fotográfico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                onClick={() => setShowCamera(true)}
                className="w-full"
                variant="outline"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capturar Foto
              </Button>

              {fotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {fotos.map((foto, index) => (
                    <div key={index} className="relative">
                      <img
                        src={foto.preview}
                        alt={foto.legenda}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        onClick={() => removerFoto(index)}
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {foto.legenda}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botão de Finalizar */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar Vistoria
                </>
              )}
            </Button>
          </div>
        </form>

        {showCamera && (
          <CameraCapture
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
