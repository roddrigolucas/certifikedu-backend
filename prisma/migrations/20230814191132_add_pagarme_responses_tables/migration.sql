-- CreateTable
CREATE TABLE "PagarmeCustomers" (
    "customerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerCreatedAt" TIMESTAMP(3) NOT NULL,
    "customerUpdatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT,
    "document" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "deliquent" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "inactiveDate" TIMESTAMP(3),
    "userId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PagarmeCards" (
    "cardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cardCreatedAt" TIMESTAMP(3) NOT NULL,
    "cardUpdatedAt" TIMESTAMP(3) NOT NULL,
    "first_six_digits" TEXT NOT NULL,
    "last_four_digits" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "holder_name" TEXT NOT NULL,
    "holder_document" TEXT NOT NULL,
    "exp_month" INTEGER NOT NULL,
    "exp_year" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "code" TEXT,
    "customerId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PagarmeOrders" (
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderCreatedAt" TIMESTAMP(3) NOT NULL,
    "orderUpdatedAt" TIMESTAMP(3) NOT NULL,
    "orderClosedAt" TIMESTAMP(3),
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "closed" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "itemsIds" TEXT[],
    "chargesIds" TEXT[],
    "customerId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PagarmeSubscriptions" (
    "subscriptionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionCreatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionUpdatedAt" TIMESTAMP(3) NOT NULL,
    "subscriptionClosedAt" TIMESTAMP(3),
    "paymentMethod" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "interval_count" INTEGER NOT NULL,
    "minimum_price" INTEGER NOT NULL,
    "billing_type" TEXT NOT NULL,
    "cycleStart" TIMESTAMP(3) NOT NULL,
    "cycleEnd" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,
    "installments" INTEGER NOT NULL,
    "ItemsIds" TEXT[],
    "status" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "creditCardId" TEXT NOT NULL,
    "internalSubscriptionId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeCustomers_customerId_key" ON "PagarmeCustomers"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeCards_cardId_key" ON "PagarmeCards"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeOrders_orderId_key" ON "PagarmeOrders"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeSubscriptions_subscriptionId_key" ON "PagarmeSubscriptions"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "PagarmeSubscriptions_internalSubscriptionId_key" ON "PagarmeSubscriptions"("internalSubscriptionId");

-- AddForeignKey
ALTER TABLE "PagarmeCustomers" ADD CONSTRAINT "PagarmeCustomers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeCards" ADD CONSTRAINT "PagarmeCards_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "PagarmeCustomers"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeOrders" ADD CONSTRAINT "PagarmeOrders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "PagarmeCustomers"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeOrders" ADD CONSTRAINT "PagarmeOrders_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "PagarmeCards"("cardId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeSubscriptions" ADD CONSTRAINT "PagarmeSubscriptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "PagarmeCustomers"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeSubscriptions" ADD CONSTRAINT "PagarmeSubscriptions_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "PagarmeCards"("cardId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeSubscriptions" ADD CONSTRAINT "PagarmeSubscriptions_internalSubscriptionId_fkey" FOREIGN KEY ("internalSubscriptionId") REFERENCES "Subscriptions"("subscriptionId") ON DELETE RESTRICT ON UPDATE CASCADE;
