-- AlterTable: admin role + Paddle subscription fields
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';
ALTER TABLE "User" ADD COLUMN "paddleSubscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN "paddleCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "paddleSubscriptionStatus" TEXT DEFAULT 'inactive';
