
import jsPDF from 'jspdf';

interface VistoriaData {
  nomeObra: string;
  localizacao: string;
  numeroContrato?: string;
  empresaResponsavel?: string;
  engenheiroResponsavel?: string;
  fiscalPrefeitura?: string;
  dataVistoria: string;
  horaVistoria: string;
  objetivoVistoria: string[];
  outroObjetivo?: string;
  descricaoAtividades: string;
  situacaoObra: string;
  detalhesPendencias?: string;
  recomendacoes?: string;
  fiscalNome?: string;
  fiscalMatricula?: string;
  representanteNome?: string;
  representanteCargo?: string;
}

interface CapturedPhoto {
  file: File;
  preview: string;
  legenda: string;
}

export const generatePDF = async (data: VistoriaData, fotos: CapturedPhoto[]) => {
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
  addText(`Nome da Obra: ${data.nomeObra}`, 20);
  addText(`Localização: ${data.localizacao}`, 20);
  addText(`Número do Contrato/Processo: ${data.numeroContrato || ''}`, 20);
  addText(`Empresa Responsável: ${data.empresaResponsavel || ''}`, 20);
  addText(`Engenheiro Responsável: ${data.engenheiroResponsavel || ''}`, 20);
  addText(`Fiscal da Prefeitura: ${data.fiscalPrefeitura || ''}`, 20);
  addText(`Data da Vistoria: ${data.dataVistoria}`, 20);
  addText(`Hora: ${data.horaVistoria}`, 20);
  currentY += 10;

  // 2. Objetivo da Vistoria
  addText('2. OBJETIVO DA VISTORIA', 20, 12, true);
  if (data.objetivoVistoria.length > 0) {
    data.objetivoVistoria.forEach(objetivo => {
      addText(`• ${objetivo}`, 30);
    });
  }
  if (data.outroObjetivo) {
    addText(`• Outros: ${data.outroObjetivo}`, 30);
  }
  currentY += 10;

  // 3. Descrição das Atividades
  addText('3. DESCRIÇÃO DAS ATIVIDADES VERIFICADAS', 20, 12, true);
  addText(data.descricaoAtividades, 20);
  currentY += 10;

  // 4. Situação da Obra
  addText('4. SITUAÇÃO DA OBRA', 20, 12, true);
  addText(`Situação: ${data.situacaoObra}`, 20);
  if (data.detalhesPendencias) {
    addText('Detalhes das pendências:', 20, 10, true);
    addText(data.detalhesPendencias, 20);
  }
  currentY += 10;

  // 5. Recomendações
  if (data.recomendacoes) {
    addText('5. RECOMENDAÇÕES / PROVIDÊNCIAS', 20, 12, true);
    addText(data.recomendacoes, 20);
    currentY += 10;
  }

  // 6. Registro Fotográfico
  if (fotos.length > 0) {
    addText('6. REGISTRO FOTOGRÁFICO', 20, 12, true);
    
    for (let i = 0; i < fotos.length; i++) {
      const foto = fotos[i];
      
      try {
        // Converter foto para canvas
        const img = new Image();
        img.src = foto.preview;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Redimensionar imagem para caber no PDF
        const maxWidth = pageWidth - 60;
        const maxHeight = 100;
        
        let { width, height } = img;
        
//        if (width > maxWidth) {
//          height = (height * maxWidth) / width;
//          width = maxWidth;
//        }
//        
//        if (height > maxHeight) {
//          width = (width * maxHeight) / height;
//          height = maxHeight;
//        }
        
        width = width / 10;
        height = height / 10;
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        const imgData = canvas.toDataURL();
        
        checkPageBreak(height + 20);
        
        pdf.addImage(imgData, 'PNG', 30, currentY, width, height);
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
  
  if (data.fiscalNome || data.fiscalMatricula) {
    addText('Fiscal Técnico da Prefeitura:', 20, 10, true);
    addText(`Nome: ${data.fiscalNome || ''}`, 20);
    addText(`Matrícula: ${data.fiscalMatricula || ''}`, 20);
    currentY += 20; // Espaço para assinatura
    addText('Assinatura: _______________________________', 20);
    currentY += 15;
  }

  if (data.representanteNome || data.representanteCargo) {
    addText('Representante da Empresa Executora:', 20, 10, true);
    addText(`Nome: ${data.representanteNome || ''}`, 20);
    addText(`Cargo: ${data.representanteCargo || ''}`, 20);
    currentY += 20; // Espaço para assinatura
    addText('Assinatura: _______________________________', 20);
  }

  // Salvar PDF
  const fileName = `vistoria-${data.nomeObra.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};
