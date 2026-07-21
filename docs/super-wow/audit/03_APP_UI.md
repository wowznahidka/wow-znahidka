# AUDIT 03 — APP AND UI

## Прочитані production-файли

js/app.js
js/ui.js

## FACT

Записуй тільки те, що прямо підтверджене кодом.

### js/app.js

- **реальна роль файлу**: Бутстрап застосунку: ініціалізація міграцій, аналітики, UTM-відстеження, PWA, локалізації, обробка URL-параметрів та фільтрів.
- **точка або точки запуску застосунку**: `window.addEventListener('DOMContentLoaded', ...)`
- **порядок ініціалізації**: Міграції $\rightarrow$ Аналітика $\rightarrow$ UTM $\rightarrow$ PWA $\rightarrow$ Мова $\rightarrow$ Параметри URL $\rightarrow$ Ініціалізація (Badge, Nav, FetchCatalog) $\rightarrow$ PWA/Keyboard.
- **DOMContentLoaded або інші механізми старту**: `DOMContentLoaded`.
- **які глобальні об’єкти читаються**: `S` (стан), `CFG` (конфігурація), `L` (локалізація), `REF`.
- **які глобальні об’єкти змінюються**: `S.utm`, `S.promoFixed`, `S.promoCode`, `S.gender`, `S.activeTab`.
- **залежності від CFG**: `CFG.PROMO_FIXED`, `CFG.GAS_URL`.
- **залежності від S**: `S.utm`, `S.gender`, `S.activeTab`, `S.promoCode`, `S.promoFixed`.
- **залежності від API**: `fetchCatalog()`.
- **залежності від функцій інших модулів**: `renderHome`, `checkDeepLink`, `renderPriceSlider`, `_applyFilters`, `updateActiveFiltersChips`.
- **які функції викликаються під час старту**: `_injectGA`, `_injectPixel`, `_injectTTPixel`, `REF.captureIncoming`, `REF.initBlock`, `_saveUtm`, `registerSW`, `applyLang`, `setGender`, `changeTab`, `fetchCatalog`, `updateBadges`, `_updateNavIndicator`, `renderHome`, `updateCartBar`, `initPWA`, `initKeyboardHandler`.
- **які event listeners створюються**: `DOMContentLoaded`, `scroll` (для Scroll Reveal), `keydown` (для кнопки Escape).
- **які runtime-події обробляються**: `scroll`, `keydown`.
- **робота з URL, query parameters або hash**: Використовує `URLSearchParams` для `utm_source`, `utm_campaign`, `utm_video`, `utm_medium`, `g` (gender), `tab`, та фільтрів (`brand`, `min`, `max`, `size`, `q`, `sort`).
- **робота з localStorage**: Читання/запис `wow_liked`, `wow_favs`, `wow_catalog_v1`, `wow_catalog_v2`, `wow_deals_`, `wow_pwa_android`, `wow_pwa_ios`.
- **робота з мовою**: Викликає `applyLang()`.
- **робота з каталогом**: Викликає `fetchCatalog()`.
- **робота з головною сторінкою**: Викликає `renderHome()`.
- **робота з Match**: Викликає `changeTab('match')`, що ініціює `initMatch()` (в `ui.js`).
- **робота з фільтрами**: Використовує `restoreFiltersFromUrl`, `_applyFilters`.
- **робота з PWA або service worker**: Викликає `registerSW()` та `initPWA()`.
- **підтверджені технічні ризики**: Використання `setTimeout` для оновлення UI (80ms, 50ms) може бути нестабільним; `no-cors` запити до GAS можуть не працювати залежно від налаштувань сервера.

### js/ui.js

