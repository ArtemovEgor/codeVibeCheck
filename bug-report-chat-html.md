## 🛑 Bug Description

HTML tags sent in the chat messages are executed/rendered as actual HTML elements instead of being displayed as plain text.

## 📋 Steps to Reproduce

1. Open the AI Chat interface.
2. Input a string containing HTML tags (e.g., `<h1>Test Heading</h1>` or `<button onclick="alert('XSS')">Click Me</button>`) into the message field.
3. Send the message.
4. Observe the message bubble in the chat history.

## 🎯 Expected Behavior

The chat message should display the raw string `<h1>Test Heading</h1>` as plain text, ensuring all HTML characters are properly escaped.

## ⚠️ Actual Behavior

The browser renders the HTML tags, resulting in a large heading or a functional button appearing inside the message bubble, which indicates a Lack of Sanitization/XSS vulnerability.

## ✅ Definition of Done (for Fix)

- [ ] All incoming and outgoing chat messages are properly escaped/sanitized before rendering.
- [ ] Bug is fixed and verified in the browser.
- [ ] Code passes linting checks (`npm run lint`).
- [ ] Project builds successfully (`npm run build`).
- [ ] No new warnings in the browser console.

## 📸 Screenshots / Recordings (if applicable)
