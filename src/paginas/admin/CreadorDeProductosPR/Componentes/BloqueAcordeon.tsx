'use client'

import React, { useMemo, useState } from 'react'
import {
  GRUPOS_CARACTERISTICAS,
  calcularPlantillaAcordeon,
  leerCaracteristicas,
  detallesPublicables,
  chipMarcado,
  valorDeChip,
  alternarChip,
  fijarValorChip,
  agregarCaracteristicaLibre,
  quitarCaracteristica,
  limpiarRellenoImportador,
  tieneRellenoImportador,
  esRellenoImportador,
  esAcordeon,
  validarAcordeon,
  type ChipCaracteristica,
} from '../plantillaAcordeon'
import './BloqueAcordeon.css'

interface Props {
  datosProducto: Record<string, any>
  actualizarDatosProducto: (datos: Record<string, any>) => void
  categorias: { id: string; nombre?: string; slug?: string }[]
  /** El producto ya tiene `producto_imagenes.imagen_principal` guardada. */
  tieneImagenPrincipal: boolean
  modo: string
}

/**
 * BloqueAcordeon — la plantilla de acordeón dentro del formulario del admin.
 *
 * POR QUÉ: todos los acordeones llevan la misma estructura de ficha y antes había que
 * escribirla entera cada vez. Aquí el esquema ya está puesto y Jesús sólo marca lo que
 * ESE acordeón tiene: cuantas más características marque, más completa sale la ficha.
 *
 * Las características se guardan en `caracteristicas_jsonb` (campo `caracteristicas` del
 * formulario) con el formato que ya usaba el editor de abajo; los chips son otra vista
 * del mismo array `detalles`, así que se pueden combinar sin pisarse.
 */
