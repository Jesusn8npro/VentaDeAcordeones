/* global React, ReactDOM, Header, Hero, Marquee, CategoryIcons, ParaTecnicos, OtrosInstrumentos, Newsletter, FlashSale, TodayForYou, Values, Custom, Testimonials, CtaFinal, Footer, CartDrawer, ToastStack, AboutPage, CatalogPage, ContactPage, StubPage, ProductPage, TallerPage, ScrollProgress, PageTransition, StatsStrip */
const { useState, useEffect } = React;

function useReveal(route) {
  useEffect(() => {
    const tick = () => {
      const els = document.querySelectorAll('.reveal:not(.in)');
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      els.forEach(el => io.observe(el));
      return io;
    };
    // double-tick to catch newly-mounted route content
    const io1 = tick();
    const t = setTimeout(() => tick(), 50);
    return () => { io1?.disconnect(); clearTimeout(t); };
  }, [route]);
}

/* Hash-based router for shareable URLs */
function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '').trim();
  return h || 'home';
}

const STUB_PAGES = {
  mayoristas:    { title: 'Programa Mayoristas',   icon: 'globe',   crumb: 'Mayoristas',    intro: 'Descuentos para tiendas, escuelas y compradores corporativos. Precios netos al volumen, envíos consolidados y soporte logístico.' },
  soporte:       { title: 'Soporte 24/7',          icon: 'shield',  crumb: 'Soporte',       intro: 'Asistencia técnica por WhatsApp, llamada o video-llamada. Lunes a sábado de 7am a 9pm, domingos chat con respuesta en 1 hora.' },
  promos:        { title: 'Promociones Activas',   icon: 'sparkle', crumb: 'Promociones',   intro: 'Ofertas relámpago, descuentos por temporada y combos exclusivos para nuestros suscriptores.' },
  cuenta:        { title: 'Crear Cuenta',          icon: 'user',    crumb: 'Cuenta',        intro: 'Crea tu cuenta para guardar favoritos, ver tus pedidos y acceder a precios miembro.' },
  ingresar:      { title: 'Ingresar',              icon: 'user',    crumb: 'Ingresar',      intro: 'Accede a tu cuenta de Venta de Acordeones.' },
  descarga:      { title: 'Descarga la App',       icon: 'phone',   crumb: 'App Móvil',     intro: 'Lleva el catálogo en tu bolsillo. Notificaciones de ofertas relámpago y acceso al taller.' },
  maestros:      { title: 'Maestros Lutieres',     icon: 'sparkle', crumb: 'Maestros',      intro: 'Conoce a las personas detrás de cada instrumento que sale de nuestro taller.' },
  prensa:        { title: 'Prensa',                icon: 'globe',   crumb: 'Prensa',        intro: 'Notas de prensa, kit de marca y entrevistas con nuestros maestros.' },
  envios:        { title: 'Envíos y Aduanas',      icon: 'globe',   crumb: 'Envíos',        intro: 'Información sobre tiempos de entrega, costos y procesos aduaneros para envíos internacionales.' },
  garantia:      { title: 'Garantía',              icon: 'shield',  crumb: 'Garantía',      intro: 'Cinco años de garantía estructural y servicio técnico de por vida en todos nuestros productos.' },
  servicio:      { title: 'Servicio Técnico',      icon: 'tool',    crumb: 'Servicio',      intro: 'Afinación, reparación y mantenimiento por nuestros maestros lutieres.' },
  devoluciones:  { title: 'Devoluciones',          icon: 'arrow',   crumb: 'Devoluciones',  intro: '30 días para cambios y devoluciones en productos nuevos sin uso.' },
  faq:           { title: 'Preguntas Frecuentes',  icon: 'sparkle', crumb: 'FAQ',           intro: 'Respuestas a las dudas más comunes sobre acordeones, envíos y personalizaciones.' },
  privacidad:    { title: 'Política de Privacidad',icon: 'shield',  crumb: 'Privacidad',    intro: 'Cómo recolectamos, usamos y protegemos tus datos personales.' },
  terminos:      { title: 'Términos y Condiciones',icon: 'shield',  crumb: 'Términos',      intro: 'Términos de uso del sitio y condiciones generales de compra.' },
  cookies:       { title: 'Política de Cookies',   icon: 'shield',  crumb: 'Cookies',       intro: 'Información sobre el uso de cookies en nuestro sitio.' },
};

