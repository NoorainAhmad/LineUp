/*
  Warnings:

  - You are about to drop the column `duration` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `fileSize` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `mimeType` on the `messages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "messages" DROP COLUMN "duration",
DROP COLUMN "fileName",
DROP COLUMN "fileSize",
DROP COLUMN "fileUrl",
DROP COLUMN "mimeType";

-- AlterTable
ALTER TABLE "statuses" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '24 hours');

-- CreateTable
CREATE TABLE "message_media" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "message_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_media_mediaId_idx" ON "message_media"("mediaId");

-- CreateIndex
CREATE INDEX "message_media_messageId_order_idx" ON "message_media"("messageId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "message_media_messageId_mediaId_key" ON "message_media"("messageId", "mediaId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- AddForeignKey
ALTER TABLE "message_media" ADD CONSTRAINT "message_media_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_media" ADD CONSTRAINT "message_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
