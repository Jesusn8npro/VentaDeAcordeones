/* global React, Icon, AccordionArt */

/* ============ TALLER DE ACORDEONES (SEO LANDING) ============ */
function TallerPage({ navigate, onWA, toast }) {
  const [openFaq, setOpenFaq] = React.useState(0);
  const [form, setForm] = React.useState({ nombre: '', tel: '', servicio: 'afinacion', urgencia: 'normal', msg: '' });

  /* SEO: inject Service + FAQPage JSON-LD just for this route */
  React.useEffect(() => {
    const service = document.createElement('script');
    service.type = 'application/ld+json';
    service.id = '__taller_ld';
    service.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Taller de acordeones · Reparación, afinación y restauración",
      "provider": {
        "@type": "MusicStore",
        "name": "Venta de Acordeones · Taller Mendoza",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Cra 9 #14-32",
          "addressLocality": "Valledupar",
          "addressRegion": "Cesar",
          "addressCountry": "CO"
        },
        "telephone": "+57-300-123-4567"
      },
      "areaServed": ["Colombia","Latinoamérica","Estados Unidos","España"],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Servicios del Taller",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Afinación de acordeón a mano" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Reparación de acordeón Hohner" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Restauración de acordeones antiguos" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Cambio de lengüetas y resortes" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Servicio de luthier especializado" } }
        ]
      },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "418" }
    });
    document.head.appendChild(service);

    const faq = document.createElement('script');
    faq.type = 'application/ld+json';
    faq.id = '__taller_faq_ld';
    faq.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": FAQ_ITEMS.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    });
    document.head.appendChild(faq);

    return () => {
      document.getElementById('__taller_ld')?.remove();
      document.getElementById('__taller_faq_ld')?.remove();
    };
  }, []);

  const submitForm = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.tel) {
      toast?.('Faltan datos', 'Nombre y teléfono son obligatorios');
      return;
    }
    toast?.('¡Cotización enviada!', 'Te contactamos en 24 horas');
    setForm({ nombre: '', tel: '', servicio: 'afinacion', urgencia: 'normal', msg: '' });
  };

  return (
    <div className="page taller-page">
      <div className="page-hero">
        <div className="page-crumbs">
          <a onClick={() => navigate('home')}>Inicio</a>
          <span className="sep">/</span>
          <span className="current">Taller de Acordeones</span>
        </div>
        <div className="page-eyebrow">— Taller Mendoza · Desde 1998</div>
        <h1 className="page-title">
          Taller de <span className="accent">Acordeones</span><br/>
          <span className="italic">Luthier especializado en</span><br/>
          <span className="accent">Hohner Vallenato</span>
        </h1>
        <p className="page-intro">
          Servicio técnico profesional de acordeones en Colombia y Latinoamérica. Afinación a mano, reparación, restauración y luthería para todas las marcas: <strong>Hohner Corona, Anacleto Rey del Vallenato, Compadre, Rey Mar, Hohner Marca Registrada</strong>. Más de 27 años atendiendo a artistas profesionales y técnicos del oficio.
        </p>
        <div className="hero-ctas" style={{ marginTop: 28 }}>
          <a href="#cotizar" className="btn btn-primary">
            Cotizar Mi Acordeón <span className="arrow"><Icon name="arrow" size={14} /></span>
          </a>
          <button className="btn btn-ghost" onClick={onWA}>
            <Icon name="whatsapp" size={14} /> WhatsApp Directo
          </button>
        </div>
      </div>

      {/* SERVICIOS */}
      <section className="section taller-services">
        <div className="section-head">
          <div className="left reveal">
            <div className="eyebrow">— SERVICIOS DEL TALLER</div>
            <h2 className="display section-title">
              Todo lo que tu <span className="italic">acordeón</span><br/>
              <span className="accent">necesita en un solo lugar</span>
            </h2>
          </div>
          <p className="section-sub reveal" data-delay="1">
            Nuestro taller en Valledupar atiende a artistas profesionales y técnicos del oficio. Trabajamos a mano, con repuestos originales Hohner y europeos.
          </p>
        </div>

        <div className="services-grid">
          {[
            { n: '01', icon: 'sparkle', title: 'Afinación a Mano',
              kw: 'afinación · entonación · ajuste tonal',
              desc: 'Afinación profesional lengüeta por lengüeta. Ajustamos tu acordeón a tu tono de voz para que cante contigo, no a tu lado.',
              price: 'Desde $180.000', time: '2-3 días' },
            { n: '02', icon: 'tool', title: 'Reparación General',
              kw: 'reparación · arreglo · servicio técnico',
              desc: 'Diagnóstico completo y reparación de teclados, bajos, fuelles, válvulas y herrajes. Garantía de un año en cada reparación.',
              price: 'Desde $250.000', time: '3-7 días' },
            { n: '03', icon: 'star', title: 'Restauración Vintage',
              kw: 'restauración · acordeones antiguos · piezas históricas',
              desc: 'Recuperamos acordeones antiguos y de colección. Conservamos el alma original mientras devolvemos su sonido y belleza.',
              price: 'Desde $1.200.000', time: '4-8 semanas' },
            { n: '04', icon: 'acc-lengueta', title: 'Cambio de Lengüetas',
              kw: 'lengüetas · reeds · cambio · profesional',
              desc: 'Reemplazo completo o parcial con lengüetas a mano italianas (Voci Armoniche, Salpa) o de máquina Hohner originales.',
              price: 'Desde $480.000', time: '5-10 días' },
            { n: '05', icon: 'acc-fuelle', title: 'Reparación de Fuelle',
              kw: 'fuelle · bellows · cuero · cambio',
              desc: 'Cambio de cuero, parches, esquineros y ajuste de presión. Recuperamos fuelles con problemas de fuga o desgaste.',
              price: 'Desde $380.000', time: '4-7 días' },
            { n: '06', icon: 'shield', title: 'Mantenimiento Preventivo',
              kw: 'mantenimiento · limpieza · revisión',
              desc: 'Limpieza profunda, lubricación, ajuste de resortes y revisión integral. Recomendado cada 6 meses para uso profesional.',
              price: 'Desde $120.000', time: '1-2 días' },
            { n: '07', icon: 'cat-custom', title: 'Personalización Estética',
              kw: 'estética · celuloide · nácar · grabado',
              desc: 'Cambio de celuloide, grabados láser, nácar tallado a mano y herrajes bañados en oro. Tu acordeón único en el mundo.',
              price: 'Desde $850.000', time: '3-5 semanas' },
            { n: '08', icon: 'cat-custom', title: 'Fabricación a Medida',
              kw: 'luthier · construcción · custom · a la medida',
              desc: 'Construimos tu acordeón desde cero. Tú eliges maderas, herrajes, afinación y acabados. Renders 3D antes de producción.',
              price: 'Desde $8.500.000', time: '6-8 semanas' },
          ].map((s, i) => (
            <article key={s.n} className="service-card reveal" style={{ '--idx': i }}>
              <div className="service-num">// {s.n}</div>
              <div className="service-icon"><Icon name={s.icon} size={26} /></div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-kw">{s.kw}</p>
              <p className="service-desc">{s.desc}</p>
              <div className="service-meta">
                <div><span>PRECIO</span><strong>{s.price}</strong></div>
                <div><span>ENTREGA</span><strong>{s.time}</strong></div>
              </div>
              <a href="#cotizar" className="service-cta">Solicitar cotización <Icon name="arrow" size={12} /></a>
            </article>
          ))}
        </div>
      </section>

      {/* PROCESO */}
      <section className="section taller-process">
        <div className="section-head">
          <div className="left reveal">
            <div className="eyebrow">— EL PROCESO</div>
            <h2 className="display section-title">
              Cómo trabajamos <span className="italic">cada</span><br/>
              <span className="accent">acordeón que entra al taller</span>
            </h2>
          </div>
          <p className="section-sub reveal" data-delay="1">
            Un proceso transparente, fotografiado paso a paso. Tú decides y autorizas cada intervención antes de que toquemos tu instrumento.
          </p>
        </div>
        <div className="process-grid">
          {[
            { n: '01', t: 'Diagnóstico', d: 'Tu acordeón llega al taller. Lo desarmamos, fotografiamos, registramos cada pieza y emitimos un reporte detallado con cotización exacta.', time: '1-2 días' },
            { n: '02', t: 'Cotización', d: 'Recibes vía WhatsApp el diagnóstico con fotos, lista de servicios necesarios y precio cerrado. Nada se interviene sin tu autorización.', time: '24 horas' },
            { n: '03', t: 'Intervención', d: 'Una vez aprobado, nuestros maestros lutieres ejecutan los servicios con repuestos originales y técnica artesanal. Documentamos cada paso.', time: 'Según servicio' },
            { n: '04', t: 'Afinación Final', d: 'Antes de entregar, hacemos afinación de control lengüeta por lengüeta. Si quieres, ajustamos al tono específico de tu voz.', time: '1 día' },
            { n: '05', t: 'Pruebas y Entrega', d: 'Un técnico toca tu acordeón al menos una hora para validar el sonido. Te enviamos video del acordeón funcionando antes del despacho.', time: '1 día' },
            { n: '06', t: 'Garantía y Soporte', d: 'Todos los servicios incluyen garantía. Te enviamos manual de mantenimiento y quedas con servicio técnico de por vida.', time: 'Permanente' },
          ].map((p, i) => (
            <div key={p.n} className="process-step reveal" style={{ '--idx': i }}>
              <div className="process-num">{p.n}</div>
              <div className="process-time">{p.time}</div>
              <h3 className="process-title">{p.t}</h3>
              <p className="process-desc">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MARCAS */}
      <section className="section taller-brands">
        <div className="section-head">
          <div className="left reveal">
            <div className="eyebrow">— MARCAS QUE REPARAMOS</div>
            <h2 className="display section-title">
              Especialistas <span className="italic">en</span> <span className="accent">todas las marcas</span>
            </h2>
          </div>
          <p className="section-sub reveal" data-delay="1">
            Servicio técnico autorizado Hohner. También trabajamos con todas las marcas vallenatas y europeas tradicionales.
          </p>
        </div>
        <div className="brands-grid reveal">
          {[
            'Hohner Corona II', 'Hohner Corona III', 'Hohner Anacleto', 'Hohner Compadre',
            'Hohner Rey Vallenato', 'Hohner Marca Registrada', 'Rey del Vallenato', 'Pancho Rada',
            'Voci Armoniche', 'Salpa', 'Castagnari', 'Excelsior',
          ].map(b => (
            <div key={b} className="brand-chip">{b}</div>
          ))}
        </div>
      </section>

      {/* MAESTROS */}
      <section className="section taller-team">
        <div className="section-head">
          <div className="left reveal">
            <div className="eyebrow">— NUESTROS MAESTROS LUTIERES</div>
            <h2 className="display section-title">
              Las manos <span className="italic">que</span> <span className="accent">tocan tu acordeón</span>
            </h2>
          </div>
        </div>
        <div className="team-grid">
          {[
            { i: 'AM', name: 'Andrés Mendoza', role: 'Maestro Lutier · Director del Taller',
              bio: 'Formado en Castelfidardo, Italia (capital mundial del acordeón). Más de 18 años construyendo y reparando acordeones vallenatos. Supervisa cada acordeón que sale del taller.',
              years: '18+ años · 1.200 acordeones reparados' },
            { i: 'CM', name: 'Carmen Mejía', role: 'Especialista en Personalización',
              bio: 'Veinte años trabajando con maderas finas, nácar y celuloide. Diseña los grabados, herrajes dorados y acabados artesanales que distinguen nuestros acordeones.',
              years: '20+ años · 380 acordeones personalizados' },
            { i: 'JR', name: 'Julio Romero', role: 'Afinador Maestro',
              bio: 'Afinador con oído absoluto certificado. Especialista en afinación vallenata tradicional y adaptación al tono vocal del intérprete. Doce años en el taller.',
              years: '12+ años · 2.400 afinaciones' },
          ].map(t => (
            <div key={t.name} className="team-card reveal">
              <div className="team-avatar">{t.i}</div>
              <div className="team-name">{t.name}</div>
              <div className="team-role">{t.role}</div>
              <div className="team-bio">{t.bio}</div>
              <div className="team-years">{t.years}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COTIZAR / FORMULARIO */}
      <section className="section taller-quote" id="cotizar">
        <div className="quote-grid">
          <div className="quote-text">
            <div className="eyebrow reveal">— SOLICITA TU COTIZACIÓN</div>
            <h2 className="display section-title reveal" data-delay="1">
              Recibe tu cotización <span className="italic">en</span> <span className="accent">24 horas</span>
            </h2>
            <p className="reveal" data-delay="2" style={{ color: 'var(--ink-dim)', fontSize: 16, lineHeight: 1.6, margin: '20px 0 28px', maxWidth: 460 }}>
              Cuéntanos qué necesita tu acordeón. Si está en Colombia, enviamos un mensajero o coordinamos recolección. Si estás fuera del país, te damos instrucciones para envío seguro.
            </p>
            <ul className="custom-list reveal" data-delay="3">
              <li>Cotización exacta sin sorpresas</li>
              <li>Fotos del diagnóstico antes de empezar</li>
              <li>Garantía de 1 año en cada servicio</li>
              <li>Servicio técnico de por vida</li>
            </ul>
          </div>
          <form className="quote-form contact-form reveal" data-delay="2" onSubmit={submitForm}>
            <h3>Cotización Rápida</h3>
            <p className="sub">Respondemos por WhatsApp en máximo 24 horas hábiles.</p>
            <div className="form-row two">
              <div className="field">
                <label>Tu nombre *</label>
                <input type="text" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Nombre completo" />
              </div>
              <div className="field">
                <label>Teléfono / WhatsApp *</label>
                <input type="tel" value={form.tel} onChange={e => setForm(f => ({ ...f, tel: e.target.value }))} placeholder="+57 300 000 0000" />
              </div>
            </div>
            <div className="form-row two">
              <div className="field">
                <label>Servicio</label>
                <select value={form.servicio} onChange={e => setForm(f => ({ ...f, servicio: e.target.value }))}>
                  <option value="afinacion">Afinación a mano</option>
                  <option value="reparacion">Reparación general</option>
                  <option value="restauracion">Restauración vintage</option>
                  <option value="lenguetas">Cambio de lengüetas</option>
                  <option value="fuelle">Reparación de fuelle</option>
                  <option value="mantenimiento">Mantenimiento preventivo</option>
                  <option value="personalizacion">Personalización estética</option>
                  <option value="custom">Fabricación a medida</option>
                  <option value="otro">Otro / Diagnóstico</option>
                </select>
              </div>
              <div className="field">
                <label>Urgencia</label>
                <select value={form.urgencia} onChange={e => setForm(f => ({ ...f, urgencia: e.target.value }))}>
                  <option value="normal">Estándar (sin prisa)</option>
                  <option value="rapido">Rápido (+30%)</option>
                  <option value="emergencia">Emergencia (+60%)</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Marca y modelo del acordeón</label>
                <input type="text" value={form.msg} onChange={e => setForm(f => ({ ...f, msg: e.target.value }))} placeholder="Ej: Hohner Corona III, Anacleto Rey FA, etc." />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Enviar Cotización <span className="arrow"><Icon name="arrow" size={14} /></span>
              </button>
              <button type="button" className="btn btn-ghost" onClick={onWA}>
                <Icon name="whatsapp" size={14} /> O por WhatsApp
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="section taller-faq">
        <div className="section-head">
          <div className="left reveal">
            <div className="eyebrow">— PREGUNTAS FRECUENTES</div>
            <h2 className="display section-title">
              Dudas <span className="italic">sobre el</span><br/>
              <span className="accent">Taller</span>
            </h2>
          </div>
        </div>
        <div className="faq-list">
          {FAQ_ITEMS.map((f, i) => (
            <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
              <button className="faq-head" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <span className="faq-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="faq-q">{f.q}</span>
                <Icon name={openFaq === i ? 'minus' : 'plus'} size={16} />
              </button>
              {openFaq === i && <div className="faq-a">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final">
        <div className="cta-eyebrow eyebrow reveal">Taller Mendoza · Valledupar</div>
        <h2 className="display cta-title reveal" data-delay="1">
          Tu acordeón <span className="italic">en las mejores</span><br/>
          <span className="accent">manos del oficio</span>
        </h2>
        <p className="cta-sub reveal" data-delay="2">
          Más de 3.400 acordeones reparados, restaurados o construidos. Atendemos artistas profesionales, técnicos y coleccionistas en toda Latinoamérica.
        </p>
        <div className="cta-actions reveal" data-delay="3">
          <a href="#cotizar" className="btn btn-primary">
            Cotizar Mi Acordeón <span className="arrow"><Icon name="arrow" size={14} /></span>
          </a>
          <button className="btn btn-ghost" onClick={onWA}>
            <Icon name="whatsapp" size={14} /> Hablar con un Maestro
          </button>
        </div>
      </section>
    </div>
  );
}

const FAQ_ITEMS = [
  { q: '¿Cuánto cuesta afinar un acordeón Hohner en Colombia?',
    a: 'La afinación a mano profesional empieza en $180.000 COP para acordeones diatónicos de 3 hileras. El precio final depende del estado de las lengüetas, si requieren reemplazo o solo ajuste, y del nivel de afinación deseado (vallenato tradicional, musette o personalizado al tono de voz). Cotización gratuita sin compromiso.' },
  { q: '¿Cuánto tarda la reparación de un acordeón en su taller?',
    a: 'Una afinación estándar toma 2–3 días hábiles. Una reparación general entre 3–7 días. Restauraciones vintage o fabricación personalizada pueden tomar de 4 a 8 semanas. Tenemos servicio express con recargo del 30% para casos urgentes (artistas en gira, grabaciones).' },
  { q: '¿Hacen envíos para reparación desde fuera de Valledupar o del exterior?',
    a: 'Sí. Recibimos acordeones de toda Colombia (envío asegurado por Servientrega o Coordinadora) y del exterior (DHL, FedEx, EMS). Te damos instrucciones de empaque profesional y cubrimos el seguro de tránsito ida y vuelta. Atendemos clientes en EE.UU., México, Venezuela, Ecuador, Perú, Argentina y España regularmente.' },
  { q: '¿Qué lengüetas usan? ¿Son originales?',
    a: 'Trabajamos con tres opciones según el nivel: (1) Lengüetas a mano italianas Voci Armoniche o Salpa para nivel profesional/concertista, (2) Lengüetas a máquina Hohner originales alemanas para uso estándar, (3) Lengüetas compatibles certificadas para reparaciones económicas. Siempre te explicamos las opciones antes de elegir.' },
  { q: '¿Dan garantía en los servicios del taller?',
    a: 'Sí. Garantía de 1 año en mano de obra para todas las reparaciones, 6 meses en afinaciones y 2 años en restauraciones completas. Servicio técnico de por vida sin costo para nuestros clientes (ajustes menores, limpieza, reapriete).' },
  { q: '¿Pueden afinar mi acordeón al tono específico de mi voz?',
    a: 'Por supuesto. Nuestro afinador maestro Julio Romero hace una sesión de dos horas con el cliente, analiza tu rango vocal y ajusta el acordeón a tu tono ideal. Es uno de nuestros servicios más solicitados por artistas profesionales y compositores.' },
  { q: '¿Reparan acordeones que no son Hohner?',
    a: 'Sí. Trabajamos con todas las marcas: Anacleto, Compadre, Rey del Vallenato, Pancho Rada, Castagnari, Excelsior, y modelos europeos antiguos. Nuestros maestros conocen las particularidades técnicas de cada constructor.' },
  { q: '¿Construyen acordeones a medida desde cero?',
    a: 'Sí, es nuestro servicio premium. Tú eliges maderas (caoba, palisandro, ébano), tipo de nácar, herrajes (bañados en oro o plata), tipo de fuelle, afinación y grabados personalizados. Te enviamos renders 3D y fotos del proceso. Entrega en 6–8 semanas.' },
];

window.TallerPage = TallerPage;
