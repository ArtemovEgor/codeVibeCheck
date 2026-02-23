export const EN = {
  common: {
    auth: {
      login: "Login",
      signup: "Sign up",
    },
    app: {
      name: "codeVibeCheck",
      logo: "</>",
    },
  },
  landing: {
    hero: {
      title: {
        start: "Master ",
        js: "JS",
        divider: "/",
        ts: "TS",
        end: " Interviews with AI",
      },
      subtitle:
        "Interactive widgets and AI-powered feedback to boost your technical skills.",
      examples: {
        first: "const sum = (a, b) => a + b;",
        second: "type User = { id: string }",
      },
    },
    features: {
      title: "Everything you need to succeed",
      items: [
        {
          icon: "chat",
          title: "Interactive Widgets",
          desc: "Quiz, True/False, Code Ordering, and other tasks with instant verification.",
        },
        {
          icon: "code",
          title: "AI Interviewer",
          desc: "Asks questions, evaluates answers, and gives detailed feedback like a Senior developer.",
        },
        {
          icon: "stats",
          title: "Progress Tracking",
          desc: "XP, streaks, and session history — see your growth every single day.",
        },
      ],
    },
    cta: {
      title: "Ready to level up your vibe?",
      subtitle: "Free. No limits. Start your journey right now.",
      button: "Get Started Now",
    },
  },
} as const;
