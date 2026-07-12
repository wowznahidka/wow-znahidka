#!/usr/bin/env python3
"""
Перцептивна дедуплікація фото в каталозі.

Проблема: збагачення з easydrop фіду додало друге фото, яке часто є тим самим
кадром під іншим URL. Галерея з двох однакових фото виглядає як глюк.

Рішення: average-hash 8x8 по сірому; відстань Геммінга <= 6 → те саме фото,
лишаємо одне. Хеші кешуються в tools/.photo_hashes.json (щоб не тягнути повторно).

Використовується і як разовий фікс (python3 tools/photo_dedupe.py --apply),
і як бібліотека для sync_sheet.py (functions: ahash_url, hamming, dedupe_images).
"""
import json, os, sys, time, io, urllib.request
import threading
from concurrent.futures import ThreadPoolExecutor

_lock = threading.Lock()

try:
    from PIL import Image
except ImportError:
    Image = None

CACHE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.photo_hashes.json')
_cache = None


def _load_cache():
    global _cache
    if _cache is None:
        try:
            with open(CACHE_PATH) as f:
                _cache = json.load(f)
        except Exception:
            _cache = {}
    return _cache


def _save_cache():
    if _cache is not None:
        with _lock:
            snapshot = dict(_cache)
        with open(CACHE_PATH, 'w') as f:
            json.dump(snapshot, f)


def ahash_url(url, timeout=25):
    """Average hash 8x8 картинки за URL (hex-рядок) або None при помилці."""
    cache = _load_cache()
    if url in cache:
        return cache[url]
    if Image is None:
        return None
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        data = urllib.request.urlopen(req, timeout=timeout).read()
        im = Image.open(io.BytesIO(data)).convert('L').resize((8, 8))
        px = list(im.getdata())
        avg = sum(px) / 64
        bits = ''.join('1' if p > avg else '0' for p in px)
        h = f'{int(bits, 2):016x}'
    except Exception:
        h = None
    with _lock:
        cache[url] = h
    return h


def hamming(h1, h2):
    if not h1 or not h2:
        return 64
    return bin(int(h1, 16) ^ int(h2, 16)).count('1')


def dedupe_images(urls, threshold=6):
    """Повертає список URL без перцептивних дублів (порядок збережено)."""
    kept, hashes = [], []
    for u in urls:
        h = ahash_url(u)
        if h is None:
            kept.append(u); hashes.append(None); continue
        if any(hh and hamming(h, hh) <= threshold for hh in hashes):
            continue
        kept.append(u); hashes.append(h)
    return kept


# ── разовий фікс каталогу ─────────────────────────────────────
def _gh_headers():
    tok = ''
    with open('/home/vitro/wow-assistant/.env') as f:
        for line in f:
            if line.startswith('GITHUB_TOKEN='):
                tok = line.split('=', 1)[1].strip()
    return {'Authorization': f'token {tok}', 'Accept': 'application/vnd.github.v3+json'}


def main():
    apply = '--apply' in sys.argv
    import base64
    req = urllib.request.Request(
        'https://api.github.com/repos/wowznahidka/wow-znahidka/contents/data/products_auto.json',
        headers=_gh_headers())
    meta = json.loads(urllib.request.urlopen(req, timeout=30).read())
    catalog = json.loads(base64.b64decode(meta['content'].replace('\n', '')))
    sha = meta['sha']

    multi = [p for p in catalog['products'] if len(p.get('images', [])) > 1]
    print(f'товарів з 2+ фото: {len(multi)}')

    # прогріваємо кеш хешів паралельно
    urls = sorted({u for p in multi for u in p['images']})
    print(f'унікальних URL: {len(urls)} — рахую хеші…')
    _load_cache()
    todo = [u for u in urls if u not in _cache]
    with ThreadPoolExecutor(16) as ex:
        for i, _ in enumerate(ex.map(ahash_url, todo)):
            if i % 200 == 0:
                print(f'  {i}/{len(todo)}'); _save_cache()
    _save_cache()

    fixed = 0
    for p in multi:
        clean = dedupe_images(p['images'])
        if len(clean) < len(p['images']):
            p['images'] = clean
            p['image'] = clean[0]
            fixed += 1
    print(f'полагоджено (прибрано дублі): {fixed}')

    if not apply:
        print('dry-run — без публікації (запусти з --apply)'); return
    if not fixed:
        print('нема що публікувати'); return
    body = json.dumps({
        'message': f'photo dedupe: removed perceptual duplicates in {fixed} products',
        'content': base64.b64encode(json.dumps(catalog, ensure_ascii=False, indent=2).encode()).decode(),
        'branch': 'main', 'sha': sha,
    }).encode()
    put = urllib.request.Request(
        'https://api.github.com/repos/wowznahidka/wow-znahidka/contents/data/products_auto.json',
        data=body, method='PUT', headers={**_gh_headers(), 'Content-Type': 'application/json'})
    r = urllib.request.urlopen(put, timeout=120)
    print('✅ опубліковано' if r.status in (200, 201) else f'❌ {r.status}')


if __name__ == '__main__':
    main()
