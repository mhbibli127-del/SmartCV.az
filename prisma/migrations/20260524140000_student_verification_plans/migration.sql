-- AlterTable: student verification + plan system
ALTER TABLE "User" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN "cvUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "cvLimit" INTEGER;
ALTER TABLE "User" ADD COLUMN "studentVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "studentId" TEXT;
ALTER TABLE "User" ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "User" ADD COLUMN "studentEmailDomain" TEXT;
