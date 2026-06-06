// ─────────────────────────────────────────────────────────────
// SHEETS — cart, favorites, product detail, size picker, checkout
// All driven by store.sheet { kind, payload }
// ─────────────────────────────────────────────────────────────

function SheetHost() {
  const { sheet, closeSheet, openSheet } = useWow();
  const open = sheet !== null;
  const kind = sheet?.kind;

  // Map kind → label + content
  let content = null, label = '', fullHeight = false;
  if (kind === 'cart')     { label = 'Кошик';            content = <CartSheet onClose={closeSheet}/>; }
  if (kind === 'fav')      { label = 'Улюблені';         content = <FavSheet onClose={closeSheet}/>; }
  if (kind === 'product')  { label = 'Деталі товару';    content = <ProductSheet productId={sheet?.payload} onClose={closeSheet}/>; fullHeight = true; }
  if (kind === 'size')     { label = 'Оберіть розмір';   content = <SizePickerSheet productId={sheet?.payload} onClose={closeSheet}/>; }
  if (kind === 'checkout') { label = 'Оформлення';       content = <CheckoutSheet onClose={closeSheet}/>; fullHeight = true; }

  return (
    <Sheet open={open} onClose={closeSheet} ariaLabel={label} fullHeight={fullHeight}>
      {content}
    </Sheet>
  );
}

