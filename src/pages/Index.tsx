import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  FileText, 
  Users, 
  Calendar, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Camera, 
  PenTool,
  Download,
  Trash2,
  LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { useVistoria } from '@/hooks/useVistoria';
import { CameraCapture } from '@/components/CameraCapture';
import { generatePDF } from '@/utils/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user, loading } = useAuth();
  const { salvarVistoria, adicionarFoto, removerFoto, fotos, isLoading } = useVistoria();
  const navigate = useNavigate();
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [formData, setFormData] = useState({
    nomeObra: "",
    localizacao: "",
    numeroContrato: "",
    empresaResponsavel: "",
    engenheiroResponsavel: "",
    fiscalPrefeitura: "",
    dataVistoria: "",
    horaVistoria: "",
    objetivoVistoria: [],
    outroObjetivo: "",
    descricaoAtividades: "",
    situacaoObra: "",
    detalhesPendencias: "",
    recomendacoes: "",
    fiscalNome: "",
    fiscalMatricula: "",
    representanteNome: "",
    representanteCargo: ""
  });

  const objetivos = [
    "Início de Obra",
    "Vistoria de Rotina", 
    "Medição",
    "Vistoria Técnica/Análise de Conformidade",
    "Encerramento/Entrega da Obra"
  ];

  const situacoes = [
    "Em Conformidade",
    "Com Pendências", 
    "Irregularidades Graves",
    "Paralisada",
    "Finalizada"
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const vistoriaId = await salvarVistoria(formData);
    
    if (vistoriaId) {
      // Reset form after successful save
      setFormData({
        nomeObra: "",
        localizacao: "",
        numeroContrato: "",
        empresaResponsavel: "",
        engenheiroResponsavel: "",
        fiscalPrefeitura: "",
        dataVistoria: "",
        horaVistoria: "",
        objetivoVistoria: [],
        outroObjetivo: "",
        descricaoAtividades: "",
        situacaoObra: "",
        detalhesPendencias: "",
        recomendacoes: "",
        fiscalNome: "",
        fiscalMatricula: "",
        representanteNome: "",
        representanteCargo: ""
      });
    }
  };

  const handleGeneratePDF = async () => {
    try {
      await generatePDF(formData, fotos);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  const handleCheckboxChange = (objetivo, checked) => {
    setFormData(prev => ({
      ...prev,
      objetivoVistoria: checked 
        ? [...prev.objetivoVistoria, objetivo]
        : prev.objetivoVistoria.filter(item => item !== objetivo)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-amber-600 animate-pulse" />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-amber-600 via-blue-600 to-green-600 text-white">
          <CardHeader className="text-center relative">
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center justify-center mb-2">
              <Building2 className="h-8 w-8 mr-2" />
              <div>
                <h1 className="text-2xl font-bold">PREFEITURA MUNICIPAL DE PRESIDENTE GETÚLIO</h1>
                <p className="text-amber-100">SECRETARIA DE PLANEJAMENTO E DESENVOLVIMENTO ECONÔMICO</p>
              </div>
            </div>
            <Badge variant="secondary" className="mx-auto bg-white text-blue-700">
              RELATÓRIO DE VISTORIA DE OBRAS
            </Badge>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Identificação da Obra */}
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center text-amber-700">
                <FileText className="h-5 w-5 mr-2" />
                1. IDENTIFICAÇÃO DA OBRA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomeObra">Nome da Obra</Label>
                  <Input
                    id="nomeObra"
                    value={formData.nomeObra}
                    onChange={(e) => setFormData(prev => ({...prev, nomeObra: e.target.value}))}
                    placeholder="Digite o nome da obra"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="localizacao" className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Localização (Endereço/Bairro)
                  </Label>
                  <Input
                    id="localizacao"
                    value={formData.localizacao}
                    onChange={(e) => setFormData(prev => ({...prev, localizacao: e.target.value}))}
                    placeholder="Endereço completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="numeroContrato">Número do Contrato / Processo</Label>
                  <Input
                    id="numeroContrato"
                    value={formData.numeroContrato}
                    onChange={(e) => setFormData(prev => ({...prev, numeroContrato: e.target.value}))}
                    placeholder="Nº do contrato ou processo"
                  />
                </div>
                <div>
                  <Label htmlFor="empresaResponsavel">Empresa Responsável</Label>
                  <Input
                    id="empresaResponsavel"
                    value={formData.empresaResponsavel}
                    onChange={(e) => setFormData(prev => ({...prev, empresaResponsavel: e.target.value}))}
                    placeholder="Nome da empresa (se houver)"
                  />
                </div>
                <div>
                  <Label htmlFor="engenheiroResponsavel" className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Engenheiro Responsável
                  </Label>
                  <Input
                    id="engenheiroResponsavel"
                    value={formData.engenheiroResponsavel}
                    onChange={(e) => setFormData(prev => ({...prev, engenheiroResponsavel: e.target.value}))}
                    placeholder="Nome do engenheiro"
                  />
                </div>
                <div>
                  <Label htmlFor="fiscalPrefeitura">Fiscal da Prefeitura</Label>
                  <Input
                    id="fiscalPrefeitura"
                    value={formData.fiscalPrefeitura}
                    onChange={(e) => setFormData(prev => ({...prev, fiscalPrefeitura: e.target.value}))}
                    placeholder="Nome do fiscal"
                  />
                </div>
                <div>
                  <Label htmlFor="dataVistoria" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Data da Vistoria
                  </Label>
                  <Input
                    id="dataVistoria"
                    type="date"
                    value={formData.dataVistoria}
                    onChange={(e) => setFormData(prev => ({...prev, dataVistoria: e.target.value}))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="horaVistoria" className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Hora
                  </Label>
                  <Input
                    id="horaVistoria"
                    type="time"
                    value={formData.horaVistoria}
                    onChange={(e) => setFormData(prev => ({...prev, horaVistoria: e.target.value}))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Objetivo da Vistoria */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <Target className="h-5 w-5 mr-2" />
                2. OBJETIVO DA VISTORIA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {objetivos.map((objetivo) => (
                  <div key={objetivo} className="flex items-center space-x-2">
                    <Checkbox
                      id={objetivo}
                      checked={formData.objetivoVistoria.includes(objetivo)}
                      onCheckedChange={(checked) => handleCheckboxChange(objetivo, checked)}
                    />
                    <Label htmlFor={objetivo} className="text-sm font-medium">
                      {objetivo}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Label htmlFor="outroObjetivo">Outros:</Label>
                <Input
                  id="outroObjetivo"
                  value={formData.outroObjetivo}
                  onChange={(e) => setFormData(prev => ({...prev, outroObjetivo: e.target.value}))}
                  placeholder="Especifique outros objetivos"
                />
              </div>
            </CardContent>
          </Card>

          {/* 3. Descrição das Atividades */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center text-green-700">
                <FileText className="h-5 w-5 mr-2" />
                3. DESCRIÇÃO DAS ATIVIDADES VERIFICADAS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Descreva com clareza o que foi vistoriado: serviços executados, materiais utilizados, equipamentos presentes, equipe em atividade, etc.
              </p>
              <Textarea
                value={formData.descricaoAtividades}
                onChange={(e) => setFormData(prev => ({...prev, descricaoAtividades: e.target.value}))}
                placeholder="Digite a descrição detalhada das atividades verificadas..."
                className="min-h-32"
                required
              />
            </CardContent>
          </Card>

          {/* 4. Situação da Obra */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-700">
                <CheckCircle className="h-5 w-5 mr-2" />
                4. SITUAÇÃO DA OBRA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {situacoes.map((situacao) => (
                  <div key={situacao} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={situacao}
                      name="situacaoObra"
                      value={situacao}
                      checked={formData.situacaoObra === situacao}
                      onChange={(e) => setFormData(prev => ({...prev, situacaoObra: e.target.value}))}
                      className="h-4 w-4 text-emerald-600"
                    />
                    <Label htmlFor={situacao} className="text-sm font-medium">
                      {situacao}
                    </Label>
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="detalhesPendencias">Detalhar as pendências ou irregularidades (se houver):</Label>
                <Textarea
                  id="detalhesPendencias"
                  value={formData.detalhesPendencias}
                  onChange={(e) => setFormData(prev => ({...prev, detalhesPendencias: e.target.value}))}
                  placeholder="Descreva detalhadamente as pendências encontradas..."
                  className="min-h-24"
                />
              </div>
            </CardContent>
          </Card>

          {/* 5. Recomendações */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                5. RECOMENDAÇÕES / PROVIDÊNCIAS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Orientações técnicas, prazos, solicitações à empresa, etc.
              </p>
              <Textarea
                value={formData.recomendacoes}
                onChange={(e) => setFormData(prev => ({...prev, recomendacoes: e.target.value}))}
                placeholder="Digite as recomendações e providências necessárias..."
                className="min-h-32"
              />
            </CardContent>
          </Card>

          {/* 6. Registro Fotográfico */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-700">
                <Camera className="h-5 w-5 mr-2" />
                6. REGISTRO FOTOGRÁFICO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  type="button" 
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Tirar Foto
                </Button>
                
                {fotos.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fotos.map((foto, index) => (
                      <div key={index} className="relative border rounded-lg p-2">
                        <img 
                          src={foto.preview} 
                          alt={foto.legenda}
                          className="w-full h-32 object-cover rounded"
                        />
                        <p className="text-sm mt-2 text-gray-600">{foto.legenda}</p>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => removerFoto(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 7. Assinaturas */}
          <Card className="border-l-4 border-l-gray-500">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-700">
                <PenTool className="h-5 w-5 mr-2" />
                7. ASSINATURAS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Fiscal Técnico da Prefeitura:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fiscalNome">Nome</Label>
                    <Input
                      id="fiscalNome"
                      value={formData.fiscalNome}
                      onChange={(e) => setFormData(prev => ({...prev, fiscalNome: e.target.value}))}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fiscalMatricula">Matrícula</Label>
                    <Input
                      id="fiscalMatricula"
                      value={formData.fiscalMatricula}
                      onChange={(e) => setFormData(prev => ({...prev, fiscalMatricula: e.target.value}))}
                      placeholder="Número da matrícula"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Representante da Empresa Executora (se aplicável):</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="representanteNome">Nome</Label>
                    <Input
                      id="representanteNome"
                      value={formData.representanteNome}
                      onChange={(e) => setFormData(prev => ({...prev, representanteNome: e.target.value}))}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="representanteCargo">Cargo</Label>
                    <Input
                      id="representanteCargo"
                      value={formData.representanteCargo}
                      onChange={(e) => setFormData(prev => ({...prev, representanteCargo: e.target.value}))}
                      placeholder="Cargo/função"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit" 
              className="flex-1 bg-amber-600 hover:bg-amber-700"
              disabled={isLoading}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Relatório'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={handleGeneratePDF}
            >
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF
            </Button>
          </div>
        </form>

        <CameraCapture
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onPhotoCaptured={adicionarFoto}
        />
      </div>
    </div>
  );
};

export default Index;
