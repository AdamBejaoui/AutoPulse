-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'facebook',
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "mileage" INTEGER,
    "city" TEXT,
    "state" TEXT,
    "imageUrl" TEXT,
    "listingUrl" TEXT NOT NULL,
    "description" TEXT,
    "sellerName" TEXT,
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "yearMin" INTEGER,
    "yearMax" INTEGER,
    "priceMin" INTEGER,
    "priceMax" INTEGER,
    "mileageMax" INTEGER,
    "city" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Listing_externalId_key" ON "Listing"("externalId");

-- CreateIndex
CREATE INDEX "Listing_make_model_year_price_idx" ON "Listing"("make", "model", "year", "price");

-- CreateIndex
CREATE INDEX "Listing_city_state_idx" ON "Listing"("city", "state");

-- CreateIndex
CREATE INDEX "Listing_createdAt_idx" ON "Listing"("createdAt");

-- CreateIndex
CREATE INDEX "Subscription_email_idx" ON "Subscription"("email");
