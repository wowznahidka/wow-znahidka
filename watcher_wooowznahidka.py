#!/usr/bin/env python3
"""
Watcher: @wooowznahidka channel → products_auto.json (GitHub Pages)
Автоматично оновлює каталог при нових постах у каналі.
"""
import asyncio
import re
import os
import json
import base64
import requests as req_lib
from telethon import TelegramClient, events
from telethon.tl.types import MessageMediaPhoto
from zernio_autopost import post_product as zernio_post

# ── CONFIG ────────────────────────────────────────────────────
api_id   = 39155326
api_hash = 'f5fdd929b4bcc48bb9970aa3b2945c18'

SOURCE_CHANNEL = 'wooowznahidka'
GITHUB_REPO    = 'wowznahidka/wow-znahidka'
GITHUB_BRANCH  = 'main'
SITE_BASE      = 'https://wowznahidka.github.io/wow-znahidka'
AUTO_JSON      = 'data/products_auto.json'
ENV_PATH       = '/home/vitro/wow-assistant/.env'
SESSION_FILE   = '/home/vitro/wow-assistant/.secrets/watcher'  # поза git — сесії ніколи не комітяться

SKIP_NAMES = [
    'додатковий контент', 'рекламний контент', 'новий контент',
    'нова модель', 'нові надходження', 'нове надходження',
    'поповнили', 'поповнення', 'нові кросівки', 'новинки',
]

KNOWN_BRANDS = [
    'New Balance', 'Louis Vuitton', 'Under Armour', 'Stone Island',
    'Nike', 'Adidas', 'Jordan', 'Puma', 'Vans', 'Asics',
    'Balenciaga', 'Gucci', 'Yeezy', 'Converse', 'Reebok',
    'Salomon', 'Fila', 'Kenzo', 'Versace', 'Dior', 'Fendi',
    'Lanvin', 'Loro Piana', 'Moncler', 'Off-White', 'Palm Angels',
    'Kappa', 'Numeris', 'Crocs', 'Suicoke', 'Crep', 'Hoka',
]

client = TelegramClient(SESSION_FILE, api_id, api_hash)

album_buffer: dict = {}


# ── GITHUB ────────────────────────────────────────────────────
def _gh_token() -> str:
    try:
        with open(ENV_PATH) as f:
            for line in f:
                if line.startswith('GITHUB_TOKEN='):
                    return line.split('=', 1)[1].strip()
    except Exception:
        pass
    return os.environ.get('GITHUB_TOKEN', '')


def gh_get_file(path: str):
    r = req_lib.get(
        f'https://api.github.com/repos/{GITHUB_REPO}/contents/{path}',
        headers={'Authorization': f'token {_gh_token()}', 'Accept': 'application/vnd.github.v3+json'},
        timeout=30,
    )
    if r.status_code == 200:
        data = r.json()
        return base64.b64decode(data['content']), data['sha']
    return None, None


def gh_put_file(path: str, content: bytes, message: str, sha: str = None) -> bool:
    payload = {
        'message': message,
        'content': base64.b64encode(content).decode(),
        'branch': GITHUB_BRANCH,
    }
    if sha:
        payload['sha'] = sha
    r = req_lib.put(
        f'https://api.github.com/repos/{GITHUB_REPO}/contents/{path}',
        json=payload,
        headers={'Authorization': f'token {_gh_token()}', 'Accept': 'application/vnd.github.v3+json'},
        timeout=60,
    )
    return r.status_code in (200, 201)


# ── PARSE ─────────────────────────────────────────────────────
def _clean_field(s: str) -> str:
    s = re.sub(r'_{2,}', '', s)  # remove __
    s = re.sub(r'[✅⚠️📱🇻🇳]+', '', s)
    return s.strip(' ,')


def parse_caption(text: str) -> dict | None:
    if not text:
        return None
    clean = re.sub(r'\*\*', '', text)
    if any(skip in clean.lower() for skip in SKIP_NAMES):
        return None
    lines = [l.strip() for l in clean.split('\n') if l.strip()]
    p = {}
    for line in lines:
        if line.startswith('✅') and 'name' not in p:
            raw = re.sub(r'^[✅\s]+', '', line).strip()
            if '|' in raw:
                parts = raw.split('|', 1)
                p['name'] = _clean_field(parts[0])
                p['gender'] = _clean_field(parts[1])
            else:
                p['name'] = _clean_field(raw)
        elif '💰' in line or 'Ціна:' in line:
            m = re.search(r'(\d[\d\s]*)\s*грн', line)
            if m:
                p['price'] = int(re.sub(r'\s', '', m.group(1)))
        elif '📏' in line or 'Розміри:' in line:
            raw_sizes = re.sub(r'.*Розміри:\s*', '', line).strip()
            # extract fit notes before stripping
            if 'Маломірять' in raw_sizes:
                p['fit_note'] = 'Маломірять'
            elif 'Більшомірять' in raw_sizes:
                p['fit_note'] = 'Більшомірять'
            p['sizes_raw'] = re.sub(r'\(.*?\)', '', raw_sizes).strip()
        elif '🧵' in line or 'Матеріал:' in line:
            p['material'] = _clean_field(re.sub(r'.*Матеріал:\s*', '', line))
        elif '👟' in line or 'Підошва:' in line:
            p['sole'] = _clean_field(re.sub(r'.*Підошва:\s*', '', line))
    if not p.get('name') or not p.get('price'):
        return None
    return p


