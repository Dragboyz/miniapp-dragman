import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dragman.xyz",
  description: "Welcome to Dragman.xyz",
  other: {
    'fc:miniapp': JSON.stringify({
      "version": "next",
      "imageUrl": "https://dragman.xyz/embed-image.png",
      "button": {
        "title": "Play Now",
        "action": {
          "type": "launch_miniapp",
          "name": "Dragman.xyz",
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
        {children}
      </body>
    </html>
  );
}
