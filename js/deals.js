/* ============================================================
   WOW.ZNAHIDKA — DAILY DEALS
   3 seeded-random products with free delivery, refreshed at midnight.
   All users see the same products on the same day (deterministic PRNG).
   ============================================================ */

// ── PRNG (mulberry32) ────────────────────────────── */
function _mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function _getDateSeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

// ── DEAL SELECTION ───────────────────────────────── */
function getDailyDeals(catalog, count) {
  count = count || 3;
  const seed     = _getDateSeed();
  const cacheKey = 'wow_deals_' + seed;

  // Purge previous days' cache entries
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('wow_deals_') && k !== cacheKey) localStorage.removeItem(k);
    });
  } catch(_) {}

  // Server-side deals take priority — GAS computed them deterministically,
  // so all clients see identical products regardless of local array order.
  if (S.catalog.dailyDeals && S.catalog.dailyDeals.length) {
    const deals = S.catalog.dailyDeals
      .map(id => (catalog || []).find(p => String(p.id) === String(id)))
      .filter(Boolean)
      .slice(0, count)
      .map(p => ({ ...p, isFreeShipping: true }));
    if (deals.length) {
      try { localStorage.setItem(cacheKey, JSON.stringify(deals)); } catch(_) {}
      return deals;
    }
  }

  // Return cached for today (client-side fallback while server loads)
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) return JSON.parse(raw);
  } catch(_) {}

  // Client-side selection fallback (stable sort ensures same result if IDs are consistent)
  const eligible = catalog
    .filter(p => p.sizes.length > 0 && !(p.sizes.length === 1 && p.sizes[0] === 'ONE SIZE'))
    .sort((a, b) => String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : 0);
  if (!eligible.length) return [];

  const rng = _mulberry32(seed);
  const arr = [...eligible];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }

  const deals = arr.slice(0, count).map(p => ({ ...p, isFreeShipping: true }));
  try { localStorage.setItem(cacheKey, JSON.stringify(deals)); } catch(_) {}
  return deals;
}

// ── COUNTDOWN ────────────────────────────────────── */
function _timeUntilMidnight() {
  const now = new Date();
  const mid = new Date(now); mid.setHours(24, 0, 0, 0);
  const ms  = mid - now;
  return {
    h: Math.floor(ms / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
  };
}

// ── CARD HTML ────────────────────────────────────── */
function _dealCardHtml(p) {
  const img = p.image && p.image.startsWith('http')
    ? `<img class="card-img" src="${esc(p.image)}" alt="${esc(p.brand)} ${esc(p.name)}"
         loading="lazy" decoding="async" onload="this.classList.add('loaded')">`
    : `<div class="card-img-placeholder" aria-hidden="true">👟</div>`;

  const szList = p.sizes[0] === 'ONE SIZE'
    ? '<span>ONE SIZE</span>'
    : p.sizes.slice(0, 5).map(s => `<span>${s}</span>`).join('') +
      (p.sizes.length > 5 ? `<span class="sz-more">+${p.sizes.length - 5}</span>` : '');

  return `<article class="product-card dd-card"
    onclick="openDealDetail('${esc(p.id)}')"
    role="button" tabindex="0"
    aria-label="${esc(p.brand)} ${esc(p.name)}, ${p.price}₴, безкоштовна доставка">
    <div class="card-img-wrap">
      ${img}
      <div class="dd-badge" aria-label="Безкоштовна доставка">🚚</div>
    </div>
    <div class="card-body">
      <div class="card-brand">${esc(p.brand)}</div>
      <div class="card-name">${esc(p.name)}</div>
      <div class="card-price">${p.price}₴</div>
      <div class="card-sizes-preview">${szList}</div>
    </div>
  </article>`;
}

// ── OPEN DEAL IN PRODUCT DETAIL ──────────────────── */
function openDealDetail(productId) {
  // Pull from today's cache so isFreeShipping is guaranteed present
  let dealProduct = null;
  try {
    const cached = JSON.parse(localStorage.getItem('wow_deals_' + _getDateSeed()) || '[]');
    dealProduct  = cached.find(d => d.id === productId) || null;
  } catch(_) {}
  if (!dealProduct) {
    const base = findProd(productId);
    if (!base) return;
    dealProduct = { ...base, isFreeShipping: true };
  }
  openProductDetail(dealProduct);
}

// ── RENDER SECTION ───────────────────────────────── */
let _ddTimerID = null;

function _isGiftOpenedToday() {
  try { return !!localStorage.getItem('wow_gift_opened_' + _getDateSeed()); }
  catch (_) { return false; }
}
function _markGiftOpened() {
  try {
    localStorage.setItem('wow_gift_opened_' + _getDateSeed(), '1');
    // прибираємо застарілі ключі
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('wow_gift_opened_') && k !== 'wow_gift_opened_' + _getDateSeed()) {
        localStorage.removeItem(k);
      }
    });
  } catch (_) {}
}

