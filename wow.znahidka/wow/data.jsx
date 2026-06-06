// ─────────────────────────────────────────────────────────────
// MOCK DATA — products, brands, reviews, FAQ
// All Ukrainian copy; prices in UAH.
// ─────────────────────────────────────────────────────────────

const PRODUCTS = [
  { id:'n1', brand:'Nike',        name:'Air Max 97 Silver Bullet',     price:4290, oldPrice:5490, sizes:[40,41,42,43,44,45],    gender:'m', cat:'lifestyle', tint:'#e9dfd0', isNew:false, hot:true },
  { id:'n2', brand:'Nike',        name:'Dunk Low Panda',               price:3990, oldPrice:null, sizes:[37,38,39,40,41,42,43], gender:'u', cat:'lifestyle', tint:'#efeae3', isNew:true,  hot:true },
  { id:'n3', brand:'Nike',        name:'Air Force 1 ’07 Triple White', price:3490, oldPrice:null, sizes:[39,40,41,42,43,44,45], gender:'u', cat:'lifestyle', tint:'#f3f1ec', isNew:false, hot:true },
  { id:'n4', brand:'Nike',        name:'Pegasus 41 Running',           price:4590, oldPrice:null, sizes:[40,41,42,43,44],       gender:'m', cat:'running',   tint:'#e3e7ea', isNew:true,  hot:false },
  { id:'a1', brand:'Adidas',      name:'Samba OG Black',               price:3190, oldPrice:null, sizes:[39,40,41,42,43],       gender:'u', cat:'lifestyle', tint:'#dcd6cc', isNew:true,  hot:true },
  { id:'a2', brand:'Adidas',      name:'Gazelle Bold Pink',            price:3290, oldPrice:3990, sizes:[36,37,38,39,40,41],    gender:'f', cat:'lifestyle', tint:'#f3dde2', isNew:false, hot:true },
  { id:'a3', brand:'Adidas',      name:'Campus 00s Brown',             price:3490, oldPrice:null, sizes:[40,41,42,43,44,45],    gender:'u', cat:'lifestyle', tint:'#e4d4b9', isNew:false, hot:false },
  { id:'a4', brand:'Adidas',      name:'SL 72 RS Cream',               price:3090, oldPrice:null, sizes:[38,39,40,41,42],       gender:'u', cat:'lifestyle', tint:'#f0ead8', isNew:true,  hot:false },
  { id:'b1', brand:'New Balance', name:'530 Steel Grey',               price:3690, oldPrice:4290, sizes:[40,41,42,43,44,45],    gender:'u', cat:'lifestyle', tint:'#e3e6ea', isNew:false, hot:true },
  { id:'b2', brand:'New Balance', name:'9060 Sea Salt',                price:6190, oldPrice:null, sizes:[41,42,43,44],          gender:'m', cat:'lifestyle', tint:'#e8e2da', isNew:true,  hot:true },
  { id:'b3', brand:'New Balance', name:'2002R Protection Pack',        price:5490, oldPrice:null, sizes:[40,41,42,43,44],       gender:'u', cat:'lifestyle', tint:'#d9d3c8', isNew:false, hot:true },
  { id:'b4', brand:'New Balance', name:'574 Core Navy',                price:2690, oldPrice:3190, sizes:[37,38,39,40,41,42],    gender:'u', cat:'lifestyle', tint:'#d6dde6', isNew:false, hot:false },
  { id:'j1', brand:'Jordan',      name:'Air Jordan 4 Bred Reimagined', price:6490, oldPrice:null, sizes:[41,42,43],             gender:'m', cat:'basketball',tint:'#efe3e3', isNew:true,  hot:true },
  { id:'j2', brand:'Jordan',      name:'Air Jordan 1 Low Wolf Grey',   price:4890, oldPrice:5490, sizes:[40,41,42,43,44],       gender:'u', cat:'basketball',tint:'#e6e6e8', isNew:false, hot:true },
  { id:'j3', brand:'Jordan',      name:'Air Jordan 3 White Cement',    price:6890, oldPrice:null, sizes:[42,43],                gender:'m', cat:'basketball',tint:'#eee9e3', isNew:true,  hot:false },
  { id:'s1', brand:'Asics',       name:'Gel-NYC Cream',                price:4190, oldPrice:4890, sizes:[40,42,44],             gender:'u', cat:'lifestyle', tint:'#f0e9dc', isNew:false, hot:false },
  { id:'s2', brand:'Asics',       name:'Gel-Kayano 14 Silver',         price:5290, oldPrice:null, sizes:[40,41,42,43,44],       gender:'u', cat:'running',   tint:'#e7e9ec', isNew:true,  hot:true },
  { id:'s3', brand:'Asics',       name:'Gel-Lyte III OG Birch',        price:3790, oldPrice:null, sizes:[39,40,41,42],          gender:'u', cat:'lifestyle', tint:'#ebe3d5', isNew:false, hot:false },
  { id:'x1', brand:'Salomon',     name:'XT-6 Wide Charcoal',           price:5290, oldPrice:null, sizes:[41,42,43,44],          gender:'u', cat:'training',  tint:'#dedede', isNew:true,  hot:false },
  { id:'x2', brand:'Salomon',     name:'XT-4 OG Black',                price:4990, oldPrice:5590, sizes:[40,41,42,43],          gender:'u', cat:'training',  tint:'#dcdce0', isNew:false, hot:true },
  { id:'p1', brand:'Puma',        name:'Speedcat OG Black',            price:2990, oldPrice:null, sizes:[36,37,38,39,40,41],    gender:'f', cat:'lifestyle', tint:'#e2dfdb', isNew:true,  hot:true },
  { id:'p2', brand:'Puma',        name:'Palermo Vintage',              price:2890, oldPrice:null, sizes:[38,39,40,41,42,43],    gender:'u', cat:'lifestyle', tint:'#e3e9df', isNew:true,  hot:false },
  { id:'c1', brand:'Converse',    name:'Chuck 70 Hi Black',            price:2490, oldPrice:null, sizes:[36,37,38,39,40,41,42], gender:'u', cat:'lifestyle', tint:'#e2e0dd', isNew:false, hot:false },
  { id:'v1', brand:'Vans',        name:'Old Skool Classic',            price:2290, oldPrice:2690, sizes:[37,38,39,40,41,42,43], gender:'u', cat:'lifestyle', tint:'#dddcd8', isNew:false, hot:false },
];