const CATALOG_ROUTES = ['catalogo', 'nuevos', 'personalizados', 'accesorios', 'parrillas', 'correas', 'fuelles', 'estuches', 'broches', 'tecnicos', 'lenguetas', 'resortes', 'celuloide', 'herramientas', 'otros', 'pianos', 'guitarras', 'bajos', 'baterias', 'electronica', 'cursos'];

function HomePage({ onWA, onAdd, likes, toggleLike, navigate, toast }) {
  const goCatalog = () => navigate('catalogo');
  return (
    <>
      <Hero onWA={onWA} onCatalog={goCatalog} navigate={navigate} />
      <Marquee />
      <CategoryIcons navigate={navigate} />
      <FlashSale onAdd={onAdd} likes={likes} toggleLike={toggleLike} />
      <TodayForYou onAdd={onAdd} likes={likes} toggleLike={toggleLike} />
      <ParaTecnicos navigate={navigate} />
      <StatsStrip />
      <Custom onWA={onWA} />
      <OtrosInstrumentos navigate={navigate} />
      <Values />
      <Testimonials />
      <Newsletter toast={toast} />
      <CtaFinal onCatalog={goCatalog} />
    </>
  );
}

function App() {
  const [route, setRoute] = useState(() => parseHash());
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const [likes, setLikes] = useState({});
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('vda-theme') || 'dark'; } catch (e) { return 'dark'; }
  });

  useReveal(route);

  /* theme */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('vda-theme', theme); } catch (e) {}
  }, [theme]);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  /* router */
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = (next) => {
    setRoute(next);
    window.location.hash = next === 'home' ? '' : '/' + next;
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  /* Expose for product cards inside other modules */
  window.__navigate = navigate;

  /* cart */
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const pushToast = (title, sub) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, title, sub }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2400);
  };
  const addToCart = (p) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1, visual: p.visual }];
    });
    setBump(true);
    setTimeout(() => setBump(false), 350);
    pushToast('Añadido al carrito', p.name);
  };
  const toggleLike = (id) => setLikes(prev => ({ ...prev, [id]: !prev[id] }));
  const openWA = () => {
    window.open('https://wa.me/573001234567?text=Hola%2C%20quiero%20personalizar%20un%20acorde%C3%B3n', '_blank');
  };
  const onSearch = (q) => {
    if (!q) return;
    pushToast('Buscando…', q);
  };

  /* render current page */
  const renderPage = () => {
    if (route === 'home' || route === '') return <HomePage onWA={openWA} onAdd={addToCart} likes={likes} toggleLike={toggleLike} navigate={navigate} toast={pushToast} />;
    if (route === 'sobre') return <AboutPage navigate={navigate} onWA={openWA} />;
    if (route === 'contacto') return <ContactPage navigate={navigate} onWA={openWA} toast={pushToast} />;
    if (route === 'taller') return <TallerPage navigate={navigate} onWA={openWA} toast={pushToast} />;
    if (route.startsWith('producto/')) {
      const id = route.split('/')[1];
      const product = (window.CATALOG || []).find(p => p.id === id);
      return <ProductPage product={product} navigate={navigate} onAdd={addToCart} toast={pushToast} />;
    }
    if (CATALOG_ROUTES.includes(route)) {
      const key = route === 'catalogo' ? 'all' : route;
      return <CatalogPage catKey={key} navigate={navigate} onAdd={addToCart} />;
    }
    const stub = STUB_PAGES[route];
    if (stub) return <StubPage {...stub} navigate={navigate} onWA={openWA} />;
    return <HomePage onWA={openWA} onAdd={addToCart} likes={likes} toggleLike={toggleLike} navigate={navigate} toast={pushToast} />;
  };

  return (
    <React.Fragment>
      <ScrollProgress />
      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        bumpCart={bump}
        onSearch={onSearch}
        navigate={navigate}
        current={route}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <PageTransition routeKey={route}>
        {renderPage()}
      </PageTransition>
      <Footer navigate={navigate} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cart} setItems={setCart} />
      <ToastStack toasts={toasts} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
