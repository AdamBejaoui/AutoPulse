import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SearchFiltersProvider } from "@/components/SearchFiltersContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SaveSearchModal } from "@/components/SaveSearchModal";
import { Toaster } from "@/components/ui/toaster";
import { ComparisonProvider } from "@/context/ComparisonContext";
import { ComparisonDock } from "@/components/ComparisonDock";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-outfit" }); // Keep var name for compatibility or rename (we'll keep it so we don't break existing tailwind config variables unexpectedly, wait we will rename in tailwind config)

export const metadata: Metadata = {
  title: "AutoPulse — Nationwide Facebook Marketplace Search",
  description:
    "Unified search and automated alerts for Facebook Marketplace car listings across the entire USA.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased bg-mesh">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SearchFiltersProvider>
            <ComparisonProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <SaveSearchModal />
              <ComparisonDock />
              <Toaster />
            </ComparisonProvider>
          </SearchFiltersProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
