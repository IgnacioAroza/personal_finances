-- Migración para agregar soporte multi-moneda
-- Fecha: 2025-10-01

-- 1. Agregar campo currency a la tabla income
ALTER TABLE income 
ADD COLUMN currency TEXT NOT NULL DEFAULT 'ARS'
CHECK (currency IN ('ARS', 'USD', 'EUR'));

-- 2. Agregar campo currency a la tabla expenses
ALTER TABLE expenses 
ADD COLUMN currency TEXT NOT NULL DEFAULT 'ARS'
CHECK (currency IN ('ARS', 'USD', 'EUR'));

-- 3. Crear tabla de configuración de usuario
CREATE TABLE user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    default_currency TEXT NOT NULL DEFAULT 'ARS'
        CHECK (default_currency IN ('ARS', 'USD', 'EUR')),
    active_currencies TEXT[] NOT NULL DEFAULT ARRAY['ARS', 'USD', 'EUR'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Índices para mejorar rendimiento
CREATE INDEX idx_income_currency ON income(currency);
CREATE INDEX idx_expenses_currency ON expenses(currency);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

-- 5. Habilitar RLS en user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de seguridad para user_settings
CREATE POLICY "Users can view their own settings" ON user_settings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own settings" ON user_settings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings" ON user_settings
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own settings" ON user_settings
    FOR DELETE USING (user_id = auth.uid());

-- 7. Trigger para updated_at en user_settings
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Función para crear configuración por defecto para nuevos usuarios
CREATE OR REPLACE FUNCTION public.create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id, default_currency, active_currencies)
  VALUES (NEW.id, 'ARS', ARRAY['ARS', 'USD', 'EUR']);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger para crear configuración por defecto
CREATE TRIGGER on_user_created_add_settings
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_user_settings();

-- 10. Crear configuración para usuarios existentes
INSERT INTO user_settings (user_id, default_currency, active_currencies)
SELECT 
    id, 
    'ARS', 
    ARRAY['ARS', 'USD', 'EUR']
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_settings WHERE user_id IS NOT NULL);