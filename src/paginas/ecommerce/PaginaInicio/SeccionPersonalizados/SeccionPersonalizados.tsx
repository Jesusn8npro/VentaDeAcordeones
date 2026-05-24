'use client'

import Image from 'next/image'
import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'

const NUMERO_WA = '573208492093'
const BASE = 'https://ventadeacordeones.com/storage'

const IMGS_CUSTOM = [
  `${BASE}/2023/08/Acordeon-de-botones-de-dos-colores-600x600.jpg`,
  `${BASE}/2023/08/Acordeon-Blanco-HOHNER-ORIGINAL-600x600.jpg`,
  `${BASE}/2021/11/Acordeon-personalizado-Instagram.jpg`,
]

export default function SeccionPersonalizados() {
  return (
    <div className="custom-wrap" id="personalizados">
      <div className="custom">
        <div className="custom-visual">
          <span className="custom-corner-tag">EXPEDIENTE 0042 / EDICIÓN PRIVADA</span>
          <Image
            src={IMGS_CUSTOM[0]}
            alt="Acordeón personalizado de dos colores"
            width={420}
            height={420}
            style={{
              width: '60%',
              height: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 32px 64px rgba(0,0,0,0.85))',
              position: 'relative',
              zIndex: 2,
            }}
            priority
          />
          <span className="custom-spec s1">NÁCAR BLANCO MADREPERLA</span>
          <span className="custom-spec s2">GRABADO LÁSER · TU NOMBRE</span>
          <span className="custom-spec s3">ENTREGA 6–8 SEMANAS</span>
        </div>

        <div className="custom-content">
          <div className="eyebrow">— Personalizados</div>
          <h2 className="display custom-title">
            Diseña <span className="accent">el acordeón</span>
            <em className="italic"> que solo tú podrás tocar</em>
          </h2>
          <p className="custom-body">
            Trabajamos contigo de la mano: eliges madera, color, herrajes, grabados, nácar y afinación.
            Te enviamos renders 3D y bocetos hasta que sea perfecto. Después, el taller lo hace realidad
            en seis a ocho semanas.
          </p>
          <ul className="custom-list">
            <li>Sesión de diseño 1-a-1 con nuestro maestro lutier</li>
            <li>Renders 3D y aprobación digital antes de producción</li>
            <li>Grabado de tu nombre, escudo o firma en el cuerpo</li>
            <li>Estuche rígido personalizado y certificado de autoría</li>
          </ul>
          <div className="custom-ctas">
            <a
              href={`https://wa.me/${NUMERO_WA}?text=Hola%2C%20quiero%20dise%C3%B1ar%20mi%20acorde%C3%B3n%20personalizado`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <Icono nombre="whatsapp" tamaño={14} />
              Hablar por WhatsApp
            </a>
            <Link href="/acordeones-personalizados" className="btn btn-ghost">
              Ver galería
              <span className="arrow"><Icono nombre="flecha" tamaño={14} /></span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
