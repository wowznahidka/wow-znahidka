/* ============================================================
   WOW.ZNAHIDKA — CONFIGURATION
   All constants live here. Never scatter magic strings.
   ============================================================ */

const CFG = {
  GAS_URL:  'https://script.google.com/macros/s/AKfycbxnbKNfrT38T4c7drhOI5IomuFzLNCeXZPykGwBSQpgtZUkme6Ip91Zio9weRgQYs-mCw/exec',
  TG_URL:   'https://telegram.me/znahidkawow',
  IG_URL:   'https://instagram.com/wow.znahidka',
  TT_URL:   'https://www.tiktok.com/@wowznahidka',

  // ── Google Analytics 4 ───────────────────────── */
  // Вставте свій Measurement ID з analytics.google.com (вигляд: G-XXXXXXXXXX)
  GA_ID: 'G-9L346ZDWLK',

  // ── Meta Pixel ───────────────────────────────── */
  // ПОРОЖНЬО НАВМИСНО: канонічний піксель 1578292430419094 захардкоджений у <head> index.html.
  // Другий ID тут дублював ініціалізацію — всі події стріляли у два пікселі одночасно.
  FB_PIXEL_ID: '',

  // ── TikTok Pixel ─────────────────────────────── */
  // Вставте свій Pixel ID з TikTok Ads Manager
  TT_PIXEL_ID: '',

  // ── OG Image ─────────────────────────────────── */
  // Абсолютний URL банера 1200×630 для превʼю посилань
  OG_IMAGE: 'https://wowznahidka.github.io/wow-znahidka/og-cover.jpg',


  CACHE_KEY:    'wow_catalog_v3',
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes — залишки оновлюються швидко після замовлень
  MIN_PRODUCTS: 5,

  SIZES_MALE:   [40, 41, 42, 43, 44, 45, 46, 47],
  SIZES_FEMALE: [35, 36, 37, 38, 39, 40, 41],
  SIZES_ALL:    [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46],

  HOT_SIZES_MALE:   [40, 41, 42, 43],
  HOT_SIZES_FEMALE: [37, 38, 39, 40],

  GRID_BATCH: 24,
  MATCH_HISTORY_KEY: 'wow_match_seen',

  PROMO_FIXED: {},
};

// Фейкові відгуки прибрано 3 липня 2026 (рішення власника):
// доки нема реальних, сайт показує чесний стан «збираємо відгуки».
const STATIC_REVIEWS = [];
