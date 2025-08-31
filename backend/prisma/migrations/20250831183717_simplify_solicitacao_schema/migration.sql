/*
  Warnings:

  - You are about to drop the column `empresaId` on the `Solicitacao` table. All the data in the column will be lost.
  - You are about to drop the column `imovelId` on the `Solicitacao` table. All the data in the column will be lost.
  - Added the required column `enderecoBairro` to the `Solicitacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enderecoCep` to the `Solicitacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enderecoCidade` to the `Solicitacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enderecoEstado` to the `Solicitacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enderecoNumero` to the `Solicitacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enderecoRua` to the `Solicitacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoImovel` to the `Solicitacao` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Solicitacao" DROP CONSTRAINT "Solicitacao_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Solicitacao" DROP CONSTRAINT "Solicitacao_imovelId_fkey";

-- AlterTable
ALTER TABLE "public"."Solicitacao" DROP COLUMN "empresaId",
DROP COLUMN "imovelId",
ADD COLUMN     "andarImovel" INTEGER,
ADD COLUMN     "areaImovel" DOUBLE PRECISION,
ADD COLUMN     "banheirosImovel" INTEGER,
ADD COLUMN     "enderecoBairro" TEXT NOT NULL,
ADD COLUMN     "enderecoCep" TEXT NOT NULL,
ADD COLUMN     "enderecoCidade" TEXT NOT NULL,
ADD COLUMN     "enderecoComplemento" TEXT,
ADD COLUMN     "enderecoEstado" TEXT NOT NULL,
ADD COLUMN     "enderecoNumero" TEXT NOT NULL,
ADD COLUMN     "enderecoRua" TEXT NOT NULL,
ADD COLUMN     "observacoesImovel" TEXT,
ADD COLUMN     "quartosImovel" INTEGER,
ADD COLUMN     "temElevador" BOOLEAN,
ADD COLUMN     "tipoImovel" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'aberta';
