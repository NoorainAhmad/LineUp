-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "status" "MediaStatus" NOT NULL DEFAULT 'PENDING',
    "fileSize" INTEGER,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_fileKey_key" ON "media"("fileKey");

-- CreateIndex
CREATE INDEX "media_fileKey_idx" ON "media"("fileKey");

-- CreateIndex
CREATE INDEX "media_userId_idx" ON "media"("userId");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
