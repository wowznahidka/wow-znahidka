#!/usr/bin/env python3
"""
Daily social push: post 3 products from catalog to IG+TikTok via Zernio.
Run once per day. Tracks what was already posted in posted_ids.json.
"""
import os, sys, json, random, requests, base64

ENV_PATH = '/home/vitro/wow-assistant/.env'
GITHUB_REPO = 'wowznahidka/wow-znahidka'
GITHUB_BRANCH = 'main'
AUTO_JSON = 'data/products_auto.json'
POSTED_FILE = '/home/vitro/wow-assistant/projects/wow-znahidka/posted_ids.json'
DAILY_COUNT = int(sys.argv[1]) if len(sys.argv) > 1 else 3

PRIORITY_BRANDS = ['Jordan', 'Dior', 'Louis Vuitton', 'Balenciaga', 'Off-White',
                   'Yeezy', 'Versace', 'Fendi', 'Gucci', 'Nike', 'New Balance', 'Adidas']


def env(key):
    try:
        with open(ENV_PATH) as f:
            for line in f:
                if line.startswith(f'{key}='):
                    return line.split('=', 1)[1].strip()
    except Exception:
        pass
    return os.environ.get(key, '')


def load_posted():
    try:
        with open(POSTED_FILE) as f:
            return set(json.load(f))
    except Exception:
        return set()


def save_posted(ids: set):
    existing = load_posted()
    combined = existing | ids
    with open(POSTED_FILE, 'w') as f:
        json.dump(list(combined), f)


def fetch_catalog():
    token = env('GITHUB_TOKEN')
    headers = {'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'}
    r = requests.get(f'https://api.github.com/repos/{GITHUB_REPO}/contents/{AUTO_JSON}',
                     headers=headers, timeout=30)
    if r.status_code != 200:
        print(f'❌ GitHub fetch: {r.status_code}')
        return []
    data = json.loads(base64.b64decode(r.json()['content']).decode('utf-8'))
    return data.get('products', [])


def pick_candidates(products, posted, count):
    with_images = [p for p in products
                   if p.get('available') is not False
                   and (p.get('images') or p.get('image'))
                   and p.get('id') not in posted]

    with_images.sort(key=lambda p: (
        len(p.get('images', [])),                        # more photos = better
        next((i for i, b in enumerate(PRIORITY_BRANDS)  # brand priority
              if b.lower() in (p.get('name', '') + p.get('brand', '')).lower()), 99)
    ), reverse=False)

    # Take best by brand priority, randomize a bit from top N
    top_n = min(30, len(with_images))
    pool = with_images[:top_n]
    random.shuffle(pool)
    return pool[:count]


def post_product_zernio(product):
    import importlib.util
    here = os.path.dirname(os.path.abspath(__file__))
    spec = importlib.util.spec_from_file_location('zernio_autopost',
           os.path.join(here, 'zernio_autopost.py'))
    zernio = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(zernio)
    return zernio.post_product(product)


def run():
    print("📅 Daily social push start")
    products = fetch_catalog()
    if not products:
        print("❌ Catalog empty or unavailable")
        return

    posted = load_posted()
    candidates = pick_candidates(products, posted, DAILY_COUNT)

    if not candidates:
        print("⚠️ No new products to post — all done!")
        _notify_owner(0, len(products))
        return

    newly_posted = set()
    for p in candidates:
        name = p.get('name', '')[:50]
        try:
            ok = post_product_zernio(p)
            if ok:
                newly_posted.add(p['id'])
                print(f"  ✅ {name}")
            else:
                print(f"  ⚠️ Failed: {name}")
        except Exception as e:
            print(f"  ⚠️ Error {name}: {e}")

    save_posted(newly_posted)
    print(f"📱 Опубліковано {len(newly_posted)}/{len(candidates)} постів")
    _notify_owner(len(newly_posted), len(products))


def _notify_owner(posted_count, total):
    token = env('TELEGRAM_BOT_TOKEN')
    owner = env('TELEGRAM_OWNER_ID')
    if not token or not owner or posted_count == 0:
        return
    msg = f"📱 Щоденний постинг: {posted_count} кросівок опубліковано в IG+TikTok\nКаталог: {total} товарів"
    requests.post(f'https://api.telegram.org/bot{token}/sendMessage',
                  json={'chat_id': owner, 'text': msg}, timeout=15)


if __name__ == '__main__':
    run()
