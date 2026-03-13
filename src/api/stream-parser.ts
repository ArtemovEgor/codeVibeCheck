export async function* parseSSEStream(
  stream: ReadableStream<Uint8Array>,
): AsyncGenerator<string> {
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
        try {
          const parsed = JSON.parse(payload);
          const content = parsed.choices?.[0]?.delta?.content;

          if (content) yield content;
        } catch (error) {
          console.warn("Failed to parse SSE chunk:", payload, error);
          continue;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
