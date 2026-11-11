Лабораторна робота №7 — Pinia та приватний редактор товарів
Проєкт FORMA створений на основі лабораторної №6, зберігає публічний каталог, пошук із q, сторінки товарів, відгуки та хлібні крихти.
Запуск
npm ci
npm run dev -- --port 5177 --strictPort
npm run build
npm exec vite preview -- --port 5177 --strictPort
Залежності: Vue 3.5.43, Vue Router 4.6.4, Pinia 3.0.4. Після встановлення залежностей збережіть створений package-lock.json.
Маршрути
Шлях	Назва	Доступ
/products	products	публічний
/products/:id	product-overview	публічний
/products/:id/reviews	product-reviews	публічний
/about	about	публічний
/login	login	публічний
/manage/products	manage-products	приватний
/manage/products/:id/edit	manage-edit	приватний
інші адреси	not-found	публічний


Відповідальність
- stores/auth.js — токен, підтверджений профіль, стани idle/restoring/signing-in/guest/authenticated/unavailable, login, restore, logout, приватний request.
- stores/products.js — лише підтверджені зміни товарів поточного сеансу, PATCH, reset.
- api/http.js — JSON, HTTP status, AbortSignal, Bearer, credentials omit.
- api/productDraft.js — нормалізація та валідація полів редактора.
- auth/session.js — запис лише access token у sessionStorage.
- router/guards.js — перевірка приватного переходу та безпечного redirect.
- composables/usePrivateResource.js — реактивне читання, скасування попереднього запиту.
- views/LoginView.vue — локальні username/password і форма входу.
- views/ManageProductsView.vue — приватна пагінація по 12 товарів.
- views/ProductEditView.vue — локальна чернетка, валідація, збереження, попередження про незбережені зміни.
- layouts/ManageLayout.vue — приватна оболонка.
Життєвий цикл сеансу
1. Перший вхід: POST /auth/login; профіль і токен зберігаються в auth store, тільки токен — у sessionStorage.
2. Reload: GET /auth/me перевіряє токен; до підтвердження приватні дані приховані.
3. HTTP 401: очищення поточного сеансу, токена та локальних підтверджених змін.
4. Мережева помилка перевірки: unavailable, приватний вміст закритий, токен зберігається для повтору.
5. Logout: скасування приватних запитів, очищення стану й перехід до каталогу.
Межі навчальної моделі
DummyJSON PATCH імітує зміну і не змінює серверний товар. Підтверджені зміни об'єднуються з результатами GET через products store і зникають після reload/виходу. Серверний пошук працює з початковими даними. sessionStorage не є захищеним сховищем від XSS, тому для реального застосунку потрібні додаткові серверні механізми безпеки.
Перевірки
Сценарій	Очікуваний результат	Фактичний результат	URL	HTTP-статус	Кількість запитів
Гість відкриває редактор	Перенаправлення на login з redirect	Не перевірено	/manage/products/12/edit	—	0 приватних GET
Невірний пароль	Помилка, без токена	Не перевірено	/login	400	1 POST
Успішний вхід	Відновлення адреси	Не перевірено	/login	200	1 POST
Reload з токеном	Перевірка профілю	Не перевірено	/manage/products	200	1 GET me
Підроблений токен	Вихід без приватного вмісту	Не перевірено	/manage/products	401	1 GET me
Пагінація	12 товарів за сторінку	Не перевірено	/manage/products	200	1 GET на сторінку
Невалідна форма	Помилки та фокус, без PATCH	Не перевірено	/manage/products/12/edit	—	0 PATCH
Успішне збереження	Підтверджені зміни в інших представленнях	Не перевірено	/manage/products/12/edit	200	1 PATCH
Відмова залишити редактор	Чернетка збережена	Не перевірено	/manage/products/12/edit	—	0 PATCH
Offline PATCH	Помилка без втрати чернетки	Не перевірено	/manage/products/12/edit	мережева	1 спроба
Вихід під час PATCH	Сеанс і зміни очищено	Не перевірено	/manage/products/12/edit	скасовано	1 спроба
Адаптивність	Без горизонтального overflow	Не перевірено	усі сторінки	—	—