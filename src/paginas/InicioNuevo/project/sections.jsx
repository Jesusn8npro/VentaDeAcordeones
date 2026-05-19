/* global React, Icon, AccordionArt */

/* ============ Value Props ============ */
function Values() {
  const items = [
    { n: '01', icon: 'tool',    t: 'Taller Propio',          d: 'Cada acordeón pasa por las manos de nuestros maestros lutieres en Valledupar antes de salir.' },
    { n: '02', icon: 'globe',   t: 'Envíos Internacionales', d: 'Despachos asegurados a 42 países con embalaje rígido y seguro de tránsito incluido.' },
    { n: '03', icon: 'sparkle', t: 'Personalización Única',  d: 'Maderas, nácar, cuero y grabados a la medida. Tu acordeón será uno y solamente uno en el mundo.' },
    { n: '04', icon: 'shield',  t: 'Garantía de Calidad',    d: 'Cinco años de garantía estructural y afinación. Servicio técnico de por vida para nuestros clientes.' },
  ];
  return (
    <div className="values-wrap">
      <section className="section">
        <div className="section-head">
          <div className="left reveal">
            <div className="eyebrow">— Por Qué Comprar Aquí</div>
            <h2 className="display section-title">
              Cuatro Razones <span className="italic">que</span><br/>
              <span className="accent">Marcan la Diferencia</span>
            </h2>
          </div>
        </div>
        <div className="values-grid">
          {items.map((it, i) => (
            <div key={it.n} className="value reveal" data-delay={i}>
              <div className="value-icon"><Icon name={it.icon} size={24} /></div>
              <div className="value-num">// {it.n}</div>
              <h3 className="value-title">{it.t}</h3>
              <p className="value-desc">{it.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ============ Custom Section ============ */
function Custom({ onWA }) {
  return (
    <div className="custom-wrap" id="personalizados">
      <div className="custom">
        <div className="custom-visual reveal">
          <span className="custom-corner-tag">EXPEDIENTE 0042 / EDICIÓN PRIVADA</span>
          <AccordionArt variant="pearl" />
          <span className="custom-spec s1">NÁCAR BLANCO MADREPERLA</span>
          <span className="custom-spec s2">GRABADO LÁSER · TU NOMBRE</span>
          <span className="custom-spec s3">ENTREGA 6–8 SEMANAS</span>
        </div>
        <div className="custom-content">
          <div className="eyebrow reveal">— Personalizados</div>
          <h2 className="display custom-title reveal" data-delay="1">
            Diseña <span className="accent">el acordeón</span>
            <span className="italic">que solo tú podrás tocar</span>
          </h2>
          <p className="custom-body reveal" data-delay="2">
            Trabajamos contigo de la mano: eliges madera, color, herrajes, grabados, nácar y afinación. Te enviamos renders 3D y bocetos hasta que sea perfecto. Después, el taller lo hace realidad en seis a ocho semanas.
          </p>
          <ul className="custom-list reveal" data-delay="3">
            <li>Sesión de diseño 1-a-1 con nuestro maestro lutier</li>
            <li>Renders 3D y aprobación digital antes de producción</li>
            <li>Grabado de tu nombre, escudo o firma en el cuerpo</li>
            <li>Estuche rígido personalizado y certificado de autoría</li>
          </ul>
          <div className="custom-ctas reveal" data-delay="4">
            <button className="btn btn-whatsapp" onClick={onWA}>
              <Icon name="whatsapp" size={14} /> Hablar por WhatsApp
            </button>
            <button className="btn btn-ghost">
              Ver galería <span className="arrow"><Icon name="arrow" size={14} /></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Testimonials ============ */
function Testimonials() {
  const items = [
    {
      featured: true,
      stars: 5,
      text: '"Pedí un Rey Vallenato personalizado para el cumpleaños de mi papá. Le grabaron su nombre y un escudo del Cesar. El sonido es de otra dimensión. La atención, impecable de principio a fin."',
      name: 'Camilo Restrepo', loc: 'Medellín, COL', initials: 'CR',
    },
    {
      stars: 5,
      text: '"Compré desde Miami y llegó en menos de dos semanas, perfectamente empacado y afinado. El acordeón suena exactamente como en el video. Volveré a comprar."',
      name: 'Yulissa Mendoza', loc: 'Miami, USA', initials: 'YM',
    },
    {
      stars: 5,
      text: '"Son los únicos que entienden de verdad un acordeón vallenato. Me ayudaron a elegir, ajustaron afinación a mi voz y me regalaron una correa de cuero. Cinco estrellas no alcanzan."',
      name: 'Luis Eduardo Mejía', loc: 'Valledupar, COL', initials: 'LM',
    },
  ];
  return (
    <div className="testimonials-wrap">
      <section className="section">
        <div className="section-head">
          <div className="left reveal">
            <div className="eyebrow">— Clientes</div>
            <h2 className="display section-title">
              La Palabra<br/>
              <span className="italic">de quien ya</span> <span className="accent">lo tiene en sus manos</span>
            </h2>
          </div>
          <p className="section-sub reveal" data-delay="1">
            4.9 / 5 · más de 1.200 reseñas verificadas en Google, Facebook y Mercado Libre.
          </p>
        </div>
        <div className="tst-grid">
          {items.map((t, i) => (
            <div key={i} className={`tst reveal ${t.featured ? 'featured' : ''}`} data-delay={i}>
              <div className="quote">“</div>
              <div className="stars">{'★'.repeat(t.stars)}</div>
              <p className="text">{t.text}</p>
              <div className="tst-person">
                <div className="tst-avatar"><span>{t.initials}</span></div>
                <div>
                  <div className="tst-name">{t.name}</div>
                  <div className="tst-loc">{t.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CtaFinal({ onCatalog }) {
  return (
    <section className="cta-final">
      <div className="cta-eyebrow eyebrow reveal">Última parada</div>
      <h2 className="display cta-title reveal" data-delay="1">
        ¿Listo Para Encontrar<br/>
        <span className="accent">Tu Acordeón?</span>
        <span className="italic">El que va a sonar contigo, no a tu lado.</span>
      </h2>
      <p className="cta-sub reveal" data-delay="2">
        Explora la colección completa o agenda una llamada con uno de nuestros maestros. Te ayudamos a encontrar el tuyo.
      </p>
      <div className="cta-actions reveal" data-delay="3">
        <button className="btn btn-primary" onClick={onCatalog}>
          Ver Catálogo Completo <span className="arrow"><Icon name="arrow" size={14} /></span>
        </button>
        <button className="btn btn-ghost">Agendar Llamada</button>
      </div>
    </section>
  );
}

/* ============ Footer ============ */
function Footer({ navigate }) {
  const go = (route) => (e) => { e.preventDefault(); navigate?.(route); };
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <a href="#" className="nav-logo" onClick={go('home')}>
            <div className="nav-logo-mark"><span>V</span></div>
            <div className="nav-logo-text" style={{ display: 'block' }}>
              VENTA<span className="gd">·</span>ACORDEONES<small>VENTADEACORDEONES.COM</small>
            </div>
          </a>
          <p>Acordeones vallenatos de alta gama, ensamblados a mano en nuestro taller. Importadores oficiales y constructores de instrumentos únicos.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Instagram"><Icon name="ig" size={16} /></a>
            <a href="#" aria-label="Facebook"><Icon name="fb" size={16} /></a>
            <a href="#" aria-label="YouTube"><Icon name="yt" size={16} /></a>
            <a href="#" aria-label="TikTok"><Icon name="tt" size={16} /></a>
            <a href="https://wa.me/573001234567" target="_blank" rel="noreferrer" aria-label="WhatsApp"><Icon name="whatsapp" size={16} /></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Tienda</h4>
          <ul>
            <li><a href="#" onClick={go('nuevos')}>Acordeones Nuevos</a></li>
            <li><a href="#" onClick={go('personalizados')}>Personalizados</a></li>
            <li><a href="#" onClick={go('accesorios')}>Accesorios</a></li>
            <li><a href="#" onClick={go('electronica')}>Electrónica</a></li>
            <li><a href="#" onClick={go('cursos')}>Cursos</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Compañía</h4>
          <ul>
            <li><a href="#" onClick={go('sobre')}>Sobre Nosotros</a></li>
            <li><a href="#" onClick={go('taller')}>Taller de Acordeones</a></li>
            <li><a href="#" onClick={go('maestros')}>Maestros Lutieres</a></li>
            <li><a href="#" onClick={go('prensa')}>Prensa</a></li>
            <li><a href="#" onClick={go('contacto')}>Contacto</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Soporte</h4>
          <ul>
            <li><a href="#" onClick={go('envios')}>Envíos y Aduanas</a></li>
            <li><a href="#" onClick={go('garantia')}>Garantía</a></li>
            <li><a href="#" onClick={go('servicio')}>Servicio Técnico</a></li>
            <li><a href="#" onClick={go('devoluciones')}>Devoluciones</a></li>
            <li><a href="#" onClick={go('faq')}>Preguntas Frecuentes</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Métodos de Pago</h4>
          <div className="footer-pay">
            <span className="chip">VISA</span>
            <span className="chip">MASTERCARD</span>
            <span className="chip">AMEX</span>
            <span className="chip">PSE</span>
            <span className="chip">NEQUI</span>
            <span className="chip">DAVIPLATA</span>
            <span className="chip">MERCADO PAGO</span>
            <span className="chip">CRIPTO</span>
          </div>
          <ul style={{ marginTop: 20 }}>
            <li><a href="tel:+573001234567">+57 300 123 4567</a></li>
            <li><a href="mailto:hola@ventadeacordeones.com">hola@ventadeacordeones.com</a></li>
            <li><a href="#" onClick={go('contacto')}>Cra 9 #14-32 · Valledupar</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 VENTADEACORDEONES.COM · TODOS LOS DERECHOS RESERVADOS</span>
        <span><a href="#" onClick={go('privacidad')}>Política de privacidad</a> · <a href="#" onClick={go('terminos')}>Términos</a> · <a href="#" onClick={go('cookies')}>Cookies</a></span>
      </div>
    </footer>
  );
}

window.Values = Values;
window.Custom = Custom;
window.Testimonials = Testimonials;
window.CtaFinal = CtaFinal;
window.Footer = Footer;
