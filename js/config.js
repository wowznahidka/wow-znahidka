/* ============================================================
   WOW.ZNAHIDKA — CONFIGURATION
   All constants live here. Never scatter magic strings.
   ============================================================ */

const CFG = {
  GAS_URL:  'https://script.google.com/macros/s/AKfycbxnbKNfrT38T4c7drhOI5IomuFzLNCeXZPykGwBSQpgtZUkme6Ip91Zio9weRgQYs-mCw/exec',
  TG_URL:        'https://t.me/+8xhWEOzGMW5jNjJi', // ← TG КАНАЛ (приватний інвайт — перевір "No expiry / no usage limit" у Manage Channel → Invite Links)
  TG_MANAGER:    'https://t.me/znahidkawow',     // ← МЕНЕДЖЕР DM (для запиту фото, питань)
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
  { emoji:'😍', author:'Аня',     location:'Київ',   stars:5, text:'NB 9060, плуталась між 38 і 39 — написала в TG, підказали взяти 38. Угадали. На пошті 200₴ застави, відкрила, поміряла, доплатила. Без всякої магії 🤍' },
  { emoji:'😄', author:'Дмитро',  location:'Харків', stars:5, text:'Adidas Samba, взяв два розміри щоб помацати. Один не підійшов — повернув на касі, гроші назад. Я думав так не буває' },
  { emoji:'🙂', author:'Катя М.', location:'Львів',  stars:4, text:'Nike Dunk Low. 3 дні чекала, трохи довше ніж казали. Але кроси норм — підошва біла, не сіра як в багатьох "оригіналів" з ОЛХ' },
  { emoji:'😎', author:'Олег',    location:'Дніпро', stars:5, text:'Asics Gel-NYC на щодень. Друге замовлення — перші Jordan брав в лютому. Жодного разу нічого не казали "почекайте" чи "немає в наявності"' },
  { emoji:'🤩', author:'Марина',  location:'Одеса',  stars:4, text:'Jordan 4 за 2700. У Sportmaster ті ж 4400. Не вірила що завезуть — завезли. Telegram-менеджер ще і дав знижку 100₴ "на наступне"' },
];
