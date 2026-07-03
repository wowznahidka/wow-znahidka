#!/usr/bin/env python3
"""
Синхронізація таблиці власника → сайт (data/products_auto.json).

Джерело: GAS web app (JSON усієї вкладки «Товари»).
Збагачення фото: easydrop prom-export XML (обидва постачальники) —
union фотографій по всіх розмірах однієї моделі.

Правила (узгоджено з власником 3 липня 2026):
- gas_* товари: upsert по ID — ціна (таблиця + MARKUP), розміри, стать, назва, isNew
- зник з таблиці → available=false (ховаємо, не видаляємо)
- фото: товар з 2+ фото (ТГ-альбоми) — НЕ чіпаємо; з одним фото — додаємо фото з фіду
- tg_* товари недоторканні
- страховки: таблиця віддала < MIN_SHEET_ITEMS → пропускаємо цикл;
  без реальних змін → нічого не публікуємо
- запис через GitHub Contents API з sha (як watcher) — безпечно при гонках

Cron: кожні 2 години (див. crontab). Лог: /tmp/sync_sheet.log
"""
import json, re, sys, time, base64
import urllib.request
import xml.etree.ElementTree as ET

GAS_URL = 'https://script.google.com/macros/s/AKfycbxnbKNfrT38T4c7drhOI5IomuFzLNCeXZPykGwBSQpgtZUkme6Ip91Zio9weRgQYs-mCw/exec'
EASYDROP_URLS = [
    'https://easydrop.one/prom-export?key=96092464432393&pid=53190855225218',  # Жінка
    'https://easydrop.one/prom-export?key=12876649057397&pid=53190855225218',  # Чоловік
]
GITHUB_REPO = 'wowznahidka/wow-znahidka'
GITHUB_FILE = 'data/products_auto.json'
ENV_PATH    = '/home/vitro/wow-assistant/.env'
BOT_LINK    = 'https://t.me/znahidkakrosiv_bot?start='

MARKUP          = 600   # ціна на сайті = ціна в таблиці + MARKUP (правило діючого каталогу)
MIN_SHEET_ITEMS = 600   # менше — вважаємо збоєм таблиці, нічого не чіпаємо


def log(msg):
    print(f'[{time.strftime("%Y-%m-%d %H:%M:%S")}] {msg}', flush=True)


def _gh_token():
    with open(ENV_PATH) as f:
        for line in f:
            if line.startswith('GITHUB_TOKEN='):
                return line.split('=', 1)[1].strip()
    return ''


def _http_json(url, timeout=60, retries=3):
    for i in range(retries):
        try:
            with urllib.request.urlopen(url, timeout=timeout) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:
            log(f'  спроба {i+1}/{retries} невдала: {e}')
            time.sleep(5 * (i + 1))
    return None


def gh_get_file():
    req = urllib.request.Request(
        f'https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FILE}',
        headers={'Authorization': f'token {_gh_token()}',
                 'Accept': 'application/vnd.github.v3+json'})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read().decode())
    return base64.b64decode(data['content'].replace('\n', '')), data['sha']


