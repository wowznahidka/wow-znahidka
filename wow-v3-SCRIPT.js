const API_URL    = 'https://script.google.com/macros/s/AKfycbxfIZzXaIZjAOB3rqnUjVAk68eUVPshJyy2AArBUZsxVjnKm2-2yKyMgFUfmdvu--Au5A/exec';
const IMG_MEN    = 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000';
const IMG_WOMEN  = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000';

/* ── СТАН ── */
let DB           = [];
let SESSION      = [];
let CART         = [];
let LIKED        = [];
let PROMO_RULES  = {};
let GENDER       = '';
let DELIVERY     = 'Відділення';
let MATCH_PTR    = 0;
let HISTORY      = [];
let FEED_PAGE    = 0;
const FEED_SIZE  = 12;

let ACT_ID       = null;
let ACT_NAME     = '';
let ACT_SIZES    = [];

const SOCIAL_MAP = {};

/* ============================================================
   СТАРТ
   ============================================================ */
(function preloadSplash() {
    function load(id, src) {
        const img = document.getElementById(id);
        if (!img) return;
        const proxy = new Image();
        proxy.onload = () => { img.src = src; requestAnimationFrame(() => img.classList.add('on')); };
        proxy.src = src;
    }
    load('gi-men',   IMG_MEN);
    load('gi-women', IMG_WOMEN);
})();

async function initWOW(gender) {
    GENDER = gender;
    document.getElementById('loader').classList.add('on');
    setTimeout(() => document.getElementById('splash').classList.add('off'), 80);

    // ✅ правильне вітання
    const greet = document.getElementById('home-greeting');
    if (greet) greet.textContent = gender === 'Чоловік' ? 'Привіт, чоловіче 👋' : 'Привіт, красуне 👋';

    try {
        const res  = await fetch(API_URL + '?v=' + Date.now());
        const data = await res.json();

        DB          = data.products || data;
        PROMO_RULES = data.promo   || {};
        SESSION     = DB.filter(p => p.gender === GENDER).sort(() => Math.random() - .5);

        restoreLS();
        renderHome();
        renderMatchDeck();
        renderCatalog();
        syncBadges();

        document.getElementById('hdr').style.display = 'flex';
        document.getElementById('nav').style.display = 'flex';
        document.getElementById('loader').classList.remove('on');
        changeTab('home', document.getElementById('tab-home'));

        if (CART.length > 0) toast('♻️ Твій кошик відновлено!');

    } catch(e) {
        document.getElementById('loader').classList.remove('on');
        toast('❌ Помилка з\'єднання. Оновіть сторінку.');
        console.error(e);
    }
}

/* ============================================================
   LOCAL STORAGE
   ============================================================ */
function saveLS() {
    try {
        localStorage.setItem('wow_cart',   JSON.stringify(CART));
        localStorage.setItem('wow_liked',  JSON.stringify(LIKED));
        localStorage.setItem('wow_gender', GENDER);
    } catch(e) {}
}
function restoreLS() {
    try {
        if (localStorage.getItem('wow_gender') !== GENDER) return;
        const c = localStorage.getItem('wow_cart');
        const l = localStorage.getItem('wow_liked');
        if (c) CART  = JSON.parse(c);
        if (l) LIKED = JSON.parse(l);
    } catch(e) {}
}
function clearLS() {
    try {
        localStorage.removeItem('wow_cart');
        localStorage.removeItem('wow_liked');
        localStorage.removeItem('wow_gender');
    } catch(e) {}
}

/* ============================================================
   ГОЛОВНА (HOME)
   ============================================================ */
