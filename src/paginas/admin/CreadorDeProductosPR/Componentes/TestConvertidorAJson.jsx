import React, { useState } from 'react'
import ConvertidorAJson from './ConvertidorAJson'

const TestConvertidorAJson = () => {
  const [bannerData, setBannerData] = useState({
    mensajes: [
      "🚚 ¡ENVÍO GRATIS a toda Colombia al comprar tu CarroExpress VIP!",
      "💳 Compra segura y con pago contraentrega para tu tranquilidad",
      "🛡️ Garantía total de 2 años o te devolvemos tu dinero"
    ]
  })

  const [puntosDolorData, setPuntosDolorData] = useState({
    titulo: "¿Cansado de perder clientes por falta de movilidad y servicio?",
    subtitulo: "El CarroExpress VIP resuelve estos problemas clave para tu emprendimiento:",
    timeline: [
      {
        id: 1,
        icono: "💔",
        nombre: "Dificultad para ofrecer comida gourmet fuera del restaurante",
        posicion: "izquierda",
        solucion: "Nuestro carro móvil premium mantiene estándares de restaurante 5 estrellas donde sea.",
        descripcion: "Muchos negocios no logran transportar ni mantener la calidad en la calle."
      },
      {
        id: 2,
        icono: "😤",
        nombre: "Largas filas y lentitud en el pedido afectando ventas",
        posicion: "derecha",
        solucion: "Sistema digital con QR y tablet para un pedido rápido y sin estrés.",
        descripcion: "Clientes frustrados por esperas que hacen que prefieran otra opción."
      }
    ]
  })

  const handleBannerChange = (newData) => {
    console.log('Banner actualizado:', newData)
    setBannerData(newData)
  }

  const handlePuntosDolorChange = (newData) => {
    console.log('Puntos de dolor actualizados:', newData)
    setPuntosDolorData(newData)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Test ConvertidorAJson</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2>Banner Animado</h2>
        <ConvertidorAJson 
          valor={bannerData}
          onChange={handleBannerChange}
          tipo="banner_animado"
        />
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h4>Datos JSON actuales:</h4>
          <pre>{JSON.stringify(bannerData, null, 2)}</pre>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>Puntos de Dolor</h2>
        <ConvertidorAJson 
          valor={puntosDolorData}
          onChange={handlePuntosDolorChange}
          tipo="puntos_dolor"
        />
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h4>Datos JSON actuales:</h4>
          <pre>{JSON.stringify(puntosDolorData, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}

export default TestConvertidorAJson