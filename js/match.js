/* ============================================================
   WOW.ZNAHIDKA — MATCH / SWIPE ENGINE
   Tinder-style card stack with pointer + touch support.
   ============================================================ */

let _swipeLocked      = false;
let _swipeRenderTimer = null;
let _matchCombo       = 0;
let _comboTimer       = null;

// Match працює серіями по 20 карток: в кінці серії — екран «Твої матчі»
// з лайкнутими за серію і виходом у кошик або Telegram.
const MATCH_SESSION_LEN = 20;
let _matchHistory  = [];  // останні свайпи для undo: {dir, id, added}
let _sessionLikes  = [];  // id лайкнутих у поточній серії
let _sessionStart  = 0;   // matchIdx, з якого почалась поточна серія
let _likeBarTimer  = null;

async function initMatch() {
  clearTimeout(_swipeRenderTimer);
  _swipeRenderTimer = null;
  _swipeLocked = false;
  _attachMatchKeyboard();

  const _stageEl = document.getElementById('card-stage');
  if (_stageEl) _stageEl.innerHTML = `
    <div class="m-card" aria-hidden="true" style="pointer-events:none;cursor:default">
      <div class="m-card-media"><div class="skel" style="width:100%;aspect-ratio:4/3;border-radius:0"></div></div>
      <div class="m-card-body">
        <div class="skel" style="height:9px;width:45%;border-radius:4px;margin-bottom:10px"></div>
        <div class="skel" style="height:19px;width:80%;border-radius:4px;margin-bottom:7px"></div>
        <div class="skel" style="height:21px;width:35%;border-radius:4px;margin-bottom:5px"></div>
        <div class="skel" style="height:9px;width:60%;border-radius:4px"></div>
      </div>
    </div>`;

  const data = await fetchCatalog();
  if (!data || !data.length) return;

  // Перший вхід у Match — короткий опросник (3 кроки) замість повної колоди
  if (!_mqDone()) { _renderMatchQuiz(); return; }

  _startMatchDeck(data);
}

function _startMatchDeck(data) {
  const _pool = [...data];
  for (let i = _pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [_pool[i], _pool[j]] = [_pool[j], _pool[i]];
  }
  S.matchFullPool = _pool;
  // Прапорці з опросника застосовуються один раз, далі — що обрав юзер чіпами
  if (_mqPrefs) {
    S.matchSizeFilter = _mqPrefs.size   || 'all';
    S.matchBudget     = _mqPrefs.budget || 'all';
    _mqPrefs = null;
  } else {
    S.matchSizeFilter = S.matchSizeFilter || 'all';
    S.matchBudget     = S.matchBudget     || 'all';
  }
  _buildSizeChips(_pool);
  _buildBudgetChips();
  _applyMatchFilters();
}

// ── MATCH ONBOARDING QUIZ ────────────────────────────
// 3 швидких кроки (для кого / розмір / бюджет) → колода одразу під людину.
// Показується один раз; далі керування — звичайними чіпами фільтрів.
const MATCH_QUIZ_KEY = 'wow_match_quiz_v1';
let _mq = null;        // поточний стан проходження
let _mqPrefs = null;   // {size,budget} — застосувати при найближчому старті колоди

function _mqDone() {
  try { return !!localStorage.getItem(MATCH_QUIZ_KEY); } catch(_) { return true; }
}

function _renderMatchQuiz() {
  _mq = { step: 1, gender: null, size: null, budget: null };
  document.getElementById('page-match')?.classList.add('quiz-on');
  _mqRenderStep();
}

function _mqSizesFor(gender) {
  const all = (S.catalog && S.catalog.all) || [];
  const pool = gender && gender !== 'mixed'
    ? all.filter(p => p.gender === (gender === 'male' ? 'Чоловік' : 'Жінка'))
    : all;
  const sizes = new Set();
  pool.forEach(p => (p.sizes || []).forEach(s => { const v = String(s); if (v && v !== '?' && v !== 'ONE SIZE') sizes.add(v); }));
  return [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b));
}