function _giftBoxHtml() {
  return `<div class="dd-gift-wrap"
       onclick="return openDailyGift(event)"
       onmousedown="event.stopPropagation()"
       ontouchstart="event.stopPropagation()"
       role="button" tabindex="0"
       aria-label="Відкрити подарунок дня"
       onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();return openDailyGift(event);}">
    <div class="dd-gift" style="pointer-events:none">
      <div class="dd-gift-brand">
        <span class="dd-gift-brand-logo">WOW<span class="dd-gift-brand-dot">.</span>ZNAHIDKA</span>
        <span class="dd-gift-brand-tag">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 11.5V5.5C2 4.67 2.67 4 3.5 4H10V11.5C10 12.33 9.33 13 8.5 13H3.5C2.67 13 2 12.33 2 11.5Z" stroke="currentColor" stroke-width="1.4"/>
            <path d="M10 6.5H12.59C12.85 6.5 13.1 6.6 13.29 6.79L14.71 8.21C14.9 8.4 15 8.65 15 8.91V11.5C15 12.33 14.33 13 13.5 13H10V6.5Z" stroke="currentColor" stroke-width="1.4"/>
            <circle cx="5" cy="13" r="1.4" fill="currentColor"/>
            <circle cx="12" cy="13" r="1.4" fill="currentColor"/>
          </svg>
          Безкоштовна доставка
        </span>
      </div>
      <div class="dd-gift-box">
        <div class="dd-gift-lid">
          <div class="dd-gift-bow" aria-hidden="true"></div>
        </div>
        <div class="dd-gift-base">
          <div class="dd-gift-ribbon-v" aria-hidden="true"></div>
        </div>
        <div class="dd-gift-shine" aria-hidden="true"></div>
        <div class="dd-confetti" aria-hidden="true">
          ${Array.from({length:14}).map((_,i)=>`<span style="--i:${i}"></span>`).join('')}
        </div>
      </div>
      <div class="dd-gift-cta">
        <strong>🎁 Відкрий подарунок дня</strong>
        <span>3 пари з <b>безкоштовною доставкою</b> · лише сьогодні</span>
      </div>
    </div>
  </div>`;
}

function openDailyGift(evt) {
  if (evt) {
    try { evt.preventDefault(); } catch(_) {}
    try { evt.stopPropagation(); } catch(_) {}
    try { evt.stopImmediatePropagation && evt.stopImmediatePropagation(); } catch(_) {}
  }
  const sec  = document.getElementById('daily-deals-section');
  if (!sec) return false;
  const wrap = sec.querySelector('.dd-gift-wrap');
  const row  = sec.querySelector('.dd-row');
  if (!wrap || wrap.classList.contains('dd-opening')) return false;

  wrap.classList.add('dd-opening');
  try { if (navigator.vibrate) navigator.vibrate([18, 22, 30]); } catch (_) {}

  setTimeout(() => {
    row && row.classList.add('dd-revealed');
    wrap.style.display = 'none';
    _markGiftOpened();
    try {
      if (typeof gtag === 'function') gtag('event', 'gift_opened', { event_category: 'engagement' });
      if (typeof fbq  === 'function') fbq('trackCustom', 'GiftOpened');
    } catch (_) {}
  }, 1100);

  return false; // запобігає default навігації
}

function renderDailyDeals(catalog) {
  const sec = document.getElementById('daily-deals-section');
  if (!sec) return;

  if (_ddTimerID) { clearInterval(_ddTimerID); _ddTimerID = null; }

  const deals = getDailyDeals(catalog);
  if (!deals.length) { sec.hidden = true; return; }
  sec.hidden = false;

  const row = sec.querySelector('.dd-row');
  if (row) row.innerHTML = deals.map(_dealCardHtml).join('');

  // Gift-box перед розкриттям
  const opened = _isGiftOpenedToday();
  let existingGift = sec.querySelector('.dd-gift-wrap');
  if (!opened) {
    if (!existingGift) {
      const header = sec.querySelector('.dd-header');
      header && header.insertAdjacentHTML('afterend', _giftBoxHtml());
    }
    row && row.classList.remove('dd-revealed');
  } else {
    if (existingGift) existingGift.remove();
    row && row.classList.add('dd-revealed');
  }

  const timerEl = sec.querySelector('.dd-timer');

  function _tick() {
    const { h, m, s } = _timeUntilMidnight();
    if (timerEl) {
      timerEl.textContent =
        String(h).padStart(2, '0') + ':' +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0');
    }
    // Midnight: fade out → re-fetch → re-render → fade in
    if (h === 0 && m === 0 && s === 0) {
      clearInterval(_ddTimerID); _ddTimerID = null;
      sec.style.transition = 'opacity .5s ease';
      sec.style.opacity    = '0';
      setTimeout(() => {
        fetchCatalog().then(data => {
          renderDailyDeals(data);
          sec.style.opacity = '1';
          setTimeout(() => { sec.style.transition = ''; }, 520);
        });
      }, 520);
    }
  }

  _tick();
  _ddTimerID = setInterval(_tick, 1000);
}
