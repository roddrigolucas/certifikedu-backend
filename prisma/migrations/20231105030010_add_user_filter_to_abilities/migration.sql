-- AlterTable
ALTER TABLE "Abilities" ADD COLUMN     "createdByUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerId" INTEGER;

-- AlterTable
ALTER TABLE "AbilityOnReview" ADD COLUMN     "createdByUser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerId" INTEGER;