const BRANDS = [
  { name:'Nike',        c1:'#ff2a2a', c2:'#7a0010', count: PRODUCTS.filter(p=>p.brand==='Nike').length },
  { name:'Adidas',      c1:'#0e0e10', c2:'#3a3a3a', count: PRODUCTS.filter(p=>p.brand==='Adidas').length },
  { name:'New Balance', c1:'#7d7466', c2:'#c8c0b4', count: PRODUCTS.filter(p=>p.brand==='New Balance').length },
  { name:'Jordan',      c1:'#3a0a18', c2:'#8e1d36', count: PRODUCTS.filter(p=>p.brand==='Jordan').length },
  { name:'Asics',       c1:'#0b3a8a', c2:'#1a73d6', count: PRODUCTS.filter(p=>p.brand==='Asics').length },
  { name:'Salomon',     c1:'#1d3a4a', c2:'#3d7b9a', count: PRODUCTS.filter(p=>p.brand==='Salomon').length },
  { name:'Puma',        c1:'#0a0a0a', c2:'#4a4a4a', count: PRODUCTS.filter(p=>p.brand==='Puma').length },
  { name:'Converse',    c1:'#1a1a1a', c2:'#3a3a3a', count: PRODUCTS.filter(p=>p.brand==='Converse').length },
];

