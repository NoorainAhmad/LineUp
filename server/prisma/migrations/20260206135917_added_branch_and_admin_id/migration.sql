-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'DEVELOPER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "branchId" TEXT;
