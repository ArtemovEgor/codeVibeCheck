## 📝 Overview

This PR implements a robust user logout system, covering both manual logouts via the UI and automatic logouts when the authentication token expires (receiving a 401 error from the backend). It also adds a localized notification to inform the user when their session has ended.

Closes #issue_number

## 🚀 Changes

- [x] **API Interceptor**: Updated `api-service.ts` to detect `401 Unauthorized` responses and dispatch a global `auth:logout` event.
- [x] **Global Listener**: Added an event listener in `app.ts` that catches `auth:logout`, navigates to the landing page, and displays a "Session Expired" notification.
- [x] **Notification Fix**: Resolved an `InvalidStateError` in the `Notification` component by ensuring the popover container is re-created if it becomes disconnected from the DOM (e.g., during a layout swap).
- [x] **Logout UI Resilience**: Wrapped the logout button logic in `sidebar.ts` with `try/catch/finally` to ensure the user is always redirected to the landing page, even if the server-side logout request fails.
- [x] **Localization**: Added `session_expired` message to the English locale.
- [x] **Smart Timing**: Used a one-shot `hashchange` listener to ensure notifications are shown only after the router has finished rebuilding the page DOM.

## 🧪 How to Test

1. **Manual Logout**: Log in and click the "Logout" button in the sidebar. Verify you are redirected to the landing page.
2. **Session Expiration**:
   - Temporarily set `TOKEN_EXPIRED = "5s"` in `backend/src/auth.service.ts`.
   - Log in, wait for 5 seconds, and perform any action that triggers an API call (e.g., send a message in AI Chat).
   - Verify that you are automatically redirected to the landing page and see the "Your session has expired" error notification.
3. **Invalid Token**: Manually corrupt the `jwt` key in the browser's Local Storage and trigger an API request. Verify the same logout and notification behavior occurs.

## 📸 Screenshots / Demos

[Drop image here]
