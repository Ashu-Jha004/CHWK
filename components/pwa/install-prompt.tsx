"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { Card } from "@/components/ui/card";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered: ", registration);
          })
          .catch((registrationError) => {
            console.log("SW registration failed: ", registrationError);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  useEffect(() => {
    // Check if it's iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Checks if already in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      return; // Business as usual, no prompt needed
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show prompt for iOS users if not in standalone (optional handling)
    if (isIOSDevice && !isStandalone) {
         // Logic to potentially show a custom 'Add to Home Screen' instruction for iOS
         // setShowPrompt(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <Card className="p-4 shadow-xl border-primary/20 bg-background/95 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Install CHWK App</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Install the CHWK app for a better experience, faster access, and offline features.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleInstallClick} size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Install Now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPrompt(false)}
              >
                Not Now
              </Button>
            </div>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </Card>
    </div>
  );
}
