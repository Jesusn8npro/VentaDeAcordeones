-- ===== SCRIPT TEMPORAL PARA DESHABILITAR RLS EN PRODUCTOS =====
-- ⚠️ USAR SOLO PARA TESTING - NO RECOMENDADO EN PRODUCCIÓN ⚠️

-- Deshabilitar RLS temporalmente en la tabla productos
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;

-- Para volver a habilitar RLS después del testing:
-- ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- ===== VERIFICACIÓN =====
-- Para verificar el estado de RLS:
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename = 'productos';