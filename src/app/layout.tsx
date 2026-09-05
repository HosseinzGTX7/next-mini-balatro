import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini-Balatro | Poker Roguelike Deckbuilder",
  description:
    "A high-polish, responsive Poker-Roguelike web game built with Next.js App Router, TypeScript, Zustand, shadcn/ui, and Framer Motion.",
  keywords: ["balatro", "poker", "roguelike", "deckbuilder", "game", "nextjs"],
};

export const viewport: Viewport = {
  themeColor: "#0b0f14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0b0f14] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
