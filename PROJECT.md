# WOW Znahidka — "Tinder для кросів"

## Ціль

Автоматизований каталог кросівок з реал-тайм синхронізацією з Telegram-каналом.
Власник постить кросівок у @wooowznahidka → товар сам потрапляє на сайт + автопостинг в Instagram і TikTok → трафік → продажі.

**Кінцева ціль:** системний дохід без ручної роботи. Tinder-формат = гортаєш фото, тиснеш замовити.

---

## Архітектура

```
Telegram @wooowznahidka
        ↓  (Telethon listener)
watcher_wooowznahidka.py
        ↓
  parse_caption() → product dict
        ↓ (паралельно)
  ┌─────┴─────────────────┐
  ↓                       ↓
GitHub Pages         zernio_autopost.py
products_auto.json    → Instagram @wow.znahidka
wowznahidka.github.io → TikTok @wow.znahidka
```

## Файли проєкту

| Файл | Що робить |
|------|-----------|
| `grabber_general_stores.py` | Одноразовий парсинг постачальницьких каналів → постинг у @wooowznahidka → JSON на GitHub |
| `watcher_wooowznahidka.py` | Постійний listener: новий пост у @wooowznahidka → GitHub + Zernio |
| `zernio_autopost.py` | Upload фото + публікація в IG/TikTok через Zernio API |
| `admin_products.py` | CLI: hide/show/delete/list товарів у products_auto.json |
| `js/api.js` | Frontend fetch каталогу, фільтрація available !== false |

## GitHub репо

`wowznahidka/wow-znahidka` — GitHub Pages
Каталог: `data/products_auto.json`
Фото: `data/photos/{prod_id}/{n}.jpg`
Сайт: `https://wowznahidka.github.io/wow-znahidka`

## Telegram

| Змінна | Значення |
|--------|----------|
| SOURCE_CHANNEL | `wooowznahidka` |
| SESSION_FILE | `grabber_session` (Telethon) |
| api_id | 39155326 |

## Zernio

| Акаунт | ID |
|--------|-----|
| Instagram @wow.znahidka | `6a3302fc5f7d1751abf7cf4b` |
| TikTok @wow.znahidka | `6a3302df5f7d1751abf7cdc0` |

API key: `ZERNIO_API_KEY` з `.env`

## Формат каталогу (products_auto.json)

```json
{
  "products": [
    {
      "id": "tg_12345",
      "brand": "Nike",
      "name": "NIKE AIR MAX 97 TRIPLE WHITE",
      "price": 2900,
      "sizes": [40, 41, 42, 43, 44, 45],
      "gender": "Чоловік",
      "available": true,
      "isNew": true,
      "tgLink": "https://t.me/wooowznahidka/12345",
      "images": ["https://wowznahidka.github.io/wow-znahidka/data/photos/tg_12345/1.jpg"],
      "image": "...",
      "material": "Лакована шкіра",
      "sole": "Піна, гума"
    }
  ]
}
```

`available: false` → товар прихований з сайту (admin_products.py hide).

## Алгоритм парсингу caption

Кожен пост у каналі має формат:
```
✅ НАЗВА ТОВАРУ | Чоловік/Жінка
💰 Ціна: 2900 грн
📏 Розміри: 40-45
🧵 Матеріал: Текстиль
👟 Підошва: Піна, гума
```

`parse_caption()` витягує поля по emoji-маркерах.
`SKIP_NAMES` — список слів для пропуску (ДОДАТКОВИЙ КОНТЕНТ, РЕКЛАМНИЙ КОНТЕНТ і т.д.).

## Поточний статус (29 червня 2026)

- [x] Grabber відпрацював, заповнив каталог
- [x] Watcher запущено, слухає @wooowznahidka
- [x] Zernio autopost вбудований у watcher
- [ ] Очистити фейкові товари (ДОДАТКОВИЙ/РЕКЛАМНИЙ КОНТЕНТ) з JSON
- [ ] Прибрати дублікати
- [ ] Почистити назви (МАЛОМІРЯТЬ 📦, ✅ ✅, __)
- [ ] Фільтри на сайті (гендер, розмір)
- [ ] Telegram-команди hide/show замість CLI

## Трафік — воронка

1. Товар у каналі @wooowznahidka
2. Watcher → сайт оновлено (реал-тайм)
3. Zernio → Instagram + TikTok пост (автоматично)
4. Клієнт бачить у соцмережах → переходить у бот → замовляє

## Дохід ціль

Зараз: 0 продажів. **Ціль: $2000/міс (~54-56k грн).**
Шлях: органічний трафік з IG/TikTok + Meta Ads + SEO на сайт.
