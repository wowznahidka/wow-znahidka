import asyncio
import re
import os
from telethon import TelegramClient
from telethon.tl.types import MessageMediaPhoto, MessageMediaDocument

# --- НАЛАШТУВАННЯ ---
api_id = 39155326
api_hash = 'f5fdd929b4bcc48bb9970aa3b2945c18'

SOURCE_CHANNEL = 'general_stores'
TARGET_CHANNEL = 'wooowznahidka'

MY_MARGIN = 450
POSTS_LIMIT = 500
DELAY_BETWEEN_POSTS = 15  # секунд між публікаціями

ORDER_LINK = 'https://t.me/znahidkawow'

client = TelegramClient('grabber_session', api_id, api_hash)


def extract_price(text: str) -> int | None:
    """Витягує ціну з тексту поста."""
    # Шукаємо патерни типу "Ціна: 2600 грн" або просто числа 1000-9999
    match = re.search(r'[Цц]іна[:\s]*(\d[\d\s]*)\s*грн', text)
    if match:
        return int(match.group(1).replace(' ', ''))
    # Fallback: перше число від 1000 до 9999
    for num in re.findall(r'\b(\d{4})\b', text):
        val = int(num)
        if 1000 <= val <= 9999:
            return val
    return None


def extract_sizes(text: str) -> str | None:
    """Витягує розміри з тексту."""
    match = re.search(r'[Рр]озміри[:\s]*([^\n]+)', text)
    if match:
        return match.group(1).strip().rstrip('.')
    # Fallback: шукаємо патерн типу "36-41" або "36, 37, 38"
    match = re.search(r'\b(3[6-9]|4[0-5])[\s\-–—,]+\d{2}\b', text)
    if match:
        return match.group(0).strip()
    return None


def extract_name(text: str) -> str | None:
    """Витягує назву товару."""
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for line in lines:
        # Пропускаємо службові рядки
        if any(skip in line.lower() for skip in [
            'новий товар', 'поповнення', 'менеджер', 'наявність',
            'живі фото', 'фото без', 'ціна', 'розмір', 'матеріал',
            'підошва', 'qr', '▪️', '⤵️', 'http', 't.me', 'crm'
        ]):
            continue
        # Перший рядок що схожий на назву (є латиниця або довжина > 3)
        if len(line) > 3:
            # Прибираємо emoji і спецсимволи з початку
            clean = re.sub(r'^[✅🔥💰👟🤝\s]+', '', line).strip()
            clean = clean.replace('*', '').strip()
            if clean:
                return clean
    return None


def extract_characteristics(text: str) -> dict:
    """Витягує характеристики: матеріал, підошва, QR."""
    result = {}
    
    mat = re.search(r'[Мм]атеріал[:\s]*([^\n]+)', text)
    if mat:
        result['material'] = mat.group(1).strip().rstrip('.')
    
    sole = re.search(r'[Пп]ідошва[:\s]*([^\n]+)', text)
    if sole:
        result['sole'] = sole.group(1).strip().rstrip('.')
    
    if re.search(r'qr|QR', text):
        result['qr'] = True

    return result


def build_caption(name: str, price: int, sizes: str, chars: dict) -> str:
    """Формує підпис для поста."""
    lines = [
        f"✅ **{name.upper()}**\n",
        f"💰 Ціна: **{price} грн**",
        f"📏 Розміри: {sizes}",
    ]
    
    if chars.get('material'):
        lines.append(f"🧵 Матеріал: {chars['material']}")
    if chars.get('sole'):
        lines.append(f"👟 Підошва: {chars['sole']}")
    if chars.get('qr'):
        lines.append(f"📱 QR код на бірці сканується")
    
    lines.append(f"\n🛒 [ЗАМОВИТИ]({ORDER_LINK})")
    
    return '\n'.join(lines)


def is_media_valid(media) -> bool:
    """Перевіряє чи є медіа фото або відео."""
    if media is None:
        return False
    if isinstance(media, MessageMediaPhoto):
        return True
    if isinstance(media, MessageMediaDocument):
        # Відео або GIF
        if media.document and media.document.mime_type:
            return media.document.mime_type.startswith('video/')
    return False


async def get_album_media(client, source, message):
    """Збирає всі медіа з поста + коментарів (до 10 штук)."""
    media_list = []
    
    # Медіа з самого поста
    if is_media_valid(message.media):
        media_list.append(message.media)
    
    # Медіа з коментарів
    try:
        async for reply in client.iter_messages(source, reply_to=message.id, limit=30):
            if is_media_valid(reply.media):
                media_list.append(reply.media)
            if len(media_list) >= 10:
                break
    except Exception as e:
        print(f"  ⚠️ Не вдалось отримати коментарі: {e}")
    
    return media_list


async def main():
    print("🚀 Запускаємо граббер general_stores → wooowznahidka")
    print(f"   Ліміт постів: {POSTS_LIMIT} | Націнка: +{MY_MARGIN} грн\n")
    
    await client.start()
    
    source = await client.get_entity(SOURCE_CHANNEL)
    target = await client.get_entity(TARGET_CHANNEL)
    
    messages = await client.get_messages(source, limit=POSTS_LIMIT)
    
    published = 0
    skipped_no_price = 0
    skipped_no_media = 0
    skipped_no_name = 0
    
    for message in reversed(messages):  # від старіших до новіших
        # Пропускаємо без тексту
        if not message.text:
            continue
        
        text = message.text
        
        # --- Парсимо дані ---
        name = extract_name(text)
        if not name:
            skipped_no_name += 1
            continue
        
        price_raw = extract_price(text)
        if not price_raw:
            print(f"  ⏭ Пропускаємо (немає ціни): {name[:40]}")
            skipped_no_price += 1
            continue
        
        sizes = extract_sizes(text)
        if not sizes:
            sizes = "уточнюйте"
        
        chars = extract_characteristics(text)
        final_price = price_raw + MY_MARGIN
        
        # --- Збираємо медіа ---
        media_list = await get_album_media(client, source, message)
        
        if not media_list:
            print(f"  ⏭ Пропускаємо (немає медіа): {name[:40]}")
            skipped_no_media += 1
            continue
        
        # --- Формуємо підпис ---
        caption = build_caption(name, final_price, sizes, chars)
        
        # --- Публікуємо ---
        try:
            print(f"  📤 Публікуємо: {name[:50]} | {final_price} грн | {len(media_list)} медіа")
            
            if len(media_list) == 1:
                await client.send_file(target, media_list[0], caption=caption)
            else:
                await client.send_file(target, media_list, caption=caption)
            
            published += 1
            
            # Зберігаємо останній опрацьований ID
            with open("last_processed_id.txt", "w") as f:
                f.write(str(message.id))
            
            await asyncio.sleep(DELAY_BETWEEN_POSTS)
            
        except Exception as e:
            print(f"  ❌ Помилка публікації '{name[:40]}': {e}")
            # Спробуємо тільки перше медіа
            try:
                await client.send_file(target, media_list[0], caption=caption)
                published += 1
                await asyncio.sleep(DELAY_BETWEEN_POSTS)
            except Exception as e2:
                print(f"  ❌ Повна помилка: {e2}")
    
    print(f"\n✅ Готово!")
    print(f"   Опубліковано: {published}")
    print(f"   Пропущено (немає ціни): {skipped_no_price}")
    print(f"   Пропущено (немає медіа): {skipped_no_media}")
    print(f"   Пропущено (немає назви): {skipped_no_name}")


if __name__ == '__main__':
    with client:
        client.loop.run_until_complete(main())