/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `conversation_members` table. All the data in the column will be lost.
  - You are about to drop the column `isGroup` on the `conversations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "conversation_members" DROP COLUMN "isAdmin";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "isGroup";
