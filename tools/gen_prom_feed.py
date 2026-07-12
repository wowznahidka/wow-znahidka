#!/usr/bin/env python3
"""Generates Prom.ua YML feed from products_auto.json with Telegram photos."""

import json, xml.etree.ElementTree as ET, re, sys, os
from datetime import datetime
from xml.dom import minidom

MARKUP = 600  # UAH markup added to every product
BASE_URL = "https://wowznahidka.github.io/wow-znahidka"
PRODUCTS_FILE = os.path.join(os.path.dirname(__file__), "../data/products_auto.json")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../data/prom_feed.xml")

CAT = {
    "Чоловік": ("1", "Кросівки чоловічі"),
    "Жінка": ("2", "Кросівки жіночі"),
}
CAT_DEFAULT = ("3", "Кросівки")


def safe_text(s):
    if not s:
        return ""
    # strip control chars except \n
    return re.sub(r"[\x00-\x08\x0b-\x1f\x7f]", "", str(s))


def build_description(p):
    parts = []
    if p.get("material"):
        parts.append(f"Матеріал: {p['material']}.")
    if p.get("sole"):
        parts.append(f"Підошва: {p['sole']}.")
    parts.append("✓ Оплата після примірки. Без передоплати.")
    parts.append("✓ Обмін/повернення 14 днів.")
    return " ".join(parts)


def main():
    with open(PRODUCTS_FILE, encoding="utf-8") as f:
        data = json.load(f)
    products = data["products"]

    root = ET.Element("yml_catalog", date=datetime.now().strftime("%Y-%m-%d"))
    shop = ET.SubElement(root, "shop")

    ET.SubElement(shop, "name").text = "WOW.ZNAHIDKA"
    ET.SubElement(shop, "company").text = "WOW.ZNAHIDKA"
    ET.SubElement(shop, "url").text = BASE_URL + "/"

    currencies = ET.SubElement(shop, "currencies")
    ET.SubElement(currencies, "currency", id="UAH", rate="1")

    categories = ET.SubElement(shop, "categories")
    ET.SubElement(categories, "category", id="1").text = "Кросівки чоловічі"
    ET.SubElement(categories, "category", id="2").text = "Кросівки жіночі"
    ET.SubElement(categories, "category", id="3").text = "Кросівки"

    offers = ET.SubElement(shop, "offers")

    offer_count = 0
    for p in products:
        pid = p["id"]
        gender = p.get("gender", "")
        cat_id, _ = CAT.get(gender, CAT_DEFAULT)
        price = int(p["price"]) + MARKUP
        product_url = f"{BASE_URL}/?product={pid}"
        desc = safe_text(build_description(p))
        name = safe_text(p.get("name", pid))
        vendor = safe_text(p.get("brand", ""))
        images = p.get("images", [])
        sizes = p.get("sizes", [])

        for size in sizes:
            offer_id = f"{pid}_{size}"
            offer = ET.SubElement(
                offers, "offer",
                id=offer_id,
                available="true",
                group_id=pid,
            )
            ET.SubElement(offer, "url").text = product_url
            ET.SubElement(offer, "price").text = str(price)
            ET.SubElement(offer, "currencyId").text = "UAH"
            ET.SubElement(offer, "categoryId").text = cat_id

            # up to 10 images per offer (Prom.ua limit)
            for img_url in images[:10]:
                ET.SubElement(offer, "picture").text = img_url

            ET.SubElement(offer, "name").text = name
            if vendor:
                ET.SubElement(offer, "vendor").text = vendor
            ET.SubElement(offer, "description").text = desc

            param = ET.SubElement(offer, "param", name="Розмір")
            param.text = str(size)

            offer_count += 1

    # pretty print
    raw = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    pretty = minidom.parseString(raw).toprettyxml(indent="  ", encoding="utf-8")
    with open(OUTPUT_FILE, "wb") as f:
        f.write(pretty)

    print(f"Generated {offer_count} offers from {len(products)} products → {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
