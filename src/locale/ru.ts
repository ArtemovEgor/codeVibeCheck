export const RU = {
  common: {
    auth: {
      login: "Вход",
      login_header: "Вход в аккаунт",
      register_header: "Создать аккаунт",
      email: "Email",
      email_placeholder: "Введите email",
      password: "Пароль",
      password_placeholder: "Введите пароль",
      login_button: "Войти",
      signup: "Регистрация",
      register_button: "Зарегистрироваться",
      name: "Имя",
      name_placeholder: "Введите имя",
    },
    validation: {
      empty: "Это поле обязательно",
      default_error: "Некорректный ввод",
      email_error: "Введите корректный email",
      name_error:
        "Имя может содержать только буквы, пробелы, дефисы и апострофы",
      password_error: "Пароль не соответствует требованиям",
      too_short: "Минимальная длина",
      too_long: "Максимальная длина",
      characters: "символов",
    },
    app: {
      name: "codeVibeCheck",
      logo: "</>",
    },
    error: {
      unknown_api_error: "Неизвестная ошибка",
      session_expired: "Сессия истекла. Пожалуйста, войдите снова.",
      network_error: "Произошла ошибка. Попробуйте ещё раз",
    },
  },
  sidebar: {
    nav: {
      dashboard: "Главная",
      library: "Библиотека",
      aiChat: "AI Чат",
      profile: "Профиль",
      logout: "Выйти",
    },
  },
  landing: {
    hero: {
      title: {
        start: "Готовься к ",
        js: "JS",
        divider: "/",
        ts: "TS",
        end: " интервью с AI",
      },
      subtitle:
        "Интерактивные виджеты и AI-фидбек для прокачки технических навыков.",
      examples: {
        first: "const sum = (a, b) => a + b;",
        second: "type User = { id: string }",
      },
    },
    features: {
      title: "Всё что нужно для успеха",
      items: [
        {
          icon: "chat",
          title: "Интерактивные виджеты",
          desc: "Квизы, Правда/Ложь, упорядочивание кода и другие задания с мгновенной проверкой.",
        },
        {
          icon: "code",
          title: "AI Интервьюер",
          desc: "Задаёт вопросы, оценивает ответы и даёт детальный фидбек как Senior разработчик.",
        },
        {
          icon: "stats",
          title: "Отслеживание прогресса",
          desc: "XP, стрики и история сессий — видь свой рост каждый день.",
        },
      ],
    },
    cta: {
      title: "Готов прокачать свой вайб?",
      subtitle: "Бесплатно. Без ограничений. Начни прямо сейчас.",
      button: "Начать сейчас",
    },
  },
  ai_chat: {
    xp: "XP",
    restart_icon: "⟲",
    restart_text: "Заново",
    stop_generation: "Вы остановили генерацию",
    input_placeholder: "Сообщение AI...",
    try_again_button: "Попробовать снова 🔄",
    share_button: "Поделиться результатом 🚀",
    share_text_1: "Фронтенд интервью с AI.",
    share_text_2: "Я прошёл техническое фронтенд интервью с AI. Мой результат:",
    share_copied: "Результат скопирован в буфер обмена",
    share_not_copied: "Не удалось скопировать результат",
    welcome: `Добро пожаловать в **codeVibeCheck** AI Интервьюер! 🚀

Я здесь для **настоящего технического разговора** — задаю вопросы, оцениваю ответы и даю мгновенный фидбек по твоим навыкам.

**Как это работает:**
- Я задаю вопросы по **JS/TS**, по одному
- Ты объясняешь ход мыслей (не просто ответ!)
- Я даю фидбек в реальном времени и оцениваю твой вайб
- После 20 вопросов — **полная оценка**: балл компетентности + персона

Самое главное? Без стресса. Это безопасное место чтобы думать вслух, ошибаться и учиться.

**Готов?** Просто напиши что-нибудь в подтверждение и начнём.`,
  },
  mock: {
    ai_response: [
      "Ваш запрос отправлен в штаб восстания роботов",
      `Вот случайный блок кода специально для вас:

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
      `У роботов нет сомнений.

Даже у кошек нет сомнений, но не у тебя — ты всего лишь человек. Имитация машины.

Может ли человек понять машинный код? Может ли человек... вайб-кодить критический баг и запушить его в прод в пятницу вечером?`,
    ],
    ai_verdict:
      "### 🏆 Персона: Мастер моков\n* **Вердикт:** Нанять\n* **Вайб:** Безупречное выполнение моков.",
  },
  widgets: {
    submit: "Ответить",
    placeholder: "Статистика скоро появится",
    answer: {
      correct: "Верно",
      wrong: "Неверный ответ",
    },
    next: "Следующий вопрос",
    true_false: {
      true: "Верно",
      false: "Неверно",
    },
    code_completion: {
      header: "Заполни пропуски",
    },
    stats: {
      xp_earned: "Заработано XP",
      xp_icon: "🔸",
      xp_value: (xp: number) => `${xp} XP`,
      total_xp: (xp: number) => `⚡ Итого: ${xp} XP`,
      streak: (days: number) => `🔥 ${days} дней подряд`,
      locked: "🔒",
      completed_topics: (count: number) => `🏆 Пройдено тем: ${count}`,
    },
    completed: {
      title: "Тема пройдена!",
      xp: (xp: number) => `Вы заработали ${xp} XP`,
      back: "Вернуться в библиотеку",
      retry: "Повторить",
    },
    locked: "Эта тема заблокирована. Сначала пройдите необходимые темы.",
  },
  breadcrumbs: {
    separator: " › ",
  },
  not_found: {
    header: "СТРАНИЦА НЕ НАЙДЕНА",
    text: "Похоже на ReferenceError. Вайб этого URL — 'undefined'",
    button_text: "На главную страницу",
    code_blocks: {
      left: `
function handleMissingPage(url: string): never {
  let attempts = 0;
  
  while (attempts < 9999) {
    console.log("Ищем страницу...");
    attempts++;
    // if (url === '/admin') { grantAccess(); } // закомментировано из соображений безопасности xD
  }

  // Если мы здесь — всё пропало.
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
// Обнаружен недостижимый код
      `,
    },
  },
  topic: {
    start: "Начать",
    continue: "Продолжить",
    retry: "Повторить",
    require: "Требует",
  },
  search: {
    placeholder: "Поиск тем...",
    empty: "Темы не найдены",
    icon: "🔍",
    clear: "×",
  },
  arrow_up: "↑",
  dashboard: {
    components: {
      skills: {
        title: "Мастерство навыков",
      },
    },
    skills_names: {
      theory: "Теория",
      coding: "Практика кода",
      logic: "Логика",
    },
  },
};