function renderHome() {
    const allG   = DB.filter(p => p.gender === GENDER);
    const brands = [...new Set(allG.map(p => p.brand))].sort();

    const sm = document.getElementById('stat-models');
    const sb = document.getElementById('stat-brands');
    if (sm) sm.textContent = allG.length;
    if (sb) sb.textContent = brands.length;

    /* горизонтальний скрол новинок */
    const newItems  = allG.filter(p => p.is_new === 'TRUE' || p.is_new === true).slice(0, 8);
    const showItems = newItems.length > 0 ? newItems : allG.slice(0, 8);
    const scroll    = document.getElementById('home-new-scroll');
    if (scroll) {
        scroll.innerHTML = showItems.map(p => {
            const cn = cleanName(p.name, p.brand);
            return `<div class="home-card" onclick="quickAddFromHome('${esc(p.id)}')">
                <img class="home-card-img" src="${p.image}" alt="${cn}" loading="lazy">
                <div class="home-card-body">
                    <div class="home-card-brand">${p.brand}</div>
                    <div class="home-card-name">${cn}</div>
                    <div class="home-card-price">${p.price} ₴</div>
                </div>
            </div>`;
        }).join('');
    }

    /* бренди quick-scroll */
    const bq = document.getElementById('home-brands-quick');
    if (bq) {
        bq.innerHTML = brands.map(b =>
            `<div class="brand-chip" onclick="filterBrand('${esc(b)}')">${b}</div>`
        ).join('');
    }

    /* ── ІНСТА-СТРІЧКА (нескінченний скрол) ── */
    FEED_PAGE = 0;
    const feed = document.getElementById('home-feed');
    if (feed) {
        feed.innerHTML = '';
        renderFeedPage();
        const page = document.getElementById('page-home');
        page.removeEventListener('scroll', onHomeScroll);
        page.addEventListener('scroll', onHomeScroll);
    }
}

function onHomeScroll() {
    const page = document.getElementById('page-home');
    if (page.scrollHeight - page.scrollTop - page.clientHeight < 300) renderFeedPage();
}

function renderFeedPage() {
    const allG  = DB.filter(p => p.gender === GENDER);
    const start = FEED_PAGE * FEED_SIZE;
    const slice = allG.slice(start, start + FEED_SIZE);
    if (!slice.length) return;
    FEED_PAGE++;
    const feed = document.getElementById('home-feed');
    if (!feed) return;
    slice.forEach(p => {
        const cn  = cleanName(p.name, p.brand);
        const sc  = socialProof(p.id);
        const isN = p.is_new === true || p.is_new === 'TRUE' || p.is_new === 'true';
        const card = document.createElement('div');
        card.className = 'feed-card';
        card.innerHTML = `
            <div class="feed-img-wrap" onclick="quickAddFromHome('${esc(p.id)}')">
                ${isN ? '<span class="feed-new-badge">🔥 НОВИНКА</span>' : ''}
                <img class="feed-img" src="${p.image}" alt="${cn}" loading="lazy">
            </div>
            <div class="feed-body">
                <div class="feed-top">
                    <div>
                        <div class="feed-brand">${p.brand}</div>
                        <div class="feed-name">${cn}</div>
                    </div>
                    <div class="feed-price">${p.price} ₴</div>
                </div>
                <div class="feed-meta">
                    <span class="feed-proof">🔥 ${sc} лайків сьогодні</span>
                    <button class="feed-add-btn" onclick="quickAddFromHome('${esc(p.id)}')">+ В кошик</button>
                </div>
            </div>`;
        feed.appendChild(card);
    });
}

function quickAddFromHome(id) {
    const p = DB.find(x => x.id === id);
    if (p) openSizePicker(p);
}

/* ============================================================
   MATCH ENGINE
   ============================================================ */