const REVIEWS = [
  { name:'Аня',    loc:'Київ',     stars:5, emoji:'🥰', text:'Замовляла Nike Air Max — прийшли ідеальні, розмір в розмір. Дівчата з примірочної на НП в захваті!' },
  { name:'Сергій', loc:'Львів',    stars:5, emoji:'👌', text:'Третя пара від цих хлопців. Все чесно, без передоплати, оригінал.' },
  { name:'Маша',   loc:'Одеса',    stars:5, emoji:'🔥', text:'Samba OG прийшли за 2 дні. Якість супер, ціна нижча ніж в магазинах.' },
  { name:'Олег',   loc:'Харків',   stars:5, emoji:'💯', text:'Брав Jordan 4 — все ок. Дізнався по реферці друга, замовляю ще.' },
  { name:'Юля',    loc:'Дніпро',   stars:5, emoji:'✨', text:'Дуже швидка доставка. Менеджер на зв\u02bcязку постійно, відповіли на всі питання.' },
  { name:'Ігор',   loc:'Запоріжжя',stars:5, emoji:'🤝', text:'Оплата на пошті — це найкраще! Без ризику. Спробував — рекомендую.' },
];

const FAQ = [
  { q:'Як працює оплата після примірки?',         a:'Ви оплачуєте замовлення тільки після того, як отримали його на відділенні Нової Пошти, перевірили розмір та якість. Якщо щось не підійшло — просто відмовляєтесь, без будь-яких витрат з вашого боку.' },
  { q:'Скільки коштує доставка?',                  a:'Доставка Новою Поштою по Україні — за тарифами перевізника (зазвичай 50–80₴). При замовленні на суму від 5000₴ доставка безкоштовна.' },
  { q:'Чи всі ваші кросівки оригінальні?',         a:'Так, ми працюємо тільки з оригінальною продукцією. На кожну пару можемо надати документи та фото з усіх ракурсів перед відправкою.' },
  { q:'Як обрати правильний розмір?',              a:'Кожна модель має детальну розмірну сітку. Якщо не впевнені — напишіть нам в Telegram або Instagram, ми допоможемо підібрати ваш розмір індивідуально.' },
  { q:'Чи можу я повернути товар?',                a:'Так, якщо щось не підійшло — ви просто не викуповуєте посилку на пошті. Жодних витрат для вас не буде.' },
  { q:'Скільки днів триває доставка?',             a:'Зазвичай 1–3 робочих дні по Україні. Час відправки — наступного дня після оформлення замовлення.' },
];

const CATS = [
  { id:'all',        label:'Усі',        emoji:'✨' },
  { id:'lifestyle',  label:'Lifestyle',  emoji:'👟' },
  { id:'running',    label:'Біг',        emoji:'🏃' },
  { id:'basketball', label:'Баскетбол',  emoji:'🏀' },
  { id:'training',   label:'Трейл',      emoji:'⛰️' },
];

const SORTS = [
  { id:'popular',  label:'Популярне' },
  { id:'new',      label:'Новинки' },
  { id:'lowhigh',  label:'Ціна ↑' },
  { id:'highlow',  label:'Ціна ↓' },
];

// ── HELPERS ─────────────────────────────────────────────────
function fmt(n) {
  return Math.round(n).toLocaleString('uk-UA') + '₴';
}
function pct(p) {
  return p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
}
function filterByGender(p, gender) {
  if (gender === 'all') return true;
  if (p.gender === 'u') return true;
  return p.gender === gender;
}
function sortProducts(list, sortId) {
  const copy = [...list];
  if (sortId === 'new')     return copy.sort((a,b) => (b.isNew?1:0) - (a.isNew?1:0));
  if (sortId === 'lowhigh') return copy.sort((a,b) => a.price - b.price);
  if (sortId === 'highlow') return copy.sort((a,b) => b.price - a.price);
  // popular
  return copy.sort((a,b) => (b.hot?1:0) - (a.hot?1:0));
}

window.PRODUCTS = PRODUCTS;
window.BRANDS   = BRANDS;
window.REVIEWS  = REVIEWS;
window.FAQ      = FAQ;
window.CATS     = CATS;
window.SORTS    = SORTS;
window.fmt      = fmt;
window.pct      = pct;
window.filterByGender = filterByGender;
window.sortProducts   = sortProducts;
