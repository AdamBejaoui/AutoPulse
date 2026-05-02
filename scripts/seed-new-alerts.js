const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = "newpark1983@gmail.com";

  const newSubs = [
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
    {
      email,
      make: "Mazda",
      model: "CX-5",
      yearMin: 2013,
      trim: "Grand Touring",
      color: "white,gold,silver",
      keywords: ["!red"],
      requiredFeatures: ["sunroof", "keyless"],
    },
    {
      email,
      make: "Hyundai",
      model: "Tucson",
      yearMin: 2011,
      trim: "Limited",
      requiredFeatures: ["keyless", "sunroof", "leather"],
    },
    {
      email,
      make: "Hyundai",
      model: "Santa Fe",
      trim: "EX,SX",
    },
    {
      email,
      make: "Hyundai",
      model: "Elantra",
      yearMin: 2014,
      trim: "Limited,Fully Loaded",
      requiredFeatures: ["keyless"],
    },
    {
      email,
      make: "Kia",
      model: "Sportage",
      yearMin: 2011,
      trim: "EX,SX",
      requiredFeatures: ["keyless"],
    },
    {
      email,
      make: "Kia",
      model: "Sorento",
      yearMin: 2011,
      trim: "SX,EX",
    },
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
