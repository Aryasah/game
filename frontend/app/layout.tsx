import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { GameProvider } from "@/context/GameContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bluff — Multiplayer Card Game",
  description:
    "A real-time 2-to-4 player Bluff card game. Play face-down cards, call bluffs, and be the first to empty your hand!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <GameProvider>
          <main>{children}</main>
        </GameProvider>
      </body>
    </html>
  );
}
