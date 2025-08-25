import { supabase } from "@/lib/supabase";

/**
 * Obtiene el ID interno del usuario desde la tabla users usando el clerk_user_id
 * @param clerkUserId - El ID del usuario de Clerk
 * @returns El ID interno del usuario o null si no se encuentra
 */
export async function getUserInternalId(clerkUserId: string) {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_user_id", clerkUserId)
      .single();

    if (error || !user) {
      console.error("Error al encontrar usuario:", error);
      return null;
    }

    return user.id;
  } catch (error) {
    console.error("Error al obtener ID interno del usuario:", error);
    return null;
  }
}

/**
 * Verifica que un usuario existe y retorna su ID interno
 * @param clerkUserId - El ID del usuario de Clerk
 * @returns El ID interno del usuario o lanza un error
 */
export async function requireUserInternalId(clerkUserId: string) {
  const userId = await getUserInternalId(clerkUserId);
  
  if (!userId) {
    throw new Error("Usuario no encontrado");
  }

  return userId;
}

/**
 * Asegura que el usuario actual existe en la base de datos.
 * Si no existe, lo crea automáticamente.
 * @returns Promise<boolean> - true si el usuario existe o fue creado exitosamente
 */
export async function ensureUserExists(): Promise<boolean> {
  try {
    // Verificar si el usuario existe
    const response = await fetch('/api/users');
    
    if (response.status === 404) {
      console.log('Usuario no encontrado, creando...');
      // Usuario no existe, crearlo
      const createResponse = await fetch('/api/users', { method: 'POST' });
      
      if (createResponse.ok) {
        console.log('Usuario creado exitosamente');
        return true;
      } else {
        console.error('Error creando usuario:', await createResponse.text());
        return false;
      }
    } else if (response.ok) {
      // Usuario ya existe
      return true;
    } else {
      console.error('Error verificando usuario:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error en ensureUserExists:', error);
    return false;
  }
}
