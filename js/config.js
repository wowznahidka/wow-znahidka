/* ============================================================
   WOW.ZNAHIDKA — CONFIGURATION
   All constants live here. Never scatter magic strings.
   ============================================================ */

const CFG = {
  GAS_URL:  'https://script.google.com/macros/s/AKfycbxnbKNfrT38T4c7drhOI5IomuFzLNCeXZPykGwBSQpgtZUkme6Ip91Zio9weRgQYs-mCw/exec',
  TG_URL:   'https://t.me/topznahidka',
  IG_URL:   'https://www.instagram.com/wow.znahidka/',
  TT_URL:   'https://www.tiktok.com/@wow.znahidka',

  // ── Google Analytics 4 ───────────────────────── */
  // Вставте свій Measurement ID з analytics.google.com (вигляд: G-XXXXXXXXXX)
  GA_ID: 'G-9L346ZDWLK',

  // ── Meta Pixel ───────────────────────────────── */
  // Вставте свій Pixel ID з business.facebook.com (вигляд: 1234567890)
  FB_PIXEL_ID: '970568042186153',

  // ── TikTok Pixel ─────────────────────────────── */
  // Вставте свій Pixel ID з TikTok Ads Manager
  TT_PIXEL_ID: '',

  // ── OG Image ─────────────────────────────────── */
  // Абсолютний URL банера 1200×630 для превʼю посилань
  OG_IMAGE: 'https://wowznahidka.github.io/wow-znahidka/og-cover.png',


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

  PROMO_FIXED: {
    'WOW100': 100,
  },
};

const STATIC_REVIEWS = [
  { emoji:'😍', author:'Аня',     location:'Київ',   stars:5, text:'New Balance 9060 — боялася не вгадати з розміром, написала в Telegram, підказали. Прийшли за 2 дні, відкрила на пошті, взяла одразу 🔥' },
  { emoji:'😄', author:'Дмитро',  location:'Харків', stars:5, text:'Брав Adidas Samba. Взяв 2 розміри — один не підійшов, повернув без питань. Оплата після примірки — реально зручно, жодного ризику!' },
  { emoji:'🙂', author:'Катя М.', location:'Львів',  stars:4, text:'Побачила в Instagram, довго думала чи замовляти 😅 Взяла Nike Dunk Low. Чекала 3 дні — трохи довгувато, але кросівки 1 в 1 як на фото, задоволена.' },
  { emoji:'😎', author:'Олег',    location:'Дніпро', stars:5, text:'Asics Gel-NYC для щоденного носіння. Все відповідає опису, доставка шустра. Вже друге замовлення — обидва рази без нарікань 👍' },
  { emoji:'🤩', author:'Марина',  location:'Одеса',  stars:4, text:'Знайшла через TikTok, взяла Jordan 4. Ціна краща ніж у магазинах. Одне фото в описі було темне, але живцем — навіть краще виглядають!' },
];
