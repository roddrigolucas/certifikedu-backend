/*
  Warnings:

  - You are about to drop the column `internalSubscriptionId` on the `PagarmeSubscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Subscriptions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `PagarmeCustomers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pagarmeOrderId]` on the table `PaymentTransaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pagarmeSubscriptionId]` on the table `PaymentTransaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pagarmeSubscriptionsId]` on the table `Subscriptions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `Subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pagarmeSubscriptionsId` to the `Subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('ONGOING', 'SUCESSFUL', 'FAILED');

-- DropForeignKey
ALTER TABLE "PagarmeSubscriptions" DROP CONSTRAINT "PagarmeSubscriptions_internalSubscriptionId_fkey";

-- DropIndex
DROP INDEX "PagarmeSubscriptions_internalSubscriptionId_key";

-- AlterTable
ALTER TABLE "PagarmeSubscriptions" DROP COLUMN "internalSubscriptionId";

-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN     "finished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "pagarmeOrderId" TEXT,
ADD COLUMN     "pagarmeSubscriptionId" TEXT,
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'ONGOING';

-- AlterTable
ALTER TABLE "Subscriptions" DROP COLUMN "endTime",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "pagarmeSubscriptionsId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeCustomers_userId_key" ON "PagarmeCustomers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_pagarmeOrderId_key" ON "PaymentTransaction"("pagarmeOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_pagarmeSubscriptionId_key" ON "PaymentTransaction"("pagarmeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriptions_pagarmeSubscriptionsId_key" ON "Subscriptions"("pagarmeSubscriptionsId");

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_pagarmeOrderId_fkey" FOREIGN KEY ("pagarmeOrderId") REFERENCES "PagarmeOrders"("orderId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_pagarmeSubscriptionId_fkey" FOREIGN KEY ("pagarmeSubscriptionId") REFERENCES "PagarmeSubscriptions"("subscriptionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_pagarmeSubscriptionsId_fkey" FOREIGN KEY ("pagarmeSubscriptionsId") REFERENCES "PagarmeSubscriptions"("subscriptionId") ON DELETE RESTRICT ON UPDATE CASCADE;
