import type { Widget } from "@/types/shared/widget.types";

export const MOCK_WIDGETS: Widget[] = [
  // ── Core JavaScript ───────────────────────────────────────────────────────────

  {
    id: "quiz-001",
    type: "quiz",
    version: 1,
    difficulty: 1,
    tags: ["typeof", "basics"],
    payload: {
      question: {
        ru: "Что вернет typeof null?",
        en: "What does typeof null return?",
      },
      options: [
        { ru: "null", en: "null" },
        { ru: "undefined", en: "undefined" },
        { ru: "object", en: "object" },
        { ru: "NaN", en: "NaN" },
      ],
      correctIndex: 2,
    },
  },
  {
    id: "tf-001",
    type: "true-false",
    version: 1,
    difficulty: 1,
    tags: ["equality", "basics"],
    payload: {
      statement: {
        ru: "=== проверяет значение и тип, а == только значение",
        en: "=== checks value and type, while == checks only value",
      },
      explanation: {
        ru: "Верно. === это строгое равенство без приведения типов. == допускает приведение: '1' == 1 вернёт true",
        en: "Correct. === is strict equality with no type coercion. == allows coercion: '1' == 1 returns true",
      },
      correctValue: true,
    },
  },
  {
    id: "quiz-002",
    type: "quiz",
    version: 1,
    difficulty: 1,
    tags: ["array", "basics"],
    payload: {
      question: {
        ru: "Какой метод добавляет элемент в конец массива?",
        en: "Which method adds an element to the end of an array?",
      },
      options: [
        { ru: "push()", en: "push()" },
        { ru: "pop()", en: "pop()" },
        { ru: "shift()", en: "shift()" },
        { ru: "unshift()", en: "unshift()" },
      ],
      correctIndex: 0,
    },
  },
  {
    id: "tf-002",
    type: "true-false",
    version: 1,
    difficulty: 1,
    tags: ["hoisting", "basics"],
    payload: {
      statement: {
        ru: "Переменные объявленные через let поднимаются (hoisting) так же как var",
        en: "Variables declared with let are hoisted the same way as var",
      },
      explanation: {
        ru: "Неверно. let тоже поднимается, но не инициализируется. Обращение до объявления вызывает ReferenceError (temporal dead zone)",
        en: "False. let is hoisted but not initialized. Accessing it before declaration causes a ReferenceError (temporal dead zone)",
      },
      correctValue: false,
    },
  },
  {
    id: "quiz-003",
    type: "quiz",
    version: 1,
    difficulty: 1,
    tags: ["scope", "basics"],
    payload: {
      question: {
        ru: "Какой будет результат?\nconsole.log(typeof undeclaredVar)",
        en: "What is the result?\nconsole.log(typeof undeclaredVar)",
      },
      options: [
        { ru: "ReferenceError", en: "ReferenceError" },
        { ru: "null", en: "null" },
        { ru: "undefined", en: "undefined" },
        { ru: "NaN", en: "NaN" },
      ],
      correctIndex: 2,
    },
  },

  // ── Async / Await ─────────────────────────────────────────────────────────────

  {
    id: "quiz-004",
    type: "quiz",
    version: 1,
    difficulty: 2,
    tags: ["promises", "async"],
    payload: {
      question: {
        ru: "Что вернёт функция если забыть await?\nasync function getData() {\n  return fetch('/api');\n}",
        en: "What will the function return if you forget await?\nasync function getData() {\n  return fetch('/api');\n}",
      },
      options: [
        { ru: "Данные с сервера", en: "Data from server" },
        { ru: "Promise<Response>", en: "Promise<Response>" },
        { ru: "undefined", en: "undefined" },
        { ru: "Response", en: "Response" },
      ],
      correctIndex: 1,
    },
  },
  {
    id: "tf-003",
    type: "true-false",
    version: 1,
    difficulty: 1,
    tags: ["promises", "async"],
    payload: {
      statement: {
        ru: "Promise.all() возвращает результаты в порядке завершения промисов",
        en: "Promise.all() returns results in order of promise completion",
      },
      explanation: {
        ru: "Неверно. Promise.all() сохраняет порядок входного массива независимо от времени выполнения",
        en: "False. Promise.all() preserves input array order regardless of completion time",
      },
      correctValue: false,
    },
  },
  {
    id: "quiz-005",
    type: "quiz",
    version: 1,
    difficulty: 2,
    tags: ["async", "error-handling"],
    payload: {
      question: {
        ru: "Как правильно обработать ошибку в async/await?",
        en: "How do you properly handle errors in async/await?",
      },
      options: [
        { ru: "try/catch вокруг await", en: "try/catch around await" },
        { ru: ".catch() после вызова", en: ".catch() after the call" },
        { ru: "Оба варианта верны", en: "Both are correct" },
        { ru: "Никак, ошибки не возникают", en: "No way, errors don't occur" },
      ],
      correctIndex: 2,
    },
  },
  {
    id: "tf-004",
    type: "true-false",
    version: 1,
    difficulty: 2,
    tags: ["async", "event-loop"],
    payload: {
      statement: {
        ru: "async/await блокирует главный поток выполнения",
        en: "async/await blocks the main execution thread",
      },
      explanation: {
        ru: "Неверно. async/await это синтаксический сахар над Promise. Код после await помещается в микротаск очередь и не блокирует поток",
        en: "False. async/await is syntactic sugar over Promise. Code after await is placed in the microtask queue and doesn't block the thread",
      },
      correctValue: false,
    },
  },

  // ── TypeScript Basics ─────────────────────────────────────────────────────────

  {
    id: "quiz-006",
    type: "quiz",
    version: 1,
    difficulty: 1,
    tags: ["typescript", "types"],
    payload: {
      question: {
        ru: "Какой тип описывает значение которое может быть string или number?",
        en: "Which type describes a value that can be string or number?",
      },
      options: [
        { ru: "string & number", en: "string & number" },
        { ru: "string | number", en: "string | number" },
        { ru: "string + number", en: "string + number" },
        { ru: "union<string, number>", en: "union<string, number>" },
      ],
      correctIndex: 1,
    },
  },
  {
    id: "tf-005",
    type: "true-false",
    version: 1,
    difficulty: 1,
    tags: ["typescript", "basics"],
    payload: {
      statement: {
        ru: "В TypeScript тип any отключает проверку типов для переменной",
        en: "In TypeScript, the any type disables type checking for a variable",
      },
      explanation: {
        ru: "Верно. any говорит TypeScript не проверять тип. Это escape hatch — использовать только в крайнем случае",
        en: "Correct. any tells TypeScript to skip type checking. It's an escape hatch — use only as a last resort",
      },
      correctValue: true,
    },
  },
  {
    id: "quiz-007",
    type: "quiz",
    version: 1,
    difficulty: 2,
    tags: ["typescript", "interfaces"],
    payload: {
      question: {
        ru: "В чём основное отличие interface от type в TypeScript?",
        en: "What is the main difference between interface and type in TypeScript?",
      },
      options: [
        {
          ru: "interface быстрее компилируется",
          en: "interface compiles faster",
        },
        {
          ru: "interface поддерживает declaration merging",
          en: "interface supports declaration merging",
        },
        {
          ru: "type поддерживает наследование",
          en: "type supports inheritance",
        },
        { ru: "Нет никакой разницы", en: "There is no difference" },
      ],
      correctIndex: 1,
    },
  },

  // ── Closures & Scope ──────────────────────────────────────────────────────────

  {
    id: "quiz-008",
    type: "quiz",
    version: 1,
    difficulty: 2,
    tags: ["closures", "scope"],
    payload: {
      question: {
        ru: "Что выведет код?\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0)\n}",
        en: "What will this output?\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0)\n}",
      },
      options: [
        { ru: "0, 1, 2", en: "0, 1, 2" },
        { ru: "3, 3, 3", en: "3, 3, 3" },
        { ru: "1, 2, 3", en: "1, 2, 3" },
        { ru: "undefined", en: "undefined" },
      ],
      correctIndex: 1,
    },
  },
  {
    id: "tf-006",
    type: "true-false",
    version: 1,
    difficulty: 2,
    tags: ["closures"],
    payload: {
      statement: {
        ru: "Замыкание имеет доступ к переменным внешней функции даже после её завершения",
        en: "A closure has access to outer function variables even after the function has returned",
      },
      explanation: {
        ru: "Верно. Замыкание сохраняет ссылку на область видимости внешней функции, а не копию значений",
        en: "Correct. A closure retains a reference to the outer function's scope, not a copy of the values",
      },
      correctValue: true,
    },
  },
  {
    id: "quiz-009",
    type: "quiz",
    version: 1,
    difficulty: 2,
    tags: ["closures", "scope"],
    payload: {
      question: {
        ru: "Как исправить проблему с var в цикле и setTimeout?",
        en: "How do you fix the var-in-loop problem with setTimeout?",
      },
      options: [
        { ru: "Заменить var на let", en: "Replace var with let" },
        { ru: "Использовать IIFE", en: "Use an IIFE" },
        { ru: "Оба варианта верны", en: "Both are correct" },
        { ru: "Использовать const", en: "Use const" },
      ],
      correctIndex: 2,
    },
  },

  // ── Array Methods ─────────────────────────────────────────────────────────────

  {
    id: "quiz-010",
    type: "quiz",
    version: 1,
    difficulty: 1,
    tags: ["array-methods", "basics"],
    payload: {
      question: {
        ru: "Какой метод создаёт новый массив с результатами вызова функции для каждого элемента?",
        en: "Which method creates a new array with the results of calling a function on every element?",
      },
      options: [
        { ru: "forEach()", en: "forEach()" },
        { ru: "filter()", en: "filter()" },
        { ru: "map()", en: "map()" },
        { ru: "reduce()", en: "reduce()" },
      ],
      correctIndex: 2,
    },
  },
  {
    id: "tf-007",
    type: "true-false",
    version: 1,
    difficulty: 1,
    tags: ["array-methods"],
    payload: {
      statement: {
        ru: "forEach() возвращает новый массив",
        en: "forEach() returns a new array",
      },
      explanation: {
        ru: "Неверно. forEach() всегда возвращает undefined. Для создания нового массива используйте map()",
        en: "False. forEach() always returns undefined. Use map() to create a new array",
      },
      correctValue: false,
    },
  },
  {
    id: "quiz-011",
    type: "quiz",
    version: 1,
    difficulty: 2,
    tags: ["array-methods", "reduce"],
    payload: {
      question: {
        ru: "Что вернёт код?\n[1, 2, 3].reduce((acc, n) => acc + n, 0)",
        en: "What will this return?\n[1, 2, 3].reduce((acc, n) => acc + n, 0)",
      },
      options: [
        { ru: "[1, 2, 3]", en: "[1, 2, 3]" },
        { ru: "0", en: "0" },
        { ru: "6", en: "6" },
        { ru: "NaN", en: "NaN" },
      ],
      correctIndex: 2,
    },
  },
];

