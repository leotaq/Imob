import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Solicitacao } from '@/types';

interface ExportOptions {
  format: 'csv' | 'pdf';
  filename?: string;
  includeAttachments?: boolean;
}

export const useExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportSolicitacoes = async (solicitacoes: Solicitacao[], options: ExportOptions) => {
    setIsExporting(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = options.filename || `solicitacoes_${timestamp}`;
      
      if (options.format === 'csv') {
        await exportToCSV(solicitacoes, filename);
      } else if (options.format === 'pdf') {
        await exportToPDF(solicitacoes, filename, options.includeAttachments);
      }
      
      toast({
        title: 'Exportação concluída',
        description: `Relatório exportado com sucesso em formato ${options.format.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar o relatório. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async (solicitacoes: Solicitacao[], filename: string) => {
    const csvData = solicitacoes.map(sol => ({
      ID: sol.id,
      Título: sol.titulo,
      Descrição: sol.descricao,
      Status: sol.status,
      Prioridade: sol.prioridade,
      Categoria: sol.categoria,
      'Data Criação': sol.dataCriacao.toLocaleDateString('pt-BR'),
      'Data Limite': sol.dataLimite?.toLocaleDateString('pt-BR') || 'N/A',
      'Valor Estimado': sol.valorEstimado ? `R$ ${sol.valorEstimado.toFixed(2)}` : 'N/A',
      Endereço: sol.endereco,
      'Criado Por': sol.criadoPor,
      'Atribuído Para': sol.atribuidoPara || 'N/A',
      Anexos: sol.anexos?.length || 0
    }));
    
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          // Escapar aspas e vírgulas no CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ].join('\n');
    
    // Adicionar BOM para suporte a caracteres especiais
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `${filename}.csv`);
  };

  const exportToPDF = async (solicitacoes: Solicitacao[], filename: string, includeAttachments?: boolean) => {
    // Implementação básica de PDF usando HTML e print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Não foi possível abrir janela de impressão');
    }

    const htmlContent = generatePDFContent(solicitacoes, includeAttachments);
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      printWindow.print();
      setTimeout(() => printWindow.close(), 1000);
    };
  };

  const generatePDFContent = (solicitacoes: Solicitacao[], includeAttachments?: boolean) => {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Relatório de Solicitações</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; margin-bottom: 5px; }
          .header p { color: #666; margin: 0; }
          .solicitacao { 
            border: 1px solid #ddd; 
            margin-bottom: 20px; 
            padding: 15px; 
            border-radius: 5px;
            page-break-inside: avoid;
          }
          .solicitacao-header { 
            background-color: #f5f5f5; 
            padding: 10px; 
            margin: -15px -15px 15px -15px; 
            border-radius: 5px 5px 0 0;
          }
          .status { 
            display: inline-block; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px; 
            font-weight: bold;
          }
          .status.pendente { background-color: #fef3c7; color: #92400e; }
          .status.em-andamento { background-color: #dbeafe; color: #1e40af; }
          .status.concluida { background-color: #d1fae5; color: #065f46; }
          .status.cancelada { background-color: #fee2e2; color: #991b1b; }
          .field { margin-bottom: 8px; }
          .field strong { color: #333; }
          .attachments { margin-top: 10px; }
          .attachments ul { margin: 5px 0; padding-left: 20px; }
          @media print {
            body { margin: 0; }
            .solicitacao { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório de Solicitações</h1>
          <p>Gerado em: ${currentDate}</p>
          <p>Total de solicitações: ${solicitacoes.length}</p>
        </div>
        
        ${solicitacoes.map(sol => `
          <div class="solicitacao">
            <div class="solicitacao-header">
              <h3 style="margin: 0; color: #333;">${sol.titulo}</h3>
              <span class="status ${sol.status}">${sol.status.toUpperCase()}</span>
            </div>
            
            <div class="field"><strong>ID:</strong> ${sol.id}</div>
            <div class="field"><strong>Descrição:</strong> ${sol.descricao}</div>
            <div class="field"><strong>Categoria:</strong> ${sol.categoria}</div>
            <div class="field"><strong>Prioridade:</strong> ${sol.prioridade}</div>
            <div class="field"><strong>Data de Criação:</strong> ${sol.dataCriacao.toLocaleDateString('pt-BR')}</div>
            ${sol.dataLimite ? `<div class="field"><strong>Data Limite:</strong> ${sol.dataLimite.toLocaleDateString('pt-BR')}</div>` : ''}
            <div class="field"><strong>Endereço:</strong> ${sol.endereco}</div>
            <div class="field"><strong>Criado por:</strong> ${sol.criadoPor}</div>
            ${sol.atribuidoPara ? `<div class="field"><strong>Atribuído para:</strong> ${sol.atribuidoPara}</div>` : ''}
            ${sol.valorEstimado ? `<div class="field"><strong>Valor Estimado:</strong> R$ ${sol.valorEstimado.toFixed(2)}</div>` : ''}
            
            ${includeAttachments && sol.anexos && sol.anexos.length > 0 ? `
              <div class="attachments">
                <strong>Anexos (${sol.anexos.length}):</strong>
                <ul>
                  ${sol.anexos.map(anexo => `<li>${anexo.nome} (${anexo.tipo})</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </body>
      </html>
    `;
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportFilteredData = async (
    solicitacoes: Solicitacao[], 
    filters: {
      status?: string[];
      categoria?: string[];
      prioridade?: string[];
      dateRange?: { start: Date; end: Date };
    },
    options: ExportOptions
  ) => {
    let filteredSolicitacoes = [...solicitacoes];
    
    // Aplicar filtros
    if (filters.status && filters.status.length > 0) {
      filteredSolicitacoes = filteredSolicitacoes.filter(sol => 
        filters.status!.includes(sol.status)
      );
    }
    
    if (filters.categoria && filters.categoria.length > 0) {
      filteredSolicitacoes = filteredSolicitacoes.filter(sol => 
        filters.categoria!.includes(sol.categoria)
      );
    }
    
    if (filters.prioridade && filters.prioridade.length > 0) {
      filteredSolicitacoes = filteredSolicitacoes.filter(sol => 
        filters.prioridade!.includes(sol.prioridade)
      );
    }
    
    if (filters.dateRange) {
      filteredSolicitacoes = filteredSolicitacoes.filter(sol => 
        sol.dataCriacao >= filters.dateRange!.start && 
        sol.dataCriacao <= filters.dateRange!.end
      );
    }
    
    await exportSolicitacoes(filteredSolicitacoes, options);
  };

  return {
    exportSolicitacoes,
    exportFilteredData,
    isExporting
  };
};