function renderMatchDeck() {
    const deck  = document.getElementById('deck');
    const slice = SESSION.slice(MATCH_PTR, MATCH_PTR + 3);
    if (!slice.length) { renderEmptyDeck(); return; }
    deck.innerHTML = slice.map((p, i) => {
        const cn  = cleanName(p.name, p.brand);
        const sc  = socialProof(p.id);
        const isN = p.is_new === true || p.is_new === 'TRUE' || p.is_new === 'true';
        return `
        <div class="t-card" data-i="${i}" data-pid="${p.id}"
             style="z-index:${10-i};transform:scale(${1-i*.05}) translateY(${i*18}px);opacity:${1-i*.15};">
            <img class="t-img" src="${p.image}" alt="${cn}" draggable="false">
            <div class="t-grad"></div>
            ${isN ? '<span class="new-tag">🔥 НОВИНКА</span>' : ''}
            <div class="ov-like"><span class="sw-lbl sw-like">ЛАЙК</span></div>
            <div class="ov-nope"><span class="sw-lbl sw-nope">ПРОПУСК</span></div>
            <div class="t-info">
                <span class="t-brand">${p.brand}</span>
                <div class="t-name">${cn}</div>
                <div class="t-row">
                    <span class="t-price">${p.price} ₴</span>
                    <span class="t-proof">🔥 ${sc} лайків сьогодні</span>
                </div>
            </div>
        </div>`;
    }).join('');
    attachSwipe();
}

function attachSwipe() {
    const top = document.querySelector('.t-card[data-i="0"]');
    if (!top) return;
    let sx = 0, sy = 0, cx = 0, drag = false;
    const down = e => { drag = true; sx = e.clientX ?? e.touches[0].clientX; sy = e.clientY ?? e.touches[0].clientY; top.style.transition = 'none'; };
    const move = e => {
        if (!drag) return;
        const px = e.clientX ?? (e.touches && e.touches[0].clientX);
        const py = e.clientY ?? (e.touches && e.touches[0].clientY);
        if (!px) return;
        cx = px - sx; const dy = py - sy;
        top.style.transform = `translateX(${cx}px) translateY(${dy*.3}px) rotate(${cx*.07}deg)`;
        const lik = top.querySelector('.ov-like'), nop = top.querySelector('.ov-nope');
        if (cx > 80)       { lik.style.opacity = Math.min((cx-80)/110,.95); nop.style.opacity = 0; }
        else if (cx < -80) { nop.style.opacity = Math.min((-cx-80)/110,.95); lik.style.opacity = 0; }
        else               { lik.style.opacity = 0; nop.style.opacity = 0; }
    };
    const up = () => {
        if (!drag) return; drag = false;
        if (cx > 100) flyOut(top, 'right');
        else if (cx < -100) flyOut(top, 'left');
        else { top.style.transition = 'transform .4s var(--ease-out)'; top.style.transform = 'scale(1) translateY(0) rotate(0)'; top.querySelectorAll('.ov-like,.ov-nope').forEach(o => o.style.opacity = 0); }
        cx = 0;
    };
    top.addEventListener('pointerdown', down);
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    top.addEventListener('touchstart', down, { passive:true });
    top.addEventListener('touchmove',  move, { passive:true });
    top.addEventListener('touchend',   up);
}

function flyOut(card, dir) {
    const dist = window.innerWidth * 1.6;
    const rot  = dir === 'right' ? 42 : -42;
    card.style.transition = 'transform .42s cubic-bezier(.5,0,.7,0), opacity .42s ease';
    card.style.transform  = `translateX(${dir === 'right' ? dist : -dist}px) rotate(${rot}deg)`;
    card.style.opacity    = '0';
    if (dir === 'right') {
        haptic(50);
        const p = SESSION[MATCH_PTR];
        if (p) { addLiked(p); setTimeout(() => openSizePicker(p), 180); }
    }
    setTimeout(() => { MATCH_PTR++; renderMatchDeck(); }, 400);
}

function swipeCard(dir) {
    const top = document.querySelector('.t-card[data-i="0"]');
    if (top) flyOut(top, dir);
}

