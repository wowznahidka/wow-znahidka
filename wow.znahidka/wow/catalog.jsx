// ─────────────────────────────────────────────────────────────
// CATALOG PAGE
// Search · gender · category chips · brand · sort · sizes · grid
// ─────────────────────────────────────────────────────────────

function CatalogPage() {
  const { gender, setGender } = useWow();
  const [q,        setQ]        = React.useState('');
  const [cat,      setCat]      = React.useState('all');
  const [brand,    setBrand]    = React.useState('all');
  const [sort,     setSort]     = React.useState('popular');
  const [sizeSel,  setSizeSel]  = React.useState(null);
  const [filtering, setFiltering] = React.useState(false);

  // Trigger skeleton briefly whenever filters change
  React.useEffect(() => {
    setFiltering(true);
    const t = setTimeout(() => setFiltering(false), 220);
    return () => clearTimeout(t);
  }, [q, cat, brand, sort, sizeSel, gender]);

  // ── compute results ───────────────────────────────────────
  const results = React.useMemo(() => {
    let list = PRODUCTS.filter(p => filterByGender(p, gender));
    if (cat !== 'all')   list = list.filter(p => p.cat === cat);
    if (brand !== 'all') list = list.filter(p => p.brand === brand);
    if (sizeSel != null) list = list.filter(p => p.sizes.includes(sizeSel));
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(p =>
        p.brand.toLowerCase().includes(needle) ||
        p.name.toLowerCase().includes(needle)
      );
    }
    return sortProducts(list, sort);
  }, [gender, cat, brand, sort, sizeSel, q]);

  // All unique sizes available (from current gender-filtered set)
  const allSizes = React.useMemo(() => {
    const set = new Set();
    PRODUCTS.filter(p => filterByGender(p, gender)).forEach(p => p.sizes.forEach(s => set.add(s)));
    return [...set].sort((a, b) => a - b);
  }, [gender]);

  const activeFiltersCount =
    (cat !== 'all' ? 1 : 0) +
    (brand !== 'all' ? 1 : 0) +
    (sizeSel != null ? 1 : 0) +
    (q.trim() ? 1 : 0);

  const reset = () => {
    setQ(''); setCat('all'); setBrand('all'); setSizeSel(null);
  };

  return (
    <div className="cat-page">
      {/* ── Sticky search ── */}
      <div className="cat-search-wrap">
        <div className="cat-search">
          <I.Search s={16}/>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Пошук бренду або моделі…"
            autoComplete="off"
            spellCheck="false"
            aria-label="пошук товарів"
          />
          {q && (
            <button className="cat-search-clear" onClick={() => setQ('')} aria-label="очистити">
              <I.Close s={14}/>
            </button>
          )}
        </div>
      </div>

      {/* ── Gender ── */}
      <div className="cat-gender-wrap">
        <GenderToggle/>
      </div>

      {/* ── Category chips ── */}
      <div className="cat-chips" role="group" aria-label="Категорії">
        {CATS.map(c => (
          <button
            key={c.id}
            className={`cat-chip ${cat === c.id ? 'cat-chip-on' : ''}`}
            onClick={() => setCat(c.id)}
            aria-pressed={cat === c.id}
          >
            <span className="cat-chip-emoji" aria-hidden="true">{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* ── Brand chips ── */}
      <div className="cat-brand-row">
        <button
          className={`brand-chip ${brand === 'all' ? 'brand-chip-on' : ''}`}
          onClick={() => setBrand('all')}
          aria-pressed={brand === 'all'}
        >
          Усі бренди
        </button>
        {BRANDS.map(b => (
          <button
            key={b.name}
            className={`brand-chip ${brand === b.name ? 'brand-chip-on' : ''}`}
            onClick={() => setBrand(b.name)}
            aria-pressed={brand === b.name}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* ── Size filter ── */}
      <div className="size-filter">
        <div className="size-filter-label">Розмір</div>
        <div className="size-chips-row">
          {allSizes.map(sz => (
            <button
              key={sz}
              className={`size-chip ${sizeSel === sz ? 'size-chip-on' : ''}`}
              onClick={() => setSizeSel(sizeSel === sz ? null : sz)}
              aria-pressed={sizeSel === sz}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sort + reset bar ── */}
      <div className="sort-bar">
        <div className="sort-result-count">
          {results.length}&nbsp;{results.length === 1 ? 'модель' : 'моделей'}
          {activeFiltersCount > 0 && <span className="sort-fil-cnt">·&nbsp;{activeFiltersCount} фільтр</span>}
        </div>
        <div className="sort-spacer"/>
        {activeFiltersCount > 0 && (
          <button className="sort-reset" onClick={reset}>
            <I.Undo s={13}/>&nbsp;Скинути
          </button>
        )}
        <div className="sort-select">
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="сортувати">
            {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <I.Arr s={12}/>
        </div>
      </div>

      {/* ── Results grid ── */}
      <div className={`cat-grid-wrap ${filtering ? 'is-filtering' : ''}`}>
        {filtering ? (
          <SkelGrid n={6}/>
        ) : results.length > 0 ? (
          <div className="prods-grid">
            {results.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i, 6) * 30}>
                <ProductCard product={p}/>
              </Reveal>
            ))}
          </div>
        ) : (
          <Empty
            icon="🔎"
            title="Нічого не знайшли"
            sub="Спробуйте змінити фільтри або перевірити написання запиту."
            action={
              <button className="empty-action" onClick={reset}>
                Скинути фільтри&nbsp;<I.Arr s={12}/>
              </button>
            }
          />
        )}
      </div>

      <div className="page-bottom-pad"/>
    </div>
  );
}

window.CatalogPage = CatalogPage;
