// ─────────────────────────────────────────────────────────────
// MATCH PAGE — swipeable card stack (Tinder for sneakers)
// Pointer-drag: right ❤ adds to favorites, left ✕ skips.
// Buttons mirror swipes. Counter + restart on empty.
// ─────────────────────────────────────────────────────────────

function MatchPage() {
  const { gender, toggleFav, favorites, navigate, openSheet } = useWow();

  // Build the stack — filter by gender, then dedupe vs current favorites
  const baseStack = React.useMemo(() => {
    return PRODUCTS
      .filter(p => filterByGender(p, gender))
      .filter(p => !favorites.has(p.id));
    // We freeze this stack at mount time so the user can "swipe through" without re-shuffling
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender]);

  const [order, setOrder]   = React.useState(() => baseStack.map(p => p.id));
  const [seen,  setSeen]    = React.useState(0);   // viewed so far
  const [drag,  setDrag]    = React.useState({ x: 0, y: 0, dragging: false });
  const [exit,  setExit]    = React.useState(null); // 'left' | 'right' | null

  // Reset stack when gender / favorites change
  React.useEffect(() => {
    setOrder(baseStack.map(p => p.id));
    setSeen(0);
    setExit(null);
    setDrag({ x: 0, y: 0, dragging: false });
  }, [baseStack]);

  const top    = order[0] ? PRODUCTS.find(p => p.id === order[0]) : null;
  const second = order[1] ? PRODUCTS.find(p => p.id === order[1]) : null;
  const third  = order[2] ? PRODUCTS.find(p => p.id === order[2]) : null;

  // ── pointer-drag ───────────────────────────────────────────
  const startRef = React.useRef({ x: 0, y: 0 });
  const onPointerDown = (e) => {
    if (!top || exit) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, dragging: true });
  };
  const onPointerMove = (e) => {
    if (!drag.dragging) return;
    setDrag(d => ({ ...d, x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y }));
  };
  const onPointerUp = (e) => {
    if (!drag.dragging) return;
    const threshold = 90;
    if (drag.x > threshold)        commitSwipe('right');
    else if (drag.x < -threshold)  commitSwipe('left');
    else                           setDrag({ x: 0, y: 0, dragging: false });
  };

  const commitSwipe = (dir) => {
    setExit(dir);
    if (dir === 'right' && top) {
      toggleFav(top.id);
    }
    setTimeout(() => {
      setOrder(o => o.slice(1));
      setSeen(s => s + 1);
      setDrag({ x: 0, y: 0, dragging: false });
      setExit(null);
    }, 280);
  };

  // ── card transforms ────────────────────────────────────────
  const swipeOpacityRight = Math.min(1, Math.max(0, drag.x / 110));
  const swipeOpacityLeft  = Math.min(1, Math.max(0, -drag.x / 110));

  const topStyle = (() => {
    if (exit === 'right') return { transform: 'translateX(140%) rotate(20deg)', opacity: 0 };
    if (exit === 'left')  return { transform: 'translateX(-140%) rotate(-20deg)', opacity: 0 };
    if (drag.dragging) {
      const rot = drag.x * 0.06;
      return { transform: `translate(${drag.x}px, ${drag.y * 0.4}px) rotate(${rot}deg)`, transition: 'none' };
    }
    return { transform: 'translate(0,0) rotate(0)', opacity: 1 };
  })();

  // ── EMPTY ──────────────────────────────────────────────────
  if (!top) {
    return (
      <div className="match-page">
        <header className="match-top">
          <h1 className="match-title">🔥 Match</h1>
          <div className="match-counter">{seen} / {seen}</div>
        </header>
        <Empty
          icon="🎉"
          title="Усе оглянуто!"
          sub={`Ти переглянув ${seen} пар. Загляни в улюблені — там твої лайки.`}
          action={
            <div className="empty-action-row">
              <button className="empty-action" onClick={() => openSheet('fav')}>
                ❤ Улюблені
              </button>
              <button className="empty-action empty-action-ghost" onClick={() => navigate('catalog')}>
                Каталог <I.Arr s={12}/>
              </button>
            </div>
          }
        />
        <div className="page-bottom-pad"/>
      </div>
    );
  }

  return (
    <div className="match-page">
      <header className="match-top">
        <h1 className="match-title">🔥 Match</h1>
        <div className="match-counter">{seen + 1} / {seen + order.length}</div>
      </header>
      <div className="match-gender-wrap"><GenderToggle/></div>
      <p className="match-hint">Свайп вправо — ❤ в Улюблені · вліво — пропустити</p>

      <div className="match-stage">
        {third && <MatchCard product={third} depth={2} />}
        {second && <MatchCard product={second} depth={1} />}
        {top && (
          <div
            className={`match-card-wrap match-card-wrap-top ${drag.dragging ? 'is-drag' : ''}`}
            style={topStyle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <MatchCard product={top} depth={0} />
            <div className="swipe-label swipe-like"  style={{ opacity: swipeOpacityRight }}>LIKE</div>
            <div className="swipe-label swipe-nope" style={{ opacity: swipeOpacityLeft }}>NOPE</div>
          </div>
        )}
      </div>

      <div className="match-actions">
        <button className="match-act match-act-nope" onClick={() => commitSwipe('left')} aria-label="пропустити">
          <I.Close s={26}/>
        </button>
        <button className="match-act match-act-info" onClick={() => openSheet('product', top.id)} aria-label="деталі">
          <I.Spark s={20}/>
        </button>
        <button className="match-act match-act-like" onClick={() => commitSwipe('right')} aria-label="лайк">
          <I.Heart s={26} filled/>
        </button>
      </div>

      <div className="page-bottom-pad"/>
    </div>
  );
}

// Stacked card visual — depth offsets it down/scaled behind the top card.
function MatchCard({ product, depth = 0 }) {
  return (
    <div className={`match-card-wrap match-card-depth-${depth}`} style={depth ? {} : undefined}>
      <div className="m-card">
        <div className="m-card-img-wrap" style={{ background: product.tint }}>
          <ShoePh tint={product.tint} label="PRODUCT  SHOT" />
          {product.isNew && <span className="card-badge card-badge-new">NEW</span>}
          {!product.isNew && product.hot && <span className="card-badge card-badge-hot">HOT</span>}
        </div>
        <div className="m-card-body">
          <div className="m-card-brand">{product.brand}</div>
          <div className="m-card-name">{product.name}</div>
          <div className="m-card-price-row">
            <span className="m-card-price">{fmt(product.price)}</span>
            {product.oldPrice && <span className="m-card-old">{fmt(product.oldPrice)}</span>}
            {product.oldPrice && <span className="card-disc">−{pct(product)}%</span>}
          </div>
          <div className="m-card-sizes">
            Розміри: {product.sizes.join(' · ')}
          </div>
        </div>
      </div>
    </div>
  );
}

window.MatchPage = MatchPage;
