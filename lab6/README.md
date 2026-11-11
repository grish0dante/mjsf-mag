# Лабораторна робота №5

## Використання Vue composable

**Дисципліна:** Сучасні каркаси web-додатків  
**Студент:** Грішанов Данило Євгенович  
**Група:** 7.F2.25-2

## 1. Мета роботи

Навчитися розподіляти відповідальність між Vue-компонентами та composables, керувати асинхронним пошуком із debounce та скасуванням запитів, а також реалізувати автоматичне дозавантаження товарів під час прокручування каталогу.

## 2. Використані технології

- Vue 3 — створення компонентного інтерфейсу.
- Composition API — керування реактивним станом.
- Vite — запуск і збірка проєкту.
- JavaScript — реалізація логіки.
- Fetch API — виконання HTTP-запитів.
- AbortController — скасування HTTP-запитів.
- IntersectionObserver — відстеження нижнього маркера.
- DummyJSON — отримання даних про товари.
- CSS та BEM — стилізація інтерфейсу.

## 3. Структура проєкту

```text
lab5/
├── src/
│   ├── api/
│   │   └── products.js
│   ├── components/
│   │   ├── ProductSearchForm.vue
│   │   ├── ProductCatalog.vue
│   │   ├── ProductCard.vue
│   │   └── CatalogLoadMore.vue
│   ├── composables/
│   │   ├── useFetch.js
│   │   ├── useDebouncedValue.js
│   │   └── useIntersectionObserver.js
│   ├── styles/
│   │   └── main.css
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 4. Контракти модулів

| Модуль | Входи | Виходи | Власний стан | Відповідальність |
|---|---|---|---|---|
| App.vue | Події компонентів, дані composables | Пропси та обробники | query, skip, products, total | Координація пошуку, запитів і пагінації |
| ProductSearchForm.vue | modelValue, loaded, total, isLoading, error, isDebouncing | update:modelValue | Немає власного реактивного стану | Поле пошуку та статус |
| ProductCatalog.vue | products, isLoading, error | retry | Немає | Відображення списку та станів |
| ProductCard.vue | product | Немає | Немає | Представлення товару |
| CatalogLoadMore.vue | loaded, total, isLoading, error, hasMore | load-more, retry | DOM ref маркера | Автозавантаження та індикація |
| useFetch.js | URL | data, error, isLoading, abort, refetch | HTTP-стан, AbortController | Виконання й скасування запитів |
| useDebouncedValue.js | source, delay | readonly ref | Таймер, відкладене значення | Debounce |
| useIntersectionObserver.js | target, callback, options | Виклик callback | Observer, підписка | Відстеження перетину |

## 5. Реалізована функціональність

### 5.1. Початкове завантаження

Після відкриття сторінки формується запит до DummyJSON із параметрами limit=12, skip=0 та delay=1500.

Після отримання відповіді товари відображаються у вигляді адаптивної сітки.

### 5.2. Реактивний пошук

Пошуковий рядок зберігається в реактивній змінній query.

Composable useDebouncedValue створює відкладене значення debouncedQuery із затримкою 400 мс.

Після зміни debouncedQuery формується новий URL, а useFetch виконує HTTP-запит.

### 5.3. Скасування запитів

За зміною сирого query спостерігає watch із параметром flush: 'sync'.

При кожній зміні тексту викликається abort(), який скасовує активний HTTP-запит.

Скасовані запити не відображаються як помилки.

### 5.4. Автоматичне дозавантаження

CatalogLoadMore використовує useIntersectionObserver.

Коли нижній маркер наближається до видимої області, компонент надсилає подію load-more.

App.vue перевіряє умови та збільшує skip на 12.

Отримані товари додаються до масиву без повторення id.

### 5.5. Обробка помилок

Якщо запит завершується помилкою, користувач бачить повідомлення та кнопку повторення.

Під час помилки дозавантаження вже отримані товари залишаються на сторінці.

## 6. Схема потоку стану

```text
query
  |
  +----> abort() активного запиту
  |
  +----> debounce 400 мс
             |
             v
       debouncedQuery
             |
             v
         requestUrl
             |
             v
          useFetch
             |
             v
            data
             |
             v
      Об'єднання сторінок
             |
             v
          products
             |
             v
       ProductCatalog

IntersectionObserver
        |
        v
     loadMore()
        |
        v
     skip + 12
        |
        v
     requestUrl
```

## 7. Чому відповідальність розділена

ProductSearchForm не формує URL, оскільки його завданням є тільки отримання введеного тексту та відображення стану пошуку.

ProductCatalog не завантажує дані, оскільки відповідає лише за представлення вже отриманих товарів.

useFetch володіє HTTP-запитом і AbortController, useDebouncedValue — таймером, а useIntersectionObserver — браузерним observer.

Кожен composable очищує створені ним ресурси. Це зменшує залежність між компонентами та спрощує повторне використання логіки.

## 8. Команди запуску

Встановлення залежностей:

```bash
npm install
```

Запуск сервера:

```bash
npm run dev
```

Виробнича збірка:

```bash
npm run build
```

Попередній перегляд збірки:

```bash
npm run preview
```



## 9. Висновок

У лабораторній роботі реалізовано каталог товарів на Vue 3 із використанням Composition API та власних composables.

Розроблено механізми реактивного пошуку із затримкою 400 мс, скасування застарілих HTTP-запитів через AbortController і автоматичного дозавантаження товарів через IntersectionObserver.

Логіку отримання даних, затримки введення та спостереження за DOM-елементами винесено до окремих composables. Інтерфейс розділено на незалежні компоненти, що покращує структуру застосунку, повторне використання коду та його підтримку.

Реалізація демонструє принципи керування реактивним станом, асинхронними операціями та життєвим циклом ресурсів у Vue 3.