function _mqRenderStep() {
  const stage = document.getElementById('card-stage');
  if (!stage || !_mq) return;
  const dots = [1, 2, 3].map(i => `<span class="mq-dot${i === _mq.step ? ' on' : ''}"></span>`).join('');
  let body = '';
  if (_mq.step === 1) {
    body = `
      <div class="mq-q">Для кого шукаємо?</div>
      <div class="mq-opts">
        <button class="mq-opt" onclick="mqPick('gender','male')">Чоловічі</button>
        <button class="mq-opt" onclick="mqPick('gender','female')">Жіночі</button>
        <button class="mq-opt mq-opt-soft" onclick="mqPick('gender','mixed')">Неважливо</button>
      </div>`;
  } else if (_mq.step === 2) {
    const sizes = _mqSizesFor(_mq.gender);
    body = `
      <div class="mq-q">Який розмір?</div>
      <div class="mq-sizes">
        ${sizes.map(s => `<button class="mq-sz" onclick="mqPick('size','${s}')">${s}</button>`).join('')}
      </div>
      <button class="mq-skip-step" onclick="mqPick('size',null)">Пропустити</button>`;
  } else {
    body = `
      <div class="mq-q">Бюджет?</div>
      <div class="mq-opts">
        <button class="mq-opt" onclick="mqPick('budget','2500')">до 2500₴</button>
        <button class="mq-opt" onclick="mqPick('budget','3000')">2500–3000₴</button>
        <button class="mq-opt" onclick="mqPick('budget',null)">3000₴+</button>
        <button class="mq-opt mq-opt-soft" onclick="mqPick('budget',null)">Неважливо</button>
      </div>`;
  }
  stage.innerHTML = `
    <div class="mq-card">
      <div class="mq-eyebrow">ШВИДКИЙ ПІДБІР · 15 СЕКУНД</div>
      ${body}
      <div class="mq-foot">
        <div class="mq-dots">${dots}</div>
        <button class="mq-skip-all" onclick="mqSkipAll()">Показати все →</button>
      </div>
    </div>`;
}

function mqPick(field, val) {
  if (!_mq) return;
  _mq[field] = val;
  _haptic(10);
  if (_mq.step < 3) { _mq.step++; _mqRenderStep(); return; }
  _mqFinish();
}

function mqSkipAll() {
  _mq = { step: 3, gender: null, size: null, budget: null };
  _mqFinish();
}

function _mqFinish() {
  try { localStorage.setItem(MATCH_QUIZ_KEY, '1'); } catch(_) {}
  const stage = document.getElementById('card-stage');
  if (stage) stage.innerHTML = `
    <div class="mq-card mq-ready">
      <div class="mq-ready-ico">🔥</div>
      <div class="mq-q">Зібрали колоду під тебе</div>
    </div>`;
  if (_mq.gender) setGender(_mq.gender, true);
  _mqPrefs = { size: _mq.size || 'all', budget: _mq.budget || 'all' };
  _mq = null;
  setTimeout(() => {
    document.getElementById('page-match')?.classList.remove('quiz-on');
    _startMatchDeck(getCatalog());
  }, 650);
}

function _preloadMatchImages() {
  const pool = S.matchPool || [];
  const idx  = S.matchIdx  || 0;
  for (let i = 1; i <= 3; i++) {
    const p = pool[idx + i];
    if (p && p.image && p.image.startsWith('http')) {
      const img = new Image();
      img.src = p.image;
    }
  }
}

function _buildSizeChips(pool) {
  const wrap = document.getElementById('match-size-filter');
  if (!wrap) return;
  const sizes = new Set();
  pool.forEach(p => (p.sizes || []).forEach(s => { const v = String(s); if (v && v !== '?') sizes.add(v); }));
  const sorted = [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b));
  const cur = String(S.matchSizeFilter || 'all');
  wrap.innerHTML = `<button class="match-sz-chip${cur === 'all' ? ' active' : ''}" data-sz="all" onclick="setMatchSize('all')">Всі</button>` +
    sorted.map(s => `<button class="match-sz-chip${cur === String(s) ? ' active' : ''}" data-sz="${s}" onclick="setMatchSize('${s}')">${s}</button>`).join('');
}

function setMatchSize(sz) {
  S.matchSizeFilter = sz;
  document.querySelectorAll('#match-size-filter .match-sz-chip').forEach(c => c.classList.toggle('active', c.dataset.sz === sz));
  _applyMatchFilters();
}

