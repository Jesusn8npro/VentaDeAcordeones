import type { Metadata } from 'next'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import Link from 'next/link'
import { formatearPrecioCOP } from '@/utilidades/formatoPrecio'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Resultados para "${q}" — VentaDeAcordeones.com` : 'Buscar — VentaDeAcordeones.com',
    robots: { index: false, follow: false },
  }
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q } = await searchParams
  const termino = (q || '').trim()

  let productos: any[] = []
  if (termino.length >= 2) {
    const { data } = await supabaseServidor
      .from('productos')
      .select('id, nombre, slug, precio, precio_original, stock, marca, producto_imagenes(imagen_principal)')
      .eq('activo', true)
      .or(`nombre.ilike.%${termino}%,marca.ilike.%${termino}%,slug.ilike.%${termino}%`)
      .order('destacado', { ascending: false })
      .order('nombre', { ascending: true })
      .limit(40)
    productos = data || []
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '0.5rem' }}>
        Buscar productos
      </h1>

      <form action="/buscar" method="get" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '600px' }}>
          <input
            name="q"
            defaultValue={termino}
            placeholder="Buscar acordeones, marcas..."
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
            }}
            autoFocus
          />
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#ff6b35',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '1rem',
              whiteSpace: 'nowrap',
            }}
          >
            Buscar
          </button>
        </div>
      </form>

      {termino.length >= 2 && (
        <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          {productos.length === 0
            ? `No se encontraron resultados para "${termino}"`
            : `${productos.length} resultado${productos.length !== 1 ? 's' : ''} para "${termino}"`}
        </p>
      )}

      {productos.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          {productos.map((p) => {
            const imagen = p.producto_imagenes?.[0]?.imagen_principal || null
            const agotado = !p.stock || p.stock <= 0
            return (
              <Link
                key={p.id}
                href={`/producto/${p.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: '#fff',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  opacity: agotado ? 0.65 : 1,
                }}>
                  <div style={{ position: 'relative', height: '200px', background: '#f5f5f5' }}>
                    {imagen ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imagen}
                        alt={p.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem' }}>
                        🎵
                      </div>
                    )}
                    {agotado && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.45)',
                      }}>
                        <span style={{ background: '#e74c3c', color: '#fff', padding: '6px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.9rem' }}>
                          AGOTADO
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '0.95rem', color: '#1a1a2e', lineHeight: 1.3 }}>
                      {p.nombre}
                    </p>
                    {p.marca && (
                      <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#888' }}>
                        {p.marca}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ff6b35' }}>
                        {formatearPrecioCOP(p.precio)}
                      </span>
                      {p.precio_original && p.precio_original > p.precio && (
                        <span style={{ fontSize: '0.85rem', color: '#aaa', textDecoration: 'line-through' }}>
                          {formatearPrecioCOP(p.precio_original)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {termino.length < 2 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#aaa' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <p style={{ fontSize: '1.1rem' }}>Escribe al menos 2 caracteres para buscar</p>
          <Link href="/tienda" style={{ color: '#ff6b35', fontWeight: 600, textDecoration: 'none' }}>
            Ver todos los productos →
          </Link>
        </div>
      )}
    </div>
  )
}
