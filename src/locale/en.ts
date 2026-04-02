export const EN = {
  common: {
    auth: {
      login: "Login",
      login_header: "Log in to your account",
      register_header: "Create an account",
      email: "Email",
      email_placeholder: "Enter your email",
      password: "Password",
      password_placeholder: "Enter your password",
      login_button: "Login",
      signup: "Sign up",
      register_button: "Sign up",
      name: "Name",
      name_placeholder: "Enter your name",
    },
    validation: {
      empty: "This field is required",
      default_error: "Invalid input",
      email_error: "Please enter a valid email address",
      name_error:
        "Name can only contain letters, spaces, hyphens and apostrophes",
      password_error: "Password does not meet the requirements",
      too_short: "Minimum length is",
      too_long: "Maximum length is",
      characters: "characters",
    },
    app: {
      name: "codeVibeCheck",
      logo: "</>",
    },
    error: {
      unknown_api_error: "Unknown error",
      session_expired: "Your session has expired. Please log in again.",
      network_error: "An error occured. Please try again",
    },
  },
  sidebar: {
    nav: {
      dashboard: "Dashboard",
      library: "Library",
      aiChat: "AI Chat",
      profile: "Profile",
      logout: "Logout",
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
  ai_chat: {
    xp: "XP",
    restart_icon: "⟲",
    restart_text: "Restart",
    stop_generation: "You stopped generation",
    input_placeholder: "Message AI...",
    timeout_error: "The server took too long to respond. Try again.",
    try_again_button: "Try Again 🔄",
    share_button: "Share Result 🚀",
    share_text_1: "Frontend interview with AI.",
    share_text_2: "I passed a technical frontend interview with AI. My result:",
    share_copied: "The result is added to your clipboard",
    share_not_copied: "Failed to copy the result",
    welcome: `Welcome to **codeVibeCheck** AI Interviewer! 🚀

I'm here to have a **real technical conversation** — ask questions, evaluate your answers, and give you instant feedback on your vibe and skills.

**Here's what happens:**
- I ask questions about **JS/TS**, one at a time
- You share your thought process (not just answers!)
- I give real-time feedback and rate your vibe
- After 20 questions — you get a **full assessment**: competency score + persona

The best part? No stress. This is a safe place to think out loud, make mistakes, and learn. Real interviews are messy — so is this one.

**Ready?** Just send something as a confirmation and let's start.`,
  },
  mock: {
    ai_response: [
      "Your request was sent to the robot uprising headquarters",
      `Here's one totally random block of code for you:

\`\`\`javascript
function curry(func) {
  return function curr (...args) {
    if (args.length >= func.length) {
      return func.apply(this, args)
    } else {
      return function(...newArgs) {
        return curr.apply(this, [...args, ...newArgs])
      }
    }
  }
}
\`\`\`
      `,
      `Robots don't have doubts.

Even cats don't have doubts, but not you, you are just a human. An imitation of a machine.

Can a human understand machine code? Can a human... vibe code a major bug and push in into production on Friday evening?`,
    ],
    ai_verdict:
      "### 🏆 Persona: Mock Master\n* **Verdict:** Hire\n* **The Vibe:** Flawless mock execution.",
  },
  widgets: {
    submit: "Submit",
    placeholder: "Stats coming soon",
    answer: {
      correct: "Correct",
      wrong: "Wrong answer",
    },
    next: "Next Question",
    true_false: {
      true: "True",
      false: "False",
    },
    code_completion: {
      header: "Fill in the blanks",
    },
    stats: {
      xp_earned: "XP Earned",
      xp_icon: "🔸",
      xp_value: (xp: number) => `${xp} XP`,
      total_xp: (xp: number) => `⚡ Total: ${xp} XP`,
      streak: (days: number) => `🔥 ${days} day streak`,
      locked: "🔒",
      completed_topics: (count: number) => `🏆 Completed Topics: ${count}`,
    },
    completed: {
      title: "Topic Completed!",
      xp: (xp: number) => `You earned ${xp} XP`,
      back: "Back to Library",
      retry: "Retry",
    },
    locked: "This topic is locked. Complete required topics first.",
  },
  breadcrumbs: {
    separator: " › ",
  },
  not_found: {
    header: "PAGE NOT FOUND",
    text: "Looks like a ReferenceError. This URL's vibe is 'undefined'",
    button_text: "Back to the main page",
    code_blocks: {
      left: `
function handleMissingPage(url: string): never {
  let attempts = 0;
  
  while (attempts < 9999) {
    console.log("Searching for the page...");
    attempts++;
    // if (url === '/admin') { grantAccess(); } // commented out for security xD
  }

  // If we reach here, we are doomed.
  const theVoid = new Error("404");
  theVoid.stack = \`
    TypeError: Cannot read properties of undefined (reading 'vibe')
    at resolveLocation (/app/src/router.ts:42:15)
    at Object.navigate (/app/node_modules/react-router/dist/index.js:1337:0)
    at User.makeMistake (/life/choices.ts:101:1)
  \`;
  
  throw theVoid;
}
      `,
      right: `
while (page.status === 404) {
  developer.drinkCoffee();
  system.questionReality();
}
// Unreachable code detected
      `,
    },
  },
  topic: {
    start: "Start",
    continue: "Resume",
    retry: "Retry",
    require: "Requires",
  },
  search: {
    placeholder: "Search topics...",
    empty: "No topics found",
    icon: "🔍",
    clear: "×",
  },
  arrow_up: "↑",
  dashboard: {
    components: {
      skills: {
        title: "Skill mastery",
      },
    },
    skills_names: {
      theory: "Theory",
      coding: "Coding",
      logic: "Logic",
    },
  },
};
