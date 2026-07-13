/* ============================================================
   WOW.ZNAHIDKA — MODALS: SIZE PICKER & PRODUCT DETAIL
   ============================================================ */

function _copyText(text) {
  try {
    if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(text).catch(() => {}); return; }
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;pointer-events:none';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
  } catch(e) {}
}

// ── SIZE PICKER ───────────────────────────────────── */
let _autoSelectTimer = null;

function openSizePicker(product) {
  if (!product) return;
  clearTimeout(_autoSelectTimer);
  _autoSelectTimer = null;
  S.spProduct      = product;
  S.spSelectedSize = null;

  // Product info row
  document.getElementById('sp-product-info').innerHTML = `
    ${product.image && product.image.startsWith('http')
      ? `<img class="sp-img" src="${esc(product.image)}" alt="${esc(product.name)}" loading="lazy"
            onclick="event.stopPropagation();openImageZoom('${esc(product.image)}','${esc(product.brand)} ${esc(product.name)}',S.spProduct?.images)"
            onload="this.classList.add('loaded')">`
      : `<div class="sp-img-ph" aria-hidden="true"></div>`}
    <div class="sp-info">
      <div class="sp-brand">${esc(product.brand)}</div>
      <div class="sp-name">${esc(product.name)}</div>
      <div class="sp-price">${product.price}₴</div>
    </div>`;

  // Size grid
  const grid  = document.getElementById('sp-size-grid');
  const mySize = getRememberedSize();
  const hasMySz = mySize && (product.sizes.includes(mySize) || product.sizes.includes(String(mySize)));
  const low    = product.sizes.length === 1 && product.sizes[0] !== 'ONE SIZE';

  const qty = product.sizeQty || {};
  const hasQtyData = Object.keys(qty).length > 0;

  grid.innerHTML = product.sizes.map(sz => {
    const szArg    = sz === 'ONE SIZE' ? "'ONE SIZE'" : sz;
    const pairQty  = hasQtyData ? (qty[sz] || 1) : null;
    const isLast   = low || (hasQtyData && pairQty === 1);
    const badge    = (hasQtyData && pairQty >= 2)
      ? `<span class="sz-qty">${pairQty}</span>`
      : '';
    return `<button class="sz-btn${isLast ? ' sz-btn-last' : ''}" data-size="${sz}" onclick="selectSize(${szArg})" aria-label="Розмір ${sz}">
      ${sz}${badge}
    </button>`;
  }).join('');

  // My size shortcut
  const mySzWrap = document.getElementById('sp-my-size-bar-wrap');
  if (mySzWrap) {
    mySzWrap.innerHTML = hasMySz
      ? `<div class="sp-my-size-bar" role="button" onclick="selectSize(${mySize});_haptic(12)">
           ✅ ${L.mySizeLabel}: <strong>${mySize}</strong>
           <span style="margin-left:auto">${L.mySizeTap}</span>
         </div>`
      : '';
    if (hasMySz) {
      _autoSelectTimer = setTimeout(() => {
        if (S.spProduct && S.spProduct.id === product.id) selectSize(mySize);
        _autoSelectTimer = null;
      }, 80);
    }
  }

  // Urgency banner — один розмір залишився
  const urgencyEl  = document.getElementById('sp-urgency');
  const confirmBtn = document.querySelector('.sp-confirm-btn');
  const isLastSize = product.sizes.length === 1 && product.sizes[0] !== 'ONE SIZE';
  if (urgencyEl) {
    urgencyEl.innerHTML = isLastSize
      ? `<div class="sp-urgency-banner" role="alert">⚡ Останній розмір — бронюй зараз</div>`
      : '';
  }
  if (confirmBtn) {
    confirmBtn.style.background = isLastSize ? 'var(--red)' : '';
    confirmBtn.style.boxShadow  = isLastSize ? 'var(--shadow-red)' : '';
  }

  // Notify me panel
  const notifyWrap = document.getElementById('sp-notify-wrap');
  if (notifyWrap) {
    notifyWrap.innerHTML = `
      <button class="sp-notify-trigger" onclick="toggleNotifyPanel()">🔔 Немає мого розміру? Повідомити</button>
      <div class="sp-notify-panel" id="sp-notify-panel">
        <div class="sp-notify-label">Вкажіть бажаний розмір і телефон — ми повідомимо, коли з'явиться:</div>
        <div class="sp-notify-row">
          <input class="sp-notify-sz" id="sp-notify-sz" type="number" placeholder="Розмір" min="35" max="48">
          <input class="sp-notify-phone" id="sp-notify-phone" type="tel" placeholder="+380...">
        </div>
        <button class="sp-notify-send" onclick="submitNotifyMe()">🔔 Повідомити мене</button>
      </div>`;
  }

  // Open sheet
  closeAllSheets();
  document.getElementById('sheet-size')?.classList.add('on');
  document.getElementById('overlay')?.classList.add('on');
  _openSheetId = 'sheet-size';
}


