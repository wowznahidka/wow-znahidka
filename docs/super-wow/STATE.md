# SUPER WOW STATE

Поточна фаза:

PHASE 0 — architecture audit

Робоча гілка:

super-wow/foundation

Підтверджено:

GitHub MCP працює.

Прочитано:

js/config.js

js/api.js

js/products.js

js/state.js

FACT:

js/config.js містить центральну конфігурацію сайту.

FACT:

js/api.js відповідає за:

завантаження каталогу;

кеш;

нормалізацію товарів;

мережеві запити;

частину інтеграцій аналітики.

FACT:

data/products.json є пріоритетним статичним джерелом товарів у перевіреній логіці.

FACT:

localStorage використовується для швидкого кешованого завантаження.

FACT:

Google Apps Script використовується як fallback для каталогу та endpoint для POST-операцій.

FACT:

data/products_auto.json присутній як резервне джерело.

FACT:

js/state.js є єдиним джерелом істини (S): зберігає persistent стан (gender, favs, cart) та UI стан (tabs, filters, match pool).

FACT:

js/products.js є основним движком рендерингу: генерує HTML для товарів та головної сторінки.

FACT:

функція getCatalog() обробляє динамічну фільтрацію за статтю, ціною, пошуком та сезонність.

FACT:

використовується \"Seeded Shuffle\" для стабільності порядку товарів усередині сеансу.

NEXT TASK:

аудит js/app.js та js/ui.js

TASK 001 — COMPLETED

Прочитано:

js/products.js

js/state.js

Створено:

docs/super-wow/audit/02_PRODUCTS_STATE.md

NEXT TASK:

прочитати тільки:

js/app.js

js/ui.js

TASK 002 — COMPLETED

Прочитано:

js/app.js

js/ui.js

Створено:

docs/super-wow/audit/03_APP_UI.md

NEXT TASK:

аудит js/match.js та js/modal.js

TASK 003 — COMPLETED

Прочитано:

js/match.js

js/modal.js

Створено:

docs/super-wow/audit/04_MATCH_MODAL.md

NEXT TASK:

None
