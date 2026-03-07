-- AlterEnum
ALTER TYPE "MessageType" ADD VALUE 'STICKER';

-- AlterTable
ALTER TABLE "statuses" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '24 hours');