// ── Topics ────────────────────────────────────────────────────────────────────
// requiredTopicIds: [] — тема всегда открыта
// requiredTopicIds: ["core-js"] — открывается после прохождения Core JS

export const MOCK_TOPICS = [
  {
    id: "core-js",
    title: { ru: "Core JavaScript", en: "Core JavaScript" },
    description: {
      ru: "Основы JavaScript: типы данных, операторы, области видимости",
      en: "JavaScript fundamentals: data types, operators, scope",
    },
    difficulty: 1,
    requiredTopicIds: [],
    widgetIds: ["quiz-001", "tf-001", "quiz-002", "tf-002", "quiz-003"],
  },
  {
    id: "async",
    title: { ru: "Async / Await", en: "Async / Await" },
    description: {
      ru: "Асинхронный JavaScript: Promise, async/await, обработка ошибок",
      en: "Asynchronous JavaScript: Promise, async/await, error handling",
    },
    difficulty: 2,
    requiredTopicIds: ["core-js"],
    widgetIds: ["quiz-004", "tf-003", "quiz-005", "tf-004"],
  },
  {
    id: "typescript",
    title: { ru: "TypeScript Basics", en: "TypeScript Basics" },
    description: {
      ru: "Основы TypeScript: типы, интерфейсы, утилитарные типы",
      en: "TypeScript fundamentals: types, interfaces, utility types",
    },
    difficulty: 1,
    requiredTopicIds: ["core-js"],
    widgetIds: ["quiz-006", "tf-005", "quiz-007"],
  },
  {
    id: "closures",
    title: { ru: "Замыкания и Scope", en: "Closures & Scope" },
    description: {
      ru: "Замыкания, лексическое окружение, практические паттерны",
      en: "Closures, lexical environment, practical patterns",
    },
    difficulty: 2,
    requiredTopicIds: ["core-js", "async"],
    widgetIds: ["quiz-008", "tf-006", "quiz-009"],
  },
  {
    id: "array-methods",
    title: { ru: "Array Methods", en: "Array Methods" },
    description: {
      ru: "map, filter, reduce и другие методы массивов",
      en: "map, filter, reduce and other array methods",
    },
    difficulty: 1,
    requiredTopicIds: ["core-js"],
    widgetIds: ["quiz-010", "tf-007", "quiz-011"],
  },
];
