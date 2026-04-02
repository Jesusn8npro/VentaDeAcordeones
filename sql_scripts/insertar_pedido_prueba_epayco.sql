-- Script para insertar un pedido de prueba con datos de ePayco
-- Esto nos permitirá verificar que la confirmación funciona correctamente

-- 1. Insertar un pedido de prueba en la tabla pedidos
INSERT INTO pedidos (
  numero_pedido,
  usuario_id,
  nombre_cliente,
  email_cliente,
  telefono_cliente,
  direccion_envio,
  productos,
  subtotal,
  descuento_aplicado,
  costo_envio,
  total,
  estado,
  metodo_pago,
  referencia_pago,
  notas_cliente
) VALUES (
  'PED-' || EXTRACT(EPOCH FROM NOW())::text,
  '00000000-0000-0000-0000-000000000000', -- Usuario genérico
  'Cliente de Prueba',
  'cliente@prueba.com',
  '3001234567',
  '{
    "direccion": "Calle 123 #45-67",
    "ciudad": "Bogotá",
    "departamento": "Cundinamarca",
    "codigoPostal": "110111"
  }',
  '[
    {
      "id": "prod123",
      "nombre": "Producto de Prueba",
      "precio": 50000,
      "cantidad": 2
    }
  ]',
  100000,
  0,
  5000,
  105000,
  'pendiente',
  'epayco',
  'test123', -- referencia_pago (aquí va el ref_payco)
  'Pedido de prueba para verificar integración con ePayco'
);

-- 2. Insertar el log de transacción de ePayco
INSERT INTO transacciones_epayco_logs (
  pedido_id,
  epayco_ref_payco,
  epayco_transaction_id,
  tipo_evento,
  estado_anterior,
  estado_nuevo,
  cod_response,
  mensaje_response,
  signature_valida,
  datos_completos
) VALUES (
  (SELECT id FROM pedidos WHERE referencia_pago = 'test123' ORDER BY creado_el DESC LIMIT 1),
  'test123',
  'test456',
  'confirmacion',
  'pendiente',
  'pagado',
  '1',
  'Transacción exitosa',
  true,
  '{
    "ref_payco": "test123",
    "transaction_id": "test456",
    "cod_response": "1",
    "response_reason_text": "Transacción exitosa",
    "signature": "signature_test",
    "approval_code": "approval_123",
    "fecha_transaccion": "2024-01-01 12:00:00",
    "franchise": "VISA",
    "bank_name": "BANCO_PRUEBA",
    "test_request": "1"
  }'
);

-- 3. Verificar que se insertó correctamente
SELECT 
  p.numero_pedido,
  p.nombre_cliente,
  p.total,
  p.estado,
  p.metodo_pago,
  p.referencia_pago,
  p.creado_el,
  t.epayco_ref_payco,
  t.epayco_transaction_id,
  t.cod_response,
  t.tipo_evento,
  t.creado_el as log_creado_el
FROM pedidos p
LEFT JOIN transacciones_epayco_logs t ON p.id = t.pedido_id
WHERE p.referencia_pago = 'test123'
ORDER BY p.creado_el DESC
LIMIT 5;

-- 4. Consulta para ver todos los pedidos con sus logs de ePayco
SELECT 
  p.numero_pedido,
  p.nombre_cliente,
  p.email_cliente,
  p.total,
  p.estado,
  p.referencia_pago,
  t.epayco_ref_payco,
  t.epayco_transaction_id,
  t.cod_response,
  t.tipo_evento,
  p.creado_el
FROM pedidos p
LEFT JOIN transacciones_epayco_logs t ON p.id = t.pedido_id
WHERE p.metodo_pago = 'epayco'
ORDER BY p.creado_el DESC;