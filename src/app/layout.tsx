import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CoinVault - Premium Coins & Collectibles",
  description: "Your trusted source for rare coins, bullion, and collectibles. Shop certified coins, participate in auctions, and sell with our AI-powered consignment program.",
  keywords: ["coins", "collectibles", "bullion", "gold", "silver", "numismatic", "PCGS", "NGC", "auction"],
  authors: [{ name: "CoinVault" }],
  openGraph: {
    title: "CoinVault - Premium Coins & Collectibles",
    description: "Your trusted source for rare coins, bullion, and collectibles.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoinVault - Premium Coins & Collectibles",
    description: "Your trusted source for rare coins, bullion, and collectibles.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
