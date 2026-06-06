// VARIATION B — "Editorial"
// Magazine-style refinement: serif display accents, thin dividers,
// asymmetric Editor's Pick feature, quote-style reviews, more whitespace.
// Same product, dressed for a fashion title.

function VarB() {
  const editorsPick = MOCK_PRODUCTS[0];
  const popular     = MOCK_PRODUCTS.slice(1, 5);
  const news        = MOCK_PRODUCTS.slice(2, 6);
  return (
    <div className="vb-root">
      {/* ── HEADER ── */}
      <header className="vb-header">
        <div className="vb-logo-row">
          <div className="vb-logo">
            WOW<span className="vb-dot">.</span>ZNAHIDKA
          </div>
          <div className="vb-hdr-actions">
            <button className="vb-hdr-btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg></button>
            <button className="vb-hdr-btn vb-hdr-lang">UA</button>
            <button className="vb-hdr-btn vb-hdr-cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
              <span className="vb-badge">2</span>
            </button>
          </div>
        </div>
        <div className="vb-sub-row">
          <span>ISSUE 23&nbsp;·&nbsp;ВЕСНА 2026</span>
          <span className="vb-sub-dot">·</span>
          <span>БЕЗ ПЕРЕДОПЛАТИ</span>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="vb-hero">
        <div className="vb-eyebrow">
          <span className="vb-live-dot"></span>
          <span>402 моделі онлайн</span>
        </div>
        <h1 className="vb-title">
          The right<br/>
          <em>pair</em> finds<br/>
          you here.
        </h1>
        <p className="vb-sub">Куратив від WOW.ZNAHIDKA — оригінали Nike, Adidas, New Balance та Jordan з оплатою після примірки на Новій Пошті.</p>
        <div className="vb-cta-row">
          <button className="vb-cta-primary">Дивитися весь каталог<i className="vb-arr-l"></i></button>
          <button className="vb-cta-ghost">🔥&nbsp;Match</button>
        </div>
      </section>

      {/* ── GENDER ── */}
      <div className="vb-gender">
        <button className="vb-g-btn vb-g-active">All</button>
        <button className="vb-g-btn">Men</button>
        <button className="vb-g-btn">Women</button>
      </div>

      {/* ── EDITOR'S PICK ── */}
      <section className="vb-section">
        <div className="vb-sec-rule">
          <div className="vb-sec-eyebrow">№ 01 — Editor's Pick</div>
          <div className="vb-sec-rule-line"></div>
        </div>
        <div className="vb-editor-card">
          <div className="vb-editor-img" style={{ background: editorsPick.tint }}>
            <ShoePh tint={editorsPick.tint} label="EDITORIAL  SHOT" size="lg" />
            <span className="vb-editor-tag">FREE SHIPPING TODAY</span>
          </div>
          <div className="vb-editor-body">
            <div className="vb-editor-num">01</div>
            <div>
              <div className="vb-card-brand">{editorsPick.brand}</div>
              <div className="vb-editor-name">{editorsPick.name}</div>
            </div>
            <div className="vb-editor-meta">
              <div className="vb-editor-prices">
                <div className="vb-card-price">{fmt(editorsPick.price)}</div>
                <div className="vb-card-old">{fmt(editorsPick.oldPrice)}</div>
              </div>
              <div className="vb-editor-quote">
                <span className="vb-quote-mark">“</span>
                Silver Bullet — silhouette що повертається кожного сезону. Купи раз — носи роками.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── POPULAR ── */}
      <section className="vb-section">
        <div className="vb-sec-rule">
          <div className="vb-sec-eyebrow">№ 02 — Most Wanted</div>
          <div className="vb-sec-rule-line"></div>
          <button className="vb-sec-link">See all</button>
        </div>
        <div className="vb-h-scroll">
          {popular.map((p, i) => (
            <div key={p.id} className="vb-card vb-card-h">
              <div className="vb-card-num">0{i + 2}</div>
              <div className="vb-card-img-wrap" style={{ background: p.tint }}>
                <ShoePh tint={p.tint} label="PRODUCT  SHOT" />
              </div>
              <div className="vb-card-body">
                <div className="vb-card-brand">{p.brand}</div>
                <div className="vb-card-name">{p.name}</div>
                <div className="vb-card-price-row">
                  <span className="vb-card-price">{fmt(p.price)}</span>
                  {p.oldPrice && <span className="vb-card-old">{fmt(p.oldPrice)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEW ── */}
      <section className="vb-section">
        <div className="vb-sec-rule">
          <div className="vb-sec-eyebrow">№ 03 — Just In</div>
          <div className="vb-sec-rule-line"></div>
          <button className="vb-sec-link">See all</button>
        </div>
        <div className="vb-h-scroll">
          {news.map(p => (
            <div key={p.id} className="vb-card vb-card-h">
              <div className="vb-card-img-wrap" style={{ background: p.tint }}>
                <ShoePh tint={p.tint} label="PRODUCT  SHOT" />
                <span className="vb-tag-new">NEW</span>
              </div>
              <div className="vb-card-body">
                <div className="vb-card-brand">{p.brand}</div>
                <div className="vb-card-name">{p.name}</div>
                <div className="vb-card-price-row">
                  <span className="vb-card-price">{fmt(p.price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BRANDS ── */}
      <section className="vb-section">
        <div className="vb-sec-rule">
          <div className="vb-sec-eyebrow">№ 04 — Houses</div>
          <div className="vb-sec-rule-line"></div>
        </div>
        <div className="vb-brands-grid">
          {MOCK_BRANDS.slice(0,4).map(b => (
            <div key={b.name} className="vb-brand-cell">
              <div className="vb-brand-name-display">{b.name}</div>
              <div className="vb-brand-divider"></div>
              <div className="vb-brand-foot">
                <span className="vb-brand-cnt">{b.count}&nbsp;моделей</span>
                <i className="vb-arr-l"></i>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── REVIEWS — Pull quote style ── */}
      <section className="vb-section">
        <div className="vb-sec-rule">
          <div className="vb-sec-eyebrow">№ 05 — Word of mouth</div>
          <div className="vb-sec-rule-line"></div>
        </div>
        <div className="vb-pull-quote">
          <div className="vb-pull-mark">”</div>
          <blockquote>
            Замовляла Nike Air Max — прийшли ідеальні, розмір в розмір. Дівчата з примірочної на НП в захваті.
          </blockquote>
          <div className="vb-pull-byline">
            <span className="vb-pull-name">Аня</span>
            <span className="vb-pull-loc">Київ</span>
            <span className="vb-pull-stars">★★★★★</span>
          </div>
        </div>
        <div className="vb-rev-mini-row">
          {MOCK_REVIEWS.slice(1,3).map((r, i) => (
            <div key={i} className="vb-rev-mini">
              <div className="vb-rev-mini-stars">★★★★★</div>
              <div className="vb-rev-mini-text">{r.text}</div>
              <div className="vb-rev-mini-byline">— {r.name}, {r.loc}</div>
            </div>
          ))}
        </div>
        <button className="vb-rev-cta">Add your story →</button>
      </section>

      {/* ── ALL ── */}
      <section className="vb-section">
        <div className="vb-sec-rule">
          <div className="vb-sec-eyebrow">№ 06 — The Archive</div>
          <div className="vb-sec-rule-line"></div>
        </div>
        <div className="vb-prods-grid">
          {MOCK_PRODUCTS.map(p => (
            <div key={p.id} className="vb-card vb-card-grid">
              <div className="vb-card-img-wrap" style={{ background: p.tint }}>
                <ShoePh tint={p.tint} label="PRODUCT  SHOT" />
              </div>
              <div className="vb-card-body">
                <div className="vb-card-brand">{p.brand}</div>
                <div className="vb-card-name">{p.name}</div>
                <div className="vb-card-price-row">
                  <span className="vb-card-price">{fmt(p.price)}</span>
                  {p.oldPrice && <span className="vb-card-old">{fmt(p.oldPrice)}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM NAV — icon only ── */}
      <nav className="vb-nav">
        <button className="vb-nav-item vb-nav-active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></svg>
        </button>
        <button className="vb-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-12a8 8 0 1 0-16 0c0 8 8 12 8 12z"/></svg>
        </button>
        <button className="vb-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        </button>
        <button className="vb-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </button>
      </nav>
    </div>
  );
}

window.VarB = VarB;