function selectSize(sz) {
  S.spSelectedSize = sz;
  document.querySelectorAll('.sz-btn').forEach(b => {
    const bv = b.dataset.size;
    b.classList.toggle('sel', bv === String(sz) || Number(bv) === Number(sz));
  });
  rememberSize(sz);
  _haptic(12);
}

function requestPhoto() {
  if (!S.spProduct) return;
  const p = S.spProduct;
  // Якщо в товара є посилання на пост в каналі — там вже альбом фото, кидаємо туди
  if (p.tgLink) { openTgLink(p.tgLink); return; }
  const szText = S.spSelectedSize ? `Розмір: ${S.spSelectedSize}` : 'Розмір: уточнимо';
  const productUrl = `${location.origin}${location.pathname}?product=${p.id}`;
  const msg = `Привіт! 👋 Хочу побачити більше фото 📸\n👟 ${p.brand} ${p.name}\n${szText}\n💰 ${p.price}₴\n🔗 ${productUrl}`;
  openTgLink(`https://t.me/znahidkawow?text=${encodeURIComponent(msg)}`);
}

function confirmSize() {
  if (!S.spSelectedSize) {
    toast('⚠️ Оберіть розмір!');
    document.getElementById('sp-size-grid')?.animate(
      [{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'none' }],
      { duration: 240, iterations: 2 }
    );
    return;
  }
  const p        = S.spProduct;
  const sz       = S.spSelectedSize;
  const existing = S.cart.find(c => c.id === p.id && String(c.size) === String(sz));
  if (existing) {
    toast(`⚠️ ${esc(p.name)} (${sz}) вже є в кошику! <a onclick="openSheet('sheet-cart')">Переглянути →</a>`);
    closeAllSheets();
    return;
  }
  S.cart.push({ ...p, size: sz, qty: 1 });
  saveCart();
  updateBadges();
  renderCartSheet();
  closeAllSheets();
  _haptic([10, 30, 10]);
  // GA4 + Meta Pixel
  if (window.gtag) gtag('event', 'add_to_cart', { currency: 'UAH', value: p.price, items: [{ item_id: p.id, item_name: `${p.brand} ${p.name}`, price: p.price }] });
  if (window.fbq)  fbq('track', 'AddToCart', { currency: 'UAH', value: p.price, content_ids: [p.id], content_type: 'product' });
  if (window.ttq)  try { ttq.track('AddToCart', { currency: 'UAH', value: p.price, content_id: p.id, content_name: `${p.brand} ${p.name}`, content_type: 'product', quantity: 1 }); } catch(_) {}
  toast(`✅ ${esc(p.name)} (${sz}) — в кошику! <a onclick="openSheet('sheet-cart')">Переглянути →</a>`);
}

// ── PRODUCT DETAIL ────────────────────────────────── */

let _pdGalleryIdx = 0;

// Вертикальне (портретне) фото в hero-контейнері картки товару — не має
// обрізатись/бути ледь видимим, поки не відкрито zoom. Порівнюємо реальні
// naturalWidth/naturalHeight фото і додаємо/знімаємо .is-portrait на
// .pd-hero (CSS-правило — css/cards.css). Для мультифото-галереї синкаємо
// тільки те фото, яке зараз активне (data-idx === _pdGalleryIdx), щоб
// фонове довантаження інших слайдів не перебивало висоту контейнера.
function _pdSyncHeroOrientation(imgEl) {
  if (!imgEl || !imgEl.naturalWidth || !imgEl.naturalHeight) return;
  if (imgEl.classList.contains('pd-gallery-img') && Number(imgEl.dataset.idx) !== _pdGalleryIdx) return;
  const hero = imgEl.closest('.pd-hero');
  if (!hero) return;
  hero.classList.toggle('is-portrait', imgEl.naturalHeight > imgEl.naturalWidth * 1.05);
}

