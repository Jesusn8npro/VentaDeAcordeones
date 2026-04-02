-- =====================================================
-- SCRIPT DE DIAGNÓSTICO COMPLETO PARA FLUJO EPAYCO
-- =====================================================
-- Este script ayuda a diagnosticar problemas en el flujo de ePayco
-- Ejecutar después de realizar una transacción para verificar el estado

-- =====================================================
-- 1. VERIFICAR CONFIGURACIÓN DE URLS
-- =====================================================
-- Nota: Las URLs deben estar configuradas correctamente en:
-- - src/configuracion/constantes.js
-- - Variables de entorno (.env)
-- URLs esperadas:
-- RESPONSE_URL: http://localhost:3002/respuesta-epayco
-- CONFIRMATION_URL: http://localhost:3002/confirmacion-epayco

-- =====================================================
-- 2. VERIFICAR ÚLTIMO PEDIDO CREADO
-- =====================================================
SELECT 
    'ÚLTIMO PEDIDO CREADO' as diagnostico,
    id,
    numero_pedido,
    estado,
    metodo_pago,
    total,
    creado_el,
    actualizado_el,
    -- Campos de ePayco
    epayco_ref_payco,
    epayco_transaction_id,
    epayco_cod_response,
    epayco_test_request
FROM pedidos 
WHERE metodo_pago = 'epayco'
ORDER BY creado_el DESC 
LIMIT 1;

-- =====================================================
-- 3. VERIFICAR LOGS DE TRANSACCIONES EPAYCO
-- =====================================================
SELECT 
    'LOGS DE TRANSACCIONES' as diagnostico,
    id,
    pedido_id,
    tipo_evento,
    estado_nuevo,
    epayco_ref_payco,
    epayco_transaction_id,
    cod_response,
    mensaje_response,
    creado_el,
    -- Verificar si hay datos completos
    CASE 
        WHEN datos_completos IS NOT NULL THEN 'SÍ'
        ELSE 'NO'
    END as tiene_datos_completos
FROM transacciones_epayco_logs 
ORDER BY creado_el DESC 
LIMIT 5;

-- =====================================================
-- 4. BUSCAR PEDIDOS SIN DATOS DE EPAYCO
-- =====================================================
SELECT 
    'PEDIDOS SIN DATOS EPAYCO' as diagnostico,
    COUNT(*) as total_pedidos_sin_datos,
    COUNT(CASE WHEN creado_el >= NOW() - INTERVAL '1 hour' THEN 1 END) as ultima_hora,
    COUNT(CASE WHEN creado_el >= NOW() - INTERVAL '1 day' THEN 1 END) as ultimo_dia
FROM pedidos 
WHERE metodo_pago = 'epayco' 
    AND (epayco_ref_payco IS NULL OR epayco_transaction_id IS NULL);

-- =====================================================
-- 5. VERIFICAR PEDIDOS CON DATOS PARCIALES
-- =====================================================
SELECT 
    'ANÁLISIS DE CAMPOS EPAYCO' as diagnostico,
    id,
    numero_pedido,
    estado,
    -- Verificar qué campos están llenos
    CASE WHEN epayco_ref_payco IS NOT NULL THEN '✓' ELSE '✗' END as ref_payco,
    CASE WHEN epayco_transaction_id IS NOT NULL THEN '✓' ELSE '✗' END as transaction_id,
    CASE WHEN epayco_cod_response IS NOT NULL THEN '✓' ELSE '✗' END as cod_response,
    CASE WHEN epayco_signature IS NOT NULL THEN '✓' ELSE '✗' END as signature,
    CASE WHEN epayco_approval_code IS NOT NULL THEN '✓' ELSE '✗' END as approval_code,
    CASE WHEN epayco_fecha_transaccion IS NOT NULL THEN '✓' ELSE '✗' END as fecha_transaccion,
    CASE WHEN epayco_franchise IS NOT NULL THEN '✓' ELSE '✗' END as franchise,
    CASE WHEN epayco_bank_name IS NOT NULL THEN '✓' ELSE '✗' END as bank_name,
    CASE WHEN epayco_test_request IS NOT NULL THEN '✓' ELSE '✗' END as test_request,
    CASE WHEN epayco_extra_data IS NOT NULL THEN '✓' ELSE '✗' END as extra_data,
    CASE WHEN epayco_response_raw IS NOT NULL THEN '✓' ELSE '✗' END as response_raw,
    creado_el,
    actualizado_el