def sizes_to_list(raw: str) -> list:
    nums = [int(n) for n in re.findall(r'\d{2}', raw) if 30 <= int(n) <= 55]
    if len(nums) == 2 and nums[1] > nums[0]:
        return list(range(nums[0], nums[1] + 1))
    return sorted(set(nums))


def extract_brand(name: str) -> str:
    for brand in KNOWN_BRANDS:
        if brand.upper() in name.upper():
            return brand
    first = name.split()[0] if name.split() else ''
    return first.title() if len(first) >= 3 else name


# ── PROCESS ALBUM ─────────────────────────────────────────────
async def process_album(messages: list):
    messages.sort(key=lambda m: m.id)
    main_msg = next((m for m in messages if m.text), messages[0])
    parsed = parse_caption(main_msg.text)
    if not parsed:
        snippet = (main_msg.text or '')[:60].replace('\n', ' ')
        print(f"⏭ Скіп: {snippet}")
        return

    name     = parsed['name']
    price    = parsed.get('price', 0)
    gender   = parsed.get('gender', '')
    sizes_r  = parsed.get('sizes_raw', '')
    prod_id  = f'tg_{main_msg.id}'
    tg_link  = f'https://t.me/wooowznahidka/{main_msg.id}'
    print(f"\n📦 {name} | {price} грн | {prod_id}")

    photo_urls = []
    for i, msg in enumerate(messages, 1):
        if not isinstance(msg.media, MessageMediaPhoto):
            continue
        try:
            data = await client.download_media(msg.media, file=bytes)
            if not data:
                continue
            path = f'data/photos/{prod_id}/{i}.jpg'
            if gh_put_file(path, data, f'photo {prod_id} #{i}'):
                photo_urls.append(f'{SITE_BASE}/{path}')
                print(f"  📸 {i} → GitHub ✓")
        except Exception as e:
            print(f"  ⚠️ Фото {i}: {e}")

    if not photo_urls:
        print(f"  ⚠️ Жодного фото для {prod_id}")
        return

    product = {
        'id': prod_id, 'brand': extract_brand(name), 'name': name,
        'price': price, 'sizes': sizes_to_list(sizes_r), 'gender': gender,
        'isNew': True, 'available': True, 'tgLink': tg_link,
        'images': photo_urls, 'image': photo_urls[0],
    }
    if parsed.get('material'):
        product['material'] = parsed['material']
    if parsed.get('sole'):
        product['sole'] = parsed['sole']

    content_bytes, sha = gh_get_file(AUTO_JSON)
    if content_bytes:
        try:
            catalog = json.loads(content_bytes.decode('utf-8'))
        except Exception:
            catalog = {'products': []}
    else:
        catalog = {'products': []}

    catalog['products'] = [p for p in catalog['products'] if p.get('id') != prod_id]
    catalog['products'].insert(0, product)
    new_bytes = json.dumps(catalog, ensure_ascii=False, indent=2).encode('utf-8')
    ok = gh_put_file(AUTO_JSON, new_bytes, f'add {prod_id}', sha)
    if ok:
        print(f"  ✅ products_auto.json: {len(catalog['products'])} товарів")
        # Auto-post to Instagram & TikTok
        try:
            zernio_post(product)
        except Exception as ze:
            print(f"  ⚠️ Zernio: {ze}")
    else:
        print(f"  ⚠️ products_auto.json — помилка запису")


# ── ALBUM BUFFER ──────────────────────────────────────────────
async def flush_album_after_delay(grouped_id: int):
    await asyncio.sleep(4)
    msgs = album_buffer.pop(grouped_id, [])
    if msgs:
        await process_album(msgs)


@client.on(events.NewMessage(chats=SOURCE_CHANNEL))
async def on_new_message(event):
    msg = event.message
    if msg.grouped_id:
        if msg.grouped_id not in album_buffer:
            album_buffer[msg.grouped_id] = []
            asyncio.create_task(flush_album_after_delay(msg.grouped_id))
        album_buffer[msg.grouped_id].append(msg)
    else:
        await process_album([msg])


async def main():
    print("🚀 Watcher запущено — слухаю @wooowznahidka...")
    await client.start()
    print("✅ Підключено до Telegram. Очікую нові пости...")
    await client.run_until_disconnected()


if __name__ == '__main__':
    with client:
        client.loop.run_until_complete(main())
