// ─────────────────────────────────────────────────────────────
// GLOBAL STORE — context + useStore hook
// Handles: current tab, gender, favorites, cart, open sheet, toasts.
// Cart / favorites persist to localStorage.
// ─────────────────────────────────────────────────────────────

const WowContext = React.createContext(null);

const LS_KEY = 'wow.app.v1';
function loadPersist() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw);
    return { favorites: new Set(j.favorites || []), cart: j.cart || [] };
  } catch { return null; }
}
function savePersist(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      favorites: [...state.favorites],
      cart: state.cart,
    }));
  } catch {}
}

function WowProvider({ children }) {
  const persisted = loadPersist();
  const [tab,        setTab]        = React.useState('home');
  const [gender,     setGender]     = React.useState('all');
  const [favorites,  setFavorites]  = React.useState(persisted?.favorites || new Set());
  const [cart,       setCart]       = React.useState(persisted?.cart || []);
  const [sheet,      setSheet]      = React.useState(null);  // { kind: 'cart'|'fav'|'product'|'size', payload? }
  const [toasts,     setToasts]     = React.useState([]);

  React.useEffect(() => {
    savePersist({ favorites, cart });
  }, [favorites, cart]);

  // ── Actions ─────────────────────────────────────────────
  const toggleFav = React.useCallback((id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      const wasIn = next.has(id);
      if (wasIn) next.delete(id); else next.add(id);
      const product = PRODUCTS.find(p => p.id === id);
      if (product) pushToast(wasIn ? `Прибрано з улюблених` : `❤️ ${product.brand} ${product.name} — в улюблених`);
      return next;
    });
  }, []);

  const addToCart = React.useCallback((id, size, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === id && c.size === size);
      if (existing) {
        return prev.map(c => c === existing ? { ...c, qty: c.qty + qty } : c);
      }
      return [...prev, { id, size, qty }];
    });
    const product = PRODUCTS.find(p => p.id === id);
    if (product) pushToast(`✅ ${product.brand} ${product.name} (${size}) — в кошику`);
  }, []);

  const removeFromCart = React.useCallback((id, size) => {
    setCart(prev => prev.filter(c => !(c.id === id && c.size === size)));
  }, []);

  const changeQty = React.useCallback((id, size, delta) => {
    setCart(prev => prev
      .map(c => (c.id === id && c.size === size) ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
    );
  }, []);

  const openSheet = React.useCallback((kind, payload = null) => {
    setSheet({ kind, payload });
  }, []);
  const closeSheet = React.useCallback(() => setSheet(null), []);

  // Toast queue (max 3, auto-dismiss after 2.6s)
  const pushToast = React.useCallback((msg) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-2), { id, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2600);
  }, []);

  const navigate = React.useCallback((nextTab) => {
    setTab(nextTab);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  // Derived
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cart.reduce((s, c) => {
    const p = PRODUCTS.find(pp => pp.id === c.id);
    return s + (p ? p.price * c.qty : 0);
  }, 0);

  const value = {
    tab, navigate,
    gender, setGender,
    favorites, toggleFav,
    cart, addToCart, removeFromCart, changeQty,
    cartCount, cartTotal,
    sheet, openSheet, closeSheet,
    toasts, pushToast,
  };

  return <WowContext.Provider value={value}>{children}</WowContext.Provider>;
}

function useWow() {
  const ctx = React.useContext(WowContext);
  if (!ctx) throw new Error('useWow must be used within WowProvider');
  return ctx;
}

window.WowProvider = WowProvider;
window.useWow      = useWow;
