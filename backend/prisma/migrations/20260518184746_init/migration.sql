-- CreateEnum
CREATE TYPE "Urgencia" AS ENUM ('BAIXO', 'MEDIO', 'ALTO');

-- AlterTable
ALTER TABLE "ReimbursementRequest" ADD COLUMN     "urgencia" "Urgencia" NOT NULL DEFAULT 'BAIXO';
