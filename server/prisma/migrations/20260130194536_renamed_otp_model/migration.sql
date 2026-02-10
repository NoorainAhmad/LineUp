/*
  Warnings:

  - You are about to drop the `otps` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "otps";

-- CreateTable
CREATE TABLE "otp" (
    "id" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "otp_identity_key" ON "otp"("identity");
