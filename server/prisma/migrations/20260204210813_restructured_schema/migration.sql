/*
  Warnings:

  - You are about to drop the `conversation_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `emoji_reactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "conversation_members" DROP CONSTRAINT "conversation_members_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "conversation_members" DROP CONSTRAINT "conversation_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_lastMessageId_fkey";

-- DropForeignKey
ALTER TABLE "emoji_reactions" DROP CONSTRAINT "emoji_reactions_messageId_fkey";

-- DropForeignKey
ALTER TABLE "emoji_reactions" DROP CONSTRAINT "emoji_reactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_replyToId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_senderId_fkey";

-- DropTable
DROP TABLE "conversation_members";

-- DropTable
DROP TABLE "conversations";

-- DropTable
DROP TABLE "emoji_reactions";

-- DropTable
DROP TABLE "messages";

-- DropEnum
DROP TYPE "MessageStatus";

-- DropEnum
DROP TYPE "MessageType";
