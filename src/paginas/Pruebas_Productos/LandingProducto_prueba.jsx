import React, { useState } from "react";

// Página de producto: SSL 2+ (Solid State Logic)
// Uso: importa y renderiza <PaginaProductoSSL2Mas /> en tu app.
// Estilos con TailwindCSS (no requiere imports adicionales si Tailwind está configurado en tu proyecto).
// Todo el copy está en español y listo para e‑commerce.

const formatCOP = (n) => n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

const BENEFICIOS = [
  { icon: "✅", text: "Preamps SSL con calidez analógica" },
  { icon: "⚡", text: "Grabación inmediata, plug & play" },
  { icon: "🎧", text: "Monitoreo directo sin latencia" },
  { icon: "🎶", text: "Incluye plugins premium de SSL" },
  { icon: "🖥️", text: "Compatible con PC, Mac y DAWs" },
];

const TESTIMONIOS = [
  { nombre: "Laura G.", ciudad: "Bogotá", texto: "Siempre me costaba lograr un sonido limpio, pero con la SSL 2+ mis voces suenan como de estudio. ¡Una locura!" },
  { nombre: "Carlos P.", ciudad: "Medellín", texto: "Probé interfaces baratas… ninguna me dio lo que buscaba. La SSL fue la solución definitiva." },
  { nombre: "Andrea M.", ciudad: "Cali", texto: "Produzco jingles y ahora mis clientes notan la diferencia. ¡Vale cada peso!" },
  { nombre: "Felipe R.", ciudad: "Barranquilla", texto: "La compré para mi home studio y terminé grabando un EP entero. Simplemente brutal." },
];

const FAQ = [
  { q: "¿Funciona con mi computador y DAW?", a: "Sí. Compatible con Windows y Mac, y con los principales DAWs como Ableton, FL Studio, Logic y Pro Tools." },
  { q: "¿Necesita drivers complicados?", a: "No. Se instala fácil y queda lista para grabar en minutos." },
  { q: "¿Incluye software?", a: "Sí. Viene con plugins y software de SSL para mezclar como un profesional." },
  { q: "¿Cuánto tarda el envío?", a: "En Colombia de 2 a 5 días hábiles. Te compartimos guía y soporte por WhatsApp." },
  { q: "¿Qué pasa si no me sirve?", a: "Tienes garantía y acompañamiento. Te ayudamos a configurarla o gestionamos devolución según política vigente." },
];

const MARCAS = [
  { nombre: "ProSound Master" },
  { nombre: "StudioLogic Gear" },
  { nombre: "AudioCore Pro" },
  { nombre: "MixCraft Elite" },
  { nombre: "SoundForge Studio" },
];

