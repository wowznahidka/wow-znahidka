#!/usr/bin/env python3
"""
Auto-post new products to Instagram & TikTok via Zernio.
Called by watcher_wooowznahidka.py after each new product is saved.
"""
import os
import requests
import tempfile

ENV_PATH = '/home/vitro/wow-assistant/.env'

INSTAGRAM_ID = '6a3302fc5f7d1751abf7cf4b'
TIKTOK_ID    = '6a3302df5f7d1751abf7cdc0'
ZERNIO_BASE  = 'https://api.zernio.com/v1'


def _zernio_key() -> str:
    try:
        with open(ENV_PATH) as f:
            for line in f:
                if line.startswith('ZERNIO_API_KEY='):
                    return line.split('=', 1)[1].strip()
    except Exception:
        pass
    return os.environ.get('ZERNIO_API_KEY', '')


def _build_caption(product: dict) -> str:
    name   = product.get('name', '')
    price  = product.get('price', '')
    sizes  = product.get('sizes', [])
    gender = product.get('gender', '')
    tglink = product.get('tgLink', 'https://t.me/wooowznahidka')

    # sizes range: "40-45" or list "42, 43, 44"
    if sizes and isinstance(sizes, list):
        if len(sizes) >= 2 and sizes[-1] - sizes[0] == len(sizes) - 1:
            sizes_str = f'{sizes[0]}-{sizes[-1]}'
        else:
            sizes_str = ', '.join(str(s) for s in sizes)
    else:
        sizes_str = ''

    lines = [f'✅ {name}']
    if gender:
        lines[0] += f' | {gender}'
    lines.append(f'💰 {price} грн')
    if sizes_str:
        lines.append(f'📏 Розміри: {sizes_str}')
    lines.append('')
    lines.append(f'🛒 Замовляй: {tglink}')
    lines.append('')

    # hashtags
    brand = product.get('brand', '').lower().replace(' ', '')
    tags = ['#кросівки', '#взуття', '#wowznahidka', '#купитикросівки', '#ukraine']
    if brand:
        tags.insert(0, f'#{brand}')
    lines.append(' '.join(tags))

    return '\n'.join(lines)


def _upload_image(image_url: str, key: str) -> str | None:
    """Download image from GitHub Pages and upload to Zernio. Returns Zernio media URL."""
    try:
        r = requests.get(image_url, timeout=30)
        if r.status_code != 200:
            print(f'  ⚠️ Zernio: не вдалось завантажити фото {image_url}')
            return None
        img_bytes = r.content
        size = len(img_bytes)

        # Step 1: get upload token
        resp = requests.post(
            f'{ZERNIO_BASE}/media/upload-token',
            headers={'Authorization': f'Bearer {key}'},
            json={'filename': 'photo.jpg', 'contentType': 'image/jpeg', 'size': size},
            timeout=30,
        )
        if resp.status_code not in (200, 201):
            print(f'  ⚠️ Zernio upload-token: {resp.status_code} {resp.text[:200]}')
            return None
        token = resp.json().get('token')
        if not token:
            print(f'  ⚠️ Zernio upload-token: no token in response')
            return None

        # Step 2: upload file
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            tmp.write(img_bytes)
            tmp_path = tmp.name

        with open(tmp_path, 'rb') as f:
            upload_resp = requests.post(
                f'{ZERNIO_BASE}/media/upload?token={token}',
                headers={'Authorization': f'Bearer {key}'},
                files={'files': ('photo.jpg', f, 'image/jpeg')},
                timeout=60,
            )
        os.unlink(tmp_path)

        if upload_resp.status_code not in (200, 201):
            print(f'  ⚠️ Zernio upload: {upload_resp.status_code} {upload_resp.text[:200]}')
            return None

        files = upload_resp.json().get('files', [])
        if files:
            return files[0].get('url')
        return None

    except Exception as e:
        print(f'  ⚠️ Zernio upload error: {e}')
        return None


def post_product(product: dict) -> bool:
    """Post product to Instagram & TikTok. Returns True if at least one platform succeeded."""
    key = _zernio_key()
    if not key:
        print('  ⚠️ ZERNIO_API_KEY not found')
        return False

    images = product.get('images', [])
    if not images:
        print('  ⚠️ Zernio: no images to post')
        return False

    # Use first image
    media_url = _upload_image(images[0], key)
    if not media_url:
        return False

    caption = _build_caption(product)

    payload = {
        'accountIds': [INSTAGRAM_ID, TIKTOK_ID],
        'platforms': [
            {'platform': 'instagram', 'accountId': INSTAGRAM_ID},
            {'platform': 'tiktok',    'accountId': TIKTOK_ID},
        ],
        'content': caption,
        'mediaItems': [{'url': media_url, 'type': 'image'}],
        'publishNow': True,
    }

    resp = requests.post(
        f'{ZERNIO_BASE}/posts',
        headers={'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'},
        json=payload,
        timeout=60,
    )

    if resp.status_code in (200, 201):
        print(f'  📱 Zernio: опубліковано в IG + TikTok ✓')
        return True
    else:
        print(f'  ⚠️ Zernio post: {resp.status_code} {resp.text[:300]}')
        return False
