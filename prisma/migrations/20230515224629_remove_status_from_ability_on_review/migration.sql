/*
  Warnings:

  - You are about to drop the column `status` on the `AbilityOnReview` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AbilityOnReview" DROP COLUMN "status";

-- DropEnum
DROP TYPE "AbilityOnReviewStatus";
