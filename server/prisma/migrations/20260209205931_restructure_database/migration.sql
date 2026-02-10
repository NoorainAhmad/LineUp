-- AlterTable
ALTER TABLE "canned_responses" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "statuses" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '24 hours');
