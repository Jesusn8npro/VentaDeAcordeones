-- ================================================================
-- MIGRACIÓN: RLS básico + tabla whatsapp_sesiones
-- Fecha: 2026-05-16
-- INSTRUCCIONES: Ejecutar en Supabase SQL Editor
-- ================================================================

-- ----------------------------------------------------------------
-- 1. TABLA WHATSAPP_SESIONES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatsapp_sesiones (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  numero      TEXT        NOT NULL UNIQUE,
  mensajes    JSONB       NOT NULL DEFAULT '[]',
  estado      TEXT        NOT NULL DEFAULT 'activo'
                          CHECK (estado IN ('activo', 'completado', 'cancelado')),
  producto_pendiente JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_sesiones_numero ON whatsapp_sesiones(numero);

-- ----------------------------------------------------------------
-- 2. RLS — TABLAS PÚBLICAS (lectura libre)
-- ----------------------------------------------------------------

-- productos
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "productos_public_select" ON productos
  FOR SELECT USING (true);

CREATE POLICY "productos_admin_all" ON productos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
    )
  );

-- categorias
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categorias_public_select" ON categorias
  FOR SELECT USING (true);

CREATE POLICY "categorias_admin_all" ON categorias
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
    )
  );

-- configuracion_tienda
ALTER TABLE configuracion_tienda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "configuracion_public_select" ON configuracion_tienda
  FOR SELECT USING (true);

CREATE POLICY "configuracion_admin_all" ON configuracion_tienda
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
    )
  );

-- producto_imagenes
ALTER TABLE producto_imagenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prod_imagenes_public_select" ON producto_imagenes
  FOR SELECT USING (true);

CREATE POLICY "prod_imagenes_admin_all" ON producto_imagenes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- 3. RLS — USUARIOS (solo el propio registro)
-- ----------------------------------------------------------------
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- SELECT: el propio usuario o admin
CREATE POLICY "usuarios_own_select" ON usuarios
  FOR SELECT
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM usuarios u2 WHERE u2.id = auth.uid() AND u2.rol = 'admin'
  ));

-- INSERT: usuario autenticado crea su propio registro (flujo sign-up)
CREATE POLICY "usuarios_own_insert" ON usuarios
  FOR INSERT WITH CHECK (id = auth.uid());

-- UPDATE: propio o admin
CREATE POLICY "usuarios_own_update" ON usuarios
  FOR UPDATE
  USING (id = auth.uid() OR EXISTS (
    SELECT 1 FROM usuarios u2 WHERE u2.id = auth.uid() AND u2.rol = 'admin'
  ));

-- ----------------------------------------------------------------
-- 4. RLS — CARRITO (usuario o sesión anónima)
-- ----------------------------------------------------------------
ALTER TABLE carrito ENABLE ROW LEVEL SECURITY;

-- Acceso por usuario_id autenticado O session_id (anónimo)
CREATE POLICY "carrito_own" ON carrito
  FOR ALL
  USING (
    (auth.uid() IS NOT NULL AND usuario_id = auth.uid())
    OR
    (auth.uid() IS NULL AND usuario_id IS NULL)
  );

CREATE POLICY "carrito_admin_all" ON carrito
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- 5. RLS — PEDIDOS (solo el dueño o admin)
-- ----------------------------------------------------------------
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pedidos_own" ON pedidos
  FOR ALL
  USING (
    usuario_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
    )
  );

ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pedido_items_own" ON pedido_items
  FOR ALL
  USING (
    pedido_id IN (
      SELECT id FROM pedidos WHERE usuario_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
    )
  );

-- ----------------------------------------------------------------
-- 6. RLS — FAVORITOS Y RESEÑAS
-- ----------------------------------------------------------------
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favoritos_own" ON favoritos
  FOR ALL USING (usuario_id = auth.uid());

ALTER TABLE resenas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resenas_public_select" ON resenas
  FOR SELECT USING (true);

CREATE POLICY "resenas_own_write" ON resenas
  FOR ALL USING (usuario_id = auth.uid());

-- ----------------------------------------------------------------
-- 7. RLS — TABLAS ADMIN (solo admins y service_role)
-- ----------------------------------------------------------------
ALTER TABLE leadschat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leadschat_admin_only" ON leadschat
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
    )
  );

ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventario_admin_only" ON inventario
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
    )
  );

-- whatsapp_sesiones: solo admins
ALTER TABLE whatsapp_sesiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "whatsapp_sesiones_admin_only" ON whatsapp_sesiones
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid() AND usuarios.rol = 'admin'
    )
  );
