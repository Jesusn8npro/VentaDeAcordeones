-- Script: insertar_articulo_ejemplo.sql
-- Inserta un artículo de ejemplo en public."ARTICULO"

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
  'a4-2025',
  'Audi A4 2025: Guía de compra definitiva',
  'Jesús González',
  'JG',
  '2025-06-26T00:00:00Z',
  10,
  4.9,
  'https://picsum.photos/seed/audi-a4-2025/1200/700',
  'Muchos sueñan con conducir un Audi A4 con estilo y eficiencia. Esta guía resume versiones, tecnología, costos, financiación y pasos prácticos para comprar inteligente en 2025.',
  'Guía con criterios prácticos: qué versión elegir, equipamiento realmente útil y costos totales para comprar sin sorpresas. El objetivo: decisión informada y disfrute en cada kilómetro.',
  '[
    {"id":"vision-general","titulo":"Visión general","parrafos":["El Audi A4 2025 ofrece diseño refinado, tecnología clara y marcha serena.","Esta guía te orienta para elegir versión, equipamiento útil y costos."],"subsecciones":[{"titulo":"En qué destaca en 2025","parrafos":["Motores mild-hybrid, chasis más estable y MMI más intuitivo."]}],"imagen":{"url":"https://picsum.photos/seed/audi-a4-vision/960/540","alt":"Visión general A4 2025","caption":"Equilibrio diario"}},
    {"id":"experiencia-conduccion","titulo":"Experiencia de conducción","parrafos":["Dirección precisa, suspensión equilibrada e insonorización que reduce fatiga."],"subsecciones":[{"titulo":"Lo que sentirás al volante","parrafos":["Apoyo predecible y serenidad en autopista."]},{"titulo":"Ritmo y consumo","parrafos":["Mild-hybrid suaviza detenciones y ayuda al consumo."]}],"imagen":{"url":"https://picsum.photos/seed/audi-a4-drive/960/540","alt":"Conducción A4","caption":"Marcha serena"}},
    {"id":"diseno-interior","titulo":"Diseño e interior","parrafos":["Materiales agradables, ergonomía cuidada y visibilidad clara."],"subsecciones":[{"titulo":"Ergonomía y materiales","parrafos":["Mandos esenciales accesibles y buenos ajustes."]},{"titulo":"Espacio y confort","parrafos":["Plazas amplias y aislamiento acústico consistente."]}],"imagen":{"url":"https://picsum.photos/seed/audi-a4-cabin/960/540","alt":"Cabina A4","caption":"Minimalista y funcional"}},
    {"id":"tecnologia-seguridad","titulo":"Tecnología y seguridad","parrafos":["MMI rápido, asistentes que ayudan y conectividad estable."],"lista_items":["Asistencias: carril, frenado, crucero adaptativo y 360°","Infotenimiento: visualización nítida y comandos simples","Seguridad pasiva: cabina estable"],"subsecciones":[{"titulo":"Asistentes en uso real","parrafos":["Correcciones suaves y frenado con margen."]},{"titulo":"Infotenimiento y conectividad","parrafos":["Interfaz legible y personalización útil."]}],"imagen":{"url":"https://picsum.photos/seed/audi-a4-tech/960/540","alt":"Tecnología A4","caption":"Interfaz clara"}},
    {"id":"para-quien-beneficios","titulo":"¿Para quién es? Beneficios","parrafos":["Ideal para profesionales y familias que buscan comodidad y eficiencia."],"lista_items":["Comodidad diaria","Imagen profesional","Eficiencia real","Reventa"],"subsecciones":[{"titulo":"Perfiles recomendados","parrafos":["Uso mixto ciudad y autopista, silencio y buena reventa."]}]},
    {"id":"comparativa-inteligente","titulo":"Comparativa inteligente","parrafos":["A4 equilibra serenidad frente a Serie 3 (deportivo) y Clase C (lujo)."],"lista_items":["BMW Serie 3: deportivo","Mercedes Clase C: lujo clásico","Audi A4: equilibrio diario"]},
    {"id":"costos-financiacion","titulo":"Costos y financiación","parrafos":["Presupuesto total: cuota, mensualidad, seguro y mantenimiento."],"lista_items":["Plan tradicional","Leasing","Seguro amplio"],"subsecciones":[{"titulo":"Presupuesto total real","parrafos":["Mantenimientos programados y consumos previsibles."]},{"titulo":"Recomendación financiera","parrafos":["Leasing si renuevas cada pocos años; tradicional si uso prolongado."]}],"imagen":{"url":"https://picsum.photos/seed/audi-a4-finance/960/540","alt":"Financiación A4","caption":"Flujo de caja"}},
    {"id":"guia-pasos","titulo":"Guía de compra paso a paso","lista_ordenada":["Define uso y presupuesto","Elige versión","Solicita cotización y compara","Agenda test drive","Negocia extras","Cierra financiación y seguro"],"subsecciones":[{"titulo":"Consejos del vendedor","parrafos":["Compara 2–3 ofertas y negocia mantenimiento y garantías."]}]},
    {"id":"objeciones-respuestas","titulo":"Objeciones y respuestas","lista_items":["Es caro — valor y reventa","Tecnología — MMI claro","Quiero deportividad — paquete dinámico","Costos — mantenimiento programado"],"parrafos":["Prueba de manejo enfocada convierte dudas en confianza."]},
    {"id":"conclusion","titulo":"Conclusión","parrafos":["El A4 2025 es compra inteligente para quien valora equilibrio.","Agenda un test drive y confirma que se ajusta a tu uso."]}
  ]'::jsonb,
  '{"items":[{"tipo":"link","estilo":"primario","texto":"Solicitar cotización","href":"/contacto"},{"tipo":"link","estilo":"outline","texto":"Agendar test drive","href":"/agendar"},{"tipo":"link","estilo":"whatsapp","texto":"Hablar por WhatsApp","href":"https://wa.me/573001234567"}]}'::jsonb,
  'publicado'
);

commit;