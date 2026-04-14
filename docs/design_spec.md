# codeVibeCheck — Design Specification & AI Prompt

## Quick Reference

- **App name:** codeVibeCheck
- **Type:** SPA — interactive JS/TS interview prep trainer
- **Audience:** Junior–Middle frontend developers preparing for tech interviews
- **Tone:** Professional yet approachable, slightly gamified, modern dev-tool aesthetic

---

## 1. Design System

### Color Palette

| Token                | Light Mode | Dark Mode | Usage                                  |
| -------------------- | ---------- | --------- | -------------------------------------- |
| `--bg-primary`       | `#FAFBFC`  | `#0D1117` | Page background                        |
| `--bg-surface`       | `#FFFFFF`  | `#161B22` | Cards, panels                          |
| `--bg-surface-hover` | `#F3F4F6`  | `#1C2333` | Card hover state                       |
| `--bg-elevated`      | `#FFFFFF`  | `#21262D` | Modals, dropdowns                      |
| `--accent-primary`   | `#6366F1`  | `#818CF8` | Buttons, links, active states (Indigo) |
| `--accent-secondary` | `#8B5CF6`  | `#A78BFA` | Gradients, highlights (Violet)         |
| `--accent-success`   | `#10B981`  | `#34D399` | Correct answers, streaks               |
| `--accent-error`     | `#EF4444`  | `#F87171` | Wrong answers, errors                  |
| `--accent-warning`   | `#F59E0B`  | `#FBBF24` | Hints, alerts                          |
| `--text-primary`     | `#111827`  | `#E6EDF3` | Headings, body text                    |
| `--text-secondary`   | `#6B7280`  | `#8B949E` | Descriptions, labels                   |
| `--text-muted`       | `#9CA3AF`  | `#484F58` | Placeholders, disabled                 |
| `--border`           | `#E5E7EB`  | `#30363D` | Card borders, dividers                 |

**Key gradient:** `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))` — used for hero sections, primary CTA buttons, progress bars.

### Typography

| Element       | Font           | Weight | Size            | Line-height |
| ------------- | -------------- | ------ | --------------- | ----------- |
| H1            | Inter          | 700    | 32px / 2rem     | 1.2         |
| H2            | Inter          | 600    | 24px / 1.5rem   | 1.3         |
| H3            | Inter          | 600    | 20px / 1.25rem  | 1.4         |
| Body          | Inter          | 400    | 16px / 1rem     | 1.6         |
| Small / Label | Inter          | 500    | 14px / 0.875rem | 1.4         |
| Code          | JetBrains Mono | 400    | 14px / 0.875rem | 1.6         |

### Spacing Scale (8px grid)

`4px · 8px · 12px · 16px · 24px · 32px · 48px · 64px · 96px`

### Border Radius

