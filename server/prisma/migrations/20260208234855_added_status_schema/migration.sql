/*
  Warnings:

  - You are about to drop the column `status` on the `media` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "media" DROP COLUMN "status",
ADD COLUMN     "mediaStatus" "MediaStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "statuses" (
    "id" TEXT NOT NULL,
    "type" "StatusType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "color" TEXT,
    "mediaId" TEXT,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '24 hours',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_views" (
    "id" TEXT NOT NULL,
    "statusId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "statuses_mediaId_key" ON "statuses"("mediaId");

-- CreateIndex
CREATE INDEX "statuses_userId_idx" ON "statuses"("userId");

-- CreateIndex
CREATE INDEX "statuses_expiresAt_idx" ON "statuses"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "status_views_statusId_userId_key" ON "status_views"("statusId", "userId");

-- AddForeignKey
ALTER TABLE "statuses" ADD CONSTRAINT "statuses_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statuses" ADD CONSTRAINT "statuses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_views" ADD CONSTRAINT "status_views_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "statuses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_views" ADD CONSTRAINT "status_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
