/*
  Warnings:

  - You are about to drop the column `ItemsIds` on the `PagarmeSubscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `billing_type` on the `PagarmeSubscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `interval_count` on the `PagarmeSubscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `minimum_price` on the `PagarmeSubscriptions` table. All the data in the column will be lost.
  - Added the required column `billingType` to the `PagarmeSubscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intervalCount` to the `PagarmeSubscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minimumPrice` to the `PagarmeSubscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PagarmeSubscriptions" DROP COLUMN "ItemsIds",
DROP COLUMN "billing_type",
DROP COLUMN "interval_count",
DROP COLUMN "minimum_price",
ADD COLUMN     "billingType" TEXT NOT NULL,
ADD COLUMN     "intervalCount" INTEGER NOT NULL,
ADD COLUMN     "itemsIds" TEXT[],
ADD COLUMN     "minimumPrice" INTEGER NOT NULL;
