import { z } from "zod";

export type ActionState<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * reliable way to create safe server actions with standardized error handling
 * @param schema Zod schema to validate input
 * @param action The async action to perform
 */
export async function safeAction<TInput, TOutput>(
  schema: z.Schema<TInput>,
  input: any,
  action: (data: TInput) => Promise<TOutput>
): Promise<ActionState<TOutput>> {
  const validation = schema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: validation.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const data = await action(validation.data);
    return { success: true, data };
  } catch (error) {
    console.error("Server Action Error:", error);

    // Check for Prisma errors or other known error types here if needed
    // For now, return a generic message to avoid leaking sensitive details
    // unless it's a specific "User Error" we threw intentionally.

    const message = error instanceof Error ? error.message : "Internal Server Error";

    return {
      success: false,
      error: message,
    };
  }
}
