-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (sincronizada con auth.users de Supabase)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT NOT NULL DEFAULT '📦',
    color TEXT NOT NULL DEFAULT '#6B7280',
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ingresos
CREATE TABLE income (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de gastos
CREATE TABLE expenses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_income_user_id ON income(user_id);
CREATE INDEX idx_income_date ON income(date);
CREATE INDEX idx_income_category_id ON income(category_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_updated_at BEFORE UPDATE ON income 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para forzar descripcion vacía cuando venga NULL
CREATE OR REPLACE FUNCTION public.set_empty_description()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.description IS NULL THEN
        NEW.description := '';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS income_set_empty_description ON public.income;
CREATE TRIGGER income_set_empty_description
  BEFORE INSERT OR UPDATE ON public.income
  FOR EACH ROW EXECUTE FUNCTION public.set_empty_description();

DROP TRIGGER IF EXISTS expenses_set_empty_description ON public.expenses;
CREATE TRIGGER expenses_set_empty_description
  BEFORE INSERT OR UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_empty_description();

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para users
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas de seguridad para categories
CREATE POLICY "Users can view their own categories" ON categories
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own categories" ON categories
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own categories" ON categories
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own categories" ON categories
    FOR DELETE USING (user_id = auth.uid());

-- Políticas de seguridad para income
CREATE POLICY "Users can view their own income" ON income
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own income" ON income
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own income" ON income
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own income" ON income
    FOR DELETE USING (user_id = auth.uid());

-- Políticas de seguridad para expenses
CREATE POLICY "Users can view their own expenses" ON expenses
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own expenses" ON expenses
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own expenses" ON expenses
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own expenses" ON expenses
    FOR DELETE USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  fn TEXT;
  ln TEXT;
  v_full TEXT;
  given TEXT;
  family TEXT;
  avatar TEXT;
BEGIN
  -- Extraer variantes típicas de proveedores OAuth (Google)
  v_full := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name');
  given := NEW.raw_user_meta_data->>'given_name';
  family := NEW.raw_user_meta_data->>'family_name';
  avatar := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture');

  -- Derivar first_name
  fn := NULLIF(btrim(COALESCE(
    NEW.raw_user_meta_data->>'first_name',
    given,
    CASE 
      WHEN v_full IS NOT NULL AND length(v_full) > 0 THEN split_part(v_full, ' ', 1)
      ELSE NULL
    END
  )), '');

  -- Derivar last_name (si no viene explícito, tomar todo después del primer espacio)
  ln := NULLIF(btrim(COALESCE(
    NEW.raw_user_meta_data->>'last_name',
    family,
    CASE 
      WHEN v_full IS NOT NULL AND position(' ' in v_full) > 0 
        THEN btrim(substring(v_full from position(' ' in v_full) + 1))
      ELSE NULL
    END
  )), '');

  INSERT INTO public.users (id, email, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    fn,
    ln,
    avatar
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar triggers existentes antes de crearlos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger para crear usuario automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para crear categorías por defecto para nuevos usuarios
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
DECLARE
    user_uuid UUID := NEW.id;
BEGIN
  -- Categorías de gastos por defecto
  INSERT INTO public.categories (name, type, icon, color, user_id) VALUES
    ('Alimentación', 'expense', '🍔', '#EF4444', user_uuid),
    ('Transporte', 'expense', '🚗', '#3B82F6', user_uuid),
    ('Entretenimiento', 'expense', '🎬', '#8B5CF6', user_uuid),
    ('Salud', 'expense', '⚕️', '#10B981', user_uuid),
    ('Educación', 'expense', '📚', '#F59E0B', user_uuid),
    ('Hogar', 'expense', '🏠', '#6B7280', user_uuid),
    ('Ropa', 'expense', '👕', '#EC4899', user_uuid),
    ('Otros gastos', 'expense', '💳', '#64748B', user_uuid);
  
  -- Categorías de ingresos por defecto
  INSERT INTO public.categories (name, type, icon, color, user_id) VALUES
    ('Salario', 'income', '💼', '#059669', user_uuid),
    ('Freelance', 'income', '💻', '#0891B2', user_uuid),
    ('Inversiones', 'income', '📈', '#7C3AED', user_uuid),
    ('Otros ingresos', 'income', '💰', '#DC2626', user_uuid);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger existente antes de crearlo
DROP TRIGGER IF EXISTS on_user_created_add_categories ON public.users;

-- Trigger para crear categorías por defecto
CREATE TRIGGER on_user_created_add_categories
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_categories();
