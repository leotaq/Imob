import { useMemo } from 'react';
import { mockSolicitacoes } from '@/data/mockData';

export const useImovelGrouping = () => {
  const imoveisAgrupados = useMemo(() => {
    const grouped = mockSolicitacoes.reduce((acc, solicitacao) => {
      if (!acc[solicitacao.imovelId]) {
        acc[solicitacao.imovelId] = {
          imovelId: solicitacao.imovelId,
          endereco: solicitacao.endereco,
          cidade: solicitacao.cidade,
          solicitacoes: []
        };
      }
      acc[solicitacao.imovelId].solicitacoes.push(solicitacao);
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped);
  }, []);

  return { imoveisAgrupados };
};