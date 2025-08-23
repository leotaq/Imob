import { Solicitacao, Prestador, Orcamento } from '@/types';

export const mockPrestadores: Prestador[] = [
  {
    id: '1',
    nome: 'João Silva Elétrica',
    contato: '(11) 99999-1111',
    tipoPagamento: 'pix',
    notaRecibo: 'nota'
  },
  {
    id: '2',
    nome: 'Maria Santos Hidráulica',
    contato: '(11) 99999-2222',
    tipoPagamento: 'transferencia',
    notaRecibo: 'recibo'
  },
  {
    id: '3',
    nome: 'Carlos Pereira Pintura',
    contato: '(11) 99999-3333',
    tipoPagamento: 'dinheiro',
    notaRecibo: 'nota'
  }
];

export const mockSolicitacoes: Solicitacao[] = [
  {
    id: '1',
    imovelId: 'APT-001',
    tipoSolicitante: 'inquilino',
    nome: 'Ana Costa',
    telefone: '(11) 88888-1111',
    endereco: 'Rua das Flores, 123 - Apto 45',
    tipoManutencao: 'Elétrica',
    dataSolicitacao: new Date('2024-01-15'),
    prazoFinal: new Date('2024-01-25'),
    descricao: 'Tomada da cozinha não está funcionando',
    status: 'orcamento'
  },
  {
    id: '2',
    imovelId: 'APT-002',
    tipoSolicitante: 'proprietario',
    nome: 'Roberto Lima',
    telefone: '(11) 88888-2222',
    endereco: 'Av. Principal, 456 - Casa 12',
    tipoManutencao: 'Hidráulica',
    dataSolicitacao: new Date('2024-01-20'),
    prazoFinal: new Date('2024-02-01'),
    descricao: 'Vazamento no banheiro',
    status: 'execucao'
  },
  {
    id: '3',
    imovelId: 'APT-003',
    tipoSolicitante: 'imobiliaria',
    nome: 'Imóveis XYZ',
    telefone: '(11) 88888-3333',
    endereco: 'Rua Nova, 789 - Apto 23',
    tipoManutencao: 'Pintura',
    dataSolicitacao: new Date('2024-01-22'),
    prazoFinal: new Date('2024-02-15'),
    descricao: 'Pintura completa do apartamento',
    status: 'aberta'
  }
];

export const mockOrcamentos: Orcamento[] = [
  {
    id: '1',
    solicitacaoId: '1',
    prestador: mockPrestadores[0],
    maoDeObra: 150,
    materiais: 80,
    taxaAdm: 10,
    prazoExecucao: 2,
    total: 253,
    isPrincipal: true,
    dataOrcamento: new Date('2024-01-16')
  },
  {
    id: '2',
    solicitacaoId: '1',
    prestador: mockPrestadores[1],
    maoDeObra: 200,
    materiais: 100,
    taxaAdm: 10,
    prazoExecucao: 3,
    total: 330,
    isPrincipal: false,
    dataOrcamento: new Date('2024-01-17')
  }
];