/*
  Warnings:

  - You are about to drop the column `adminId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `branchId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `masterId` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "adminId",
DROP COLUMN "branchId",
DROP COLUMN "masterId",
ADD COLUMN     "parentId" TEXT;
