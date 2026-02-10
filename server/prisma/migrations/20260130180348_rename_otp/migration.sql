/*
  Warnings:

  - You are about to drop the `Otp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Otp";

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "otps_identity_key" ON "otps"("identity");