function _buildBudgetChips() {
  const wrap = document.getElementById('match-budget-filter');
  if (!wrap) return;
  const opts = [['all', 'Без різниці'], ['2000', 'до 2000₴'], ['2500', 'до 2500₴'], ['3000', 'до 3000₴']];
  const cur = String(S.matchBudget || 'all');
  wrap.innerHTML = opts.map(([v, label]) =>
    `<button class="match-sz-chip match-b-chip${v === cur ? ' active' : ''}" data-b="${v}" onclick="setMatchBudget('${v}')">${label}</button>`
  ).join('');
}

function setMatchBudget(b) {
  S.matchBudget = b;
  document.querySelectorAll('#match-budget-filter .match-sz-chip').forEach(c => c.classList.toggle('active', c.dataset.b === String(b)));
  _applyMatchFilters();
}

// Спільне перефільтрування пулу (розмір + бюджет) і старт нової серії
function _applyMatchFilters() {
  let pool = [...(S.matchFullPool || [])];
  const sz = S.matchSizeFilter;
  if (sz && sz !== 'all') pool = pool.filter(p => p.sizes && p.sizes.map(String).includes(String(sz)));
  const b = S.matchBudget;
  if (b && b !== 'all') pool = pool.filter(p => (Number(p.price) || 0) <= Number(b));
  S.matchPool   = pool;
  S.matchIdx    = 0;
  _matchHistory  = [];
  _sessionLikes  = [];
  _sessionStart  = 0;
  _matchCombo = 0;
  clearTimeout(_comboTimer);
  _updateComboUI();
  _updateUndoBtn();
  _hideLikeBar();
  renderMatchCard();
  _preloadMatchImages();
}

function renderMatchCard() {
  const stage   = document.getElementById('card-stage');
  const counter = document.getElementById('match-counter');
  if (!stage) return;

  if (S.matchIdx >= S.matchPool.length) {
    _renderMatchDone(stage, counter);
    return;
  }
  // Кінець серії з 20 карток — показуємо результат, а не наступну картку
  if (S.matchIdx - _sessionStart >= MATCH_SESSION_LEN) {
    _renderSessionResults(stage, counter);
    return;
  }

  const p     = S.matchPool[S.matchIdx];
  const faved = isFav(p.id);
  const sessionLen = Math.min(MATCH_SESSION_LEN, S.matchPool.length - _sessionStart);
  counter.textContent = `${S.matchIdx - _sessionStart + 1} / ${sessionLen}`;

  const card = document.createElement('div');
  card.className = 'm-card' + (faved ? ' is-fav' : '');
  card.id = 'current-match-card';
  const sizesStr = p.sizes.map(String).filter(s => s !== '?').join(' · ') || '?';
  card.innerHTML = `
    <div class="m-card-media">
      ${p.image && p.image.startsWith('http')
        ? `<img class="m-card-img" src="${esc(p.image)}" alt="${esc(p.brand)} ${esc(p.name)}"
             loading="lazy" onload="this.classList.add('loaded')">`
        : `<div class="m-card-img-ph" aria-hidden="true">👟</div>`}
      <div class="m-card-gradient" aria-hidden="true"></div>
      <div class="m-card-overlay">
        <div class="m-card-brand">${esc(p.brand)}</div>
        <div class="m-card-name">${esc(p.name)}</div>
        <div class="m-card-price-row">
          <span class="m-card-price">${p.price}₴</span>
          ${p.oldPrice > p.price ? `<span class="m-card-old-price">${p.oldPrice}₴</span>` : ''}
        </div>
        <div class="m-card-sizes">${sizesStr}</div>
      </div>
      ${faved ? `<div class="m-card-fav-badge" aria-hidden="true">❤️</div>` : ''}
      <div class="swipe-label like" id="sw-like">${L.matchLike}</div>
      <div class="swipe-label nope" id="sw-nope">${L.matchNope}</div>
    </div>
  `;

  stage.innerHTML = '';
  stage.appendChild(card);
  attachSwipeListeners(card, p);
}