export default function PaginaProductoSSL2Mas() {
  const precioAntes = 1100000;
  const precioHoy = 899000;
  const [cantidad, setCantidad] = useState(1);

  const handleWhatsApp = () => {
    const texto = encodeURIComponent(
      `Hola, quiero comprar la SSL 2+ (Solid State Logic) x${cantidad} al precio de ${formatCOP(precioHoy)}. ¿Está disponible?`
    );
    // Reemplaza el teléfono con tu número de ventas de MeLlevoEsto (código país +57 si es Colombia)
    window.open(`https://wa.me/573001112233?text=${texto}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100">
      {/* Header simple */}
      <header className="sticky top-0 z-30 backdrop-blur bg-slate-900/70 border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20">
              <span className="text-xl">🎛️</span>
            </span>
            <h1 className="text-lg font-semibold tracking-tight">MeLlevoEsto.com</h1>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-300">
            <a className="hover:text-white transition" href="#beneficios">Beneficios</a>
            <a className="hover:text-white transition" href="#comparativa">Comparativa</a>
            <a className="hover:text-white transition" href="#reviews">Reseñas</a>
            <a className="hover:text-white transition" href="#faq">FAQ</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(60%_60%_at_50%_10%,rgba(16,185,129,0.20),rgba(15,23,42,0))]" />
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          {/* Texto */}
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-medium text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-4">
              Nuevo ingreso • Stock limitado
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Sonido Profesional, <span className="text-emerald-400">Sin Complicaciones</span>
            </h2>
            <p className="mt-4 text-slate-300/90 text-lg">
              La interfaz que convierte tu home studio en un estudio legendario. Tecnología de Solid State Logic en tu escritorio.
            </p>
            <ul className="mt-6 space-y-2">
              {[
                "🎚️ Preamplificadores SSL de calidad mundial",
                "🎧 Monitoreo directo con latencia ultrabaja",
                "🔊 Sonido cálido y claro en cada grabación",
                "⚡ Compatible con todos los DAWs",
                "🎶 Incluye software y plugins profesionales",
              ].map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-200">
                  <span className="mt-1">{b.split(" ")[0]}</span>
                  <span>{b.substring(b.indexOf(" ") + 1)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-slate-300">
              ¿Cansado de grabaciones planas y sin vida? La <strong>SSL 2+</strong> usa la misma filosofía de los mejores estudios del mundo, ahora a tu alcance. Conéctala, graba y siente la diferencia.
            </p>

            {/* Precio + CTA */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-end gap-6">
              <div>
                <div className="text-sm text-slate-400 line-through">Antes: {formatCOP(precioAntes)}</div>
                <div className="text-3xl md:text-4xl font-extrabold text-white">
                  Hoy: <span className="text-emerald-400">{formatCOP(precioHoy)}</span>
                </div>
                <p className="text-xs text-slate-400">Impuestos incluidos • Envío nacional</p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-300">Cantidad</label>
                <div className="inline-flex rounded-xl border border-slate-700 overflow-hidden">
                  <button
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                    className="px-3 py-2 hover:bg-slate-800"
                    aria-label="Disminuir"
                  >−</button>
                  <span className="px-4 py-2 min-w-[3rem] text-center font-semibold">{cantidad}</span>
                  <button
                    onClick={() => setCantidad((c) => c + 1)}
                    className="px-3 py-2 hover:bg-slate-800"
                    aria-label="Aumentar"
                  >+</button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-3 shadow-lg shadow-emerald-500/20 transition"
              >
                🔥 Comprar Ahora
              </button>
              <button
                onClick={handleWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 hover:border-emerald-400/70 text-emerald-300 hover:text-emerald-200 font-semibold px-6 py-3 transition"
              >
                🚀 Pide el tuyo Hoy
              </button>
            </div>

            {/* Marcas sugeridas */}
            <div className="mt-6 text-xs text-slate-400">
              Marcas comerciales que podrías usar para la ficha: {MARCAS.map(m => m.nombre).join(" • ")}
            </div>
          </div>

          {/* Imagen / Mock */}
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-emerald-500/10 blur-2xl" />
            <div className="relative rounded-3xl border border-slate-800 bg-slate-900 p-4 md:p-6 shadow-2xl">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 grid place-items-center border border-slate-700">
                <div className="text-center">
                  <div className="text-6xl">🎚️</div>
                  <p className="mt-2 text-sm text-slate-400">Consola / Interfaz SSL 2+<br />Solid State Logic</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {["Puertos balanceados", "2 entradas XLR/Line", "MIDI I/O"].map((t, i) => (
                  <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-center text-xs text-slate-300">
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios visuales */}
      <section id="beneficios" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h3 className="text-2xl md:text-3xl font-extrabold">Beneficios clave</h3>
        <p className="mt-2 text-slate-300/90">Lo importante para que tu mezcla y tus grabaciones suenen reales y profesionales.</p>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {BENEFICIOS.map((b, i) => (
            <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="text-2xl">{b.icon}</div>
              <div className="mt-2 text-sm font-medium text-slate-100">{b.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparativa */}
      <section id="comparativa" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
          <h3 className="text-2xl md:text-3xl font-extrabold">¿Por qué elegir SSL 2+?</h3>
          <p className="mt-2 text-slate-300/90">Comparada con interfaces genéricas, la SSL 2+ entrega más detalle, mejor headroom y un ecosistema de software superior.</p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-300">
                <tr className="border-b border-slate-800">
                  <th className="py-3 pr-4">Característica</th>
                  <th className="py-3 pr-4">SSL 2+</th>
                  <th className="py-3">Interfaz Genérica 🎛️</th>
                </tr>
              </thead>
              <tbody className="text-slate-200/90">
                <tr className="border-b border-slate-800/60">
                  <td className="py-3 pr-4">Calidad de preamplificadores</td>
                  <td className="py-3 pr-4">⭐ Alta gama SSL</td>
                  <td className="py-3">Estándar</td>
                </tr>
                <tr className="border-b border-slate-800/60">
                  <td className="py-3 pr-4">Plugins incluidos</td>
                  <td className="py-3 pr-4">🎶 SSL Native + DAW</td>
                  <td className="py-3">Limitados o nulos</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">Conectividad</td>
                  <td className="py-3 pr-4">🔌 2 salidas estéreo + MIDI</td>
                  <td className="py-3">Solo USB básico</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="reviews" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h3 className="text-2xl md:text-3xl font-extrabold">Lo que dicen quienes ya la usan</h3>
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {TESTIMONIOS.map((t, i) => (
            <article key={i} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-center gap-2 text-amber-400">★★★★★</div>
              <p className="mt-3 text-slate-200">“{t.texto}”</p>
              <p className="mt-2 text-xs text-slate-400">{t.nombre} – {t.ciudad}, Colombia</p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h3 className="text-2xl md:text-3xl font-extrabold">Preguntas frecuentes</h3>
        <div className="mt-6 space-y-4">
          {FAQ.map((f, i) => (
            <details key={i} className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <summary className="cursor-pointer list-none font-semibold text-slate-100 flex items-center justify-between">
                <span>{f.q}</span>
                <span className="text-slate-400 group-open:rotate-45 transition">＋</span>
              </summary>
              <p className="mt-3 text-slate-300/90">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Cierre */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl border border-emerald-600/30 bg-emerald-500/10 p-6 md:p-10 text-center">
          <h4 className="text-2xl md:text-3xl font-extrabold">
            No esperes a que se agote, pídela hoy mismo
          </h4>
          <p className="mt-3 text-slate-200/90">
            Cada día con un equipo básico es una mezcla que pudo sonar mejor. Da el salto a calidad profesional con SSL 2+.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleWhatsApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-6 py-3 shadow-lg shadow-emerald-500/20 transition"
            >
              🔥 Comprar Ahora
            </button>
            <button
              onClick={handleWhatsApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 hover:border-emerald-400/70 text-emerald-300 hover:text-emerald-200 font-semibold px-6 py-3 transition"
            >
              🚀 Pide el tuyo Hoy
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} MeLlevoEsto.com • Envíos a toda Colombia • Atención por WhatsApp
        </div>
      </footer>
    </main>
  );
}
