// Gemini AI Service
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { BusinessContext, ChatMessage } from "./types";
import { buildSystemPrompt } from "./prompts";

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];


export class GeminiService {
  private model;

  constructor() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      console.error('[Gemini Service] GOOGLE_GEMINI_API_KEY is not set!');
      throw new Error('Gemini API key is not configured. Please set GOOGLE_GEMINI_API_KEY in your environment variables.');
    }

    console.log('[Gemini Service] Initializing with API key (length:', apiKey.length, ')');

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: "gemma-3-1b-it",
      safetySettings: SAFETY_SETTINGS,
    });
  }

  async chat(
    message: string,
    context: BusinessContext,
    history: ChatMessage[] = []
  ): Promise<AsyncIterable<string>> {
    const systemPrompt = buildSystemPrompt(context);

    // Build chat history in Gemini format
    const geminiHistory = [
      {
        role: "user" as const,
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model" as const,
        parts: [{ text: "Understood. I'm ready to assist customers as your AI receptionist!" }],
      },
      ...history.flatMap(msg => [
        {
          role: msg.role === "user" ? "user" as const : "model" as const,
          parts: [{ text: msg.content }],
        },
      ]),
    ];

    const chat = this.model.startChat({
      history: geminiHistory,
      generationConfig: {
        maxOutputTokens: 500, // Keep responses concise
        temperature: 0.7, // Balance between creative and focused
      },
    });

    const result = await chat.sendMessageStream(message);

    // Return async generator for streaming
    return this.streamResponse(result.stream);
  }

  private async *streamResponse(stream: AsyncIterable<any>): AsyncIterable<string> {
    try {
      for await (const chunk of stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error("[Gemini Stream Error]:", error);
      throw error; // Propagate up to route handler
    }
  }

  // Non-streaming version for simpler use cases
  async chatSync(
    message: string,
    context: BusinessContext,
    history: ChatMessage[] = []
  ): Promise<string> {
    let fullResponse = "";
    for await (const chunk of await this.chat(message, context, history)) {
      fullResponse += chunk;
    }
    return fullResponse;
  }
}

export const geminiService = new GeminiService();
