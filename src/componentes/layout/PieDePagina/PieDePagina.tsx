'use client'

import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'
import './PieDePagina.css'

const NUMERO_WA = '573208492093'
const CORREO = 'acordeon91@gmail.com'

const COLUMNAS = [
  {
    titulo: 'Tienda',
    enlaces: [
      { etiqueta: 'Acordeones Nuevos',    href: '/tienda' },
      { etiqueta: 'Personalizados',        href: '/acordeones-personalizados' },
      { etiqueta: 'Accesorios',            href: '/tienda' },
      { etiqueta: 'Sonido y Electrónica',  href: '/tienda' },
      { etiqueta: 'Cursos Online',         href: '/tienda' },
    ],
  },
  {
    titulo: 'Compañía',
    enlaces: [
      { etiqueta: 'Sobre Nosotros',       href: '/quienes-somos' },
      { etiqueta: 'Sobre la Tienda',       href: '/sobre-la-tienda' },
      { etiqueta: 'Blog',                  href: '/blog' },
      { etiqueta: 'Trabaja con Nosotros',  href: '/trabaja-con-nosotros' },
      { etiqueta: 'Contacto',              href: '/contacto' },
    ],
  },
  {
    titulo: 'Soporte',
    enlaces: [
      { etiqueta: 'Política de Envío',            href: '/politica-envio' },
      { etiqueta: 'Garantía',                      href: '/preguntas-frecuentes' },
      { etiqueta: 'Cambios y Devoluciones',        href: '/cambios-devoluciones' },
      { etiqueta: 'Preguntas Frecuentes',          href: '/preguntas-frecuentes' },
      { etiqueta: 'Términos y Condiciones',        href: '/terminos-condiciones' },
    ],
  },
]

const METODOS_PAGO = ['VISA', 'MASTERCARD', 'AMEX', 'PSE', 'NEQUI', 'DAVIPLATA', 'MERCADO PAGO', 'EFECTIVO']

const REDES_SOCIALES = [
  { nombre: 'Instagram',  icono: 'ig',       href: 'https://instagram.com/ventadeacordeones' },
  { nombre: 'Facebook',   icono: 'fb',       href: 'https://facebook.com/ventadeacordeones' },
  { nombre: 'YouTube',    icono: 'yt',       href: 'https://youtube.com/@ventadeacordeones' },
  { nombre: 'TikTok',     icono: 'tiktok',   href: 'https://tiktok.com/@ventadeacordeones' },
  { nombre: 'WhatsApp',   icono: 'whatsapp', href: `https://wa.me/${NUMERO_WA}` },
]

export default function PieDePagina() {
  return (
    <footer className="pdp">
      <div className="pdp-superior">

        {/* Columna de marca */}
        <div className="pdp-marca">
          <Link href="/" className="pdp-logo">
            <div className="pdp-logo-marca"><span>V</span></div>
            <div className="pdp-logo-texto">
              VENTA<span className="pdp-logo-punto">·</span>ACORDEONES
              <small>VENTADEACORDEONES.COM</small>
            </div>
          </Link>
          <p className="pdp-desc">
            Acordeones vallenatos de alta gama, ensamblados a mano en nuestro taller de Valledupar.
            Distribuidores oficiales Hohner e importadores de instrumentos únicos.
          </p>
          <div className="pdp-redes">
            {REDES_SOCIALES.map((r) => (
              <a
                key={r.nombre}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={r.nombre}
                className="pdp-red"
              >
                <Icono nombre={r.icono} tamaño={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Columnas de navegación */}
        {COLUMNAS.map((col) => (
          <div key={col.titulo} className="pdp-columna">
            <h4 className="pdp-col-titulo">{col.titulo}</h4>
            <ul>
              {col.enlaces.map((e) => (
                <li key={e.etiqueta}>
                  <Link href={e.href}>{e.etiqueta}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Columna de contacto y pagos */}
        <div className="pdp-columna">
          <h4 className="pdp-col-titulo">Métodos de Pago</h4>
          <div className="pdp-pagos">
            {METODOS_PAGO.map((m) => (
              <span key={m} className="pdp-chip">{m}</span>
            ))}
          </div>
          <ul className="pdp-contacto">
            <li>
              <a href={`tel:+${NUMERO_WA}`}>+57 320 849 2093</a>
            </li>
            <li>
              <a href={`mailto:${CORREO}`}>{CORREO}</a>
            </li>
            <li>
              <Link href="/contacto">Cra 9 #14-32 · Valledupar, Cesar</Link>
            </li>
            <li>
              <a
                href={`https://wa.me/${NUMERO_WA}?text=Hola%2C%20tengo%20una%20consulta`}
                target="_blank"
                rel="noopener noreferrer"
                className="pdp-wa-link"
              >
                <Icono nombre="whatsapp" tamaño={14} />
                Escribir por WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="pdp-inferior">
        <span>© 2026 VENTADEACORDEONES.COM · TODOS LOS DERECHOS RESERVADOS</span>
        <span className="pdp-legal">
          <Link href="/politica-privacidad">Política de privacidad</Link>
          {' · '}
          <Link href="/terminos-condiciones">Términos</Link>
          {' · '}
          <Link href="/cambios-devoluciones">Devoluciones</Link>
        </span>
      </div>
    </footer>
  )
}
