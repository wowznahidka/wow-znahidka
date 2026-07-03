#!/usr/bin/env python3
"""
Cleanup products_auto.json:
- Remove fake entries (ДОДАТКОВИЙ/РЕКЛАМНИЙ/НОВИЙ КОНТЕНТ)
- Remove duplicates (same name, keep version with most images)
- Clean names: strip __, ⚠️, 📱 QR, flag texts
- Clean material/sole fields: strip __
- Notify owner via Telegram
"""
import os
import re
import json
import base64
import requests

ENV_PATH = '/home/vitro/wow-assistant/.env'
GITHUB_REPO = 'wowznahidka/wow-znahidka'
GITHUB_BRANCH = 'main'
AUTO_JSON = 'data/products_auto.json'

SKIP_NAMES = [
    'додатковий контент', 'рекламний контент', 'новий контент',
    'нова модель', 'нові надходження', 'нове надходження',
    'поповнили', 'поповнення', 'нові кросівки', 'новинки',
]


def _env(key: str) -> str:
    try:
        with open(ENV_PATH) as f:
            for line in f:
                if line.startswith(f'{key}='):
                    return line.split('=', 1)[1].strip()
    except Exception:
        pass
    return os.environ.get(key, '')


def gh_get_file(path: str):
    r = requests.get(
        f'https://api.github.com/repos/{GITHUB_REPO}/contents/{path}',
        headers={'Authorization': f'token {_env("GITHUB_TOKEN")}', 'Accept': 'application/vnd.github.v3+json'},
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
    r = requests.put(
        f'https://api.github.com/repos/{GITHUB_REPO}/contents/{path}',
        json=payload,
        headers={'Authorization': f'token {_env("GITHUB_TOKEN")}', 'Accept': 'application/vnd.github.v3+json'},
        timeout=60,
    )
    return r.status_code in (200, 201)


def clean_field(s: str) -> str:
    if not isinstance(s, str):
        return s
    s = re.sub(r'_{2,}', '', s)
    s = re.sub(r'[⚠️📱🇻🇳]+', '', s)
    s = re.sub(r'QR\s*код\s*на\s*бірці\s*сканується', '', s, flags=re.IGNORECASE)
    s = re.sub(r'Маломірять', '', s, flags=re.IGNORECASE)
    s = re.sub(r'Більшомірять', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\s{2,}', ' ', s)
    return s.strip(' ,')


def is_fake(product: dict) -> bool:
    name = product.get('name', '').lower()
    return any(skip in name for skip in SKIP_NAMES)


def dedup(products: list) -> list:
    seen = {}
    for p in products:
        key = p.get('name', '').upper().strip()
        if key not in seen:
            seen[key] = p
        else:
            existing = seen[key]
            if len(p.get('images', [])) > len(existing.get('images', [])):
                seen[key] = p
    return list(seen.values())


def run():
    print("📥 Завантажую products_auto.json з GitHub...")
    content_bytes, sha = gh_get_file(AUTO_JSON)
    if not content_bytes:
        print("❌ Не вдалось отримати файл")
        return

    catalog = json.loads(content_bytes.decode('utf-8'))
    products = catalog.get('products', [])
    original_count = len(products)
    print(f"   Всього: {original_count} товарів")

    # 1. Remove fakes
    products = [p for p in products if not is_fake(p)]
    after_fake = len(products)
    print(f"🗑️  Видалено фейків: {original_count - after_fake}")

    # 2. Clean fields
    for p in products:
        for field in ('name', 'material', 'sole', 'gender', 'brand'):
            if field in p:
                p[field] = clean_field(p[field])

    # 3. Dedup by name (keep version with more photos)
    products = dedup(products)
    after_dedup = len(products)
    print(f"🔁 Видалено дублікатів: {after_fake - after_dedup}")

    print(f"✅ Залишилось: {after_dedup} товарів")

    catalog['products'] = products
    new_bytes = json.dumps(catalog, ensure_ascii=False, indent=2).encode('utf-8')
    ok = gh_put_file(AUTO_JSON, new_bytes, f'cleanup: {original_count}→{after_dedup} товарів', sha)

    if ok:
        print("✅ Каталог збережено на GitHub")
        _notify(original_count, after_fake, after_dedup)
    else:
        print("❌ Помилка запису на GitHub")


def _notify(original, after_fake, final):
    token = _env('TELEGRAM_BOT_TOKEN')
    owner = _env('TELEGRAM_OWNER_ID')
    if not token or not owner:
        return
    msg = (
        f"✅ Каталог почищено!\n\n"
        f"Було: {original}\n"
        f"Фейків видалено: {original - after_fake}\n"
        f"Дублікатів видалено: {after_fake - final}\n"
        f"Залишилось: {final} реальних товарів\n\n"
        f"Watcher запущено — нові товари → IG/TikTok автоматично 🚀"
    )
    requests.post(
        f'https://api.telegram.org/bot{token}/sendMessage',
        json={'chat_id': owner, 'text': msg},
        timeout=15,
    )


def launch_push(products: list, count: int = 5):
    """Post top products to IG+TikTok to kick off organic traffic."""
    import importlib.util, sys, os, time
    here = os.path.dirname(os.path.abspath(__file__))
    spec = importlib.util.spec_from_file_location('zernio_autopost', os.path.join(here, 'zernio_autopost.py'))
    zernio = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(zernio)

    PRIORITY_BRANDS = ['Dior', 'Louis Vuitton', 'Balenciaga', 'Off-White', 'Jordan', 'Yeezy', 'Versace', 'Fendi', 'Gucci', 'Kenzo', 'Moncler']

    with_images = [p for p in products if p.get('images') or p.get('image')]
    with_images.sort(key=lambda p: len(p.get('images', [])), reverse=True)

    priority = [p for p in with_images if any(b.lower() in p.get('name', '').lower() or b.lower() in p.get('brand', '').lower() for b in PRIORITY_BRANDS)]
    rest = [p for p in with_images if p not in priority]

    candidates = (priority + rest)[:count]
    posted = 0
    for p in candidates:
        try:
            ok = zernio.post_product(p)
            if ok:
                posted += 1
                print(f"  📱 Запостив: {p.get('name', '')[:40]}")
                time.sleep(8)
        except Exception as e:
            print(f"  ⚠️ Zernio launch push error: {e}")

    print(f"🚀 Launch push: {posted}/{len(candidates)} постів відправлено в IG+TikTok")


if __name__ == '__main__':
    import sys
    push_count = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    run()
    if push_count > 0:
        # Read products back after cleanup for push
        content_bytes, _ = gh_get_file(AUTO_JSON)
        if content_bytes:
            catalog = json.loads(content_bytes.decode('utf-8'))
            launch_push(catalog.get('products', []), push_count)
