/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `canned_responses` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "canned_responses_userId_key" ON "canned_responses"("userId");