// Екран «Твої матчі» після серії з 20 свайпів — головний вихід у замовлення
function _renderSessionResults(stage, counter) {
  _hideLikeBar();
  const liked = _sessionLikes.map(id => findProd(id) || S.favs.find(f => f.id === id)).filter(Boolean);
  counter.textContent = `${Math.min(MATCH_SESSION_LEN, S.matchPool.length - _sessionStart)} / ${Math.min(MATCH_SESSION_LEN, S.matchPool.length - _sessionStart)}`;
  const cartCount = S.cart.length;

  const likedGrid = liked.length ? `
    <div class="ms-grid">
      ${liked.slice(0, 8).map(p => `
        <button class="ms-item" onclick="openProductDetail(findProd('${esc(p.id)}'))" aria-label="${esc(p.brand)} ${esc(p.name)}">
          <img src="${esc(p.image)}" alt="" loading="lazy" onload="this.classList.add('loaded')">
          <span class="ms-item-price">${p.price}₴</span>
        </button>`).join('')}
    </div>` : '';

  stage.innerHTML = `<div class="match-empty match-session-end">
    <div class="match-empty-ico">${liked.length ? '🎯' : '🤔'}</div>
    <h3 style="font-size:22px;font-weight:900;margin-top:4px">${liked.length ? 'Твої матчі' : 'Нічого не зачепило?'}</h3>
    <p style="font-size:14px;color:var(--text-dim);line-height:1.5;max-width:280px;text-align:center;margin:2px 0 6px">
      ${liked.length
        ? `<strong style="color:var(--text)">${liked.length}</strong> ${liked.length === 1 ? 'пара' : liked.length < 5 ? 'пари' : 'пар'} за цю серію. Тапни, щоб обрати розмір.`
        : 'Спробуй інший бюджет чи розмір — або ще одну серію.'}
    </p>
    ${likedGrid}
    ${liked.length ? `
    <button class="match-restart-btn" style="background:var(--red);box-shadow:var(--shadow-red);margin-top:6px"
      onclick="${cartCount ? `openSheet('sheet-cart')` : `openSheet('sheet-fav')`}">
      🛒 Оформити${cartCount ? ` · ${cartCount} в кошику` : ''}
    </button>
    <button class="match-restart-btn" style="background:#2a7fd4;margin-top:8px" onclick="_matchTgShare()">
      🎯 Підберіть під мої лайки
    </button>` : ''}
    <button class="match-go-favs-btn" style="margin-top:8px" onclick="matchNextSession()">
      ▶️ Ще ${Math.min(MATCH_SESSION_LEN, S.matchPool.length - S.matchIdx)} пар
    </button>
  </div>`;
}

function matchNextSession() {
  _sessionStart = S.matchIdx;
  _sessionLikes = [];
  _matchHistory = [];
  _updateUndoBtn();
  renderMatchCard();
  _preloadMatchImages();
}

// Лайки серії — формою-заявкою (без прямого TG-контакту)
function _matchTgShare() {
  const items = _sessionLikes.map(id => findProd(id) || S.favs.find(f => f.id === id)).filter(Boolean);
  if (!items.length) return;
  const lines = items.slice(0, 10).map(p => `${p.brand} ${p.name} — ${p.price}₴ (${p.id})`);
  openRequestSheet('match', { items: lines });
}

function _renderMatchDone(stage, counter) {
  const favCount  = S.favs.length;
  const cartCount = S.cart.length;
  counter.textContent = `${S.matchPool.length} / ${S.matchPool.length}`;
  stage.innerHTML = `<div class="match-empty">
    <div class="match-empty-ico" style="animation:bounceY .9s ease-in-out infinite alternate">🏆</div>
    <h3 style="font-size:22px;font-weight:900;margin-top:4px">Ти переглянув усе!</h3>
    <p style="font-size:14px;color:var(--text-dim);line-height:1.6;max-width:260px;text-align:center">
      ${S.matchPool.length} пар переглянуто.<br>
      ${favCount > 0 ? `<strong style="color:var(--text)">${favCount} пари</strong> чекають у Улюблених.` : 'Лайкни пари, які сподобались — ми підберемо розмір.'}
    </p>
    ${favCount > 0 ? `
    <button class="match-restart-btn"
      style="background:var(--red);box-shadow:var(--shadow-red);margin-top:4px"
      onclick="openSheet('sheet-fav')">
      ❤️ Улюблені · ${favCount} пари
    </button>` : ''}
    ${cartCount > 0 ? `
    <button class="match-restart-btn"
      style="background:var(--text);color:var(--accent-inv);margin-top:${favCount ? '8px' : '4px'}"
      onclick="openSheet('sheet-cart')">
      🛒 Кошик · ${cartCount} пари
    </button>` : ''}
    <button class="match-go-favs-btn" style="margin-top:${favCount || cartCount ? '8px' : '4px'}"
      onclick="initMatch()">
      🔄 Почати знову
    </button>
  </div>`;
}

