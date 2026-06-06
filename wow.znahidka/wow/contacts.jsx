// ─────────────────────────────────────────────────────────────
// CONTACTS PAGE — banner, socials, delivery info, contact form, FAQ
// ─────────────────────────────────────────────────────────────

function ContactsPage() {
  return (
    <div className="contacts-page">
      <Reveal>
        <section className="contacts-banner">
          <div className="contacts-banner-ico" aria-hidden="true">👟</div>
          <h1 className="contacts-banner-title">WOW.ZNAHIDKA</h1>
          <p className="contacts-banner-sub">
            Преміум кросівки без передоплати.<br/>
            Оплата після примірки на Новій Пошті.
          </p>
        </section>
      </Reveal>

      {/* SOCIALS */}
      <Reveal>
        <nav className="socials" aria-label="Соціальні мережі">
          <a className="social social-tg" href="https://t.me/znahidkawow" target="_blank" rel="noopener noreferrer">
            <span className="social-ico"><I.Tg s={24}/></span>
            <span>Telegram</span>
          </a>
          <a className="social social-ig" href="https://instagram.com/wow.znahidka" target="_blank" rel="noopener noreferrer">
            <span className="social-ico"><I.Ig s={24}/></span>
            <span>Instagram</span>
          </a>
          <a className="social social-tt" href="https://www.tiktok.com/@wowznahidka" target="_blank" rel="noopener noreferrer">
            <span className="social-ico"><I.Tt s={24}/></span>
            <span>TikTok</span>
          </a>
        </nav>
      </Reveal>

      {/* DELIVERY INFO */}
      <Reveal>
        <div className="contacts-list">
          <ContactItem
            ico={<I.Package s={20}/>}
            title="Доставка по Україні"
            sub="Нова Пошта · 1–3 дні · ~50–80₴ · Оплата після примірки"
          />
          <ContactItem
            ico={<I.Globe s={20}/>}
            title="Міжнародна доставка"
            sub="Польща, Чехія, Словаччина та інші країни ЄС"
          />
          <ContactItem
            ico={<I.Undo s={20}/>}
            title="Повернення безкоштовно"
            sub="Не підійшло — просто відмовся на відділенні, без витрат"
          />
        </div>
      </Reveal>

      {/* CONTACT FORM */}
      <Reveal>
        <ContactForm/>
      </Reveal>

      {/* FAQ */}
      <Reveal>
        <section className="faq-section">
          <h2 className="sec-title sec-title-faq">Часті питання</h2>
          <div className="faq-list">
            {FAQ.map((item, i) => <FaqItem key={i} item={item} />)}
          </div>
        </section>
      </Reveal>

      <div className="page-bottom-pad"/>
    </div>
  );
}

function ContactItem({ ico, title, sub }) {
  return (
    <div className="contact-item">
      <div className="contact-item-ico">{ico}</div>
      <div className="contact-item-body">
        <div className="contact-item-title">{title}</div>
        <div className="contact-item-sub">{sub}</div>
      </div>
    </div>
  );
}

function FaqItem({ item }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={`faq-item ${open ? 'faq-item-open' : ''}`}>
      <button className="faq-q" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span>{item.q}</span>
        <span className="faq-toggle" aria-hidden="true">
          <I.Plus2 s={14}/>
        </span>
      </button>
      <div className="faq-a">
        <div className="faq-a-inner">{item.a}</div>
      </div>
    </div>
  );
}

function ContactForm() {
  const { pushToast } = useWow();
  const [name,    setName]    = React.useState('');
  const [contact, setContact] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [sent,    setSent]    = React.useState(false);

  const valid = name.trim().length > 1 && contact.trim().length > 4 && message.trim().length > 4;

  const onSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    setSent(true);
    pushToast('✅ Дякуємо! Ми зв\u02bcяжемось протягом доби.');
    setTimeout(() => {
      setName(''); setContact(''); setMessage(''); setSent(false);
    }, 2400);
  };

  return (
    <section className="contact-form-section">
      <h2 className="sec-title sec-title-form">Напишіть нам</h2>
      <p className="contact-form-sub">Заповніть форму — відповімо в Telegram або на телефон протягом доби.</p>
      <form className="contact-form" onSubmit={onSubmit}>
        <div className="cf-field">
          <label className="cf-label" htmlFor="cf-name">Ім'я</label>
          <input
            id="cf-name"
            className="cf-inp"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Як вас звати"
            autoComplete="name"
          />
        </div>
        <div className="cf-field">
          <label className="cf-label" htmlFor="cf-contact">Телефон або Telegram</label>
          <input
            id="cf-contact"
            className="cf-inp"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="+380… або @нік"
            autoComplete="tel"
          />
        </div>
        <div className="cf-field">
          <label className="cf-label" htmlFor="cf-msg">Повідомлення</label>
          <textarea
            id="cf-msg"
            className="cf-inp cf-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Що цікавить? Розмір? Бренд? Питання?"
            rows={4}
          />
        </div>
        <button
          type="submit"
          className={`cf-submit ${sent ? 'cf-submit-sent' : ''}`}
          disabled={!valid || sent}
        >
          {sent ? <><I.Check s={16}/>&nbsp;Надіслано</> : <>Надіслати&nbsp;<I.Arr s={14}/></>}
        </button>
      </form>
    </section>
  );
}

window.ContactsPage = ContactsPage;
