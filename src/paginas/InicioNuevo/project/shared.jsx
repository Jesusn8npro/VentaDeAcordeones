/* global React, Icon */
const { useState: useStateS, useEffect: useEffectS } = React;

/* ============ Accordion Art ============ */
function AccordionArt({ variant }) {
  return (
    <div className={`acc ${variant ? 'var-' + variant : ''}`}>
      <div className="acc-body">
        <div className="acc-head top">
          <div className="keys">
            {Array.from({length: 15}).map((_, i) => <i key={i} />)}
          </div>
        </div>
        <div className="acc-bellows">
          <span className="strap l"></span>
          <span className="strap r"></span>
        </div>
        <div className="acc-head bottom">
          <div className="keys">
            {Array.from({length: 12}).map((_, i) => <i key={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniAcc({ variant = '' }) {
  return (
    <div className={`mini-acc var-${variant}`}>
      <div className="h t"></div>
      <div className="b"></div>
      <div className="h b"></div>
    </div>
  );
}

/* ============ Cart Drawer ============ */
function CartDrawer({ open, onClose, items, setItems }) {
  const fmtCOP = (n) => `$${n.toLocaleString('es-CO')} COP`;
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const setQty = (id, delta) => {
    setItems(items.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };
  return (
    <>
      <div className={`cart-overlay ${open ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`cart-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="cart-head">
          <h3>Tu Carrito · {items.length}</h3>
          <button className="close" onClick={onClose} aria-label="Cerrar"><Icon name="x" size={16} /></button>
        </div>
        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div>
                <Icon name="cart" size={32} /><br/><br/>
                Tu carrito está vacío
              </div>
            </div>
          ) : items.map(it => (
            <div key={it.id} className="cart-item">
              <div className="thumb">
                <MiniAcc variant={it.visual} />
              </div>
              <div>
                <div className="name">{it.name}</div>
                <div className="price">{fmtCOP(it.price)}</div>
              </div>
              <div className="qty">
                <button onClick={() => setQty(it.id, -1)}><Icon name="minus" size={12} /></button>
                <span>{it.qty}</span>
                <button onClick={() => setQty(it.id, +1)}><Icon name="plus" size={12} /></button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="cart-foot">
            <div className="cart-total">
              <span className="lbl">Total</span>
              <span className="val">{fmtCOP(total)}</span>
            </div>
            <button className="btn btn-primary">
              Finalizar Compra <span className="arrow"><Icon name="arrow" size={14} /></span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

/* ============ Toasts ============ */
function ToastStack({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div className="toast" key={t.id}>
          <div className="ic"><Icon name="check" size={14} /></div>
          <div>
            <div className="t">{t.title}</div>
            <div className="s">{t.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

window.AccordionArt = AccordionArt;
window.MiniAcc = MiniAcc;
window.CartDrawer = CartDrawer;
window.ToastStack = ToastStack;
