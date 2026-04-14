# codeVibeCheck

codeVibeCheck is an interactive training simulator for technical interview preparation, including quizzes, and technical assignments.

Created as a final assignment of the RS-School Frontend course.

## Local Setup

### Prerequisites

- Node.js 18+
- npm

### Frontend

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/ArtemovEgor/codeVibeCheck.git
cd codeVibeCheck
npm install
```

2. Create a `.env` file in the project root (or edit the existing one):

```env
VITE_API_MODE=real        # "mock" or "real"
VITE_MOCK_DELAY=300       # mock network delay in ms
VITE_API_URL=http://localhost:3001
PORT=3000
```

3. Start the dev server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Backend

1. Go to the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

2. Create a `.env` file inside `backend/`:

```env
PORT=3001
JWT_SECRET=your-secret-key
GROQ_API_KEY=your-groq-api-key   # get it at https://console.groq.com
```

3. Start the backend server:

```bash
npm start
```

The API will be available at `http://localhost:3001`.

> **Note:** The AI Interviewer feature requires a valid `GROQ_API_KEY`. Set `VITE_API_MODE=mock` in the frontend `.env` to run without a real backend.

---

## What We Are Proud Of

We built more than just a quiz app — a full educational platform with a custom **Widget Engine** that supports various interactive task types.  
We are proud of our **AI Interviewer**: a real-time streaming chat powered by the **Groq API** that conducts technical interviews, evaluates answers with XP scoring, and generates a comprehensive performance report.  
Special attention was given to the architecture: we implemented a **transparent Mock/Real API switching** layer, a robust **localization system (EN/RU)**, and a sophisticated **progress tracking** system.
Under the hood: a handwritten **Node.js + Express** server using **JWT + bcrypt** for secure authentication and **SQLite** for reliable data persistence.

## Deploy

[https://artemovegor.github.io/codeVibeCheck/](https://artemovegor.github.io/codeVibeCheck/)

## Project board

[https://github.com/users/ArtemovEgor/projects/2](https://github.com/users/ArtemovEgor/projects/2) ([screenshot](https://i.imgur.com/9FxGsbd.png))

## Project team and their development notes

- [Alexander Akatov](https://github.com/Al-E-xXx), [development notes](https://github.com/ArtemovEgor/codeVibeCheck/tree/main/development-notes/Al-E-xXx)
- [Kateryna Volkova](https://github.com/EkaterynaVolkova), [development notes](https://github.com/ArtemovEgor/codeVibeCheck/tree/main/development-notes/ekaterynavolkova)
- [Egor Artemov](https://github.com/ArtemovEgor), [development notes](https://github.com/ArtemovEgor/codeVibeCheck/tree/main/development-notes/ArtemovEgor)

## [Meeting notes](https://github.com/ArtemovEgor/codeVibeCheck/tree/development-notes/meeting-notes)

- [17.02.2026](https://github.com/ArtemovEgor/codeVibeCheck/blob/development-notes/meeting-notes/meeting-2026-02-17.md)
- [19.02.2026](https://github.com/ArtemovEgor/codeVibeCheck/blob/development-notes/meeting-notes/meeting-2026-02-19.md)
- [26.02.2026](https://github.com/ArtemovEgor/codeVibeCheck/blob/development-notes/meeting-notes/meeting-2026-02-26.md)
- [30.03.2026](https://github.com/ArtemovEgor/codeVibeCheck/blob/development-notes/meeting-notes/meeting-2026-03-30.md)

## Best PRs

- [https://github.com/ArtemovEgor/codeVibeCheck/pull/7](https://github.com/ArtemovEgor/codeVibeCheck/pull/7)
- [https://github.com/ArtemovEgor/codeVibeCheck/pull/44](https://github.com/ArtemovEgor/codeVibeCheck/pull/44)
- [https://github.com/ArtemovEgor/codeVibeCheck/pull/23](https://github.com/ArtemovEgor/codeVibeCheck/pull/23)
- [https://github.com/ArtemovEgor/codeVibeCheck/pull/55](https://github.com/ArtemovEgor/codeVibeCheck/pull/55)
- [https://github.com/ArtemovEgor/codeVibeCheck/pull/94](https://github.com/ArtemovEgor/codeVibeCheck/pull/94)
  https://github.com/ArtemovEgor/codeVibeCheck/pull/55

## Demo video

[https://youtu.be/Aj5yeFkZrQo](https://youtu.be/Aj5yeFkZrQo)

## Checkpoint 5 video

[https://youtu.be/mbapDcRV8bA](https://youtu.be/mbapDcRV8bA)
