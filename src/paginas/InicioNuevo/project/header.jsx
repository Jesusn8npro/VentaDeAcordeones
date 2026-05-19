/* global React, Icon */
const { useState, useEffect, useRef } = React;

const NAV_LINKS = [
  { id: 'nuevos',         label: 'Acordeones', badge: 'PRINCIPAL' },
  { id: 'personalizados', label: 'Personalizados', badge: 'HOT' },
  { id: 'accesorios',     label: 'Accesorios', badge: null },
  { id: 'tecnicos',       label: 'Repuestos', badge: null },
  { id: 'taller',         label: 'Taller', badge: 'SEO' },
  { id: 'otros',          label: 'Otros', badge: null },
  { id: 'cursos',         label: 'Cursos', badge: 'NEW' },
];

const CATEGORIES_DD = [
  { id: 'catalogo',       label: 'Todas las categorías', count: '500+', group: 'all' },
  { id: 'nuevos',         label: 'Acordeones Nuevos', count: '34', group: 'acc' },
  { id: 'personalizados', label: 'Acordeones Personalizados', count: '12', group: 'acc' },
  { id: 'parrillas',      label: 'Parrillas', count: '24', group: 'access' },
  { id: 'correas',        label: 'Correas', count: '38', group: 'access' },
  { id: 'fuelles',        label: 'Fuelles', count: '12', group: 'access' },
  { id: 'estuches',       label: 'Estuches', count: '18', group: 'access' },
  { id: 'broches',        label: 'Broches', count: '15', group: 'access' },
  { id: 'lenguetas',      label: 'Lengüetas', count: '48', group: 'tec' },
  { id: 'resortes',       label: 'Resortes', count: '32', group: 'tec' },
  { id: 'celuloide',      label: 'Celuloide', count: '22', group: 'tec' },
  { id: 'herramientas',   label: 'Herramientas', count: '28', group: 'tec' },
  { id: 'pianos',         label: 'Pianos y Teclados', count: '32', group: 'otros' },
  { id: 'guitarras',      label: 'Guitarras', count: '48', group: 'otros' },
  { id: 'bajos',          label: 'Bajos Eléctricos', count: '24', group: 'otros' },
  { id: 'baterias',       label: 'Baterías', count: '18', group: 'otros' },
  { id: 'electronica',    label: 'Sonido y Electrónica', count: '120+', group: 'otros' },
  { id: 'cursos',         label: 'Cursos Online', count: '12', group: 'extra' },
];

const SEARCH_TRENDS = [
  { k: 'Hohner Rey Vallenato', meta: '2.3k búsquedas', target: 'nuevos' },
  { k: 'Acordeón nácar personalizado', meta: 'En tendencia', target: 'personalizados' },
  { k: 'Fender Stratocaster', meta: 'Más vendido', target: 'guitarras' },
  { k: 'Yamaha TRBX bajo activo', meta: 'Recomendado', target: 'bajos' },
  { k: 'Pearl Export batería', meta: 'Oferta -22%', target: 'baterias' },
  { k: 'JBL EON sonido activo', meta: 'Disponible', target: 'electronica' },
];

const UTIL_LINKS = [
  { id: 'mayoristas', label: 'Mayoristas' },
  { id: 'sobre',      label: 'Sobre Nosotros' },
  { id: 'soporte',    label: 'Soporte 24/7' },
  { id: 'promos',     label: 'Promociones' },
];

