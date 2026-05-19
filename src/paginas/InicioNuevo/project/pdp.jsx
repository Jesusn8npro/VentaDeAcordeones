/* global React, Icon, MiniAcc, ProductVisual */

const fmtCOP_pdp = (n) => `$${n.toLocaleString('es-CO')}`;

/* ============ PRODUCT DETAIL PAGE ============ */
function ProductPage({ product, navigate, onAdd, toast }) {
  const [variantIdx, setVariantIdx] = React.useState(0);
  const [purchaseMode, setPurchaseMode] = React.useState('once');
  const [qty, setQty] = React.useState(1);
  const [activeImg, setActiveImg] = React.useState(0);
  const [accOpen, setAccOpen] = React.useState({ specs: true, includes: false, shipping: false, warranty: false });
  const [added, setAdded] = React.useState(false);

  if (!product) {
    return (
      <div className="page">
        <div className="stub-page">
          <h2>Producto no encontrado</h2>
          <p>El producto que buscas no existe o fue removido del catálogo.</p>
          <div className="stub-actions">
            <button className="btn btn-primary" onClick={() => navigate('catalogo')}>
              Ver Catálogo <span className="arrow"><Icon name="arrow" size={14} /></span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Variantes según el tipo de producto */
  const VARIANTS_BY_KIND = {
    acc: [
      { id: 'pearl',  label: 'Nácar Blanco', sub: 'Edición Clásica',   priceDelta: 0,       visual: 'pearl' },
      { id: 'onyx',   label: 'Ónix Negro',    sub: 'Edición Maestro',   priceDelta: 850000,  visual: 'onyx' },
      { id: 'rojo',   label: 'Rojo Perla',    sub: 'Edición Tradicional', priceDelta: 150000, visual: 'rojo' },
      { id: 'gold',   label: 'Dorado',        sub: 'Edición Limitada',   priceDelta: 1450000, visual: 'gold' },
    ],
    guitar: [
      { id: 'sunburst', label: 'Sunburst',   sub: 'Clásico',          priceDelta: 0,       visual: 'guitar' },
      { id: 'black',    label: 'Negro Mate', sub: 'Pro',              priceDelta: 380000,  visual: 'guitar' },
      { id: 'white',    label: 'Blanco Vintage', sub: 'Edición',     priceDelta: 280000,  visual: 'guitar' },
    ],
    bass: [
      { id: 'natural', label: 'Natural',     sub: 'Standard', priceDelta: 0,      visual: 'bass' },
      { id: 'black',   label: 'Negro',       sub: 'Pro',      priceDelta: 290000, visual: 'bass' },
    ],
    drums: [
      { id: 'sunset',  label: 'Sunset',  sub: 'Clásico', priceDelta: 0,      visual: 'drums' },
      { id: 'black',   label: 'Negro',   sub: 'Pro',     priceDelta: 480000, visual: 'drums' },
    ],
    speaker: [
      { id: 'default', label: 'Standard', sub: 'Pro', priceDelta: 0, visual: 'speaker' },
    ],
  };
  const variants = VARIANTS_BY_KIND[product.kind] || VARIANTS_BY_KIND.acc;
  const variant = variants[variantIdx] || variants[0];
  const basePrice = product.price + (variant.priceDelta || 0);
  const subscribePrice = Math.round(basePrice * 0.85 / 1000) * 1000; // -15% suscripción
  const displayPrice = purchaseMode === 'subscribe' ? subscribePrice : basePrice;
  const finalProduct = { ...product, visual: variant.visual, name: product.name + ' · ' + variant.label };

  const galleryThumbs = [0, 1, 2, 3, 4];

  const handleAdd = () => {
    const item = { ...finalProduct, price: displayPrice };
    for (let i = 0; i < qty; i++) onAdd(item);
    setAdded(true);
    toast?.('¡Añadido al carrito!', `${qty} × ${finalProduct.name}`);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    handleAdd();
    setTimeout(() => navigate('checkout'), 500);
  };

  const toggleAcc = (k) => setAccOpen(prev => ({ ...prev, [k]: !prev[k] }));

  const catLink = product.cat || 'nuevos';

  return (
    <div className="page pdp">
      <div className="page-hero" style={{ borderBottom: 'none', paddingBottom: 8 }}>
        <div className="page-crumbs">
          <a onClick={() => navigate('home')}>Inicio</a>
          <span className="sep">/</span>
          <a onClick={() => navigate('catalogo')}>Catálogo</a>
          <span className="sep">/</span>
          <a onClick={() => navigate(catLink)}>{catLink.charAt(0).toUpperCase() + catLink.slice(1)}</a>
          <span className="sep">/</span>
          <span className="current">{product.name}</span>
        </div>
      </div>

      <div className="pdp-layout">
        {/* Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-thumbs">
            {galleryThumbs.map(i => (
              <button
                key={i}
                className={`pdp-thumb ${activeImg === i ? 'active' : ''}`}
                onClick={() => setActiveImg(i)}
                aria-label={`Imagen ${i + 1}`}
              >
                <image-slot id={`pdp-thumb-${product.id}-${i}`} placeholder={`Foto ${i + 1}`} shape="rounded" radius="0"></image-slot>
                <div className="pdp-thumb-fallback">
                  <ProductVisual p={finalProduct} />
                </div>
              </button>
            ))}
          </div>
          <div className="pdp-main-image">
            <image-slot id={`pdp-main-${product.id}-${activeImg}`} placeholder="Foto principal del producto" shape="rounded" radius="0"></image-slot>
            <div className="pdp-main-fallback">
              <ProductVisual p={finalProduct} />
            </div>
            <span className="pdp-badge"><Icon name="star" size={11} /> Bestseller · {product.brand}</span>
            <button className="pdp-zoom" aria-label="Zoom"><Icon name="search" size={16} /></button>
          </div>
        </div>

        {/* Info column */}
        <div className="pdp-info">
          <div className="pdp-brand-pill">{product.brand}</div>
          <h1 className="pdp-title">{product.name}</h1>

          <div className="pdp-meta-row">
            <div className="pdp-stars">
              <span className="stars">★★★★★</span>
              <strong>4.9</strong>
              <span className="cnt">(247 reseñas)</span>
            </div>
            <div className="pdp-trust">
              <span className="trust-dot"></span>
              <strong>500+</strong> vendidos este mes
            </div>
          </div>

          <p className="pdp-desc">
            {product.kind === 'acc' && 'Acordeón vallenato de alta gama, afinado a mano por nuestros maestros lutieres en Valledupar. '}
            {product.kind === 'guitar' && 'Guitarra profesional con garantía oficial de fábrica. Setup hecho en nuestro taller antes de envío. '}
            {product.kind === 'bass' && 'Bajo eléctrico de calidad profesional, listo para escenario o estudio. '}
            {product.kind === 'drums' && 'Set de batería completo con herrajes y configuración profesional. '}
            {product.kind === 'speaker' && 'Equipo de sonido profesional con garantía y soporte técnico. '}
            Cada uno revisado pieza por pieza antes de salir del taller.
          </p>

          {/* Variant selector */}
          <div className="pdp-section">
            <div className="pdp-label">
              <span>ACABADO:</span>
              <strong>{variant.label}</strong>
            </div>
            <div className="pdp-variants">
              {variants.map((v, i) => (
                <button
                  key={v.id}
                  className={`pdp-variant ${i === variantIdx ? 'active' : ''}`}
                  onClick={() => setVariantIdx(i)}
                >
                  <div className="pdp-variant-swatch">
                    <ProductVisual p={{ ...product, visual: v.visual }} />
                  </div>
                  <div className="pdp-variant-info">
                    <span className="pdp-variant-name">{v.label}</span>
                    <span className="pdp-variant-sub">{v.sub}{v.priceDelta > 0 ? ` · +${fmtCOP_pdp(v.priceDelta)}` : ''}</span>
                  </div>
                  {i === variantIdx && <span className="pdp-variant-check"><Icon name="check" size={12} /></span>}
                </button>
              ))}
            </div>
          </div>

          {/* Purchase mode */}
          <div className="pdp-pricing">
            <button
              className={`pdp-mode ${purchaseMode === 'subscribe' ? 'active' : ''}`}
              onClick={() => setPurchaseMode('subscribe')}
            >
              {purchaseMode === 'subscribe' && <span className="pdp-mode-pop">MÁS POPULAR · -15%</span>}
              <div className="pdp-mode-label">CUOTAS / MES</div>
              <div className="pdp-mode-price">{fmtCOP_pdp(Math.round(subscribePrice / 12))}</div>
              <div className="pdp-mode-sub">12 cuotas sin interés · -15% pago anual</div>
            </button>
            <button
              className={`pdp-mode ${purchaseMode === 'once' ? 'active' : ''}`}
              onClick={() => setPurchaseMode('once')}
            >
              <div className="pdp-mode-label">PAGO ÚNICO</div>
              <div className="pdp-mode-price">{fmtCOP_pdp(basePrice)}</div>
              <div className="pdp-mode-sub">Entrega inmediata</div>
            </button>
          </div>

          <ul className="pdp-perks">
            <li><Icon name="check" size={14} /> Envío gratis a toda Colombia · 3-5 días hábiles</li>
            <li><Icon name="check" size={14} /> Cancelación sin penalidad · 30 días</li>
            <li><Icon name="check" size={14} /> Afinación al recibo incluida sin costo</li>
            <li><Icon name="check" size={14} /> Garantía estructural de 5 años</li>
          </ul>

          {/* Quantity + Add */}
          <div className="pdp-actions">
            <div className="pdp-qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Menos">
                <Icon name="minus" size={14} />
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} aria-label="Más">
                <Icon name="plus" size={14} />
              </button>
            </div>
            <button className={`pdp-cta ${added ? 'added' : ''}`} onClick={handleAdd}>
              {added ? (<><Icon name="check" size={14} /> AÑADIDO AL CARRITO</>) : (<>AÑADIR AL CARRITO <span className="arrow"><Icon name="arrow" size={14} /></span></>)}
            </button>
          </div>
          <button className="pdp-buynow" onClick={buyNow}>
            COMPRAR AHORA · {fmtCOP_pdp(displayPrice * qty)}
          </button>

          {/* Trust strip */}
          <div className="pdp-trust-strip">
            <div className="pdp-trust-item">
              <Icon name="truck" size={20} />
              <div>
                <strong>Envío Gratis</strong>
                <span>Compras +$1.500.000</span>
              </div>
            </div>
            <div className="pdp-trust-item">
              <Icon name="shield" size={20} />
              <div>
                <strong>Garantía 5 Años</strong>
                <span>Estructural + servicio</span>
              </div>
            </div>
            <div className="pdp-trust-item">
              <Icon name="pin" size={20} />
              <div>
                <strong>Hecho en Valledupar</strong>
                <span>Taller propio</span>
              </div>
            </div>
            <div className="pdp-trust-item">
              <Icon name="globe" size={20} />
              <div>
                <strong>Envíos a 42 países</strong>
                <span>Seguro de tránsito incluido</span>
              </div>
            </div>
          </div>

          {/* Accordions */}
          <div className="pdp-accordions">
            {[
              { key: 'specs', title: 'Especificaciones técnicas', content: (
                <div className="pdp-acc-body">
                  <div className="pdp-spec-row"><span>Marca</span><strong>{product.brand}</strong></div>
                  <div className="pdp-spec-row"><span>Modelo</span><strong>{product.name}</strong></div>
                  <div className="pdp-spec-row"><span>Acabado</span><strong>{variant.label}</strong></div>
                  {product.kind === 'acc' && <>
                    <div className="pdp-spec-row"><span>Teclas (mano derecha)</span><strong>31 botones · 3 hileras</strong></div>
                    <div className="pdp-spec-row"><span>Bajos</span><strong>12 botones</strong></div>
                    <div className="pdp-spec-row"><span>Afinación</span><strong>SOL / FA / DO (a elección)</strong></div>
                    <div className="pdp-spec-row"><span>Lengüetas</span><strong>Voci Armoniche a mano</strong></div>
                    <div className="pdp-spec-row"><span>Fuelle</span><strong>17 pliegues · cuero original</strong></div>
                    <div className="pdp-spec-row"><span>Peso</span><strong>3.8 kg</strong></div>
                    <div className="pdp-spec-row"><span>Origen</span><strong>Alemania · Afinado en Colombia</strong></div>
                  </>}
                  {product.kind !== 'acc' && <>
                    <div className="pdp-spec-row"><span>Origen</span><strong>Importado · Garantía oficial</strong></div>
                    <div className="pdp-spec-row"><span>Setup</span><strong>Hecho en taller VDA</strong></div>
                  </>}
                </div>
              )},
              { key: 'includes', title: 'Qué incluye', content: (
                <ul className="pdp-acc-body pdp-acc-list">
                  <li><Icon name="check" size={14} /> {product.name} unidad principal</li>
                  <li><Icon name="check" size={14} /> Estuche rígido profesional con espuma a medida</li>
                  <li><Icon name="check" size={14} /> Correa de cuero original</li>
                  <li><Icon name="check" size={14} /> Manual de usuario y certificado de afinación</li>
                  <li><Icon name="check" size={14} /> Paño de limpieza microfibra</li>
                  <li><Icon name="check" size={14} /> Tarjeta de garantía y soporte técnico de por vida</li>
                </ul>
              )},
              { key: 'shipping', title: 'Envíos y aduanas', content: (
                <div className="pdp-acc-body">
                  <p><strong>Colombia:</strong> 3–5 días hábiles. Envío gratis en compras superiores a $1.500.000. Aseguramos el 100% del valor declarado.</p>
                  <p><strong>Latinoamérica y EE.UU.:</strong> 7–12 días hábiles. Despacho con DHL/FedEx y seguimiento en línea.</p>
                  <p><strong>Europa y resto del mundo:</strong> 10–15 días. Incluye declaración aduanera y factura comercial bilingüe.</p>
                  <p>Aduanas e impuestos del país destino corren por cuenta del comprador. Cotizamos previamente sin compromiso.</p>
                </div>
              )},
              { key: 'warranty', title: 'Garantía y devoluciones', content: (
                <div className="pdp-acc-body">
                  <p><strong>5 años de garantía estructural</strong> contra defectos de fabricación, problemas de fuelle, lengüetas o herrajes en uso normal.</p>
                  <p><strong>30 días de devolución</strong> sin preguntas si el producto no es lo que esperabas. Te reembolsamos el 100% incluyendo el envío.</p>
                  <p><strong>Servicio técnico de por vida</strong> para clientes: afinación, ajuste, cambio de correa y limpieza profunda sin costo.</p>
                </div>
              )},
            ].map(item => (
              <div key={item.key} className={`pdp-acc ${accOpen[item.key] ? 'open' : ''}`}>
                <button className="pdp-acc-head" onClick={() => toggleAcc(item.key)}>
                  <span>{item.title}</span>
                  <Icon name={accOpen[item.key] ? 'minus' : 'plus'} size={14} />
                </button>
                {accOpen[item.key] && <div className="pdp-acc-content">{item.content}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews snippet */}
      <section className="section pdp-reviews">
        <div className="section-head">
          <div className="left reveal">
            <div className="eyebrow">— Reseñas Verificadas</div>
            <h2 className="display section-title">
              4.9 / 5 <span className="italic">en</span><br/>
              <span className="accent">247 Reseñas</span>
            </h2>
          </div>
          <div className="pdp-rating-bars">
            {[5,4,3,2,1].map(s => (
              <div key={s} className="pdp-rb">
                <span className="pdp-rb-stars">{'★'.repeat(s)}</span>
                <div className="pdp-rb-bar"><span style={{ width: s === 5 ? '88%' : s === 4 ? '9%' : s === 3 ? '2%' : '0.5%' }}></span></div>
                <span className="pdp-rb-cnt">{s === 5 ? 218 : s === 4 ? 22 : s === 3 ? 5 : s === 2 ? 1 : 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="tst-grid">
          {[
            { i: 'CR', name: 'Camilo R.', loc: 'Medellín, COL', text: 'Calidad impresionante. Llegó perfectamente afinado y empacado. El estuche es robusto y la correa de cuero un detalle hermoso. Cinco estrellas.', stars: 5 },
            { i: 'YM', name: 'Yulissa M.', loc: 'Miami, USA', text: 'Pedí desde Miami y en 8 días estaba en casa. Aduanas sin problemas, todo declarado correctamente. El sonido es de otro nivel.', stars: 5 },
            { i: 'LM', name: 'Luis E. M.', loc: 'Valledupar, COL', text: 'Conozco a estos maestros desde hace años. El acordeón vino con afinación personalizada para mi voz, tal como pedí.', stars: 5 },
          ].map((r, i) => (
            <div key={i} className="tst reveal" data-delay={i}>
              <div className="stars">{'★'.repeat(r.stars)}</div>
              <p className="text">"{r.text}"</p>
              <div className="tst-person">
                <div className="tst-avatar"><span>{r.i}</span></div>
                <div>
                  <div className="tst-name">{r.name}</div>
                  <div className="tst-loc">{r.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="pdp-rev-actions">
          <button className="btn btn-ghost">Ver las 247 reseñas <span className="arrow"><Icon name="arrow" size={14} /></span></button>
          <button className="btn btn-primary">Escribir reseña <span className="arrow"><Icon name="arrow" size={14} /></span></button>
        </div>
      </section>
    </div>
  );
}

window.ProductPage = ProductPage;
