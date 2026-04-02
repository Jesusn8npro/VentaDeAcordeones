[
  {
    "column_name": "id",
    "data_type": "uuid",
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()"
  },
  {
    "column_name": "nombre",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "slug",
    "data_type": "character varying",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "ganchos",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "beneficios",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "ventajas",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "precio",
    "data_type": "numeric",
    "is_nullable": "NO",
    "column_default": null
  },
  {
    "column_name": "precio_original",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "descuento",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "column_name": "estado",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'nuevo'::character varying"
  },
  {
    "column_name": "categoria_id",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "stock",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "column_name": "stock_minimo",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "5"
  },
  {
    "column_name": "landing_tipo",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'catalogo'::character varying"
  },
  {
    "column_name": "destacado",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "false"
  },
  {
    "column_name": "activo",
    "data_type": "boolean",
    "is_nullable": "YES",
    "column_default": "true"
  },
  {
    "column_name": "peso",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "dimensiones",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "marca",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "modelo",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "color",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "talla",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "material",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "garantia_meses",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "12"
  },
  {
    "column_name": "origen_pais",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": "'Colombia'::character varying"
  },
  {
    "column_name": "palabras_clave",
    "data_type": "ARRAY",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "meta_title",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "meta_description",
    "data_type": "character varying",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "creado_por",
    "data_type": "uuid",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "creado_el",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "column_name": "actualizado_el",
    "data_type": "timestamp with time zone",
    "is_nullable": "YES",
    "column_default": "now()"
  },
  {
    "column_name": "banner_animado",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{\"mensajes\": [\"🚚 ¡ENVÍO GRATIS a toda Colombia en compras mayores a $50.000!\", \"💳 Compra 100% SEGURA - Paga contraentrega sin riesgo\", \"🛡️ GARANTÍA TOTAL o te devolvemos el 100% de tu dinero\", \"⚡ OFERTA LIMITADA - Solo por hoy descuentos hasta 70% OFF\"], \"textColor\": \"#FFFFFF\", \"velocidad\": \"normal\", \"backgroundColor\": \"#FF4444\"}'::jsonb"
  },
  {
    "column_name": "puntos_dolor",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{\"titulo\": \"¿Te sientes identificado con estos problemas diarios?\", \"timeline\": [], \"subtitulo\": \"Miles de personas sufren estos inconvenientes cada día. ¡Tú no tienes que ser una de ellas!\"}'::jsonb"
  },
  {
    "column_name": "caracteristicas",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{\"cta\": {\"texto\": \"¡QUIERO APROVECHAR ESTA OFERTA!\", \"subtexto\": \"🔥 Oferta por tiempo limitado\"}, \"imagen\": \"\", \"titulo\": \"¿Por qué miles de personas eligen nuestro producto?\", \"detalles\": [], \"subtitulo\": \"Descubre las características que lo hacen único y especial\", \"beneficios\": []}'::jsonb"
  },
  {
    "column_name": "testimonios",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{\"titulo\": \"¡+15.847 CLIENTES YA TRANSFORMARON SU VIDA!\", \"subtitulo\": \"Lee lo que dicen nuestros clientes reales sobre su experiencia\", \"testimonios\": [], \"estadisticas\": {\"recomiendan\": 98, \"satisfaccion\": 4.9, \"totalClientes\": 0}}'::jsonb"
  },
  {
    "column_name": "faq",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{\"titulo\": \"Preguntas Frecuentes\", \"preguntas\": [], \"subtitulo\": \"Resolvemos todas tus dudas para que compres con total confianza\"}'::jsonb"
  },
  {
    "column_name": "garantias",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{\"titulo\": \"Compra con Total Confianza\", \"garantias\": [], \"subtitulo\": \"Tu satisfacción y seguridad son nuestra prioridad #1\"}'::jsonb"
  },
  {
    "column_name": "cta_final",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'{\"envio\": \"🚚 Envío GRATIS en 24-48 horas\", \"titulo\": \"¡ÚLTIMA OPORTUNIDAD!\", \"garantia\": \"🛡️ Garantía de satisfacción del 100% o te devolvemos tu dinero\", \"urgencia\": \"⚡ Oferta válida solo por hoy\", \"descuento\": \"70% OFF\", \"subtitulo\": \"No dejes pasar esta oferta única. Miles ya han transformado su vida.\", \"botonTexto\": \"¡QUIERO MI TRANSFORMACIÓN AHORA!\", \"precioActual\": \"\", \"precioAnterior\": \"\"}'::jsonb"
  },
  {
    "column_name": "numero_de_ventas",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "calificacion_promedio",
    "data_type": "numeric",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "column_name": "total_resenas",
    "data_type": "integer",
    "is_nullable": "YES",
    "column_default": "0"
  },
  {
    "column_name": "promociones",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": "'[]'::jsonb"
  },
  {
    "column_name": "descripcion",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "ventajas_jsonb",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "beneficios_jsonb",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  },
  {
    "column_name": "caracteristicas_jsonb",
    "data_type": "jsonb",
    "is_nullable": "YES",
    "column_default": null
  }
]