function Header({ cartCount, onCartOpen, bumpCart, onSearch, navigate, current, theme, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [selectedCat, setSelectedCat] = useState('catalogo');
  const [mMenuOpen, setMMenuOpen] = useState(false);
  const [mSearchOpen, setMSearchOpen] = useState(false);
  const ddRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setCatOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocus(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mMenuOpen]);

  useEffect(() => { setMMenuOpen(false); }, [current]);

  const go = (route) => {
    navigate(route);
    setMMenuOpen(false);
    setCatOpen(false);
    setMSearchOpen(false);
  };

  const selectedLabel = CATEGORIES_DD.find(c => c.id === selectedCat)?.label || 'Todas';

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        {/* Utility bar */}
        <div className="util">
          <div className="util-inner">
            <a className="util-left" href="#" onClick={(e) => { e.preventDefault(); go('descarga'); }}>
              <span className="ic"><Icon name="phone" size={12} /></span>
              <span className="util-pulse">Descarga la App · Envío gratis +$2M</span>
            </a>
            <nav className="util-right">
              {UTIL_LINKS.map(l => (
                <a key={l.id} href="#" onClick={(e) => { e.preventDefault(); go(l.id); }}>{l.label}</a>
              ))}
              <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
                <Icon name={theme === 'light' ? 'moon' : 'sun'} size={14} />
              </button>
              <button className="auth" onClick={() => go('cuenta')}>Crear Cuenta</button>
              <button className="auth primary" onClick={() => go('ingresar')}>Ingresar</button>
            </nav>
            <nav className="util-right compact">
              <button className="theme-toggle" onClick={toggleTheme} aria-label="Cambiar tema">
                <Icon name={theme === 'light' ? 'moon' : 'sun'} size={14} />
              </button>
              <button className="auth primary" onClick={() => go('ingresar')}>Ingresar</button>
            </nav>
          </div>
        </div>

        {/* Main bar */}
        <div className="main-bar">
          <button className="burger" onClick={() => setMMenuOpen(true)} aria-label="Abrir menú">
            <Icon name="menu" size={18} />
          </button>

          <a href="#" className="nav-logo" aria-label="Inicio" onClick={(e) => { e.preventDefault(); go('home'); }}>
            <div className="nav-logo-mark"><span>V</span></div>
            <div className="nav-logo-text">
              VENTA<span className="gd">·</span>ACORDEONES<small>VENTADEACORDEONES.COM</small>
            </div>
            <div className="nav-logo-text compact">VDA</div>
          </a>

          <div ref={searchRef} className={`search-shell-wrap ${searchFocus && searchVal === '' ? 'show-suggest' : ''} ${mSearchOpen ? 'expanded' : ''}`}>
            <div className={`search-shell ${searchFocus ? 'focus' : ''}`}>
              <div ref={ddRef} className={`cat-dd ${catOpen ? 'open' : ''}`}>
                <button className="cat-dd-btn" onClick={() => setCatOpen(v => !v)}>
                  <span>{selectedLabel.replace('Todas las categorías', 'Todas')}</span>
                  <span className="chev"><Icon name="chev-down" size={14} /></span>
                </button>
                <div className="cat-dd-panel" role="menu">
                  <div className="cat-dd-group-label">— Acordeones (especialidad)</div>
                  {CATEGORIES_DD.filter(c => c.group === 'acc' || c.group === 'all').map(c => (
                    <button key={c.id} className={selectedCat === c.id ? 'selected' : ''} onClick={() => { setSelectedCat(c.id); setCatOpen(false); go(c.id); }}>
                      <span>{c.label}</span>
                      <span className="ct">{c.count}</span>
                    </button>
                  ))}
                  <div className="cat-dd-group-label">— Accesorios</div>
                  {CATEGORIES_DD.filter(c => c.group === 'access').map(c => (
                    <button key={c.id} className={selectedCat === c.id ? 'selected' : ''} onClick={() => { setSelectedCat(c.id); setCatOpen(false); go(c.id); }}>
                      <span>{c.label}</span>
                      <span className="ct">{c.count}</span>
                    </button>
                  ))}
                  <div className="cat-dd-group-label">— Repuestos Técnicos</div>
                  {CATEGORIES_DD.filter(c => c.group === 'tec').map(c => (
                    <button key={c.id} className={selectedCat === c.id ? 'selected' : ''} onClick={() => { setSelectedCat(c.id); setCatOpen(false); go(c.id); }}>
                      <span>{c.label}</span>
                      <span className="ct">{c.count}</span>
                    </button>
                  ))}
                  <div className="cat-dd-group-label">— Otros instrumentos</div>
                  {CATEGORIES_DD.filter(c => c.group === 'otros').map(c => (
                    <button key={c.id} className={selectedCat === c.id ? 'selected' : ''} onClick={() => { setSelectedCat(c.id); setCatOpen(false); go(c.id); }}>
                      <span>{c.label}</span>
                      <span className="ct">{c.count}</span>
                    </button>
                  ))}
                  <div className="cat-dd-group-label">— Aprende</div>
                  {CATEGORIES_DD.filter(c => c.group === 'extra').map(c => (
                    <button key={c.id} className={selectedCat === c.id ? 'selected' : ''} onClick={() => { setSelectedCat(c.id); setCatOpen(false); go(c.id); }}>
                      <span>{c.label}</span>
                      <span className="ct">{c.count}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="search-field">
                <Icon name="search" size={16} />
                <input
                  type="text"
                  placeholder="Buscar acordeón, marca, accesorio o referencia…"
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onKeyDown={e => { if (e.key === 'Enter') { onSearch(searchVal); go('catalogo'); } }}
                />
                <span className="search-kbd">⌘ K</span>
                <button className="search-go" onClick={() => { onSearch(searchVal); go('catalogo'); }}>
                  <span>Buscar</span> <Icon name="arrow" size={12} />
                </button>
              </div>
            </div>
            <div className="search-suggest">
              <h5>Tendencias hoy</h5>
              {SEARCH_TRENDS.map(t => (
                <div key={t.k} className="row" onClick={() => { setSearchVal(t.k); onSearch(t.k); setSearchFocus(false); go(t.target); }}>
                  <Icon name="search" size={14} />
                  <span>{t.k}</span>
                  <span className="meta">{t.meta}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="search-mobile-btn" onClick={() => setMSearchOpen(v => !v)} aria-label="Buscar">
            <Icon name="search" size={18} />
          </button>

          <div className="nav-actions">
            <button className="nav-icon-btn" aria-label="Cuenta" onClick={() => go('cuenta')}><Icon name="user" size={18} /></button>
            <button className="nav-icon-btn" aria-label="Notificaciones" onClick={() => go('promos')}>
              <Icon name="bell" size={18} />
              <span className="nav-icon-dot"></span>
            </button>
            <button className="nav-icon-btn" aria-label="Carrito" onClick={onCartOpen}>
              <Icon name="cart" size={18} />
              {cartCount > 0 && (
                <span className={`nav-cart-count ${bumpCart ? 'bump' : ''}`}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Sub-nav with categories */}
        <div className="subnav">
          <div className="subnav-inner">
            <ul className="nav-menu">
              {NAV_LINKS.map(l => (
                <li key={l.id}>
                  <a href="#" className={current === l.id ? 'active' : ''} onClick={(e) => { e.preventDefault(); go(l.id); }}>
                    {l.label}
                    {l.badge && <span className="badge">{l.badge}</span>}
                  </a>
                </li>
              ))}
            </ul>
            <div className="subnav-tail">
              <span>Flash Sale Hoy · 30% OFF</span>
              <span className="sep"></span>
              <a href="#" onClick={(e) => { e.preventDefault(); go('home'); setTimeout(() => document.querySelector('#flash')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>
                <Icon name="bolt" size={12} /> Ver oferta
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`m-menu-overlay ${mMenuOpen ? 'open' : ''}`} onClick={() => setMMenuOpen(false)}></div>
      <aside className={`m-menu ${mMenuOpen ? 'open' : ''}`} aria-hidden={!mMenuOpen}>
        <div className="m-menu-head">
          <div className="nav-logo">
            <div className="nav-logo-mark"><span>V</span></div>
            <div className="nav-logo-text" style={{ display: 'block' }}>VENTA<small>ACORDEONES</small></div>
          </div>
          <button className="nav-icon-btn" onClick={() => setMMenuOpen(false)} aria-label="Cerrar">
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="m-menu-search">
          <div className="search-shell-wrap">
            <div className="search-shell">
              <div className="search-field">
                <Icon name="search" size={16} />
                <input type="text" placeholder="Buscar…" onKeyDown={(e) => { if (e.key === 'Enter') go('catalogo'); }} />
              </div>
            </div>
          </div>
        </div>
        <div className="m-menu-section">
          <h4>Catálogo</h4>
          {NAV_LINKS.map(l => (
            <a key={l.id} href="#" onClick={(e) => { e.preventDefault(); go(l.id); }}>
              <span>{l.label}{l.badge && <span className="badge" style={{ marginLeft: 8 }}>{l.badge}</span>}</span>
              <span className="arr"><Icon name="arrow" size={14} /></span>
            </a>
          ))}
        </div>
        <div className="m-menu-section">
          <h4>Empresa</h4>
          {UTIL_LINKS.map(l => (
            <a key={l.id} href="#" onClick={(e) => { e.preventDefault(); go(l.id); }}>
              <span>{l.label}</span><span className="arr"><Icon name="arrow" size={14} /></span>
            </a>
          ))}
          <a href="#" onClick={(e) => { e.preventDefault(); go('contacto'); }}>
            <span>Contacto</span><span className="arr"><Icon name="arrow" size={14} /></span>
          </a>
        </div>
        <div className="m-menu-section">
          <h4>Cuenta</h4>
          <button onClick={() => go('cuenta')}><span>Crear Cuenta</span> <span className="arr"><Icon name="arrow" size={14} /></span></button>
          <button onClick={() => go('ingresar')}><span>Ingresar</span> <span className="arr"><Icon name="arrow" size={14} /></span></button>
          <button onClick={toggleTheme}>
            <span>Tema: {theme === 'light' ? 'Claro' : 'Oscuro'}</span>
            <span className="arr"><Icon name={theme === 'light' ? 'moon' : 'sun'} size={14} /></span>
          </button>
        </div>
        <div className="m-menu-foot">
          <button className="btn btn-primary" onClick={() => go('descarga')}>Descargar la App <Icon name="phone" size={14} /></button>
          <button className="btn btn-ghost" onClick={() => window.open('https://wa.me/573001234567', '_blank')}>
            <Icon name="whatsapp" size={14} /> WhatsApp
          </button>
        </div>
      </aside>
    </>
  );
}

window.Header = Header;
