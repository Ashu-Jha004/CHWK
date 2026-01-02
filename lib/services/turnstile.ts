// lib/services/turnstile.ts

/**
 * Cloudflare Turnstile Server-Side Verification
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

interface TurnstileResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
}

/**
 * Verifies Cloudflare Turnstile token on server
 * @param token - Token from client-side widget
 * @param remoteIp - Optional IP address of the user
 * @returns Promise with verification result
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error("[Turnstile] Secret key not configured");
      return {
        success: false,
        error: "CAPTCHA verification is not configured",
      };
    }

    // Cloudflare Turnstile verification endpoint
    const verifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      console.error("[Turnstile] API returned non-OK status:", response.status);
      return {
        success: false,
        error: "CAPTCHA verification service unavailable",
      };
    }

    const data: TurnstileResponse = await response.json();

    if (!data.success) {
      const errorCodes = data["error-codes"]?.join(", ") || "Unknown error";
      console.error("[Turnstile] Verification failed:", errorCodes);

      // Return user-friendly error messages
      if (errorCodes.includes("timeout-or-duplicate")) {
        return {
          success: false,
          error: "CAPTCHA token expired. Please try again.",
        };
      }

      return {
        success: false,
        error: "CAPTCHA verification failed. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[Turnstile] Verification error:", error);
    return {
      success: false,
      error: "CAPTCHA verification failed. Please try again.",
    };
  }
}
