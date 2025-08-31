-- DropForeignKey
ALTER TABLE "public"."Solicitacao" DROP CONSTRAINT "Solicitacao_empresaId_fkey";

-- AlterTable
ALTER TABLE "public"."Solicitacao" ALTER COLUMN "empresaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Solicitacao" ADD CONSTRAINT "Solicitacao_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
