// ─────────────────────────────────────────────────────────────
// TOP-LEVEL APP
// Header + page router (PageSwap) + bottom nav + sheets + toasts.
// ─────────────────────────────────────────────────────────────

function PageRouter() {
  const { tab } = useWow();
  return (
    <PageSwap tabKey={tab}>
      {tab === 'home'     && <HomePage/>}
      {tab === 'match'    && <MatchPage/>}
      {tab === 'catalog'  && <CatalogPage/>}
      {tab === 'contacts' && <ContactsPage/>}
    </PageSwap>
  );
}

function StickyCart() {
  const { cartCount, cartTotal, openSheet, tab } = useWow();
  if (cartCount === 0 || tab === 'match') return null;
  return (
    <button className="sticky-cart" onClick={() => openSheet('cart')} aria-label="кошик">
      <div className="sticky-cart-left">
        <I.Cart s={18}/>
        <span className="sticky-cart-count">{cartCount}</span>
        <span className="sticky-cart-label">{cartCount === 1 ? 'пара' : 'пар'} у кошику</span>
      </div>
      <div className="sticky-cart-right">
        До кошика&nbsp;<strong>{fmt(cartTotal)}</strong>&nbsp;<I.Arr s={14}/>
      </div>
    </button>
  );
}

function App() {
  return (
    <WowProvider>
      <div className="wow-bg-aurora" aria-hidden="true"></div>
      <div className="app-root">
        <Header/>
        <main className="app-main">
          <PageRouter/>
        </main>
        <BottomNav/>
        <StickyCart/>
        <SheetHost/>
        <Toasts/>
      </div>
    </WowProvider>
  );
}

window.App = App;
