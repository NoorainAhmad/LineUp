/*
  Warnings:

  - The `lastMessageId` column on the `chats` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `replyToId` column on the `messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `forwardedFromId` column on the `messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `messageId` on the `message_media` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_lastMessageId_fkey";

-- DropForeignKey
ALTER TABLE "message_media" DROP CONSTRAINT "message_media_messageId_fkey";

-- DropIndex
DROP INDEX "messages_chatId_createdAt_idx";

-- AlterTable
ALTER TABLE "chat_members" ADD COLUMN     "lastDeliveredSeq" BIGINT,
ADD COLUMN     "lastReadSeq" BIGINT;

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "lastMessageId",
ADD COLUMN     "lastMessageId" BIGINT;

-- AlterTable
ALTER TABLE "message_media" DROP COLUMN "messageId",
ADD COLUMN     "messageId" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "messages" DROP CONSTRAINT "messages_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "replyToId",
ADD COLUMN     "replyToId" BIGINT,
DROP COLUMN "forwardedFromId",
ADD COLUMN     "forwardedFromId" BIGINT,
ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "statuses" ALTER COLUMN "expiresAt" SET DEFAULT (NOW() + interval '24 hours');

-- CreateIndex
CREATE INDEX "chat_members_chatId_lastDeliveredSeq_idx" ON "chat_members"("chatId", "lastDeliveredSeq");

-- CreateIndex
CREATE INDEX "chat_members_chatId_lastReadSeq_idx" ON "chat_members"("chatId", "lastReadSeq");

-- CreateIndex
CREATE UNIQUE INDEX "chats_lastMessageId_key" ON "chats"("lastMessageId");

-- CreateIndex
CREATE INDEX "message_media_messageId_order_idx" ON "message_media"("messageId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "message_media_messageId_mediaId_key" ON "message_media"("messageId", "mediaId");

-- CreateIndex
CREATE INDEX "messages_chatId_id_idx" ON "messages"("chatId", "id");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_lastDeliveredSeq_fkey" FOREIGN KEY ("lastDeliveredSeq") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_members" ADD CONSTRAINT "chat_members_lastReadSeq_fkey" FOREIGN KEY ("lastReadSeq") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_media" ADD CONSTRAINT "message_media_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
