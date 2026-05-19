/* global React */
const { useEffect: useEM, useRef: useRM, useState: useSM } = React;

/* ===== Motion helpers (Framer-Motion style, vanilla) ===== */

/* Magnetic button: cursor pulls the element ~8-14px on hover */
function useMagnetic(strength = 12) {
  const ref = useRM(null);
  useEM(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      const max = strength;
      const tx = Math.max(-max, Math.min(max, x * 0.3));
      const ty = Math.max(-max, Math.min(max, y * 0.3));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${tx}px`);
        el.style.setProperty('--my', `${ty}px`);
      });
    };
    const onLeave = () => {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);
  return ref;
}

function Magnetic({ children, strength = 12, as = 'div', className = '', ...rest }) {
  const ref = useMagnetic(strength);
  const Tag = as;
  return (
    <Tag ref={ref} className={`magnet ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* Tilt card: perspective rotateX/Y on mousemove */
function useTilt(max = 6) {
  const ref = useRM(null);
  useEM(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`);
        el.style.setProperty('--gx', `${(px * 100 + 50).toFixed(2)}%`);
        el.style.setProperty('--gy', `${(py * 100 + 50).toFixed(2)}%`);
      });
    };
    const onLeave = () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [max]);
  return ref;
}

function Tilt({ children, max = 6, className = '', as = 'div', ...rest }) {
  const ref = useTilt(max);
  const Tag = as;
  return <Tag ref={ref} className={`tilt ${className}`} {...rest}>{children}</Tag>;
}

/* Count-up: smooth easeOut count to target */
function Counter({ to, duration = 1800, prefix = '', suffix = '', decimals = 0, className = '' }) {
  const [val, setVal] = useSM(0);
  const ref = useRM(null);
  const started = useRM(false);
  useEM(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setVal(eased * to);
            if (t < 1) requestAnimationFrame(step);
            else setVal(to);
          };
          requestAnimationFrame(step);
        }
      });
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [to, duration]);
  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('es-CO');
  return <span ref={ref} className={className}>{prefix}{display}{suffix}</span>;
}

/* Scroll progress bar (top) */
function ScrollProgress() {
  const [pct, setPct] = useSM(0);
  useEM(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setPct(Math.max(0, Math.min(1, window.scrollY / h)));
    };
    window.addEventListener('scroll', on, { passive: true });
    on();
    return () => window.removeEventListener('scroll', on);
  }, []);
  return <div className="scroll-progress" style={{ transform: `scaleX(${pct})` }}></div>;
}

/* Cursor-follow glow on hero */
function useCursorGlow(ref) {
  useEM(() => {
    const el = ref?.current;
    if (!el) return;
    const on = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--cx', `${e.clientX - r.left}px`);
      el.style.setProperty('--cy', `${e.clientY - r.top}px`);
    };
    el.addEventListener('mousemove', on);
    return () => el.removeEventListener('mousemove', on);
  }, [ref]);
}

/* Page transition wrapper: re-trigger CSS animation on route change */
function PageTransition({ routeKey, children }) {
  return (
    <div className="route-transition" key={routeKey}>
      {children}
    </div>
  );
}

window.Magnetic = Magnetic;
window.Tilt = Tilt;
window.Counter = Counter;
window.ScrollProgress = ScrollProgress;
window.PageTransition = PageTransition;
window.useCursorGlow = useCursorGlow;
