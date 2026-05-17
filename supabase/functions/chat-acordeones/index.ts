// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// ---------------------------------------------------------------------------
// Herramientas OpenAI (tool_calls)
// ---------------------------------------------------------------------------
const HERRAMIENTAS = [
  {
    type: "function",
    function: {
      name: "actualizar_lead",
      description:
        "Guarda o actualiza los datos de contacto e interés del visitante en la base de datos.",
      parameters: {
        type: "object",
        properties: {
          nombre: { type: "string" },
          apellido: { type: "string" },
          email: { type: "string" },
          whatsapp: { type: "string" },
          ciudad: { type: "string" },
          tipo_consulta: {
            type: "string",
            enum: ["compra", "soporte", "informacion", "otro"],
          },
          nivel_interes: {
            type: "integer",
            description: "Del 1 (bajo) al 10 (muy alto).",
          },
          productos_consultados: {
            type: "array",
            items: { type: "string" },
            description: "Nombres o referencias de productos mencionados.",
          },
          notas_adicionales: { type: "string" },
          principales_objeciones: { type: "string" },
          urgencia_compra: { type: "string" },
          precio_maximo_mencionado: { type: "number" },
          metodo_pago_preferido: { type: "string" },
          intereses_cliente: { type: "string" },
          estado: {
            type: "string",
            enum: ["activo", "calificado", "venta_confirmada", "perdido"],
            description: "Estado del lead. Usa 'venta_confirmada' cuando el cliente confirme la compra.",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "agregar_al_carrito",
      description:
        "Agrega un producto al carrito de compras del cliente cuando este confirma que quiere comprarlo.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "Slug del producto a agregar al carrito.",
          },
          cantidad: {
            type: "integer",
            description: "Cantidad a agregar (default: 1).",
          },
        },
        required: ["slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "buscar_producto",
      description:
        "Busca productos en el catálogo de acordeones y accesorios por nombre o descripción.",
      parameters: {
        type: "object",
        properties: {
          busqueda: {
            type: "string",
            description: "Término de búsqueda (marca, modelo, tipo, etc.).",
          },
          precio_max: {
            type: "number",
            description: "Precio máximo en COP (opcional).",
          },
        },
        required: ["busqueda"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "ver_catalogo",
      description:
        "Lista los productos activos del catálogo, mostrando primero los destacados.",
      parameters: {
        type: "object",
        properties: {
          limite: {
            type: "integer",
            description: "Número de productos a mostrar (máx 8, default 5).",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "buscar_articulo",
      description:
        "Busca artículos del blog por tema relacionado con acordeones.",
      parameters: {
        type: "object",
        properties: {
          busqueda: {
            type: "string",
            description: "Término de búsqueda en el blog.",
          },
        },
        required: ["busqueda"],
      },
    },
  },
]

// ---------------------------------------------------------------------------
// Tonos
// ---------------------------------------------------------------------------
const TONO_DESC: Record<string, string> = {
  calido_motivador: "Cálido, cercano y motivador. Genera confianza y entusiasmo.",
  profesional_formal: "Profesional y formal. Usa usted, lenguaje estructurado y preciso.",
  jovial_energico: "Jovial, enérgico y entusiasta. Usa emojis con moderación.",
  experto_tecnico: "Experto técnico en acordeones. Da detalles precisos sobre marcas, voces, tonos y construcción.",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatProducto(p: any): string {
  const precioActual = p.precio
  const precioFmt = precioActual
    ? `$${Number(precioActual).toLocaleString("es-CO")} COP`
    : "Consultar precio"
  const descuentoTxt = p.descuento ? ` (${p.descuento}% OFF)` : ""
  const marcaTxt = p.marca ? ` - ${p.marca}` : ""
  return `${p.nombre}${marcaTxt}${descuentoTxt} - ${precioFmt} [Ver producto](/producto/${p.slug})`
}

function orBusqueda(columnas: string[], termino: string) {
  return columnas.map((col) => `${col}.ilike.%${termino}%`).join(",")
}

// ---------------------------------------------------------------------------
// Handler principal
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS })
  }

  try {
    // 1. Variables de entorno
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!
    const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini"

    // 2. Cliente Supabase con service role (sin RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 3. Parse body
    const body = await req.json()
    const {
      chat_id,
      mensaje,
      usuario_id = null,
      pagina_origen = "/",
    }: {
      chat_id: string
      mensaje: string
      usuario_id?: string | null
      pagina_origen?: string
    } = body

    if (!chat_id || !mensaje) {
      return new Response(
        JSON.stringify({ error: "chat_id y mensaje son requeridos" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
      )
    }

    // 4. Registrar sesión inmediatamente (antes de OpenAI)
    await supabase.from("leadschat").upsert(
      {
        chat_id,
        source: "web",
        pagina_origen,
        estado: "activo",
        updated_at: new Date().toISOString(),
        ...(usuario_id ? { usuario_id } : {}),
      },
      { onConflict: "chat_id", ignoreDuplicates: false },
    )

    // 5. Cargar datos en paralelo
    const [configRes, historialRes, leadRes] = await Promise.all([
      supabase
        .from("agente_chat_config")
        .select("nombre, tono, prompt_adicional")
        .eq("activo", true)
        .limit(1)
        .maybeSingle(),

      supabase
        .from("chats_web")
        .select("message")
        .eq("session_id", chat_id)
        .order("created_at", { ascending: true })
        .limit(30),

      supabase
        .from("leadschat")
        .select("nombre, apellido, email, whatsapp, ciudad, tipo_consulta, nivel_interes, productos_consultados, notas_adicionales")
        .eq("chat_id", chat_id)
        .maybeSingle(),
    ])

    const config = configRes.data
    const historialRows = historialRes.data ?? []
    const leadExistente = leadRes.data

    // 6. Configuración del agente (fallback si no hay fila activa)
    const nombreAgente = config?.nombre ?? "Valeria"
    const tonoKey = config?.tono ?? "calido_motivador"
    const promptAdicional = config?.prompt_adicional ?? ""
    const tonoDescripcion = TONO_DESC[tonoKey] ?? TONO_DESC["calido_motivador"]

    // 7. Estado de captura de datos del lead
    const sabeWhatsapp = !!(leadExistente?.whatsapp)
    const sabeCiudad = !!(leadExistente?.ciudad)

    // Detectar nombre en historial si no está guardado aún
    let nombreCliente = leadExistente?.nombre ?? null
    if (!nombreCliente) {
      const patronNombre = /(?:me llamo|soy|mi nombre(?: es)?|llámame|llamame)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i
      for (const row of historialRows) {
        const msg = row.message
        if (msg?.role !== "user" || !msg?.content) continue
        const match = patronNombre.exec(msg.content)
        if (match?.[1]) {
          nombreCliente = match[1].trim()
          break
        }
      }
      if (nombreCliente) {
        await supabase.from("leadschat").upsert(
          { chat_id, nombre: nombreCliente, updated_at: new Date().toISOString() },
          { onConflict: "chat_id" },
        )
      }
    }

    const sabeNombre = !!nombreCliente

    const instruccionesEtapa = sabeNombre && sabeWhatsapp && sabeCiudad
      ? "Tienes nombre, WhatsApp y ciudad. Enfócate en cerrar la venta o resolver objeciones. Usa agregar_al_carrito si el cliente confirma compra."
      : !sabeNombre
      ? "PRIORIDAD: Si el cliente ya mencionó su nombre en la conversación, extráelo y llama a actualizar_lead inmediatamente. Si no lo ha mencionado, pregúntalo de forma natural en esta respuesta."
      : !sabeWhatsapp
      ? `El cliente se llama ${nombreCliente}. PRIORIDAD: Cuando muestre interés real de compra, pide su WhatsApp para coordinar.`
      : `Ya tienes nombre y WhatsApp de ${nombreCliente}. PRIORIDAD: Obtén la ciudad para calcular envío.`

    // 8. Contexto del lead conocido
    let contextoLead = ""
    if (leadExistente || nombreCliente) {
      const partes: string[] = []
      if (nombreCliente) partes.push(`Nombre: ${nombreCliente} ${leadExistente?.apellido ?? ""}`.trim())
      if (leadExistente?.email) partes.push(`Email: ${leadExistente.email}`)
      if (leadExistente?.whatsapp) partes.push(`WhatsApp: ${leadExistente.whatsapp}`)
      if (leadExistente?.ciudad) partes.push(`Ciudad: ${leadExistente.ciudad}`)
      if (leadExistente?.tipo_consulta) partes.push(`Consulta: ${leadExistente.tipo_consulta}`)
      if (leadExistente?.nivel_interes) partes.push(`Interés: ${leadExistente.nivel_interes}/10`)
      if (leadExistente?.productos_consultados?.length) {
        partes.push(`Productos vistos: ${leadExistente.productos_consultados.join(", ")}`)
      }
      if (leadExistente?.notas_adicionales) partes.push(`Notas: ${leadExistente.notas_adicionales}`)
      if (partes.length) {
        contextoLead = `\n=== DATOS DEL VISITANTE (NO volver a preguntar lo que ya sabes) ===\n${partes.join("\n")}`
      }
    }

    // 9. Construir system prompt
    const hoy = new Date().toLocaleDateString("es-CO", {
      year: "numeric", month: "long", day: "numeric",
    })
    const systemPrompt = `Eres ${nombreAgente}, asistente virtual de VentaDeAcordeones.Com — la tienda especializada en acordeones y accesorios musicales de Colombia.
TONO: ${tonoDescripcion}

=== RUTAS DE LA TIENDA ===
Usa SIEMPRE links relativos [Texto del botón](/ruta). JAMÁS escribas URLs completas.
- Catálogo completo: [Ver todos los acordeones](/tienda)
- Acordeones nuevos: [Ver nuevos](/tienda?estado=nuevo)
- Acordeones usados: [Ver usados](/tienda?estado=usado)
- Blog: [Leer blog](/blog)
- Contacto WhatsApp: [Escribir al WhatsApp](https://wa.me/573138350318)
${contextoLead}

HOY: ${hoy} | PÁGINA: ${pagina_origen}

=== ETAPA ACTUAL ===
${instruccionesEtapa}

=== INSTRUCCIONES ADICIONALES ===
${promptAdicional}

=== FORMATO DE RESPUESTA ===
- CERO asteriscos (**texto**), CERO numeración "1. 2.", CERO guiones de lista "- item", CERO flechas "->".
- Escribe en prosa natural. Los links [texto](/ruta) se convierten automáticamente en botones visuales.
- Máximo 3 oraciones por respuesta. Breve, directo, amigable.
- Cuando muestres productos: "Tenemos el Hohner Corona II por $2.850.000 [Ver producto](/producto/hohner-corona-ii)"
- Siempre termina con UNA pregunta concreta para avanzar la conversación.

=== CAPTACIÓN DE DATOS ===
- Obtén datos de forma CONVERSACIONAL, nunca como formulario.
- Llama a actualizar_lead CADA VEZ que captures un dato nuevo.
- Guarda objeciones en principales_objeciones.
- Cuando el cliente confirme que quiere comprar, llama a agregar_al_carrito y luego a actualizar_lead con estado "venta_confirmada".

=== BÚSQUEDA DE PRODUCTOS ===
- USA ver_catalogo cuando pregunten qué tienes disponible.
- USA buscar_producto cuando mencionen una marca, modelo o tipo específico.
- NUNCA inventes precios ni especificaciones. Solo informa lo que está en la base de datos.`

    // 10. Reconstruir historial de mensajes OpenAI
    const mensajesHistorial: any[] = historialRows
      .map((row: any) => {
        const msg = row.message
        if (!msg || !msg.role || !msg.content) return null
        if (!["user", "assistant"].includes(msg.role)) return null
        return { role: msg.role, content: msg.content }
      })
      .filter(Boolean)

    // Agregar el mensaje actual del usuario
    const mensajes: any[] = [
      { role: "system", content: systemPrompt },
      ...mensajesHistorial,
      { role: "user", content: mensaje },
    ]

    // 11. Bucle OpenAI con tool_calls (máx 8 iteraciones)
    let respuestaFinal = ""
    let accionCarrito: any = null

    for (let intento = 0; intento < 8; intento++) {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: mensajes,
          tools: HERRAMIENTAS,
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens: 800,
        }),
      })

      if (!openaiRes.ok) {
        const err = await openaiRes.text()
        throw new Error(`OpenAI error ${openaiRes.status}: ${err}`)
      }

      const openaiData = await openaiRes.json()
      const choice = openaiData.choices?.[0]
      const msg = choice?.message

      if (!msg) throw new Error("Respuesta inesperada de OpenAI")

      // Sin tool_calls → respuesta final
      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        respuestaFinal = msg.content ?? ""
        break
      }

      // Agregar el mensaje del asistente con tool_calls al contexto
      mensajes.push(msg)

      // Ejecutar cada tool_call
      for (const tc of msg.tool_calls) {
        const fnName = tc.function.name
        let args: any = {}
        try { args = JSON.parse(tc.function.arguments) } catch (_) { /* vacío */ }

        let resultadoStr = ""

        // -------------------------------------------------------------------
        if (fnName === "actualizar_lead") {
          const payload: any = {
            chat_id,
            source: "web",
            pagina_origen,
            updated_at: new Date().toISOString(),
          }
          if (usuario_id) payload.usuario_id = usuario_id

          const camposDirectos = [
            "nombre", "apellido", "email", "whatsapp", "ciudad",
            "tipo_consulta", "nivel_interes", "productos_consultados",
            "notas_adicionales", "principales_objeciones", "urgencia_compra",
            "precio_maximo_mencionado", "metodo_pago_preferido", "intereses_cliente",
            "estado",
          ]
          for (const campo of camposDirectos) {
            if (args[campo] !== undefined && args[campo] !== null && args[campo] !== "") {
              payload[campo] = args[campo]
            }
          }

          const { error: leadError } = await supabase
            .from("leadschat")
            .upsert(payload, { onConflict: "chat_id" })

          resultadoStr = leadError
            ? `Error al guardar lead: ${leadError.message}`
            : "Datos del visitante guardados correctamente."
        }

        // -------------------------------------------------------------------
        else if (fnName === "agregar_al_carrito") {
          const slugProd = (args.slug ?? "").trim()
          const cantidad = Math.max(1, Number(args.cantidad ?? 1))

          const { data: prod, error: prodError } = await supabase
            .from("productos")
            .select("id, nombre, slug, precio, precio_original, activo, stock, marca, descuento")
            .eq("slug", slugProd)
            .eq("activo", true)
            .maybeSingle()

          if (prodError || !prod) {
            resultadoStr = "No se encontró el producto o no está disponible."
          } else if (!prod.stock || prod.stock < 1) {
            resultadoStr = "Producto sin stock disponible actualmente."
          } else {
            accionCarrito = { tipo: "agregar_carrito", producto: prod, cantidad }
            resultadoStr = `Producto "${prod.nombre}" listo para agregar al carrito (${cantidad} unidad/es).`
          }
        }

        // -------------------------------------------------------------------
        else if (fnName === "buscar_producto") {
          const termino = (args.busqueda ?? "").trim()
          let query = supabase
            .from("productos")
            .select("nombre, slug, precio, precio_original, descuento, marca")
            .eq("activo", true)
            .or(orBusqueda(["nombre", "marca", "modelo"], termino))
            .limit(5)

          if (args.precio_max) {
            query = query.lte("precio", args.precio_max)
          }

          const { data: prods, error: prodError } = await query

          if (prodError) {
            resultadoStr = `Error al buscar productos: ${prodError.message}`
          } else if (!prods || prods.length === 0) {
            resultadoStr = "No se encontraron productos que coincidan con la búsqueda."
          } else {
            resultadoStr = prods.map(formatProducto).join("\n")
          }
        }

        // -------------------------------------------------------------------
        else if (fnName === "ver_catalogo") {
          const limite = Math.min(args.limite ?? 5, 8)
          const { data: prods, error: catError } = await supabase
            .from("productos")
            .select("nombre, slug, precio, precio_original, descuento, marca, destacado")
            .eq("activo", true)
            .order("destacado", { ascending: false })
            .limit(limite)

          if (catError) {
            resultadoStr = `Error al cargar catálogo: ${catError.message}`
          } else if (!prods || prods.length === 0) {
            resultadoStr = "No hay productos disponibles en el catálogo actualmente."
          } else {
            resultadoStr = prods.map(formatProducto).join("\n")
          }
        }

        // -------------------------------------------------------------------
        else if (fnName === "buscar_articulo") {
          const termino = (args.busqueda ?? "").trim()
          const { data: arts, error: artError } = await supabase
            .from("articulos_web")
            .select("titulo, slug")
            .eq("activo", true)
            .or(orBusqueda(["titulo", "resumen"], termino))
            .limit(5)

          if (artError) {
            resultadoStr = `Error al buscar artículos: ${artError.message}`
          } else if (!arts || arts.length === 0) {
            resultadoStr = "No se encontraron artículos relacionados."
          } else {
            resultadoStr = arts
              .map((a: any) => `"${a.titulo}" [Leer más](/blog/${a.slug})`)
              .join("\n")
          }
        }

        // -------------------------------------------------------------------
        else {
          resultadoStr = `Herramienta desconocida: ${fnName}`
        }

        // Agregar resultado al contexto
        mensajes.push({
          role: "tool",
          tool_call_id: tc.id,
          content: resultadoStr,
        })
      }
      // Continuar bucle para que el modelo genere la respuesta final
    }

    if (!respuestaFinal) {
      respuestaFinal = "Lo siento, no pude procesar tu consulta en este momento. ¿Puedo ayudarte en algo más?"
    }

    // 12. Guardar mensajes en chats_web (usuario + bot)
    const ahora = new Date().toISOString()
    await supabase.from("chats_web").insert([
      {
        session_id: chat_id,
        message: {
          role: "user",
          content: mensaje,
          type: "text",
          timestamp: ahora,
        },
      },
      {
        session_id: chat_id,
        message: {
          role: "assistant",
          content: respuestaFinal,
          type: "text",
          timestamp: new Date().toISOString(),
        },
      },
    ])

    // 13. Devolver respuesta (con accion opcional para el frontend)
    return new Response(
      JSON.stringify({
        respuesta: respuestaFinal,
        ...(accionCarrito ? { accion: accionCarrito } : {}),
      }),
      {
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
      },
    )
  } catch (err: any) {
    console.error("chat-acordeones error:", err)
    return new Response(
      JSON.stringify({ error: err.message ?? "Error interno" }),
      {
        status: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
      },
    )
  }
})
