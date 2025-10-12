import Providers from "./providers";

export const metadata = {
  title: "Dragman",
  description: "The Dragman Base Mini App built on Farcaster",
  other: {
    "fc:miniapp": JSON.stringify({
      version: "next",
      imageUrl: "https://dragman.xyz/embed.png",
      button: {
        title: "Open Dragman",
        action: {
          type: "launch_miniapp",
          name: "Dragman",
          url: "https://dragman.xyz"
        }
      }
    })
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
