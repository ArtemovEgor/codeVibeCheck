import Groq from "groq-sdk";
import {
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "groq-sdk/resources/chat/completions";
import { IChatMessage, IScoreData, ISendMessagePayload } from "./ai.types";
import crypto from "node:crypto";
import dataBase from "../database";
import { SYSTEM_PROMPTS } from "./prompts";
import { CHUNK_YIELD_DELAY } from "./ai.constants";
import { EN } from "../locale/en";

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

  const rawHistory = getChatHistory(userId);

  prepareSummary(rawHistory, findLastSummaryIndex(rawHistory))
    .then((summary) => {
      if (summary) {
        saveSummary(summary, userId);
      }
    })
    .catch((error) => console.warn("[BACKGROUND SUMMARIZATION ERROR]:", error));

  const historyContext: ChatCompletionMessageParam[] = rawHistory
    .slice(-10)
    .map((m) => ({
      role: m.role,
      content: m.content,
    }));

  const stream = await client.chat.completions.create(
    {
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: SYSTEM_PROMPTS.interviewer },
        ...historyContext,
      ],
      stream: true,
    },
    { signal },
  );

  let accumulated = "";
  let extractedText = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      accumulated += content;
      const match = accumulated.match(/"message"\s*:\s*"([^]*)/);

      if (match) {
        let currentParsedText = match[1];
        const endMatch = currentParsedText.match(/(?<!\\)"/);
        if (endMatch) {
          currentParsedText = currentParsedText.slice(0, endMatch.index);
        }

        currentParsedText = currentParsedText
          .replaceAll(/\\n/, "\n")
          .replaceAll(/\\"/, '"')
          .replaceAll(/\\\\/, "\\");

        const newDelta = currentParsedText.slice(extractedText.length);

        if (newDelta.length > 0) {
          extractedText += newDelta;

          await new Promise((resolve) =>
            setTimeout(resolve, CHUNK_YIELD_DELAY),
          );

          const fakeChunk = {
            ...chunk,
            choices: [
              {
                ...chunk.choices[0],
                delta: { content: newDelta },
              },
            ],
          };
          yield fakeChunk;
        }
      }
    }
  }

  const scoreData = getScore(accumulated);

  insertQuery.run({
    id: crypto.randomUUID(),
    userId: userId,
    role: "assistant",
    content: extractedText,
    createdAt: new Date().toISOString(),
    xpAwarded: scoreData?.score || 0,
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

function getScore(response: string): IScoreData | undefined {
  try {
    const startIndex = response.indexOf("{");
    const endIndex = response.lastIndexOf("}");

    if (startIndex === -1 || endIndex === -1) {
      return undefined;
    }

    const cleanJsonString = response.slice(startIndex, endIndex + 1);

    const parsedData = JSON.parse(cleanJsonString);

    return {
      score: parsedData.score,
      topic: parsedData.topic,
      difficulty_adjustment: parsedData.difficulty_adjustment,
      next_phase: parsedData.next_phase,
      comment: parsedData.comment,
    };
  } catch (error) {
    console.warn("Failed to parse final JSON:", error);
    throw new Error(EN.errors.ai_score_error, { cause: error });
  }
}

function findLastSummaryIndex(messageHistory: IChatMessage[]): number {
  let lastSummaryIndex = -1;
  for (let index = messageHistory.length - 1; index >= 0; index--) {
    const m = messageHistory[index];
    if (m.role === "system" && m.content.startsWith("[SUMMARY]")) {
      lastSummaryIndex = index;
      break;
    }
  }
  return lastSummaryIndex;
}

async function prepareSummary(
  messageHistory: IChatMessage[],
  startIndex: number,
): Promise<string | undefined> {
  let currentSummary = "";
  let unsummarizedMessages: IChatMessage[] = messageHistory;

  if (startIndex !== -1) {
    currentSummary = messageHistory[startIndex].content
      .replace("[SUMMARY]\n", "")
      .trim();
    unsummarizedMessages = messageHistory.slice(startIndex + 1);
  }

  if (unsummarizedMessages.length >= 10) {
    const messagesToProcess = unsummarizedMessages.slice(0, 10);

    return generateSummary(currentSummary, messagesToProcess);
  }
}

async function generateSummary(
  oldSummary: string,
  messagesToSummarize: IChatMessage[],
): Promise<string | undefined> {
  const transcript = messagesToSummarize
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const prompt =
    `${SYSTEM_PROMPTS.summarize}\n\n` +
    `=== EXISTING PROFILE ===\n${oldSummary || "No profile yet."}\n\n` +
    `=== NEW TRANSCRIPT SEGMENT ===\n${transcript}`;

  try {
    const response = await client.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const newSummary = response.choices[0]?.message?.content?.trim();

    return newSummary;
  } catch (error) {
    console.error("[SUMMARY ERROR] Failed to generate summary:", error);
    return undefined;
  }
}

function saveSummary(summary: string, userId: string) {
  const insertQuery = dataBase.prepare(`
    INSERT INTO messages (id, userId, role, content, createdAt, xpAwarded)
    VALUES (@id, @userId, @role, @content, @createdAt, @xpAwarded)
  `);

  insertQuery.run({
    id: crypto.randomUUID(),
    userId: userId,
    role: "system",
    content: `[SUMMARY]\n${summary}`,
    createdAt: new Date().toISOString(),
    xpAwarded: 0,
  });

  console.log(`[SUMMARY] Successfully updated profile for user ${userId}`);
}
