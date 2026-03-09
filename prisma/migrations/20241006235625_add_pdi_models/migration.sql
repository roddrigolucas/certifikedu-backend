-- CreateEnum
CREATE TYPE "PdiStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "AbilityOnReview" ADD COLUMN     "pdi" BOOLEAN;

-- CreateTable
CREATE TABLE "Pdi" (
    "pdiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "dailyTime" TEXT NOT NULL,
    "previousEducation" TEXT,
    "goals" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "progressPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "PdiStatus" NOT NULL DEFAULT 'PENDING',
    "numberOfRetries" INTEGER NOT NULL DEFAULT 0,
    "idPF" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "basicSubscriptionId" TEXT,

    CONSTRAINT "Pdi_pkey" PRIMARY KEY ("pdiId")
);

-- CreateTable
CREATE TABLE "PdiNode" (
    "nodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "objective" TEXT NOT NULL,
    "description" TEXT,
    "markedAsFinished" BOOLEAN NOT NULL DEFAULT false,
    "pdiId" TEXT NOT NULL,

    CONSTRAINT "PdiNode_pkey" PRIMARY KEY ("nodeId")
);

-- CreateTable
CREATE TABLE "PdiNodeAbilities" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nodeId" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,

    CONSTRAINT "PdiNodeAbilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdiNodeAbilitiesOnReview" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nodeId" TEXT NOT NULL,
    "abilityOnReviewId" TEXT NOT NULL,

    CONSTRAINT "PdiNodeAbilitiesOnReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Books" (
    "bookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "description" TEXT,
    "isbn" TEXT,

    CONSTRAINT "Books_pkey" PRIMARY KEY ("bookId")
);

-- CreateTable
CREATE TABLE "BookNodes" (
    "bookNodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,

    CONSTRAINT "BookNodes_pkey" PRIMARY KEY ("bookNodeId")
);

-- CreateTable
CREATE TABLE "BookAbilities" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,

    CONSTRAINT "BookAbilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookAbilitiesOnReview" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT NOT NULL,
    "abilityOnReviewId" TEXT NOT NULL,

    CONSTRAINT "BookAbilitiesOnReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PdiNodeAbilities_nodeId_abilityId_key" ON "PdiNodeAbilities"("nodeId", "abilityId");

-- CreateIndex
CREATE UNIQUE INDEX "PdiNodeAbilitiesOnReview_nodeId_abilityOnReviewId_key" ON "PdiNodeAbilitiesOnReview"("nodeId", "abilityOnReviewId");

-- CreateIndex
CREATE UNIQUE INDEX "BookAbilities_bookId_abilityId_key" ON "BookAbilities"("bookId", "abilityId");

-- CreateIndex
CREATE UNIQUE INDEX "BookAbilitiesOnReview_bookId_abilityOnReviewId_key" ON "BookAbilitiesOnReview"("bookId", "abilityOnReviewId");

-- AddForeignKey
ALTER TABLE "Pdi" ADD CONSTRAINT "Pdi_idPF_fkey" FOREIGN KEY ("idPF") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pdi" ADD CONSTRAINT "Pdi_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "PagarmePlanSubscription"("subscriptionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pdi" ADD CONSTRAINT "Pdi_basicSubscriptionId_fkey" FOREIGN KEY ("basicSubscriptionId") REFERENCES "BasicPlanSubscriptions"("userSubscriptionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdiNode" ADD CONSTRAINT "PdiNode_pdiId_fkey" FOREIGN KEY ("pdiId") REFERENCES "Pdi"("pdiId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdiNodeAbilities" ADD CONSTRAINT "PdiNodeAbilities_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "PdiNode"("nodeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdiNodeAbilities" ADD CONSTRAINT "PdiNodeAbilities_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Abilities"("habilidadeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdiNodeAbilitiesOnReview" ADD CONSTRAINT "PdiNodeAbilitiesOnReview_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "PdiNode"("nodeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdiNodeAbilitiesOnReview" ADD CONSTRAINT "PdiNodeAbilitiesOnReview_abilityOnReviewId_fkey" FOREIGN KEY ("abilityOnReviewId") REFERENCES "AbilityOnReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookNodes" ADD CONSTRAINT "BookNodes_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Books"("bookId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookNodes" ADD CONSTRAINT "BookNodes_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "PdiNode"("nodeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAbilities" ADD CONSTRAINT "BookAbilities_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Books"("bookId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAbilities" ADD CONSTRAINT "BookAbilities_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Abilities"("habilidadeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAbilitiesOnReview" ADD CONSTRAINT "BookAbilitiesOnReview_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Books"("bookId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookAbilitiesOnReview" ADD CONSTRAINT "BookAbilitiesOnReview_abilityOnReviewId_fkey" FOREIGN KEY ("abilityOnReviewId") REFERENCES "AbilityOnReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
