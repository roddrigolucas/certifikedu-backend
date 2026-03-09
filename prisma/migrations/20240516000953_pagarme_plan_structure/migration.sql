-- AlterTable
ALTER TABLE "PagarmePlans" ADD COLUMN     "installments" INTEGER[],
ADD COLUMN     "interval" TEXT NOT NULL DEFAULT 'month';
