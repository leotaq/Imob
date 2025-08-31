import { Solicitacao, Prestador, Orcamento } from '@/types';

export const mockPrestadores: Prestador[] = [
  {
    id: '1',
    usuarioId: 'user-prest-1',
    nome: 'João Silva Elétrica',
    contato: '(11) 99999-1111',
    tipoPessoa: 'cnpj',
    documento: '12.345.678/0001-99',
    tipoPagamento: 'pix',
    notaRecibo: 'nota',
    especialidades: ['tipo-1'],
    avaliacaoMedia: 4.5,
    ativo: true,
    dataCadastro: new Date('2024-01-01')
  },
  {
    id: '2',
    usuarioId: 'user-prest-2',
    nome: 'Maria Santos Hidráulica',
    contato: '(11) 99999-2222',
    tipoPessoa: 'cpf',
    documento: '123.456.789-00',
    tipoPagamento: 'transferencia',
    notaRecibo: 'recibo',
    especialidades: ['tipo-2'],
    avaliacaoMedia: 4.8,
    ativo: true,
    dataCadastro: new Date('2024-01-02')
  },
  {
    id: '3',
    usuarioId: 'user-prest-3',
    nome: 'Carlos Pereira Pintura',
    contato: '(11) 99999-3333',
    tipoPessoa: 'cpf',
    documento: '987.654.321-00',
    tipoPagamento: 'dinheiro',
    notaRecibo: 'nota',
    especialidades: ['tipo-3'],
    avaliacaoMedia: 4.2,
    ativo: true,
    dataCadastro: new Date('2024-01-03')
  }
];

export const mockSolicitacoes: Solicitacao[] = [
  {
    id: '1',
    imovelId: 'APT-001',
    solicitanteId: 'user-1',
    tipoSolicitante: 'inquilino',
    servicos: [
      {
        id: 'serv-1',
        tipoServicoId: 'tipo-1',
        descricao: 'Tomada da cozinha não está funcionando',
        prioridade: 'media'
      }
    ],
    status: 'orcamento',
    dataSolicitacao: new Date('2024-01-15'),
    prazoDesejado: new Date('2024-01-25'),
    observacoesGerais: 'Tomada da cozinha não está funcionando'
  },
  {
    id: '2',
    imovelId: 'APT-002',
    solicitanteId: 'user-2',
    tipoSolicitante: 'proprietario',
    servicos: [
      {
        id: 'serv-2',
        tipoServicoId: 'tipo-2',
        descricao: 'Vazamento no banheiro',
        prioridade: 'alta'
      }
    ],
    status: 'em_andamento',
    dataSolicitacao: new Date('2024-01-20'),
    prazoDesejado: new Date('2024-02-01'),
    observacoesGerais: 'Vazamento no banheiro'
  },
  {
    id: '3',
    imovelId: 'APT-003',
    solicitanteId: 'user-3',
    tipoSolicitante: 'gestor',
    servicos: [
      {
        id: 'serv-3',
        tipoServicoId: 'tipo-3',
        descricao: 'Pintura completa do apartamento',
        prioridade: 'baixa'
      }
    ],
    status: 'pendente',
    dataSolicitacao: new Date('2024-01-22'),
    prazoDesejado: new Date('2024-02-15'),
    observacoesGerais: 'Pintura completa do apartamento'
  }
];

export const mockOrcamentos: Orcamento[] = [
  {
    id: '1',
    solicitacaoId: '1',
    prestadorId: '1',
    itensServico: [
      {
        id: '1',
        servicoSolicitadoId: 'serv-1',
        descricaoServico: 'Reparo de tomada',
        materiais: [
          {
            id: 'mat-1',
            descricao: 'Tomada 10A',
            quantidade: 1,
            valorUnitario: 25,
            valorTotal: 25,
            unidade: 'un'
          },
          {
            id: 'mat-2',
            descricao: 'Fio elétrico 2,5mm',
            quantidade: 5,
            valorUnitario: 11,
            valorTotal: 55,
            unidade: 'm'
          }
        ],
        maoDeObra: 150,
        tempoEstimado: 2
      }
    ],
    subtotalMateriais: 80,
    subtotalMaoDeObra: 150,
    subtotal: 230,
    taxaAdm: 10,
    valorTaxaAdm: 23,
    total: 253,
    prazoExecucao: 2,
    status: 'enviado',
    dataOrcamento: new Date('2024-01-16')
  },
  {
    id: '2',
    solicitacaoId: '1',
    prestadorId: '2',
    itensServico: [
      {
        id: '2',
        servicoSolicitadoId: 'serv-1',
        descricaoServico: 'Reparo de tomada',
        materiais: [
          {
            id: 'mat-3',
            descricao: 'Tomada 10A Premium',
            quantidade: 1,
            valorUnitario: 40,
            valorTotal: 40,
            unidade: 'un'
          },
          {
            id: 'mat-4',
            descricao: 'Fio elétrico 2,5mm Premium',
            quantidade: 5,
            valorUnitario: 12,
            valorTotal: 60,
            unidade: 'm'
          }
        ],
        maoDeObra: 200,
        tempoEstimado: 3
      }
    ],
    subtotalMateriais: 100,
    subtotalMaoDeObra: 200,
    subtotal: 300,
    taxaAdm: 10,
    valorTaxaAdm: 30,
    total: 330,
    prazoExecucao: 3,
    status: 'enviado',
    dataOrcamento: new Date('2024-01-17')
  }
];