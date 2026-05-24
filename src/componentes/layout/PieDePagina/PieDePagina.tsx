'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTema } from '@/contextos/ContextoTema'
import { I } from '../navIconos'
import './PieDePagina.css'

const NUMERO_WA = '573208492093'

const TESTIMONIALS = [
  { name: 'Carlos V.', city: 'Santa Marta', rating: 5, text: 'Servicio de otro mundo. Compré hace 3 años y siguen acompañándome.', avatar: 'CV' },
  { name: 'Lina M.',   city: 'Bogotá',      rating: 5, text: 'Importaron mi acordeón desde Italia en 2 semanas. Impecable.',      avatar: 'LM' },
  { name: 'Jorge O.',  city: 'Valledupar',  rating: 5, text: 'El taller dejó mi acordeón como nuevo en 4 días. Maestros reales.', avatar: 'JO' },
]

const STATS = [
  { k: '25',   s: 'AÑOS' },
  { k: '12K+', s: 'ENTREGADOS' },
  { k: '4.9★', s: 'EN RESEÑAS' },
  { k: '30+',  s: 'PAÍSES' },
]

const COLS = [
  { title: 'TIENDA',   links: [['Acordeones nuevos','/tienda'],['Personalizados','/acordeones-personalizados'],['Accesorios','/tienda'],['Repuestos','/tienda'],['Cursos','/tienda'],['Ofertas','/tienda']] },
  { title: 'SERVICIO', links: [['Taller y afinación','/tienda'],['Asesoría de compra','/contacto'],['Importación','/contacto'],['Garantía extendida','/tienda'],['Recogida a domicilio','/contacto'],['Centro de ayuda','/contacto']] },
  { title: 'EMPRESA',  links: [['Sobre nosotros','/quienes-somos'],['Nuestros maestros','/quienes-somos'],['Tienda Valledupar','/contacto'],['Trabaja con nosotros','/trabaja-con-nosotros'],['Festivales','/blog'],['Embajadores','/contacto']] },
] as const

function Stars({ n = 5 }: { n?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <I.Star key={i} className={`h-3 w-3 ${i < n ? 'text-gold' : 'text-white/15'}`} />
      ))}
    </div>
  )
}

function Logo({ light }: { light: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group" aria-label="Inicio">
      <span className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md bg-gold text-black shadow-[0_8px_24px_-12px_rgba(255,195,0,.8)] transition-transform group-hover:scale-[1.03]">
        <I.Accordion className="h-5 w-5 sm:h-6 sm:w-6" />
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-white border-2 border-black/80" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`cond text-[9px] sm:text-[11px] tracking-[0.28em] sm:tracking-[0.32em] font-semibold ${light ? 'text-ink-400' : 'text-gold/80'}`}>VENTA DE</span>
        <span className={`cond text-[17px] sm:text-[20px] font-extrabold tracking-[0.04em] sm:tracking-[0.06em] whitespace-nowrap ${light ? 'text-ink-900' : 'text-white'}`}>
          ACORDEONES<span className="text-gold">.</span>
        </span>
      </span>
    </Link>
  )
}

