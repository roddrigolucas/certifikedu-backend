-- CreateEnum
CREATE TYPE "BillingTypeEnum" AS ENUM ('prepaid', 'postpaid', 'exact_day');

-- CreateEnum
CREATE TYPE "PaymentMethodEnum" AS ENUM ('credit_card', 'boleto', 'debit_card');

-- CreateTable
CREATE TABLE "PagarmePlanItems" (
    "planItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cycles" INTEGER NOT NULL,
    "schemeType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "planId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PagarmePlans" (
    "planId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trialPeriodDays" INTEGER,
    "billingType" "BillingTypeEnum" NOT NULL,
    "billingDays" INTEGER[],
    "paymentMethod" "PaymentMethodEnum"[]
);

-- CreateTable
CREATE TABLE "PagarmePlanSubscription" (
    "subscriptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionCreatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionStartedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionUpdatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionClosedAt" TIMESTAMP(3),
    "paymentMethod" "PaymentMethodEnum" NOT NULL,
    "currency" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "intervalCount" INTEGER NOT NULL,
    "minimumPrice" INTEGER NOT NULL,
    "billingType" TEXT NOT NULL,
    "cycleStart" TIMESTAMP(3) NOT NULL,
    "cycleEnd" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,
    "installments" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PagarmePlanItems_planItemId_key" ON "PagarmePlanItems"("planItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmePlans_planId_key" ON "PagarmePlans"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmePlanSubscription_subscriptionId_key" ON "PagarmePlanSubscription"("subscriptionId");

-- AddForeignKey
ALTER TABLE "PagarmePlanItems" ADD CONSTRAINT "PagarmePlanItems_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PagarmePlans"("planId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmePlanSubscription" ADD CONSTRAINT "PagarmePlanSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PagarmePlans"("planId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmePlanSubscription" ADD CONSTRAINT "PagarmePlanSubscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "PagarmeCustomers"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmePlanSubscription" ADD CONSTRAINT "PagarmePlanSubscription_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PagarmeCards"("cardId") ON DELETE RESTRICT ON UPDATE CASCADE;