// ── CART ────────────────────────────────────────────────────
function CartSheet({ onClose }) {
  const { cart, removeFromCart, changeQty, cartTotal, cartCount, openSheet, navigate } = useWow();

  if (cart.length === 0) {
    return (
      <div className="sheet-body">
        <h2 className="sheet-title">🛒 Кошик</h2>
        <Empty
          icon="🛒"
          title="Кошик порожній"
          sub="Додай пари з Улюблених або з Match"
          action={
            <div className="empty-action-row">
              <button className="empty-action" onClick={() => { onClose(); navigate('match'); }}>
                🔥 Match
              </button>
              <button className="empty-action empty-action-ghost" onClick={() => { onClose(); navigate('catalog'); }}>
                Каталог <I.Arr s={12}/>
              </button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="sheet-body">
      <h2 className="sheet-title">🛒 Кошик · {cartCount} {cartCount === 1 ? 'пара' : 'пар'}</h2>
      <div className="cart-list">
        {cart.map(c => {
          const p = PRODUCTS.find(pp => pp.id === c.id);
          if (!p) return null;
          return (
            <div key={`${c.id}-${c.size}`} className="cart-item">
              <div className="cart-item-img" style={{ background: p.tint }}>
                <ShoePh tint={p.tint} label=""/>
              </div>
              <div className="cart-item-body">
                <div className="cart-item-brand">{p.brand}</div>
                <div className="cart-item-name">{p.name}</div>
                <div className="cart-item-size">Розмір: <strong>{c.size}</strong></div>
                <div className="cart-item-price">{fmt(p.price * c.qty)}</div>
              </div>
              <div className="cart-item-ctrl">
                <div className="qty-row">
                  <button className="qty-btn" onClick={() => changeQty(c.id, c.size, -1)} aria-label="−"><I.Minus s={14}/></button>
                  <span className="qty-num">{c.qty}</span>
                  <button className="qty-btn" onClick={() => changeQty(c.id, c.size, +1)} aria-label="+"><I.Plus s={14}/></button>
                </div>
                <button className="cart-item-rm" onClick={() => removeFromCart(c.id, c.size)} aria-label="прибрати">
                  <I.Trash s={15}/>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="cart-summary">
        <div className="cart-sum-row"><span>Товари</span><span>{cartCount}&nbsp;{cartCount === 1 ? 'пара' : 'пар'}</span></div>
        <div className="cart-sum-row"><span>Доставка</span><span>За тарифами НП</span></div>
        <div className="cart-sum-total"><span>До сплати</span><span>{fmt(cartTotal)}</span></div>
      </div>
      <button className="cart-checkout" onClick={() => openSheet('checkout')}>
        Оформити замовлення&nbsp;<I.Arr s={14}/>
      </button>
    </div>
  );
}

// ── FAVORITES ───────────────────────────────────────────────
function FavSheet({ onClose }) {
  const { favorites, toggleFav, openSheet, navigate } = useWow();
  const items = PRODUCTS.filter(p => favorites.has(p.id));

  if (items.length === 0) {
    return (
      <div className="sheet-body">
        <h2 className="sheet-title">❤ Улюблені</h2>
        <Empty
          icon="🤍"
          title="Тут поки що нічого"
          sub="Свайпай у Match або тапни ❤ на картці товару"
          action={
            <button className="empty-action" onClick={() => { onClose(); navigate('match'); }}>
              🔥 Перейти у Match
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="sheet-body">
      <h2 className="sheet-title">❤ Улюблені · {items.length}</h2>
      <div className="fav-list">
        {items.map(p => (
          <div key={p.id} className="fav-item">
            <div className="fav-img" style={{ background: p.tint }} onClick={() => openSheet('product', p.id)}>
              <ShoePh tint={p.tint} label=""/>
            </div>
            <div className="fav-body" onClick={() => openSheet('product', p.id)}>
              <div className="fav-brand">{p.brand}</div>
              <div className="fav-name">{p.name}</div>
              <div className="fav-price">{fmt(p.price)}</div>
            </div>
            <div className="fav-acts">
              <button className="fav-add" onClick={() => openSheet('size', p.id)}>
                В кошик
              </button>
              <button className="fav-rm" onClick={() => toggleFav(p.id)} aria-label="прибрати">
                <I.Close s={14}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PRODUCT DETAIL ──────────────────────────────────────────
function ProductSheet({ productId, onClose }) {
  const { favorites, toggleFav, openSheet } = useWow();
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return null;
  const isFav = favorites.has(p.id);
  return (
    <div className="sheet-body sheet-body-product">
      <div className="pd-hero" style={{ background: p.tint }}>
        <ShoePh tint={p.tint} label="PRODUCT  SHOT"/>
        <button className={`pd-fav ${isFav ? 'pd-fav-on' : ''}`} onClick={() => toggleFav(p.id)} aria-label="favorite">
          <I.Heart s={20} filled={isFav}/>
        </button>
        {p.isNew && <span className="pd-tag pd-tag-new">NEW</span>}
        {!p.isNew && p.hot && <span className="pd-tag pd-tag-hot">HOT</span>}
      </div>
      <div className="pd-info">
        <div className="pd-brand">{p.brand}</div>
        <h2 className="pd-name">{p.name}</h2>
        <div className="pd-price-row">
          <span className="pd-price">{fmt(p.price)}</span>
          {p.oldPrice && <span className="pd-old">{fmt(p.oldPrice)}</span>}
          {p.oldPrice && <span className="card-disc">−{pct(p)}%</span>}
        </div>

        <div className="pd-sizes-pre">
          {p.sizes.map(s => <span key={s} className="pd-size-chip">{s}</span>)}
        </div>

        <div className="pd-trust">
          <span><I.Check s={12}/>&nbsp;0₴ передоплати</span>
          <span><I.Check s={12}/>&nbsp;100% оригінал</span>
          <span><I.Check s={12}/>&nbsp;Безкоштовне повернення</span>
        </div>

        <div className="pd-cta">
          <button className="pd-cta-primary" onClick={() => openSheet('size', p.id)}>
            Обрати розмір&nbsp;<I.Arr s={14}/>
          </button>
          <a className="pd-cta-tg" href="https://t.me/znahidkawow" target="_blank" rel="noopener noreferrer">
            <I.Tg s={18}/>&nbsp;Запитати в Telegram
          </a>
        </div>
      </div>
    </div>
  );
}

// ── SIZE PICKER ─────────────────────────────────────────────
function SizePickerSheet({ productId, onClose }) {
  const { addToCart } = useWow();
  const p = PRODUCTS.find(x => x.id === productId);
  const [sel, setSel] = React.useState(null);
  if (!p) return null;
  const confirm = () => {
    if (sel == null) return;
    addToCart(p.id, sel);
    onClose();
  };
  return (
    <div className="sheet-body">
      <h2 className="sheet-title">Оберіть розмір</h2>
      <div className="sp-product">
        <div className="sp-product-img" style={{ background: p.tint }}>
          <ShoePh tint={p.tint} label=""/>
        </div>
        <div>
          <div className="sp-product-brand">{p.brand}</div>
          <div className="sp-product-name">{p.name}</div>
          <div className="sp-product-price">{fmt(p.price)}</div>
        </div>
      </div>
      <div className="sp-sublabel">Доступні розміри</div>
      <div className="sp-grid">
        {p.sizes.map(sz => (
          <button
            key={sz}
            className={`sp-sz-btn ${sel === sz ? 'sp-sz-btn-on' : ''}`}
            onClick={() => setSel(sz)}
            aria-pressed={sel === sz}
          >{sz}</button>
        ))}
      </div>
      <button
        className="sp-confirm"
        onClick={confirm}
        disabled={sel == null}
      >
        Додати в кошик&nbsp;<I.Arr s={14}/>
      </button>
    </div>
  );
}

// ── CHECKOUT ────────────────────────────────────────────────
function CheckoutSheet({ onClose }) {
  const { cart, cartTotal, cartCount, pushToast } = useWow();
  const [name,  setName]  = React.useState('');
  const [phone, setPhone] = React.useState('+380 ');
  const [city,  setCity]  = React.useState('');
  const [depot, setDepot] = React.useState('');
  const [deliv, setDeliv] = React.useState('dept'); // dept | post
  const [done,  setDone]  = React.useState(false);

  const valid = name.trim().length > 1 && phone.replace(/\D/g, '').length >= 12 && city.trim().length > 1 && depot.trim().length > 0;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    setDone(true);
    pushToast('🎉 Замовлення прийнято! Чекайте дзвінка.');
    setTimeout(onClose, 1800);
  };

  return (
    <div className="sheet-body">
      <h2 className="sheet-title">📦 Оформлення</h2>

      <div className="cod-banner">
        <div className="cod-ico">🤝</div>
        <div>
          <div className="cod-title">Оплата після примірки</div>
          <div className="cod-sub">Без передоплати · Нова Пошта</div>
        </div>
      </div>

      <div className="co-items">
        {cart.map(c => {
          const p = PRODUCTS.find(pp => pp.id === c.id);
          if (!p) return null;
          return (
            <div key={`${c.id}-${c.size}`} className="co-item">
              <div className="co-item-img" style={{ background: p.tint }}>
                <ShoePh tint={p.tint} label=""/>
              </div>
              <div className="co-item-body">
                <div className="co-item-name">{p.brand} · {p.name}</div>
                <div className="co-item-meta">Розмір {c.size} · {c.qty} шт. · {fmt(p.price * c.qty)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <form className="cf-form" onSubmit={onSubmit}>
        <div className="cf-field">
          <label className="cf-label">Ваше ім'я</label>
          <input className="cf-inp" type="text" placeholder="Ім'я та прізвище" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name"/>
        </div>
        <div className="cf-field">
          <label className="cf-label">Телефон</label>
          <input className="cf-inp" type="tel" placeholder="+380 (XX) XXX-XX-XX" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel"/>
        </div>
        <div className="cf-field">
          <label className="cf-label">Місто</label>
          <input className="cf-inp" type="text" placeholder="Наприклад: Київ" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2"/>
        </div>

        <div className="cf-tabs" role="group" aria-label="Тип доставки">
          <button type="button" className={`cf-tab ${deliv === 'dept' ? 'cf-tab-on' : ''}`} onClick={() => setDeliv('dept')} aria-pressed={deliv === 'dept'}>
            🏢 Відділення
          </button>
          <button type="button" className={`cf-tab ${deliv === 'post' ? 'cf-tab-on' : ''}`} onClick={() => setDeliv('post')} aria-pressed={deliv === 'post'}>
            📮 Поштомат
          </button>
        </div>

        <div className="cf-field">
          <label className="cf-label">{deliv === 'dept' ? 'Номер відділення' : 'Номер поштомату'}</label>
          <input className="cf-inp" type="text" placeholder="Наприклад: 12" value={depot} onChange={(e) => setDepot(e.target.value)} inputMode="numeric"/>
        </div>

        <div className="co-summary">
          <div className="cart-sum-row"><span>Товари ({cartCount})</span><span>{fmt(cartTotal)}</span></div>
          <div className="cart-sum-row"><span>Доставка</span><span>За тарифами НП</span></div>
          <div className="cart-sum-total"><span>До сплати</span><span>{fmt(cartTotal)}</span></div>
        </div>

        <button type="submit" className={`co-submit ${done ? 'co-submit-done' : ''}`} disabled={!valid || done}>
          {done ? <><I.Check s={18}/>&nbsp;Прийнято</> : <>✅&nbsp;Підтвердити замовлення</>}
        </button>
      </form>
    </div>
  );
}

window.SheetHost = SheetHost;
