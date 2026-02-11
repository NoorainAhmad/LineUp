-- AlterTable
ALTER TABLE "statuses" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '24 hours');

-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL,
    "activeBranch" TEXT NOT NULL,
    "workspaceName" TEXT NOT NULL,
    "systemEmail" TEXT NOT NULL,
    "systemLanguage" TEXT NOT NULL,
    "systemMaintenance" BOOLEAN NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "System_pkey" PRIMARY KEY ("id")
);
