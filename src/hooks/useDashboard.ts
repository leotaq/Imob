import { useMemo } from 'react';
import useOrcamentos from './useOrcamentos';
import { useSolicitacoes } from './useSolicitacoes';
import { Solicitacao } from '@/types';

// Definindo os tipos de status como constantes para facilitar o uso
const SOLICITACAO_STATUS = {
  ABERTA: 'aberta' as const,
  ORCAMENTO: 'orcamento' as const,
  APROVADA: 'aprovada' as const,
  EXECUCAO: 'execucao' as const,
  CONCLUIDA: 'concluida' as const,
  CANCELADA: 'cancelada' as const
};

const TIPO_MANUTENCAO = {
  ELETRICA: 'eletrica' as const,
  HIDRAULICA: 'hidraulica' as const,
  PINTURA: 'pintura' as const,
  MARCENARIA: 'marcenaria' as const,
  LIMPEZA: 'limpeza' as const,
  OUTROS: 'outros' as const
};

export interface DashboardMetrics {
  totalSolicitacoes: number;
  solicitacoesAbertas: number;
  solicitacoesEmAndamento: number;
  solicitacoesConcluidas: number;
  solicitacoesCanceladas: number;
  taxaConclusao: number;
  tempoMedioResolucao: number;
  totalOrcamentos: number;
  orcamentosAprovados: number;
}

export interface ChartData {
  statusData: Array<{ name: string; value: number; color: string }>;
  monthlyData: Array<{ month: string; solicitacoes: number; orcamentos: number }>;
  categoryData: Array<{ categoria: string; total: number; concluidas: number; taxa: number }>;
}

export const useDashboard = () => {
  const { orcamentos, statistics: orcamentosStats } = useOrcamentos();
  const { solicitacoes } = useSolicitacoes();

  // Métricas principais
  const metrics = useMemo((): DashboardMetrics => {
    const totalSolicitacoes = solicitacoes.length;
    const solicitacoesAbertas = solicitacoes.filter(s => s.status === SOLICITACAO_STATUS.ABERTA).length;
    const solicitacoesEmAndamento = solicitacoes.filter(s => 
      s.status === SOLICITACAO_STATUS.ORCAMENTO || 
      s.status === SOLICITACAO_STATUS.APROVADA || 
      s.status === SOLICITACAO_STATUS.EXECUCAO
    ).length;
    const solicitacoesConcluidas = solicitacoes.filter(s => s.status === SOLICITACAO_STATUS.CONCLUIDA).length;
    const solicitacoesCanceladas = solicitacoes.filter(s => s.status === SOLICITACAO_STATUS.CANCELADA).length;
    
    const taxaConclusao = totalSolicitacoes > 0 ? (solicitacoesConcluidas / totalSolicitacoes) * 100 : 0;
    
    // Calcular tempo médio de resolução (em dias)
    const solicitacoesConcluidas_list = solicitacoes.filter(s => s.status === SOLICITACAO_STATUS.CONCLUIDA);
    const tempoMedioResolucao = solicitacoesConcluidas_list.length > 0 
      ? solicitacoesConcluidas_list.reduce((acc, s) => {
          const inicio = new Date(s.dataSolicitacao);
          const fim = new Date(s.prazoFinal);
          return acc + Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
        }, 0) / solicitacoesConcluidas_list.length
      : 0;

    return {
      totalSolicitacoes,
      solicitacoesAbertas,
      solicitacoesEmAndamento,
      solicitacoesConcluidas,
      solicitacoesCanceladas,
      taxaConclusao,
      tempoMedioResolucao,
      totalOrcamentos: orcamentosStats.total,
      orcamentosAprovados: orcamentosStats.aprovados
    };
  }, [solicitacoes, orcamentosStats]);

  // Dados para gráficos
  const chartData = useMemo((): ChartData => {
    // Dados de status
    const statusData = [
      { name: 'Abertas', value: metrics.solicitacoesAbertas, color: '#ef4444' },
      { name: 'Em Andamento', value: metrics.solicitacoesEmAndamento, color: '#f59e0b' },
      { name: 'Concluídas', value: metrics.solicitacoesConcluidas, color: '#10b981' },
      { name: 'Canceladas', value: metrics.solicitacoesCanceladas, color: '#6b7280' }
    ];

    // Dados mensais (últimos 6 meses)
    const monthlyData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      
      const solicitacoesDoMes = solicitacoes.filter(s => {
        const solicitacaoDate = new Date(s.dataSolicitacao);
        return solicitacaoDate.getMonth() === date.getMonth() && 
               solicitacaoDate.getFullYear() === date.getFullYear();
      }).length;
      
      const orcamentosDoMes = orcamentos.filter(o => {
        const orcamentoDate = new Date(o.dataOrcamento);
        return orcamentoDate.getMonth() === date.getMonth() && 
               orcamentoDate.getFullYear() === date.getFullYear();
      }).length;
      
      monthlyData.push({
        month: monthStr,
        solicitacoes: solicitacoesDoMes,
        orcamentos: orcamentosDoMes
      });
    }

    // Dados por categoria (usando os tipos de manutenção mais comuns)
    const categorias = Object.values(TIPO_MANUTENCAO);
    const categoryData = categorias.map(categoria => {
      const totalCategoria = solicitacoes.filter(s => s.tipoManutencao === categoria).length;
      const concluidasCategoria = solicitacoes.filter(s => 
        s.tipoManutencao === categoria && s.status === SOLICITACAO_STATUS.CONCLUIDA
      ).length;
      const taxa = totalCategoria > 0 ? (concluidasCategoria / totalCategoria) * 100 : 0;
      
      return {
        categoria: categoria.charAt(0).toUpperCase() + categoria.slice(1),
        total: totalCategoria,
        concluidas: concluidasCategoria,
        taxa
      };
    });

    return { statusData, monthlyData, categoryData };
  }, [metrics, solicitacoes, orcamentos]);

  // Solicitações pendentes (não concluídas)
  const solicitacoesPendentes = useMemo(() => {
    return solicitacoes
      .filter(s => s.status !== SOLICITACAO_STATUS.CONCLUIDA && s.status !== SOLICITACAO_STATUS.CANCELADA)
      .sort((a, b) => new Date(a.dataSolicitacao).getTime() - new Date(b.dataSolicitacao).getTime())
      .slice(0, 5);
  }, [solicitacoes]);

  return {
    metrics,
    chartData,
    solicitacoesPendentes,
    isLoading: false // Como estamos usando dados mockados, não há loading
  };
};