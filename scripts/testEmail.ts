import "../lib/envBootstrap";
import { sendMail, confirmationEmail } from "../lib/mailer";

async function main() {
  const to = process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER;
  if (!to) {
    console.error("No recipient email found in .env (NOTIFICATION_EMAIL or EMAIL_USER)");
    process.exit(1);
  }

  console.log(`Sending test email to: ${to}...`);
  console.log(`Debug: EMAIL_USER starts with "${process.env.EMAIL_USER?.slice(0, 2)}"`);
  console.log(`Debug: EMAIL_PASSWORD length is ${process.env.EMAIL_PASSWORD?.length}`);

  const { subject, html } = confirmationEmail({
    email: to,
    filters: {
      make: "Tesla",
      model: "Model 3",
      yearMin: 2020,
      priceMax: 3500000, // $35k
    },
  });

  try {
    await sendMail({ to, subject, html });
    console.log("✅ Test email sent successfully!");
  } catch (error) {
    console.error("❌ Failed to send test email:");
    console.error(error);
    process.exit(1);
  }
}

main();
