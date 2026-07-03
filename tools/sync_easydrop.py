#!/usr/bin/env python3
"""
Daily EasyDrop sync — full replace of ed_* products + GitHub push.
Run via cron: 0 6 * * * /usr/bin/python3 /home/vitro/wow-assistant/projects/wow-znahidka/tools/sync_easydrop.py
"""

import json, re, xml.etree.ElementTree as ET, urllib.request, urllib.error
import os, sys, base64, time

# ── Config ────────────────────────────────────────────────────────────────────

MARKUP = 600
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS_FILE = os.path.join(ROOT, "data/products_auto.json")

EASYDROP_URLS = {
    "Жінка":   "https://easydrop.one/prom-export?key=96092464432393&pid=53190855225218",
    "Чоловік": "https://easydrop.one/prom-export?key=12876649057397&pid=53190855225218",
}

GITHUB_REPO = "wowznahidka/wow-znahidka"
GITHUB_FILE = "data/products_auto.json"

# Load token from .env
ENV_FILE = os.path.join(os.path.dirname(ROOT), "../.env")
if not os.path.exists(ENV_FILE):
    ENV_FILE = "/home/vitro/wow-assistant/.env"

def load_env(path):
    env = {}
    try:
        for line in open(path):
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    except Exception:
        pass
    return env

_env = load_env(ENV_FILE)
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN") or _env.get("GITHUB_TOKEN", "")

# ── Name matching helpers ─────────────────────────────────────────────────────

def normalize_name(name):
    n = name.lower().strip()
    n = re.sub(r'\s+\d{2,3}(\.\d)?\s*$', '', n)
    n = re.sub(r'[^\w\s]', ' ', n)
    return re.sub(r'\s+', ' ', n).strip()

def name_tokens(name):
    return set(normalize_name(name).split())

def similarity(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / max(len(a), len(b))

def extract_brand(name):
    return name.strip().split()[0] if name.strip() else ""

# ── EasyDrop XML parser ───────────────────────────────────────────────────────

def parse_easydrop_xml(xml_bytes, gender):
    root = ET.fromstring(xml_bytes)
    items_el = root.find('items')
    if items_el is None:
        return []

    groups = {}
    for item in items_el:
        gid = item.get('group_id', item.get('id', ''))
        raw_name = (item.findtext('name') or '').strip()
        size_str = (item.findtext('param') or '').strip()
        clean_name = re.sub(r'\s+' + re.escape(size_str) + r'\s*$', '', raw_name).strip() or raw_name

        price_raw = item.findtext('priceuah') or '0'
        price = int(float(price_raw))
        image = (item.findtext('image') or '').strip()
        avail = (item.findtext('available') or 'true') == 'true'
        desc_raw = item.findtext('description') or ''
        desc = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', desc_raw)).strip()

        try:
            size = float(size_str)
            size = int(size) if size == int(size) else size
        except Exception:
            size = size_str

        if gid not in groups:
            groups[gid] = {
                "id": f"ed_{gid}",
                "group_id": gid,
                "name": clean_name,
                "brand": extract_brand(clean_name),
                "price": price + MARKUP,
                "gender": gender,
                "sizes": [],
                "images": [image] if image else [],
                "image": image,
                "isNew": False,
                "available": avail,
                "material": "",
                "sole": "",
                "tgLink": "",
                "_ed_photo": image,
            }
            m = re.search(r'Матеріал:\s*([^\.]+)', desc)
            if m:
                groups[gid]["material"] = m.group(1).strip()

        if size and size not in groups[gid]["sizes"]:
            groups[gid]["sizes"].append(size)

    for g in groups.values():
        try:
            g["sizes"] = sorted(g["sizes"], key=float)
        except Exception:
            pass

    return list(groups.values())

# ── Download helper ───────────────────────────────────────────────────────────

def download(url, timeout=30):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()

# ── GitHub push ───────────────────────────────────────────────────────────────

def gh_request(method, path, data=None):
    url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{path}"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code

def push_to_github(content_bytes):
    if not GITHUB_TOKEN:
        print("  WARN: no GITHUB_TOKEN, skip push")
        return False
    b64 = base64.b64encode(content_bytes).decode()
    for attempt in range(5):
        resp, status = gh_request("GET", GITHUB_FILE)
        sha = resp.get("sha") if status == 200 else None
        payload = {"message": "sync: EasyDrop daily update", "content": b64}
        if sha:
            payload["sha"] = sha
        _, status = gh_request("PUT", GITHUB_FILE, payload)
        if status in (200, 201):
            print(f"  GitHub push OK [{status}]")
            return True
        elif status == 409:
            print(f"  SHA conflict, retry {attempt+1}...")
            time.sleep(0.5)
        else:
            print(f"  GitHub push FAIL [{status}]")
            return False
    return False

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=== EasyDrop sync start ===")

    # 1. Load current catalog
    with open(PRODUCTS_FILE, encoding='utf-8') as f:
        catalog = json.load(f)

    existing = catalog.get('products', [])
    telegram_products = [p for p in existing if not p['id'].startswith('ed_')]
    print(f"Telegram products (keep): {len(telegram_products)}")

    # 2. Build name-match index from Telegram products
    tg_lookup = {}
    tg_tokens = {}
    for p in telegram_products:
        n = normalize_name(p.get('name', ''))
        tg_lookup[n] = p
        tg_tokens[n] = name_tokens(n)

    # 3. Download + parse EasyDrop feeds
    all_ed = []
    for gender, url in EASYDROP_URLS.items():
        print(f"Downloading {gender}...")
        try:
            xml_bytes = download(url)
        except Exception as e:
            print(f"  ERROR downloading {gender}: {e}")
            continue
        products = parse_easydrop_xml(xml_bytes, gender)
        print(f"  Parsed {len(products)} products")
        all_ed.extend(products)

    print(f"Total EasyDrop products: {len(all_ed)}")

    # 4. Match EasyDrop products to Telegram photos
    matched = 0
    for ep in all_ed:
        ep_tok = name_tokens(ep['name'])
        best_score, best_match = 0.0, None
        for norm, tokens in tg_tokens.items():
            s = similarity(ep_tok, tokens)
            if s > best_score:
                best_score, best_match = s, tg_lookup[norm]

        if best_score >= 0.7 and best_match:
            ep['images'] = best_match.get('images', [ep['_ed_photo']])
            ep['image']  = best_match.get('image', ep['_ed_photo'])
            matched += 1

        ep.pop('_ed_photo', None)
        ep.pop('group_id', None)

    print(f"Photo matches: {matched} / {len(all_ed)}")

    # 5. Rebuild catalog: Telegram first, then fresh EasyDrop
    catalog['products'] = telegram_products + all_ed
    total = len(catalog['products'])
    print(f"Total products: {total}")

    # 6. Save locally
    content_bytes = json.dumps(catalog, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    with open(PRODUCTS_FILE, 'wb') as f:
        f.write(content_bytes)
    print(f"Saved locally: {PRODUCTS_FILE}")

    # 7. Push to GitHub
    push_to_github(content_bytes)

    print("=== Done ===")

if __name__ == "__main__":
    main()
