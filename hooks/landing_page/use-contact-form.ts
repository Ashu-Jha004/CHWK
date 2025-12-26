"use client";

import { useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import {
  submitContactForm,
  submitBusinessSignup,
  subscribeNewsletter,
} from "@/lib/(landing_page)/actions/contact-actions";

/**
 * Hook for contact form submissions with React Query
 */
export function useContactForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: (data) => {
      if (data.success && data.message) {
        setSuccessMessage(data.message);
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    },
    onError: (error) => {
      console.error("Contact form mutation error:", error);
    },
  });

  const clearSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  return {
    submit: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.data?.success === false ? mutation.data.error : null,
    successMessage,
    clearSuccess,
    reset: mutation.reset,
  };
}

/**
 * Hook for business signup form
 */
export function useBusinessSignup() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: submitBusinessSignup,
    onSuccess: (data) => {
      if (data.success && data.message) {
        setSuccessMessage(data.message);
        setTimeout(() => setSuccessMessage(null), 7000);
      }
    },
    onError: (error) => {
      console.error("Business signup mutation error:", error);
    },
  });

  const clearSuccess = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  return {
    submit: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.data?.success === false ? mutation.data.error : null,
    successMessage,
    clearSuccess,
    reset: mutation.reset,
  };
}

/**
 * Hook for newsletter subscription
 */
export function useNewsletterSubscription() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: subscribeNewsletter,
    onSuccess: (data) => {
      if (data.success && data.message) {
        setSuccessMessage(data.message);
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    },
    onError: (error) => {
      console.error("Newsletter subscription error:", error);
    },
  });

  return {
    subscribe: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.data?.success === false ? mutation.data.error : null,
    successMessage,
    reset: mutation.reset,
  };
}
