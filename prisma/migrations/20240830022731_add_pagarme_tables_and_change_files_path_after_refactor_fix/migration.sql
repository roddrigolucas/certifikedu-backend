/*
  Warnings:

  - You are about to drop the column `paymentDate` on the `CertificatesCredits` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `CertificatesCredits` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `CertificatesCredits` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `PagarmeCustomers` table. All the data in the column will be lost.
  - You are about to drop the column `inactiveDate` on the `PagarmeCustomers` table. All the data in the column will be lost.
  - You are about to drop the `PaymentTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DiscountTypeEnum" AS ENUM ('flat', 'percentage');

-- DropForeignKey
ALTER TABLE "CertificatesCredits" DROP CONSTRAINT "CertificatesCredits_userId_paymentId_paymentDate_fkey";

-- DropForeignKey
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT "PaymentTransaction_pagarmeOrderId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT "PaymentTransaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "StudyFieldAbilitites" DROP CONSTRAINT "StudyFieldAbilitites_abilityId_fkey";

-- AlterTable
ALTER TABLE "BackgroundCertificateImages" ADD COLUMN     "bucket" TEXT;

-- AlterTable
ALTER TABLE "CertificatesCredits" DROP COLUMN "paymentDate",
DROP COLUMN "paymentId",
DROP COLUMN "userId",
ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "EvidenceOpenBadge" ADD COLUMN     "bucket" TEXT;

-- AlterTable
ALTER TABLE "NarrativeOpenBadge" ADD COLUMN     "bucket" TEXT;

-- AlterTable
ALTER TABLE "OpenBadges" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "PagarmeCustomers" DROP COLUMN "active",
DROP COLUMN "inactiveDate",
ADD COLUMN     "inSync" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PagarmePlanItems" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PagarmePlanSubscription" ADD COLUMN     "start_at" TIMESTAMP(3),
ALTER COLUMN "subscriptionStartedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Templates" ADD COLUMN     "backgroundId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "PaymentTransaction";

-- CreateTable
CREATE TABLE "PagarmeAddresses" (
    "addressId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "customerId" TEXT NOT NULL,
    "cardId" TEXT
);

-- CreateTable
CREATE TABLE "PagarmeOrderItems" (
    "orderItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "code" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL,
    "pagarmeCreatedAt" TIMESTAMP(3) NOT NULL,
    "pagarmeUpdatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PagarmeCharges" (
    "chargeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT,
    "gatewayId" TEXT,
    "amount" INTEGER NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "pagarmeCreatedAt" TIMESTAMP(3) NOT NULL,
    "pagarmeUpdatedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT,
    "invoiceId" TEXT
);

-- CreateTable
CREATE TABLE "PagarmeSubscriptionCycles" (
    "cycleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cycle" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "pagarmeCycleId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "pagarmeCreatedAt" TIMESTAMP(3) NOT NULL,
    "pagarmeUpdatedAt" TIMESTAMP(3) NOT NULL,
    "billing_at" TIMESTAMP(3),
    "subscriptionId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PagarmeInvoices" (
    "invoiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pagarmeInvoiceId" TEXT NOT NULL,
    "url" TEXT,
    "amount" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL,
    "installments" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "billingAt" TIMESTAMP(3),
    "seenAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "pagarmeCreatedAt" TIMESTAMP(3) NOT NULL,
    "pagarmeUpdatedAt" TIMESTAMP(3) NOT NULL,
    "totalDiscount" INTEGER NOT NULL,
    "totalIncrement" INTEGER NOT NULL,
    "pagarmeCycleId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PagarmeSubscriptionItems" (
    "subscriptionItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" INTEGER NOT NULL,
    "cycles" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "schemeType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "subscriptionId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DiscountOnSubscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "cycles" INTEGER[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "pagarmeDiscountId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "discountId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DiscountOnItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "cycles" INTEGER[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "pagarmeDiscountId" TEXT NOT NULL,
    "planItemId" TEXT NOT NULL,
    "subscriptionItemId" TEXT NOT NULL,
    "discountId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PagarmeDiscounts" (
    "discountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isFlat" BOOLEAN NOT NULL DEFAULT true,
    "cycles" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "total" INTEGER,
    "userId" TEXT
);

-- CreateTable
CREATE TABLE "IncrementOnSubscription" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "cycles" INTEGER[],
    "subscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "pagarmeIncrementId" TEXT NOT NULL,
    "incrementId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "IncrementOnItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "cycles" INTEGER[],
    "planItemId" TEXT,
    "pagarmeIncrementId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "subscriptionItemId" TEXT,
    "incrementId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PagarmeIncrements" (
    "incrementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isFlat" BOOLEAN NOT NULL DEFAULT true,
    "cycles" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "total" INTEGER,
    "userId" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeAddresses_addressId_key" ON "PagarmeAddresses"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeOrderItems_orderItemId_key" ON "PagarmeOrderItems"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeCharges_chargeId_key" ON "PagarmeCharges"("chargeId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeSubscriptionCycles_cycleId_key" ON "PagarmeSubscriptionCycles"("cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeSubscriptionCycles_pagarmeCycleId_key" ON "PagarmeSubscriptionCycles"("pagarmeCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeSubscriptionCycles_cycleId_pagarmeCycleId_key" ON "PagarmeSubscriptionCycles"("cycleId", "pagarmeCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeInvoices_invoiceId_key" ON "PagarmeInvoices"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeInvoices_pagarmeInvoiceId_key" ON "PagarmeInvoices"("pagarmeInvoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeInvoices_pagarmeCycleId_key" ON "PagarmeInvoices"("pagarmeCycleId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeSubscriptionItems_subscriptionItemId_key" ON "PagarmeSubscriptionItems"("subscriptionItemId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountOnSubscription_id_key" ON "DiscountOnSubscription"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountOnSubscription_pagarmeDiscountId_key" ON "DiscountOnSubscription"("pagarmeDiscountId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountOnSubscription_subscriptionId_discountId_key" ON "DiscountOnSubscription"("subscriptionId", "discountId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountOnItem_id_key" ON "DiscountOnItem"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountOnItem_pagarmeDiscountId_key" ON "DiscountOnItem"("pagarmeDiscountId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountOnItem_subscriptionItemId_discountId_key" ON "DiscountOnItem"("subscriptionItemId", "discountId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeDiscounts_discountId_key" ON "PagarmeDiscounts"("discountId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeDiscounts_code_key" ON "PagarmeDiscounts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeDiscounts_discountId_userId_key" ON "PagarmeDiscounts"("discountId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "IncrementOnSubscription_id_key" ON "IncrementOnSubscription"("id");

-- CreateIndex
CREATE UNIQUE INDEX "IncrementOnSubscription_pagarmeIncrementId_key" ON "IncrementOnSubscription"("pagarmeIncrementId");

-- CreateIndex
CREATE UNIQUE INDEX "IncrementOnSubscription_subscriptionId_incrementId_key" ON "IncrementOnSubscription"("subscriptionId", "incrementId");

-- CreateIndex
CREATE UNIQUE INDEX "IncrementOnItem_id_key" ON "IncrementOnItem"("id");

-- CreateIndex
CREATE UNIQUE INDEX "IncrementOnItem_pagarmeIncrementId_key" ON "IncrementOnItem"("pagarmeIncrementId");

-- CreateIndex
CREATE UNIQUE INDEX "IncrementOnItem_subscriptionItemId_incrementId_key" ON "IncrementOnItem"("subscriptionItemId", "incrementId");

-- CreateIndex
CREATE UNIQUE INDEX "IncrementOnItem_planItemId_incrementId_key" ON "IncrementOnItem"("planItemId", "incrementId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeIncrements_incrementId_key" ON "PagarmeIncrements"("incrementId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeIncrements_code_key" ON "PagarmeIncrements"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeIncrements_incrementId_userId_key" ON "PagarmeIncrements"("incrementId", "userId");

-- AddForeignKey
ALTER TABLE "StudyFieldAbilitites" ADD CONSTRAINT "StudyFieldAbilitites_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Abilities"("habilidadeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_backgroundId_fkey" FOREIGN KEY ("backgroundId") REFERENCES "BackgroundCertificateImages"("backgroundId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificatesCredits" ADD CONSTRAINT "CertificatesCredits_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "PagarmeCustomers"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeAddresses" ADD CONSTRAINT "PagarmeAddresses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "PagarmeCustomers"("customerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeAddresses" ADD CONSTRAINT "PagarmeAddresses_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PagarmeCards"("cardId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeOrderItems" ADD CONSTRAINT "PagarmeOrderItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PagarmeOrders"("orderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeCharges" ADD CONSTRAINT "PagarmeCharges_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PagarmeOrders"("orderId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeCharges" ADD CONSTRAINT "PagarmeCharges_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "PagarmeInvoices"("pagarmeInvoiceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeSubscriptionCycles" ADD CONSTRAINT "PagarmeSubscriptionCycles_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "PagarmePlanSubscription"("subscriptionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeInvoices" ADD CONSTRAINT "PagarmeInvoices_pagarmeCycleId_fkey" FOREIGN KEY ("pagarmeCycleId") REFERENCES "PagarmeSubscriptionCycles"("pagarmeCycleId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeSubscriptionItems" ADD CONSTRAINT "PagarmeSubscriptionItems_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "PagarmePlanSubscription"("subscriptionId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountOnSubscription" ADD CONSTRAINT "DiscountOnSubscription_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "PagarmePlanSubscription"("subscriptionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountOnSubscription" ADD CONSTRAINT "DiscountOnSubscription_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "PagarmeDiscounts"("discountId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountOnItem" ADD CONSTRAINT "DiscountOnItem_planItemId_fkey" FOREIGN KEY ("planItemId") REFERENCES "PagarmePlanItems"("planItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountOnItem" ADD CONSTRAINT "DiscountOnItem_subscriptionItemId_fkey" FOREIGN KEY ("subscriptionItemId") REFERENCES "PagarmeSubscriptionItems"("subscriptionItemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountOnItem" ADD CONSTRAINT "DiscountOnItem_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "PagarmeDiscounts"("discountId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeDiscounts" ADD CONSTRAINT "PagarmeDiscounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncrementOnSubscription" ADD CONSTRAINT "IncrementOnSubscription_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "PagarmePlanSubscription"("subscriptionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncrementOnSubscription" ADD CONSTRAINT "IncrementOnSubscription_incrementId_fkey" FOREIGN KEY ("incrementId") REFERENCES "PagarmeIncrements"("incrementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncrementOnItem" ADD CONSTRAINT "IncrementOnItem_planItemId_fkey" FOREIGN KEY ("planItemId") REFERENCES "PagarmePlanItems"("planItemId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncrementOnItem" ADD CONSTRAINT "IncrementOnItem_subscriptionItemId_fkey" FOREIGN KEY ("subscriptionItemId") REFERENCES "PagarmeSubscriptionItems"("subscriptionItemId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncrementOnItem" ADD CONSTRAINT "IncrementOnItem_incrementId_fkey" FOREIGN KEY ("incrementId") REFERENCES "PagarmeIncrements"("incrementId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeIncrements" ADD CONSTRAINT "PagarmeIncrements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE SET NULL ON UPDATE CASCADE;
