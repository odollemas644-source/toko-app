"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // gagal register gapapa, app tetep jalan normal tanpa PWA features
      });
    }
  }, []);

  return null;
}
