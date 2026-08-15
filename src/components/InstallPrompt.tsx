"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "toko-install-dismissed-until";

function isDismissed() {
  if (typeof window === "undefined") return true;
  const until = localStorage.getItem(DISMISS_KEY);
  return until ? Date.now() < Number(until) : false;
}

function dismissFor7Days() {
  localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<"android" | "ios" | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone || isDismissed()) return;

    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);

    if (isIOS) {
      setPlatform("ios");
      setVisible(true);
      return;
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android");
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }

  function handleDismiss() {
    dismissFor7Days();
    setVisible(false);
  }

  if (!visible || !platform) return null;

  return (
    <div className="fixed bottom-16 left-3 right-3 z-40 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-xs">
      <div
        className="rounded-2xl bg-white border shadow-lg p-3 flex items-start gap-3"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--primary)" }}
        >
          {platform === "ios" ? (
            <Share className="w-5 h-5 text-white" />
          ) : (
            <Download className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-0.5">Install Grosir Abadi</p>
          {platform === "ios" ? (
            <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
              Tap tombol Share di Safari, lalu pilih &quot;Add to Home Screen&quot;.
            </p>
          ) : (
            <p className="text-xs mb-2" style={{ color: "var(--ink-muted)" }}>
              Biar belanja lebih cepat, akses langsung dari layar HP.
            </p>
          )}
          {platform === "android" && (
            <button
              onClick={handleInstallClick}
              className="text-xs font-semibold px-3 py-1.5 rounded-full text-white"
              style={{ background: "var(--accent-dark)" }}
            >
              Install Sekarang
            </button>
          )}
        </div>
        <button onClick={handleDismiss} className="shrink-0 text-neutral-400" aria-label="Tutup">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}