// ── KEYBOARD SHORTCUTS (PC) ──────────────────────── */
let _matchKbBound = false;
function _attachMatchKeyboard() {
  if (_matchKbBound) return;
  _matchKbBound = true;
  document.addEventListener('keydown', e => {
    if (S.activeTab !== 'match') return;
    if (_swipeLocked) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
      e.preventDefault(); swipeCard('right');
    } else if (e.key === 'ArrowLeft' || e.key === 'h' || e.key === 'H') {
      e.preventDefault(); swipeCard('left');
    } else if (e.code === 'Space' || e.key === 'Enter') {
      e.preventDefault(); swipeCard('right');
    } else if (e.key === 'Backspace' || e.key === 'u' || e.key === 'U') {
      e.preventDefault(); undoMatchSwipe();
    }
  });
}

// ── SWIPE LISTENER ───────────────────────────────── */
function attachSwipeListeners(card, product) {
  cleanupSwipe();
  let startX = 0, startY = 0, deltaX = 0, deltaY = 0, startTime = 0, dragging = false;
  const DIST_THRESHOLD = Math.min(60, window.innerWidth * 0.14);
  const FLING_DIST     = 24;
  const FLING_VEL      = 0.30;

  card.style.userSelect = 'none';
  card.style.webkitUserSelect = 'none';

  const onDown = e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging  = true;
    startTime = Date.now();
    startX    = e.clientX;
    startY    = e.clientY;
    deltaX    = 0;
    deltaY    = 0;
    card.style.transition = 'none';
    try { card.setPointerCapture(e.pointerId); } catch(_) {}
  };

  _moveHandler = e => {
    if (!dragging) return;
    deltaX = e.clientX - startX;
    deltaY = e.clientY - startY;
    // Prevent vertical page scroll when swiping horizontally
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
      e.preventDefault();
    }
    const _swipeBase = Math.min(window.innerWidth, 480);
    const rot   = (deltaX / _swipeBase) * 22;
    const scale = 1 - Math.min(0.04, Math.abs(deltaX) / (_swipeBase * 8));
    card.style.transform = `translate(${deltaX}px, ${deltaY * 0.3}px) rotate(${rot}deg) scale(${scale})`;
    const likeEl = document.getElementById('sw-like');
    const nopeEl = document.getElementById('sw-nope');
    const lr = Math.min(1, Math.max(0, (deltaX  - 10) / 55));
    const nr = Math.min(1, Math.max(0, (-deltaX - 10) / 55));
    if (likeEl) likeEl.style.opacity = lr;
    if (nopeEl) nopeEl.style.opacity = nr;
    if (likeEl) likeEl.classList.toggle('visible', lr > 0.12);
    if (nopeEl) nopeEl.classList.toggle('visible', nr > 0.12);
  };

  _upHandler = e => {
    if (!dragging) return;
    dragging = false;
    const elapsed  = Date.now() - startTime;
    const velocity = elapsed > 0 ? Math.abs(deltaX) / elapsed : 0;
    const isFling  = velocity >= FLING_VEL && Math.abs(deltaX) >= FLING_DIST;
    if (isFling || Math.abs(deltaX) > DIST_THRESHOLD) {
      swipeCard(deltaX > 0 ? 'right' : 'left');
    } else {
      card.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
      card.style.transform  = 'translate(0, 0) rotate(0deg)';
      const likeEl = document.getElementById('sw-like');
      const nopeEl = document.getElementById('sw-nope');
      if (likeEl) { likeEl.style.opacity = '0'; likeEl.classList.remove('visible'); }
      if (nopeEl) { nopeEl.style.opacity = '0'; nopeEl.classList.remove('visible'); }
    }
    deltaX = 0;
    deltaY = 0;
  };

  card.addEventListener('pointerdown', onDown);
  document.addEventListener('pointermove', _moveHandler, { passive: false });
  document.addEventListener('pointerup', _upHandler);
  document.addEventListener('pointercancel', _upHandler);
}