FROM pedidos 
WHERE metodo_pago = 'epayco'
ORDER BY creado_el DESC 
LIMIT 5;

-- =====================================================
-- 6. VERIFICAR RELACIÓN ENTRE PEDIDOS Y LOGS
-- =====================================================
SELECT 
    'RELACIÓN PEDIDOS-LOGS' as diagnostico,
    p.id as pedido_id,
    p.numero_pedido,
    p.estado as estado_pedido,
    p.epayco_ref_payco as pedido_ref_payco,
    COUNT(t.id) as total_logs,
    MAX(t.creado_el) as ultimo_log,
    STRING_AGG(DISTINCT t.tipo_evento, ', ') as tipos_eventos
FROM pedidos p
LEFT JOIN transacciones_epayco_logs t ON p.id = t.pedido_id
WHERE p.metodo_pago = 'epayco'
    AND p.creado_el >= NOW() - INTERVAL '1 day'
GROUP BY p.id, p.numero_pedido, p.estado, p.epayco_ref_payco
ORDER BY p.creado_el DESC;

-- =====================================================
-- 7. RESUMEN DE DIAGNÓSTICO
-- =====================================================
SELECT 
    'RESUMEN DIAGNÓSTICO' as diagnostico,
    (SELECT COUNT(*) FROM pedidos WHERE metodo_pago = 'epayco' AND creado_el >= NOW() - INTERVAL '1 day') as pedidos_epayco_hoy,
    (SELECT COUNT(*) FROM pedidos WHERE metodo_pago = 'epayco' AND epayco_ref_payco IS NOT NULL AND creado_el >= NOW() - INTERVAL '1 day') as pedidos_con_ref_payco_hoy,
    (SELECT COUNT(*) FROM transacciones_epayco_logs WHERE creado_el >= NOW() - INTERVAL '1 day') as logs_epayco_hoy,
    (SELECT COUNT(DISTINCT pedido_id) FROM transacciones_epayco_logs WHERE creado_el >= NOW() - INTERVAL '1 day') as pedidos_con_logs_hoy;

-- =====================================================
-- 8. CONSULTA ESPECÍFICA PARA EL PEDIDO PROBLEMÁTICO
-- =====================================================
-- Reemplazar 'f0487b95-8881-46d1-a81a-a4cb3d55f98a' con el ID del pedido específico

SELECT 
    'DIAGNÓSTICO PEDIDO ESPECÍFICO' as diagnostico,
    'DATOS DEL PEDIDO' as seccion,
    p.*
FROM pedidos p
WHERE p.id = 'f0487b95-8881-46d1-a81a-a4cb3d55f98a';

SELECT 
    'DIAGNÓSTICO PEDIDO ESPECÍFICO' as diagnostico,
    'LOGS RELACIONADOS' as seccion,
    t.*
FROM transacciones_epayco_logs t
WHERE t.pedido_id = 'f0487b95-8881-46d1-a81a-a4cb3d55f98a';

-- =====================================================
-- INSTRUCCIONES DE USO:
-- =====================================================
-- 1. Ejecutar este script después de realizar una transacción de prueba
-- 2. Revisar cada sección para identificar dónde se pierde la información
-- 3. Si no hay logs, el problema está en el frontend (URLs o listener)
-- 4. Si hay logs pero no datos en pedidos, el problema está en actualizarPedidoConEpayco
-- 5. Si faltan campos específicos, revisar el mapeo de datos en el hook