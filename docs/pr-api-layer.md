## 📝 Overview

Closes #XX

Add the **API service layer** — a shared HTTP client (`ApiService`), auth endpoints (`AuthApi`), shared TypeScript types, and a mock mode for local development without a backend.

## 🚀 Changes

### New Files

- [x] `src/api/api-service.ts` — singleton HTTP client with JWT token management (`setToken`, `clearToken`, `getToken`), auto `Authorization` header injection, and `Content-Type` handling
- [x] `src/api/auth.api.ts` — auth endpoint methods: `login`, `register`, `getCurrentUser`, `logout`; transparent mock/real switching via `VITE_API_MODE`
- [x] `src/api/endpoints.ts` — centralized API endpoint URL constants
- [x] `src/api/mock/auth.mock.ts` — mock auth service with configurable delay (`VITE_MOCK_DELAY`), uses credentials for realistic responses
- [x] `src/types/shared/user.types.ts` — `IUser`, `ILoginCredentials`, `IRegisterCredentials`, `IAuthResponse`
- [x] `src/types/shared/api.types.ts` — `IApiResponse<T>`, `IApiError`
- [x] `src/types/shared/index.ts` — barrel re-export

### Modified Files

- [x] `src/constants/app.ts` — add `TOKEN_KEY` constant

## 🔑 Key Decisions

- **Token persistence** — JWT stored in `localStorage` under `TOKEN_KEY`; restored on page reload
- **Mock mode** — controlled via `VITE_API_MODE=mock` env variable; `AuthApi` delegates to `AuthMock` when active
- **Error handling** — `logout()` uses `try/finally` to ensure token cleanup even on network failure
- **Content-Type** — set to `application/json` only when request has a body, not on GET requests

## 🧪 How to Test

1. Ensure `VITE_API_MODE=mock` is set in `.env` (default)
2. Run `npm run dev`
3. Open the app → navigate to Login
4. Submit the login form → should redirect to Dashboard
5. Check `localStorage` → `jwt` key should contain `"mock-jwt-token"`
6. Click Logout in sidebar → should clear token and redirect to Landing
7. Reload page while logged in → token should persist, user stays on Dashboard

## 📸 Screenshots / Demos

[Drop image here]
