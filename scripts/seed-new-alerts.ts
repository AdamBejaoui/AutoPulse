import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = "newpark1983@gmail.com"; // using the main email for alerts

  const newSubs = [
    // 1. Mazda (CX-5) 2013+ Touring, normal mileage
    {
      email,
      make: "Mazda",
      model: "CX-5",
      yearMin: 2013,
      trim: "Touring",
      mileageMax: 149999,
      color: "white,gold,silver",
      keywords: ["!red"],
    },
    // 1. Mazda (CX-5) 2013+ Touring, high mileage (150k+), price 1500-2005
    {
      email,
      make: "Mazda",
      model: "CX-5",
      yearMin: 2013,
      trim: "Touring",
      mileageMin: 150000,
      priceMin: 1500,
      priceMax: 2005,
      color: "white,gold,silver",
      keywords: ["!red"],
    },
    // 1. Mazda (CX-5) 2013+ Grand Touring, sunroof + keyless entry, colors, no red
    {
      email,
      make: "Mazda",
      model: "CX-5",
      yearMin: 2013,
      trim: "Grand Touring",
      color: "white,gold,silver",
      keywords: ["!red"],
      requiredFeatures: ["sunroof", "keyless entry"],
    },
    // 2. Hyundai Tucson 2011+ Limited, keyless entry, sunroof, leather
    {
      email,
      make: "Hyundai",
      model: "Tucson",
      yearMin: 2011,
      trim: "Limited",
      requiredFeatures: ["keyless entry", "sunroof", "leather"],
    },
    // 2. Hyundai Santa Fe EX or SX
    {
      email,
      make: "Hyundai",
      model: "Santa Fe",
      trim: "EX,SX", // comma separated
    },
    // 2. Hyundai Elantra 2014+ Limited or Fully Loaded, must have keyless entry
    {
      email,
      make: "Hyundai",
      model: "Elantra",
      yearMin: 2014,
      trim: "Limited,Fully Loaded",
      requiredFeatures: ["keyless entry"],
    },
    // 3. Kia Sportage 2011+ EX or SX, full options, keyless entry
    {
      email,
      make: "Kia",
      model: "Sportage",
      yearMin: 2011,
      trim: "EX,SX",
      requiredFeatures: ["keyless entry"],
    },
    // 3. Kia Sorento 2011+ SX or EX
    {
      email,
      make: "Kia",
      model: "Sorento",
      yearMin: 2011,
      trim: "SX,EX",
    },
    // 3. Kia Forte 2019+
    {
      email,
      make: "Kia",
      model: "Forte",
      yearMin: 2019,
    }
  ];

  for (const sub of newSubs) {
    await prisma.subscription.create({
      data: sub
    });
  }

  console.log("Successfully added new subscriptions");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
