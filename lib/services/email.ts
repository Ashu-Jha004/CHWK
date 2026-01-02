// lib/services/email.ts

import { Resend } from "resend";

// ============================================
// INITIALIZE RESEND
// ============================================
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("[Email Service] Resend API key not configured");
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

// ============================================
// EMAIL TYPES
// ============================================
export interface NewReviewEmailData {
  businessOwnerName: string;
  businessOwnerEmail: string;
  businessName: string;
  businessId: string;
  reviewerName: string;
  rating: number;
  reviewTitle?: string;
  reviewContent?: string;
  reviewId: string;
  createdAt: Date;
}

// ============================================
// SEND NEW REVIEW NOTIFICATION
// ============================================
export async function sendNewReviewNotification(
  data: NewReviewEmailData
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  if (!resend) {
    console.error("[Email Service] Resend not initialized");
    return {
      success: false,
      error: "Email service not configured",
    };
  }

  try {
    const { data: result, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // Change to your verified domain
      to: [data.businessOwnerEmail],
      subject: `New ${data.rating}-star review for ${data.businessName}`,
      html: generateNewReviewEmailHTML(data),
      text: generateNewReviewEmailText(data),
    });

    if (error) {
      console.error("[Email Service] Failed to send email:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    console.log("[Email Service] Email sent successfully:", result?.id);
    return {
      success: true,
      messageId: result?.id,
    };
  } catch (error) {
    console.error("[Email Service] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================
// HTML EMAIL TEMPLATE
// ============================================
function generateNewReviewEmailHTML(data: NewReviewEmailData): string {
  const stars = "⭐".repeat(data.rating);
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://chwk.app"}/dashboard/reviews`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Review Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #FF6B35 0%, #F7B801 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                🎉 New Review Received!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; color: #1a1a1a; font-size: 16px;">
                Hi ${data.businessOwnerName},
              </p>

              <p style="margin: 0 0 24px; color: #4a4a4a; font-size: 15px; line-height: 1.6;">
                You've received a new review for <strong>${data.businessName}</strong>!
              </p>

              <!-- Rating -->
              <div style="background-color: #f9fafb; border-left: 4px solid #FF6B35; padding: 20px; margin-bottom: 24px; border-radius: 4px;">
                <div style="font-size: 28px; margin-bottom: 8px;">
                  ${stars}
                </div>
                <p style="margin: 0; color: #4a4a4a; font-size: 14px;">
                  <strong>${data.reviewerName}</strong> rated your business ${data.rating} out of 5 stars
                </p>
              </div>

              ${
                data.reviewTitle
                  ? `
              <!-- Review Title -->
              <div style="margin-bottom: 16px;">
                <h3 style="margin: 0 0 8px; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                  "${data.reviewTitle}"
                </h3>
              </div>
              `
                  : ""
              }

              ${
                data.reviewContent
                  ? `
              <!-- Review Content -->
              <div style="margin-bottom: 24px;">
                <p style="margin: 0; color: #4a4a4a; font-size: 15px; line-height: 1.6; font-style: italic;">
                  "${data.reviewContent.substring(0, 200)}${data.reviewContent.length > 200 ? "..." : ""}"
                </p>
              </div>
              `
                  : ""
              }

              <!-- CTA Button -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="${dashboardUrl}" style="display: inline-block; background-color: #FF6B35; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px;">
                  View in Dashboard
                </a>
              </div>

              <!-- Footer Note -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                  <strong>💡 Tip:</strong> Responding to reviews helps build trust with customers and improves your online reputation.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} CHWK. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; color: #9ca3af; font-size: 11px; text-align: center;">
                You're receiving this email because you own a business listed on CHWK.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ============================================
// PLAIN TEXT EMAIL TEMPLATE
// ============================================
function generateNewReviewEmailText(data: NewReviewEmailData): string {
  const stars = "★".repeat(data.rating) + "☆".repeat(5 - data.rating);
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://chwk.app"}/dashboard/reviews`;

  return `
🎉 NEW REVIEW RECEIVED!

Hi ${data.businessOwnerName},

You've received a new review for ${data.businessName}!

RATING: ${stars} (${data.rating}/5)
FROM: ${data.reviewerName}
${data.reviewTitle ? `\nTITLE: "${data.reviewTitle}"` : ""}
${data.reviewContent ? `\nREVIEW: "${data.reviewContent}"` : ""}

View and respond to this review in your dashboard:
${dashboardUrl}

---
💡 Tip: Responding to reviews helps build trust with customers and improves your online reputation.

© ${new Date().getFullYear()} CHWK. All rights reserved.
You're receiving this email because you own a business listed on CHWK.
  `.trim();
}
