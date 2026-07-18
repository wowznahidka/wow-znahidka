#!/usr/bin/env python3
"""
Авторизація граббера через QR-код Telegram.
Запусти один раз — далі grabber_general_stores.py працює без коду.
"""
import asyncio
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError

api_id   = 39155326
api_hash = 'f5fdd929b4bcc48bb9970aa3b2945c18'

async def auth():
    client = TelegramClient('grabber_session', api_id, api_hash)
    await client.connect()

    if await client.is_user_authorized():
        me = await client.get_me()
        print(f"✅ Вже авторизований як {me.first_name} (@{me.username})")
        await client.disconnect()
        return

    print("📱 QR-авторизація...")
    print()

    try:
        qr_login = await client.qr_login()

        # Виводимо QR в термінал (ASCII)
        try:
            import qrcode
            qr = qrcode.QRCode(border=1)
            qr.add_data(qr_login.url)
            qr.print_ascii(invert=True)
        except ImportError:
            print("Відкрий в Telegram: Налаштування → Пристрої → Підключити пристрій")
            print(f"Або URL: {qr_login.url}")

        print()
        print("Скануй QR-код в Telegram → Налаштування → Пристрої → Підключити пристрій")
        print("Очікую...")

        await qr_login.wait(timeout=300)
        print()
        print("✅ Авторизація успішна! Тепер можна запускати grabber_general_stores.py")

    except SessionPasswordNeededError:
        pwd = input("Введи пароль 2FA: ")
        await client.sign_in(password=pwd)
        print("✅ Авторизація з 2FA успішна!")

    await client.disconnect()

asyncio.run(auth())
