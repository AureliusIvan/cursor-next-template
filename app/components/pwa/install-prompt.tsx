"use client";

import { useEffect, useState } from "react";
import { debug } from "@/lib/debug";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
      debug({ component: "InstallPrompt" }, "Install prompt available");
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    debug({ component: "InstallPrompt" }, `User ${outcome} the install prompt`);

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-white p-4 shadow-lg border border-gray-200 md:left-auto md:right-4 md:max-w-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Install App</h3>
          <p className="mt-1 text-sm text-gray-600">
            Install this app on your device for a better experience.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
