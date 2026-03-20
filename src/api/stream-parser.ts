export type StreamEvent =
  | { type: "text_chunk"; content: string }
  | { type: "final_report"; content: string };

function extractContentFromPayload(payload: string): StreamEvent | undefined {
  try {
    const parsed = JSON.parse(payload);

    if (parsed.error) {
      throw new Error("STREAM_API_ERROR:" + parsed.error);
    }

    if (parsed.type === "final_report") {
      return { type: "final_report", content: parsed.content };
    }

    const content = parsed.choices?.[0]?.delta?.content;
    if (content) {
      return { type: "text_chunk", content };
    }

    return undefined;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("STREAM_API_ERROR:")
    ) {
      throw new Error(error.message.replace("STREAM_API_ERROR:", ""), {
        cause: error,
      });
    }
    console.warn("Failed to parse SSE chunk:", payload, error);
    return undefined;
  }
}

export async function* parseSSEStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<StreamEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      const decoded = decoder.decode(value, { stream: true });
      const events = (buffer + decoded).split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const line = event.trim();
        if (!line || !line.startsWith("data: ")) continue;
        const payload = line.replace(/^data: /, "");

        if (payload === "[DONE]") return;

        const content = extractContentFromPayload(payload);
        if (content) yield content;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
