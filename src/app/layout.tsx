import type { Metadata } from "next";
import { Fraunces, Zilla_Slab, Libre_Franklin, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["900"], variable: "--font-fraunces" });
const zillaSlab = Zilla_Slab({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-zilla" });
const libreFranklin = Libre_Franklin({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-franklin" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "The Daily Reporter — California Construction Bidding Leads",
  description: "Connecting California contractors to construction bidding leads since 1994.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${zillaSlab.variable} ${libreFranklin.variable} ${ibmPlexMono.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
