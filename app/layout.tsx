import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from '../providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dragman Mini App",
  description: "Challenge friends in this exciting dragman game! Tap the dragon to score points and compete with friends.",
  other: {
    'fc:miniapp': JSON.stringify({
      "version": "next",
      "imageUrl": "https://dragman.xyz/preview.png",
      "button": {
        "title": "Play Now",
        "action": {
          "type": "launch_miniapp",
          "name": "Dragman Mini App",
          "url": "https://dragman.xyz"
        }
      }
    })
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