// ── SWIPE ACTION ─────────────────────────────────── */
function swipeCard(dir) {
  if (_swipeLocked) return;
  _swipeLocked = true;

  const card = document.getElementById('current-match-card');
  const p    = S.matchPool[S.matchIdx];
  if (!card || !p) { _swipeLocked = false; return; }

  card.style.pointerEvents = 'none';
  cleanupSwipe();

  const flyX  = (dir === 'right' ? 1 : -1) * (Math.min(window.innerWidth, 800) + 200);
  card.style.transition = 'transform .32s cubic-bezier(.55,0,.7,.4), opacity .22s ease';
  card.style.transform  = `translateX(${flyX}px) rotate(${dir === 'right' ? 30 : -30}deg) scale(0.9)`;
  card.style.opacity    = '0';

  const wasFav = isFav(p.id);
  _matchHistory.push({ dir, id: p.id, added: dir === 'right' && !wasFav });
  if (_matchHistory.length > 3) _matchHistory.shift();

  if (dir === 'right') {
    addToFavs(p);
    if (!_sessionLikes.includes(p.id)) _sessionLikes.push(p.id);
    _haptic(30);
    // PWA-банер не перебиває перший лайк — пропонуємо тільки залученим
    if (S.favs.length >= 5) tryShowPWAAfterLike();
    _matchCombo++;
    clearTimeout(_comboTimer);
    _comboTimer = setTimeout(() => { _matchCombo = 0; _updateComboUI(); }, 3500);
    _spawnHearts(card);
    // Комбо показує тільки тихий лічильник (m-combo) — тости кожні N лайків
    // перебивали гру і виглядали дешево
    _updateComboUI();
    _showLikeBar(p);
  } else {
    _hideLikeBar();
  }

  S.matchIdx++;
  _updateUndoBtn();
  _preloadMatchImages();
  clearTimeout(_swipeRenderTimer);
  _swipeRenderTimer = setTimeout(() => {
    _swipeLocked      = false;
    _swipeRenderTimer = null;
    renderMatchCard();
  }, 310);
}

// ── UNDO ─────────────────────────────────────────── */
function undoMatchSwipe() {
  if (_swipeLocked || !_matchHistory.length) return;
  if (S.matchIdx <= _sessionStart) return;
  const last = _matchHistory.pop();
  S.matchIdx--;
  if (last.dir === 'right') {
    if (last.added) {
      S.favs = S.favs.filter(f => f.id !== last.id);
      saveFavs();
      updateBadges();
    }
    _sessionLikes = _sessionLikes.filter(id => id !== last.id);
  }
  _matchCombo = 0;
  clearTimeout(_comboTimer);
  _updateComboUI();
  _updateUndoBtn();
  _hideLikeBar();
  _haptic(15);
  renderMatchCard();
}

function _updateUndoBtn() {
  const btn = document.getElementById('match-undo-btn');
  if (btn) btn.disabled = !_matchHistory.length || S.matchIdx <= _sessionStart;
}

// ── LIKE BAR: розмір одним тапом після лайку ─────── */
function _showLikeBar(p) {
  if (!p.sizes || !p.sizes.length) return;
  _hideLikeBar();
  const bar = document.createElement('div');
  bar.id = 'match-like-bar';
  const oneSize = p.sizes[0] === 'ONE SIZE';
  const sizes = oneSize
    ? `<button class="mlb-sz" onclick="matchQuickSize('${esc(p.id)}','ONE SIZE',this)">В кошик</button>`
    : p.sizes.slice(0, 6).map(s => `<button class="mlb-sz" onclick="matchQuickSize('${esc(p.id)}','${s}',this)">${s}</button>`).join('');
  bar.innerHTML = `
    <span class="mlb-label">${esc(p.brand)} · розмір:</span>
    <span class="mlb-sizes">${sizes}</span>`;
  document.getElementById('page-match')?.appendChild(bar);
  requestAnimationFrame(() => bar.classList.add('on'));
  clearTimeout(_likeBarTimer);
  _likeBarTimer = setTimeout(_hideLikeBar, 4000);
}

