/*
  Warnings:

  - You are about to drop the column `pagarmeSubscriptionId` on the `PaymentTransaction` table. All the data in the column will be lost.
  - You are about to drop the `BlockchainCredits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlockchainTransactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PagarmeSubscriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `emittedCertificatesPeriod` to the `PagarmePlans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emittedCertificatesQuota` to the `PagarmePlans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `montlhyPrice` to the `PagarmePlans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pdiPeriod` to the `PagarmePlans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pdisQty` to the `PagarmePlans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planName` to the `PagarmePlans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivedCertificatePeriod` to the `PagarmePlans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receivedCertificateQuota` to the `PagarmePlans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `singleCertificatePrice` to the `PagarmePlans` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuotaPeriod" AS ENUM ('monthly', 'bimonthly', 'trimontlhy', 'biannually', 'annually', 'forever', 'unlimited');

-- DropForeignKey
ALTER TABLE "BlockchainCredits" DROP CONSTRAINT "BlockchainCredits_userId_paymentId_paymentDate_fkey";

-- DropForeignKey
ALTER TABLE "BlockchainTransactions" DROP CONSTRAINT "BlockchainTransactions_blockchainCreditId_fkey";

-- DropForeignKey
ALTER TABLE "BlockchainTransactions" DROP CONSTRAINT "BlockchainTransactions_certificateId_fkey";

-- DropForeignKey
ALTER TABLE "BlockchainTransactions" DROP CONSTRAINT "BlockchainTransactions_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "BlockchainTransactions" DROP CONSTRAINT "BlockchainTransactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "PagarmePlanSubscription" DROP CONSTRAINT "PagarmePlanSubscription_cardId_fkey";

-- DropForeignKey
ALTER TABLE "PagarmeSubscriptions" DROP CONSTRAINT "PagarmeSubscriptions_creditCardId_fkey";

-- DropForeignKey
ALTER TABLE "PagarmeSubscriptions" DROP CONSTRAINT "PagarmeSubscriptions_customerId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT "PaymentTransaction_pagarmeSubscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "Subscriptions" DROP CONSTRAINT "Subscriptions_pagarmeSubscriptionsId_fkey";

-- DropForeignKey
ALTER TABLE "Subscriptions" DROP CONSTRAINT "Subscriptions_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_subscriptionId_fkey";

-- DropIndex
DROP INDEX "PaymentTransaction_pagarmeSubscriptionId_key";

-- AlterTable
ALTER TABLE "PagarmePlanSubscription" ALTER COLUMN "cardId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PagarmePlans" ADD COLUMN     "emittedCertificatesPeriod" "QuotaPeriod" NOT NULL,
ADD COLUMN     "emittedCertificatesQuota" INTEGER NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "montlhyPrice" INTEGER NOT NULL,
ADD COLUMN     "pdiPeriod" "QuotaPeriod" NOT NULL,
ADD COLUMN     "pdisQty" INTEGER NOT NULL,
ADD COLUMN     "planName" TEXT NOT NULL,
ADD COLUMN     "receivedCertificatePeriod" "QuotaPeriod" NOT NULL,
ADD COLUMN     "receivedCertificateQuota" INTEGER NOT NULL,
ADD COLUMN     "singleCertificatePrice" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PaymentTransaction" DROP COLUMN "pagarmeSubscriptionId";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "planDefault" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "BlockchainCredits";

-- DropTable
DROP TABLE "BlockchainTransactions";

-- DropTable
DROP TABLE "PagarmeSubscriptions";

-- DropTable
DROP TABLE "Subscriptions";

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "PagarmePlanSubscription"("subscriptionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmePlanSubscription" ADD CONSTRAINT "PagarmePlanSubscription_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PagarmeCards"("cardId") ON DELETE SET NULL ON UPDATE CASCADE;
