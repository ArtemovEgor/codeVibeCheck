# Self-Assessment — ekaterynavolkova

**Проект:** codeVibeCheck — интерактивная платформа для подготовки к техническим интервью  
**PR с self-assessment:** [ссылка на PR](https://github.com/ArtemovEgor/codeVibeCheck/pull/109)  
**Репозиторий:** https://github.com/ArtemovEgor/codeVibeCheck

---

## Таблица фич

| Категория        | Фича                                                                                                    | Баллы | Ссылка на код / PR                                                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| My Components    | Complex Component: Widget Engine (Strategy pattern, виджеты)                                            | +25   | [Widget engine](https://github.com/ArtemovEgor/codeVibeCheck/pull/32)                                                                           |
| My Components    | Rich UI Screen: Dashboard Page (SkillMastery, Resume sector)                                            | +20   | [Skill Mastery](https://github.com/ArtemovEgor/codeVibeCheck/pull/94), [Resume learning](https://github.com/ArtemovEgor/codeVibeCheck/pull/105) |
| My Components    | Rich UI Screen: Library Page                                                                            | +20   | [Library](https://github.com/ArtemovEgor/codeVibeCheck/pull/82), [Library search](https://github.com/ArtemovEgor/codeVibeCheck/pull/84)         |
| My Components    | Rich UI Screen: Practice Page                                                                           | +20   | [Practice Page + Quiz widget](https://github.com/ArtemovEgor/codeVibeCheck/pull/41)                                                             |
| Architecture     | API Layer: WidgetsApi, ProgressApi, mock                                                                | +10   | [Widgets API](https://github.com/ArtemovEgor/codeVibeCheck/pull/34), [Progress API](https://github.com/ArtemovEgor/codeVibeCheck/pull/70)       |
| Architecture     | Design Patterns: Strategy pattern в Widget Engine, Singleton Service в сервисах как LocalizationService | +10   | [Widget engine](https://github.com/ArtemovEgor/codeVibeCheck/pull/32)                                                                           |
| UI & Interaction | Theme Switcher: light/dark                                                                              | +10   | [Theme Switcher in layout](https://github.com/ArtemovEgor/codeVibeCheck/pull/20)                                                                |
| UI & Interaction | i18n: локализация EN/RU                                                                                 | +10   | [Localisation](https://github.com/ArtemovEgor/codeVibeCheck/pull/86)                                                                            |
| UI & Interaction | Responsive: Адаптация верстки под мобильные устройства (от 320px)                                       | +5    | [Layout](https://github.com/ArtemovEgor/codeVibeCheck/pull/20)                                                                                  |
| Quality          | Unit Tests (Basic): vitest, widget-engine.spec, true-false-strategy.spec                                | +10   | [Widget tests](https://github.com/ArtemovEgor/codeVibeCheck/pull/56)                                                                            |

**Итого: ~140 баллов**

---

## Описание работы

### Что я делала в проекте

Моя основная часть работы — это слой виджетов и всё что с ним связано: от архитектуры до UI.

**Widget Engine и система виджетов**  
Паттерн Strategy: Спроектировала расширяемую систему рендеринга заданий. Каждая стратегия реализует интерфейс IWidgetStrategy, изолируя логику валидации и рендеринга конкретного типа виджета. Это позволило легко добавить 4 типа: Quiz, TrueFalse, CodeCompletion, CodeOrdering.  
Type Safety: Разработала систему типов на основе Discriminated Unions для моделей Widget и IVerdict, обеспечив строгую типизацию данных при переключении между стратегиями.  
Smart API Layer: Реализовала слой API с поддержкой моков. Благодаря переключению через env VITE_USE_MOCKS, обеспечила полную автономность фронтенд-разработки.  
Mock Logic: Мок-реализация полностью имитирует поведение бэкенда: рассчитывает XP, проверяет корректность ответов и сохраняет прогресс в localStorage.

**Practice Page**  
State Restoration: Реализовала алгоритм поиска первого невыполненного задания на основе пересечения массивов widgets и completedWidgetIds, что позволяет пользователю продолжать обучение.  
Dynamic Layout: Спроектировала адаптивный лейаут с mainArea для контента и aside для статистики, реализовав независимое обновление правой панели (XP/Stats) без перерендера основного контента.  
Error Handling & Routing: Интегрировала систему уведомлений и защитные редиректы: при попытке доступа к заблокированной теме или возникновении 404 ошибки API, страница корректно возвращает пользователя в библиотеку.  
Widget Lifecycle: Реализовала полный цикл обработки ответа: сбор данных из стратегии -> отправка в API -> обновление глобального стейта -> триггер визуального вердикта.

**Library Page**  
Список тем с карточками. Каждая карточка показывает прогресс бар, XP, сложность, статус (заблокирована/открыта/завершена).  
Performance Optimization: Применила Promise.all для параллельной загрузки данных о темах и прогрессе пользователя.  
Реализовала Search (быстрый поиск) на стороне клиента. Вместо полного перерендера использую CSS-переключение классов (`--hidden`).  
Разработала систему блокировки тем: статус isUnlocked вычисляется динамически на основе графа зависимостей (requiredTopicIds). Карточка автоматически меняет состояние (заблокирована/доступна), как только пользователь выполняет необходимые условия.  
Stagger Animation: Внедрена последовательная анимация появления карточек через CSS-переменную --stagger-index. Это создает эффект «всплытия» элементов один за другим, улучшая визуальное восприятие.  
Scroll Management: Реализовала функциональную кнопку «Наверх» с плавным скроллом, которая появляется только при преодолении порога (Scroll Threshold), и обработку «пустых результатов» (Empty State) для поиска.

**Dashboard — SkillMastery и Resume**  
SkillMastery Component: Создала систему визуализации навыков (Theory/Coding/Logic). Данные динамически рассчитываются в ProgressService, сопоставляя типы виджетов с категориями компетенций.  
Resume Learning Flow: Реализовала "умный" блок продолжения обучения. Система автоматически находит последний активный топик. В случае отсутствия прогресса (новый пользователь) динамически рендерится Call-to-Action блок для вовлечения в процесс.

**API и Mock слой**  
Полностью реализовала `WidgetsApi`, `ProgressApi` и соответствующие моки. Mock хранит данные в localStorage и точно имитирует поведение реального бэкенда — включая расчёт `isCompleted`, `isUnlocked`, streak, XP по категориям.

**Theme Switcher**
Интегрировала систему смены тем (Light/Dark). Стили реализованы на чистом CSS с использованием переменных, что позволяет мгновенно менять оформление всего приложения без перерендера компонентов.

**i18n (Localization)**
Разработала собственный масштабируемый сервис локализации без использования сторонних библиотек. Весь интерфейс и динамические данные от API (заголовки тем, описания, уведомления) проходят через LocalizationService

**Unit Testing (Vitest)**
Написала тесты для WidgetEngine, проверяющие корректность регистрации стратегий и выбор нужного обработчика в зависимости от типа виджета. Это гарантирует, что при добавлении новых типов заданий основное ядро не сломается.
Реализовала тесты для конкретных стратегий (например, true-false-strategy.spec).

**Responsive: Адаптация верстки под мобильные устройства (от 320px)**
Для реализации адаптивности использовалась система SCSS-миксинов, что позволило унифицировать брейкпоинты во всех компонентах приложения. Это обеспечило стабильное отображение интерфейса на экранах от 320px

### Инструменты и технологии

TypeScript, Vite, SCSS с CSS variables, Vitest для тестов. Архитектура без фреймворков — vanilla TS с паттерном Strategy и BaseComponent.

### Что было сложным

Самым сложным оказалась архитектура `showVerdict` — нужно было показывать результат прямо внутри виджета после ответа, при этом каждый тип виджета делает это по-разному. Решение через метод `showVerdict(verdict, widget)` в интерфейсе стратегии позволило каждой стратегии самой знать как отобразить результат используя payload своего виджета.

Также непросто было спроектировать прогресс пользователя — разделение между `xp_earned` (только первое прохождение) и `total_xp` (все попытки), расчёт `isUnlocked` через граф зависимостей тем.

---

## 2 личных Feature Component

### 1. Widget Engine

**Что это:** Движок для рендеринга обучающих виджетов на паттерне Strategy. Позволяет добавлять новые типы виджетов без изменения существующего кода — достаточно реализовать интерфейс и зарегистрировать стратегию.

**Ключевые файлы:**

- `src/services/widget-engine.ts`
- `src/types/shared/widget.types.ts` — `IWidgetStrategy`, `Widget`, `IVerdict`
- `src/components/widgets/quiz/quiz-strategy.ts`
- `src/components/widgets/true-false/true-false-strategy.ts`
- `src/services/widget-engine.spec.ts`

**Как устроено:**

- `WidgetEngine` хранит стратегии в `Map<string, IWidgetStrategy>`
- `register(strategy)` — добавить стратегию
- `renderWidget(widget, onAnswer)` — найти стратегию по типу, вызвать `render()`
- `showVerdict(widget, verdict)` — вызвать `showVerdict()` нужной стратегии
- Каждая стратегия самостоятельно рендерит UI, валидирует ответ и подсвечивает результат
- `Widget` как Discriminated Union — TypeScript сужает тип внутри стратегии через `widget.type`

**Что покажу на презентации:**

- Strategy pattern в действии — как `WidgetEngine` делегирует работу стратегиям
- Как добавить новый тип виджета: 1) добавить тип в `WIDGET_TYPES`, 2) реализовать стратегию, 3) зарегистрировать в `app.ts`
- Quiz и TrueFalse: выбор ответа, submit, подсветка правильного/неправильного через `showVerdict`

---

### 2. Dashboard — SkillMastery

**Что это:** Компонент визуализации прогресса пользователя по категориям навыков — Theory, Coding, Logic. Показывает сколько XP заработано из максимально возможного по каждой категории.

**Ключевые файлы:**

- `src/components/skill-mastery/skill-mastery.ts`
- `src/services/progress-service.ts`
- `src/types/shared/progress.types.ts` — `ISkillData`, `IProgressStatistic`, `SkillType`

**Как устроено:**

- `ProgressService.getProgressDashboardData()` загружает темы, виджеты и прогресс параллельно
- Каждый тип виджета → категория навыка: `quiz` → Theory, `true-false` → Logic, `code-completion` / `code-ordering` → Coding
- `countTotalXPBySkill()` — максимально возможный XP по каждой категории (из всех виджетов)
- `countSkillsXP()` — фактически заработанный XP (только из `completedWidgetIds`)
- Процент = `currentXP / totalXP * 100`
- `SkillMastery` рендерит прогресс бар для каждой категории с процентом и значениями XP

**Что покажу на презентации:**

- Как `ProgressService` классифицирует виджеты по категориям
- Расчёт процента прогресса — текущий XP vs максимальный
- Как данные меняются после прохождения виджетов на Practice странице
- Структура `ISkillData` и `IProgressStatistic`
