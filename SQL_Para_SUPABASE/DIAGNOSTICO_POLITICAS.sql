-- DIAGNÓSTICO: Ver todas las políticas RLS activas
SELECT
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('categorias', 'productos', 'usuarios', 'producto_imagenes', 'carrito', 'leadschat')
ORDER BY tablename, policyname;