| Token         | Value | Usage                 |
| ------------- | ----- | --------------------- |
| `--radius-sm` | 6px   | Badges, tags          |
| `--radius-md` | 10px  | Buttons, inputs       |
| `--radius-lg` | 16px  | Cards                 |
| `--radius-xl` | 24px  | Modals, hero sections |

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.12);
--shadow-glow: 0 0 20px rgba(99, 102, 241, 0.15); /* accent glow on focus/hover */
```

---

## 2. Component Inventory

### Buttons

| Variant       | Style                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------- |
| **Primary**   | Gradient fill (`accent-primary → accent-secondary`), white text, `shadow-md`, scale(1.02) on hover |
| **Secondary** | Transparent bg, `accent-primary` border + text, filled bg on hover                                 |
| **Ghost**     | No border, `text-secondary` color, subtle bg on hover                                              |
| **Danger**    | `accent-error` fill, white text                                                                    |

All buttons: `radius-md`, `padding: 10px 20px`, `font-weight: 600`, `transition: all 0.2s ease`.

### Cards

- Background: `bg-surface`, border: `1px solid var(--border)`, `radius-lg`
- Hover: `shadow-md`, `translateY(-2px)`, border color → `accent-primary` at 30% opacity
- Padding: `24px`

### Input Fields

- Border: `1px solid var(--border)`, `radius-md`
- Focus: border → `accent-primary`, `shadow-glow`
- Padding: `12px 16px`
- Label above input, `font-weight: 500`, `text-secondary`

### Toast Notifications

- Fixed bottom-right, slides in from right
- Variants: success (green left border), error (red), info (indigo), warning (amber)
- Auto-dismiss in 4s, manual close button

### Modal

- Centered overlay with `rgba(0,0,0,0.5)` backdrop + `backdrop-filter: blur(4px)`
- White/dark card, `radius-xl`, `shadow-lg`, `max-width: 520px`
- Fade + scale-up animation (0.95 → 1.0)

### Progress Bar

- Height: `8px`, `radius-sm`, track background: `bg-surface-hover`
- Fill: gradient (`accent-primary → accent-secondary`), animated width transition
- Optional: pulsing glow effect when active

### Badge / Tag

- Inline-block, `radius-sm`, `padding: 4px 10px`, `font-size: 12px`, `font-weight: 600`
- Color variants: indigo (default), green (completed), amber (in progress), gray (locked)

### Skeleton Loader

- Pulsing animation (`opacity: 0.4 → 1.0`, 1.5s infinite)
- Same shape as target content (text block, card, avatar circle)

---

## 3. Page-by-Page Specifications

### 3.1 Landing Page (`/`)

**Layout:** Full-width, single scroll page.

**Sections:**

1. **Hero** — Gradient background (indigo → violet, subtle), large heading: "Подготовься к техническому интервью", subheading describing the app, prominent CTA button "Начать бесплатно". Floating code snippet decorations (subtle, with opacity) on sides.
2. **Features grid** — 3 cards in a row: "Интерактивные виджеты", "AI-интервьюер", "Отслеживание прогресса". Each card has an icon (emoji or SVG), title, short description.
3. **Widget preview** — Screenshot/mockup of a Quiz widget in action, with a dark code block beside it.
4. **CTA footer** — "Присоединяйся к тренировке" + Register button.

**Header:** Logo (left) + navigation links (Library, About) + Login/Register buttons (right). Transparent on hero, solid bg on scroll (sticky).

### 3.2 Auth Pages (`/login`, `/register`)

**Layout:** Centered card on a minimal background.

- Card: `max-width: 420px`, `radius-xl`, `shadow-lg`
- Logo at top
- Form fields: Email, Password (+ Name for register)
- Primary CTA button full-width
- Divider "или" + OAuth button (optional)
- Toggle link: "Нет аккаунта? Зарегистрируйся" / "Уже есть аккаунт? Войти"
- Error state: input border → red, error text below

### 3.3 Dashboard (`/dashboard`)

**Layout:** Sidebar (collapsible) + main content.

**Sidebar:** Logo, navigation items with icons (Dashboard, Library, AI Chat, Profile), theme toggle at bottom, avatar + name at bottom.

**Main content:**

1. **Welcome header:** "Привет, {Name}!" + current streak badge (🔥 5 дней)
2. **Stats row:** 3 metric cards in a row — XP (with level progress bar), Tasks Completed, Current Streak. Each card has an icon, number, and label.
3. **Recent sessions table/list:** Columns: Topic, Score, Date, button to continue. Card-based rows with hover state.
4. **Quick actions:** "Продолжить практику" (primary) + "Начать новую тему" (secondary).

### 3.4 Library (`/library`)

**Layout:** Sidebar + main content.

**Top:** Search bar (full width, magnifying glass icon) + filter row (difficulty select, category tags).

**Grid:** 2–3 column card grid. Each topic card shows:

- Topic icon/emoji
- Title ("Core JS", "TypeScript", "Algorithms")
- Short description (1 line)
- Difficulty dots (●●●○○)
- Progress bar (percentage)
- "Начать" button

**Empty state:** Illustration + "Ничего не найдено" if filters match nothing.

### 3.5 Practice / Widget Page (`/practice/:topicId`)

**Layout:** Full content area, no sidebar.

**Top bar:** Breadcrumb (Tandem > Core JS > Closures), progress indicator (Question 3 of 10), Skip + Submit buttons.

**Widget area (center):** Renders dynamically based on type:

- **Quiz:** Question text → 4 option cards (vertical stack). Selected = indigo border + bg tint. After submit: correct = green, wrong = red, correct one highlighted. Explanation text below.
- **True/False:** Statement in a prominent card → two large buttons (True / False). Color feedback on selection.
- **Code Completion:** Code block with monospace font, highlighted blanks (underlined input fields inside code). Syntax highlighting for the static parts.

**Bottom:** "Следующий вопрос" button after answering.

**Results summary (after completing topic):** Score card with confetti animation if > 80%, breakdown of correct/wrong, "Вернуться в библиотеку" button.

### 3.6 AI Chat (`/ai-chat`)

**Layout:** Full-height chat interface (like ChatGPT/Telegram).

**Left panel (optional):** Session history list (past conversations, grouped by date).

**Chat area:**

- Messages alternate: user (right-aligned, indigo bg, white text) and AI (left-aligned, `bg-surface`, dark text).
- AI messages support **Markdown rendering** (code blocks with syntax highlighting, bold, lists).
- **Streaming effect:** Text appears character by character with a blinking cursor.
- Input bar at bottom: textarea (auto-growing), send button (indigo, arrow icon). Placeholder: "Задай вопрос по JS/TS..."
- "AI печатает..." indicator with animated dots during response.

**AI message extras:** Rating buttons (👍 / 👎), copy button for code blocks.

### 3.7 Profile (`/profile`)

- Avatar (circular, initials fallback)
- Name, email (editable)
- Stats summary (total XP, tasks completed, streak record)
- Language toggle (RU / EN)
- Theme toggle (Light / Dark)
- Logout button (danger variant)

---

## 4. Responsive Breakpoints

| Breakpoint | Width      | Layout changes                                                   |
| ---------- | ---------- | ---------------------------------------------------------------- |
| Mobile     | < 640px    | Sidebar → bottom tab bar, cards stack vertically, hamburger menu |
| Tablet     | 640–1024px | 2-column grid, sidebar collapsible                               |
| Desktop    | > 1024px   | Full layout with sidebar                                         |

---

## 5. Micro-interactions & Animations

| Element           | Animation                                                   |
| ----------------- | ----------------------------------------------------------- |
| Page transitions  | Fade-in (opacity 0→1, 200ms ease)                           |
| Card hover        | `translateY(-2px)`, `shadow-md`, border glow                |
| Button click      | `scale(0.97)` on active, `scale(1.02)` on hover             |
| Correct answer    | Green flash + checkmark icon pop-in (scale 0→1 with bounce) |
| Wrong answer      | Red shake (translateX ±4px, 300ms)                          |
| Progress bar fill | Width transition 600ms ease-out                             |
| Streak counter    | Number counter animation (counting up)                      |
| AI streaming      | Character appear with blinking cursor                       |
| Toast             | Slide in from right, fade out after 4s                      |
| Theme toggle      | Smooth transition on all colors (300ms)                     |
| Skeleton loader   | Pulse opacity 0.4→1.0, 1.5s infinite                        |

---

## 6. Generative AI Prompt (for Mockup Generation)

Use the following prompt with tools like Midjourney, DALL-E, Figma AI, or V0:

---

### Prompt: Dashboard Page

```
Design a modern web application dashboard for "Tandem Trainer" — a JavaScript/TypeScript interview preparation platform. Dark mode. Clean, minimal design inspired by GitHub, Linear, and Vercel aesthetics.

