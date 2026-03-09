-- CreateTable
CREATE TABLE "BadgeLogos" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,

    CONSTRAINT "BadgeLogos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BadgeLogos_certificateId_key" ON "BadgeLogos"("certificateId");

-- AddForeignKey
ALTER TABLE "BadgeLogos" ADD CONSTRAINT "BadgeLogos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BadgeLogos" ADD CONSTRAINT "BadgeLogos_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE RESTRICT ON UPDATE CASCADE;
