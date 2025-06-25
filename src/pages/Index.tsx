
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
  PenTool 
} from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
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
    fotos: [],
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados do formulário:", formData);
    toast({
      title: "Relatório Salvo",
      description: "O relatório de vistoria foi salvo com sucesso!",
    });
  };

  const handleCheckboxChange = (objetivo, checked) => {
    setFormData(prev => ({
      ...prev,
      objetivoVistoria: checked 
        ? [...prev.objetivoVistoria, objetivo]
        : prev.objetivoVistoria.filter(item => item !== objetivo)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Building2 className="h-8 w-8 mr-2" />
              <div>
                <h1 className="text-2xl font-bold">PREFEITURA MUNICIPAL</h1>
                <p className="text-blue-100">SECRETARIA DE OBRAS E SERVIÇOS URBANOS</p>
              </div>
            </div>
            <Badge variant="secondary" className="mx-auto bg-white text-blue-700">
              RELATÓRIO DE VISTORIA DE OBRAS
            </Badge>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Identificação da Obra */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Objetivo da Vistoria */}
          <Card>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
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
              />
            </CardContent>
          </Card>

          {/* 4. Situação da Obra */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
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
                      className="h-4 w-4 text-blue-600"
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
                <Camera className="h-5 w-5 mr-2" />
                6. REGISTRO FOTOGRÁFICO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Anexar as imagens datadas e legendadas.
              </p>
              <div className="space-y-3">
                <Input type="file" accept="image/*" multiple className="mb-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input placeholder="Legenda Foto 1" />
                  <Input placeholder="Legenda Foto 2" />
                  <Input placeholder="Legenda Foto 3" />
                </div>
                <Button type="button" variant="outline" className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Adicionar Mais Fotos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 7. Assinaturas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-700">
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
                <div className="mt-3">
                  <Label>Assinatura Digital</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <PenTool className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Área para assinatura digital</p>
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
                <div className="mt-3">
                  <Label>Assinatura Digital</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <PenTool className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Área para assinatura digital</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              Salvar Relatório
            </Button>
            <Button type="button" variant="outline" className="flex-1">
              Gerar PDF
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Index;
