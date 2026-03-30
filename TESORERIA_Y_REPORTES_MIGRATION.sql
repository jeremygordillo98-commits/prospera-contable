-- Prospera Pymes · Tesorería + Contabilidad operativa
-- Ejecutar DESPUÉS de SCHEMA.sql y FIX_SCHEMA_SUPABASE.sql

create extension if not exists "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movimientos' AND column_name='id_empresa') THEN
    ALTER TABLE movimientos ADD COLUMN id_empresa UUID REFERENCES empresas_gestionadas(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='movimientos' AND column_name='detalle') THEN
    ALTER TABLE movimientos ADD COLUMN detalle TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transacciones' AND column_name='id_usuario') THEN
    ALTER TABLE transacciones ADD COLUMN id_usuario UUID REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documentos_sri' AND column_name='id_empresa') THEN
    ALTER TABLE documentos_sri ADD COLUMN id_empresa UUID REFERENCES empresas_gestionadas(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS cuentas_financieras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_empresa UUID NOT NULL REFERENCES empresas_gestionadas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'Banco',
  moneda TEXT DEFAULT 'USD',
  numero_referencia TEXT,
  saldo_inicial NUMERIC(15,2) NOT NULL DEFAULT 0,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tesoreria_documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_empresa UUID NOT NULL REFERENCES empresas_gestionadas(id) ON DELETE CASCADE,
  id_entidad UUID REFERENCES entidades(id) ON DELETE SET NULL,
  id_transaccion UUID REFERENCES transacciones(id) ON DELETE SET NULL,
  tipo_documento TEXT NOT NULL,
  origen TEXT NOT NULL DEFAULT 'Manual',
  referencia TEXT,
  concepto TEXT NOT NULL,
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  total NUMERIC(15,2) NOT NULL DEFAULT 0,
  saldo_pendiente NUMERIC(15,2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'Pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tesoreria_movimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_empresa UUID NOT NULL REFERENCES empresas_gestionadas(id) ON DELETE CASCADE,
  id_cuenta_financiera UUID REFERENCES cuentas_financieras(id) ON DELETE SET NULL,
  id_entidad UUID REFERENCES entidades(id) ON DELETE SET NULL,
  id_documento UUID REFERENCES tesoreria_documentos(id) ON DELETE SET NULL,
  id_transaccion UUID REFERENCES transacciones(id) ON DELETE SET NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo_movimiento TEXT NOT NULL,
  origen TEXT NOT NULL DEFAULT 'Manual',
  referencia TEXT,
  concepto TEXT NOT NULL,
  monto NUMERIC(15,2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'Aplicado',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cf_empresa ON cuentas_financieras(id_empresa);
CREATE INDEX IF NOT EXISTS idx_td_empresa ON tesoreria_documentos(id_empresa);
CREATE INDEX IF NOT EXISTS idx_tm_empresa ON tesoreria_movimientos(id_empresa);
CREATE INDEX IF NOT EXISTS idx_mov_empresa ON movimientos(id_empresa);
CREATE INDEX IF NOT EXISTS idx_docsri_empresa ON documentos_sri(id_empresa);

ALTER TABLE cuentas_financieras ENABLE ROW LEVEL SECURITY;
ALTER TABLE tesoreria_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tesoreria_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_sri ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden gestionar cuentas_financieras" ON cuentas_financieras;
CREATE POLICY "Usuarios pueden gestionar cuentas_financieras" ON cuentas_financieras
FOR ALL USING (id_empresa IN (SELECT id FROM empresas_gestionadas WHERE id_usuario = auth.uid()))
WITH CHECK (id_empresa IN (SELECT id FROM empresas_gestionadas WHERE id_usuario = auth.uid()));

DROP POLICY IF EXISTS "Usuarios pueden gestionar tesoreria_documentos" ON tesoreria_documentos;
CREATE POLICY "Usuarios pueden gestionar tesoreria_documentos" ON tesoreria_documentos
FOR ALL USING (id_empresa IN (SELECT id FROM empresas_gestionadas WHERE id_usuario = auth.uid()))
WITH CHECK (id_empresa IN (SELECT id FROM empresas_gestionadas WHERE id_usuario = auth.uid()));

DROP POLICY IF EXISTS "Usuarios pueden gestionar tesoreria_movimientos" ON tesoreria_movimientos;
CREATE POLICY "Usuarios pueden gestionar tesoreria_movimientos" ON tesoreria_movimientos
FOR ALL USING (id_empresa IN (SELECT id FROM empresas_gestionadas WHERE id_usuario = auth.uid()))
WITH CHECK (id_empresa IN (SELECT id FROM empresas_gestionadas WHERE id_usuario = auth.uid()));

DROP POLICY IF EXISTS "Usuarios pueden gestionar documentos_sri" ON documentos_sri;
CREATE POLICY "Usuarios pueden gestionar documentos_sri" ON documentos_sri
FOR ALL USING (id_empresa IN (SELECT id FROM empresas_gestionadas WHERE id_usuario = auth.uid()))
WITH CHECK (id_empresa IN (SELECT id FROM empresas_gestionadas WHERE id_usuario = auth.uid()));