function FooterDivider({ light }: { light: boolean }) {
  return (
    <div className={`relative ${light ? 'bg-gradient-to-b from-ink-50 to-white' : 'bg-gradient-to-b from-black to-ink-900'}`}>
      <div className="h-[3px] bg-gradient-to-r from-transparent via-gold to-transparent" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-gold flex items-center justify-center shrink-0">
            <I.Accordion className="h-5 w-5 text-black" />
          </div>
          <div>
            <div className="cond text-[10px] tracking-[0.28em] font-bold text-gold">POR QUÉ COMPRAR AQUÍ</div>
            <h2 className={`cond text-[22px] sm:text-[26px] font-extrabold tracking-tight leading-none mt-0.5 ${light ? 'text-ink-900' : 'text-white'}`}>
              25 AÑOS HACIENDO SONAR EL <span className="text-gold">VALLENATO</span>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-5 sm:gap-6">
          {STATS.map((s) => (
            <div key={s.s} className="text-center sm:text-left">
              <div className="cond text-[20px] sm:text-[24px] font-extrabold text-gold leading-none">{s.k}</div>
              <div className={`text-[9px] sm:text-[10px] tracking-[0.16em] cond font-semibold mt-1 ${light ? 'text-ink-500' : 'text-white/55'}`}>{s.s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VipBanner() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setDone(true); setEmail('')
    setTimeout(() => setDone(false), 5000)
  }
  return (
    <div className="relative overflow-hidden bg-black">
      <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 15% 30%,rgba(255,195,0,.35) 0%,transparent 55%),radial-gradient(circle at 85% 70%,rgba(255,195,0,.18) 0%,transparent 50%)' }} />
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-14 grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 cond text-[10px] sm:text-[11px] tracking-[0.26em] font-bold text-gold px-3 py-1.5 rounded-full border border-gold/40 bg-gold/[.08]">
            <I.Trophy className="h-3.5 w-3.5" /> CLUB VIP · GRATIS
          </div>
          <h2 className="cond mt-3 text-[28px] sm:text-[40px] lg:text-[44px] font-extrabold leading-[0.95] tracking-tight text-white">
            10% OFF DE POR VIDA<br />
            <span className="text-gold">+ ENVÍO GRATIS SIEMPRE</span>
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-white/85">
            {['Acceso 48h antes a lanzamientos', 'Asesoría 1:1 con maestro', 'Eventos privados'].map((p) => (
              <li key={p} className="flex items-center gap-1.5">
                <span className="h-4 w-4 rounded-full bg-gold flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-black"><path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={submit} className="bg-black/60 backdrop-blur border border-gold/30 rounded-xl p-5 sm:p-6 shadow-[0_30px_80px_-20px_rgba(255,195,0,.35)]">
          <div className="cond text-[11px] tracking-[0.22em] font-bold text-gold mb-3 flex items-center gap-2">
            <I.Mail className="h-4 w-4" /> RECIBE TU CUPÓN AHORA
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="flex-1 h-12 px-4 rounded-md bg-white/[.06] border border-white/15 text-[14px] text-white placeholder-white/45 outline-none focus:border-gold transition-colors"
            />
            <button type="submit" className="cond bg-gold text-black font-extrabold tracking-[0.16em] text-[12px] h-12 px-5 rounded-md hover:bg-gold-300 transition-all active:scale-[0.98] inline-flex items-center justify-center gap-1.5 group shrink-0">
              {done ? '✓ ¡LISTO!' : 'ACTIVAR 10% OFF'}
              {!done && <I.ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
            </button>
          </div>
          <p className="text-[10px] text-white/45 mt-2.5 flex items-center gap-1.5">
            <I.Shield className="h-3 w-3 text-gold" /> Sin spam · Tu correo protegido · Cancela cuando quieras
          </p>
        </form>
      </div>
    </div>
  )
}

function TestimonialsCompact({ light }: { light: boolean }) {
  const surface = light ? 'bg-white' : 'bg-ink-900'
  const card    = light ? 'bg-ink-50 border-ink-100 hover:border-gold/40' : 'bg-white/[.02] border-white/10 hover:border-gold/40'
  return (
    <div className={`${surface} border-t ${light ? 'border-ink-100' : 'border-white/[.06]'}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <div className="cond text-[10px] tracking-[0.24em] font-bold text-gold flex items-center gap-2">
              <I.Quote className="h-3.5 w-3.5" /> RESEÑAS VERIFICADAS
            </div>
            <h3 className={`cond text-[20px] sm:text-[22px] font-extrabold tracking-tight mt-1 ${light ? 'text-ink-900' : 'text-white'}`}>
              +3.180 CLIENTES EN 30+ PAÍSES
            </h3>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="cond text-[24px] font-extrabold text-gold leading-none">4.9</div>
            <div>
              <Stars n={5} />
              <div className={`text-[10px] mt-0.5 ${light ? 'text-ink-500' : 'text-white/45'}`}>de 3.180 reseñas</div>
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className={`rounded-lg border ${card} p-4 transition-colors`}>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="h-9 w-9 rounded-full bg-gold text-black flex items-center justify-center cond font-extrabold text-[12px] shrink-0">{t.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className={`cond text-[13px] font-bold tracking-[0.04em] truncate ${light ? 'text-ink-900' : 'text-white'}`}>{t.name}</div>
                  <div className={`text-[10px] flex items-center gap-1.5 ${light ? 'text-ink-500' : 'text-white/45'}`}>
                    <I.Shield className="h-2.5 w-2.5 text-gold" /> Compra verificada · {t.city}
                  </div>
                </div>
              </div>
              <Stars n={t.rating} />
              <p className={`text-[12px] leading-relaxed mt-2 ${light ? 'text-ink-700' : 'text-white/75'}`}>"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LinksGrid({ light }: { light: boolean }) {
  const surface     = light ? 'bg-ink-50'  : 'bg-black'
  const muted       = light ? 'text-ink-500'      : 'text-white/55'
  const linkCls     = light ? 'text-ink-600 hover:text-ink-900' : 'text-white/65 hover:text-gold'
  const contactText = light ? 'text-ink-700 hover:text-ink-900' : 'text-white/75 hover:text-gold'
  return (
    <div className={`${surface} border-t ${light ? 'border-ink-100' : 'border-white/[.06]'}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 grid grid-cols-12 gap-8 lg:gap-12">
        <div className="col-span-12 lg:col-span-4 space-y-5">
          <Logo light={light} />
          <p className={`text-[13px] leading-relaxed max-w-sm ${muted}`}>La tienda especializada en acordeones diatónicos más grande de Colombia. Maestros, taller y comunidad.</p>
          <div className="space-y-2">
            <a href="tel:+573208492093" className={`flex items-center gap-2.5 text-[13px] transition-colors ${contactText}`}><I.Phone className="h-4 w-4 text-gold shrink-0" /> +57 320 849 2093</a>
            <a href="mailto:acordeon91@gmail.com" className={`flex items-center gap-2.5 text-[13px] transition-colors break-all ${contactText}`}><I.Mail className="h-4 w-4 text-gold shrink-0" /> acordeon91@gmail.com</a>
            <div className={`flex items-center gap-2.5 text-[13px] ${light ? 'text-ink-700' : 'text-white/75'}`}><I.Pin className="h-4 w-4 text-gold shrink-0" /> Valledupar, Colombia</div>
            <div className={`flex items-center gap-2.5 text-[13px] ${light ? 'text-ink-700' : 'text-white/75'}`}><I.Clock className="h-4 w-4 text-gold shrink-0" /> Lun–Sáb · 8 AM – 7 PM</div>
          </div>
          <div className="flex gap-2 pt-1">
            {[{ up: 'Disponible en', down: 'App Store' }, { up: 'Consíguelo en', down: 'Google Play' }].map((app) => (
              <a key={app.down} href="#" className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all ${light ? 'border-ink-200 hover:border-gold hover:bg-gold/5' : 'border-white/15 hover:border-gold hover:bg-gold/10'}`}>
                <I.App className="h-4 w-4 text-gold" />
                <div className="leading-tight">
                  <div className={`text-[8px] ${light ? 'text-ink-500' : 'text-white/55'}`}>{app.up}</div>
                  <div className={`cond text-[11px] font-bold tracking-wider ${light ? 'text-ink-900' : 'text-white'}`}>{app.down.toUpperCase()}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {COLS.map((col) => (
            <div key={col.title}>
              <div className="cond text-[11px] tracking-[0.22em] font-bold text-gold mb-3.5 flex items-center gap-2">
                <span className="h-px w-4 bg-gold inline-block" />{col.title}
              </div>
              <ul className="space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={label}><Link href={href} className={`text-[13px] inline-block transition-all hover:translate-x-0.5 ${linkCls}`}>{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FooterBottom({ light }: { light: boolean }) {
  const payments  = ['VISA','MC','AMEX','PSE','NEQUI','DAVIPLATA','EFECTY','BANCOLOMBIA','ADDI','MERCADO PAGO']
  const surface   = light ? 'bg-white border-ink-100'  : 'bg-black border-white/[.06]'
  const muted     = light ? 'text-ink-500'             : 'text-white/45'
  const paychip   = light ? 'text-ink-700 border-ink-200 bg-white hover:border-gold hover:text-gold' : 'text-white/80 border-white/15 bg-white/[.02] hover:border-gold/40 hover:text-gold'
  const sociItem  = light ? 'border-ink-200 text-ink-700 hover:bg-gold/10 hover:border-gold hover:text-gold' : 'border-white/15 text-white/85 hover:bg-gold/10 hover:border-gold hover:text-gold'
  const waHref    = `https://wa.me/${NUMERO_WA}?text=Hola,%20me%20interesa%20un%20acorde%C3%B3n`
  return (
    <>
      <div className={`${surface} border-t`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex flex-wrap items-center gap-1.5 max-w-3xl">
            <span className={`cond text-[10px] tracking-[0.2em] font-semibold mr-2 ${muted}`}>ACEPTAMOS</span>
            {payments.map((p) => (
              <span key={p} className={`cond text-[10px] tracking-[0.1em] font-bold px-2 py-1.5 rounded border transition-colors ${paychip}`}>{p}</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`cond text-[10px] tracking-[0.2em] font-semibold mr-1 ${muted}`}>SÍGUENOS</span>
            {[
              { Icon: I.Facebook,  label: 'Facebook',  href: '#' },
              { Icon: I.Instagram, label: 'Instagram', href: '#' },
              { Icon: I.Tiktok,    label: 'TikTok',    href: '#' },
              { Icon: I.Youtube,   label: 'YouTube',   href: '#' },
              { Icon: I.Whatsapp,  label: 'WhatsApp',  href: waHref },
            ].map(({ Icon, label, href }) => (
              <a key={label} href={href} aria-label={label} className={`h-8 w-8 rounded-md border flex items-center justify-center transition-all ${sociItem}`}>
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className={`${light ? 'bg-ink-50 border-ink-100' : 'bg-black border-white/[.06]'} border-t`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className={`text-[11px] text-center sm:text-left ${muted}`}>
            © 2026 <span className={light ? 'text-ink-700 font-semibold' : 'text-white/80 font-semibold'}>Venta de Acordeones S.A.S.</span> · NIT 901.234.567-8
          </div>
          <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] ${muted}`}>
            <Link href="/terminos" className="hover:text-gold transition-colors">Términos</Link>
            <span className="opacity-30">·</span>
            <Link href="/privacidad" className="hover:text-gold transition-colors">Privacidad</Link>
            <span className="opacity-30">·</span>
            <Link href="/cookies" className="hover:text-gold transition-colors">Cookies</Link>
            <span className="opacity-30">·</span>
            <span className="inline-flex items-center gap-1.5">
              <I.Globe className="h-3 w-3" />
              <select className={`bg-transparent cursor-pointer outline-none cond text-[11px] tracking-wider transition-colors ${light ? 'text-ink-700 hover:text-gold' : 'text-white/70 hover:text-gold'}`}>
                <option>ES · COP</option>
                <option>ES · USD</option>
                <option>ES · MXN</option>
                <option>EN · USD</option>
              </select>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

function BackToTop({ light }: { light: boolean }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 600)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  if (!show) return null
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-24 right-6 z-50 h-11 w-11 rounded-full border transition-all active:scale-95 pie-fade-in flex items-center justify-center ${
        light
          ? 'bg-white border-gold/60 text-gold hover:bg-gold hover:text-black shadow-lg'
          : 'bg-black border-gold/50 text-gold hover:bg-gold hover:text-black shadow-[0_10px_30px_-10px_rgba(255,195,0,.5)]'
      }`}
      aria-label="Volver arriba"
    >
      <I.ArrowUp className="h-4 w-4" />
    </button>
  )
}

export default function PieDePagina() {
  const { tema } = useTema()
  const light = tema === 'light'
  return (
    <>
      <footer className={`${light ? 'text-ink-900' : 'text-white'} relative`}>
        <FooterDivider light={light} />
        <VipBanner />
        <TestimonialsCompact light={light} />
        <LinksGrid light={light} />
        <FooterBottom light={light} />
      </footer>
      <BackToTop light={light} />
    </>
  )
}
