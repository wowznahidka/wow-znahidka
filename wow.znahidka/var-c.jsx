// VARIATION C — "Heat"
// Confident streetwear-hype refinement: oversized display type, condensed
// sans tags, a red banner block, prominent numbers, big edge-to-edge feature
// product. Same brand DNA but turned up.

function VarC() {
  const hero    = MOCK_PRODUCTS[0];
  const popular = MOCK_PRODUCTS.slice(1, 5);
  const news    = MOCK_PRODUCTS.slice(2, 6);
  return (
    <div className="vc-root">
      {/* ── HEADER ── */}
      <header className="vc-header">
        <div className="vc-logo">
          WOW<span className="vc-dot">.</span>ZNAHIDKA
        </div>
        <div className="vc-hdr-actions">
          <button className="vc-hdr-btn vc-hdr-lang">UA</button>
          <button className="vc-hdr-btn">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span className="vc-badge">3</span>
          </button>
          <button className="vc-hdr-cart">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
            <span>2 пари</span>
          </button>
        </div>
      </header>

      {/* ── HERO — Edge-to-edge feature drop ── */}
      <section className="vc-hero">
        <div className="vc-hero-top">
          <div className="vc-hero-eyebrow">
            <span className="vc-blink"></span>
            ДРОП ТИЖНЯ&nbsp;·&nbsp;ТІЛЬКИ 3 ДНІ
          </div>
          <div className="vc-hero-count"><strong>402</strong>&nbsp;пари</div>
        </div>
        <h1 className="vc-headline">
          ЗНАЙДИ<br/>СВОЮ<br/>
          <span className="vc-headline-em">ПАРУ.</span>
        </h1>
        <div className="vc-hero-feature" style={{ background: hero.tint }}>
          <div className="vc-hero-img">
            <ShoePh tint={hero.tint} label="HERO  SHOT" size="lg" />
          </div>
          <div className="vc-hero-overlay">
            <div className="vc-hero-brand">{hero.brand}</div>
            <div className="vc-hero-name">{hero.name}</div>
            <div className="vc-hero-price-row">
              <span className="vc-hero-price">{fmt(hero.price)}</span>
              <span className="vc-hero-old">{fmt(hero.oldPrice)}</span>
              <span className="vc-hero-disc">−{pct(hero)}%</span>
            </div>
          </div>
        </div>
        <button className="vc-hero-cta">
          ЗАБРАТИ ПАРУ
          <i className="vc-arr-l"></i>
        </button>
      </section>

      {/* ── GENDER ── */}
      <div className="vc-gender">
        <button className="vc-g-btn vc-g-active">ВСІ</button>
        <button className="vc-g-btn">ЧОЛОВІЧЕ</button>
        <button className="vc-g-btn">ЖІНОЧЕ</button>
      </div>

      {/* ── MARQUEE TICKER ── */}
      <div className="vc-marquee">
        <div className="vc-marquee-inner">
          {Array.from({ length: 3 }).map((_, i) => (
            <React.Fragment key={i}>
              <span>NIKE</span><span className="vc-mq-sep">✦</span>
              <span>ADIDAS</span><span className="vc-mq-sep">✦</span>
              <span>NEW BALANCE</span><span className="vc-mq-sep">✦</span>
              <span>JORDAN</span><span className="vc-mq-sep">✦</span>
              <span>ASICS</span><span className="vc-mq-sep">✦</span>
              <span>SALOMON</span><span className="vc-mq-sep">✦</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── HEAT / POPULAR ── */}
      <section className="vc-section">
        <div className="vc-sec-head">
          <div className="vc-sec-number">01</div>
          <div className="vc-sec-titles">
            <div className="vc-sec-kicker">HEAT</div>
            <h2 className="vc-sec-title">ЛЕТЯТЬ ЗАРАЗ</h2>
          </div>
          <button className="vc-sec-link">ВСІ<i className="vc-arr-l"></i></button>
        </div>
        <div className="vc-h-scroll">
          {popular.map((p, i) => (
            <div key={p.id} className="vc-card vc-card-h">
              <div className="vc-card-img-wrap" style={{ background: p.tint }}>
                <ShoePh tint={p.tint} label="PRODUCT  SHOT" />
                <span className="vc-rank">#{i + 1}</span>
                {p.hot && <span className="vc-tag-hot">🔥 HOT</span>}
              </div>
              <div className="vc-card-body">
                <div className="vc-card-brand">{p.brand}</div>
                <div className="vc-card-name">{p.name}</div>
                <div className="vc-card-price-row">
                  <span className="vc-card-price">{fmt(p.price)}</span>
                  {p.oldPrice && <span className="vc-card-old">{fmt(p.oldPrice)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RED BANNER — Trust block ── */}
      <section className="vc-banner">
        <div className="vc-banner-grid">
          <div className="vc-banner-cell">
            <div className="vc-banner-stat">0₴</div>
            <div className="vc-banner-lbl">передоплата</div>
          </div>
          <div className="vc-banner-cell">
            <div className="vc-banner-stat">1–3</div>
            <div className="vc-banner-lbl">дні&nbsp;·&nbsp;нова пошта</div>
          </div>
          <div className="vc-banner-cell">
            <div className="vc-banner-stat">100%</div>
            <div className="vc-banner-lbl">оригінал</div>
          </div>
        </div>
      </section>

      {/* ── JUST IN ── */}
      <section className="vc-section">
        <div className="vc-sec-head">
          <div className="vc-sec-number">02</div>
          <div className="vc-sec-titles">
            <div className="vc-sec-kicker">JUST IN</div>
            <h2 className="vc-sec-title">НОВИНКИ</h2>
          </div>
          <button className="vc-sec-link">ВСІ<i className="vc-arr-l"></i></button>
        </div>
        <div className="vc-h-scroll">
          {news.map(p => (
            <div key={p.id} className="vc-card vc-card-h">
              <div className="vc-card-img-wrap" style={{ background: p.tint }}>
                <ShoePh tint={p.tint} label="PRODUCT  SHOT" />
                <span className="vc-tag-new">NEW</span>
              </div>
              <div className="vc-card-body">
                <div className="vc-card-brand">{p.brand}</div>
                <div className="vc-card-name">{p.name}</div>
                <div className="vc-card-price-row">
                  <span className="vc-card-price">{fmt(p.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BRANDS — Big type list ── */}
      <section className="vc-section">
        <div className="vc-sec-head">
          <div className="vc-sec-number">03</div>
          <div className="vc-sec-titles">
            <div className="vc-sec-kicker">HOUSES</div>
            <h2 className="vc-sec-title">БРЕНДИ</h2>
          </div>
        </div>
        <div className="vc-brands-list">
          {MOCK_BRANDS.slice(0,5).map(b => (
            <div key={b.name} className="vc-brand-row">
              <div className="vc-brand-name">{b.name.toUpperCase()}</div>
              <div className="vc-brand-dots"></div>
              <div className="vc-brand-cnt">{b.count}</div>
              <i className="vc-arr-l"></i>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="vc-section">
        <div className="vc-sec-head">
          <div className="vc-sec-number">04</div>
          <div className="vc-sec-titles">
            <div className="vc-sec-kicker">REAL TALK</div>
            <h2 className="vc-sec-title">ЛЮДИ КАЖУТЬ</h2>
          </div>
        </div>
        <div className="vc-h-scroll vc-reviews">
          {MOCK_REVIEWS.slice(0,3).map((r, i) => (
            <div key={i} className="vc-rev">
              <div className="vc-rev-stars">★★★★★</div>
              <div className="vc-rev-text">«{r.text}»</div>
              <div className="vc-rev-byline">
                <span className="vc-rev-emoji">{r.emoji}</span>
                <strong>{r.name}</strong>,&nbsp;{r.loc}
              </div>
            </div>
          ))}
        </div>
        <button className="vc-rev-cta">
          ✍️&nbsp;ЗАЛИШИТИ ВІДГУК
          <i className="vc-arr-l"></i>
        </button>
      </section>

      {/* ── ALL ── */}
      <section className="vc-section">
        <div className="vc-sec-head">
          <div className="vc-sec-number">05</div>
          <div className="vc-sec-titles">
            <div className="vc-sec-kicker">EVERYTHING</div>
            <h2 className="vc-sec-title">ВЕСЬ АСОРТИМЕНТ</h2>
          </div>
        </div>
        <div className="vc-prods-grid">
          {MOCK_PRODUCTS.map(p => (
            <div key={p.id} className="vc-card vc-card-grid">
              <div className="vc-card-img-wrap" style={{ background: p.tint }}>
                <ShoePh tint={p.tint} label="PRODUCT  SHOT" />
                {p.oldPrice && <span className="vc-card-disc">−{pct(p)}%</span>}
              </div>
              <div className="vc-card-body">
                <div className="vc-card-brand">{p.brand}</div>
                <div className="vc-card-name">{p.name}</div>
                <div className="vc-card-price-row">
                  <span className="vc-card-price">{fmt(p.price)}</span>
                  {p.oldPrice && <span className="vc-card-old">{fmt(p.oldPrice)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM NAV ── */}
      <nav className="vc-nav">
        <button className="vc-nav-item vc-nav-active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12l9-9 9 9v10H14v-6h-4v6H3z"/></svg>
          <span>ГОЛОВНА</span>
        </button>
        <button className="vc-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.5-7-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-7 11-7 11h-4z"/></svg>
          <span>MATCH</span>
        </button>
        <button className="vc-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span>КАТАЛОГ</span>
        </button>
        <button className="vc-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v12H7l-3 4z"/></svg>
          <span>КОНТАКТИ</span>
        </button>
      </nav>
    </div>
  );
}

window.VarC = VarC;
