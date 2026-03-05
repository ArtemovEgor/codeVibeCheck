## 📝 Overview

Closes #XX

Add **AI Chat API layer** — endpoints, types, and mock service for the AI interviewer chat feature. Backend stores message history; frontend sends text and receives AI responses.

## 🚀 Changes

### New Files

- [x] `src/api/ai.api.ts` — `AIApi` class: `sendChatMessage`, `getChatHistory`, `resetChat`; transparent mock/real switching
- [x] `src/api/mock/ai.mock.ts` — mock AI service with localStorage persistence; saves both user and AI messages
- [x] `src/api/mock/delay.ts` — shared delay utility extracted from `auth.mock.ts`
- [x] `src/types/shared/ai.types.ts` — `IChatMessage`, `ISendMessagePayload`, `IAIResponse`, `IAIJudgeResult`
- [x] `src/constants/api-chat.ts` — `ChatRoles` constants
- [x] `src/constants/storage-keys.ts` — `STORAGE_KEYS` for localStorage key management
- [x] `src/services/storage-service.ts` — generic `StorageService` wrapper over localStorage

### Modified Files

- [x] `src/api/endpoints.ts` — add `AI.CHAT`, `AI.CHAT_HISTORY`, `AI.CHAT_RESET`
- [x] `src/api/mock/auth.mock.ts` — extract `delay` to shared utility
- [x] `src/types/shared/index.ts` — re-export AI types
- [x] `src/locale/en.ts` — add mock AI response string

## 🔑 Key Decisions

- **One chat per user** — no `chatId`, no chat sessions list; user can reset chat to start over
- **Backend stores history** — frontend sends only `{ content }`, backend persists and returns full message list
- **RESTful endpoints** — single resource `/api/ai/chat` with POST (send), GET (history), DELETE (reset)
- **Mock persistence** — `localStorage` via `StorageService` to survive page reloads during development

## 🧪 How to Test

1. Ensure `VITE_API_MODE=mock` in `.env`
2. Run `npm run dev`
3. Call `aiApi.sendChatMessage({ content: "Hello" })` from console
4. Call `aiApi.getChatHistory()` → should return both user message and AI response
5. Call `aiApi.resetChat()` → `getChatHistory()` should return empty array
6. Check `localStorage` → `mock-history` key should reflect current state

## 📸 Screenshots / Demos

[Drop image here]