function renderEmptyDeck() {
    const deck = document.getElementById('deck');
    if (!LIKED.length) {
        deck.innerHTML = `<div class="empty-deck"><span class="empty-deck-ico">👟</span><div class="empty-deck-t">Ти переглянув усі пари!</div><p class="empty-deck-s">Нові надходження скоро будуть</p><button class="btn-cta" style="max-width:200px;margin:0 auto;" onclick="location.reload()">ОНОВИТИ</button></div>`;
        return;
    }
    deck.innerHTML = `<div class="empty-deck"><span class="empty-deck-ico">🏁</span><div class="empty-deck-t">Ти переглянув усе!</div><p class="empty-deck-s">Ось твої фаворити:</p><div class="fav-mini-list">${LIKED.slice(0,5).map(p => `<div class="fav-row"><img class="fav-img" src="${p.image}" alt="${p.brand}"><div class="fav-info"><div class="fav-name">${p.brand} ${cleanName(p.name, p.brand)}</div><div class="fav-price">${p.price} ₴</div></div><button class="btn-fav-add" onclick="openSizePicker(LIKED.find(x=>x.id==='${esc(p.id)}'))">+</button></div>`).join('')}</div></div>`;
}

function addLiked(p) {
    if (!LIKED.some(x => x.id === p.id)) { LIKED.push(p); saveLS(); syncBadges(); heartPulse(); }
}
function heartPulse() {
    const h = document.getElementById('heart-btn');
    h.classList.remove('pulse'); void h.offsetWidth; h.classList.add('pulse');
}

/* ============================================================
   SIZE PICKER
   ============================================================ */
function openSizePicker(p) {
    if (!p) return;
    ACT_ID = p.id; ACT_NAME = p.name; ACT_SIZES = [];
    document.getElementById('sz-title').textContent = `${p.brand} ${cleanName(p.name, p.brand)}`;
    const box = document.getElementById('advisor-box');
    if (box) box.classList.remove('on');
    const adv = document.getElementById('adv-mm'); if (adv) adv.value = '';
    const res = document.getElementById('adv-res'); if (res) res.textContent = '';
    const pb  = document.getElementById('btn-photo');
    if (pb) { pb.textContent = '📸 Запросити додаткові фото'; pb.disabled = false; }
    buildSizeGrid(p.sizes);
    openSheet('size-sheet');
}

function buildSizeGrid(raw) {
    const sizes = String(raw || '').split(',').map(s => s.trim()).filter(Boolean);
    document.getElementById('sz-grid').innerHTML = sizes.map(s => {
        const low  = s.includes('(last)') || s.includes('(1)');
        const disp = s.replace('(last)', '').replace('(1)', '').trim();
        const eu   = disp.split('(')[0].trim();
        const ex   = disp.includes('(') ? disp.split('(')[1].replace(')', '') : '';
        return `<div class="sz-wrap">${low ? '<div class="low-dot"></div>' : ''}<div class="sz-cell" onclick="toggleSz(this,'${s}')" data-s="${s}">${eu}${ex ? `<span class="sz-sub">${ex}</span>` : ''}${low ? '<span class="low-lbl">мало</span>' : ''}</div></div>`;
    }).join('');
}

function toggleSz(el, v) {
    const idx = ACT_SIZES.indexOf(v);
    if (idx > -1) { ACT_SIZES.splice(idx, 1); el.classList.remove('sel'); }
    else          { ACT_SIZES.push(v);         el.classList.add('sel'); }
}

function confirmSizes() {
    if (!ACT_SIZES.length) { toast('⚠️ Оберіть розмір!'); return; }
    const p = DB.find(x => x.id === ACT_ID);
    if (!p) return;
    ACT_SIZES.forEach(sz => {
        CART.push({ uid:uid(), id:p.id, name:p.name, brand:p.brand, price:+p.price||0, size:sz, img:p.image, qty:1 });
    });
    saveLS(); syncBadges(); closeSheets(); haptic(40); toast('✅ Додано до кошика!', true);
}

function toggleAdvisor() {
    const b = document.getElementById('advisor-box');
    if (b) b.classList.toggle('on');
}

function calcEU() {
    const mm  = parseInt(document.getElementById('adv-mm').value);
    const res = document.getElementById('adv-res');
    if (!mm || mm < 200 || mm > 335) { res.textContent = ''; return; }
    const eu = Math.ceil((mm + 15) / 6.67);
    res.textContent = `Ваш розмір: EU ${eu}`;
    document.querySelectorAll('.sz-cell').forEach(c => {
        c.classList.remove('hint');
        if ((c.dataset.s || '').includes(String(eu))) c.classList.add('hint');
    });
}

