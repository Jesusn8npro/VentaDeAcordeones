/* global React, Icon, AccordionArt, MiniAcc, Tilt, Magnetic, Counter */
const { useState: useStateH, useEffect: useEffectH, useMemo: useMemoH, useRef: useRefH } = React;

const fmtCOP = (n) => `$${n.toLocaleString('es-CO')} COP`;

/* ============ Hero banner (slides) ============ */
const HERO_SLIDES = [
  {
    hashtag: 'NuestroOficio',
    title: ['Acordeones, Guitarras,',  'Bajos,', 'Baterías', 'y Sonido.'],
    titleItalic: null,
    sub: 'Todo lo que un músico necesita, pero los acordeones vallenatos son nuestra firma — afinados a mano en Valledupar.',
    cta1: 'Ver Acordeones',
    cta2: 'Ver Otros Instrumentos',
    variant: 'pearl',
    tag: 'TIENDA OFICIAL · DESDE 1998',
  },
  {
    hashtag: 'EdiciónVallenata',
    title: ['Tiempo Limitado:',  'Hasta', '30%','OFF'],
    titleItalic: 30,
    sub: 'Acordeones Hohner Rey Vallenato con nácar, en stock y listos para enviar a toda Colombia y al mundo.',
    cta1: 'Ver Acordeones',
    cta2: 'Personaliza el Tuyo',
    variant: 'pearl',
    tag: 'COLECCIÓN 2026',
  },
  {
    hashtag: 'PersonalizadosÚnicos',
    title: ['Un Acordeón', 'que solo', 'tú tendrás'],
    titleItalic: null,
    sub: 'Maderas, nácar, grabado láser y afinación a la medida. Diseñado contigo en 6 a 8 semanas.',
    cta1: 'Diseñar el Mío',
    cta2: 'Galería Custom',
    variant: 'onyx',
    tag: 'EDICIÓN PRIVADA',
  },
  {
    hashtag: 'ReyVallenato',
    title: ['El Acordeón','que', 'Habla por Ti'],
    titleItalic: null,
    sub: 'Afinado a tu voz por nuestros maestros lutieres en Valledupar. Tradición vallenata, sonido único.',
    cta1: 'Catálogo Maestro',
    cta2: 'Hablar con un Maestro',
    variant: 'rojo',
    tag: 'TALLER VALLEDUPAR',
  },
];