Layout: Left sidebar navigation (logo at top, nav items with icons: Dashboard, Library, AI Chat, Profile; theme toggle and user avatar at bottom). Main content area on the right.

Main content:
- Welcome header "Привет, Иван!" with a flame emoji streak badge "🔥 5 дней"
- Three stat cards in a row: "1,250 XP" with a level progress bar, "42 задания" with a checkmark icon, "5 дней streak" with a flame icon. Each card has a subtle indigo-to-violet gradient accent.
- Below: "Недавние сессии" section with a list of session cards showing topic name, score percentage with mini progress bar, date, and a continue arrow button.
- "Начать практику" primary button with indigo-violet gradient.

Color scheme: Dark background (#0D1117), surface cards (#161B22), indigo accent (#818CF8), violet secondary (#A78BFA), green for success (#34D399), subtle borders (#30363D).
Typography: Inter font, clean hierarchy.
Border radius: 16px for cards, 10px for buttons.
Subtle shadows and hover glow effects.

Style: Flat, modern SaaS dashboard. No 3D elements. High contrast text on dark background. 1440x900 viewport.
```

### Prompt: Landing Page

```
Design a landing page for "Tandem Trainer" — a modern JavaScript/TypeScript technical interview preparation web app. Light mode.

Hero section: Large heading "Подготовься к техническому интервью" with a subheading about interactive widgets and AI assistant. Prominent gradient button "Начать бесплатно" (indigo to violet gradient). Background has subtle floating code snippet decorations with low opacity. Clean, airy feel.

Below hero: Three feature cards in a row — "Интерактивные виджеты" (puzzle icon), "AI-интервьюер" (chat bubble icon), "Прогресс и статистика" (chart icon). Each card has an icon, title, and one-line description.

Header: Logo "Tandem" on the left, navigation links center, Login + Register buttons right. Sticky transparent header.

Color: White background (#FAFBFC), indigo primary (#6366F1), violet secondary (#8B5CF6), dark text (#111827).
Typography: Inter, bold headings, clean body text.
Style: Modern SaaS landing, inspired by Vercel and Linear. Minimal, professional, with subtle gradient accents. 1440x900 viewport.
```

### Prompt: Quiz Widget

```
Design an interactive quiz widget screen for a JavaScript learning app. Dark mode.

Top bar: Breadcrumb "Tandem > Core JS > Closures", progress indicator "Вопрос 3 из 10" with a thin progress bar, Skip and Submit buttons.

Center: Question card with text "Что вернёт typeof null?" in a clean card. Below: 4 answer option cards stacked vertically — "null", "undefined", "object", "NaN". The third option "object" is selected with an indigo border and light indigo tint background. Others have neutral borders.

After submit state: "object" card turns green with a checkmark. An explanation text appears below: "typeof null возвращает 'object' — это известный баг JavaScript с 1995 года".

Bottom: "Следующий вопрос" button (gradient, full width).

Dark background (#0D1117), card surfaces (#161B22), indigo selected state (#818CF8 border), green correct (#34D399), Inter font, 16px rounded cards. Modern, clean. 1440x900 viewport.
```

### Prompt: AI Chat

```
Design an AI chat interface for "Tandem Trainer" — a JavaScript interview preparation app. Dark mode. Full-height chat layout similar to ChatGPT.

Left panel: Narrow session history list with dates and conversation titles, scrollable.

Main chat area:
- User message (right-aligned, indigo/violet gradient background, white text, rounded bubble): "Объясни разницу между let и const"
- AI response (left-aligned, dark surface card, light text): Contains formatted text with a code block showing JavaScript examples with syntax highlighting. Text appears to be streaming with a blinking cursor at the end.
- "AI печатает..." indicator with animated dots.

Bottom: Text input bar with placeholder "Задай вопрос по JS/TS...", send button (indigo circle with arrow icon).

Dark theme (#0D1117 bg, #161B22 surfaces), indigo accent, JetBrains Mono for code blocks, Inter for text. Clean, modern messenger UI. 1440x900 viewport.
```