function _hideLikeBar() {
  clearTimeout(_likeBarTimer);
  const bar = document.getElementById('match-like-bar');
  if (!bar) return;
  bar.classList.remove('on');
  setTimeout(() => bar.remove(), 250);
}

function matchQuickSize(id, sz, btn) {
  const p = findProd(id) || S.favs.find(f => f.id === id);
  if (!p) return;
  const size = String(sz).toUpperCase() === 'ONE SIZE' ? 'ONE SIZE' : Number(sz);
  const exists = S.cart.find(c => c.id === p.id && String(c.size) === String(size));
  if (!exists) S.cart.push({ ...p, size, qty: 1 });
  else exists.qty = (exists.qty || 1) + 1;
  saveCart();
  updateBadges();
  _haptic([10, 30, 10]);
  if (window.gtag) gtag('event', 'add_to_cart', { currency: 'UAH', value: p.price, items: [{ item_id: p.id, item_name: `${p.brand} ${p.name}`, price: p.price }] });
  if (window.fbq)  fbq('track', 'AddToCart', { currency: 'UAH', value: p.price, content_ids: [p.id], content_type: 'product' });
  const wrap = btn?.closest('#match-like-bar')?.querySelector('.mlb-sizes');
  if (wrap) wrap.innerHTML = `<span class="mlb-done">✅ У кошику · <a onclick="openSheet('sheet-cart')">оформити →</a></span>`;
  clearTimeout(_likeBarTimer);
  _likeBarTimer = setTimeout(_hideLikeBar, 2500);
}

// ── COMBO UI ─────────────────────────────────────── */
function _updateComboUI() {
  const el = document.getElementById('match-combo');
  if (!el) return;
  if (_matchCombo >= 2) {
    el.textContent = `🔥 ×${_matchCombo}`;
    el.style.display = 'flex';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'comboPop .35s cubic-bezier(.34,1.56,.64,1)';
  } else {
    el.style.display = 'none';
  }
}

// ── HEART PARTICLES ──────────────────────────────── */
function _spawnHearts(card) {
  const rect = card.getBoundingClientRect();
  const cx   = rect.left + rect.width  * 0.5;
  const cy   = rect.top  + rect.height * 0.35;
  const pool = ['❤️','🔥','✨','💎','🩷','⭐'];
  for (let i = 0; i < 9; i++) {
    const el = document.createElement('div');
    el.textContent = pool[i % pool.length];
    const dx = (Math.random() - 0.5) * 240;
    const dy = -(70 + Math.random() * 140);
    el.style.cssText = `
      position:fixed;left:${cx}px;top:${cy}px;
      font-size:${16 + Math.random() * 16}px;
      pointer-events:none;z-index:9999;
      --dx:${dx}px;--dy:${dy}px;
      animation:heartFly ${0.5 + Math.random() * 0.5}s ease-out forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}

function setCatalogView(mode) {
  const view = document.getElementById('catalog-view');
  const btnGrid = document.getElementById('view-btn-grid');
  const btnReel = document.getElementById('view-btn-reel');
  if (!view) return;
  if (mode === 'reel') {
    view.classList.add('reel-mode');
    if (btnReel) btnReel.classList.add('active');
    if (btnGrid) btnGrid.classList.remove('active');
    try { localStorage.setItem('wow_catalog_view', 'reel'); } catch(_) {}
  } else {
    view.classList.remove('reel-mode');
    if (btnGrid) btnGrid.classList.add('active');
    if (btnReel) btnReel.classList.remove('active');
    try { localStorage.setItem('wow_catalog_view', 'grid'); } catch(_) {}
  }
}
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (localStorage.getItem('wow_catalog_view') === 'reel') setCatalogView('reel');
  } catch(_) {}
});
