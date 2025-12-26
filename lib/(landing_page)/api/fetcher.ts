/**
 * Type-safe fetcher utility for API calls
 * Includes error handling, retry logic, and type inference
 */

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Base fetch configuration
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Generic fetcher function with error handling
 */
export async function fetcher<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    // Parse JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Network errors
    if (error instanceof TypeError) {
      console.error("Network error:", error);
      throw new ApiError("Network error. Please check your connection.", 0);
    }

    // Re-throw API errors
    if (error instanceof ApiError) {
      console.error("API error:", error);
      throw error;
    }

    // Unknown errors
    console.error("Unknown error in fetcher:", error);
    throw new ApiError("An unexpected error occurred.");
  }
}

/**
 * GET request helper
 */
export async function get<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  try {
    const url = new URL(
      endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`
    );

    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return await fetcher<T>(url.toString(), {
      method: "GET",
      cache: "no-store", // Disable Next.js caching for dynamic data
    });
  } catch (error) {
    console.error(`GET ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * POST request helper
 */
export async function post<T, D = unknown>(
  endpoint: string,
  data?: D
): Promise<T> {
  try {
    return await fetcher<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  } catch (error) {
    console.error(`POST ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * PUT request helper
 */
export async function put<T, D = unknown>(
  endpoint: string,
  data?: D
): Promise<T> {
  try {
    return await fetcher<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  } catch (error) {
    console.error(`PUT ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * DELETE request helper
 */
export async function del<T>(endpoint: string): Promise<T> {
  try {
    return await fetcher<T>(endpoint, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(`DELETE ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * Handle API errors gracefully
 */
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Retry utility for failed requests
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} failed:`, error);

      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.statusCode && error.statusCode < 500) {
        throw error;
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }

  throw lastError!;
}
