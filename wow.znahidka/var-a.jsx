// VARIATION A — "Polished" (Refined Default)
// Same Apple-light vibe as the current site, but every surface dialed in:
// tighter type rhythm, less competing emoji, cleaner shadows, more breathing.

function VarA() {
  const popular = MOCK_PRODUCTS.slice(0, 4);
  const news    = MOCK_PRODUCTS.slice(2, 6);
  const deals   = MOCK_PRODUCTS.slice(0, 3);
  return (
    <div className="va-root">
      {/* ── HEADER ── */}
      <header className="va-header">
        <div className="va-logo">
          WOW<span className="va-dot">.</span>ZNAHIDKA
          <small>ПРЕМІУМ КРОСІВКИ</small>
        </div>
        <div className="va-hdr-actions">
          <button className="va-hdr-btn" aria-label="share">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
          </button>
          <button className="va-hdr-btn va-hdr-lang">UA</button>
          <button className="va-hdr-btn" aria-label="favorites">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span className="va-badge">3</span>
          </button>
          <button className="va-hdr-btn" aria-label="cart">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
            <span className="va-badge">2</span>
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="va-hero">
        <div className="va-greeting">Привіт! 👋</div>
        <h1 className="va-title">
          Твої ідеальні<br/>
          <span className="va-title-em">кросівки</span> тут.
        </h1>
        <div className="va-counter-chip">
          <span className="va-live-dot"></span>
          <strong>402</strong>&nbsp;моделей у наявності
        </div>
      </section>

      {/* ── GENDER TOGGLE ── */}
      <div className="va-gender">
        <button className="va-g-btn va-g-active">Всі</button>
        <button className="va-g-btn">Чоловіки</button>
        <button className="va-g-btn">Жінки</button>
      </div>

      {/* ── DAILY DEAL ── */}
      <section className="va-section">
        <div className="va-sec-head">
          <div className="va-sec-eyebrow">Знахідка дня</div>
          <div className="va-dd-timer">
            <span className="va-dd-dot"></span>
            <span>оновиться через&nbsp;<strong>04 : 12 : 38</strong></span>
          </div>
        </div>
        <h2 className="va-sec-title">Тільки сьогодні — безкоштовна доставка</h2>
        <div className="va-dd-row">
          {deals.map(p => (
            <div key={p.id} className="va-card va-card-deal">
              <div className="va-card-img-wrap">
                <ShoePh tint={p.tint} label="PRODUCT  SHOT" />
                <span className="va-deal-pill">FREE SHIP</span>
              </div>
              <div className="va-card-body">
                <div className="va-card-brand">{p.brand}</div>
                <div className="va-card-name">{p.name.split(' ').slice(0,3).join(' ')}</div>
                <div className="va-card-price-row">
                  <span className="va-card-price">{fmt(p.price)}</span>
                  {p.oldPrice && <span className="va-card-old">{fmt(p.oldPrice)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── POPULAR ── */}
      <section className="va-section">
        <div className="va-sec-head">
          <h2 className="va-sec-title">Популярне зараз</h2>
          <button className="va-sec-link">Всі<i className="va-arr"></i></button>
        </div>
        <div className="va-h-scroll">
          {popular.map(p => (
            <div key={p.id} className="va-card va-card-h">
              <div className="va-card-img-wrap">
                <ShoePh tint={p.tint} label="PRODUCT  SHOT" />
                {p.isNew && <span className="va-card-badge va-b-new">NEW</span>}
                {p.hot && !p.isNew && <span className="va-card-badge va-b-hot">HOT</span>}
              </div>
              <div className="va-card-body">
                <div className="va-card-brand">{p.brand}</div>
                <div className="va-card-name">{p.name}</div>
                <div className="va-card-price-row">
                  <span className="va-card-price">{fmt(p.price)}</span>
                  {p.oldPrice && <span className="va-card-old">{fmt(p.oldPrice)}</span>}
                  {p.oldPrice && <span className="va-card-disc">-{pct(p)}%</span>}
                </div>
                <div className="va-sizes-pre">
                  {p.sizes.slice(0,4).map(s => <span key={s}>{s}</span>)}
                  {p.sizes.length > 4 && <span className="va-sz-more">+{p.sizes.length - 4}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="va-section">
        <div className="va-sec-head">
          <h2 className="va-sec-title">Новинки</h2>
          <button className="va-sec-link">Всі<i className="va-arr"></i></button>
        </div>
        <div className="va-h-scroll">
          {news.map(p => (
            <div key={p.id} className="va-card va-card-h">
              <div className="va-card-img-wrap">
                <ShoePh tint={p.tint} label="PRODUCT  SHOT" />
                <span className="va-card-badge va-b-new">NEW</span>
              </div>
              <div className="va-card-body">
                <div className="va-card-brand">{p.brand}</div>
                <div className="va-card-name">{p.name}</div>
                <div className="va-card-price-row">
                  <span className="va-card-price">{fmt(p.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BRANDS ── */}
      <section className="va-section">
        <div className="va-sec-head">
          <h2 className="va-sec-title">Бренди</h2>
          <button className="va-sec-link">Всі<i className="va-arr"></i></button>
        </div>
        <div className="va-brands-row">
          {MOCK_BRANDS.slice(0,4).map(b => (
            <div key={b.name} className="va-brand-card" style={{ '--c1': b.c1, '--c2': b.c2 }}>
              <div className="va-brand-bg">
                <BrandPh tint={b.c1} label={b.name} />
              </div>
              <div className="va-brand-text">
                <div className="va-brand-name">{b.name}</div>
                <div className="va-brand-cnt">{b.count} моделей</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="va-section">
        <div className="va-sec-head">
          <h2 className="va-sec-title">Що кажуть покупці</h2>
        </div>
        <div className="va-h-scroll va-reviews-row">
          {MOCK_REVIEWS.slice(0,3).map((r, i) => (
            <div key={i} className={`va-rev ${i % 2 ? 'va-rev-alt' : ''}`}>
              <div className="va-rev-head">
                <div className="va-rev-emoji">{r.emoji}</div>
                <div>
                  <div className="va-rev-name">{r.name}</div>
                  <div className="va-rev-loc">{r.loc}</div>
                </div>
              </div>
              <div className="va-rev-stars">{'★'.repeat(r.stars)}</div>
              <div className="va-rev-text">{r.text}</div>
            </div>
          ))}
        </div>
        <button className="va-rev-cta">
          <span>✍️</span>
          <span>Залишити відгук</span>
          <i className="va-arr" style={{ marginLeft: 'auto' }}></i>
        </button>
      </section>

      {/* ── ALL ── */}
      <section className="va-section">
        <div className="va-sec-head">
          <h2 className="va-sec-title">Весь асортимент</h2>
        </div>
        <div className="va-prods-grid">
          {MOCK_PRODUCTS.map(p => (
            <div key={p.id} className="va-card va-card-grid">
              <div className="va-card-img-wrap">
                <ShoePh tint={p.tint} label="PRODUCT  SHOT" />
              </div>
              <div className="va-card-body">
                <div className="va-card-brand">{p.brand}</div>
                <div className="va-card-name">{p.name}</div>
                <div className="va-card-price-row">
                  <span className="va-card-price">{fmt(p.price)}</span>
                  {p.oldPrice && <span className="va-card-old">{fmt(p.oldPrice)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM NAV ── */}
      <nav className="va-nav">
        <button className="va-nav-item va-nav-active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>
          <span>Головна</span>
        </button>
        <button className="va-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5C8.5 13 10 11 12 11s3.5 2 3.5 3.5S14 17 12 17s-3.5-1-3.5-2.5z"/><path d="M12 22s8-4 8-12a8 8 0 1 0-16 0c0 8 8 12 8 12z"/></svg>
          <span>Match</span>
        </button>
        <button className="va-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span>Каталог</span>
        </button>
        <button className="va-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <span>Контакти</span>
        </button>
      </nav>
    </div>
  );
}

window.VarA = VarA;
