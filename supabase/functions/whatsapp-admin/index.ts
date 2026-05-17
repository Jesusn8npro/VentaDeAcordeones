// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-bot-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// ── Herramientas del agente ──────────────────────────────────────────────────

const TOOLS = [
  {
    type: "function",
    function: {
      name: "generar_producto",
      description: "Llama esta herramienta cuando tengas TODA la información necesaria para crear el producto. Requiere mínimo: nombre, precio, categoría, stock y descripción.",
      parameters: {
        type: "object",
        properties: {
          nombre:                { type: "string",  description: "Nombre completo del producto" },
          slug:                  { type: "string",  description: "URL en kebab-case sin acentos, ej: hohner-corona-ii-blanco" },
          descripcion_titulo:    { type: "string",  description: "Título de la sección de descripción" },
          descripcion_contenido: { type: "string",  description: "Descripción completa, 2-4 párrafos persuasivos" },
          precio:                { type: "number",  description: "Precio en COP (solo número entero)" },
          precio_original:       { type: "number",  description: "Precio tachado antes del descuento" },
          descuento:             { type: "number",  description: "Porcentaje de descuento 0-100" },
          categoria_id:          { type: "string",  description: "ID exacto de la categoría de la lista disponible" },
          stock:                 { type: "number",  description: "Unidades disponibles" },
          stock_minimo:          { type: "number",  description: "Alerta cuando el stock llega a este número (default 2)" },
          estado:                { type: "string",  enum: ["nuevo", "usado", "vendido", "agotado", "descontinuado"] },
          activo:                { type: "boolean" },
          destacado:             { type: "boolean" },
          marca:                 { type: "string" },
          modelo:                { type: "string" },
          peso:                  { type: "number",  description: "Peso en kg" },
          ganchos:               { type: "array",   items: { type: "string" }, description: "3-5 frases cortas y atractivas de venta" },
          palabras_clave:        { type: "array",   items: { type: "string" }, description: "5-10 palabras clave SEO" },
          meta_title:            { type: "string",  description: "Título SEO, máx 60 caracteres" },
          meta_description:      { type: "string",  description: "Descripción SEO, máx 160 caracteres" },
        },
        required: ["nombre", "slug", "precio", "stock", "categoria_id", "descripcion_contenido"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "ver_pedidos",
      description: "Obtiene los últimos pedidos de la tienda. Usa cuando el admin pregunte por pedidos, ventas o clientes recientes.",
      parameters: {
        type: "object",
        properties: {
          limite: { type: "number", description: "Cuántos pedidos mostrar (máx 10, default 5)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "buscar_producto",
      description: "Busca un producto por nombre o slug para consultarlo o editarlo.",
      parameters: {
        type: "object",
        properties: {
          busqueda: { type: "string", description: "Nombre o parte del nombre del producto" },
        },
        required: ["busqueda"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "actualizar_stock",
      description: "Actualiza el stock de un producto. Usa el ID del producto.",
      parameters: {
        type: "object",
        properties: {
          producto_id: { type: "string", description: "UUID del producto" },
          stock:       { type: "number", description: "Nuevo valor de stock" },
        },
        required: ["producto_id", "stock"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "listar_productos",
      description: "Lista los productos activos en la tienda.",
      parameters: {
        type: "object",
        properties: {
          limite: { type: "number", description: "Cuántos mostrar (máx 10, default 5)" },
          solo_activos: { type: "boolean", description: "Si true, solo productos activos" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "cambiar_estado_producto",
      description: "Activa o desactiva un producto (lo publica o lo oculta de la tienda).",
      parameters: {
        type: "object",
        properties: {
          producto_id: { type: "string", description: "UUID del producto" },
          activo:      { type: "boolean", description: "true = visible en tienda, false = oculto" },
        },
        required: ["producto_id", "activo"],
      },
    },
  },
]

// ── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })

  try {
    const SUPABASE_URL              = Deno.env.get("SUPABASE_URL")!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const OPENAI_API_KEY            = Deno.env.get("OPENAI_API_KEY")!
    const OPENAI_MODEL              = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini"
    const BOT_SECRET                = Deno.env.get("WHATSAPP_BOT_SECRET") ?? ""

    // El secret es OBLIGATORIO — si no está configurado, bloquear todo
    if (!BOT_SECRET) {
      console.error("WHATSAPP_BOT_SECRET no configurado en Supabase secrets")
      return new Response(JSON.stringify({ error: "Service not configured" }), {
        status: 503,
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

    const authHeader = req.headers.get("x-bot-secret") ?? ""
    if (authHeader !== BOT_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const body = await req.json()
    const { numero, mensaje } = body

    if (!numero || !mensaje?.trim()) {
      return new Response(
        JSON.stringify({ error: "numero y mensaje son requeridos" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
      )
    }

    // ── Cargar / crear sesión ──────────────────────────────────────────────
    let { data: sesion } = await supabase
      .from("whatsapp_sesiones")
      .select("*")
      .eq("numero", numero)
      .eq("estado", "activo")
      .single()

    const historial: any[] = sesion?.mensajes ?? []

    // ── Cargar categorías ──────────────────────────────────────────────────
    const { data: categoriasDB } = await supabase
      .from("categorias")
      .select("id, nombre")
      .eq("activo", true)
      .order("orden", { ascending: true })

    const listaCategorias = categoriasDB?.length
      ? categoriasDB.map((c: any) => `  • ${c.nombre} → ID: "${c.id}"`).join("\n")
      : "  (Sin categorías — créalas primero en el panel admin)"

    // ── System prompt ──────────────────────────────────────────────────────
    const systemPrompt = `Eres el *Asistente Admin* de VentaDeAcordeones.Com — tienda colombiana de acordeones, instrumentos y accesorios.
Recibes mensajes por WhatsApp del administrador y tienes acceso completo a la plataforma.

*CATEGORÍAS DISPONIBLES:*
${listaCategorias}

*FLUJO CREACIÓN DE PRODUCTO — una pregunta por turno:*
1. Nombre completo y marca
2. Precio en COP (número entero, ej: 2850000)
3. Categoría (dime el nombre, yo uso el ID correcto)
4. Unidades en stock
5. Descripción y características
6. ¿Tiene precio original / descuento?
7. Cuando tengas: nombre + precio + categoría + stock + descripción → llama a *generar_producto* y guárdalo

*REGLAS:*
- Respuestas breves y en español colombiano informal 🇨🇴
- Usa *negrita* con asteriscos para WhatsApp
- Slug: kebab-case sin acentos ("Hohner Corona II" → "hohner-corona-ii")
- Precios: enteros sin puntos ni comas
- Ganchos: 3-5 frases persuasivas cortas
- meta_title ≤ 60 chars · meta_description ≤ 160 chars
- Estado default: "nuevo" · activo: true · stock_minimo: 2
- Con la info esencial, genera el producto sin pedir más datos
- Cuando ejecutes una herramienta, informa el resultado al admin en lenguaje natural`

    // ── Mensajes para OpenAI ───────────────────────────────────────────────
    const mensajesOAI: any[] = [
      { role: "system", content: systemPrompt },
      ...historial,
      { role: "user", content: mensaje },
    ]

    // ── Bucle OpenAI ───────────────────────────────────────────────────────
    let respuestaFinal = ""
    let productoGuardado: any = null
    let resultadoComando: string | null = null

    for (let i = 0; i < 8; i++) {
      const oaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model:       OPENAI_MODEL,
          messages:    mensajesOAI,
          tools:       TOOLS,
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens:  1500,
        }),
      })

      if (!oaiRes.ok) {
        const err = await oaiRes.text()
        throw new Error(`OpenAI ${oaiRes.status}: ${err}`)
      }

      const oaiData = await oaiRes.json()
      const msg = oaiData.choices?.[0]?.message

      if (!msg) throw new Error("Respuesta inesperada de OpenAI")

      // Sin tool_calls → respuesta conversacional
      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        respuestaFinal = msg.content ?? ""
        mensajesOAI.push({ role: "assistant", content: respuestaFinal })
        break
      }

      mensajesOAI.push(msg)

      for (const tc of msg.tool_calls) {
        let toolResult = ""
        let args: any = {}

        try { args = JSON.parse(tc.function.arguments) } catch (_) {}

        // ── Ejecutar herramienta ─────────────────────────────────────────
        if (tc.function.name === "generar_producto") {
          const productoData = {
            ...args,
            activo:      args.activo      ?? true,
            destacado:   args.destacado   ?? false,
            estado:      args.estado      ?? "nuevo",
            stock_minimo: args.stock_minimo ?? 2,
          }

          const { data: prod, error: errProd } = await supabase
            .from("productos")
            .insert([productoData])
            .select("id, nombre, slug")
            .single()

          if (errProd) {
            toolResult = `Error al guardar: ${errProd.message}`
          } else {
            productoGuardado = prod
            toolResult = `Producto guardado OK. ID: ${prod.id} | Slug: ${prod.slug}`
            // Marcar sesión como completada
            await supabase
              .from("whatsapp_sesiones")
              .update({ estado: "completado", updated_at: new Date().toISOString() })
              .eq("numero", numero)
          }

        } else if (tc.function.name === "ver_pedidos") {
          const limite = Math.min(args.limite ?? 5, 10)
          const { data: pedidos } = await supabase
            .from("pedidos")
            .select("id, total, estado, created_at")
            .order("created_at", { ascending: false })
            .limit(limite)

          if (!pedidos?.length) {
            toolResult = "No hay pedidos registrados aún."
          } else {
            toolResult = pedidos.map((p: any, i: number) =>
              `${i + 1}. #${p.id.slice(0, 8)} — $${p.total?.toLocaleString("es-CO")} — ${p.estado} — ${new Date(p.created_at).toLocaleDateString("es-CO")}`
            ).join("\n")
          }

        } else if (tc.function.name === "buscar_producto") {
          const { data: prods } = await supabase
            .from("productos")
            .select("id, nombre, precio, stock, activo")
            .ilike("nombre", `%${args.busqueda}%`)
            .limit(5)

          if (!prods?.length) {
            toolResult = `No encontré productos con "${args.busqueda}".`
          } else {
            toolResult = prods.map((p: any) =>
              `• ${p.nombre} | $${p.precio?.toLocaleString("es-CO")} | Stock: ${p.stock} | ${p.activo ? "Activo" : "Inactivo"} | ID: ${p.id}`
            ).join("\n")
          }

        } else if (tc.function.name === "actualizar_stock") {
          const { error: errStock } = await supabase
            .from("productos")
            .update({ stock: args.stock })
            .eq("id", args.producto_id)

          toolResult = errStock
            ? `Error: ${errStock.message}`
            : `Stock actualizado a ${args.stock} unidades.`

        } else if (tc.function.name === "listar_productos") {
          const limite = Math.min(args.limite ?? 5, 10)
          let query = supabase
            .from("productos")
            .select("nombre, precio, stock, activo")
            .order("created_at", { ascending: false })
            .limit(limite)

          if (args.solo_activos) query = query.eq("activo", true)

          const { data: lista } = await query

          if (!lista?.length) {
            toolResult = "No hay productos en la tienda."
          } else {
            toolResult = lista.map((p: any, i: number) =>
              `${i + 1}. ${p.activo ? "✅" : "🔴"} ${p.nombre} — $${p.precio?.toLocaleString("es-CO")} — Stock: ${p.stock}`
            ).join("\n")
          }

        } else if (tc.function.name === "cambiar_estado_producto") {
          const { error: errEstado } = await supabase
            .from("productos")
            .update({ activo: args.activo })
            .eq("id", args.producto_id)

          toolResult = errEstado
            ? `Error: ${errEstado.message}`
            : `Producto ${args.activo ? "publicado ✅" : "ocultado 🔴"} correctamente.`
        }

        mensajesOAI.push({
          role: "tool",
          tool_call_id: tc.id,
          content: toolResult,
        })
      }
    }

    // ── Guardar historial actualizado ──────────────────────────────────────
    const nuevoHistorial = mensajesOAI
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .slice(-30)

    if (sesion) {
      await supabase
        .from("whatsapp_sesiones")
        .update({
          mensajes:   nuevoHistorial,
          updated_at: new Date().toISOString(),
        })
        .eq("numero", numero)
    } else {
      await supabase
        .from("whatsapp_sesiones")
        .insert([{
          numero,
          mensajes: nuevoHistorial,
          estado:   productoGuardado ? "completado" : "activo",
        }])
    }

    // ── Respuesta ──────────────────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        respuesta:         respuestaFinal,
        producto_guardado: productoGuardado,
        resultado_comando: resultadoComando,
      }),
      { headers: { ...CORS, "Content-Type": "application/json" } },
    )

  } catch (err: any) {
    console.error("whatsapp-admin error:", err)
    return new Response(
      JSON.stringify({ error: err.message ?? "Error interno" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    )
  }
})
