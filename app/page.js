"use client"; // required for hooks in App Router

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function Page() {
  useEffect(() => {
    // Tell Warpcast/Base the app is ready → hides splash screen
    sdk.actions.ready();
  }, []);

  return (
    <main style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#000",
      color: "#fff"
    }}>
      <h1>Hello from Dragman 🚀</h1>
    </main>
  );
}