/* ── Запит фото → відкриває TG з готовим повідомленням ── */
function reqPhoto() {
    const btn = document.getElementById('btn-photo');
    btn.disabled = true; haptic(30);
    const p           = DB.find(x => x.id === ACT_ID);
    const displayName = p ? `${p.brand} ${cleanName(p.name, p.brand)}` : ACT_NAME;
    const msg         = encodeURIComponent(`📸 Привіт! Прошу додаткові фото:\n👟 ${displayName}\n🆔 Артикул: ${ACT_ID}`);
    window.open(`https://t.me/znahidkawow?text=${msg}`, '_blank');
    toast('📸 Відкриваємо Telegram!', true);
    setTimeout(() => { btn.textContent = '📸 Запросити додаткові фото'; btn.disabled = false; }, 3000);
}

/* ============================================================
   КАТАЛОГ — з фото брендів
   ============================================================ */
function renderCatalog() {
    const gp     = DB.filter(p => p.gender === GENDER);
    const counts = {}, photos = {};
    gp.forEach(p => {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
        if (!photos[p.brand] && p.image) photos[p.brand] = p.image;
    });
    const brands = Object.keys(counts).sort();
    document.getElementById('cat-label').textContent = `Всі бренди (${brands.length})`;
    document.getElementById('brands-node').innerHTML = brands.map(b => brandTileHTML(b, counts[b], photos[b])).join('');
}

function filterCatalog() {
    const q      = document.getElementById('cat-search').value.toLowerCase();
    const gp     = DB.filter(p => p.gender === GENDER);
    const counts = {}, photos = {};
    gp.forEach(p => {
        if (p.brand.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)) {
            counts[p.brand] = (counts[p.brand] || 0) + 1;
            if (!photos[p.brand] && p.image) photos[p.brand] = p.image;
        }
    });
    const brands = Object.keys(counts).sort();
    document.getElementById('cat-label').textContent = `Результати (${brands.length})`;
    document.getElementById('brands-node').innerHTML = !brands.length
        ? '<p style="color:var(--text-dim);font-size:.85rem;padding:20px 0;grid-column:1/-1;">Нічого не знайдено 😔</p>'
        : brands.map(b => brandTileHTML(b, counts[b], photos[b])).join('');
}

function brandTileHTML(b, count, photo) {
    return `<div class="brand-tile" onclick="filterBrand('${esc(b)}')">
        ${photo ? `<img class="brand-tile-img" src="${photo}" alt="${b}" loading="lazy">` : ''}
        <div class="brand-tile-body">
            <div class="bt-name">${b}</div>
            <div class="bt-cnt">${count} моделей</div>
        </div>
    </div>`;
}

function filterBrand(brand) {
    SESSION = DB.filter(p => p.gender === GENDER && p.brand === brand);
    MATCH_PTR = 0;
    renderMatchDeck();
    changeTab('match', document.getElementById('tab-match'));
    toast(`👟 Показую: ${brand}`);
}

/* ============================================================
   КОШИК
   ============================================================ */
function renderCart() {
    const wrap  = document.getElementById('cart-items');
    const total = document.getElementById('cart-total');
    const fb    = document.getElementById('fav-block');
    if (!CART.length) {
        wrap.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:18px 0;">Тут поки порожньо...</p>';
        if (LIKED.length > 0) { fb.style.display = 'block'; renderFavBlock(); } else fb.style.display = 'none';
        if (total) total.textContent = '0 ₴';
        return;
    }
    fb.style.display = 'none';
    wrap.innerHTML = CART.map((item, i) => `
    <div class="cart-line">
        <img class="cl-img" src="${item.img}" alt="${item.name}">
        <div class="cl-info">
            <div class="cl-name">${item.brand} ${cleanName(item.name, item.brand)}</div>
            <div class="cl-size">Розмір: ${item.size.replace('(last)','').replace('(1)','')}</div>
            <div class="qty-row">
                <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
                <span class="qty-val">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
            </div>
        </div>
        <div class="cl-right">
            <span class="cl-price">${item.price * item.qty} ₴</span>
            <button class="btn-del" onclick="delItem(${i})">✕</button>
        </div>
    </div>`).join('');
    if (total) total.textContent = cartSum() + ' ₴';
}

