-- AlterEnum
ALTER TYPE "MessageType" ADD VALUE 'AUDIO';

-- AlterTable
ALTER TABLE "statuses" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '24 hours');
