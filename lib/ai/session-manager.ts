// Session Management Service
import { prisma } from "@/lib/prisma";
// NOTE: If you see errors about 'chatSession' not existing, please run: npx prisma generate
import { nanoid } from "nanoid";
import type { ChatMessage, BusinessContext } from "@/lib/ai/types";

export interface Session {
  id: string;
  sessionId: string;
  businessId: string;
  userId?: string;
  messages: ChatMessage[];
  context: BusinessContext;
  startedAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
}

export class SessionManager {
  private static SESSION_DURATION_HOURS = 24;

  /**
   * Create a new chat session
   */
  static async createSession(
    businessId: string,
    context: BusinessContext,
    userId?: string
  ): Promise<Session> {
    const sessionId = nanoid(16); // Generate unique session ID
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_DURATION_HOURS * 60 * 60 * 1000);

    const session = await prisma.chatSession.create({
      data: {
        sessionId,
        businessId,
        userId,
        messages: [] as any,
        context: context as any,
        expiresAt,
      },
    });

    // Lazy cleanup: 10% chance to clean up expired sessions in background
    if (Math.random() < 0.1) {
      this.cleanupExpiredSessions().catch(err =>
        console.error("[Session Cleanup] Background cleanup failed:", err)
      );
    }

    return this.formatSession(session);
  }

  /**
   * Get existing session by sessionId
   */
  static async getSession(sessionId: string): Promise<Session | null> {
    const session = await prisma.chatSession.findUnique({
      where: { sessionId },
    });

    if (!session) return null;

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      await this.deleteSession(sessionId);
      return null;
    }

    return this.formatSession(session);
  }

  /**
   * Add a message to the session
   */
  static async addMessage(
    sessionId: string,
    message: ChatMessage
  ): Promise<Session> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found or expired");
    }

    const updatedMessages = [
      ...session.messages,
      { ...message, timestamp: new Date() },
    ];

    const updated = await prisma.chatSession.update({
      where: { sessionId },
      data: {
        messages: updatedMessages as any,
        lastActiveAt: new Date(),
      },
    });

    return this.formatSession(updated);
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    await prisma.chatSession.delete({
      where: { sessionId },
    }).catch(() => {
      // Ignore if already deleted
    });
  }

  /**
   * Cleanup expired sessions (run periodically)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.chatSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * Get session  count for a business
   */
  static async getBusinessSessionCount(businessId: string): Promise<number> {
    return await prisma.chatSession.count({
      where: {
        businessId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  private static formatSession(session: any): Session {
    return {
      id: session.id,
      sessionId: session.sessionId,
      businessId: session.businessId,
      userId: session.userId || undefined,
      messages: session.messages as ChatMessage[],
      context: session.context as BusinessContext,
      startedAt: session.startedAt,
      lastActiveAt: session.lastActiveAt,
      expiresAt: session.expiresAt,
    };
  }
}
