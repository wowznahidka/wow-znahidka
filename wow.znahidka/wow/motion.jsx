// ─────────────────────────────────────────────────────────────
// MOTION — scroll reveals, page transitions, skeletons, ticker
// ─────────────────────────────────────────────────────────────

// <Reveal> — fades + slides element in once it crosses 12% of viewport.
// Children stay statically painted afterwards (no jitter on re-render).
function Reveal({ children, delay = 0, dir = 'up', className = '', as: As = 'div', ...rest }) {
  const ref = React.useRef(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;
    // If element is already in view at mount (e.g. above-fold), show after micro delay
    const r = ref.current.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.95) {
      const t = setTimeout(() => setShown(true), 16);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <As
      ref={ref}
      className={`reveal reveal-${dir} ${shown ? 'reveal-in' : ''} ${className}`}
      style={{ transitionDelay: shown ? `${delay}ms` : '0ms' }}
      {...rest}
    >
      {children}
    </As>
  );
}

// <PageSwap> — wraps page content; fades old out / new in when tabKey changes.
function PageSwap({ tabKey, children }) {
  const [renderedKey, setRenderedKey] = React.useState(tabKey);
  const [phase,       setPhase]       = React.useState('in');  // 'in' | 'out'

  React.useEffect(() => {
    if (tabKey === renderedKey) return;
    setPhase('out');
    const t = setTimeout(() => {
      setRenderedKey(tabKey);
      setPhase('in');
    }, 140);
    return () => clearTimeout(t);
  }, [tabKey, renderedKey]);

  return (
    <div className={`page-swap page-${phase}`} key={renderedKey}>
      {children}
    </div>
  );
}

// <ProductSkel> — single skeleton card matching the card grammar.
function ProductSkel({ wide = false }) {
  return (
    <div className={`skel-card ${wide ? 'skel-card-wide' : ''}`}>
      <div className="skel skel-img"></div>
      <div className="skel-body">
        <div className="skel skel-line skel-line-tiny"></div>
        <div className="skel skel-line"></div>
        <div className="skel skel-line skel-line-short"></div>
      </div>
    </div>
  );
}

// <SkelGrid> — grid of N skeleton cards (used on the catalog while "filtering")
function SkelGrid({ n = 6 }) {
  return (
    <div className="va-prods-grid">
      {Array.from({ length: n }).map((_, i) => <ProductSkel key={i} />)}
    </div>
  );
}

// <Ticker> — endlessly-scrolling brand strip (CSS animation)
function Ticker({ items }) {
  const list = [...items, ...items, ...items];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {list.map((it, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-dot">✦</span>{it}
          </span>
        ))}
      </div>
    </div>
  );
}

// <CountUp> — counts from 0 → target over duration (ms) when visible.
function CountUp({ to, duration = 1200, format = (n) => n }) {
  const [val, setVal] = React.useState(0);
  const ref = React.useRef(null);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const t0 = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(to * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{format(val)}</span>;
}

window.Reveal       = Reveal;
window.PageSwap     = PageSwap;
window.ProductSkel  = ProductSkel;
window.SkelGrid     = SkelGrid;
window.Ticker       = Ticker;
window.CountUp      = CountUp;
