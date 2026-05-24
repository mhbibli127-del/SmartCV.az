-- AlterTable
ALTER TABLE "User" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN "stripePriceLookupKey" TEXT;
ALTER TABLE "User" ADD COLUMN "subscriptionPlan" TEXT DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN "subscriptionCurrentPeriodEnd" DATETIME;
