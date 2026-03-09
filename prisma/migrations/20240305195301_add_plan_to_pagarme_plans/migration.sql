/*
  Warnings:

  - Added the required column `description` to the `PagarmePlans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PagarmePlans" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "recommendend" BOOLEAN NOT NULL DEFAULT false;
