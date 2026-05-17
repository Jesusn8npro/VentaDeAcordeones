// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const HERRAMIENTA_GENERAR = {
  type: "function",
  function: {
    name: "generar_producto",
    description: "Llama esta herramienta cuando tengas suficiente información para construir el producto completo. Requiere mínimo: nombre, precio, categoría, stock y descripción.",
    parameters: {
      type: "object",
      properties: {
        nombre:                { type: "string",  description: "Nombre completo del producto" },
        slug:                  { type: "string",  description: "URL en kebab-case, ej: hohner-corona-ii-blanco" },
        descripcion_titulo:    { type: "string",  description: "Título de la sección de descripción" },
        descripcion_contenido: { type: "string",  description: "Descripción completa, 2-4 párrafos" },
        precio:                { type: "number",  description: "Precio en COP (solo número, sin puntos ni comas)" },
        precio_original:       { type: "number",  description: "Precio antes del descuento (si aplica)" },
        descuento:             { type: "number",  description: "Porcentaje de descuento 0-100" },
        categoria_id:          { type: "string",  description: "ID exacto de la categoría" },
        stock:                 { type: "number",  description: "Unidades en inventario" },
        stock_minimo:          { type: "number",  description: "Stock mínimo de alerta (default 2)" },
        estado:                { type: "string",  enum: ["nuevo", "usado", "vendido", "agotado", "descontinuado"] },
        activo:                { type: "boolean" },
        destacado:             { type: "boolean" },
        marca:                 { type: "string" },
        modelo:                { type: "string" },
        peso:                  { type: "number",  description: "Peso en kg" },
        ganchos:               { type: "array",   items: { type: "string" }, description: "3-5 frases cortas y atractivas sobre por qué comprar este producto" },
        palabras_clave:        { type: "array",   items: { type: "string" }, description: "5-10 palabras clave SEO" },
        meta_title:            { type: "string",  description: "Título SEO, máx 60 caracteres" },
        meta_description:      { type: "string",  description: "Descripción SEO, máx 160 caracteres" },
      },
      required: ["nombre", "slug", "precio", "stock", "descripcion_contenido"],
    },
  },
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })

  try {
    const SUPABASE_URL            = Deno.env.get("SUPABASE_URL")!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const OPENAI_API_KEY          = Deno.env.get("OPENAI_API_KEY")!
    const OPENAI_MODEL            = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini"

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const body = await req.json()
    const {
      mensaje,
      mensajes      = [],
      modo_edicion  = false,
      producto_actual = null,
    } = body

    if (!mensaje?.trim()) {
      return new Response(
        JSON.stringify({ error: "mensaje es requerido" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
      )
    }

    // Cargar categorías activas
    const { data: categoriasDB } = await supabase
      .from("categorias")
      .select("id, nombre")
      .eq("activo", true)
      .order("orden", { ascending: true })

    const listaCategorias = categoriasDB?.length
      ? categoriasDB.map((c: any) => `  • ${c.nombre} → ID: "${c.id}"`).join("\n")
      : "  (Sin categorías disponibles)"

    // System prompt según modo
    const systemPrompt = modo_edicion && producto_actual
      ? `Eres un asistente especializado en editar fichas de productos para VentaDeAcordeones.Com, tienda colombiana de acordeones y accesorios musicales.

PRODUCTO ACTUAL QUE SE ESTÁ EDITANDO:
${JSON.stringify(producto_actual, null, 2)}

CATEGORÍAS DISPONIBLES:
${listaCategorias}

Tu tarea: ayuda al administrador a mejorar o corregir el producto según sus instrucciones.
Cuando tengas claro qué cambios hacer, llama a generar_producto con el producto completo actualizado.
Haz UNA pregunta a la vez. Sé breve y directo.`
      : `Eres un asistente especializado en crear fichas de productos para VentaDeAcordeones.Com, tienda colombiana de acordeones y accesorios musicales.

CATEGORÍAS DISPONIBLES (usa el ID exacto):
${listaCategorias}

FLUJO — haz UNA sola pregunta por turno:
1. Nombre completo y marca del producto
2. Precio en pesos colombianos (COP)
3. Categoría (indica el nombre, yo uso el ID correcto)
4. Stock disponible (número de unidades)
5. Descripción y características principales
6. ¿Tiene precio original o descuento?
7. En cuanto tengas nombre, precio, categoría, stock y descripción → llama a generar_producto

REGLAS:
- Una sola pregunta por turno, sé conciso
- Slug: kebab-case del nombre, ej "Hohner Corona II Blanco" → "hohner-corona-ii-blanco"
- Precios: números enteros sin puntos ni comas (ej 2850000)
- Ganchos: 3-5 frases cortas y vendedoras ("Sonido potente y limpio", "Ideal para vallenato profesional")
- meta_title máx 60 chars · meta_description máx 160 chars
- Estado default: "nuevo" · activo: true · stock_minimo: 2
- Cuando tengas lo esencial, genera el producto SIN pedir más datos`

    // Historial de mensajes para OpenAI
    const historial: any[] = mensajes
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .map((m: any) => ({ role: m.role, content: m.content }))

    const mensajesOAI: any[] = [
      { role: "system", content: systemPrompt },
      ...historial,
      { role: "user", content: mensaje },
    ]

    // Bucle OpenAI con tool_calls
    for (let i = 0; i < 6; i++) {
      const oaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model:       OPENAI_MODEL,
          messages:    mensajesOAI,
          tools:       [HERRAMIENTA_GENERAR],
          tool_choice: "auto",
          temperature: 0.7,
          max_tokens:  2000,
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
        return new Response(
          JSON.stringify({ respuesta_agente: msg.content ?? "" }),
          { headers: { ...CORS, "Content-Type": "application/json" } },
        )
      }

      mensajesOAI.push(msg)

      for (const tc of msg.tool_calls) {
        if (tc.function.name === "generar_producto") {
          let producto: any = {}
          try { producto = JSON.parse(tc.function.arguments) } catch (_) {}

          // Devolver producto generado
          return new Response(
            JSON.stringify({ producto_generado: producto }),
            { headers: { ...CORS, "Content-Type": "application/json" } },
          )
        }
        // Herramienta desconocida — continuar
        mensajesOAI.push({ role: "tool", tool_call_id: tc.id, content: "OK" })
      }
    }

    return new Response(
      JSON.stringify({ respuesta_agente: "No pude completar la solicitud. Por favor proporciona más información sobre el producto." }),
      { headers: { ...CORS, "Content-Type": "application/json" } },
    )
  } catch (err: any) {
    console.error("crear-producto-ia error:", err)
    return new Response(
      JSON.stringify({ error: err.message ?? "Error interno" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    )
  }
})