- **реальна роль файлу**: UI-примітиви: Toast, Badges, Tabs, Gender, Splash, FAQ, Idle nudge, Sheets, Zoom.
- **усі визначені функції**: `_haptic`, `toast`, `updateBadges`, `updateCartBar`, `renderFaq`, `updateTimestamp`, `changeTab`, `_updateNavIndicator`, `_renderContactsHeroShoe`, `refreshCurrentTab`, `setGender`, `openSheet`, `closeAllSheets`, `toggleFaq`, `initPWA`, `registerSW`, `cleanupSwipe`, `openLink`, `openTgLink`, `_copyFallback`, `initKeyboardHandler`, `openImageZoom`, `closeImageZoom`.
- **які функції доступні іншим модулям**: `toast`, `updateBadges`, `updateCartBar`, `changeTab`, `setGender`, `openSheet`, `closeAllSheets`, `openLink`, `openTgLink`.
- **які DOM-елементи шукаються**: `fav-badge`, `cart-badge`, `cart-sticky-bar`, `csb-count`, `csb-label`, `csb-total`, `faq-list`, `faq-block`, `faq-block-hdr`, `faq-block-ico`, `faq-block-ttl`, `faq-item`, `faq-q`, `faq-toggle`, `faq-a`, `update-ts`, `page-`, `nav-item`, `dsk-nav-btn`, `pages`, `bottom-nav`, `nav-indicator`, `contacts-hero-shoe-img`, `contacts-hero-shoe-brand`, `contacts-hero-fallback`, `overlay`, `toasts`, `pwa-install-btn`, `pwa-android`, `pwa-ios`, `img-zoom-overlay`, `izv-backdrop`, `izv-wrap`, `izv-img`, `izv-dots`, `izv-close`, `izv-hint`.
- **які ID, класи та data-атрибути використовуються**: `active`, `vis`, `hidden`, `on`, `loaded`, `data-tab`, `data-gender`, `aria-pressed`, `izv-dot-a`.
- **які елементи створюються динамічно**: `toast` елементи, `faq-list` контент.
- **як формується HTML**: `renderFaq` використовує шаблонний рядок для створення `faq-block`.
- **де використовується innerHTML**: `renderFaq`.
- **де використовується textContent**: `updateBadges`, `updateCartBar`, `updateTimestamp`.
- **які event listeners створюються**: `click` (FAQ, Sheets, PWA), `touchstart`, `touchmove`, `touchend`, `keydown`, `popstate`.
- **чи використовуються inline handlers**: Ні, переважно через `addEventListener` або delegated clicks.
- **як оновлюється інтерфейс**: `changeTab` змінює класи активності та позиції елементів; `updateBadges` оновлює текст та видимість.
- **як UI залежить від глобального стану S**: Використовує `S.favs.length`, `S.cart`, `S.lastFetchTime`, `S.activeTab`, `S.catalog`.
- **як UI залежить від CFG**: Використовує `CFG.GAS_URL`.
- **як UI залежить від getCatalog**: Використовує `S.catalog`, який завантажується через `fetchCatalog`.
- **які функції з інших модулів очікуються**: `renderHome`, `initMatch`, `renderCatalog`, `renderFavSheet`, `renderCartSheet`.
- **які глобальні функції створюються**: `toast`, `updateBadges`, `updateCartBar`, `changeTab`, `setGender`, `openSheet`, `closeAllSheets`, `openLink`, `openTgLink`.
- **підтверджені технічні ризики**: Використання `innerHTML` у `renderFaq` (хоч і є `esc()`); `setTimeout` у `_renderContactsHeroShoe` може викликати проблеми при повільному завантаженні каталогу.

### Зв’язок app.js та ui.js

- **які функції app.js викликає з ui.js**: `changeTab`, `updateBadges`, `_updateNavIndicator`, `setGender`, `initPWA`, `initKeyboardHandler`, `openSheet`.
- **які дані передаються**: рядок `tab`, рядок `gender`, рядок `id` для шорток.
- **які глобальні залежності спільні**: `S`, `L`, `CFG`, `localStorage`, `URLSearchParams`.
- **який порядок роботи підтверджений кодом**: `app.js` ініціює завантаження контенту, після чого викликає функції `ui.js` для оновлення візуальних станів (наприклад, `changeTab` $\rightarrow$ `renderCatalog`).
- **які частини системи неможливо підтвердити без інших файлів**: Конкретна логіка `renderHome`, `initMatch`, `renderCatalog`, `renderFavSheet`, `renderCartSheet`.

### Карта залежностей

app.js
→ читає CFG
→ читає або змінює S
→ викликає функції UI (changeTab, updateBadges, setGender, initPWA, initKeyboardHandler, openSheet)
→ викликає функції інших модулів (fetchCatalog, renderHome, checkDeepLink)

ui.js
→ читає S
→ викликає getCatalog (через S.catalog)
→ змінює DOM
→ очікує функції інших модулів (renderHome, initMatch, renderCatalog, renderFavSheet, renderCartSheet)

## HYPOTHESIS

- Функція `renderHome` відображає головну сторінку на основі `S.activeTab === 'home'`.
- Функція `initMatch` ініціалізує інтерфейс Match (свайпи тощо).
- Функція `renderCatalog` відображає список товарів з фільтрацією.
- Функція `renderFavSheet` та `renderCartSheet` відображають відповідні модальні шторки.
- Схема `changeTab` є центральним хабом для перемикання між основними відами сайту.

NOT RUNTIME TESTED.
