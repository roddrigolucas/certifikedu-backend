/*
  Warnings:

  - Made the column `statusRequest` on table `certificates` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "certificates" ALTER COLUMN "statusRequest" SET NOT NULL,
ALTER COLUMN "statusRequest" SET DEFAULT false;
