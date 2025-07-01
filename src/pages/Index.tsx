
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useVistoria } from "@/hooks/useVistoria";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CameraCapture } from "@/components/CameraCapture";
import { IdentificacaoObraForm } from "@/components/forms/IdentificacaoObraForm";
import { ObjetivosVistoriaForm } from "@/components/forms/ObjetivosVistoriaForm";
import { SituacaoObraForm } from "@/components/forms/SituacaoObraForm";
import { AssinaturasForm } from "@/components/forms/AssinaturasForm";
import { RegistroFotograficoForm } from "@/components/forms/RegistroFotograficoForm";
import { ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { salvarVistoria, adicionarFoto, fotos, isLoading: isSaving } = useVistoria();
  const { autocompleteData } = useAutocomplete();
  const { latitude, longitude, error: locationError, requestLocation, formatLocationString } = useGeolocation();
  const { profile } = useUserProfile();
  const { saveOfflineVistoria, getPendingVistorias, syncPendingVistorias, isOnline } = useOfflineStorage();

  const [nomeObra, setNomeObra] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [numeroContrato, setNumeroContrato] = useState("");
  const [empresaResponsavel, setEmpresaResponsavel] = useState("");
  const [engenheiroResponsavel, setEngenheiroResponsavel] = useState("");
  const [fiscalPrefeitura, setFiscalPrefeitura] = useState("");
  const [dataVistoria, setDataVistoria] = useState("");
  const [horaVistoria, setHoraVistoria] = useState("");
  
  const [objetivoVistoria, setObjetivoVistoria] = useState<string[]>([]);
  const [outroObjetivo, setOutroObjetivo] = useState("");
  
  const [descricaoAtividades, setDescricaoAtividades] = useState("");
  
  const [situacaoObra, setSituacaoObra] = useState("");
  const [detalhesPendencias, setDetalhesPendencias] = useState("");
  
  const [recomendacoes, setRecomendacoes] = useState("");
  
  const [fiscalNome, setFiscalNome] = useState("");
  const [representanteNome, setRepresentanteNome] = useState("");
  const [representanteCargo, setRepresentanteCargo] = useState("");

  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    setDataVistoria(today);
    setHoraVistoria(currentTime);
    
    requestLocation();
  }, [requestLocation]);

  // Preencher automaticamente os campos do fiscal com o nome do usuário
  useEffect(() => {
    if (profile?.full_name) {
      setFiscalPrefeitura(profile.full_name);
      setFiscalNome(profile.full_name);
    }
  }, [profile]);

  // Atualizar localização com coordenadas GPS quando disponíveis
  useEffect(() => {
    if (latitude && longitude) {
      const coordenadas = formatLocationString(latitude, longitude);
      if (!localizacao) {
        setLocalizacao(coordenadas);
      }
    }
  }, [latitude, longitude, formatLocationString, localizacao]);

  // Sincronizar dados pendentes quando online
  useEffect(() => {
    if (isOnline) {
      syncPendingVistorias();
    }
  }, [isOnline, syncPendingVistorias]);

  const handleObjetivoChange = (objetivo: string, checked: boolean) => {
    if (checked) {
      setObjetivoVistoria([...objetivoVistoria, objetivo]);
    } else {
      setObjetivoVistoria(objetivoVistoria.filter(obj => obj !== objetivo));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeObra || !localizacao || !descricaoAtividades || !situacaoObra) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (objetivoVistoria.length === 0) {
      toast({
        title: "Objetivo obrigatório",
        description: "Por favor, selecione pelo menos um objetivo da vistoria.",
        variant: "destructive"
      });
      return;
    }

    const vistoriaData = {
      nomeObra,
      localizacao,
      numeroContrato,
      empresaResponsavel,
      engenheiroResponsavel,
      fiscalPrefeitura,
      dataVistoria,
      horaVistoria,
      objetivoVistoria,
      outroObjetivo,
      descricaoAtividades,
      situacaoObra,
      detalhesPendencias,
      recomendacoes,
      fiscalNome,
      fiscalMatricula: "", // Campo removido mas mantido vazio para compatibilidade
      representanteNome,
      representanteCargo,
      latitude,
      longitude
    };

    try {
      if (isOnline) {
        // Tentar salvar online
        const result = await salvarVistoria(vistoriaData);
        if (result) {
          navigate('/vistorias');
        }
      } else {
        // Salvar offline
        await saveOfflineVistoria(vistoriaData, fotos);
        toast({
          title: "Vistoria salva offline",
          description: "A vistoria será sincronizada quando a conexão retornar.",
        });
        navigate('/vistorias');
      }
    } catch (error) {
      // Se falhou online, tenta salvar offline
      if (isOnline) {
        console.log('Falha ao salvar online, tentando offline...');
        await saveOfflineVistoria(vistoriaData, fotos);
        toast({
          title: "Salvo offline",
          description: "Erro na conexão. Vistoria salva localmente e será sincronizada automaticamente.",
        });
        navigate('/vistorias');
      }
    }
  };

  const handleCameraCapture = (photo: { file: File; preview: string; legenda: string }) => {
    console.log('=== HANDLE CAMERA CAPTURE ===');
    console.log('Dados recebidos:', {
      fileSize: photo.file.size,
      fileName: photo.file.name,
      legenda: photo.legenda,
      previewLength: photo.preview.length
    });
    
    adicionarFoto(photo);
    setShowCamera(false);
    
    console.log('Foto adicionada, modal fechado');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/vistorias')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <img 
              src="/lovable-uploads/216f61c9-3d63-4dfe-9f04-239b1cb9cd3b.png" 
              alt="Brasão Presidente Getúlio" 
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Nova Vistoria de Obra
              </h1>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                Preencha os dados da vistoria
                {isOnline ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <Wifi className="w-4 h-4" />
                    Online
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-600 text-sm">
                    <WifiOff className="w-4 h-4" />
                    Offline
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <IdentificacaoObraForm
            nomeObra={nomeObra}
            setNomeObra={setNomeObra}
            localizacao={localizacao}
            setLocalizacao={setLocalizacao}
            numeroContrato={numeroContrato}
            setNumeroContrato={setNumeroContrato}
            empresaResponsavel={empresaResponsavel}
            setEmpresaResponsavel={setEmpresaResponsavel}
            engenheiroResponsavel={engenheiroResponsavel}
            setEngenheiroResponsavel={setEngenheiroResponsavel}
            fiscalPrefeitura={fiscalPrefeitura}
            setFiscalPrefeitura={setFiscalPrefeitura}
            dataVistoria={dataVistoria}
            setDataVistoria={setDataVistoria}
            horaVistoria={horaVistoria}
            setHoraVistoria={setHoraVistoria}
            autocompleteData={autocompleteData}
            latitude={latitude}
            longitude={longitude}
            locationError={locationError}
            formatLocationString={formatLocationString}
            isOnline={isOnline}
          />

          <ObjetivosVistoriaForm
            objetivoVistoria={objetivoVistoria}
            handleObjetivoChange={handleObjetivoChange}
            outroObjetivo={outroObjetivo}
            setOutroObjetivo={setOutroObjetivo}
            autocompleteData={autocompleteData}
          />

          <Card>
            <CardHeader>
              <CardTitle>Descrição das Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="descricaoAtividades">Atividades Executadas *</Label>
                <Textarea
                  id="descricaoAtividades"
                  value={descricaoAtividades}
                  onChange={(e) => setDescricaoAtividades(e.target.value)}
                  placeholder="Descreva as atividades executadas na obra..."
                  className="min-h-[100px]"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <SituacaoObraForm
            situacaoObra={situacaoObra}
            setSituacaoObra={setSituacaoObra}
            detalhesPendencias={detalhesPendencias}
            setDetalhesPendencias={setDetalhesPendencias}
          />

          <Card>
            <CardHeader>
              <CardTitle>Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="recomendacoes">Recomendações e Observações</Label>
                <Textarea
                  id="recomendacoes"
                  value={recomendacoes}
                  onChange={(e) => setRecomendacoes(e.target.value)}
                  placeholder="Recomendações técnicas, prazos, observações gerais..."
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          <AssinaturasForm
            fiscalNome={fiscalNome}
            setFiscalNome={setFiscalNome}
            representanteNome={representanteNome}
            setRepresentanteNome={setRepresentanteNome}
            representanteCargo={representanteCargo}
            setRepresentanteCargo={setRepresentanteCargo}
            autocompleteData={autocompleteData}
            isOnline={isOnline}
          />

          <RegistroFotograficoForm
            fotos={fotos}
            onCapturarFoto={() => setShowCamera(true)}
          />

          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/vistorias')}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? "Salvando..." : isOnline ? "Finalizar Vistoria" : "Salvar Offline"}
            </Button>
          </div>
        </form>
      </div>

      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
          latitude={latitude}
          longitude={longitude}
        />
      )}
    </div>
  );
};

export default Index;
