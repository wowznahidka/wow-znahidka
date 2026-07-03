#!/usr/bin/env python3
"""
Merge EasyDrop supplier XML with Telegram-parsed products.
- Groups EasyDrop per-size items into products
- Matches by name → uses our Telegram photos where available
- Unmatched → uses EasyDrop photo
- Appends new products to products_auto.json (skips duplicates)
"""

import json, re, xml.etree.ElementTree as ET, urllib.request, os, sys

MARKUP = 600
PRODUCTS_FILE = os.path.join(os.path.dirname(__file__), "../data/products_auto.json")
EASYDROP_URLS = {
    "Жінка": "https://easydrop.one/prom-export?key=96092464432393&pid=53190855225218",
    "Чоловік": "https://easydrop.one/prom-export?key=12876649057397&pid=53190855225218",
}
ED_CACHE = {
    "Жінка": "/tmp/babylon_women.xml",
    "Чоловік": "/tmp/general_men.xml",
}


def normalize_name(name):
    """Lowercase, strip trailing size number, collapse spaces."""
    n = name.lower().strip()
    n = re.sub(r'\s+\d{2,3}(\.\d)?\s*$', '', n)  # trailing size like " 42" or " 42.5"
    n = re.sub(r'[^\w\s]', ' ', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n


def name_tokens(name):
    return set(normalize_name(name).split())


def similarity(a_tokens, b_tokens):
    if not a_tokens or not b_tokens:
        return 0.0
    intersect = a_tokens & b_tokens
    return len(intersect) / max(len(a_tokens), len(b_tokens))


def extract_brand(name):
    parts = name.strip().split()
    return parts[0] if parts else ""


def parse_easydrop_xml(path, gender):
    """Returns list of grouped products from EasyDrop XML."""
    tree = ET.parse(path)
    root = tree.getroot()
    items_el = root.find('items')
    if items_el is None:
        return []

    groups = {}  # group_id → product dict
    for item in items_el:
        gid = item.get('group_id', item.get('id', ''))
        raw_name = (item.findtext('name') or '').strip()
        # strip trailing size from name
        size_str = (item.findtext('param') or '').strip()
        clean_name = re.sub(r'\s+' + re.escape(size_str) + r'\s*$', '', raw_name).strip()
        if not clean_name:
            clean_name = raw_name

        price_raw = item.findtext('priceuah') or '0'
        price = int(float(price_raw))
        image = (item.findtext('image') or '').strip()
        avail = (item.findtext('available') or 'true') == 'true'
        desc_raw = item.findtext('description') or ''
        # strip HTML tags from description
        desc = re.sub(r'<[^>]+>', ' ', desc_raw)
        desc = re.sub(r'\s+', ' ', desc).strip()

        # parse size
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
                "ed_photo": image,
            }
            # parse material/sole from description
            m = re.search(r'Матеріал:\s*([^\.]+)', desc)
            if m:
                groups[gid]["material"] = m.group(1).strip()

        if size and size not in groups[gid]["sizes"]:
            groups[gid]["sizes"].append(size)

    # sort sizes
    for g in groups.values():
        try:
            g["sizes"] = sorted(g["sizes"], key=float)
        except Exception:
            pass

    return list(groups.values())


def main():
    # Load existing products
    with open(PRODUCTS_FILE, encoding='utf-8') as f:
        catalog = json.load(f)
    existing = catalog.get('products', [])

    # Build lookup: normalized name → product
    existing_lookup = {}
    for p in existing:
        n = normalize_name(p.get('name', ''))
        existing_lookup[n] = p
    existing_ids = {p['id'] for p in existing}
    existing_tokens = {n: name_tokens(n) for n in existing_lookup}

    print(f"Existing products: {len(existing)}")

    new_products = []
    matched_count = 0
    unmatched_count = 0

    for gender, url in EASYDROP_URLS.items():
        xml_path = ED_CACHE.get(gender)
        if not xml_path or not os.path.exists(xml_path):
            print(f"Downloading {gender}...")
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            data = urllib.request.urlopen(req, timeout=30).read()
            xml_path = f"/tmp/easydrop_{gender}.xml"
            with open(xml_path, 'wb') as f:
                f.write(data)
        print(f"Parsing {gender} from {xml_path}...")
        ed_products = parse_easydrop_xml(xml_path, gender)
        print(f"  EasyDrop {gender}: {len(ed_products)} unique products")

        for ep in ed_products:
            # Skip if already in catalog by id
            if ep['id'] in existing_ids:
                continue

            # Try to find name match in existing catalog
            ep_tokens = name_tokens(ep['name'])
            best_score = 0.0
            best_match = None
            for norm_name, ex_p in existing_lookup.items():
                score = similarity(ep_tokens, existing_tokens[norm_name])
                if score > best_score:
                    best_score = score
                    best_match = ex_p

            if best_score >= 0.7 and best_match:
                # Use matched product's photos
                ep['images'] = best_match.get('images', [ep['ed_photo']])
                ep['image'] = best_match.get('image', ep['ed_photo'])
                matched_count += 1
            else:
                # Keep EasyDrop photo
                unmatched_count += 1

            # Clean up internal fields
            ep.pop('ed_photo', None)
            ep.pop('group_id', None)
            new_products.append(ep)

    print(f"\nPhoto matches: {matched_count} / {matched_count + unmatched_count}")
    print(f"New products to add: {len(new_products)}")

    if not new_products:
        print("Nothing to add.")
        return

    catalog['products'] = existing + new_products
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, ensure_ascii=False, separators=(',', ':'))
    print(f"Saved → {PRODUCTS_FILE} ({len(catalog['products'])} total products)")


if __name__ == "__main__":
    main()
