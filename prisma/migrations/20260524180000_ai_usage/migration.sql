-- Add aiUsed + default cvLimit
ALTER TABLE "User" ADD COLUMN "aiUsed" INTEGER NOT NULL DEFAULT 0;
