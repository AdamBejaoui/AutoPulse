/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Listing` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Listing_make_model_year_price_idx";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "imageUrl",
ADD COLUMN     "accidents" BOOLEAN,
ADD COLUMN     "bodyStyle" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "doors" INTEGER,
ADD COLUMN     "driveType" TEXT,
ADD COLUMN     "engine" TEXT,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "fuelType" TEXT,
ADD COLUMN     "imageUrls" TEXT[],
ADD COLUMN     "owners" INTEGER,
ADD COLUMN     "parseScore" INTEGER,
ADD COLUMN     "parsedAt" TIMESTAMP(3),
ADD COLUMN     "rawDescription" TEXT,
ADD COLUMN     "rawTitle" TEXT,
ADD COLUMN     "titleStatus" TEXT,
ADD COLUMN     "transmission" TEXT,
ADD COLUMN     "trim" TEXT,
ADD COLUMN     "vin" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "bodyStyle" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "driveType" TEXT,
ADD COLUMN     "fuelType" TEXT,
ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "maxOwners" INTEGER,
ADD COLUMN     "noAccidents" BOOLEAN,
ADD COLUMN     "requiredFeatures" TEXT[],
ADD COLUMN     "titleStatus" TEXT,
ADD COLUMN     "transmission" TEXT,
ADD COLUMN     "trim" TEXT;

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScraperSession" (
    "id" TEXT NOT NULL DEFAULT 'facebook-default',
    "cookies" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScraperSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationLog_subscriptionId_idx" ON "NotificationLog"("subscriptionId");

-- CreateIndex
CREATE INDEX "NotificationLog_listingId_idx" ON "NotificationLog"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationLog_subscriptionId_listingId_key" ON "NotificationLog"("subscriptionId", "listingId");

-- CreateIndex
CREATE INDEX "Listing_postedAt_idx" ON "Listing"("postedAt");

-- CreateIndex
CREATE INDEX "Listing_make_idx" ON "Listing"("make");

-- CreateIndex
CREATE INDEX "Listing_model_idx" ON "Listing"("model");

-- CreateIndex
CREATE INDEX "Listing_price_idx" ON "Listing"("price");

-- CreateIndex
CREATE INDEX "Listing_year_idx" ON "Listing"("year");

-- CreateIndex
CREATE INDEX "Listing_trim_idx" ON "Listing"("trim");

-- CreateIndex
CREATE INDEX "Listing_bodyStyle_idx" ON "Listing"("bodyStyle");

-- CreateIndex
CREATE INDEX "Listing_transmission_idx" ON "Listing"("transmission");

-- CreateIndex
CREATE INDEX "Listing_titleStatus_idx" ON "Listing"("titleStatus");

-- CreateIndex
CREATE INDEX "Listing_color_idx" ON "Listing"("color");

-- CreateIndex
CREATE INDEX "Listing_driveType_idx" ON "Listing"("driveType");
