/*
  Warnings:

  - You are about to drop the column `lastIpAddress` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `lastSeen` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserPermission" AS ENUM ('READ', 'CREATE', 'UPDATE', 'DELETE');

-- DropForeignKey
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_userId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "lastIpAddress",
ADD COLUMN     "ipAddress" TEXT NOT NULL DEFAULT '0.0.0.0',
ADD COLUMN     "permission" "UserPermission"[] DEFAULT ARRAY['READ']::"UserPermission"[],
ALTER COLUMN "lastSeen" SET NOT NULL,
ALTER COLUMN "location" DROP DEFAULT;

-- DropTable
DROP TABLE "permissions";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
