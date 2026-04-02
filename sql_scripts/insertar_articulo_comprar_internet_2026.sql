-- Script: insertar_articulo_comprar_internet_2026.sql
-- Inserta un artículo publicado: "Recomendaciones de cómo comprar en internet en 2026".
-- Compatible con la tabla public."ARTICULO" (ver crear_tabla_articulo.sql)

begin;

insert into public."ARTICULO" (
  slug,
  titulo,
  autor,
  autor_iniciales,
  fecha_publicacion,
  lectura_min,
  calificacion,
  portada_url,
  resumen_breve,
  resumen_completo,
  secciones,
  cta,
  estado_publicacion
) values (
  'comprar-en-internet-2026',
  'Recomendaciones para comprar en internet en 2026',
  'Pedro Ramírez',
  'PR',
  '2026-01-15T00:00:00Z',
  16,
  4.7,
  'https://picsum.photos/seed/compras-2026-cover/800/450',
  'Guía clara para comprar online en 2026: seguridad, comparación inteligente, pagos, envíos y devoluciones.',
  'Esta guía te ayuda a decidir mejor: reconocer tiendas confiables, comparar precio vs valor, pagar de forma segura, entender envíos y devoluciones, y automatizar seguimiento. Pensada para uso cotidiano, sin tecnicismos innecesarios.',
  '[
    {
      "id":"vision-general",
      "titulo":"Visión general",
      "parrafos":[
        "Comprar online en 2026 es más cómodo y seguro si aplicas buenas prácticas.",
        "El objetivo es reducir riesgos y mejorar la experiencia: información clara, pagos confiables y entregas previsibles."
      ],
      "subsecciones":[
        {
          "titulo":"Qué lograrás",
          "parrafos":[
            "Evitar fraudes y compras impulsivas.",
            "Elegir opciones con mejor valor total y soporte confiable."
          ]
        }
      ],
      "imagen":{"url":"https://picsum.photos/seed/compra-vision-2026/720/405","alt":"Visión compras 2026","caption":"Camino seguro"}
    },
    {
      "id":"seguridad-confianza",
      "titulo":"Seguridad y confianza",
      "parrafos":[
        "Verifica identidad del vendedor: dominio, empresa, políticas visibles y canales de soporte.",
        "Lee reseñas reales y busca señales de transparencia: precios coherentes, fotos propias y términos claros."
      ],
      "lista_items":[
        "Dominio y certificados válidos",
        "Políticas de devolución y garantía visibles",
        "Canales de contacto activos y tiempos de respuesta"
      ],
      "subsecciones":[
        {"titulo":"Señales de alerta","parrafos":["Precios demasiado bajos sin justificación.","Imágenes genéricas y textos vagos."]},
        {"titulo":"Cómo comprobar","parrafos":["Busca reseñas verificadas y presencia en redes/marketplaces.","Consulta términos y condiciones antes de pagar."]}
      ],
      "imagen":{"url":"https://picsum.photos/seed/compra-seguridad-2026/720/405","alt":"Seguridad","caption":"Confianza verificable"}
    },
    {
      "id":"comparacion-precio-valor",
      "titulo":"Comparación: precio vs valor",
      "parrafos":[
        "El precio importa, pero el valor depende de calidad, soporte y costos asociados.",
        "Compara opciones con criterios objetivos: materiales, garantía, uso real y costo total." 
      ],
      "lista_items":[
        "Calidad y materiales",
        "Garantía y servicio postventa",
        "Costo total: envío, accesorios, mantenimiento"
      ],
      "subsecciones":[
        {"titulo":"Herramientas útiles","parrafos":["Usa comparadores y filtra por características relevantes.","Evita guiarte solo por estrellas: lee reseñas con contexto."]}
      ],
      "imagen":{"url":"https://picsum.photos/seed/compra-valor-2026/720/405","alt":"Valor","caption":"Más que precio"}
    },
    {
      "id":"metodos-pago",
      "titulo":"Métodos de pago",
      "parrafos":[
        "Prefiere pasarelas confiables con protección de comprador.",
        "Verifica autenticación en dos pasos y evita compartir datos fuera de flujos seguros."
      ],
      "lista_items":[
        "Tarjeta con 3DS y monitoreo de transacciones",
        "Carteras digitales y pagos rápidos",
        "Transferencias solo a cuentas verificadas"
      ],
      "subsecciones":[
        {"titulo":"Buenas prácticas","parrafos":["Guarda comprobantes y correos de confirmación.","Activa alertas de movimientos en tu banco."]}
      ],
      "imagen":{"url":"https://picsum.photos/seed/compra-pago-2026/720/405","alt":"Pagos","caption":"Procesos confiables"}
    },
    {
      "id":"envios-logistica",
      "titulo":"Envíos y logística",
      "parrafos":[
        "Elige opciones con seguimiento en tiempo real y ventanas de entrega claras.",
        "Considera costos de envío y políticas de reintentos o almacenamiento en puntos de recogida."
      ],
      "lista_items":[
        "Seguimiento y notificaciones",
        "Ventanas de entrega y reintentos",
        "Puntos de recogida y seguros"
      ],
      "subsecciones":[
        {"titulo":"Qué revisar","parrafos":["Costos ocultos y tiempos poco realistas.","Cobertura de daños y manejo de paquetes frágiles."]}
      ],
      "imagen":{"url":"https://picsum.photos/seed/compra-envio-2026/720/405","alt":"Envíos","caption":"Entrega previsible"}
    },
    {
      "id":"devoluciones-garantias",
      "titulo":"Devoluciones y garantías",
      "parrafos":[
        "Lee condiciones antes de comprar: plazos, estados aceptados y costos de devolución.",
        "Documenta con fotos y guarda comunicaciones para agilizar el proceso."
      ],
      "lista_items":[
        "Plazos y estados de producto",
        "Costos de envío de vuelta",
        "Soporte y tiempos de respuesta"
      ],
      "subsecciones":[
        {"titulo":"Cómo gestionar","parrafos":["Solicita número de caso y confirma dirección de envío.","Empaca adecuadamente y conserva evidencias."]}
      ],
      "imagen":{"url":"https://picsum.photos/seed/compra-devolucion-2026/720/405","alt":"Devoluciones","caption":"Proceso claro"}
    },
    {
      "id":"suscripciones-recompras",
      "titulo":"Suscripciones y recompras",
      "parrafos":[
        "Las suscripciones pueden ahorrar tiempo si se ajustan a tu consumo real.",
        "Revisa facilidad para pausar/cancelar y beneficios adicionales (descuentos, soporte)."
      ],
      "lista_items":[
        "Periodicidad y consumo real",
        "Beneficios y condiciones",
        "Facilidad de gestión"
      ],
      "subsecciones":[
        {"titulo":"Evita sorpresas","parrafos":["Configura recordatorios y revisa estados mensuales.","Evalúa si sigue aportando valor tras 3–6 meses."]}
      ],
      "imagen":{"url":"https://picsum.photos/seed/compra-suscripcion-2026/720/405","alt":"Suscripciones","caption":"Conveniencia controlada"}
    },
    {
      "id":"guia-pasos",
      "titulo":"Guía paso a paso",
      "lista_ordenada":[
        "Define necesidad y presupuesto",
        "Compara precio vs valor",
        "Verifica vendedor y políticas",
        "Elige método de pago seguro",
        "Confirma envío y seguimiento",
        "Guarda comprobantes y documentación"
      ],
      "subsecciones":[
        {"titulo":"Checklist práctico","parrafos":["Usa comparadores y reseñas con contexto.","Prioriza tiendas con soporte claro y tiempos confiables."]}
      ]
    },
    {
      "id":"conclusion",
      "titulo":"Conclusión",
      "parrafos":[
        "Comprar bien en 2026 es aplicar criterios simples con constancia.",
        "Con seguridad, valor y logística clara, la experiencia es realmente conveniente."
      ]
    }
  ]'::jsonb,
  '{"items":[
    {"tipo":"link","estilo":"primario","texto":"Empezar checklist","href":"/checklist"},
    {"tipo":"link","estilo":"outline","texto":"Aprender más","href":"/blog"},
    {"tipo":"link","estilo":"whatsapp","texto":"Asesoría","href":"https://wa.me/573001234567"}
  ]}'::jsonb,
  'publicado'
);

commit;