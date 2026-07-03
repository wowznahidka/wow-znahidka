#!/usr/bin/env python3
"""
Імпорт товарів з Google Sheets (через GAS web app) → data/products.json на GitHub.
Запускай вручну або раз на добу для оновлення каталогу.

Використання: python3 gas_import.py [--dry-run]
"""
import sys
import json
import re
import base64
import requests

GAS_URL     = 'https://script.google.com/macros/s/AKfycbxnbKNfrT38T4c7drhOI5IomuFzLNCeXZPykGwBSQpgtZUkme6Ip91Zio9weRgQYs-mCw/exec'
GITHUB_REPO = 'wowznahidka/wow-znahidka'
ENV_PATH    = '/home/vitro/wow-assistant/.env'
GITHUB_FILE = 'data/products.json'
ORDER_LINK  = 'https://t.me/znahidkakrosiv_bot'


def _gh_token() -> str:
    try:
        with open(ENV_PATH) as f:
            for line in f:
                if line.startswith('GITHUB_TOKEN='):
                    return line.split('=', 1)[1].strip()
    except Exception:
        pass
    return ''


def gh_get_file(path: str):
    r = requests.get(
        f'https://api.github.com/repos/{GITHUB_REPO}/contents/{path}',
        headers={'Authorization': f'token {_gh_token()}',
                 'Accept': 'application/vnd.github.v3+json'},
        timeout=15
    )
    if r.status_code == 200:
        data = r.json()
        return base64.b64decode(data['content'].replace('\n', '')), data['sha']
    return None, None


def gh_put_file(path: str, content_bytes: bytes, message: str, sha: str = None) -> bool:
    payload = {
        'message': message,
        'content': base64.b64encode(content_bytes).decode(),
        'branch':  'main',
    }
    if sha:
        payload['sha'] = sha
    r = requests.put(
        f'https://api.github.com/repos/{GITHUB_REPO}/contents/{path}',
        json=payload,
        headers={'Authorization': f'token {_gh_token()}',
                 'Accept': 'application/vnd.github.v3+json'},
        timeout=30
    )
    return r.status_code in (200, 201)


def parse_sizes(raw) -> list:
    """GAS format: '40(2),41(1),42(3)' or '40,41,42' or 'ONE SIZE'"""
    if not raw:
        return []
    s = str(raw).strip()
    if s.upper() == 'ONE SIZE':
        return ['ONE SIZE']
    nums = []
    # Format with qty: "40(2),41(1)"
    for m in re.finditer(r'\b(\d{2})\b', s):
        n = int(m.group(1))
        if 30 <= n <= 55:
            nums.append(n)
    return sorted(set(nums))


def normalize_gas_product(p: dict) -> dict:
    """Convert GAS product object → products.json format."""
    pid     = str(p.get('ID') or p.get('id') or '').strip()
    brand   = str(p.get('Бренд') or p.get('brand') or 'Unknown').strip()
    name    = str(p.get('Назва') or p.get('name') or '').strip()
    price   = int(p.get('Ціна') or p.get('price') or 0)
    old_p   = int(p.get('Стара ціна') or p.get('oldPrice') or 0)
    photo   = str(p.get('Фото') or p.get('photo') or p.get('image') or '').strip()
    sizes   = parse_sizes(p.get('Розміри') or p.get('sizes') or '')
    is_new  = bool(p.get('Нове') or p.get('isNew') or False)
    gender  = str(p.get('Стать') or p.get('gender') or '').strip()
    tg_link = str(p.get('TG') or p.get('tgLink') or ORDER_LINK).strip()
    supplier = int(p.get('Постачальник') or p.get('supplier') or 0)

    if not pid or not name or not price:
        return None

    result = {
        'id':        pid,
        'brand':     brand,
        'name':      name,
        'price':     price,
        'sizes':     sizes,
        'gender':    gender,
        'isNew':     is_new,
        'available': True,
        'tgLink':    tg_link or ORDER_LINK,
        'supplier':  supplier,
    }
    if old_p and old_p > price:
        result['oldPrice'] = old_p
    if photo:
        result['image']  = photo
        result['images'] = [photo]
    return result


def fetch_gas_products() -> list:
    print(f"🌐 Завантажую товари з GAS...")
    r = requests.get(GAS_URL, timeout=30)
    r.raise_for_status()
    data = r.json()

    raw = data.get('products') or data.get('data') or []
    if not raw:
        raise ValueError(f"GAS повернув 0 товарів. Відповідь: {str(data)[:200]}")

    print(f"   Отримано: {len(raw)} рядків")
    return raw


def main():
    dry_run = '--dry-run' in sys.argv

    raw = fetch_gas_products()

    products = []
    skipped  = 0
    for p in raw:
        normalized = normalize_gas_product(p)
        if normalized:
            products.append(normalized)
        else:
            skipped += 1

    print(f"   Валідних товарів: {len(products)} (пропущено: {skipped})")

    if not products:
        print("❌ Нема товарів для запису. Зупиняюсь.")
        return

    catalog   = {'products': products}
    new_bytes = json.dumps(catalog, ensure_ascii=False, indent=2).encode('utf-8')

    if dry_run:
        print(f"\n🔍 Dry-run: перші 3 товари:")
        for p in products[:3]:
            print(f"  {p['id']} | {p['brand']} {p['name']} | {p['price']} грн | sizes: {p['sizes']}")
        print(f"\nTotal: {len(products)} товарів. Нічого не записано (--dry-run).")
        return

    print(f"\n⬆️ Завантажую на GitHub ({GITHUB_FILE})...")
    _, sha = gh_get_file(GITHUB_FILE)
    ok = gh_put_file(GITHUB_FILE, new_bytes, f'import {len(products)} products from GAS', sha)

    if ok:
        print(f"✅ Готово! {len(products)} товарів → GitHub Pages")
        print(f"   https://wowznahidka.github.io/wow-znahidka/{GITHUB_FILE}")
    else:
        print(f"❌ Помилка запису на GitHub")


if __name__ == '__main__':
    main()
