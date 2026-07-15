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

data/extra_photos.json доповнює фотографії товарів.

Потребує перевірки:

структура глобального стану S;

роль getCatalog;

логіка products.js;

логіка state.js;

renderHome;

renderCatalog;

фактичний runtime-потік;

реальна поведінка старого кешу.

NEXT TASK:

прочитати тільки:

js/products.js

js/state.js