function renderFavBlock() {
    document.getElementById('fav-list').innerHTML = LIKED.slice(0,4).map(p =>
        `<div class="fav-row"><img class="fav-img" src="${p.image}" alt="${p.brand}"><div class="fav-info"><div class="fav-name">${p.brand} ${cleanName(p.name, p.brand)}</div><div class="fav-price">${p.price} ₴</div></div><button class="btn-fav-add" onclick="openSizePicker(LIKED.find(x=>x.id==='${esc(p.id)}')); closeSheets()">+</button></div>`
    ).join('');
}

function changeQty(i, d) { if (!CART[i]) return; CART[i].qty = Math.max(1, CART[i].qty + d); saveLS(); renderCart(); }
function delItem(i)       { CART.splice(i, 1); saveLS(); syncBadges(); renderCart(); }
function cartSum()        { return CART.reduce((s, it) => s + it.price * it.qty, 0); }

function setDel(t) {
    DELIVERY = t;
    document.querySelectorAll('.d-opt').forEach(b => b.classList.remove('on'));
    document.getElementById(t === 'Відділення' ? 'opt-branch' : 'opt-poshtamat').classList.add('on');
    document.getElementById('inp-np').placeholder = t === 'Відділення' ? '№ Відділення' : '№ Поштомату';
}

function previewPromo() {
    const code = document.getElementById('inp-promo').value.toUpperCase().trim();
    const box  = document.getElementById('promo-prev');
    if (!code || !PROMO_RULES[code]) { box.style.display = 'none'; return; }
    const base = cartSum(), v = PROMO_RULES[code];
    const disc = v < 1 ? Math.round(base * v) : v;
    box.textContent = `Знижка: −${disc} ₴ → Разом: ${Math.max(0, base - disc)} ₴`;
    box.style.display = 'block';
}

async function sendOrder() {
    const fio   = document.getElementById('inp-fio').value.trim();
    const phone = document.getElementById('inp-phone').value.trim();
    const city  = document.getElementById('inp-city').value.trim();
    const np    = document.getElementById('inp-np').value.trim();
    const promo = document.getElementById('inp-promo').value.toUpperCase().trim();

    if (!fio)   { toast('⚠️ Введіть ПІБ'); return; }
    if (!phone || !/^(\+380|0)\d{9}$/.test(phone.replace(/\s/g,''))) { toast('⚠️ Некоректний телефон'); return; }
    if (!np)    { toast('⚠️ Вкажіть № відділення'); return; }
    if (!CART.length) { toast('⚠️ Кошик порожній'); return; }

    const btn = document.getElementById('btn-order');
    btn.textContent = 'ВІДПРАВКА...'; btn.disabled = true;

    let total = cartSum();
    if (promo && PROMO_RULES[promo]) {
        const v = PROMO_RULES[promo];
        total = v < 1 ? Math.round(total * (1-v)) : Math.max(0, total - v);
    }

    const items = CART.map(it => `- ${it.brand} ${cleanName(it.name, it.brand)} (р.${it.size.replace('(last)','').replace('(1)','')}) × ${it.qty}`).join('\n');

    try {
        await fetch(API_URL, { method:'POST', mode:'no-cors', body: JSON.stringify({ action:'new_order', fio, phone, city, delivery:`${DELIVERY} №${np} (Накладний платіж)`, items, total: total + ' ₴', promo: promo || 'Немає' }) });
        haptic([100,50,100,50,200]);
        CART = []; LIKED = []; clearLS(); syncBadges();
        document.getElementById('view-form').style.display    = 'none';
        document.getElementById('view-success').style.display = 'block';
    } catch(e) {
        toast('❌ Помилка. Напишіть нам у Telegram.');
        btn.textContent = 'ЗАМОВИТИ'; btn.disabled = false;
    }
}

