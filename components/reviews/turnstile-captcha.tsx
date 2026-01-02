// components/reviews/turnstile-captcha.tsx

"use client";

import { useRef, useCallback } from "react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
}

import { useState } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Cloudflare Turnstile CAPTCHA Component
 * Docs: https://developers.cloudflare.com/turnstile/
 */
export function TurnstileCaptcha({
  onVerify,
  onError,
  onExpire,
  className = "",
}: TurnstileCaptchaProps) {
  const turnstileRef = useRef<TurnstileInstance>(null);

  // ============================================
  // CALLBACKS
  // ============================================

  const [status, setStatus] = useState<"idle" | "verifying" | "error" | "expired" | "success">("idle");

  const handleVerify = useCallback(
    (token: string) => {
      console.log("[Turnstile] Verification successful");
      setStatus("success");
      onVerify(token);
    },
    [onVerify]
  );

  const handleError = useCallback(() => {
    console.error(
      "[Turnstile] Verification error - Check if your site key is valid and allowed for this domain.\nFor development, you can use the Testing Key: 1x00000000000000000000AA"
    );
    setStatus("error");
    onError?.();
  }, [onError]);

  const handleExpire = useCallback(() => {
    console.warn("[Turnstile] Token expired");
    setStatus("expired");
    onExpire?.();
  }, [onExpire]);

  const handleRetry = useCallback(() => {
    setStatus("idle");
    turnstileRef.current?.reset();
  }, []);

  // ============================================
  // GET SITE KEY FROM ENV
  // ============================================
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    console.error("[Turnstile] Site key not configured");
    return (
      <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg text-sm text-destructive">
        <p className="font-semibold">CAPTCHA Configuration Error</p>
        <p className="text-xs mt-1">
          Cloudflare Turnstile site key is missing. Please check your environment variables.
        </p>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative min-h-[65px] flex items-center justify-center bg-muted/30 rounded-lg p-2 border border-border/50">
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={handleVerify}
          onError={handleError}
          onExpire={handleExpire}
          onBeforeInteractive={() => setStatus("verifying")}
          options={{
            theme: "light",
            size: "normal",
          }}
        />

        {status === "error" && (
          <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-4 text-center space-y-2 rounded-lg z-10">
            <div className="flex items-center gap-2 text-destructive font-medium">
              <AlertCircle className="h-4 w-4" />
              <span>Verification Failed</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="gap-2 h-8"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        )}

        {status === "expired" && (
          <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center p-4 text-center space-y-2 rounded-lg z-10">
            <p className="text-sm text-muted-foreground font-medium">Verification Expired</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="gap-2 h-8"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        )}
      </div>

      {status === "idle" && (
        <p className="text-[10px] text-center text-muted-foreground">
          Secure verification by Cloudflare
        </p>
      )}
    </div>
  );
}

/**
 * Reset function for external use
 * Usage: Pass a ref to get access to reset functionality
 */
export function useTurnstileReset() {
  const turnstileRef = useRef<TurnstileInstance>(null);

  const reset = useCallback(() => {
    turnstileRef.current?.reset();
  }, []);

  return { turnstileRef, reset };
}
