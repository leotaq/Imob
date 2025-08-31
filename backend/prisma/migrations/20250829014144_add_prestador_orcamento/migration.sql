-- CreateTable
CREATE TABLE "public"."Prestador" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "contato" TEXT NOT NULL,
    "tipoPessoa" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "tipoPagamento" TEXT NOT NULL,
    "notaRecibo" TEXT NOT NULL,
    "especialidades" TEXT[],
    "avaliacaoMedia" DOUBLE PRECISION DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prestador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Orcamento" (
    "id" TEXT NOT NULL,
    "solicitacaoId" TEXT NOT NULL,
    "prestadorId" TEXT NOT NULL,
    "taxaAdm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "prazoExecucao" INTEGER NOT NULL,
    "subtotalMateriais" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotalMaoDeObra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTaxaAdm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "observacoes" TEXT,
    "dataOrcamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAprovacao" TIMESTAMP(3),
    "dataVisita" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ItemOrcamentoServico" (
    "id" TEXT NOT NULL,
    "orcamentoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valorMaoDeObra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tempoEstimado" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemOrcamentoServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MaterialOrcamentoServico" (
    "id" TEXT NOT NULL,
    "itemServicoId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "valorUnitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialOrcamentoServico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prestador_usuarioId_key" ON "public"."Prestador"("usuarioId");

-- AddForeignKey
ALTER TABLE "public"."Prestador" ADD CONSTRAINT "Prestador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orcamento" ADD CONSTRAINT "Orcamento_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "public"."Solicitacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orcamento" ADD CONSTRAINT "Orcamento_prestadorId_fkey" FOREIGN KEY ("prestadorId") REFERENCES "public"."Prestador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ItemOrcamentoServico" ADD CONSTRAINT "ItemOrcamentoServico_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "public"."Orcamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MaterialOrcamentoServico" ADD CONSTRAINT "MaterialOrcamentoServico_itemServicoId_fkey" FOREIGN KEY ("itemServicoId") REFERENCES "public"."ItemOrcamentoServico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