const BloqueAcordeon: React.FC<Props> = ({
  datosProducto,
  actualizarDatosProducto,
  categorias,
  tieneImagenPrincipal,
  modo,
}) => {
  const [conflictos, setConflictos] = useState<{ campo: string; etiqueta: string; valorNuevo: any }[]>([])
  const [tituloLibre, setTituloLibre] = useState('')
  const [valorLibre, setValorLibre] = useState('')

  const caracteristicas = datosProducto.caracteristicas
  const acordeon = esAcordeon(datosProducto, categorias)

  const detalles = useMemo(() => leerCaracteristicas(caracteristicas).detalles, [caracteristicas])
  const publicables = useMemo(() => detallesPublicables(caracteristicas), [caracteristicas])
  const hayRelleno = useMemo(() => tieneRellenoImportador(caracteristicas), [caracteristicas])

  const avisos = useMemo(
    () =>
      validarAcordeon(datosProducto, {
        tieneImagenPrincipal,
        esNuevo: modo === 'crear',
        categorias,
      }),
    [datosProducto, tieneImagenPrincipal, modo, categorias]
  )
  const bloqueos = avisos.filter(a => a.nivel === 'bloqueo')
  const sugerencias = avisos.filter(a => a.nivel === 'aviso')

  // ── Plantilla ───────────────────────────────────────────────────────────────

  const aplicarPlantilla = () => {
    const { cambios, conflictos: choques } = calcularPlantillaAcordeon(datosProducto, categorias)
    if (Object.keys(cambios).length > 0) actualizarDatosProducto(cambios)
    // Lo que ya estaba escrito no se toca: se enseña para que él decida.
    setConflictos(choques)
  }

  const sobrescribirConflicto = (campo: string, valor: any) => {
    actualizarDatosProducto({ [campo]: valor })
    setConflictos(prev => prev.filter(c => c.campo !== campo))
  }

  // ── Características ─────────────────────────────────────────────────────────

  const guardarCaracteristicas = (nuevas: any) => actualizarDatosProducto({ caracteristicas: nuevas })

  const alternar = (chip: ChipCaracteristica) => {
    const marcado = chipMarcado(caracteristicas, chip)
    guardarCaracteristicas(alternarChip(caracteristicas, chip, !marcado, valorDeChip(caracteristicas, chip)))
  }

  const escribirValor = (chip: ChipCaracteristica, valor: string) =>
    guardarCaracteristicas(fijarValorChip(caracteristicas, chip, valor))

  const anadirLibre = () => {
    if (!tituloLibre.trim()) return
    guardarCaracteristicas(agregarCaracteristicaLibre(caracteristicas, tituloLibre, valorLibre))
    setTituloLibre('')
    setValorLibre('')
  }

  // Índices reales dentro de `detalles`, para poder borrar el correcto desde la vista previa.
  const indicesPublicables = detalles
    .map((d, i) => ({ d, i }))
    .filter(({ d }) => d && String(d.titulo || '').trim() && !esRellenoImportador(d))

  return (
    <section className="seccion bloque-acordeon">
      <h3>🪗 Plantilla de acordeón</h3>
      <p className="bloque-acordeon__intro">
        Deja puesto el esquema de siempre y marca sólo lo que tenga este acordeón.
        Cuantas más características marques, más completa sale la ficha.
      </p>

      {/* ── Botón de plantilla ── */}
      <div className="bloque-acordeon__acciones">
        <button type="button" className="ba-btn ba-btn--primario" onClick={aplicarPlantilla}>
          ✨ Rellenar como acordeón personalizado
        </button>
        <small>Sólo completa los campos vacíos. Lo que ya escribiste no se pierde.</small>
      </div>

      {conflictos.length > 0 && (
        <div className="ba-conflictos">
          <strong>Estos campos ya tenían contenido y no los toqué:</strong>
          <ul>
            {conflictos.map(c => (
              <li key={c.campo}>
                <span>{c.etiqueta}</span>
                <button type="button" className="ba-btn ba-btn--mini" onClick={() => sobrescribirConflicto(c.campo, c.valorNuevo)}>
                  Usar el de la plantilla
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="ba-btn ba-btn--texto" onClick={() => setConflictos([])}>
            Dejarlos como están
          </button>
        </div>
      )}

      {/* ── Ficha técnica: columnas que la ficha pública ya pinta en "Especificaciones" ── */}
      <div className="ba-subtitulo">Ficha técnica</div>
      <div className="ba-grid-campos">
        {[
          { campo: 'marca', etiqueta: 'Marca', pista: 'HOHNER' },
          { campo: 'modelo', etiqueta: 'Modelo', pista: 'Corona III' },
          { campo: 'color', etiqueta: 'Color', pista: 'Blanco nácar' },
          { campo: 'material', etiqueta: 'Material', pista: 'Madera y nácar' },
        ].map(({ campo, etiqueta, pista }) => (
          <div className="campo" key={campo}>
            <label htmlFor={`ba-${campo}`}>{etiqueta}</label>
            <input
              id={`ba-${campo}`}
              type="text"
              value={datosProducto[campo] || ''}
              onChange={e => actualizarDatosProducto({ [campo]: e.target.value })}
              placeholder={pista}
            />
          </div>
        ))}
        <div className="campo">
          <label htmlFor="ba-garantia">Garantía (meses)</label>
          <input
            id="ba-garantia"
            type="number"
            min={0}
            value={datosProducto.garantia_meses ?? ''}
            onChange={e => actualizarDatosProducto({ garantia_meses: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
            placeholder="12"
          />
        </div>
        <div className="campo">
          <label htmlFor="ba-peso">Peso (kg)</label>
          <input
            id="ba-peso"
            type="number"
            step="0.1"
            min={0}
            value={datosProducto.peso ?? ''}
            onChange={e => actualizarDatosProducto({ peso: e.target.value === '' ? '' : parseFloat(e.target.value) })}
            placeholder="5.5"
          />
        </div>
      </div>

      {/* ── Características marcables ── */}
      <div className="ba-subtitulo">
        Características de este acordeón
        <span className="ba-contador">{publicables.length} marcadas</span>
      </div>

      {hayRelleno && (
        <div className="ba-aviso ba-aviso--relleno">
          <span>
            Este producto arrastra características genéricas del importador (“Material premium”,
            “Diseño inteligente”…). No se publican, pero es mejor quitarlas.
          </span>
          <button
            type="button"
            className="ba-btn ba-btn--mini"
            onClick={() => guardarCaracteristicas(limpiarRellenoImportador(caracteristicas))}
          >
            Limpiar relleno
          </button>
        </div>
      )}

      {GRUPOS_CARACTERISTICAS.map(grupo => (
        <div className="ba-grupo" key={grupo.nombre}>
          <div className="ba-grupo__nombre">{grupo.nombre}</div>
          <div className="ba-chips">
            {grupo.chips.map(chip => {
              const marcado = chipMarcado(caracteristicas, chip)
              const valor = valorDeChip(caracteristicas, chip)
              return (
                <div className={`ba-chip-caja ${marcado ? 'activa' : ''}`} key={chip.titulo}>
                  <button
                    type="button"
                    className={`ba-chip ${marcado ? 'activo' : ''}`}
                    aria-pressed={marcado}
                    onClick={() => alternar(chip)}
                  >
                    <span className="ba-chip__icono">{chip.icono}</span>
                    <span className="ba-chip__texto">{chip.titulo}</span>
                    <span className="ba-chip__marca">{marcado ? '✓' : '+'}</span>
                  </button>

                  {marcado && chip.conValor && (
                    <div className="ba-chip-valor">
                      {chip.opciones && (
                        <div className="ba-opciones">
                          {chip.opciones.map(op => (
                            <button
                              type="button"
                              key={op}
                              className={`ba-opcion ${valor === op ? 'activa' : ''}`}
                              onClick={() => escribirValor(chip, op)}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      )}
                      <input
                        type="text"
                        value={valor}
                        onChange={e => escribirValor(chip, e.target.value)}
                        placeholder={chip.pista || 'Valor'}
                        aria-label={`${chip.titulo}: valor`}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* ── Característica libre ── */}
      <div className="ba-grupo">
        <div className="ba-grupo__nombre">¿Falta alguna? Añádela</div>
        <div className="ba-libre">
          <input
            type="text"
            value={tituloLibre}
            onChange={e => setTituloLibre(e.target.value)}
            placeholder="Nombre de la característica"
            aria-label="Nombre de la característica nueva"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                anadirLibre()
              }
            }}
          />
          <input
            type="text"
            value={valorLibre}
            onChange={e => setValorLibre(e.target.value)}
            placeholder="Detalle (opcional)"
            aria-label="Detalle de la característica nueva"
          />
          <button type="button" className="ba-btn ba-btn--primario" onClick={anadirLibre}>
            Añadir
          </button>
        </div>
      </div>

      {/* ── Vista previa de lo que verá el cliente ── */}
      <div className="ba-subtitulo">Así saldrá en la ficha</div>
      {publicables.length === 0 ? (
        <p className="ba-vacio">
          Sin características marcadas esta sección no aparece en la ficha (nada de bloques vacíos).
        </p>
      ) : (
        <ul className="ba-previa">
          {indicesPublicables.map(({ d, i }) => (
            <li key={`${d.titulo}-${i}`}>
              <span className="ba-previa__icono">{d.icono}</span>
              <span className="ba-previa__titulo">{d.titulo}</span>
              {d.descripcion && <span className="ba-previa__valor">{d.descripcion}</span>}
              <button
                type="button"
                className="ba-quitar"
                aria-label={`Quitar ${d.titulo}`}
                onClick={() => guardarCaracteristicas(quitarCaracteristica(caracteristicas, i))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ── Avisos antes de guardar ── */}
      {(bloqueos.length > 0 || (acordeon && sugerencias.length > 0)) && (
        <div className="ba-revision">
          {bloqueos.length > 0 && (
            <div className="ba-aviso ba-aviso--bloqueo">
              <strong>No se puede guardar todavía:</strong>
              <ul>
                {bloqueos.map(a => (
                  <li key={a.texto}>{a.texto}</li>
                ))}
              </ul>
            </div>
          )}
          {acordeon && sugerencias.length > 0 && (
            <div className="ba-aviso ba-aviso--sugerencia">
              <strong>Se puede guardar, pero la ficha queda más pobre:</strong>
              <ul>
                {sugerencias.map(a => (
                  <li key={a.texto}>{a.texto}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default BloqueAcordeon
