import type { Widget, ITopic } from "@/types/shared/widget.types";

// ── Widgets ───────────────────────────────────────────────────────────────────

export const MOCK_WIDGETS: Widget[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOPIC: core-js
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    id: "core-quiz-001",
    type: "quiz",
    version: 1,
    difficulty: 1,
    tags: ["typeof", "basics"],
    payload: {
      question: {
        ru: "Что вернёт typeof null?",
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
    id: "core-quiz-002",
    type: "quiz",
    version: 1,
    difficulty: 1,
    tags: ["equality", "basics"],
    payload: {
      question: {
        ru: "Что вернёт 0 == '0'?",
        en: "What does 0 == '0' return?",
      },
      options: [
        { ru: "false", en: "false" },
        { ru: "true", en: "true" },
        { ru: "undefined", en: "undefined" },
        { ru: "TypeError", en: "TypeError" },
      ],
      correctIndex: 1,
    },
  },
  {
    id: "core-tf-001",
    type: "true-false",
    version: 1,
    difficulty: 1,
    tags: ["hoisting", "basics"],
    payload: {
      statement: {
        ru: "Переменные объявленные через let поднимаются так же как var",
        en: "Variables declared with let are hoisted the same way as var",
      },
      explanation: {
        ru: "Неверно. let поднимается но не инициализируется. Доступ до объявления вызывает ReferenceError — Temporal Dead Zone",
        en: "False. let is hoisted but not initialized. Accessing it before declaration throws ReferenceError — Temporal Dead Zone",
      },
      correctValue: false,
    },
  },
  {
    id: "core-tf-002",
    type: "true-false",
    version: 1,
    difficulty: 1,
    tags: ["scope", "basics"],
    payload: {
      statement: {
        ru: "var имеет блочную область видимости",
        en: "var has block scope",
      },
      explanation: {
        ru: "Неверно. var имеет функциональную область видимости. let и const — блочную",
        en: "False. var has function scope. let and const have block scope",
      },
      correctValue: false,
    },
  },
  {
    id: "core-cc-001",
    type: "code-completion",
    version: 1,
    difficulty: 1,
    tags: ["array", "basics"],
    payload: {
      code: "const doubled = [1, 2, 3].___(x => x * 2);",
      hints: [
        {
          ru: "Метод возвращает новый массив с результатами вызова функции для каждого элемента",
          en: "Method returns a new array with the results of calling a function on every element",
        },
      ],
      correctValues: ["map"],
    },
  },
  {
    id: "core-cc-002",
    type: "code-completion",
    version: 1,
    difficulty: 1,
    tags: ["string", "basics"],
    payload: {
      code: 'const upper = "hello".___;',
      hints: [
        {
          ru: "Метод преобразует все символы строки в верхний регистр",
          en: "Method that converts all characters to uppercase",
        },
      ],
      correctValues: ["toUpperCase()"],
    },
  },
  {
    id: "core-co-001",
    type: "code-ordering",
    version: 1,
    difficulty: 1,
    tags: ["functions", "basics"],
    payload: {
      description: {
        ru: "Расставь строки чтобы получилась функция которая возвращает сумму двух чисел",
        en: "Arrange the lines to create a function that returns the sum of two numbers",
      },
      lines: ["return a + b;", "function sum(a, b) {", "}"],
      correctOrder: [1, 0, 2],
    },
  },
  {
    id: "core-co-002",
    type: "code-ordering",
    version: 1,
    difficulty: 1,
    tags: ["variables", "basics"],
    payload: {
      description: {
        ru: "Расставь строки чтобы создать массив и вывести его длину",
        en: "Arrange the lines to create an array and log its length",
      },
      lines: ["console.log(arr.length);", "const arr = [1, 2, 3];"],
      correctOrder: [1, 0],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOPIC: array-methods
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    id: "arr-quiz-001",
    type: "quiz",
    version: 1,
    difficulty: 1,
    tags: ["array-methods", "filter"],
    payload: {
      question: {
        ru: "Что вернёт [1, 2, 3, 4].filter(x => x % 2 === 0)?",
        en: "What will [1, 2, 3, 4].filter(x => x % 2 === 0) return?",
      },
      options: [
        { ru: "[1, 3]", en: "[1, 3]" },
        { ru: "[2, 4]", en: "[2, 4]" },
        { ru: "true", en: "true" },
        { ru: "[1, 2, 3, 4]", en: "[1, 2, 3, 4]" },
      ],
      correctIndex: 1,
    },
  },
  {
    id: "arr-quiz-002",
    type: "quiz",
    version: 1,
    difficulty: 2,
    tags: ["array-methods", "reduce"],
    payload: {
      question: {
        ru: "Что вернёт [1, 2, 3, 4].reduce((acc, x) => acc + x, 0)?",
        en: "What will [1, 2, 3, 4].reduce((acc, x) => acc + x, 0) return?",
      },
      options: [
        { ru: "[1, 2, 3, 4]", en: "[1, 2, 3, 4]" },
        { ru: "0", en: "0" },
        { ru: "10", en: "10" },
        { ru: "4", en: "4" },
      ],
      correctIndex: 2,
    },
  },
  {
    id: "arr-tf-001",
    type: "true-false",
    version: 1,
    difficulty: 1,
    tags: ["array-methods", "mutation"],
    payload: {
      statement: {
        ru: "Метод map() изменяет исходный массив",
        en: "The map() method mutates the original array",
      },
      explanation: {
        ru: "Неверно. map() возвращает новый массив не изменяя исходный. Методы которые изменяют массив: push(), pop(), splice(), sort()",
        en: "False. map() returns a new array without mutating the original. Mutating methods: push(), pop(), splice(), sort()",
      },
      correctValue: false,
    },
  },
  {
    id: "arr-tf-002",
    type: "true-false",
    version: 1,
    difficulty: 2,
    tags: ["array-methods", "find"],
    payload: {
      statement: {
        ru: "filter() и find() возвращают одинаковый результат",
        en: "filter() and find() return the same result",
      },
      explanation: {
        ru: "Неверно. filter() возвращает массив всех совпадений. find() возвращает только первый элемент или undefined",
        en: "False. filter() returns an array of all matches. find() returns only the first match or undefined",
      },
      correctValue: false,
    },
  },
  {
    id: "arr-cc-001",
    type: "code-completion",
    version: 1,
    difficulty: 1,
    tags: ["array-methods", "filter"],
    payload: {
      code: "const evens = [1, 2, 3, 4].___(x => x % 2 === 0);",
      hints: [
        {
          ru: "Метод возвращает новый массив с элементами прошедшими проверку",
          en: "Method returns a new array with elements that pass the test",
        },
      ],
      correctValues: ["filter"],
    },
  },
  {
    id: "arr-cc-002",
    type: "code-completion",
    version: 1,
    difficulty: 2,
    tags: ["array-methods", "reduce"],
    payload: {
      code: "const sum = [1, 2, 3].___((acc, x) => acc + x, 0);",
      hints: [
        {
          ru: "Метод сворачивающий массив в одно значение",
          en: "Method that reduces the array to a single value",
        },
      ],
      correctValues: ["reduce"],
    },
  },
  {
    id: "arr-co-001",
    type: "code-ordering",
    version: 1,
    difficulty: 1,
    tags: ["array-methods", "map"],
    payload: {
      description: {
        ru: "Расставь строки чтобы удвоить все элементы массива и вывести результат",
        en: "Arrange the lines to double all array elements and log the result",
      },
      lines: [
        "const doubled = numbers.map(x => x * 2);",
        "const numbers = [1, 2, 3];",
        "console.log(doubled);",
      ],
      correctOrder: [1, 0, 2],
    },
  },
  {
    id: "arr-co-002",
    type: "code-ordering",
    version: 1,
    difficulty: 2,
    tags: ["array-methods", "chaining"],
    payload: {
      description: {
        ru: "Расставь строки чтобы получить сумму чётных чисел через цепочку методов",
        en: "Arrange the lines to get the sum of even numbers using method chaining",
      },
      lines: [
        ".reduce((acc, x) => acc + x, 0);",
        "const result = [1, 2, 3, 4, 5]",
        ".filter(x => x % 2 === 0)",
      ],
      correctOrder: [1, 2, 0],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOPIC: async
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    id: "async-quiz-001",
    type: "quiz",
    version: 1,
    difficulty: 2,
    tags: ["promises", "async"],
    payload: {
      question: {
        ru: "Что произойдёт если один из промисов в Promise.all() отклонится?",
        en: "What happens if one of the promises in Promise.all() rejects?",
      },
      options: [
        {
          ru: "Остальные промисы продолжат выполняться, ошибка игнорируется",
          en: "Other promises continue, error is ignored",
        },
        {
          ru: "Promise.all() немедленно отклонится с этой ошибкой",
          en: "Promise.all() immediately rejects with that error",
        },
        {
          ru: "Вернётся массив с undefined на месте отклонённого",
          en: "Returns array with undefined in place of rejected",
        },
        { ru: "Promise.all() зависнет", en: "Promise.all() will hang" },
      ],
      correctIndex: 1,
    },
  },
  {
    id: "async-quiz-002",
    type: "quiz",
    version: 1,
    difficulty: 2,
    tags: ["async", "await"],
    payload: {
      question: {
        ru: "Что вернёт async функция если в ней нет return?",
        en: "What does an async function return if it has no return statement?",
      },
      options: [
        { ru: "null", en: "null" },
        { ru: "undefined", en: "undefined" },
        { ru: "Promise<undefined>", en: "Promise<undefined>" },
        { ru: "void", en: "void" },
      ],
      correctIndex: 2,
    },
  },
  {
    id: "async-tf-001",
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
        ru: "Неверно. async/await это синтаксический сахар над Promise. Код после await помещается в микротаск очередь и не блокирует главный поток",
        en: "False. async/await is syntactic sugar over Promise. Code after await goes to the microtask queue and does not block the main thread",
      },
      correctValue: false,
    },
  },
  {
    id: "async-tf-002",
    type: "true-false",
    version: 1,
    difficulty: 2,
    tags: ["promises", "allSettled"],
    payload: {
      statement: {
        ru: "Promise.allSettled() отклоняется если хотя бы один промис завершился с ошибкой",
        en: "Promise.allSettled() rejects if at least one promise fails",
      },
      explanation: {
        ru: "Неверно. Promise.allSettled() всегда выполняется успешно и возвращает массив со статусом каждого промиса: fulfilled или rejected",
        en: "False. Promise.allSettled() always resolves and returns an array with each promise status: fulfilled or rejected",
      },
      correctValue: false,
    },
  },
  {
    id: "async-cc-001",
    type: "code-completion",
    version: 1,
    difficulty: 2,
    tags: ["async", "await"],
    payload: {
      code: "___ function fetchData() {\n  const res = ___ fetch('/api/data');\n  return res.json();\n}",
      hints: [
        {
          ru: "Первый пропуск — ключевое слово для асинхронной функции. Второй — для ожидания промиса",
          en: "First blank — keyword for async function. Second — for awaiting a promise",
        },
      ],
      correctValues: ["async", "await"],
    },
  },
  {
    id: "async-cc-002",
    type: "code-completion",
    version: 1,
    difficulty: 2,
    tags: ["promises", "catch"],
    payload: {
      code: "fetchData()\n  .then(data => console.log(data))\n  .___(err => console.error(err));",
      hints: [
        {
          ru: "Метод промиса для обработки ошибок",
          en: "Promise method for handling errors",
        },
      ],
      correctValues: ["catch"],
    },
  },
  {
    id: "async-co-001",
    type: "code-ordering",
    version: 1,
    difficulty: 2,
    tags: ["async", "try-catch"],
    payload: {
      description: {
        ru: "Расставь строки чтобы правильно обработать ошибку в async функции",
        en: "Arrange the lines to properly handle errors in an async function",
      },
      lines: [
        "  } catch (err) {",
        "async function loadData() {",
        "    console.error(err);",
        "    const data = await fetch('/api');",
        "  try {",
        "}",
        "  }",
      ],
      correctOrder: [1, 4, 3, 0, 2, 6, 5],
    },
  },
  {
    id: "async-co-002",
    type: "code-ordering",
    version: 1,
    difficulty: 2,
    tags: ["promises", "chaining"],
    payload: {
      description: {
        ru: "Расставь строки чтобы получить данные через цепочку промисов",
        en: "Arrange the lines to fetch data using promise chaining",
      },
      lines: [
        ".then(data => console.log(data));",
        "fetch('/api/users')",
        ".then(res => res.json())",
      ],
      correctOrder: [1, 2, 0],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOPIC: closures
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    id: "cls-quiz-001",
    type: "quiz",
    version: 1,
    difficulty: 2,
    tags: ["closures", "scope"],
    payload: {
      question: {
        ru: "Что выведет код?\nfunction counter() {\n  let count = 0;\n  return () => ++count;\n}\nconst inc = counter();\nconsole.log(inc(), inc(), inc());",
        en: "What will this code output?\nfunction counter() {\n  let count = 0;\n  return () => ++count;\n}\nconst inc = counter();\nconsole.log(inc(), inc(), inc());",
      },
      options: [
        { ru: "0, 0, 0", en: "0, 0, 0" },
        { ru: "1, 1, 1", en: "1, 1, 1" },
        { ru: "1, 2, 3", en: "1, 2, 3" },
        { ru: "0, 1, 2", en: "0, 1, 2" },
      ],
      correctIndex: 2,
    },
  },
  {
    id: "cls-quiz-002",
    type: "quiz",
    version: 1,
    difficulty: 3,
    tags: ["closures", "loops"],
    payload: {
      question: {
        ru: "Что выведет код?\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
        en: "What will this code output?\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
      },
      options: [
        { ru: "0, 1, 2", en: "0, 1, 2" },
        { ru: "3, 3, 3", en: "3, 3, 3" },
        { ru: "1, 2, 3", en: "1, 2, 3" },
        {
          ru: "undefined, undefined, undefined",
          en: "undefined, undefined, undefined",
        },
      ],
      correctIndex: 1,
    },
  },
  {
    id: "cls-tf-001",
    type: "true-false",
    version: 1,
    difficulty: 2,
    tags: ["closures", "memory"],
    payload: {
      statement: {
        ru: "Замыкания могут приводить к утечкам памяти если хранят ссылки на большие объекты",
        en: "Closures can cause memory leaks if they hold references to large objects",
      },
      explanation: {
        ru: "Верно. Замыкание удерживает ссылку на переменные внешней области видимости. Если замыкание долго живёт — объекты не будут собраны сборщиком мусора",
        en: "Correct. A closure holds references to outer scope variables. If the closure lives long — those objects won't be garbage collected",
      },
      correctValue: true,
    },
  },
  {
    id: "cls-tf-002",
    type: "true-false",
    version: 1,
    difficulty: 2,
    tags: ["closures", "scope"],
    payload: {
      statement: {
        ru: "Каждый вызов функции создаёт новое замыкание",
        en: "Each function call creates a new closure",
      },
      explanation: {
        ru: "Верно. При каждом вызове внешней функции создаётся новый контекст с новыми переменными — возвращаемая функция замыкается именно на них",
        en: "Correct. Each call to the outer function creates a new context with new variables — the returned function closes over exactly those",
      },
      correctValue: true,
    },
  },
  {
    id: "cls-cc-001",
    type: "code-completion",
    version: 1,
    difficulty: 2,
    tags: ["closures"],
    payload: {
      code: "function makeMultiplier(x) {\n  ___ (y) => y * x;\n}",
      hints: [
        {
          ru: "Ключевое слово для возврата значения из функции",
          en: "Keyword to return a value from a function",
        },
      ],
      correctValues: ["return"],
    },
  },
  {
    id: "cls-cc-002",
    type: "code-completion",
    version: 1,
    difficulty: 3,
    tags: ["closures", "iife"],
    payload: {
      code: "function makeCounter() {\n  ___ count = 0;\n  return () => { count___; return count; };\n}",
      hints: [
        {
          ru: "Нужно объявление допускающее переназначение, и оператор инкремента",
          en: "Need a declaration that allows reassignment, and an increment operator",
        },
      ],
      correctValues: ["let", "++"],
    },
  },
  {
    id: "cls-co-001",
    type: "code-ordering",
    version: 1,
    difficulty: 2,
    tags: ["closures"],
    payload: {
      description: {
        ru: "Расставь строки чтобы создать счётчик через замыкание",
        en: "Arrange the lines to create a counter using a closure",
      },
      lines: [
        "return () => ++count;",
        "function makeCounter() {",
        "  let count = 0;",
        "}",
      ],
      correctOrder: [1, 2, 0, 3],
    },
  },
  {
    id: "cls-co-002",
    type: "code-ordering",
    version: 1,
    difficulty: 3,
    tags: ["closures", "loops"],
    payload: {
      description: {
        ru: "Расставь строки чтобы корректно вывести 0, 1, 2 через setTimeout используя let",
        en: "Arrange the lines to correctly output 0, 1, 2 via setTimeout using let",
      },
      lines: [
        "  setTimeout(() => console.log(i), 0);",
        "for (let i = 0; i < 3; i++) {",
        "}",
      ],
      correctOrder: [1, 0, 2],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOPIC: typescript
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    id: "ts-quiz-001",
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
    id: "ts-quiz-002",
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
  {
    id: "ts-tf-001",
    type: "true-false",
    version: 1,
    difficulty: 1,
    tags: ["typescript", "any"],
    payload: {
      statement: {
        ru: "Тип any отключает проверку типов для переменной",
        en: "The any type disables type checking for a variable",
      },
      explanation: {
        ru: "Верно. any говорит TypeScript не проверять тип. Это escape hatch — предпочитать unknown",
        en: "Correct. any tells TypeScript to skip type checking. It's an escape hatch — prefer unknown",
      },
      correctValue: true,
    },
  },
  {
    id: "ts-tf-002",
    type: "true-false",
    version: 1,
    difficulty: 2,
    tags: ["typescript", "generics"],
    payload: {
      statement: {
        ru: "Generics позволяют создавать переиспользуемые компоненты с разными типами",
        en: "Generics allow creating reusable components that work with different types",
      },
      explanation: {
        ru: "Верно. Generic — параметр типа. Array<T> работает и с number[] и с string[] без дублирования кода",
        en: "Correct. A generic is a type parameter. Array<T> works with both number[] and string[] without code duplication",
      },
      correctValue: true,
    },
  },
  {
    id: "ts-cc-001",
    type: "code-completion",
    version: 1,
    difficulty: 1,
    tags: ["typescript", "types"],
    payload: {
      code: "const greet = (name: ___): string => `Hello, ${name}`;",
      hints: [
        {
          ru: "Тип для текстовых значений в TypeScript",
          en: "Type for text values in TypeScript",
        },
      ],
      correctValues: ["string"],
    },
  },
  {
    id: "ts-cc-002",
    type: "code-completion",
    version: 1,
    difficulty: 2,
    tags: ["typescript", "generics"],
    payload: {
      code: "function identity<___>(value: T): T {\n  return value;\n}",
      hints: [
        {
          ru: "Имя параметра типа — обычно одна заглавная буква",
          en: "Name of the type parameter — usually a single capital letter",
        },
      ],
      correctValues: ["T"],
    },
  },
  {
    id: "ts-co-001",
    type: "code-ordering",
    version: 1,
    difficulty: 1,
    tags: ["typescript", "interface"],
    payload: {
      description: {
        ru: "Расставь строки чтобы объявить интерфейс User с полями id и name",
        en: "Arrange the lines to declare a User interface with id and name fields",
      },
      lines: ["  name: string;", "interface User {", "  id: number;", "}"],
      correctOrder: [1, 2, 0, 3],
    },
  },
  {
    id: "ts-co-002",
    type: "code-ordering",
    version: 1,
    difficulty: 2,
    tags: ["typescript", "generics"],
    payload: {
      description: {
        ru: "Расставь строки чтобы создать generic функцию возвращающую первый элемент массива",
        en: "Arrange the lines to create a generic function returning the first array element",
      },
      lines: ["  return arr[0];", "function first<T>(arr: T[]): T {", "}"],
      correctOrder: [1, 0, 2],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TOPIC: proto
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    id: "proto-quiz-001",
    type: "quiz",
    version: 1,
    difficulty: 3,
    tags: ["this", "context"],
    payload: {
      question: {
        ru: "Что выведет код?\nconst obj = {\n  name: 'Alex',\n  getName: function() { return this.name; }\n};\nconst fn = obj.getName;\nconsole.log(fn());",
        en: "What will this code output?\nconst obj = {\n  name: 'Alex',\n  getName: function() { return this.name; }\n};\nconst fn = obj.getName;\nconsole.log(fn());",
      },
      options: [
        { ru: "'Alex'", en: "'Alex'" },
        { ru: "undefined", en: "undefined" },
        { ru: "TypeError", en: "TypeError" },
        { ru: "null", en: "null" },
      ],
      correctIndex: 1,
    },
  },
  {
    id: "proto-quiz-002",
    type: "quiz",
    version: 1,
    difficulty: 3,
    tags: ["prototypes", "inheritance"],
    payload: {
      question: {
        ru: "Что вернёт typeof Object.getPrototypeOf([])?",
        en: "What does typeof Object.getPrototypeOf([]) return?",
      },
      options: [
        { ru: "'array'", en: "'array'" },
        { ru: "'null'", en: "'null'" },
        { ru: "'object'", en: "'object'" },
        { ru: "'function'", en: "'function'" },
      ],
      correctIndex: 2,
    },
  },
  {
    id: "proto-tf-001",
    type: "true-false",
    version: 1,
    difficulty: 3,
    tags: ["this", "arrow"],
    payload: {
      statement: {
        ru: "Стрелочные функции имеют собственный контекст this",
        en: "Arrow functions have their own this context",
      },
      explanation: {
        ru: "Неверно. Стрелочные функции не имеют собственного this — они берут его из окружающего лексического контекста",
        en: "False. Arrow functions do not have their own this — they inherit it from the surrounding lexical context",
      },
      correctValue: false,
    },
  },
  {
    id: "proto-tf-002",
    type: "true-false",
    version: 1,
    difficulty: 3,
    tags: ["prototypes", "chain"],
    payload: {
      statement: {
        ru: "У всех объектов в JavaScript есть прототип",
        en: "All objects in JavaScript have a prototype",
      },
      explanation: {
        ru: "Неверно. Object.create(null) создаёт объект без прототипа — его используют для чистых словарей без унаследованных свойств",
        en: "False. Object.create(null) creates an object with no prototype — used for pure dictionaries without inherited properties",
      },
      correctValue: false,
    },
  },
  {
    id: "proto-cc-001",
    type: "code-completion",
    version: 1,
    difficulty: 3,
    tags: ["this", "bind"],
    payload: {
      code: "const obj = { name: 'Alex' };\nfunction greet() { return this.name; }\nconst bound = greet.___(obj);\nconsole.log(bound());",
      hints: [
        {
          ru: "Метод функции который создаёт новую функцию с привязанным контекстом this",
          en: "Function method that creates a new function with a bound this context",
        },
      ],
      correctValues: ["bind"],
    },
  },
  {
    id: "proto-cc-002",
    type: "code-completion",
    version: 1,
    difficulty: 3,
    tags: ["prototypes", "inheritance"],
    payload: {
      code: "class Animal {\n  speak() { return 'sound'; }\n}\nclass Dog ___ Animal {\n  speak() { return 'woof'; }\n}",
      hints: [
        {
          ru: "Ключевое слово для наследования класса от другого класса",
          en: "Keyword for a class to inherit from another class",
        },
      ],
      correctValues: ["extends"],
    },
  },
  {
    id: "proto-co-001",
    type: "code-ordering",
    version: 1,
    difficulty: 3,
    tags: ["this", "call"],
    payload: {
      description: {
        ru: "Расставь строки чтобы вызвать функцию с явным контекстом через call",
        en: "Arrange the lines to call a function with an explicit context using call",
      },
      lines: [
        "console.log(greet.call(obj));",
        "const obj = { name: 'Alex' };",
        "function greet() { return this.name; }",
      ],
      correctOrder: [1, 2, 0],
    },
  },
  {
    id: "proto-co-002",
    type: "code-ordering",
    version: 1,
    difficulty: 3,
    tags: ["prototypes", "class"],
    payload: {
      description: {
        ru: "Расставь строки чтобы создать класс Dog наследующий Animal и вызвать метод родителя",
        en: "Arrange the lines to create a Dog class extending Animal and call the parent method",
      },
      lines: [
        "  speak() { return super.speak() + ' woof'; }",
        "class Dog extends Animal {",
        "class Animal { speak() { return 'sound'; } }",
        "}",
      ],
      correctOrder: [2, 1, 0, 3],
    },
  },
];

// ── Topics ────────────────────────────────────────────────────────────────────

export const MOCK_TOPICS: ITopic[] = [
  {
    id: "core-js",
    title: { ru: "Core JavaScript", en: "Core JavaScript" },
    description: {
      ru: "Основы JavaScript: типы данных, операторы, области видимости",
      en: "JavaScript fundamentals: data types, operators, scoping",
    },
    difficulty: 1,
    order: 1,
    requiredTopicIds: [],
    widgetIds: [
      "core-quiz-001",
      "core-tf-001",
      "core-cc-001",
      "core-co-001",
      "core-quiz-002",
      "core-tf-002",
      "core-cc-002",
      "core-co-002",
    ],
  },
  {
    id: "array-methods",
    title: { ru: "Array Methods", en: "Array Methods" },
    description: {
      ru: "Методы массивов: map, filter, reduce и другие",
      en: "Array methods: map, filter, reduce and more",
    },
    difficulty: 1,
    order: 2,
    requiredTopicIds: ["core-js"],
    widgetIds: [
      "arr-quiz-001",
      "arr-tf-001",
      "arr-cc-001",
      "arr-co-001",
      "arr-quiz-002",
      "arr-tf-002",
      "arr-cc-002",
      "arr-co-002",
    ],
  },
  {
    id: "async",
    title: { ru: "Async / Await", en: "Async / Await" },
    description: {
      ru: "Асинхронный JavaScript: Promise, async/await, event loop",
      en: "Asynchronous JavaScript: Promise, async/await, event loop",
    },
    difficulty: 2,
    order: 3,
    requiredTopicIds: ["core-js"],
    widgetIds: [
      "async-quiz-001",
      "async-tf-001",
      "async-cc-001",
      "async-co-001",
      "async-quiz-002",
      "async-tf-002",
      "async-cc-002",
      "async-co-002",
    ],
  },
  {
    id: "closures",
    title: { ru: "Closures & Scope", en: "Closures & Scope" },
    description: {
      ru: "Замыкания, область видимости, контекст выполнения",
      en: "Closures, scope, execution context",
    },
    difficulty: 2,
    order: 4,
    requiredTopicIds: ["core-js", "async"],
    widgetIds: [
      "cls-quiz-001",
      "cls-tf-001",
      "cls-cc-001",
      "cls-co-001",
      "cls-quiz-002",
      "cls-tf-002",
      "cls-cc-002",
      "cls-co-002",
    ],
  },
  {
    id: "typescript",
    title: { ru: "TypeScript Basics", en: "TypeScript Basics" },
    description: {
      ru: "Основы TypeScript: типы, интерфейсы, generics",
      en: "TypeScript fundamentals: types, interfaces, generics",
    },
    difficulty: 2,
    order: 5,
    requiredTopicIds: ["core-js"],
    widgetIds: [
      "ts-quiz-001",
      "ts-tf-001",
      "ts-cc-001",
      "ts-co-001",
      "ts-quiz-002",
      "ts-tf-002",
      "ts-cc-002",
      "ts-co-002",
    ],
  },
  {
    id: "proto",
    title: { ru: "Prototypes & this", en: "Prototypes & this" },
    description: {
      ru: "Прототипное наследование, контекст this, call/apply/bind",
      en: "Prototypal inheritance, this context, call/apply/bind",
    },
    difficulty: 3,
    order: 6,
    requiredTopicIds: ["core-js", "closures"],
    widgetIds: [
      "proto-quiz-001",
      "proto-tf-001",
      "proto-cc-001",
      "proto-co-001",
      "proto-quiz-002",
      "proto-tf-002",
      "proto-cc-002",
      "proto-co-002",
    ],
  },
];