/* ============================================================
   WISHLIST SHARE
   ============================================================ */
function shareWishlist() {
    if (!LIKED.length) { toast('💛 Ще немає лайкнутих пар'); return; }
    const txt = LIKED.map(p => `${p.brand} ${cleanName(p.name,p.brand)} — ${p.price}₴`).join('\n');
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(txt).then(() => toast('✅ Список скопійовано!', true)).catch(() => fallbackCopy(txt));
    } else fallbackCopy(txt);
}
function fallbackCopy(txt) {
    const a = document.createElement('textarea');
    a.value = txt; a.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(a); a.select(); document.execCommand('copy');
    document.body.removeChild(a); toast('✅ Список скопійовано!', true);
}

/* ============================================================
   НАВІГАЦІЯ
   ============================================================ */
function changeTab(id, el) {
    const cur = document.querySelector('.page.active');
    if (cur && cur.id !== 'page-' + id) HISTORY.push(cur.id.replace('page-',''));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('page-' + id).classList.add('active');
    if (el) el.classList.add('active');
}
function navBack() {
    if (HISTORY.length) { const prev = HISTORY.pop(); changeTab(prev, document.getElementById('tab-' + prev)); }
    else location.reload();
}

/* ============================================================
   SHEETS
   ============================================================ */
function openSheet(id) {
    const dim = document.getElementById('dimmer');
    dim.style.display = 'block';
    requestAnimationFrame(() => { dim.style.opacity = '1'; document.getElementById(id).classList.add('open'); });
    if (id === 'cart-sheet') {
        document.getElementById('view-cart').style.display    = 'block';
        document.getElementById('view-form').style.display    = 'none';
        document.getElementById('view-success').style.display = 'none';
        renderCart();
    }
}
function closeSheets() {
    document.querySelectorAll('.sheet').forEach(s => s.classList.remove('open'));
    const dim = document.getElementById('dimmer');
    dim.style.opacity = '0';
    setTimeout(() => dim.style.display = 'none', 460);
}
function showCheckout() { if (!CART.length) { toast('🛒 Кошик порожній'); return; } haptic([50,30,50]); document.getElementById('view-cart').style.display = 'none'; document.getElementById('view-form').style.display = 'block'; }
function hideCheckout() { document.getElementById('view-form').style.display = 'none'; document.getElementById('view-cart').style.display = 'block'; }

/* ============================================================
   SYNC BADGES
   ============================================================ */
function syncBadges() {
    const cb = document.getElementById('cart-badge');
    const mb = document.getElementById('match-badge');
    const tc = CART.reduce((s, i) => s + i.qty, 0);
    if (cb) { cb.style.display = tc > 0 ? 'block' : 'none'; cb.textContent = tc; }
    if (mb) { mb.style.display = LIKED.length > 0 ? 'block' : 'none'; mb.textContent = LIKED.length; }
}

/* ============================================================
   TOAST
   ============================================================ */
function toast(msg, accent) {
    const w = document.getElementById('toast-wrap');
    const t = document.createElement('div');
    t.className = 'toast' + (accent ? ' accent' : '');
    t.textContent = msg; w.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.parentNode && t.parentNode.removeChild(t), 360); }, 2800);
}

/* ============================================================
   УТИЛІТИ
   ============================================================ */
function haptic(p) { if (navigator.vibrate) navigator.vibrate(p); }
function cleanName(name, brand) { if (!name || !brand) return name || ''; return name.replace(new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),'').trim(); }
function socialProof(id) { if (!SOCIAL_MAP[id]) SOCIAL_MAP[id] = Math.floor(Math.random() * 18) + 3; return SOCIAL_MAP[id]; }
function uid() { return Math.random().toString(36).substr(2,9); }
function esc(s) { return String(s).replace(/'/g,"\\'"); }
