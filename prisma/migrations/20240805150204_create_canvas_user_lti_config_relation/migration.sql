/*
  Warnings:

  - The values [corporativo] on the enum `PJAdminRoleEnum` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `iv` to the `CanvasLTIConfiguration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PJAdminRoleEnum_new" AS ENUM ('basico', 'medio', 'admin');
ALTER TABLE "PJAdmins" ALTER COLUMN "role" TYPE "PJAdminRoleEnum_new" USING ("role"::text::"PJAdminRoleEnum_new");
ALTER TABLE "CorporateAdmins" ALTER COLUMN "role" TYPE "PJAdminRoleEnum_new" USING ("role"::text::"PJAdminRoleEnum_new");
ALTER TYPE "PJAdminRoleEnum" RENAME TO "PJAdminRoleEnum_old";
ALTER TYPE "PJAdminRoleEnum_new" RENAME TO "PJAdminRoleEnum";
DROP TYPE "PJAdminRoleEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "CanvasLTIConfiguration" ADD COLUMN     "iv" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CanvasUser" ADD CONSTRAINT "CanvasUser_canvasDomain_fkey" FOREIGN KEY ("canvasDomain") REFERENCES "CanvasLTIConfiguration"("canvasDomain") ON DELETE CASCADE ON UPDATE CASCADE;
