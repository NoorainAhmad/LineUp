/*
  Warnings:

  - You are about to drop the column `identity` on the `otp` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `otp` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `phone` to the `otp` table without a default value. This is not possible if the table is not empty.
  - Made the column `guid` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "otp_identity_key";

-- DropIndex
DROP INDEX "users_email_key";

-- DropIndex
DROP INDEX "users_guid_phone_email_idx";

-- AlterTable
ALTER TABLE "otp" DROP COLUMN "identity",
ADD COLUMN     "phone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "location" TEXT,
ALTER COLUMN "guid" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "lastIpAddress" SET DEFAULT '0.0.0.0';

-- CreateIndex
CREATE UNIQUE INDEX "otp_phone_key" ON "otp"("phone");

-- CreateIndex
CREATE INDEX "users_guid_name_phone_idx" ON "users"("guid", "name", "phone");
