// ─────────────────────────────────────────────────────────────
// HEADER + BOTTOM NAV
// Mobile: sticky header up top, bottom nav with active indicator.
// Desktop: header gains primary nav links inline.
// ─────────────────────────────────────────────────────────────

function Header() {
  const { tab, navigate, favorites, cartCount, openSheet } = useWow();

  const navLinks = [
    { id: 'home',     label: 'Головна' },
    { id: 'match',    label: 'Match' },
    { id: 'catalog',  label: 'Каталог' },
    { id: 'contacts', label: 'Контакти' },
  ];

  return (
    <header className="hdr">
      <button className="hdr-logo" onClick={() => navigate('home')} aria-label="на головну">
        WOW<span className="hdr-logo-dot">.</span>ZNAHIDKA
        <small>ПРЕМІУМ КРОСІВКИ</small>
      </button>

      {/* Inline nav — visible on desktop only via CSS */}
      <nav className="hdr-nav" aria-label="primary">
        {navLinks.map(link => (
          <button
            key={link.id}
            className={`hdr-nav-link ${tab === link.id ? 'hdr-nav-link-active' : ''}`}
            onClick={() => navigate(link.id)}
          >
            {link.label}
          </button>
        ))}
      </nav>

      <div className="hdr-actions">
        <button className="hdr-btn" aria-label="мова">UA</button>
        <button
          className="hdr-btn hdr-btn-icon"
          onClick={() => openSheet('fav')}
          aria-label="улюблені"
        >
          <I.Heart s={17} filled={favorites.size > 0}/>
          {favorites.size > 0 && <span className="hdr-badge">{favorites.size}</span>}
        </button>
        <button
          className="hdr-btn hdr-btn-icon hdr-btn-cart"
          onClick={() => openSheet('cart')}
          aria-label="кошик"
        >
          <I.Cart s={17}/>
          {cartCount > 0 && <span className="hdr-badge hdr-badge-red">{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}

function BottomNav() {
  const { tab, navigate, cartCount } = useWow();

  const items = [
    { id: 'home',     label: 'Головна',  Icon: I.Home },
    { id: 'match',    label: 'Match',    Icon: I.Match },
    { id: 'catalog',  label: 'Каталог',  Icon: I.Catalog },
    { id: 'contacts', label: 'Контакти', Icon: I.Chat },
  ];

  return (
    <nav className="bnav" aria-label="primary mobile">
      {items.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`bnav-item ${tab === id ? 'bnav-active' : ''}`}
          onClick={() => navigate(id)}
        >
          <span className="bnav-ico"><Icon s={22}/></span>
          <span className="bnav-label">{label}</span>
        </button>
      ))}
    </nav>
  );
}

window.Header    = Header;
window.BottomNav = BottomNav;