function pdGalleryGo(idx) {
  const track = document.getElementById('pd-gallery-track');
  if (!track) return;
  _pdGalleryIdx = idx;
  const slideW = (track.parentElement || track).clientWidth;
  track.style.transform = `translateX(-${idx * slideW}px)`;
  document.querySelectorAll('.pd-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  document.querySelectorAll('.pd-thumb').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
    if (i === idx) d.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
  const activeImg = track.querySelector(`.pd-gallery-img[data-idx="${idx}"]`);
  if (activeImg) _pdSyncHeroOrientation(activeImg);
}

function _initGalleryTouch(gallery) {
  let startX = 0, startY = 0, moved = false;
  gallery.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    moved = false;
  }, { passive: true });
  gallery.addEventListener('touchmove', () => { moved = true; }, { passive: true });
  gallery.addEventListener('touchend', e => {
    if (!moved) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      const total = document.querySelectorAll('.pd-thumb').length || document.querySelectorAll('.pd-dot').length;
      if (dx < 0 && _pdGalleryIdx < total - 1) pdGalleryGo(_pdGalleryIdx + 1);
      else if (dx > 0 && _pdGalleryIdx > 0)    pdGalleryGo(_pdGalleryIdx - 1);
    }
  }, { passive: true });
}

// ── Вибір розміру прямо в картці + головна CTA ──
function pdSelectSize(btn, size) {
  S.pdSize = size;
  _haptic(8);
  document.querySelectorAll('#pd-size-grid .pd-size-sel').forEach(b => b.classList.toggle('on', b === btn));
  const hint = document.getElementById('pd-size-hint');
  if (hint) { hint.textContent = '✓ розмір ' + size; hint.classList.add('ok'); }
  const main = document.getElementById('pd-btn-main');
  if (main) { main.textContent = `🛒 В кошик · розмір ${size}`; main.classList.add('ready'); }
}

