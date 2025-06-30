
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVistoriaDetails } from '@/hooks/useVistoriaDetails';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, Printer, MapPin, Calendar, Building, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generateVistoriaPDF } from '@/utils/pdfGenerator';

const VistoriaView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vistoria, isLoading } = useVistoriaDetails(id);

  const handlePrintPDF = () => {
    if (!vistoria) return;
    generateVistoriaPDF(vistoria);
  };

  const getStatusInfo = () => {
    if (!vistoria) return { text: '', color: '' };
    
    if (vistoria.situacao_finalizada) return { text: 'Finalizado', color: 'bg-green-100 text-green-800' };
    if (vistoria.situacao_conformidade) return { text: 'Em Conformidade', color: 'bg-blue-100 text-blue-800' };
    if (vistoria.situacao_irregularidades) return { text: 'Irregularidades', color: 'bg-red-100 text-red-800' };
    if (vistoria.situacao_pendencias) return { text: 'Com Pendências', color: 'bg-yellow-100 text-yellow-800' };
    if (vistoria.situacao_paralisada) return { text: 'Paralisada', color: 'bg-gray-100 text-gray-800' };
    return { text: 'Rascunho', color: 'bg-orange-100 text-orange-800' };
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getObjetivos = () => {
    if (!vistoria) return [];
    const objetivos = [];
    if (vistoria.objetivo_inicio_obra) objetivos.push('Início de Obra');
    if (vistoria.objetivo_vistoria_rotina) objetivos.push('Vistoria de Rotina');
    if (vistoria.objetivo_medicao) objetivos.push('Medição');
    if (vistoria.objetivo_vistoria_tecnica) objetivos.push('Vistoria Técnica/Análise de Conformidade');
    if (vistoria.objetivo_encerramento) objetivos.push('Encerramento/Entrega da Obra');
    if (vistoria.objetivo_outros) objetivos.push(vistoria.objetivo_outros);
    return objetivos;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!vistoria) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Vistoria não encontrada</h2>
          <Button onClick={() => navigate('/vistorias')}>
            Voltar para Vistorias
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/216f61c9-3d63-4dfe-9f04-239b1cb9cd3b.png" 
                alt="Brasão Presidente Getúlio" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Detalhes da Vistoria
                </h1>
                <p className="text-gray-600">{vistoria.nome_obra}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrintPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/vistorias')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Informações Gerais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Informações Gerais
              <Badge className={statusInfo.color}>
                {statusInfo.text}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Building className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Nome da Obra</p>
                  <p className="text-gray-600">{vistoria.nome_obra}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Localização</p>
                  <p className="text-gray-600">{vistoria.localizacao}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-500 mt-1" />
                <div>
                  <p className="font-medium">Data da Vistoria</p>
                  <p className="text-gray-600">{formatDate(vistoria.data_vistoria)} às {vistoria.hora_vistoria}</p>
                </div>
              </div>
              {vistoria.numero_contrato && (
                <div>
                  <p className="font-medium">Número do Contrato</p>
                  <p className="text-gray-600">{vistoria.numero_contrato}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Responsáveis */}
        <Card>
          <CardHeader>
            <CardTitle>Responsáveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {vistoria.empresa_responsavel && (
                <div>
                  <p className="font-medium">Empresa Responsável</p>
                  <p className="text-gray-600">{vistoria.empresa_responsavel}</p>
                </div>
              )}
              {vistoria.engenheiro_responsavel && (
                <div>
                  <p className="font-medium">Engenheiro Responsável</p>
                  <p className="text-gray-600">{vistoria.engenheiro_responsavel}</p>
                </div>
              )}
              {vistoria.fiscal_prefeitura && (
                <div>
                  <p className="font-medium">Fiscal da Prefeitura</p>
                  <p className="text-gray-600">{vistoria.fiscal_prefeitura}</p>
                </div>
              )}
              {vistoria.representante_nome && (
                <div>
                  <p className="font-medium">Representante</p>
                  <p className="text-gray-600">{vistoria.representante_nome} - {vistoria.representante_cargo}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Objetivos */}
        <Card>
          <CardHeader>
            <CardTitle>Objetivos da Vistoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getObjetivos().map((objetivo, index) => (
                <Badge key={index} variant="secondary">
                  {objetivo}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Descrição das Atividades */}
        <Card>
          <CardHeader>
            <CardTitle>Descrição das Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{vistoria.descricao_atividades}</p>
          </CardContent>
        </Card>

        {/* Pendências */}
        {vistoria.detalhes_pendencias && (
          <Card>
            <CardHeader>
              <CardTitle>Detalhes das Pendências</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{vistoria.detalhes_pendencias}</p>
            </CardContent>
          </Card>
        )}

        {/* Recomendações */}
        {vistoria.recomendacoes && (
          <Card>
            <CardHeader>
              <CardTitle>Recomendações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{vistoria.recomendacoes}</p>
            </CardContent>
          </Card>
        )}

        {/* Fotos */}
        {vistoria.fotos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Registro Fotográfico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {vistoria.fotos.map((foto) => (
                  <div key={foto.id} className="space-y-2">
                    <img 
                      src={foto.arquivo_url} 
                      alt={foto.legenda}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <p className="text-sm text-gray-600">{foto.legenda}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VistoriaView;
