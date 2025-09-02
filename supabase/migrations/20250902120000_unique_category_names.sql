-- Crear índice único para evitar categorías duplicadas por usuario y tipo
-- Esto garantiza que un usuario no pueda tener dos categorías con el mismo nombre y tipo

CREATE UNIQUE INDEX IF NOT EXISTS categories_user_name_type_unique_idx 
ON categories (user_id, LOWER(TRIM(name)), type) 
WHERE is_active = true;

-- Comentario explicativo
COMMENT ON INDEX categories_user_name_type_unique_idx IS 
'Garantiza que no haya categorías duplicadas por usuario y tipo (case-insensitive, trimmed)';
