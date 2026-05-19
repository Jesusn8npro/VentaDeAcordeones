// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })

  try {
    const SUPABASE_URL             = Deno.env.get("SUPABASE_URL")!
    const SUPABASE_ANON_KEY        = Deno.env.get("SUPABASE_ANON_KEY")!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const RESEND_API_KEY           = Deno.env.get("RESEND_API_KEY")!

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY no configurada" }), {
        status: 500, headers: { ...CORS, "Content-Type": "application/json" }
      })
    }

    // Validar JWT
    const authHeader = req.headers.get("Authorization") ?? ""
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await userClient.auth.getUser()

    // Permitir llamadas desde service_role (webhooks) o usuarios autenticados
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    if (authError || !user) {
      // Verificar que viene con service role (llamada interna)
      const serviceKey = req.headers.get("x-service-key")
      if (serviceKey !== SUPABASE_SERVICE_ROLE_KEY) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: CORS
        })
      }
    }

    const { pedido_id } = await req.json()
    if (!pedido_id) {
      return new Response(JSON.stringify({ error: "pedido_id requerido" }), {
        status: 400, headers: { ...CORS, "Content-Type": "application/json" }
      })
    }

    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .select("*")
      .eq("id", pedido_id)
      .single()

    if (pedidoError || !pedido) {
      return new Response(JSON.stringify({ error: "Pedido no encontrado" }), {
        status: 404, headers: { ...CORS, "Content-Type": "application/json" }
      })
    }

    const productosHtml = (pedido.productos || []).map((p: any) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${p.nombre || p.name || 'Producto'}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${p.cantidad || p.quantity || 1}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${Number(p.precio || p.price || 0).toLocaleString('es-CO')}</td>
      </tr>
    `).join('')

    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
  <div style="text-align:center;margin-bottom:30px">
    <h1 style="color:#ff6b35;margin:0">🎶 VentaDeAcordeones.com</h1>
  </div>

  <div style="background:#f9f9f9;border-radius:12px;padding:24px;margin-bottom:24px">
    <h2 style="margin:0 0 8px 0;color:#1a1a2e">¡Gracias por tu pedido, ${pedido.nombre_cliente}!</h2>
    <p style="margin:0;color:#666">Tu pedido ha sido recibido y está siendo procesado.</p>
  </div>

  <div style="margin-bottom:24px">
    <h3 style="color:#1a1a2e;margin-bottom:12px">Resumen del pedido</h3>
    <p style="margin:4px 0"><strong>Número:</strong> ${pedido.numero_pedido}</p>
    <p style="margin:4px 0"><strong>Estado:</strong> ${pedido.estado}</p>
    <p style="margin:4px 0"><strong>Método de pago:</strong> ${pedido.metodo_pago || 'ePayco'}</p>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <thead>
      <tr style="background:#1a1a2e;color:#fff">
        <th style="padding:10px;text-align:left">Producto</th>
        <th style="padding:10px;text-align:center">Cant.</th>
        <th style="padding:10px;text-align:right">Precio</th>
      </tr>
    </thead>
    <tbody>${productosHtml}</tbody>
    <tfoot>
      <tr>
        <td colspan="2" style="padding:10px;text-align:right;font-weight:bold">Total:</td>
        <td style="padding:10px;text-align:right;font-weight:bold;color:#ff6b35;font-size:1.1em">$${Number(pedido.total || 0).toLocaleString('es-CO')} COP</td>
      </tr>
    </tfoot>
  </table>

  ${pedido.direccion_envio ? `
  <div style="background:#e8f5e9;border-radius:8px;padding:16px;margin-bottom:24px">
    <h3 style="margin:0 0 8px 0;color:#2d5a2d">Dirección de envío</h3>
    <p style="margin:0;color:#555">${typeof pedido.direccion_envio === 'string' ? pedido.direccion_envio : JSON.stringify(pedido.direccion_envio)}</p>
  </div>
  ` : ''}

  <div style="text-align:center;color:#999;font-size:0.875rem;margin-top:32px;border-top:1px solid #eee;padding-top:16px">
    <p>¿Tienes preguntas? Contáctanos por WhatsApp o escríbenos a info@ventadeacordeones.com</p>
    <p>© ${new Date().getFullYear()} VentaDeAcordeones.com — Colombia 🇨🇴</p>
  </div>
</body>
</html>`

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VentaDeAcordeones.com <noreply@ventadeacordeones.com>",
        to: [pedido.email_cliente],
        subject: `Confirmación de pedido #${pedido.numero_pedido} — VentaDeAcordeones.com`,
        html,
      }),
    })

    if (!resendRes.ok) {
      const err = await resendRes.text()
      throw new Error(`Resend ${resendRes.status}: ${err}`)
    }

    const resendData = await resendRes.json()

    return new Response(JSON.stringify({ ok: true, email_id: resendData.id }), {
      headers: { ...CORS, "Content-Type": "application/json" }
    })
  } catch (err: any) {
    console.error("email-confirmacion error:", err)
    return new Response(JSON.stringify({ error: err.message ?? "Error interno" }), {
      status: 500, headers: { ...CORS, "Content-Type": "application/json" }
    })
  }
})
