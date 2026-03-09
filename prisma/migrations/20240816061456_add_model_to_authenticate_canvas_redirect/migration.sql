-- CreateTable
CREATE TABLE "CanvasEphemeralLogin" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "state" TEXT NOT NULL,
    "canvasUserId" INTEGER,
    "canvasUserEmail" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT,
    "schoolId" TEXT,
    "courseId" TEXT,

    CONSTRAINT "CanvasEphemeralLogin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CanvasEphemeralLogin_state_key" ON "CanvasEphemeralLogin"("state");
