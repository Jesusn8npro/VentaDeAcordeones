-- ============================================================
-- FIX: Recursión infinita en RLS → causa 500 en productos/categorias
-- Ejecutar en: SQL Editor de Supabase
-- ============================================================

-- PASO 1: Arreglar usuarios_own_select (se llama a sí misma recursivamente)
DROP POLICY IF EXISTS "usuarios_own_select" ON usuarios;
CREATE POLICY "usuarios_own_select" ON usuarios
FOR SELECT USING (
  id = auth.uid() OR is_admin()
);

-- PASO 2: Arreglar usuarios_own_update (mismo problema)
DROP POLICY IF EXISTS "usuarios_own_update" ON usuarios;
CREATE POLICY "usuarios_own_update" ON usuarios
FOR UPDATE USING (
  id = auth.uid() OR is_admin()
) WITH CHECK (
  id = auth.uid() OR is_admin()
);

-- PASO 3: Arreglar categorias_admin_all (hacía SELECT directo en usuarios → recursión)
DROP POLICY IF EXISTS "categorias_admin_all" ON categorias;
CREATE POLICY "categorias_admin_all" ON categorias
FOR ALL USING (is_admin());

-- PASO 4: Arreglar productos_admin_all (mismo problema)
DROP POLICY IF EXISTS "productos_admin_all" ON productos;
CREATE POLICY "productos_admin_all" ON productos
FOR ALL USING (is_admin());

-- PASO 5: Arreglar prod_imagenes_admin_all (mismo problema)
DROP POLICY IF EXISTS "prod_imagenes_admin_all" ON producto_imagenes;
CREATE POLICY "prod_imagenes_admin_all" ON producto_imagenes
FOR ALL USING (is_admin());

-- PASO 6: Limpiar políticas duplicadas en carrito (dejar solo las dos limpias)
DROP POLICY IF EXISTS "carrito_actualizar" ON carrito;
DROP POLICY IF EXISTS "carrito_eliminar" ON carrito;
DROP POLICY IF EXISTS "carrito_insertar" ON carrito;
DROP POLICY IF EXISTS "carrito_propietario" ON carrito;
DROP POLICY IF EXISTS "carrito_propio" ON carrito;

-- PASO 7: Limpiar leadschat: eliminar duplicadas y las que usan emails hardcodeados
DROP POLICY IF EXISTS "delete_leadschat_admin" ON leadschat;
DROP POLICY IF EXISTS "select_leadschat_admin" ON leadschat;
DROP POLICY IF EXISTS "update_leadschat_admin" ON leadschat;
DROP POLICY IF EXISTS "leadschat_admin" ON leadschat;
DROP POLICY IF EXISTS "leadschat_insertar" ON leadschat;

-- ============================================================
-- VERIFICACIÓN: políticas que deben quedar
-- ============================================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('categorias', 'productos', 'usuarios', 'producto_imagenes', 'carrito', 'leadschat')
ORDER BY tablename, policyname;