function Hero({ onWA, onCatalog, navigate }) {
  const [slide, setSlide] = useStateH(0);
  const total = HERO_SLIDES.length;
  const heroRef = useRefH(null);
  const [paused, setPaused] = useStateH(false);

  useEffectH(() => {
    if (paused) return;
    const t = setInterval(() => setSlide(s => (s + 1) % total), 7000);
    return () => clearInterval(t);
  }, [total, paused]);

  // cursor glow tracking
  useEffectH(() => {
    const el = heroRef.current;
    if (!el) return;
    const on = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--cx', `${e.clientX - r.left}px`);
      el.style.setProperty('--cy', `${e.clientY - r.top}px`);
    };
    el.addEventListener('mousemove', on);
    return () => el.removeEventListener('mousemove', on);
  }, []);

  const s = HERO_SLIDES[slide];
  const handleSecondary = () => {
    if (slide === 0) navigate('catalogo');
    else onWA();
  };

  return (
    <section className="hero-wrap" id="top">
      <div className="hero-banner" ref={heroRef}
           onMouseEnter={() => setPaused(true)}
           onMouseLeave={() => setPaused(false)}>
        <span className="hero-corner-tag">{s.tag}</span>
        <div className="hero-glow"></div>

        <div className="hero-content" key={slide}>
          <div className="hashtag fade-in-up">{s.hashtag}</div>
          <h1 className="display hero-title">
            <span className="row fade-in-up" style={{ '--d': '60ms' }}>{s.title[0]}</span>
            <span className="row fade-in-up" style={{ '--d': '160ms' }}>
              {s.title[1]}{' '}
              {s.titleItalic
                ? <><span className="italic">{s.titleItalic}%</span> <span className="accent">OFF!</span></>
                : <span className="accent">{s.title.slice(2).join(' ')}</span>}
            </span>
          </h1>
          <p className="hero-sub fade-in-up" style={{ '--d': '280ms' }}>{s.sub}</p>
          <div className="hero-ctas fade-in-up" style={{ '--d': '380ms' }}>
            <Magnetic as="button" className="btn btn-primary" onClick={onCatalog}>
              <span>{s.cta1}</span> <span className="arrow"><Icon name="arrow" size={14} /></span>
            </Magnetic>
            <Magnetic as="button" className="btn btn-ghost" onClick={handleSecondary}>
              {slide === 0 ? <Icon name="cat-guitar" size={14} /> : <Icon name="whatsapp" size={14} />}
              <span>{s.cta2}</span>
            </Magnetic>
          </div>
          <div className="hero-dots fade-in-up" style={{ '--d': '480ms' }}>
            {HERO_SLIDES.map((_, i) => (
              <button key={i} className={i === slide ? 'active' : ''} onClick={() => setSlide(i)} aria-label={`Slide ${i+1}`}>
                {i === slide && <span className="dot-fill"></span>}
              </button>
            ))}
            <span className="hero-counter">
              <span className="now">{String(slide + 1).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-stage">
            {/* Imagen principal del acordeón — arrástrala desde tu equipo */}
            <image-slot id="hero-accordion" placeholder="Foto del acordeón" shape="rounded" radius="0"></image-slot>
            <div className="hero-accordion-fallback">
              <AccordionArt variant={s.variant} />
            </div>
            {/* 3 fotos circulares superpuestas — arrastra cada una */}
            <div className="hero-circle hero-circle-1">
              <image-slot id="hero-circle-1" placeholder="Foto 1" shape="circle"></image-slot>
            </div>
            <div className="hero-circle hero-circle-2">
              <image-slot id="hero-circle-2" placeholder="Foto 2" shape="circle"></image-slot>
            </div>
            <div className="hero-circle hero-circle-3">
              <image-slot id="hero-circle-3" placeholder="Foto 3" shape="circle"></image-slot>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ Marquee ============ */
function Marquee() {
  const items = [
    { ic: 'pin', t: 'Taller en Valledupar' },
    { ic: 'globe', t: 'Envíos a 42 países' },
    { ic: 'star', t: 'Hohner Oficial' },
    { ic: 'cat-guitar', t: 'Guitarras Profesionales' },
    { ic: 'cat-bass', t: 'Bajos Eléctricos' },
    { ic: 'cat-drums', t: 'Baterías Acústicas y E-Drum' },
    { ic: 'cat-speaker', t: 'Sonido Profesional' },
    { ic: 'sparkle', t: 'Personalización Artesanal' },
    { ic: 'shield', t: 'Garantía 5 Años' },
  ];
  const seq = [...items, ...items];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {seq.map((s, i) => (
          <React.Fragment key={i}>
            <span className="m-item"><Icon name={s.ic} size={14} /> {s.t}</span>
            <span className="dot"></span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ============ Category Icons Row — ACCORDION ECOSYSTEM ============ */
const CAT_ICONS = [
  { id: 'nuevos',         icon: 'cat-acc',     label: 'Acordeones',  meta: 'Todos los modelos', featured: true },
  { id: 'personalizados', icon: 'cat-custom',  label: 'Personalizados', meta: 'Edición única' },
  { id: 'parrillas',      icon: 'acc-parrilla',label: 'Parrillas',   meta: '24 modelos' },
  { id: 'correas',        icon: 'cat-strap',   label: 'Correas',     meta: '38 ítems' },
  { id: 'fuelles',        icon: 'acc-fuelle',  label: 'Fuelles',     meta: '12 ítems' },
  { id: 'estuches',       icon: 'cat-case',    label: 'Estuches',    meta: '18 modelos' },
  { id: 'broches',        icon: 'acc-broche',  label: 'Broches',     meta: '15 ítems' },
  { id: 'tecnicos',       icon: 'acc-tools',   label: 'Para Técnicos', meta: 'Lengüetas, Resortes…' },
];

function CategoryIcons({ navigate }) {
  return (
    <section className="cat-icons" id="catalogo">
      <div className="section-head" style={{ marginBottom: 30 }}>
        <div className="left reveal">
          <div className="eyebrow">— TODO PARA TU ACORDEÓN</div>
          <h2 className="display section-title">
            Acordeones, <span className="italic">accesorios</span><br/>
            y <span className="accent">repuestos técnicos</span>
          </h2>
        </div>
        <p className="section-sub reveal" data-delay="1">
          Distribuidor oficial Hohner. Todo lo que tu acordeón necesita, desde el día uno hasta los próximos veinte años.
        </p>
      </div>
      <div className="cat-icons-grid reveal">
        {CAT_ICONS.map((c, i) => (
          <a key={c.id} href="#" onClick={(e) => { e.preventDefault(); navigate(c.id); }}
             className={`cat-ico ${c.featured ? 'featured' : ''}`}
             style={{ '--idx': i }}>
            <div className="cat-ico-img">
              {c.featured && <span className="cat-ico-badge"><Icon name="star" size={9} /> Insignia</span>}
              <Icon name={c.icon} size={32} />
              <div className="cat-ico-glow"></div>
            </div>
            <div className="cat-ico-label">{c.label}</div>
            <div className="cat-ico-meta">{c.meta}</div>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ============ Para Técnicos (repuestos) ============ */
const TECNICOS = [
  { id: 'lenguetas',  icon: 'acc-lengueta',  label: 'Lengüetas',  meta: 'Hohner, Voci Armoniche', desc: 'Lengüetas a mano y máquina para todos los modelos.' },
  { id: 'resortes',   icon: 'acc-resorte',   label: 'Resortes',   meta: 'Acero templado',           desc: 'Resortes de teclado, bajos y registro. Calidad europea.' },
  { id: 'celuloide',  icon: 'acc-celuloide', label: 'Celuloide',  meta: 'Hojas decorativas',        desc: 'Hojas de celuloide nácar, negro, rojo, perla y colores especiales.' },
  { id: 'herramientas', icon: 'acc-tools',  label: 'Herramientas', meta: 'Llaves, alicates',        desc: 'Set completo de herramientas profesionales para afinación y reparación.' },
];

function ParaTecnicos({ navigate }) {
  return (
    <section className="section" id="tecnicos">
      <div className="section-head">
        <div className="left reveal">
          <div className="eyebrow">— PARA AFINADORES Y TÉCNICOS</div>
          <h2 className="display section-title">
            Repuestos <span className="italic">de</span><br/>
            <span className="accent">Calidad Profesional</span>
          </h2>
        </div>
        <p className="section-sub reveal" data-delay="1">
          Surtimos talleres de afinación en toda Latinoamérica. Despacho directo desde Valledupar con factura y garantía.
        </p>
      </div>
      <div className="tecnicos-grid">
        {TECNICOS.map((t, i) => (
          <a key={t.id} href="#" onClick={(e) => { e.preventDefault(); navigate(t.id); }}
             className="tecnico-card reveal" style={{ '--idx': i }}>
            <div className="tecnico-icon"><Icon name={t.icon} size={28} /></div>
            <div className="tecnico-meta">// {String(i + 1).padStart(2, '0')} · {t.meta}</div>
            <h3 className="tecnico-title">{t.label}</h3>
            <p className="tecnico-desc">{t.desc}</p>
            <span className="tecnico-cta">Ver catálogo <Icon name="arrow" size={12} /></span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ============ Otros Instrumentos (secundario) ============ */
const OTROS = [
  { id: 'pianos',     icon: 'cat-piano',    label: 'Pianos y Teclados', meta: '32 modelos' },
  { id: 'guitarras',  icon: 'cat-guitar',   label: 'Guitarras',         meta: '48 modelos' },
  { id: 'bajos',      icon: 'cat-bass',     label: 'Bajos Eléctricos',  meta: '24 modelos' },
  { id: 'baterias',   icon: 'cat-drums',    label: 'Baterías',          meta: '18 sets' },
  { id: 'electronica',icon: 'cat-speaker',  label: 'Sonido Pro',        meta: '120+ ítems' },
  { id: 'cursos',     icon: 'cat-courses',  label: 'Cursos',            meta: '12 módulos' },
];

function OtrosInstrumentos({ navigate }) {
  return (
    <section className="section" id="otros">
      <div className="section-head">
        <div className="left reveal">
          <div className="eyebrow">— TAMBIÉN MANEJAMOS</div>
          <h2 className="display section-title">
            Otros <span className="accent">Instrumentos</span><br/>
            <span className="italic">para músicos serios</span>
          </h2>
        </div>
        <p className="section-sub reveal" data-delay="1">
          Pianos, guitarras, bajos, baterías y sonido profesional. Marcas oficiales con garantía.
        </p>
      </div>
      <div className="otros-grid reveal">
        {OTROS.map((o, i) => (
          <a key={o.id} href="#" onClick={(e) => { e.preventDefault(); navigate(o.id); }}
             className="otro-card" style={{ '--idx': i }}>
            <div className="otro-icon"><Icon name={o.icon} size={26} /></div>
            <div className="otro-name">{o.label}</div>
            <div className="otro-meta">{o.meta}</div>
            <span className="otro-arrow"><Icon name="arrow" size={14} /></span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ============ Newsletter ============ */
function Newsletter({ toast }) {
  const [email, setEmail] = useStateH('');
  const [sent, setSent] = useStateH(false);
  const submit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast?.('Email inválido', 'Revisa tu correo');
      return;
    }
    setSent(true);
    toast?.('¡Suscrito!', 'Te enviaremos las ofertas');
    setTimeout(() => { setSent(false); setEmail(''); }, 3500);
  };
  return (
    <section className="newsletter">
      <div className="newsletter-inner reveal">
        <div className="newsletter-text">
          <div className="eyebrow">— BOLETÍN VENTA DE ACORDEONES</div>
          <h2 className="display newsletter-title">
            Ofertas <span className="italic">antes</span> que nadie.<br/>
            <span className="accent">Drops privados, descuentos, lanzamientos.</span>
          </h2>
          <p className="newsletter-sub">
            Suscríbete y recibe nuestro catálogo PDF actualizado, ofertas relámpago y noticias del taller. Sin spam, prometido.
          </p>
        </div>
        <form className="newsletter-form" onSubmit={submit}>
          <div className="newsletter-field">
            <Icon name="mail" size={18} />
            <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" className="btn btn-primary">
              {sent ? (<><Icon name="check" size={14} /> Suscrito</>) : (<>Suscribirme <span className="arrow"><Icon name="arrow" size={14} /></span></>)}
            </button>
          </div>
          <div className="newsletter-perks">
            <span><Icon name="check" size={12} /> Catálogo PDF gratis</span>
            <span><Icon name="check" size={12} /> Ofertas relámpago</span>
            <span><Icon name="check" size={12} /> Sin spam</span>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ============ Flash Sale ============ */
const FLASH_PRODUCTS = [
  { id: 'f1', tag: '-30%', tagClass: 'sale', brand: 'Hohner',          name: 'Rey Vallenato Sol',   price: 6915000,  was: 9450000,  visual: 'pearl', sold: 9, stock: 10, kind: 'acc' },
  { id: 'f2', tag: '-25%', tagClass: 'sale', brand: 'Edición Maestro', name: 'Onix Oro 24K',        price: 10650000, was: 14200000, visual: 'onyx',  sold: 6, stock: 10, kind: 'acc' },
  { id: 'f3', tag: '-18%', tagClass: 'sale', brand: 'Fender',          name: 'Stratocaster Sunburst', price: 4290000, was: 5230000, visual: 'guitar', sold: 5, stock: 10, kind: 'guitar' },
  { id: 'f4', tag: '-22%', tagClass: 'sale', brand: 'Pearl',           name: 'Export 5pc Negro',    price: 6580000,  was: 8430000,  visual: 'drums', sold: 8, stock: 10, kind: 'drums' },
];

function Countdown() {
  const [t, setT] = useStateH({ h: 6, m: 17, s: 56 });
  useEffectH(() => {
    const iv = setInterval(() => {
      setT(prev => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 11; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div className="flash-countdown">
      <div className="flash-cd-box">{pad(t.h)}</div>
      <div className="flash-cd-sep">:</div>
      <div className="flash-cd-box">{pad(t.m)}</div>
      <div className="flash-cd-sep">:</div>
      <div className="flash-cd-box">{pad(t.s)}</div>
    </div>
  );
}

function ProductVisual({ p }) {
  if (p.kind === 'guitar' || p.visual === 'guitar') {
    return (
      <div className="mini-guitar">
        <div className="mini-guitar-body"></div>
        <div className="mini-guitar-neck"></div>
        <div className="mini-guitar-head"></div>
      </div>
    );
  }
  if (p.kind === 'bass' || p.visual === 'bass') {
    return (
      <div className="mini-guitar bass">
        <div className="mini-guitar-body"></div>
        <div className="mini-guitar-neck"></div>
        <div className="mini-guitar-head"></div>
      </div>
    );
  }
  if (p.kind === 'drums' || p.visual === 'drums') {
    return (
      <div className="mini-drums">
        <span className="d-kick"></span>
        <span className="d-snare"></span>
        <span className="d-tom t1"></span>
        <span className="d-tom t2"></span>
        <span className="d-cymbal"></span>
      </div>
    );
  }
  if (p.kind === 'speaker' || p.visual === 'speaker') {
    return (
      <div className="mini-speaker">
        <span className="s-tw"></span>
        <span className="s-mid"></span>
        <span className="s-sub"></span>
      </div>
    );
  }
  return <MiniAcc variant={p.visual} />;
}

function ProductCard({ p, onAdd, liked, onLike, showSale, index = 0 }) {
  const [added, setAdded] = useStateH(false);
  const handleAdd = (e) => {
    e.stopPropagation();
    onAdd(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };
  const handleFav = (e) => {
    e.stopPropagation();
    onLike(p.id);
  };
  const handleQuick = (e) => {
    e.stopPropagation();
    if (window.__navigate) window.__navigate('producto/' + p.id);
  };
  const openProduct = () => {
    if (window.__navigate) window.__navigate('producto/' + p.id);
  };
  return (
    <Tilt max={5} className="prod reveal clickable" style={{ '--idx': index }} onClick={openProduct}>
      <div className="prod-img">
        <span className={`prod-tag ${p.tagClass || ''}`}>{p.tag}</span>
        <button className={`prod-fav ${liked ? 'liked' : ''}`} onClick={handleFav} aria-label="Favorito">
          <Icon name={liked ? 'heart-fill' : 'heart'} size={14} />
        </button>
        <ProductVisual p={p} />
        <div className="prod-glow"></div>
        <div className="prod-quick">
          <button onClick={handleQuick}><Icon name="eye" size={12} /> Ver producto</button>
        </div>
      </div>
      <div className="prod-info">
        <div className="prod-brand">{p.brand}</div>
        <div className="prod-name">{p.name}</div>
        <div className="prod-meta">
          <div className="prod-price">
            <span className="now">{fmtCOP(p.price)}</span>
            {p.was && <span className="was">{fmtCOP(p.was)}</span>}
          </div>
          <button className={`prod-add ${added ? 'added' : ''}`} onClick={handleAdd}>
            {added ? (<><Icon name="check" size={12} /> Añadido</>) : (<><Icon name="plus" size={12} /> Añadir</>)}
          </button>
        </div>
        {showSale && p.sold !== undefined && (
          <div className="prod-sale">
            <div className="prod-sale-bar" style={{ '--p': `${(p.sold/p.stock)*100}%` }}></div>
            <span>{p.sold}/{p.stock} Venta</span>
          </div>
        )}
      </div>
    </Tilt>
  );
}

function FlashSale({ onAdd, likes, toggleLike }) {
  return (
    <section className="section" id="flash">
      <div className="flash reveal">
        <div className="flash-head">
          <div className="flash-title">
            <div className="flash-bolt"><Icon name="bolt" size={24} /></div>
            <div>
              <div className="flash-name">Flash Sale <span className="gd">Hoy</span></div>
              <div className="flash-meta">Termina en pocas horas · Stock limitado</div>
            </div>
            <Countdown />
          </div>
          <div className="flash-nav">
            <button aria-label="Anterior"><Icon name="arrow-left" size={16} /></button>
            <button className="primary" aria-label="Siguiente"><Icon name="arrow" size={16} /></button>
          </div>
        </div>
        <div className="prod-grid">
          {FLASH_PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} p={p} onAdd={onAdd} liked={!!likes[p.id]} onLike={toggleLike} showSale index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ Today's For You ============ */
const TODAY_PRODUCTS = [
  { id: 't1', tag: 'NUEVO',       tagClass: 'new',  brand: 'Hohner',           name: 'Rey Vallenato Nácar Blanco', price: 9450000, visual: 'pearl', kind: 'acc',   cat: 'bestseller' },
  { id: 't2', tag: 'OFICIAL',     tagClass: '',     brand: 'Hohner Oficial',   name: 'Anacleto Edición Oro',       price: 12800000, visual: 'gold', kind: 'acc',   cat: 'oficial' },
  { id: 't3', tag: 'TENDENCIA',   tagClass: 'new',  brand: 'Fender',           name: 'Stratocaster Player Plus',   price: 5450000, visual: 'guitar', kind: 'guitar', cat: 'trending' },
  { id: 't4', tag: '-15%',        tagClass: 'sale', brand: 'Hohner Compadre',  name: 'Compadre Cuero Vintage',     price: 4156500, was: 4890000, visual: 'cuero', kind: 'acc', cat: 'descuento' },
  { id: 't5', tag: 'CODICIADO',   tagClass: '',     brand: 'Yamaha',           name: 'TRBX604 Bajo Activo',        price: 3990000, visual: 'bass', kind: 'bass', cat: 'codiciado' },
  { id: 't6', tag: 'BESTSELLER',  tagClass: 'new',  brand: 'Pearl',            name: 'Export 5pc Sunset',          price: 8200000, visual: 'drums', kind: 'drums', cat: 'bestseller' },
  { id: 't7', tag: '-20%',        tagClass: 'sale', brand: 'JBL',              name: 'EON 715 Activo 1300W',       price: 4920000, was: 6150000, visual: 'speaker', kind: 'speaker', cat: 'descuento' },
  { id: 't8', tag: 'NUEVO',       tagClass: 'new',  brand: 'Hohner',           name: 'Pancho Rada Edición',        price: 11400000, visual: 'pearl', kind: 'acc', cat: 'trending' },
];

const TODAY_TABS = [
  { id: 'bestseller', label: 'Más Vendidos' },
  { id: 'trending',   label: 'En Tendencia' },
  { id: 'descuento',  label: 'Oferta Especial' },
  { id: 'oficial',    label: 'Tienda Oficial' },
  { id: 'codiciado',  label: 'Más Codiciados' },
];

function TodayForYou({ onAdd, likes, toggleLike }) {
  const [tab, setTab] = useStateH('bestseller');
  const filtered = useMemoH(() => TODAY_PRODUCTS.filter(p => p.cat === tab), [tab]);
  const display = filtered.length ? filtered : TODAY_PRODUCTS.slice(0, 4);
  return (
    <section className="section" id="productos">
      <div className="today-head">
        <div className="today-title reveal">
          <h2>
            Hoy <span className="italic">para</span> Ti
          </h2>
        </div>
        <div className="today-tabs reveal" data-delay="1">
          {TODAY_TABS.map(t => (
            <button key={t.id} className={`today-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="prod-grid">
        {(() => {
          let list = display.slice(0, 4);
          if (list.length < 4) {
            const fillers = TODAY_PRODUCTS.filter(p => !list.find(x => x.id === p.id)).slice(0, 4 - list.length);
            list = [...list, ...fillers];
          }
          return list.map((p, i) => (
            <ProductCard key={p.id + '-' + tab} p={p} onAdd={onAdd} liked={!!likes[p.id]} onLike={toggleLike} index={i} />
          ));
        })()}
      </div>
    </section>
  );
}

/* ============ Stats Strip (count-up) ============ */
function StatsStrip() {
  return (
    <section className="stats-strip reveal">
      <div className="stats-strip-inner">
        <div className="ss-item">
          <div className="ss-num"><Counter to={27} suffix="" /><span className="ss-plus">+</span></div>
          <div className="ss-lbl">Años de Oficio</div>
        </div>
        <div className="ss-item">
          <div className="ss-num"><Counter to={3400} /><span className="ss-plus">+</span></div>
          <div className="ss-lbl">Instrumentos Entregados</div>
        </div>
        <div className="ss-item">
          <div className="ss-num"><Counter to={42} /></div>
          <div className="ss-lbl">Países Atendidos</div>
        </div>
        <div className="ss-item">
          <div className="ss-num"><Counter to={4.9} decimals={1} /><span className="ss-plus">★</span></div>
          <div className="ss-lbl">Reseñas Verificadas</div>
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
window.Marquee = Marquee;
window.CategoryIcons = CategoryIcons;
window.ParaTecnicos = ParaTecnicos;
window.OtrosInstrumentos = OtrosInstrumentos;
window.Newsletter = Newsletter;
window.FlashSale = FlashSale;
window.TodayForYou = TodayForYou;
window.StatsStrip = StatsStrip;
window.ProductCard = ProductCard;
window.ProductVisual = ProductVisual;
