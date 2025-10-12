"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function providers({ children }) {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return children;
}
