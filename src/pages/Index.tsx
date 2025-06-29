import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useVistoria } from "@/hooks/useVistoria";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { CameraCapture } from "@/components/CameraCapture";
import { ArrowLeft, MapPin, Camera, FileText, Users, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { salvarVistoria, adicionarFoto, fotos, isLoading: isSaving } = useVistoria();
  const { autocompleteData } = useAutocomplete();
  const { latitude, longitude, error: locationError, requestLocation, formatLocationString } = useGeolocation();
  const { profile } = useUserProfile();

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

    const result = await salvarVistoria(vistoriaData);
    if (result) {
      // Navegar de volta para a lista de vistorias
      navigate('/vistorias');
    }
  };

  const handleCameraCapture = (photo: { file: File; preview: string; legenda: string }) => {
    adicionarFoto(photo);
    setShowCamera(false);
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Nova Vistoria de Obra
              </h1>
              <p className="text-gray-600 mt-1">
                Preencha os dados da vistoria
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Identificação da Obra */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Identificação da Obra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AutocompleteInput
                  label="Nome da Obra"
                  value={nomeObra}
                  onChange={setNomeObra}
                  suggestions={autocompleteData.nomes_obra}
                  placeholder="Digite o nome da obra"
                  required
                />
                
                <div>
                  <Label htmlFor="localizacao">Localização *</Label>
                  <div className="relative">
                    <Input
                      id="localizacao"
                      value={localizacao}
                      onChange={(e) => setLocalizacao(e.target.value)}
                      placeholder="Coordenadas GPS serão preenchidas automaticamente"
                      required
                    />
                    {(latitude && longitude) && (
                      <MapPin className="absolute right-3 top-3 w-4 h-4 text-green-600" />
                    )}
                  </div>
                  {locationError && (
                    <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Localização não disponível
                    </p>
                  )}
                  {(latitude && longitude) && (
                    <p className="text-xs text-green-600 mt-1">
                      GPS ativo: {formatLocationString(latitude, longitude)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AutocompleteInput
                  label="Número do Contrato"
                  value={numeroContrato}
                  onChange={setNumeroContrato}
                  suggestions={autocompleteData.numeros_contrato}
                  placeholder="Número do contrato"
                />

                <AutocompleteInput
                  label="Empresa Responsável"
                  value={empresaResponsavel}
                  onChange={setEmpresaResponsavel}
                  suggestions={autocompleteData.empresas_responsavel}
                  placeholder="Nome da empresa"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AutocompleteInput
                  label="Engenheiro Responsável"
                  value={engenheiroResponsavel}
                  onChange={setEngenheiroResponsavel}
                  suggestions={autocompleteData.engenheiros_responsavel}
                  placeholder="Nome do engenheiro"
                />

                <div>
                  <Label htmlFor="fiscalPrefeitura">Fiscal da Prefeitura</Label>
                  <Input
                    id="fiscalPrefeitura"
                    value={fiscalPrefeitura}
                    onChange={(e) => setFiscalPrefeitura(e.target.value)}
                    placeholder="Nome do fiscal"
                    className="bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Preenchido automaticamente com seu nome
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataVistoria">Data da Vistoria *</Label>
                  <Input
                    id="dataVistoria"
                    type="date"
                    value={dataVistoria}
                    onChange={(e) => setDataVistoria(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="horaVistoria">Hora da Vistoria *</Label>
                  <Input
                    id="horaVistoria"
                    type="time"
                    value={horaVistoria}
                    onChange={(e) => setHoraVistoria(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Objetivos da Vistoria *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Início de Obra",
                  "Vistoria de Rotina", 
                  "Medição",
                  "Vistoria Técnica/Análise de Conformidade",
                  "Encerramento/Entrega da Obra"
                ].map((objetivo) => (
                  <div key={objetivo} className="flex items-center space-x-2">
                    <Checkbox
                      id={objetivo}
                      checked={objetivoVistoria.includes(objetivo)}
                      onCheckedChange={(checked) => handleObjetivoChange(objetivo, checked as boolean)}
                    />
                    <Label htmlFor={objetivo}>{objetivo}</Label>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Label htmlFor="outroObjetivo">Outro objetivo (especificar)</Label>
                <Input
                  id="outroObjetivo"
                  value={outroObjetivo}
                  onChange={(e) => setOutroObjetivo(e.target.value)}
                  placeholder="Especifique outro objetivo"
                />
              </div>
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader>
              <CardTitle>Situação da Obra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="situacaoObra">Situação Encontrada *</Label>
                <Select value={situacaoObra} onValueChange={setSituacaoObra} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a situação da obra" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Em Conformidade">Em Conformidade</SelectItem>
                    <SelectItem value="Com Pendências">Com Pendências</SelectItem>
                    <SelectItem value="Irregularidades Graves">Irregularidades Graves</SelectItem>
                    <SelectItem value="Paralisada">Paralisada</SelectItem>
                    <SelectItem value="Finalizada">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(situacaoObra === "Com Pendências" || situacaoObra === "Irregularidades Graves") && (
                <div>
                  <Label htmlFor="detalhesPendencias">Detalhes das Pendências/Irregularidades</Label>
                  <Textarea
                    id="detalhesPendencias"
                    value={detalhesPendencias}
                    onChange={(e) => setDetalhesPendencias(e.target.value)}
                    placeholder="Descreva as pendências ou irregularidades encontradas..."
                    className="min-h-[80px]"
                  />
                </div>
              )}
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Assinaturas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fiscalNome">Nome do Fiscal</Label>
                <Input
                  id="fiscalNome"
                  value={fiscalNome}
                  onChange={(e) => setFiscalNome(e.target.value)}
                  placeholder="Nome completo do fiscal"
                  className="bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  Preenchido automaticamente com seu nome
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AutocompleteInput
                  label="Nome do Representante da Obra"
                  value={representanteNome}
                  onChange={setRepresentanteNome}
                  suggestions={autocompleteData.representantes_nome}
                  placeholder="Nome do representante"
                />

                <AutocompleteInput
                  label="Cargo do Representante"
                  value={representanteCargo}
                  onChange={setRepresentanteCargo}
                  suggestions={autocompleteData.representantes_cargo}
                  placeholder="Cargo do representante"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Registro Fotográfico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capturar Foto
                </Button>

                {fotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {fotos.map((foto, index) => (
                      <div key={index} className="space-y-2">
                        <img
                          src={foto.preview}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <p className="text-xs text-gray-600 truncate">
                          {foto.legenda || `Foto ${index + 1}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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
              {isSaving ? "Salvando..." : "Finalizar Vistoria"}
            </Button>
          </div>
        </form>
      </div>

      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)} 
        />
      )}
    </div>
  );
};

export default Index;
