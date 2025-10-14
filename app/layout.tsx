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
  keywords: ["dragon", "game", "mini", "base", "social", "farcaster"],
  authors: [{ name: "Dragman Team" }],
  creator: "Dragman",
  publisher: "Dragman",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://dragman.xyz'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Dragman Mini App",
    description: "Challenge friends in this exciting dragman game! Tap the dragon to score points and compete with friends.",
    url: 'https://dragman.xyz',
    siteName: 'Dragman',
    images: [
      {
        url: 'https://dragman.xyz/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dragman Mini App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dragman Mini App",
    description: "Challenge friends in this exciting dragman game! Tap the dragon to score points and compete with friends.",
    images: ['https://dragman.xyz/og-image.png'],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      "version": "next",
      "imageUrl": "https://dragman.xyz/preview.png",
      "button": {
        "title": "Play Dragman",
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
      <head>
        <link rel="manifest" href="/.well-known/farcaster.json" />
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Dragman" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="icon" href="/icon.png" />
      </head>
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
