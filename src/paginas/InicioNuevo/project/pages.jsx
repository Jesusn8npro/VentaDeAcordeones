/* global React, Icon, AccordionArt, MiniAcc */

const fmtCOP_p = (n) => `$${n.toLocaleString('es-CO')} COP`;

/* =========== About Page =========== */
function AboutPage({ navigate, onWA }) {
  return (
    <div className="page">
      <div className="page-hero">
        <div className="page-crumbs">
          <a onClick={() => navigate('home')}>Inicio</a>
          <span className="sep">/</span>
          <span className="current">Sobre Nosotros</span>
        </div>
        <div className="page-eyebrow">— DESDE 1998</div>
        <h1 className="page-title">
          Tres Generaciones <span className="italic">tocando</span><br/>
          <span className="accent">el Mismo Acordeón</span>
        </h1>
        <p className="page-intro">
          Somos un taller familiar fundado por Don Rafael Mendoza en Valledupar, Cesar. Lo que comenzó como una pequeña tienda de reparación es hoy referente de la lutería vallenata. Hohner oficial. Hechos a mano. Sin atajos.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-visual reveal">
          <AccordionArt variant="pearl" />
        </div>
        <div className="about-text reveal" data-delay="1">
          <h2>Nuestra <span className="accent">Historia</span></h2>
          <p><strong>1998.</strong> Don Rafael abrió un pequeño taller frente al parque Alfonso López para afinar y reparar acordeones de los compositores de la región. Lo que sabía lo había aprendido de su padre, y este del suyo.</p>
          <p><strong>2008.</strong> Su hijo, el maestro Andrés Mendoza, asumió el oficio tras estudiar lutería en Castelfidardo, Italia. Volvió con la idea de construir acordeones colombianos, no solo repararlos.</p>
          <p><strong>2018.</strong> Lanzamos nuestra primera edición personalizada: el Rey Vallenato Nácar. Hoy enviamos a 42 países y trabajamos directamente con Hohner como distribuidores oficiales en Colombia.</p>
          <p><strong>Hoy.</strong> Más de 3.400 acordeones entregados y una lista de espera de seis meses para los modelos personalizados. La tradición sigue viva — pero la hacemos contigo.</p>
        </div>
      </div>

      <div className="about-stats">
        {[
          { num: '27', lbl: 'Años de oficio' },
          { num: '3.4k', lbl: 'Acordeones entregados' },
          { num: '42', lbl: 'Países atendidos' },
          { num: '4.9★', lbl: 'Reseñas verificadas' },
        ].map(s => (
          <div key={s.lbl} className="about-stat reveal">
            <div className="num">{s.num}</div>
            <div className="lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="about-team">
        <div className="section-head">
          <div className="left reveal">
            <div className="eyebrow">— Maestros Lutieres</div>
            <h2 className="display section-title">El Taller <span className="italic">en</span> <span className="accent">Personas</span></h2>
          </div>
        </div>
        <div className="team-grid">
          {[
            { i: 'AM', name: 'Andrés Mendoza', role: 'Maestro Lutier · Director',  bio: 'Formado en Castelfidardo, Italia. Lidera la línea de acordeones personalizados y supervisa cada afinación final antes de salir del taller.' },
            { i: 'CM', name: 'Carmen Mejía',    role: 'Diseño de Personalizados', bio: 'Veinte años trabajando con maderas finas y nácar. Diseña los grabados, los herrajes y los estuches a medida.' },
            { i: 'JR', name: 'Julio Romero',    role: 'Afinación Maestra',         bio: 'Afinador con oído absoluto. Ajusta cada acordeón al tono de voz de su dueño durante una sesión de dos horas.' },
          ].map(t => (
            <div key={t.name} className="team-card reveal">
              <div className="team-avatar">{t.i}</div>
              <div className="team-name">{t.name}</div>
              <div className="team-role">{t.role}</div>
              <div className="team-bio">{t.bio}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="cta-final">
        <div className="cta-eyebrow eyebrow reveal">Visítanos</div>
        <h2 className="display cta-title reveal" data-delay="1">
          Pasa por el <span className="accent">Taller</span>
          <span className="italic">Cra 9 #14-32 · Valledupar, Cesar</span>
        </h2>
        <div className="cta-actions reveal" data-delay="3">
          <button className="btn btn-primary" onClick={() => navigate('contacto')}>
            Agendar Visita <span className="arrow"><Icon name="arrow" size={14} /></span>
          </button>
          <button className="btn btn-ghost" onClick={onWA}>
            <Icon name="whatsapp" size={14} /> Llamar por WhatsApp
          </button>
        </div>
      </section>
    </div>
  );
}

/* =========== Catalog Page =========== */
const CATALOG = [
  /* Acordeón (foco principal) */
  { id: 'c1', tag: 'NUEVO',    tagClass: 'new',  brand: 'Hohner',           name: 'Rey Vallenato Nácar', price: 9450000, was: null,      visual: 'pearl', kind: 'acc',     cat: 'nuevos' },
  { id: 'c2', tag: 'PRIVADO',  tagClass: '',     brand: 'Edición Maestro',  name: 'Onix Oro 24K',         price: 14200000, was: null,    visual: 'onyx',  kind: 'acc',     cat: 'personalizados' },
  { id: 'c3', tag: '-12%',     tagClass: 'sale', brand: 'Hohner Compadre',  name: 'Compadre Vallenato', price: 4890000, was: 5550000,  visual: 'rojo',  kind: 'acc',     cat: 'nuevos' },
  { id: 'c4', tag: 'POCAS',    tagClass: '',     brand: 'Hohner Corona II', name: 'Corona II Sol',        price: 7150000, was: null,    visual: 'gold',  kind: 'acc',     cat: 'nuevos' },
  { id: 'c5', tag: 'BEST',     tagClass: 'new',  brand: 'Hohner Anacleto',  name: 'Anacleto Rey FA',      price: 11200000, was: null,    visual: 'cuero', kind: 'acc',     cat: 'nuevos' },
  { id: 'c6', tag: '-18%',     tagClass: 'sale', brand: 'Hohner',           name: 'Corona III Negro',     price: 5990000, was: 7300000, visual: 'onyx',  kind: 'acc',     cat: 'nuevos' },
  { id: 'c7', tag: 'NUEVO',    tagClass: 'new',  brand: 'Edición Cesar',    name: 'Azul Cesar Edición',  price: 8950000, was: null,    visual: 'azul',  kind: 'acc',     cat: 'personalizados' },
  { id: 'c8', tag: '-22%',     tagClass: 'sale', brand: 'Hohner Compadre',  name: 'Compadre Plus DO',    price: 5350000, was: 6850000, visual: 'gold',  kind: 'acc',     cat: 'nuevos' },
  { id: 'c9', tag: 'CUSTOM',   tagClass: '',     brand: 'Edición Cuero',    name: 'Cuero Vintage Sol',    price: 10650000, was: null,   visual: 'cuero', kind: 'acc',     cat: 'personalizados' },
  /* Accesorios */
  { id: 'a1', tag: 'NUEVO',    tagClass: 'new',  brand: 'Talabartería Cesar', name: 'Correa Cuero Vallenato', price: 380000, was: null, visual: 'pearl', kind: 'acc', cat: 'accesorios' },
  { id: 'a2', tag: 'BEST',     tagClass: 'new',  brand: 'Maletas Andinas',  name: 'Estuche Rígido Pro',   price: 890000, was: null, visual: 'onyx',  kind: 'acc', cat: 'accesorios' },
  /* Guitarras */
  { id: 'g1', tag: 'TENDENCIA',tagClass: 'new',  brand: 'Fender',           name: 'Stratocaster Player Plus', price: 5450000, was: null,    visual: 'guitar', kind: 'guitar', cat: 'guitarras' },
  { id: 'g2', tag: '-15%',     tagClass: 'sale', brand: 'Gibson',           name: 'Les Paul Studio Ebony',    price: 9990000, was: 11750000, visual: 'guitar', kind: 'guitar', cat: 'guitarras' },
  { id: 'g3', tag: 'NUEVO',    tagClass: 'new',  brand: 'Taylor',           name: '214ce Electroacústica',  price: 6850000, was: null,     visual: 'guitar', kind: 'guitar', cat: 'guitarras' },
  { id: 'g4', tag: 'OFICIAL',  tagClass: '',     brand: 'PRS',              name: 'SE Custom 24 Sapphire',    price: 4980000, was: null,     visual: 'guitar', kind: 'guitar', cat: 'guitarras' },
  /* Bajos */
  { id: 'b1', tag: 'CODICIADO',tagClass: '',     brand: 'Yamaha',           name: 'TRBX604 Activo 4 cuerdas', price: 3990000, was: null,    visual: 'bass', kind: 'bass', cat: 'bajos' },
  { id: 'b2', tag: '-18%',     tagClass: 'sale', brand: 'Fender',           name: 'Player Precision Bass',    price: 5320000, was: 6480000, visual: 'bass', kind: 'bass', cat: 'bajos' },
  { id: 'b3', tag: 'NUEVO',    tagClass: 'new',  brand: 'Ibanez',           name: 'SR500 Walnut 5 cuerdas',   price: 4290000, was: null,    visual: 'bass', kind: 'bass', cat: 'bajos' },
  /* Baterías */
  { id: 'd1', tag: 'BEST',     tagClass: 'new',  brand: 'Pearl',            name: 'Export 5pc Sunset',         price: 8200000, was: null,    visual: 'drums', kind: 'drums', cat: 'baterias' },
  { id: 'd2', tag: '-22%',     tagClass: 'sale', brand: 'Pearl',            name: 'Export 5pc Negro',          price: 6580000, was: 8430000, visual: 'drums', kind: 'drums', cat: 'baterias' },
  { id: 'd3', tag: 'NUEVO',    tagClass: 'new',  brand: 'Roland',           name: 'TD-07KV E-Drum Kit',        price: 7990000, was: null,    visual: 'drums', kind: 'drums', cat: 'baterias' },
  /* Sonido / Electrónica */
  { id: 'e1', tag: '-20%',     tagClass: 'sale', brand: 'JBL',              name: 'EON 715 Activo 1300W',      price: 4920000, was: 6150000, visual: 'speaker', kind: 'speaker', cat: 'electronica' },
  { id: 'e2', tag: 'NUEVO',    tagClass: 'new',  brand: 'Shure',            name: 'SM58 Micrófono Dinámico',  price: 690000, was: null,     visual: 'speaker', kind: 'speaker', cat: 'electronica' },
  { id: 'e3', tag: 'OFICIAL',  tagClass: '',     brand: 'Yamaha',           name: 'MG10XU Mezcladora 10 ch',   price: 1480000, was: null,    visual: 'speaker', kind: 'speaker', cat: 'electronica' },
  /* Accesorios — Parrillas */
  { id: 'pa1', tag: 'NUEVO',  tagClass: 'new',  brand: 'Hohner',           name: 'Parrilla Metal Cromada Corona III', price: 420000, was: null, visual: 'pearl', kind: 'acc', cat: 'parrillas' },
  { id: 'pa2', tag: 'BEST',   tagClass: 'new',  brand: 'Taller VDA',       name: 'Parrilla Estampada Dorada',         price: 580000, was: null, visual: 'gold',  kind: 'acc', cat: 'parrillas' },
  { id: 'pa3', tag: '-15%',   tagClass: 'sale', brand: 'Hohner Oficial',   name: 'Parrilla Plástico Anacleto',        price: 195000, was: 230000, visual: 'onyx', kind: 'acc', cat: 'parrillas' },
  /* Accesorios — Correas */
  { id: 'co1', tag: 'NUEVO',  tagClass: 'new',  brand: 'Talabartería Cesar', name: 'Correa Cuero Vallenato Premium', price: 380000, was: null, visual: 'cuero', kind: 'acc', cat: 'correas' },
  { id: 'co2', tag: 'BEST',   tagClass: 'new',  brand: 'Levy\'s',          name: 'Correa Cuero Repujado',             price: 290000, was: null, visual: 'rojo',  kind: 'acc', cat: 'correas' },
  { id: 'co3', tag: '-10%',   tagClass: 'sale', brand: 'Neotech',          name: 'Correa Acolchada Profesional',      price: 165000, was: 185000, visual: 'onyx', kind: 'acc', cat: 'correas' },
  /* Accesorios — Fuelles */
  { id: 'fu1', tag: 'ORIGINAL', tagClass: '',   brand: 'Hohner',           name: 'Fuelle Original Hohner Corona II', price: 1450000, was: null, visual: 'pearl', kind: 'acc', cat: 'fuelles' },
  { id: 'fu2', tag: 'NUEVO',  tagClass: 'new',  brand: 'Voci Armoniche',   name: 'Fuelle Italiano Premium',          price: 1180000, was: null, visual: 'onyx', kind: 'acc', cat: 'fuelles' },
  /* Accesorios — Estuches */
  { id: 'es1', tag: 'BEST',   tagClass: 'new',  brand: 'Maletas Andinas',  name: 'Estuche Rígido Profesional',        price: 890000, was: null, visual: 'onyx', kind: 'acc', cat: 'estuches' },
  { id: 'es2', tag: 'NUEVO',  tagClass: 'new',  brand: 'Gator',            name: 'Estuche ABS con Ruedas',            price: 1290000, was: null, visual: 'onyx', kind: 'acc', cat: 'estuches' },
  { id: 'es3', tag: '-20%',   tagClass: 'sale', brand: 'Levy\'s',          name: 'Funda Gigbag Acolchada',            price: 320000, was: 400000, visual: 'pearl', kind: 'acc', cat: 'estuches' },
  /* Accesorios — Broches */
  { id: 'br1', tag: 'ORIGINAL', tagClass: '',   brand: 'Hohner',           name: 'Set Broches Metálicos Corona III', price: 95000, was: null, visual: 'gold', kind: 'acc', cat: 'broches' },
  { id: 'br2', tag: 'NUEVO',  tagClass: 'new',  brand: 'Taller VDA',       name: 'Palomillas Dorado Vallenato',       price: 78000, was: null, visual: 'gold', kind: 'acc', cat: 'broches' },
  /* Técnicos — Lengüetas */
  { id: 'le1', tag: 'A MANO', tagClass: 'new',  brand: 'Voci Armoniche',   name: 'Lengüetas a Mano Tipo A',           price: 980000, was: null, visual: 'pearl', kind: 'acc', cat: 'lenguetas' },
  { id: 'le2', tag: 'STD',    tagClass: '',     brand: 'Hohner',           name: 'Lengüetas a Máquina Set Completo', price: 540000, was: null, visual: 'pearl', kind: 'acc', cat: 'lenguetas' },
  { id: 'le3', tag: 'BEST',   tagClass: 'new',  brand: 'Salpa',            name: 'Lengüetas Italianas Profesional',   price: 1280000, was: null, visual: 'gold', kind: 'acc', cat: 'lenguetas' },
  /* Técnicos — Resortes */
  { id: 're1', tag: 'NUEVO',  tagClass: 'new',  brand: 'Hohner',           name: 'Set Resortes Teclado Corona III',   price: 145000, was: null, visual: 'pearl', kind: 'acc', cat: 'resortes' },
  { id: 're2', tag: 'BEST',   tagClass: 'new',  brand: 'Voci Armoniche',   name: 'Resortes Italianos Acero Templado', price: 195000, was: null, visual: 'onyx', kind: 'acc', cat: 'resortes' },
  /* Técnicos — Celuloide */
  { id: 'ce1', tag: 'NÁCAR',  tagClass: '',     brand: 'Italiano',         name: 'Celuloide Nácar Blanco 50x50cm',   price: 320000, was: null, visual: 'pearl', kind: 'acc', cat: 'celuloide' },
  { id: 'ce2', tag: 'NEGRO',  tagClass: '',     brand: 'Italiano',         name: 'Celuloide Negro Perla 50x50cm',    price: 280000, was: null, visual: 'onyx', kind: 'acc', cat: 'celuloide' },
  { id: 'ce3', tag: 'ROJO',   tagClass: '',     brand: 'Italiano',         name: 'Celuloide Rojo Perla 50x50cm',     price: 280000, was: null, visual: 'rojo', kind: 'acc', cat: 'celuloide' },
  /* Técnicos — Herramientas */
  { id: 'he1', tag: 'PRO',    tagClass: 'new',  brand: 'Taller VDA',       name: 'Set Llaves Afinación Acordeón',     price: 480000, was: null, visual: 'gold', kind: 'acc', cat: 'herramientas' },
  { id: 'he2', tag: 'NUEVO',  tagClass: 'new',  brand: 'Hohner',           name: 'Calibrador Lengüetas Profesional',  price: 320000, was: null, visual: 'onyx', kind: 'acc', cat: 'herramientas' },
  /* Pianos */
  { id: 'pi1', tag: 'NUEVO',  tagClass: 'new',  brand: 'Yamaha',           name: 'P-125 Piano Digital 88 Teclas',     price: 3490000, was: null, visual: 'onyx',    kind: 'speaker', cat: 'pianos' },
  { id: 'pi2', tag: 'OFICIAL', tagClass: '',    brand: 'Roland',           name: 'FP-30X Piano Digital Compacto',     price: 4290000, was: null, visual: 'onyx',    kind: 'speaker', cat: 'pianos' },
  /* Cursos */
  { id: 'k1', tag: 'NEW',      tagClass: 'new',  brand: 'Academia VDA',     name: 'Curso Acordeón Vallenato', price: 590000, was: null,     visual: 'pearl', kind: 'acc',     cat: 'cursos' },
];

/* Expose CATALOG so PDP can look up products */
window.CATALOG = CATALOG;

function CatalogProductCard({ p, onAdd }) {
  const [added, setAdded] = React.useState(false);
  const handle = (e) => { e.stopPropagation(); onAdd(p); setAdded(true); setTimeout(() => setAdded(false), 1400); };
  const open = () => { if (window.__navigate) window.__navigate('producto/' + p.id); };
  const Visual = window.ProductVisual;
  return (
    <article className="prod clickable" onClick={open}>
      <div className="prod-img">
        <span className={`prod-tag ${p.tagClass || ''}`}>{p.tag}</span>
        {Visual ? <Visual p={p} /> : <MiniAcc variant={p.visual} />}
      </div>
      <div className="prod-info">
        <div className="prod-brand">{p.brand}</div>
        <div className="prod-name">{p.name}</div>
        <div className="prod-meta">
          <div className="prod-price">
            <span className="now">{fmtCOP_p(p.price)}</span>
            {p.was && <span className="was">{fmtCOP_p(p.was)}</span>}
          </div>
          <button className={`prod-add ${added ? 'added' : ''}`} onClick={handle}>
            {added ? (<><Icon name="check" size={12} /> Añadido</>) : (<><Icon name="plus" size={12} /> Añadir</>)}
          </button>
        </div>
      </div>
    </article>
  );
}

const PAGE_META = {
  /* Acordeones */
  nuevos:         { title: 'Acordeones Nuevos',        crumb: 'Acordeones Nuevos', italic: 'la',  accent: 'Colección Maestro', intro: 'Acordeones diatónicos y cromáticos en stock, listos para enviar. Cada uno revisado y afinado en nuestro taller antes de salir.' },
  personalizados: { title: 'Personalizados',           crumb: 'Personalizados',    italic: 'tu',  accent: 'Acordeón a Medida', intro: 'Diseña el tuyo desde cero. Maderas, nácar, grabados y afinación a medida. Entrega en 6–8 semanas con renders previos.' },
  /* Accesorios */
  accesorios:     { title: 'Accesorios Acordeón',      crumb: 'Accesorios',        italic: 'los', accent: 'Indispensables',    intro: 'Todo lo que tu acordeón necesita: correas, estuches, parrillas, fuelles, broches y más. Stock permanente en Valledupar.' },
  parrillas:      { title: 'Parrillas',                crumb: 'Parrillas',         italic: 'tu',  accent: 'Sonido Personalizado', intro: 'Parrillas de repuesto en metal, estampado y diseños exclusivos. Mejora el sonido y la estética de tu acordeón.' },
  correas:        { title: 'Correas',                  crumb: 'Correas',           italic: 'cuero',accent: 'y Detalle',         intro: 'Correas de cuero genuino, sintéticas y de alto rendimiento. Hechas a mano en nuestro taller talabartero de Valledupar.' },
  fuelles:        { title: 'Fuelles',                  crumb: 'Fuelles',           italic: 'el',  accent: 'Corazón del Acordeón', intro: 'Fuelles originales Hohner y de reemplazo de alta calidad. Servicio de instalación disponible en nuestro taller.' },
  estuches:       { title: 'Estuches y Maletas',       crumb: 'Estuches',          italic: 'tu',  accent: 'Acordeón Protegido', intro: 'Estuches rígidos, semirígidos y fundas blandas. Modelos profesionales con espuma a la medida.' },
  broches:        { title: 'Broches y Cierres',        crumb: 'Broches',           italic: 'cada',accent: 'Detalle Importa',   intro: 'Broches metálicos, palomillas y cierres de seguridad de repuesto. Originales y compatibles.' },
  /* Técnicos */
  tecnicos:       { title: 'Para Técnicos',            crumb: 'Para Técnicos',     italic: 'tu',  accent: 'Taller Profesional', intro: 'Surtimos talleres de afinación y reparación en toda Latinoamérica. Despacho directo desde Valledupar con factura y garantía.' },
  lenguetas:      { title: 'Lengüetas',                crumb: 'Lengüetas',         italic: 'a',   accent: 'Mano y Máquina',     intro: 'Lengüetas originales Hohner, Voci Armoniche y Salpa. Calidades a mano (profesional) y a máquina (intermedio). Servicio personalizado por modelo.' },
  resortes:       { title: 'Resortes',                 crumb: 'Resortes',          italic: 'acero',accent: 'Templado Europeo',   intro: 'Resortes de teclado, bajos y registro para todos los modelos Hohner, Compadre, Anacleto y Corona.' },
  celuloide:      { title: 'Celuloide',                crumb: 'Celuloide',         italic: 'el',  accent: 'Acabado Clásico',    intro: 'Hojas de celuloide nácar blanco, negro, rojo perla y colores especiales. Para restauración y personalización.' },
  herramientas:   { title: 'Herramientas',             crumb: 'Herramientas',      italic: 'el',  accent: 'Equipo Profesional', intro: 'Set completo de herramientas profesionales para afinación y reparación. Llaves, alicates, calibradores.' },
  /* Otros instrumentos */
  otros:          { title: 'Otros Instrumentos',       crumb: 'Otros Instrumentos',italic: 'para',accent: 'Músicos Serios',     intro: 'También somos distribuidores oficiales de pianos, guitarras, bajos, baterías y equipos de sonido profesional.' },
  pianos:         { title: 'Pianos y Teclados',        crumb: 'Pianos',            italic: 'la',  accent: 'Línea Pro',          intro: 'Pianos digitales, acústicos verticales y teclados profesionales Yamaha, Roland, Kawai y Casio.' },
  guitarras:      { title: 'Guitarras',                crumb: 'Guitarras',         italic: 'la',  accent: 'Cuerda Clásica',    intro: 'Eléctricas, acústicas y electroacústicas. Fender, Gibson, Taylor, PRS y más. Distribuidores oficiales con garantía de fábrica.' },
  bajos:          { title: 'Bajos Eléctricos',         crumb: 'Bajos',             italic: 'la',  accent: 'Línea Grave',      intro: 'Bajos de 4, 5 y 6 cuerdas, activos y pasivos. Fender, Yamaha, Ibanez y Music Man. Para ensayo, escenario y estudio.' },
  baterias:       { title: 'Baterías',                 crumb: 'Baterías',          italic: 'el',  accent: 'Ritmo Total',      intro: 'Baterías acústicas Pearl, Yamaha, Tama y E-Drums Roland y Alesis. Sets completos, parches, herrajes y platillos.' },
  electronica:    { title: 'Sonido y Electrónica',     crumb: 'Sonido',            italic: 'tu',  accent: 'Sonido Profesional', intro: 'Micrófonos, mezcladoras, monitores, amplificadores y procesadores. JBL, Shure, Yamaha, Behringer y más.' },
  cursos:         { title: 'Cursos Online',            crumb: 'Cursos',            italic: 'el',  accent: 'Oficio Vallenato', intro: 'Aprende con los maestros Egidio Cuadrado, Cocha Molina y Andrés Mendoza. Doce módulos online, certificado y comunidad.' },
};

function CatalogPage({ catKey, navigate, onAdd }) {
  const meta = PAGE_META[catKey] || PAGE_META.nuevos;
  const [sort, setSort] = React.useState('relevancia');
  const [brands, setBrands] = React.useState({});
  const [priceRange, setPriceRange] = React.useState('all');
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const products = React.useMemo(() => {
    let list = catKey === 'all' ? CATALOG : CATALOG.filter(p => p.cat === catKey);
    // do NOT fallback to all CATALOG when empty for a real category — just show empty state
    const activeBrands = Object.keys(brands).filter(k => brands[k]);
    if (activeBrands.length) list = list.filter(p => activeBrands.some(b => p.brand.toLowerCase().includes(b.toLowerCase())));
    if (priceRange === '<5m') list = list.filter(p => p.price < 5_000_000);
    if (priceRange === '5-10') list = list.filter(p => p.price >= 5_000_000 && p.price < 10_000_000);
    if (priceRange === '>10') list = list.filter(p => p.price >= 10_000_000);
    list = [...list];
    if (sort === 'precio-asc') list.sort((a,b) => a.price - b.price);
    if (sort === 'precio-desc') list.sort((a,b) => b.price - a.price);
    if (sort === 'nombre') list.sort((a,b) => a.name.localeCompare(b.name));
    return list;
  }, [catKey, sort, brands, priceRange]);

  const allBrands = ['Hohner', 'Compadre', 'Corona', 'Anacleto', 'Fender', 'Gibson', 'Taylor', 'Yamaha', 'Ibanez', 'Pearl', 'Roland', 'JBL', 'Shure'];

  return (
    <div className="page">
      <div className="page-hero">
        <div className="page-crumbs">
          <a onClick={() => navigate('home')}>Inicio</a>
          <span className="sep">/</span>
          <a onClick={() => navigate('catalogo')}>Catálogo</a>
          <span className="sep">/</span>
          <span className="current">{meta.crumb}</span>
        </div>
        <div className="page-eyebrow">— {products.length} resultados</div>
        <h1 className="page-title">
          {meta.title.split(' ')[0]} <span className="italic">{meta.italic}</span> <span className="accent">{meta.accent}</span>
        </h1>
        <p className="page-intro">{meta.intro}</p>
      </div>

      <div className="catalog-layout">
        <aside className={`cat-filters ${filtersOpen ? 'open' : ''}`}>
          <div className="filter-block">
            <h5>Categoría</h5>
            <div className="filter-group-label">Acordeones</div>
            {[
              { id: 'all',            label: 'Todas' },
              { id: 'nuevos',         label: 'Acordeones' },
              { id: 'personalizados', label: 'Personalizados' },
            ].map(c => (
              <label key={c.id}>
                <input type="radio" name="cat" checked={catKey === c.id || (c.id === 'all' && catKey === 'all')} onChange={() => navigate(c.id === 'all' ? 'catalogo' : c.id)} />
                <span>{c.label}</span>
              </label>
            ))}
            <div className="filter-group-label">Accesorios</div>
            {[
              { id: 'parrillas', label: 'Parrillas' },
              { id: 'correas',   label: 'Correas' },
              { id: 'fuelles',   label: 'Fuelles' },
              { id: 'estuches',  label: 'Estuches' },
              { id: 'broches',   label: 'Broches' },
            ].map(c => (
              <label key={c.id}>
                <input type="radio" name="cat" checked={catKey === c.id} onChange={() => navigate(c.id)} />
                <span>{c.label}</span>
              </label>
            ))}
            <div className="filter-group-label">Para Técnicos</div>
            {[
              { id: 'lenguetas',    label: 'Lengüetas' },
              { id: 'resortes',     label: 'Resortes' },
              { id: 'celuloide',    label: 'Celuloide' },
              { id: 'herramientas', label: 'Herramientas' },
            ].map(c => (
              <label key={c.id}>
                <input type="radio" name="cat" checked={catKey === c.id} onChange={() => navigate(c.id)} />
                <span>{c.label}</span>
              </label>
            ))}
            <div className="filter-group-label">Otros</div>
            {[
              { id: 'pianos',     label: 'Pianos' },
              { id: 'guitarras',  label: 'Guitarras' },
              { id: 'bajos',      label: 'Bajos' },
              { id: 'baterias',   label: 'Baterías' },
              { id: 'electronica', label: 'Sonido' },
              { id: 'cursos',     label: 'Cursos' },
            ].map(c => (
              <label key={c.id}>
                <input type="radio" name="cat" checked={catKey === c.id} onChange={() => navigate(c.id)} />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
          <div className="filter-block">
            <h5>Marca</h5>
            {allBrands.map(b => (
              <label key={b}>
                <input type="checkbox" checked={!!brands[b]} onChange={(e) => setBrands(prev => ({...prev, [b]: e.target.checked}))} />
                <span>{b}</span>
                <span className="ct">{CATALOG.filter(p => p.brand.toLowerCase().includes(b.toLowerCase())).length}</span>
              </label>
            ))}
          </div>
          <div className="filter-block">
            <h5>Precio</h5>
            {[
              { id: 'all',  label: 'Cualquiera' },
              { id: '<5m',  label: 'Menos de $5M' },
              { id: '5-10', label: '$5M – $10M' },
              { id: '>10',  label: 'Más de $10M' },
            ].map(p => (
              <label key={p.id}>
                <input type="radio" name="price" checked={priceRange === p.id} onChange={() => setPriceRange(p.id)} />
                <span>{p.label}</span>
              </label>
            ))}
          </div>
        </aside>

        <div className="cat-results">
          <div className="results-bar">
            <div className="count">
              Mostrando <strong>{products.length}</strong> de <strong>{CATALOG.length}</strong>
            </div>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="relevancia">Relevancia</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre A–Z</option>
            </select>
          </div>
          <div className="prod-grid">
            {products.map(p => (
              <CatalogProductCard key={p.id} p={p} onAdd={onAdd} />
            ))}
          </div>
          {products.length === 0 && (
            <div className="stub-page" style={{ padding: '40px 0' }}>
              <h2>Sin Resultados</h2>
              <p>Prueba con otros filtros o quita algunos.</p>
              <div className="stub-actions">
                <button className="btn btn-ghost" onClick={() => { setBrands({}); setPriceRange('all'); }}>
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========== Contact Page =========== */
function ContactPage({ navigate, onWA, toast }) {
  const [form, setForm] = React.useState({ nombre: '', email: '', tel: '', tema: 'general', msg: '' });
  const [sent, setSent] = React.useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.email) {
      toast?.('Completa los campos requeridos', 'Faltan datos');
      return;
    }
    toast?.('Mensaje enviado', 'Te responderemos en 24 horas');
    setSent(true);
    setForm({ nombre: '', email: '', tel: '', tema: 'general', msg: '' });
    setTimeout(() => setSent(false), 4000);
  };
  return (
    <div className="page">
      <div className="page-hero">
        <div className="page-crumbs">
          <a onClick={() => navigate('home')}>Inicio</a>
          <span className="sep">/</span>
          <span className="current">Contacto</span>
        </div>
        <div className="page-eyebrow">— Hablemos</div>
        <h1 className="page-title">
          ¿Cómo Te <span className="italic">podemos</span><br/>
          <span className="accent">Ayudar?</span>
        </h1>
        <p className="page-intro">
          Respondemos en menos de 24 horas. Si necesitas algo urgente, escríbenos directo por WhatsApp.
        </p>
      </div>
      <div className="contact-grid">
        <div className="contact-info">
          <div className="contact-card">
            <div className="ic"><Icon name="whatsapp" size={22} /></div>
            <div>
              <h4>WhatsApp</h4>
              <p><a href="https://wa.me/573001234567" target="_blank" rel="noreferrer">+57 300 123 4567</a></p>
            </div>
          </div>
          <div className="contact-card">
            <div className="ic"><Icon name="phone" size={22} /></div>
            <div>
              <h4>Teléfono</h4>
              <p><a href="tel:+5715712233">+57 1 571 2233</a> · Lun–Sab 8:00–18:00</p>
            </div>
          </div>
          <div className="contact-card">
            <div className="ic"><Icon name="globe" size={22} /></div>
            <div>
              <h4>Email</h4>
              <p><a href="mailto:hola@ventadeacordeones.com">hola@ventadeacordeones.com</a></p>
            </div>
          </div>
          <div className="contact-card">
            <div className="ic"><Icon name="shield" size={22} /></div>
            <div>
              <h4>Taller</h4>
              <p>Cra 9 #14-32 · Valledupar, Cesar · Colombia</p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={submit}>
          <h3>Envíanos un Mensaje</h3>
          <p className="sub">Cuéntanos qué buscas y te respondemos personalmente.</p>
          <div className="form-row two">
            <div className="field">
              <label>Nombre completo *</label>
              <input type="text" value={form.nombre} onChange={set('nombre')} placeholder="Tu nombre" />
            </div>
            <div className="field">
              <label>Email *</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="tu@email.com" />
            </div>
          </div>
          <div className="form-row two">
            <div className="field">
              <label>Teléfono</label>
              <input type="tel" value={form.tel} onChange={set('tel')} placeholder="+57 ___ ___ ____" />
            </div>
            <div className="field">
              <label>Tema</label>
              <select value={form.tema} onChange={set('tema')}>
                <option value="general">Consulta general</option>
                <option value="custom">Acordeón personalizado</option>
                <option value="reparacion">Reparación / afinación</option>
                <option value="mayoreo">Mayoristas / B2B</option>
                <option value="cursos">Cursos</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Mensaje</label>
              <textarea value={form.msg} onChange={set('msg')} placeholder="Cuéntanos qué necesitas…"></textarea>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {sent ? (<><Icon name="check" size={14} /> Enviado</>) : (<>Enviar Mensaje <span className="arrow"><Icon name="arrow" size={14} /></span></>)}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onWA}>
              <Icon name="whatsapp" size={14} /> O por WhatsApp
            </button>
            <span className="note">Respuesta en 24 horas</span>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========== Generic Stub Pages =========== */
function StubPage({ title, intro, icon = 'sparkle', crumb, navigate, onWA }) {
  return (
    <div className="page">
      <div className="page-hero">
        <div className="page-crumbs">
          <a onClick={() => navigate('home')}>Inicio</a>
          <span className="sep">/</span>
          <span className="current">{crumb || title}</span>
        </div>
        <div className="page-eyebrow">— En Construcción</div>
        <h1 className="page-title">{title}</h1>
        <p className="page-intro">{intro}</p>
      </div>
      <div className="stub-page">
        <div className="stub-icon"><Icon name={icon} size={40} /></div>
        <h2>Esta sección está en proceso</h2>
        <p>Estamos puliendo este apartado para que tenga el mismo nivel de detalle que el resto. Mientras tanto, escríbenos por WhatsApp o vuelve al inicio.</p>
        <div className="stub-actions">
          <button className="btn btn-primary" onClick={() => navigate('home')}>
            Volver al Inicio <span className="arrow"><Icon name="arrow" size={14} /></span>
          </button>
          <button className="btn btn-ghost" onClick={onWA}>
            <Icon name="whatsapp" size={14} /> Contactar
          </button>
        </div>
      </div>
    </div>
  );
}

window.AboutPage = AboutPage;
window.CatalogPage = CatalogPage;
window.ContactPage = ContactPage;
window.StubPage = StubPage;
