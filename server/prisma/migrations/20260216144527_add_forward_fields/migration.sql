-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "forwardedFromId" TEXT,
ADD COLUMN     "originalSenderId" TEXT;

-- AlterTable
ALTER TABLE "statuses" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '24 hours');