function pdMainCta() {
  const p = S.pdProduct;
  if (!p) return;
  const oneSize = p.sizes[0] === 'ONE SIZE';
  if (!oneSize && !S.pdSize) {
    // м'яко підсвічуємо сітку розмірів
    const grid = document.getElementById('pd-size-grid');
    if (grid) {
      grid.classList.remove('pd-size-nudge'); void grid.offsetWidth;
      grid.classList.add('pd-size-nudge');
      grid.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    toast('👟 Спочатку обери розмір');
    return;
  }
  const sz = oneSize ? 'ONE SIZE' : S.pdSize;
  const exists = S.cart.find(c => c.id === p.id && String(c.size) === String(sz));
  if (!exists) S.cart.push({ ...p, size: oneSize ? sz : Number(sz), qty: 1 });
  else exists.qty = (exists.qty || 1) + 1;
  saveCart(); updateBadges();
  _haptic([10, 30, 10]);
  const main = document.getElementById('pd-btn-main');
  if (main) main.textContent = '✅ У кошику · Оформити →';
  if (main && !main.dataset.added) {
    main.dataset.added = '1';
    main.onclick = () => { closeAllSheets(); openSheet('sheet-cart'); };
  }
  toast(`✅ ${esc(p.brand)} ${esc(p.name)}, розмір ${sz} — в кошику!`);
  try { if (window.fbq) fbq('track', 'AddToCart', { currency: 'UAH', value: Number(p.price) || 0, content_ids: [p.id], content_type: 'product' }); } catch(_) {}
}

function _pdPhotoTg() {
  const p = S.pdProduct;
  if (!p) return;
  // Якщо в товара є пост в каналі — там альбом, відкриваємо напряму
  if (p.tgLink) { openTgLink(p.tgLink); return; }
  const productUrl = `${location.origin}${location.pathname}?product=${p.id}`;
  const msg = `Привіт! 👋 Хочу побачити більше фото 📸\n👟 ${p.brand} ${p.name}\n💰 ${p.price}₴\n🔗 ${productUrl}`;
  openTgLink(`https://t.me/znahidkawow?text=${encodeURIComponent(msg)}`);
}

function openProductDetail(product) {
  if (!product) return;
  S.pdProduct = product;
  trackView(product);
  if (window.fbq)  fbq('track', 'ViewContent', { currency: 'UAH', value: product.price, content_ids: [product.id], content_name: `${product.brand} ${product.name}`, content_type: 'product' });
  if (window.gtag) gtag('event', 'view_item', { currency: 'UAH', value: product.price, items: [{ item_id: product.id, item_name: `${product.brand} ${product.name}`, price: product.price }] });
  if (window.ttq)  ttq.track('ViewContent', { currency: 'UAH', value: product.price, content_id: product.id, content_name: `${product.brand} ${product.name}` });

  const faved = isFav(product.id);
  const pct   = discPct(product);

  // Scarcity
  const qty   = product.sizeQty || {};
  const qKeys = Object.keys(qty);
  const total = qKeys.length > 0
    ? qKeys.reduce((s, k) => s + (qty[k] || 1), 0)
    : product.sizes.length;
  const hasRealSizes = product.sizes.length > 0 && product.sizes[0] !== 'ONE SIZE';
  const scarcHtml = hasRealSizes && total === 1
    ? `<div class="pd-scarc-hero sc-last">🔥 Остання пара!</div>`
    : hasRealSizes && total === 2
      ? `<div class="pd-scarc-hero sc-low">⚡ Залишилось 2 пари</div>`
      : '';

  // Price row
  const priceHtml = product.oldPrice && product.oldPrice > product.price
    ? `<span class="pd-price">${product.price}₴</span>
       <span class="pd-old">${product.oldPrice}₴</span>
       ${pct > 0 ? `<span class="pd-disc-tag">−${pct}%</span>` : ''}`
    : `<span class="pd-price">${product.price}₴</span>`;

  // Інтерактивна сітка розмірів — вибір прямо в картці, без окремого кроку
  S.pdSize = null;
  const sizeChips = product.sizes[0] === 'ONE SIZE' ? '' :
    `<div class="pd-size-block">
      <div class="pd-size-head">
        <span class="pd-size-lbl">Розмір</span>
        <span class="pd-size-hint" id="pd-size-hint">обери свій</span>
      </div>
      <div class="pd-size-grid" id="pd-size-grid">
        ${product.sizes.map(s => `<button class="pd-size-sel" onclick="pdSelectSize(this, '${s}')">${s}</button>`).join('')}
      </div>
    </div>`;

  // TG SVG icon (inline, no external requests)
  const tgIco = `<svg class="pd-btn-tg-ico" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.944 2.56a1.5 1.5 0 0 0-1.53-.22L2.53 9.6c-.96.37-1.02 1.7-.1 2.16l4.06 2.02 1.56 5.14c.2.65.99.87 1.49.41l2.3-2.12 4.48 3.29c.59.43 1.42.1 1.57-.61L22.44 4.04a1.5 1.5 0 0 0-.5-1.48zM9.4 14.83l-.83 2.72-.94-3.1 8.33-5.9-6.56 6.28z" fill="#fff"/>
  </svg>`;

  _pdGalleryIdx = 0;
  const _imgs = (product.images && product.images.length > 1) ? product.images : null;

  document.getElementById('product-detail-content').innerHTML = `
    <div class="pd-hero">
      ${_imgs
        ? `<div class="pd-gallery" id="pd-gallery">
             <div class="pd-gallery-track" id="pd-gallery-track">
               ${_imgs.map((url, i) => `<div class="pd-gallery-slide">
                 <img class="pd-gallery-img${i===0?' loaded':''}" src="${esc(url)}" data-idx="${i}"
                      alt="${esc(product.brand)} ${esc(product.name)}"
                      loading="${i===0?'eager':'lazy'}" decoding="async"
                      onclick="openImageZoom('${esc(url)}','${esc(product.brand)} ${esc(product.name)}',S.spProduct?.images)"
                      onload="this.classList.add('loaded');_pdSyncHeroOrientation(this)">
               </div>`).join('')}
             </div>
           </div>
           <div class="pd-zoom-hint" aria-hidden="true">↔ Свайп · тап для збільшення</div>`
        : product.image && product.image.startsWith('http')
          ? `<img class="pd-img" src="${esc(product.image)}" alt="${esc(product.brand)} ${esc(product.name)}" loading="lazy" decoding="async"
               onclick="openImageZoom('${esc(product.image)}','${esc(product.brand)} ${esc(product.name)}',S.spProduct?.images)"
               onload="this.classList.add('loaded');_pdSyncHeroOrientation(this)">
             <div class="pd-zoom-hint" aria-hidden="true">🔍 Тап для збільшення</div>`
          : `<div class="pd-img-ph" aria-hidden="true">👟</div>`}
      <div class="pd-hero-vignette" aria-hidden="true"></div>
      <button class="pd-fav-float ${faved ? 'on' : ''}" id="pd-fav-btn"
        onclick="togglePdFav()" aria-label="${faved ? 'Видалити з улюблених' : 'Додати в улюблені'}">
        ${faved ? '❤️' : '🤍'}
      </button>
      ${scarcHtml}
    </div>

    ${_imgs ? `<div class="pd-thumb-strip" id="pd-thumb-strip">
      ${_imgs.map((url, i) => `<button class="pd-thumb${i===0?' active':''}" onclick="pdGalleryGo(${i})" aria-label="Фото ${i+1}">
        <img src="${esc(url)}" loading="${i<4?'eager':'lazy'}" decoding="async" onload="this.classList.add('loaded')">
      </button>`).join('')}
    </div>` : ''}

    <div class="pd-info">
      <button class="pd-brand pd-brand-chip" onclick="closeAllSheets();changeTab('catalog');setTimeout(()=>openBrand('${esc(product.brand)}'),220)">${esc(product.brand)} →</button>
      <h2 class="pd-name">${esc(product.name)}</h2>
      <div class="pd-price-row">${priceHtml}</div>
      <p class="pd-lead">
        ${product.isFreeShipping
          ? `<b>Безкоштовна доставка</b> по Україні. Оплата після примірки на відділенні Нової Пошти — без передоплати, без ризику.`
          : `Замовляй <b>без передоплати</b> — оплата після примірки на відділенні Нової Пошти. Не підійшло — відмов без зайвих питань.`}
      </p>
      ${sizeChips}
    </div>

    <div class="pd-trust-bar">
      <span class="pd-trust-pill">✓ Без передоплати</span>
      <span class="pd-trust-pill">✓ Примірка на пошті</span>
      <span class="pd-trust-pill">✓ Повернення</span>
    </div>

    <div class="pd-cta">
      <button class="pd-btn-main" id="pd-btn-main" onclick="pdMainCta()">
        ${product.sizes[0] === 'ONE SIZE' ? '🛒 Додати в кошик' : 'Обери розмір вище 👆'}
      </button>
      <button class="pd-tg-link" onclick="_pdPhotoTg()">
        ${tgIco}
        <span>${_imgs ? 'Переглянути у Telegram' : 'Запросити живі фото в Telegram'}</span>
      </button>
    </div>

    ${_pdSimilarHtml(product)}`;

  openSheet('sheet-product');

  if (_imgs) {
    const gallery = document.getElementById('pd-gallery');
    if (gallery) _initGalleryTouch(gallery);
  }
}

function _pdSimilarHtml(product) {
  const all = (S.catalog && S.catalog.all) || [];
  const similar = all
    .filter(p => p.id !== product.id && p.brand === product.brand && p.image)
    .slice(0, 8);
  if (!similar.length) return '';
  const cards = similar.map(p => prodCardHtml(p, { grid: false })).join('');
  return `<div class="pd-similar">
    <div class="pd-similar-title">Ще від ${esc(product.brand)}</div>
    <div class="h-scroll pd-similar-row">${cards}</div>
  </div>`;
}

// ── NOTIFY ME ─────────────────────────────────────────── */
function toggleNotifyPanel() {
  document.getElementById('sp-notify-panel')?.classList.toggle('open');
}

function submitNotifyMe() {
  const sz    = document.getElementById('sp-notify-sz')?.value.trim()    || '';
  const phone = document.getElementById('sp-notify-phone')?.value.trim() || '';
  if (!sz || phone.replace(/\D/g,'').length < 9) {
    toast('⚠️ Вкажіть розмір і номер телефону');
    return;
  }
  const p = S.spProduct;
  if (!p) return;
  postData({ action: 'notify_me', product_id: p.id, brand: p.brand, name: p.name, size: sz, phone }).catch(() => {});
  toast(`🔔 Збережено! Повідомимо, коли з'явиться розмір ${sz}`);
  document.getElementById('sp-notify-panel')?.classList.remove('open');
  const szEl = document.getElementById('sp-notify-sz'); if (szEl) szEl.value = '';
  const phEl = document.getElementById('sp-notify-phone'); if (phEl) phEl.value = '';
}

function togglePdFav() {
  const p = S.pdProduct;
  if (!p) return;
  if (isFav(p.id)) { S.favs = S.favs.filter(f => f.id !== p.id); }
  else             { S.favs.unshift(p); }
  saveFavs();
  updateBadges();
  const btn   = document.getElementById('pd-fav-btn');
  const faved = isFav(p.id);
  if (btn) {
    btn.className = 'pd-fav-float' + (faved ? ' on' : '');
    btn.textContent = faved ? '❤️' : '🤍';
    btn.setAttribute('aria-label', faved ? 'Видалити з улюблених' : 'Додати в улюблені');
  }
  toast(faved ? '❤️ Додано до улюблених' : 'Видалено з улюблених');
}
