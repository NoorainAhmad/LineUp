/*
  Warnings:

  - You are about to drop the `System` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "statuses" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '24 hours');

-- DropTable
DROP TABLE "System";

-- CreateTable
CREATE TABLE "system" (
    "id" TEXT NOT NULL,
    "activeBranchId" TEXT,
    "workspaceName" TEXT,
    "systemVersion" TEXT,
    "systemEmail" TEXT,
    "systemPhone" TEXT,
    "systemTimezone" TEXT,
    "systemLanguage" TEXT,
    "systemMaintenance" BOOLEAN,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "system" ADD CONSTRAINT "system_activeBranchId_fkey" FOREIGN KEY ("activeBranchId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
