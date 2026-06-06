// ─────────────────────────────────────────────────────────────
// HOME PAGE
// Greeting · gender toggle · daily deal · popular · new
// brand cards · reviews · all products
// ─────────────────────────────────────────────────────────────

function GenderToggle() {
  const { gender, setGender } = useWow();
  const options = [
    { id: 'all',    label: 'Усі' },
    { id: 'm',      label: 'Чоловіки' },
    { id: 'f',      label: 'Жінки' },
  ];
  return (
    <div className="gender" role="group" aria-label="Стать">
      <div className="gender-thumb" style={{ transform: `translateX(${options.findIndex(o => o.id === gender) * 100}%)` }}/>
      {options.map(o => (
        <button
          key={o.id}
          className={`gender-btn ${gender === o.id ? 'gender-btn-on' : ''}`}
          onClick={() => setGender(o.id)}
          aria-pressed={gender === o.id}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function DailyDeal() {
  const { gender, navigate } = useWow();
  const deals = PRODUCTS
    .filter(p => filterByGender(p, gender) && p.oldPrice)
    .slice(0, 3);

  // Countdown timer — refreshes every second; ticks down to next midnight.
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const eod = (() => {
    const d = new Date(now);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  })();
  const left = Math.max(0, eod - now);
  const h = String(Math.floor(left / 3600000)).padStart(2, '0');
  const m = String(Math.floor((left / 60000) % 60)).padStart(2, '0');
  const s = String(Math.floor((left / 1000) % 60)).padStart(2, '0');

  if (deals.length === 0) return null;

  return (
    <Reveal>
      <section className="section">
        <header className="sec-head">
          <div>
            <div className="sec-eyebrow">
              <span className="dot-orange"></span>
              Знахідка дня
            </div>
            <h2 className="sec-title">Безкоштовна доставка</h2>
          </div>
          <div className="sec-timer">
            <small>оновиться через</small>
            <strong>{h}:{m}:{s}</strong>
          </div>
        </header>
        <div className="deal-row">
          {deals.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>
    </Reveal>
  );
}

function HomePage() {
  const { gender, navigate } = useWow();

  const filtered = PRODUCTS.filter(p => filterByGender(p, gender));
  const popular  = sortProducts(filtered, 'popular').slice(0, 8);
  const newArr   = sortProducts(filtered.filter(p => p.isNew), 'new').slice(0, 8);
  const all      = filtered;

  const totalCount = PRODUCTS.length * 17; // simulated big inventory number

  return (
    <div className="home-page">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-greeting">
          Привіт! <span className="hero-wave">👋</span>
        </div>
        <h1 className="hero-title">
          Твої ідеальні<br/>
          <span className="hero-em">кросівки</span> тут.
        </h1>
        <div className="hero-counter">
          <span className="hero-live-dot"></span>
          <strong><CountUp to={totalCount} format={(n) => n.toLocaleString('uk-UA')} /></strong>
          <span>моделей у наявності</span>
        </div>
        <div className="hero-trust">
          <span><I.Check s={12}/> 0₴ передоплати</span>
          <span><I.Check s={12}/> Оригінал</span>
          <span><I.Check s={12}/> 1–3 дні</span>
        </div>
      </section>

      <div className="gender-wrap">
        <GenderToggle/>
      </div>

      {/* ── DAILY DEAL ── */}
      <DailyDeal/>

      {/* ── POPULAR ── */}
      <Reveal>
        <section className="section">
          <header className="sec-head">
            <h2 className="sec-title">Популярне зараз</h2>
            <button className="sec-link" onClick={() => navigate('catalog')}>Всі <I.Arr s={12}/></button>
          </header>
        </section>
        <div className="h-scroll" role="list">
          {popular.map((p, i) => (
            <div role="listitem" key={p.id} className="h-scroll-item">
              <Reveal delay={i * 50} dir="right">
                <ProductCard product={p} wide />
              </Reveal>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ── NEW ── */}
      {newArr.length > 0 && (
        <Reveal>
          <section className="section">
            <header className="sec-head">
              <h2 className="sec-title">Новинки</h2>
              <button className="sec-link" onClick={() => navigate('catalog')}>Всі <I.Arr s={12}/></button>
            </header>
          </section>
          <div className="h-scroll" role="list">
            {newArr.map((p, i) => (
              <div role="listitem" key={p.id} className="h-scroll-item">
                <Reveal delay={i * 50} dir="right">
                  <ProductCard product={p} wide />
                </Reveal>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* ── BRANDS ── */}
      <Reveal>
        <section className="section">
          <header className="sec-head">
            <h2 className="sec-title">Бренди</h2>
            <button className="sec-link" onClick={() => navigate('catalog')}>Всі <I.Arr s={12}/></button>
          </header>
        </section>
        <div className="h-scroll" role="list">
          {BRANDS.map((b, i) => (
            <Reveal key={b.name} delay={i * 50} dir="right">
              <button
                className="brand-card h-scroll-item"
                style={{ '--bc1': b.c1, '--bc2': b.c2 }}
                onClick={() => navigate('catalog')}
                aria-label={`${b.name}, ${b.count} моделей`}
              >
                <div className="brand-card-name">{b.name}</div>
                <div className="brand-card-cnt">{b.count} моделей</div>
              </button>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* ── REVIEWS ── */}
      <Reveal>
        <section className="section">
          <header className="sec-head">
            <h2 className="sec-title">Що кажуть покупці</h2>
          </header>
        </section>
        <div className="h-scroll" role="list">
          {REVIEWS.map((r, i) => (
            <Reveal key={i} delay={i * 50} dir="right">
              <div className={`rev h-scroll-item ${i % 2 ? 'rev-alt' : ''}`}>
                <div className="rev-head">
                  <div className="rev-emoji" aria-hidden="true">{r.emoji}</div>
                  <div>
                    <div className="rev-name">{r.name}</div>
                    <div className="rev-loc">{r.loc}</div>
                  </div>
                </div>
                <Stars n={r.stars}/>
                <div className="rev-text">{r.text}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <button className="rev-cta">
            <span>✍️</span>
            <span>Залишити відгук</span>
            <I.Arr s={12} />
          </button>
        </Reveal>
      </Reveal>

      {/* ── ALL ── */}
      <Reveal>
        <section className="section">
          <header className="sec-head">
            <h2 className="sec-title">Весь асортимент</h2>
            <span className="sec-sub">{all.length} моделей</span>
          </header>
          <div className="prods-grid">
            {all.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 6) * 40}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <div className="page-bottom-pad"/>
    </div>
  );
}

window.HomePage      = HomePage;
window.GenderToggle  = GenderToggle;
