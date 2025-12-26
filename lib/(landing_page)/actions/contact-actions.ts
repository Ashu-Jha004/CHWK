"use server";

/**
 * Server Actions for Contact Forms and Lead Generation
 * These run on the server and can be called from client components
 */

import { z } from "zod";

// Validation schemas
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number")
    .optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  type: z.enum(["customer", "business"]),
});

const businessSignupSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  ownerName: z.string().min(2, "Owner name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  category: z.string().min(1, "Please select a category"),
  city: z.string().min(1, "Please select a city"),
  description: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type BusinessSignupData = z.infer<typeof businessSignupSchema>;

/**
 * Submit contact form
 * @returns Success message or error
 */
export async function submitContactForm(formData: ContactFormData) {
  try {
    // Validate input
    const validatedData = contactFormSchema.parse(formData);

    // Log for debugging (remove in production or send to logging service)
    console.log("Contact form submission:", {
      ...validatedData,
      timestamp: new Date().toISOString(),
    });

    // TODO: Replace with actual database insertion or email service
    // Example: await prisma.contactSubmission.create({ data: validatedData });
    // Example: await sendEmail(validatedData);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate random success/failure for testing
    const shouldSucceed = Math.random() > 0.1; // 90% success rate

    if (!shouldSucceed) {
      throw new Error("Failed to submit form. Please try again.");
    }

    return {
      success: true,
      message: "Thank you! We'll get back to you within 24 hours.",
    };
  } catch (error) {
    console.error("Contact form submission error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

/**
 * Submit business signup form
 * @returns Success message or error
 */
export async function submitBusinessSignup(formData: BusinessSignupData) {
  try {
    // Validate input
    const validatedData = businessSignupSchema.parse(formData);

    // Log for debugging
    console.log("Business signup submission:", {
      ...validatedData,
      timestamp: new Date().toISOString(),
    });

    // TODO: Replace with actual database insertion
    // Example: await prisma.businessLead.create({ data: validatedData });
    // Example: await sendWelcomeEmail(validatedData.email);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate random success/failure
    const shouldSucceed = Math.random() > 0.1;

    if (!shouldSucceed) {
      throw new Error("Failed to process signup. Please try again.");
    }

    return {
      success: true,
      message:
        "Welcome to CHWK! Our team will contact you within 24 hours to help you get started.",
    };
  } catch (error) {
    console.error("Business signup error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }
}

/**
 * Subscribe to newsletter
 */
const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function subscribeNewsletter(email: string) {
  try {
    const validatedData = newsletterSchema.parse({ email });

    console.log("Newsletter subscription:", {
      email: validatedData.email,
      timestamp: new Date().toISOString(),
    });

    // TODO: Add to email marketing service (Mailchimp, SendGrid, etc.)

    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      message: "Successfully subscribed to our newsletter!",
    };
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error: "Failed to subscribe. Please try again.",
    };
  }
}
