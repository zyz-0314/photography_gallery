import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "R1YADJAME — Photographer",
  description:
    "One photographic archive. Main, collections and map — three ways to explore the work of r1yadJame, a photographer based in Hangzhou, China.",
  keywords: ["photography", "r1yadJame", "portfolio", "documentary", "travel"],
  openGraph: {
    title: "R1YADJAME",
    description: "I photograph the world as I see it.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable}`}>
      <body className="min-h-screen bg-ink text-paper">{children}</body>
    </html>
  );
}
