-- DropIndex
DROP INDEX "conversations_name_isGroup_key";

-- DropIndex
DROP INDEX "conversations_updatedAt_idx";

-- DropIndex
DROP INDEX "messages_conversationId_createdAt_idx";

-- DropIndex
DROP INDEX "messages_senderId_conversationId_createdAt_key";

-- DropIndex
DROP INDEX "users_email_phone_idx";

-- DropIndex
DROP INDEX "users_guid_phone_key";

-- CreateIndex
CREATE INDEX "conversations_updatedAt_idx" ON "conversations"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "users_guid_phone_email_idx" ON "users"("guid", "phone", "email");
