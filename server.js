import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import feedHandler, { generarFeedXML } from './api/meta/feed-productos.js'
import {
  iniciarServicioActualizacion,
  configurarWebhookProductos,
  actualizarFeed,
  obtenerEstadisticasFeed,
  asegurarBucketFeedsMeta,
} from './api/meta/actualizacion-automatica.js'

const app = express()
const PORT = process.env.PORT || 4173

app.use(cors())
app.use(express.json({ limit: '5mb' }))

// Endpoint XML directo (compatibilidad con handler existente)
app.get('/api/meta/feed-productos', async (req, res) => {
  try {
    const xml = await generarFeedXML()
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).send(xml)
  } catch (error) {
    res.status(500).json({ error: 'Error al generar feed', mensaje: error.message })
  }
})

// Estado del servicio
app.get('/api/meta/estado-servicio', async (req, res) => {
  try {
    const estadisticas = await obtenerEstadisticasFeed()
    res.status(200).json({
      servicio: 'Feed Meta - Actualización Automática',
      estado: 'activo',
      configuracion: {
        frecuencia: '60 minutos',
      },
      estadisticas,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estado', mensaje: error.message })
  }
})

// Actualización manual
app.post('/api/meta/actualizar-feed', async (req, res) => {
  try {
    const resultado = await actualizarFeed()
    res.status(200).json(resultado)
  } catch (error) {
    res.status(500).json({ exito: false, error: error.message })
  }
})

// Servir archivos estáticos de dist si existen
app.use(express.static('dist'))

app.listen(PORT, async () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`)
  const bucket = await asegurarBucketFeedsMeta()
  if (bucket?.error) {
    console.log('⚠️ No se pudo asegurar el bucket feeds-meta:', bucket.error)
  } else if (bucket?.creado) {
    console.log('✅ Bucket feeds-meta creado')
  } else {
    console.log('✅ Bucket feeds-meta disponible')
  }
  iniciarServicioActualizacion()
  configurarWebhookProductos()
})