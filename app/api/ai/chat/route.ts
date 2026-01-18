// POST /api/ai/chat - Main chat endpoint with streaming
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { geminiService } from "@/lib/ai/gemini-service";
import { SessionManager } from "@/lib/ai/session-manager";
import { buildBusinessContext } from "@/lib/ai/business-context";
import { BusinessContext } from "@/lib/ai/types";

const ChatRequestSchema = z.object({
  sessionId: z.string().nullable().optional(),
  businessId: z.string().cuid(),
  message: z.string().min(1).max(500),
  userId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    console.log('[Chat API] Request received');

    // Validate API key is available
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('[Chat API] GOOGLE_GEMINI_API_KEY is not set!');
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // 1. Validate request
    const body = await req.json();
    console.log('[Chat API] Request body:', { ...body, message: body.message?.substring(0, 50) });

    const validated = ChatRequestSchema.safeParse(body);

    if (!validated.success) {
      console.error('[Chat API] Validation failed:', JSON.stringify(validated.error.issues, null, 2));
      return NextResponse.json(
        { error: "Invalid request", details: validated.error.issues },
        { status: 400 }
      );
    }

    const { sessionId, businessId, message, userId } = validated.data;

    // 2. Get or create session
    let session;
    if (sessionId) {
      session = await SessionManager.getSession(sessionId);
      if (!session) {
        return NextResponse.json(
          { error: "Session not found or expired" },
          { status: 404 }
        );
      }
    } else {
      // Create new session
      const context = await buildBusinessContext(businessId);
      if (!context) {
        return NextResponse.json(
          { error: "Business not found" },
          { status: 404 }
        );
      }
      session = await SessionManager.createSession(businessId, context, userId);
    }

    // 3. Add user message to session
    await SessionManager.addMessage(session.sessionId, {
      role: "user",
      content: message,
    });

    // 4. Get AI response with streaming
    const aiStream = await geminiService.chat(
      message,
      session.context,
      session.messages
    );

    // 5. Create streaming response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send session ID first (for new sessions)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "session", sessionId: session!.sessionId })}\n\n`
            )
          );

          // Stream AI response
          for await (const chunk of aiStream) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "token", content: chunk })}\n\n`
              )
            );
          }

          // Send completion message
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done", fullMessage: fullResponse })}\n\n`
            )
          );

          // 6. Save AI response to session (save before closing stream)
          try {
            await SessionManager.addMessage(session!.sessionId, {
              role: "assistant",
              content: fullResponse,
            });
          } catch (dbError) {
            console.error("[Chat API] Failed to save message history:", dbError);
            // Don't fail the request if history save fails, just log it
          }

          controller.close();
        } catch (error: any) {
          console.error("[AI Chat Error]:", error);
          const errorMessage = error?.message || String(error) || "AI service error";

          // Only enqueue error if controller is still readable/open
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", message: errorMessage })}\n\n`
              )
            );
            controller.close();
          } catch (streamError) {
            // Controller might be already closed
            console.warn("[Chat API] Could not send error frame (stream closed):", streamError);
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering
      },
    });
  } catch (error: any) {
    console.error("[Chat API Error] Full error details:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      cause: error?.cause
    });
    return NextResponse.json(
      { error: "Internal server error", message: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

// GET /api/ai/chat - Get session history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    const session = await SessionManager.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      sessionId: session.sessionId,
      messages: session.messages,
      businessId: session.businessId,
    });
  } catch (error) {
    console.error("[Get Session Error]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/ai/chat - Clear session
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    await SessionManager.deleteSession(sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Delete Session Error]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
