import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook, Youtube } from 'lucide-react'
import './FooterPrincipal.css'

export default function FooterPrincipal() {
  const anio = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-contenedor">

        {/* Columna: Marca */}
        <div className="footer-marca">
          <img src="/logo.svg" alt="VentaDeAcordeones.com" className="footer-logo" />
          <p className="footer-desc">
            Más de 10 años vendiendo acordeones y accesorios musicales en Colombia.
            Tu instrumento ideal, a tu puerta.
          </p>
          <div className="footer-redes">
            <a href="https://wa.me/573208492093" target="_blank" rel="noopener noreferrer" className="footer-red whatsapp" aria-label="WhatsApp">
              <MessageCircle size={18} />
            </a>
            <a href="https://www.instagram.com/ventadeacordeones/" target="_blank" rel="noopener noreferrer" className="footer-red instagram" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://www.facebook.com/ventadeacordeones" target="_blank" rel="noopener noreferrer" className="footer-red facebook" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="https://www.youtube.com/@ventadeacordeones" target="_blank" rel="noopener noreferrer" className="footer-red youtube" aria-label="YouTube">
              <Youtube size={18} />
            </a>
          </div>
        </div>

        {/* Columna: Tienda */}
        <div className="footer-columna">
          <h3 className="footer-titulo">Tienda</h3>
          <ul className="footer-lista">
            <li><Link to="/tienda/categoria/acordeones-rey-vallenato">Acordeones Rey Vallenato</Link></li>
            <li><Link to="/tienda/categoria/acordeones-hohner-premium">Accordeones Hohner Premium</Link></li>
            <li><Link to="/tienda/categoria/acordeones-para-ninos">Acordeones para Niños</Link></li>
            <li><Link to="/tienda/categoria/acordeones-personalizados">Personalizados</Link></li>
            <li><Link to="/tienda/categoria/armonicas">Armónicas</Link></li>
            <li><Link to="/tienda/categoria/guitarras">Guitarras</Link></li>
            <li><Link to="/tienda/categoria/amplificadores">Amplificadores</Link></li>
            <li><Link to="/tienda">Ver todo el catálogo</Link></li>
          </ul>
        </div>

        {/* Columna: Información */}
        <div className="footer-columna">
          <h3 className="footer-titulo">Información</h3>
          <ul className="footer-lista">
            <li><Link to="/quienes-somos">Quiénes somos</Link></li>
            <li><Link to="/sobre-la-tienda">Sobre la tienda</Link></li>
            <li><Link to="/blog">Blog musical</Link></li>
            <li><Link to="/preguntas-frecuentes">Preguntas frecuentes</Link></li>
            <li><Link to="/ayuda">Centro de ayuda</Link></li>
            <li><Link to="/trabaja-con-nosotros">Trabaja con nosotros</Link></li>
          </ul>
        </div>

        {/* Columna: Legal */}
        <div className="footer-columna">
          <h3 className="footer-titulo">Legal</h3>
          <ul className="footer-lista">
            <li><Link to="/terminos-condiciones">Términos y condiciones</Link></li>
            <li><Link to="/politica-privacidad">Política de privacidad</Link></li>
            <li><Link to="/politica-envio">Política de envío</Link></li>
            <li><Link to="/cambios-devoluciones">Cambios y devoluciones</Link></li>
          </ul>
        </div>

        {/* Columna: Contacto */}
        <div className="footer-columna">
          <h3 className="footer-titulo">Contacto</h3>
          <ul className="footer-contacto-lista">
            <li>
              <a href="https://wa.me/573208492093" target="_blank" rel="noopener noreferrer">
                <MessageCircle size={15} />
                +57 320 849 2093
              </a>
            </li>
            <li>
              <a href="mailto:acordeon91@gmail.com">
                <Mail size={15} />
                acordeon91@gmail.com
              </a>
            </li>
            <li>
              <span>
                <MapPin size={15} />
                Colombia — envíos nacionales
              </span>
            </li>
            <li>
              <span>
                <Phone size={15} />
                Lun–Vie 8AM – 6PM
              </span>
            </li>
          </ul>
        </div>

      </div>

      <div className="footer-inferior">
        <p>© {anio} VentaDeAcordeones.com — Todos los derechos reservados</p>
        <p>Hecho con ♥ para los músicos de Colombia · Envíos con SERVIENTREGA</p>
      </div>
    </footer>
  )
}
