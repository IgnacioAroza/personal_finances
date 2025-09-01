BEGIN;

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

COMMIT;

