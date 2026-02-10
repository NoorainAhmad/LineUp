-- CreateTable
CREATE TABLE "canned_responses" (
    "id" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "canned_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "canned_responses_command_idx" ON "canned_responses"("command");

-- CreateIndex
CREATE INDEX "otp_phone_idx" ON "otp"("phone");

-- AddForeignKey
ALTER TABLE "canned_responses" ADD CONSTRAINT "canned_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