def gh_put_file(content_bytes, message, sha):
    payload = json.dumps({
        'message': message,
        'content': base64.b64encode(content_bytes).decode(),
        'branch': 'main',
        'sha': sha,
    }).encode()
    req = urllib.request.Request(
        f'https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FILE}',
        data=payload, method='PUT',
        headers={'Authorization': f'token {_gh_token()}',
                 'Accept': 'application/vnd.github.v3+json',
                 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.status in (200, 201)


def parse_sizes(raw):
    """'43(2),44(2),45(1)' → [43, 44, 45]"""
    sizes = []
    for m in re.finditer(r'(\d{2}(?:\.5)?)', str(raw or '')):
        v = float(m.group(1))
        v = int(v) if v == int(v) else v
        if 34 <= v <= 50 and v not in sizes:
            sizes.append(v)
    return sizes


def fetch_photo_map():
    """easydrop фіди → {sheet_id: [фото...]} (union по розмірах моделі)."""
    photos = {}
    for url in EASYDROP_URLS:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'})
            with urllib.request.urlopen(req, timeout=120) as r:
                root = ET.fromstring(r.read())
            for item in root.find('items').findall('item'):
                bc = item.findtext('barcode') or ''
                m = re.match(r'^(.*)-(\d{6,})$', bc)
                key = m.group(1) if m else bc
                if not key:
                    continue
                bucket = photos.setdefault(key, [])
                for img in item.findall('image'):
                    u = (img.text or '').strip()
                    if u and u not in bucket:
                        bucket.append(u)
        except Exception as e:
            log(f'  ⚠️ easydrop фід недоступний ({e}) — збагачення фото частково пропущено')
    return photos


def main():
    dry = '--dry-run' in sys.argv

    log('SYNC старт')
    sheet = _http_json(GAS_URL)
    if not sheet or not isinstance(sheet.get('products'), list):
        log('❌ GAS не відповів — пропускаю цикл'); return 1
    rows = [r for r in sheet['products'] if str(r.get('ID', '')).strip()]
    if len(rows) < MIN_SHEET_ITEMS:
        log(f'❌ Таблиця віддала лише {len(rows)} рядків (< {MIN_SHEET_ITEMS}) — схоже на збій, пропускаю'); return 1
    log(f'  таблиця: {len(rows)} товарів')

    photo_map = fetch_photo_map()
    log(f'  фото-мапа: {len(photo_map)} моделей, з 2+ фото: {sum(1 for v in photo_map.values() if len(v) > 1)}')

    raw, sha = gh_get_file()
    catalog = json.loads(raw.decode('utf-8'))
    products = catalog['products']
    by_id = {str(p.get('id', '')): p for p in products}
    log(f'  каталог: {len(products)} товарів')

    added = updated = hidden = photo_boost = 0
    sheet_ids = set()

    for r in rows:
        sid = str(r['ID']).strip()
        gid = 'gas_' + sid
        sheet_ids.add(gid)
        price_raw = r.get('Ціна')
        try:
            price = int(float(str(price_raw).replace(' ', ''))) + MARKUP
        except (TypeError, ValueError):
            continue  # без ціни не публікуємо
        old_raw = str(r.get('Стара ціна') or '').replace(' ', '')
        old_price = (int(float(old_raw)) + MARKUP) if old_raw.replace('.', '').isdigit() else None
        sizes = parse_sizes(r.get('Розміри'))
        gender = str(r.get('Стать') or '').strip()
        if gender not in ('Чоловік', 'Жінка'):
            gender = 'Змішана'
        sheet_photo = str(r.get('Фото') or '').strip()

        cur = by_id.get(gid)
        if cur is None:
            images = list(photo_map.get(sid, []))
            if sheet_photo and sheet_photo not in images:
                images.insert(0, sheet_photo)
            if not images:
                continue  # товар без жодного фото не публікуємо
            item = {
                'id': gid,
                'brand': str(r.get('Бренд') or '').strip(),
                'name': str(r.get('Назва') or '').strip(),
                'price': price,
                'sizes': sizes,
                'gender': gender,
                'isNew': bool(r.get('Нове')),
                'available': True,
                'image': images[0],
                'images': images,
                'tgLink': BOT_LINK + gid,
            }
            if old_price and old_price > price:
                item['oldPrice'] = old_price
            products.append(item)
            by_id[gid] = item
            added += 1
        else:
            changed = False
            for field, val in (('price', price), ('sizes', sizes), ('gender', gender),
                               ('isNew', bool(r.get('Нове')))):
                if cur.get(field) != val:
                    cur[field] = val; changed = True
            if old_price and old_price > price and cur.get('oldPrice') != old_price:
                cur['oldPrice'] = old_price; changed = True
            if not cur.get('available', True):
                cur['available'] = True; changed = True  # повернувся в наявність
            # фото: 2+ (ТГ-альбом чи вже збагачене) — не чіпаємо
            imgs = cur.get('images') or ([cur['image']] if cur.get('image') else [])
            if len(imgs) <= 1:
                extra = [u for u in photo_map.get(sid, []) if u not in imgs]
                if extra:
                    cur['images'] = imgs + extra
                    cur['image'] = cur['images'][0]
                    photo_boost += 1; changed = True
            updated += 1 if changed else 0

    # зникли з таблиці → ховаємо (тільки gas_*)
    for pid, p in by_id.items():
        if pid.startswith('gas_') and pid not in sheet_ids and p.get('available', True):
            p['available'] = False
            hidden += 1

    log(f'  підсумок: +{added} нових, ~{updated} оновлено, фото додано {photo_boost}, приховано {hidden}')

    if not (added or updated or photo_boost or hidden):
        log('  змін нема — публікація не потрібна'); return 0
    if dry:
        log('  DRY-RUN — нічого не публікую'); return 0

    new_bytes = json.dumps(catalog, ensure_ascii=False, indent=2).encode('utf-8')
    for attempt in range(3):
        try:
            if gh_put_file(new_bytes, f'sheet sync: +{added} new, {updated} upd, {photo_boost} photos, {hidden} hidden', sha):
                log('✅ Опубліковано'); return 0
        except urllib.error.HTTPError as e:
            if e.code in (409, 422):
                log('  конфлікт sha (watcher писав одночасно) — перечитую і повторюю')
                time.sleep(3)
                raw, sha = gh_get_file()
                # проста стратегія: у наступному циклі все зійдеться; зараз не зливаємо вручну
                return 1
            raise
    log('❌ Не вдалося опублікувати'); return 1


if __name__ == '__main__':
    sys.exit(main())
