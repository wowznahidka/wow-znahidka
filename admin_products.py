#!/usr/bin/env python3
"""
Admin tool: hide/show products in products_auto.json on GitHub.

Usage:
  python admin_products.py hide tg_12345
  python admin_products.py show tg_12345
  python admin_products.py list
  python admin_products.py delete tg_12345
"""
import sys
import os
import json
import base64
import requests

ENV_PATH    = '/home/vitro/wow-assistant/.env'
GITHUB_REPO = 'wowznahidka/wow-znahidka'
AUTO_JSON   = 'data/products_auto.json'
API_BASE    = 'https://api.github.com'


def _gh_token() -> str:
    try:
        with open(ENV_PATH) as f:
            for line in f:
                if line.startswith('GITHUB_TOKEN='):
                    return line.split('=', 1)[1].strip()
    except Exception:
        pass
    return os.environ.get('GITHUB_TOKEN', '')


def gh_get(path: str):
    token = _gh_token()
    url = f'{API_BASE}/repos/{GITHUB_REPO}/contents/{path}'
    r = requests.get(url, headers={'Authorization': f'token {token}'})
    if r.status_code == 200:
        data = r.json()
        return base64.b64decode(data['content']), data['sha']
    return None, None


def gh_put(path: str, content: bytes, message: str, sha: str) -> bool:
    token = _gh_token()
    url = f'{API_BASE}/repos/{GITHUB_REPO}/contents/{path}'
    payload = {
        'message': message,
        'content': base64.b64encode(content).decode(),
        'sha': sha,
        'branch': 'main',
    }
    r = requests.put(url, json=payload, headers={'Authorization': f'token {token}'})
    return r.status_code in (200, 201)


def load_catalog():
    content, sha = gh_get(AUTO_JSON)
    if not content:
        print('❌ Не вдалося завантажити products_auto.json')
        sys.exit(1)
    catalog = json.loads(content.decode('utf-8'))
    return catalog, sha


def save_catalog(catalog, sha, message):
    content = json.dumps(catalog, ensure_ascii=False, indent=2).encode('utf-8')
    ok = gh_put(AUTO_JSON, content, message, sha)
    if ok:
        print('✅ GitHub оновлено')
    else:
        print('❌ Помилка збереження на GitHub')
    return ok


def cmd_hide(product_id: str):
    catalog, sha = load_catalog()
    found = False
    for p in catalog['products']:
        if p.get('id') == product_id:
            p['available'] = False
            found = True
            print(f"📦 Ховаю: {p.get('name', product_id)}")
            break
    if not found:
        print(f'❌ Товар {product_id} не знайдено')
        return False
    return save_catalog(catalog, sha, f'hide {product_id}')


def cmd_show(product_id: str):
    catalog, sha = load_catalog()
    found = False
    for p in catalog['products']:
        if p.get('id') == product_id:
            p['available'] = True
            found = True
            print(f"✅ Показую: {p.get('name', product_id)}")
            break
    if not found:
        print(f'❌ Товар {product_id} не знайдено')
        return False
    return save_catalog(catalog, sha, f'show {product_id}')


def cmd_delete(product_id: str):
    catalog, sha = load_catalog()
    before = len(catalog['products'])
    catalog['products'] = [p for p in catalog['products'] if p.get('id') != product_id]
    after = len(catalog['products'])
    if before == after:
        print(f'❌ Товар {product_id} не знайдено')
        return False
    print(f'🗑 Видалено: {product_id}')
    return save_catalog(catalog, sha, f'delete {product_id}')


def cmd_list(filter_arg: str = None):
    catalog, _ = load_catalog()
    products = catalog.get('products', [])

    if filter_arg == 'hidden':
        products = [p for p in products if p.get('available') is False]
        print(f'Приховані товари ({len(products)}):')
    else:
        print(f'Всього товарів: {len(products)}')
        hidden = sum(1 for p in products if p.get('available') is False)
        print(f'Приховані: {hidden}')
        print()

    for p in products:
        status = '🔴' if p.get('available') is False else '🟢'
        print(f"{status} {p.get('id', '?')} | {p.get('name', '?')[:50]} | {p.get('price', '?')} грн")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    cmd = sys.argv[1].lower()
    arg = sys.argv[2] if len(sys.argv) > 2 else None

    if cmd == 'hide' and arg:
        cmd_hide(arg)
    elif cmd == 'show' and arg:
        cmd_show(arg)
    elif cmd == 'delete' and arg:
        cmd_delete(arg)
    elif cmd == 'list':
        cmd_list(arg)
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == '__main__':
    main()
