import jsPDF from 'jspdf';

interface VistoriaData {
  id: string;
  nome_obra: string;
  localizacao: string;
  data_vistoria: string;
  hora_vistoria: string;
  numero_contrato: string | null;
  empresa_responsavel: string | null;
  engenheiro_responsavel: string | null;
  fiscal_prefeitura: string | null;
  latitude: number | null;
  longitude: number | null;
  objetivo_inicio_obra: boolean;
  objetivo_vistoria_rotina: boolean;
  objetivo_medicao: boolean;
  objetivo_vistoria_tecnica: boolean;
  objetivo_encerramento: boolean;
  objetivo_outros: string | null;
  descricao_atividades: string;
  situacao_conformidade: boolean;
  situacao_irregularidades: boolean;
  situacao_pendencias: boolean;
  situacao_paralisada: boolean;
  situacao_finalizada: boolean;
  detalhes_pendencias: string | null;
  recomendacoes: string | null;
  fiscal_nome: string | null;
  representante_nome: string | null;
  representante_cargo: string | null;
  created_at: string;
  fotos: Array<{
    id: string;
    arquivo_url: string;
    legenda: string;
    ordem: number;
  }>;
}

export const generateVistoriaPDF = async (vistoria: VistoriaData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let currentY = 20;

  // Função para adicionar quebra de página se necessário
  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      pdf.addPage();
      currentY = 20;
    }
  };

  // Função para texto com quebra de linha
  const addText = (text: string, x: number, fontSize: number = 10, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    const lines = pdf.splitTextToSize(text, pageWidth - 40);
    const lineHeight = fontSize * 0.4;
    
    checkPageBreak(lines.length * lineHeight);
    
    lines.forEach((line: string) => {
      pdf.text(line, x, currentY);
      currentY += lineHeight;
    });
    
    currentY += 5; // Espaço extra após o texto
  };

  // Cabeçalho
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PREFEITURA MUNICIPAL DE PRESIDENTE GETÚLIO', pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;
  
  pdf.setFontSize(12);
  pdf.text('SECRETARIA DE PLANEJAMENTO E DESENVOLVIMENTO ECONÔMICO', pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;
  
  pdf.setFontSize(14);
  pdf.text('RELATÓRIO DE VISTORIA DE OBRAS', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // 1. Identificação da Obra
  addText('1. IDENTIFICAÇÃO DA OBRA', 20, 12, true);
  addText(`Nome da Obra: ${vistoria.nome_obra}`, 20);
  addText(`Localização: ${vistoria.localizacao}`, 20);
  addText(`Número do Contrato/Processo: ${vistoria.numero_contrato || ''}`, 20);
  addText(`Empresa Responsável: ${vistoria.empresa_responsavel || ''}`, 20);
  addText(`Engenheiro Responsável: ${vistoria.engenheiro_responsavel || ''}`, 20);
  addText(`Fiscal da Prefeitura: ${vistoria.fiscal_prefeitura || ''}`, 20);
  addText(`Data da Vistoria: ${vistoria.data_vistoria}`, 20);
  addText(`Hora: ${vistoria.hora_vistoria}`, 20);
  currentY += 10;

  // 2. Objetivo da Vistoria
  addText('2. OBJETIVO DA VISTORIA', 20, 12, true);
  const objetivos = [];
  if (vistoria.objetivo_inicio_obra) objetivos.push('Início de Obra');
  if (vistoria.objetivo_vistoria_rotina) objetivos.push('Vistoria de Rotina');
  if (vistoria.objetivo_medicao) objetivos.push('Medição');
  if (vistoria.objetivo_vistoria_tecnica) objetivos.push('Vistoria Técnica/Análise de Conformidade');
  if (vistoria.objetivo_encerramento) objetivos.push('Encerramento/Entrega da Obra');
  if (vistoria.objetivo_outros) objetivos.push(`Outros: ${vistoria.objetivo_outros}`);
  
  objetivos.forEach(objetivo => {
    addText(`• ${objetivo}`, 30);
  });
  currentY += 10;

  // 3. Descrição das Atividades
  addText('3. DESCRIÇÃO DAS ATIVIDADES VERIFICADAS', 20, 12, true);
  addText(vistoria.descricao_atividades, 20);
  currentY += 10;

  // 4. Situação da Obra
  addText('4. SITUAÇÃO DA OBRA', 20, 12, true);
  let situacao = '';
  if (vistoria.situacao_finalizada) situacao = 'Finalizada';
  else if (vistoria.situacao_conformidade) situacao = 'Em Conformidade';
  else if (vistoria.situacao_irregularidades) situacao = 'Com Irregularidades';
  else if (vistoria.situacao_pendencias) situacao = 'Com Pendências';
  else if (vistoria.situacao_paralisada) situacao = 'Paralisada';
  else situacao = 'Em Andamento';
  
  addText(`Situação: ${situacao}`, 20);
  if (vistoria.detalhes_pendencias) {
    addText('Detalhes das pendências:', 20, 10, true);
    addText(vistoria.detalhes_pendencias, 20);
  }
  currentY += 10;

  // 5. Recomendações
  if (vistoria.recomendacoes) {
    addText('5. RECOMENDAÇÕES / PROVIDÊNCIAS', 20, 12, true);
    addText(vistoria.recomendacoes, 20);
    currentY += 10;
  }

  // 6. Registro Fotográfico
  if (vistoria.fotos.length > 0) {
    addText('6. REGISTRO FOTOGRÁFICO', 20, 12, true);
    
    for (let i = 0; i < vistoria.fotos.length; i++) {
      const foto = vistoria.fotos[i];
      
      try {
        // Converter foto para canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = foto.arquivo_url;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Redimensionar imagem para caber no PDF
        const maxWidth = pageWidth - 60;
        const maxHeight = 80;
        
        let { width, height } = img;
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        checkPageBreak(height + 20);
        
        pdf.addImage(imgData, 'JPEG', 30, currentY, width, height);
        currentY += height + 5;
        
        addText(`Foto ${i + 1}: ${foto.legenda}`, 30, 9);
        currentY += 10;
        
      } catch (error) {
        console.error('Erro ao processar foto:', error);
        addText(`Foto ${i + 1}: ${foto.legenda} (Erro ao carregar imagem)`, 30, 9);
      }
    }
  }

  // 7. Assinaturas
  addText('7. ASSINATURAS', 20, 12, true);
  
  if (vistoria.fiscal_nome) {
    addText('Fiscal Técnico da Prefeitura:', 20, 10, true);
    addText(`Nome: ${vistoria.fiscal_nome}`, 20);
    currentY += 20; // Espaço para assinatura
    addText('Assinatura: _______________________________', 20);
    currentY += 15;
  }

  if (vistoria.representante_nome) {
    addText('Representante da Empresa Executora:', 20, 10, true);
    addText(`Nome: ${vistoria.representante_nome}`, 20);
    if (vistoria.representante_cargo) {
      addText(`Cargo: ${vistoria.representante_cargo}`, 20);
    }
    currentY += 20; // Espaço para assinatura
    addText('Assinatura: _______________________________', 20);
  }

  // Salvar PDF
  const fileName = `vistoria-${vistoria.nome_obra.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};

// Keep the old function for backward compatibility
export const generatePDF = generateVistoriaPDF;
