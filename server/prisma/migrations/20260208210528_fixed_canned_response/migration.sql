/*
  Warnings:

  - Added the required column `updatedAt` to the `otp` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "canned_responses_command_idx";

-- DropIndex
DROP INDEX "canned_responses_userId_key";

-- AlterTable
ALTER TABLE "otp" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "canned_responses_userId_command_idx" ON "canned_responses"("userId", "command");
