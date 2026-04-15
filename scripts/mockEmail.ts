import fs from "fs";
import path from "path";
import { newListingsEmail } from "../lib/mailer";

async function main() {
  const to = "mock@example.com";
  
  const mockListings = [
    {
      id: "1",
      make: "Porsche",
      model: "911 Carrera",
      year: 2022,
      price: 12500000, // $125k
      mileage: 4500,
      city: "Miami",
      state: "FL",
      imageUrl: "https://hips.hearstapps.com/hmg-prod/images/2022-porsche-911-gt3-101-1613423403.jpg",
      listingUrl: "https://facebook.com/marketplace/item/1"
    },
    {
      id: "2",
      make: "Audi",
      model: "RS6 Avant",
      year: 2021,
      price: 11000000,
      mileage: 12000,
      city: "Los Angeles",
      state: "CA",
      imageUrl: "https://cdn.motor1.com/images/mgl/mRZ06/s1/2021-audi-rs6-avant-rs-tribute-edition.jpg",
      listingUrl: "https://facebook.com/marketplace/item/2"
    }
  ];

  const { subject, html } = newListingsEmail({
    email: "user@example.com",
    listings: mockListings,
    filters: {
      make: "Luxury",
      priceMin: 5000000,
      city: "Anywhere"
    },
    totalMatching: 5
  });

  const outPath = path.join(process.cwd(), "mock_email.html");
  fs.writeFileSync(outPath, html);

  console.log("✅ Mock Email Generated!");
  console.log(`Subject: ${subject}`);
  console.log(`Saved to: ${outPath}`);
  console.log("You can open this file in your browser to see the design.");
}

main();
