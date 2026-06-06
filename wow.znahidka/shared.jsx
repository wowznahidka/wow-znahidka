// Shared mock data + helpers for all home page variations.
// Each variation pulls from the same product list so we can compare
// design moves on identical content.

const MOCK_PRODUCTS = [
  { id: 'p1', brand: 'Nike',        name: 'Air Max 97 Silver Bullet',   price: 4290, oldPrice: 5490, sizes: [40, 41, 42, 43, 44, 45], isNew: false, hot: true,  tint: '#e9dfd0' },
  { id: 'p2', brand: 'Adidas',      name: 'Samba OG Black',             price: 3190, oldPrice: null, sizes: [39, 40, 41, 42, 43],     isNew: true,  hot: false, tint: '#dcd6cc' },
  { id: 'p3', brand: 'New Balance', name: '530 Steel Grey',             price: 3690, oldPrice: 4290, sizes: [40, 41, 42, 43, 44, 45], isNew: false, hot: true,  tint: '#e3e6ea' },
  { id: 'p4', brand: 'Jordan',      name: 'Air Jordan 4 Bred',          price: 6490, oldPrice: null, sizes: [41, 42, 43],             isNew: true,  hot: true,  tint: '#efe3e3' },
  { id: 'p5', brand: 'Asics',       name: 'Gel-NYC Cream',              price: 4190, oldPrice: 4890, sizes: [40, 42, 44],             isNew: false, hot: false, tint: '#f0e9dc' },
  { id: 'p6', brand: 'Salomon',     name: 'XT-6 Wide Charcoal',         price: 5290, oldPrice: null, sizes: [41, 42, 43, 44],         isNew: true,  hot: false, tint: '#dedede' },
];

const MOCK_BRANDS = [
  { name: 'Nike',        count: 142, c1: '#ff2a2a', c2: '#7a0010' },
  { name: 'Adidas',      count:  88, c1: '#1a1a1a', c2: '#3a3a3a' },
  { name: 'New Balance', count:  64, c1: '#c8c0b4', c2: '#7d7466' },
  { name: 'Jordan',      count:  47, c1: '#3a0a18', c2: '#8e1d36' },
  { name: 'Asics',       count:  39, c1: '#0b3a8a', c2: '#1a73d6' },
  { name: 'Salomon',     count:  22, c1: '#1d3a4a', c2: '#3d7b9a' },
];

const MOCK_REVIEWS = [
  { name: 'Аня',    loc: 'Київ',    stars: 5, emoji: '🥰', text: 'Замовляла Nike Air Max — прийшли ідеальні, розмір в розмір. Дівчата з примірочної на НП в захваті!' },
  { name: 'Сергій', loc: 'Львів',   stars: 5, emoji: '👌', text: 'Третя пара від цих хлопців. Все чесно, без передоплати, оригінал. Recommend.' },
  { name: 'Маша',   loc: 'Одеса',   stars: 5, emoji: '🔥', text: 'Samba OG прийшли за 2 дні. Якість супер, ціна нижча ніж в магазинах.' },
  { name: 'Олег',   loc: 'Харків',  stars: 5, emoji: '💯', text: 'Брав Jordan 4 — все ок. Дізнався по реферці друга, замовляю ще.' },
];

// Lightweight, on-brand placeholder for sneaker photography.
// Soft shadowed ellipse + a tasteful "PRODUCT SHOT" caption to make
// it clear in the mockup that real imagery slots in here.
function ShoePh({ tint = '#eee', label = '', size = 'md' }) {
  const px = size === 'lg' ? 110 : size === 'sm' ? 56 : 80;
  return (
    <div className="shoe-ph" style={{ background: tint }}>
      <svg viewBox="0 0 200 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <pattern id={`p-${tint.slice(1)}-${size}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,0,0,0.05)" strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="200" height="140" fill={`url(#p-${tint.slice(1)}-${size})`} />
        <ellipse cx="100" cy="118" rx="62" ry="6" fill="rgba(0,0,0,0.10)" />
        <text x="100" y="78" textAnchor="middle"
              fontFamily="ui-monospace, 'SF Mono', monospace"
              fontSize="8" fill="rgba(0,0,0,0.45)" letterSpacing="1.5">
          {label || 'PRODUCT  SHOT'}
        </text>
      </svg>
    </div>
  );
}

// Soft striped placeholder for brand carousel hero
function BrandPh({ tint = '#222', label = '' }) {
  return (
    <svg viewBox="0 0 200 100" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`bg-${label}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tint} stopOpacity="0.92"/>
          <stop offset="100%" stopColor={tint} stopOpacity="0.55"/>
        </linearGradient>
      </defs>
      <rect width="200" height="100" fill={`url(#bg-${label})`} />
      <g opacity="0.18" stroke="#fff" strokeWidth="0.5">
        <line x1="0" y1="20" x2="200" y2="20" />
        <line x1="0" y1="40" x2="200" y2="40" />
        <line x1="0" y1="60" x2="200" y2="60" />
        <line x1="0" y1="80" x2="200" y2="80" />
      </g>
    </svg>
  );
}

function fmt(n) { return Math.round(n).toLocaleString('uk-UA') + '₴'; }
function pct(p) { return p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0; }

window.MOCK_PRODUCTS = MOCK_PRODUCTS;
window.MOCK_BRANDS   = MOCK_BRANDS;
window.MOCK_REVIEWS  = MOCK_REVIEWS;
window.ShoePh        = ShoePh;
window.BrandPh       = BrandPh;
window.fmt           = fmt;
window.pct           = pct;
