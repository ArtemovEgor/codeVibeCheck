import Groq from "groq-sdk";
import { ChatCompletionChunk } from "groq-sdk/resources/chat/completions";
import { IChatMessage, ISendMessagePayload } from "./ai.types";
import crypto from "node:crypto";
import dataBase from "../database";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Sending a user message to Groq API and streaming the response
 * @param userId - ID of the user sending the message
 * @param message - user message payload
 * @param signal - AbortSignal to cancel the API request
 */

export async function* sendChatMessage(
  userId: string,
  message: ISendMessagePayload,
  signal?: AbortSignal,
): AsyncGenerator<ChatCompletionChunk> {
  const insertQuery = dataBase.prepare(`
    INSERT INTO messages (id, userId, role, content, createdAt, xpAwarded)
    VALUES (@id, @userId, @role, @content, @createdAt, @xpAwarded)
  `);

  insertQuery.run({
    id: crypto.randomUUID(),
    userId: userId,
    role: "user",
    content: message.content,
    createdAt: new Date().toISOString(),
    xpAwarded: 0,
  });

  const stream = await client.chat.completions.create(
    {
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{ role: "user", content: message.content }],
      stream: true,
    },
    { signal },
  );

  let accumulated = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      accumulated += content;
      yield chunk;
    }
  }

  insertQuery.run({
    id: crypto.randomUUID(),
    userId: userId,
    role: "assistant",
    content: accumulated,
    createdAt: new Date().toISOString(),
    xpAwarded: 0,
  });
}

/**
 * Retrieves the chat history for a specific user
 * @param userId - ID of the user to get history for
 * @returns Array of chat messages ordered by creation time
 */
export function getChatHistory(userId: string): IChatMessage[] {
  const query = dataBase.prepare(
    "SELECT * FROM messages WHERE userId = ? ORDER BY createdAt ASC",
  );
  const history = query.all(userId) as IChatMessage[];

  return history;
}

/**
 * Resets (deletes) the chat history for a specific user
 * @param userId - ID of the user whose chat should be reset
 */
export function resetChat(userId: string): void {
  const query = dataBase.prepare("DELETE FROM messages WHERE userId = ?");
  query.run(userId);
}
