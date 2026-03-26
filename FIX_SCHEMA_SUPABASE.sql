-- 1. Crear/Corregir tabla de empresas_gestionadas (Multitenancy Master)
CREATE TABLE IF NOT EXISTS empresas_gestionadas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES auth.users(id),
    nombre_empresa TEXT NOT NULL,
    ruc_empresa TEXT NOT NULL,
    moneda TEXT DEFAULT 'USD',
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Asegurar que las tablas tengan id_empresa para multitenancy si no lo tienen
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='entidades' AND column_name='id_empresa') THEN
        ALTER TABLE entidades ADD COLUMN id_empresa UUID REFERENCES empresas_gestionadas(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transacciones' AND column_name='id_empresa') THEN
        ALTER TABLE transacciones ADD COLUMN id_empresa UUID REFERENCES empresas_gestionadas(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plan_cuentas' AND column_name='id_empresa') THEN
        ALTER TABLE plan_cuentas ADD COLUMN id_empresa UUID REFERENCES empresas_gestionadas(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE empresas_gestionadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE entidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_cuentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE SEGURIDAD (EJEMPLO)

-- Ver/Crear sus propias empresas
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias empresas" ON empresas_gestionadas;
CREATE POLICY "Usuarios pueden ver sus propias empresas" ON empresas_gestionadas
    FOR SELECT USING (auth.uid() = id_usuario);

DROP POLICY IF EXISTS "Usuarios pueden crear sus propias empresas" ON empresas_gestionadas;
CREATE POLICY "Usuarios pueden crear sus propias empresas" ON empresas_gestionadas
    FOR INSERT WITH CHECK (auth.uid() = id_usuario);

-- Ver entidades de sus empresas
DROP POLICY IF EXISTS "Usuarios pueden ver entidades de sus empresas" ON entidades;
CREATE POLICY "Usuarios pueden ver entidades de sus empresas" ON entidades
    FOR ALL USING (
        id_empresa IN (
            SELECT id FROM empresas_gestionadas WHERE id_usuario = auth.uid()
        )
    );
