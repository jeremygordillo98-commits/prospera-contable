-- Esquema de Base de Datos para Prospera Pymes (Contabilidad MVP)

-- 1. Entidades (Terceros)
CREATE TYPE tipo_entidad_enum AS ENUM ('Cliente', 'Proveedor', 'Empleado', 'Accionista', 'SRI');

CREATE TABLE entidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ruc_cedula TEXT UNIQUE NOT NULL,
    razon_social TEXT NOT NULL,
    tipo_entidad tipo_entidad_enum NOT NULL DEFAULT 'Proveedor',
    email TEXT,
    telefono TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Plan de Cuentas
CREATE TYPE tipo_cuenta_enum AS ENUM ('Activo', 'Pasivo', 'Patrimonio', 'Ingreso', 'Gasto');

CREATE TABLE plan_cuentas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_cuenta TEXT UNIQUE NOT NULL, -- Ej: 1.1.01
    nombre TEXT NOT NULL,
    tipo tipo_cuenta_enum NOT NULL,
    acepta_movimientos BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Transacciones (Cabecera del Asiento)
CREATE TABLE transacciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    concepto TEXT NOT NULL,
    tipo_comprobante TEXT, -- Ej: Factura, Retención, Nota de Crédito
    numero_comprobante TEXT,
    id_entidad UUID REFERENCES entidades(id),
    xml_referencia TEXT, -- URL de bucket o path
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Movimientos (Detalle del Asiento)
CREATE TABLE movimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_transaccion UUID NOT NULL REFERENCES transacciones(id) ON DELETE CASCADE,
    id_cuenta UUID NOT NULL REFERENCES plan_cuentas(id),
    debe NUMERIC(15,2) NOT NULL DEFAULT 0,
    haber NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Validación: La suma total por transacción debe ser 0. (Se maneja mejor con lógica de negocio o triggers, pero aquí se estructura el dato.)
    CONSTRAINT check_debe_haber CHECK (debe >= 0 AND haber >= 0)
);

-- 5. Documentos SRI (Para ATS)
CREATE TABLE documentos_sri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_transaccion UUID REFERENCES transacciones(id) ON DELETE CASCADE,
    clave_acceso_xml TEXT UNIQUE,
    base_0 NUMERIC(15,2) DEFAULT 0,
    base_12 NUMERIC(15,2) DEFAULT 0,
    monto_iva NUMERIC(15,2) DEFAULT 0,
    retenciones_aplicadas JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices para desempeño
CREATE INDEX idx_movimientos_transaccion ON movimientos(id_transaccion);
CREATE INDEX idx_movimientos_cuenta ON movimientos(id_cuenta);
CREATE INDEX idx_transacciones_fecha ON transacciones(fecha);
CREATE INDEX idx_entidades_ruc ON entidades(ruc_cedula);
