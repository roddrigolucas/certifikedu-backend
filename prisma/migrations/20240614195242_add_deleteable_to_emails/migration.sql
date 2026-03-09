/*
  Warnings:

  - Added the required column `deletable` to the `InternalEmailTemplates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InternalEmailTemplates" ADD COLUMN     "deletable" BOOLEAN NOT NULL;
