/*
  Warnings:

  - A unique constraint covering the columns `[certificateCreditId]` on the table `certificates` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "certificateCreditId" INTEGER,
ADD COLUMN     "paymentType" TEXT NOT NULL DEFAULT 'NULL',
ADD COLUMN     "subscriptionId" INTEGER;

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "paymentId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "qty" INTEGER
);

-- CreateTable
CREATE TABLE "CertificatesCredits" (
    "CertificateCreditId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "usedAt" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "BlockchainCredits" (
    "blockchainCreditId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "usedAt" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "Subscriptions" (
    "subscriptionId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "subscriptionType" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "transactionId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "BlockchainTransactions" (
    "transactionId" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "certificateId" INTEGER NOT NULL,
    "DocumentId" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "paymentType" TEXT NOT NULL,
    "blockchainCreditId" INTEGER,
    "subscriptionId" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_paymentId_key" ON "PaymentTransaction"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_userId_paymentId_createdAt_key" ON "PaymentTransaction"("userId", "paymentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CertificatesCredits_CertificateCreditId_key" ON "CertificatesCredits"("CertificateCreditId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainCredits_blockchainCreditId_key" ON "BlockchainCredits"("blockchainCreditId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriptions_subscriptionId_key" ON "Subscriptions"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainTransactions_transactionId_key" ON "BlockchainTransactions"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainTransactions_blockchainCreditId_key" ON "BlockchainTransactions"("blockchainCreditId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certificateCreditId_key" ON "certificates"("certificateCreditId");

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_certificateCreditId_fkey" FOREIGN KEY ("certificateCreditId") REFERENCES "CertificatesCredits"("CertificateCreditId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscriptions"("subscriptionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificatesCredits" ADD CONSTRAINT "CertificatesCredits_userId_paymentId_paymentDate_fkey" FOREIGN KEY ("userId", "paymentId", "paymentDate") REFERENCES "PaymentTransaction"("userId", "paymentId", "createdAt") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainCredits" ADD CONSTRAINT "BlockchainCredits_userId_paymentId_paymentDate_fkey" FOREIGN KEY ("userId", "paymentId", "paymentDate") REFERENCES "PaymentTransaction"("userId", "paymentId", "createdAt") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "PaymentTransaction"("paymentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainTransactions" ADD CONSTRAINT "BlockchainTransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainTransactions" ADD CONSTRAINT "BlockchainTransactions_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainTransactions" ADD CONSTRAINT "BlockchainTransactions_blockchainCreditId_fkey" FOREIGN KEY ("blockchainCreditId") REFERENCES "BlockchainCredits"("blockchainCreditId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainTransactions" ADD CONSTRAINT "BlockchainTransactions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscriptions"("subscriptionId") ON DELETE SET NULL ON UPDATE CASCADE;
