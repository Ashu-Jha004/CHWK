// lib/constants/response-templates.ts

export const RESPONSE_TEMPLATES = {
  positive: [
    {
      id: "thank-you-1",
      label: "Thank You",
      content: "Thank you so much for your wonderful review! We're thrilled to hear you had a great experience with us. We look forward to serving you again soon!",
    },
    {
      id: "thank-you-2",
      label: "Appreciation",
      content: "We truly appreciate you taking the time to share your positive feedback! Your kind words mean a lot to our team. Thank you for choosing us!",
    },
    {
      id: "thank-you-3",
      label: "Grateful",
      content: "We're so grateful for your 5-star review! It's wonderful to know we met your expectations. We can't wait to welcome you back!",
    },
    {
      id: "thank-you-4",
      label: "Delighted",
      content: "We're absolutely delighted to hear you enjoyed your experience! Thank you for your support and for recommending us. See you again soon!",
    },
  ],
  negative: [
    {
      id: "apology-1",
      label: "Sincere Apology",
      content: "We sincerely apologize for your disappointing experience. This is not the level of service we strive to provide. Please contact us directly so we can make this right.",
    },
    {
      id: "apology-2",
      label: "Improve",
      content: "Thank you for bringing this to our attention. We're sorry we didn't meet your expectations. Your feedback helps us improve, and we'd like the opportunity to make things right. Please reach out to us.",
    },
    {
      id: "apology-3",
      label: "Sorry & Solution",
      content: "We're truly sorry to hear about your experience. This doesn't reflect our usual standards. We'd love to discuss this further and find a solution. Please contact us at your earliest convenience.",
    },
    {
      id: "apology-4",
      label: "Learn & Improve",
      content: "We appreciate your honest feedback and apologize for falling short. We take your concerns seriously and are working to improve. We'd appreciate the chance to make this right.",
    },
  ],
  neutral: [
    {
      id: "neutral-1",
      label: "Thank You for Feedback",
      content: "Thank you for taking the time to share your feedback. We appreciate your comments and are always looking for ways to improve our service.",
    },
    {
      id: "neutral-2",
      label: "Acknowledge",
      content: "We appreciate your review and the time you took to share your experience. Your feedback is valuable to us as we continue to enhance our services.",
    },
  ],
};

/**
 * Get templates based on review rating
 */
export function getTemplatesForRating(rating: number) {
  if (rating >= 4) {
    return RESPONSE_TEMPLATES.positive;
  } else if (rating <= 2) {
    return RESPONSE_TEMPLATES.negative;
  } else {
    return RESPONSE_TEMPLATES.neutral;
  }
}
