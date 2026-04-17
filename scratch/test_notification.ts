/**
 * test_notification.ts
 * Standalone script to verify the email notification system.
 * It sends a real 'Match Found' email to the test address.
 */

import "../lib/envBootstrap";
import { prisma } from "../lib/prisma";
import { newListingsEmail, sendMail } from "../lib/mailer";

async function main() {
  const targetEmail = "abejaoui90@gmail.com";
  console.log(`🚀 Starting notification test for ${targetEmail}...`);

  // 1. Fetch a real BMW M3 listing from the database
  const listing = await prisma.listing.findFirst({
    where: { make: "BMW", model: "M3" }
  });

  if (!listing) {
    console.error("❌ No BMW M3 listing found in DB to test with.");
    return;
  }

  console.log(`📍 Using listing ID: ${listing.id} (${listing.year} ${listing.make} ${listing.model})`);

  // 2. Format the email
  const { subject, html } = newListingsEmail({
    email: targetEmail,
    listings: [
      {
        id: listing.id,
        make: listing.make,
        model: listing.model,
        year: listing.year || 2024,
        price: listing.price,
        mileage: listing.mileage,
        city: listing.city,
        state: listing.state,
        imageUrl: listing.imageUrl,
        listingUrl: listing.listingUrl,
      },
    ],
    filters: {
      make: "BMW",
      model: "M3",
    },
    totalMatching: 1,
  });

  // 3. Send the email
  try {
    console.log("📨 Sending email via SMTP...");
    await sendMail({ to: targetEmail, subject, html });
    console.log("✅ SUCCESS: Test email sent!");
    console.log(`📬 Please check the inbox of ${targetEmail}.`);
  } catch (err) {
    console.error("❌ FAILED to send email:", err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
