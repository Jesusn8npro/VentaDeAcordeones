-- ============================================================
-- FIX: Errores 500 en Supabase — Ejecutar en SQL Editor
-- Dashboard → https://supabase.com/dashboard/project/dxcpzivxzxvhabdimemb/sql
-- ============================================================

-- PASO 1: Crear función is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol::text = 'admin'
  );
$$;

-- PASO 2: Alias es_admin()
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT public.is_admin();
$$;

-- PASO 3: Permisos de ejecución
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.es_admin() TO anon, authenticated;

-- PASO 4: Arreglar RLS del carrito (soporte para sesión anónima)
DROP POLICY IF EXISTS "carrito_own" ON carrito;
DROP POLICY IF EXISTS "carrito_admin_all" ON carrito;
DROP POLICY IF EXISTS "carrito_acceso" ON carrito;

CREATE POLICY "carrito_acceso" ON carrito
FOR ALL
USING (
  usuario_id = auth.uid()
  OR (auth.uid() IS NULL AND usuario_id IS NULL)
  OR is_admin()
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND usuario_id = auth.uid())
  OR (auth.uid() IS NULL AND usuario_id IS NULL)
  OR is_admin()
);

-- PASO 5: Crear RPC migrar_carrito_a_usuario
CREATE OR REPLACE FUNCTION public.migrar_carrito_a_usuario(
  p_session_id TEXT,
  p_usuario_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE carrito
  SET
    usuario_id = p_usuario_id,
    session_id = NULL,
    actualizado_el = NOW()
  WHERE
    session_id = p_session_id
    AND usuario_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM carrito c2
      WHERE c2.usuario_id = p_usuario_id
        AND c2.producto_id = carrito.producto_id
    );

  DELETE FROM carrito
  WHERE session_id = p_session_id AND usuario_id IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.migrar_carrito_a_usuario(TEXT, UUID) TO anon, authenticated;

-- PASO 6: Arreglar RLS de leadschat (chat widget necesita INSERT público)
DROP POLICY IF EXISTS "leadschat_admin_only" ON leadschat;
DROP POLICY IF EXISTS "leadschat_insert_publico" ON leadschat;
DROP POLICY IF EXISTS "leadschat_update_propio" ON leadschat;
DROP POLICY IF EXISTS "leadschat_select_admin" ON leadschat;
DROP POLICY IF EXISTS "leadschat_delete_admin" ON leadschat;

CREATE POLICY "leadschat_insert_publico" ON leadschat
FOR INSERT WITH CHECK (true);

CREATE POLICY "leadschat_update_propio" ON leadschat
FOR UPDATE USING (is_admin() OR auth.uid() IS NOT NULL);

CREATE POLICY "leadschat_select_admin" ON leadschat
FOR SELECT USING (is_admin());

CREATE POLICY "leadschat_delete_admin" ON leadschat
FOR DELETE USING (is_admin());

-- ============================================================
-- VERIFICACIÓN — corre esto después para confirmar
-- ============================================================
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_admin', 'es_admin', 'migrar_carrito_a_usuario');
