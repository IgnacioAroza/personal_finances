import { createClient } from "@/lib/supabase/client";

/**
 * Obtiene el usuario actual autenticado
 * @returns El usuario de Supabase Auth o null si no está autenticado
 */
export async function getCurrentUser() {
  const supabase = createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Error al obtener usuario actual:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    return null;
  }
}

/**
 * Verifica que un usuario existe en nuestra tabla users
 * @param userId - El ID del usuario de Supabase Auth
 * @returns Los datos del usuario o null si no se encuentra
 */
export async function getUserFromDatabase(userId: string) {
  const supabase = createClient();
  
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error al encontrar usuario en BD:", error);
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error al obtener usuario de BD:", error);
    return null;
  }
}

/**
 * Verifica que un usuario existe y retorna sus datos
 * @param userId - El ID del usuario de Supabase Auth
 * @returns Los datos del usuario o lanza un error
 */
export async function requireUser(userId: string) {
  const user = await getUserFromDatabase(userId);
  
  if (!user) {
    throw new Error("Usuario no encontrado en la base de datos");
  }

  return user;
}

/**
 * Asegura que el usuario actual existe en la base de datos.
 * Si no existe, lo crea automáticamente.
 * @returns Promise<boolean> - true si el usuario existe o fue creado exitosamente
 */
export async function ensureUserExists(): Promise<boolean> {
  const supabase = createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.error("Usuario no autenticado:", error);
      return false;
    }

    // Verificar si el usuario existe en nuestra tabla
    const existingUser = await getUserFromDatabase(user.id);
    
    if (existingUser) {
      return true;
    }

    // Si no existe, crearlo (aunque debería haberse creado automáticamente)
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || '',
        last_name: user.user_metadata?.last_name || '',
        avatar_url: user.user_metadata?.avatar_url || '',
      });

    if (insertError) {
      console.error("Error al crear usuario:", insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error al asegurar que el usuario existe:", error);
    return false;
  }
}
