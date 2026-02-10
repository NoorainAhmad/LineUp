-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "guid" TEXT NOT NULL,
    "phone" TEXT,
    "name" TEXT,
    "email" TEXT,
    "avatarUrl" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_guid_key" ON "users"("guid");
