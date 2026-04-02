-- ===== POLÍTICAS RLS PARA TABLA PRODUCTOS =====
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Habilitar RLS en la tabla productos (si no está habilitado)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- 2. Política para SELECT (leer productos) - Permitir a todos ver productos activos
CREATE POLICY "productos_select_policy" ON productos
FOR SELECT USING (
  activo = true OR auth.uid() IS NOT NULL
);

-- 3. Política para INSERT (crear productos) - Solo usuarios autenticados
CREATE POLICY "productos_insert_policy" ON productos
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- 4. Política para UPDATE (actualizar productos) - Solo usuarios autenticados
CREATE POLICY "productos_update_policy" ON productos
FOR UPDATE USING (
  auth.uid() IS NOT NULL
) WITH CHECK (
  auth.uid() IS NOT NULL
);

-- 5. Política para DELETE (eliminar productos) - Solo usuarios autenticados
CREATE POLICY "productos_delete_policy" ON productos
FOR DELETE USING (
  auth.uid() IS NOT NULL
);

-- 6. Política adicional para permitir acceso completo a servicios (N8N, etc.)
-- Esta política permite operaciones desde servicios usando service_role
CREATE POLICY "productos_service_policy" ON productos
FOR ALL USING (
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.uid() IS NOT NULL
);

-- ===== VERIFICACIÓN =====
-- Para verificar que las políticas se crearon correctamente:
-- SELECT * FROM pg_policies WHERE tablename = 'productos';