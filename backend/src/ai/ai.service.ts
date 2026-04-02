import Groq from "groq-sdk";
import { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions";
import {
  AppStreamChunk,
  IChatMessage,
  IScoreData,
  ISendMessagePayload,
} from "./ai.types";
import crypto from "node:crypto";
import dataBase from "../database";
import { SYSTEM_PROMPTS } from "./prompts";
import { AI_MODELS, CHUNK_YIELD_DELAY, MAX_CHAT_TURNS } from "./ai.constants";
import { convertChatScoreToXP } from "./ai-scoring";
import { EN } from "../locale/en";
import type { IUserChatStats } from "../types";

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
): AsyncGenerator<AppStreamChunk> {
  const { language } = message;
  console.log(
    `[AI SERVICE] Received message. Content: "${message.content.slice(0, 20)}...", Language: "${language}"`,
  );

  const countQuery = dataBase.prepare(
    "SELECT COUNT(*) as count FROM messages WHERE userId = ? AND role = 'user'",
  );
  const { count: currentTurn } = countQuery.get(userId) as { count: number };
  const isFinalTurn = currentTurn >= MAX_CHAT_TURNS;

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
    .map((m) => {
      let finalContent = m.content;

      if (m.role === "user" && isFinalTurn && m.id === rawHistory.at(-1)?.id) {
        finalContent = `${m.content}\n\n[FINAL TURN]`;
      }

      return {
        role: m.role,
        content: finalContent,
      };
    });

  const langName = language?.toLowerCase() === "ru" ? "RUSSIAN" : "ENGLISH";
  const systemPrompt = language
    ? `${SYSTEM_PROMPTS.interviewer}\n\nSTRICT LANGUAGE RULE: Output all responses (messages, topics, comments) strictly in ${langName}. Do NOT use any other language.`
    : SYSTEM_PROMPTS.interviewer;

  const stream = await client.chat.completions.create(
    {
      model: AI_MODELS.answering,
      messages: [{ role: "system", content: systemPrompt }, ...historyContext],
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

        const trailingSlashes =
          currentParsedText.match(/\\+$/)?.[0].length || 0;
        if (trailingSlashes % 2 !== 0) continue;

        const escapeMap: Record<string, string> = {
          n: "\n",
          r: "\r",
          t: "\t",
          b: "\b",
          f: "\f",
          '"': '"',
          "\\": "\\",
          "/": "/",
        };

        const unescapedMessage = currentParsedText.replaceAll(
          /\\(["\\/bfnrt])/g,
          (_, char: string) => escapeMap[char] || char,
        );

        const newDelta = unescapedMessage.slice(extractedText.length);

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
    xpAwarded: scoreData ? convertChatScoreToXP(scoreData.score) : 0,
  });

  if (isFinalTurn) {
    const finalReport = await generateFinalReport(userId, language);

    insertQuery.run({
      id: crypto.randomUUID(),
      userId: userId,
      role: "system",
      content: `[FINAL_REPORT]\n${finalReport}`,
      createdAt: new Date().toISOString(),
      xpAwarded: 0,
    });

    await saveSessionStats(userId, finalReport);

    yield {
      type: "final_report",
      content: finalReport,
    };
  }
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
      model: AI_MODELS.summarization,
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

async function generateFinalReport(
  userId: string,
  language?: string,
): Promise<string> {
  const rawHistory = getChatHistory(userId);
  const lastSummaryIndex = findLastSummaryIndex(rawHistory);

  let profileContext: string = SYSTEM_PROMPTS.no_profile_summary;
  let unsummarizedMessages = rawHistory;

  if (lastSummaryIndex !== -1) {
    profileContext = rawHistory[lastSummaryIndex].content;
    unsummarizedMessages = rawHistory.slice(lastSummaryIndex + 1);
  }

  const transcript = unsummarizedMessages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  const prompt = `=== CUMULATIVE SUMMARY ===\n${profileContext}\n\n=== RECENT TRANSCRIPT ===\n${transcript}`;

  const langName = language?.toLowerCase() === "ru" ? "RUSSIAN" : "ENGLISH";
  const systemPrompt = language
    ? `${SYSTEM_PROMPTS.final_judge}\n\nSTRICT LANGUAGE RULE: Generate the entire report strictly in ${langName} using clean markdown.`
    : SYSTEM_PROMPTS.final_judge;

  try {
    const response = await client.chat.completions.create({
      model: AI_MODELS.summarization,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      "Failed to generate report."
    );
  } catch (error) {
    console.error("[FINAL REPORT ERROR]:", error);
    throw new Error(EN.errors.final_report_error, { cause: error });
  }
}

/**
 * Gets user statistics from the database
 * @param userId - ID of the user
 * @returns User statistics or undefined if not found
 */
export function getUserChatStats(userId: string): IUserChatStats | undefined {
  const query = dataBase.prepare("SELECT * FROM user_stats WHERE userId = ?");
  const stats = query.get(userId) as IUserChatStats | undefined;

  return stats;
}

/**
 * Saves session statistics after AI chat completion
 * @param userId - ID of the user
 * @param finalReport - Textual result of the chat session
 */
async function saveSessionStats(
  userId: string,
  finalReport: string,
): Promise<void> {
  try {
    const sessionHistory = getChatHistory(userId);
    const sessionXpTotal = sessionHistory.reduce(
      (sum, message) => sum + (message.xpAwarded || 0),
      0,
    );

    const existingStats = getUserChatStats(userId);

    if (existingStats) {
      const updateQuery = dataBase.prepare(`
        UPDATE user_stats 
        SET totalXp = totalXp + ?,
            chatSessionsCompleted = chatSessionsCompleted + 1,
            lastChatXpEarned = ?,
            lastSessionResult = ?
        WHERE userId = ?
      `);

      updateQuery.run(sessionXpTotal, sessionXpTotal, finalReport, userId);
    } else {
      const insertQuery = dataBase.prepare(`
        INSERT INTO user_stats (userId, totalXp, chatSessionsCompleted, lastChatXpEarned, lastSessionResult)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertQuery.run(userId, sessionXpTotal, 1, sessionXpTotal, finalReport);
    }

    console.log(
      `[SESSION STATS] Saved ${sessionXpTotal} XP for user ${userId}`,
    );
  } catch (error) {
    console.error("[SESSION STATS ERROR]:", error); // Don't throw - stats save shouldn't break the chat flow
  }
}
