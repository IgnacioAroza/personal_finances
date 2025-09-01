import { createClient } from "@/lib/supabase/client";
import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Deriva first_name, last_name y avatar_url a partir de metadata
 * proveniente de proveedores OAuth (p.ej. Google)
 */
type Meta = Record<string, unknown> | undefined;

function getString(meta: Meta, key: string): string {
  const v = meta && (meta as Record<string, unknown>)[key];
  return typeof v === 'string' ? v : '';
}

export function deriveNamesFromMetadata(meta: Meta = {}): {
  first_name: string;
  last_name: string;
  avatar_url: string;
} {
  const full = (getString(meta, 'full_name') || getString(meta, 'name')).toString();
  const given = (getString(meta, 'given_name') || getString(meta, 'first_name')).toString();
  const family = (getString(meta, 'family_name') || getString(meta, 'last_name')).toString();
  const avatar = (getString(meta, 'avatar_url') || getString(meta, 'picture')).toString();

  const derivedFirst = (given || (full ? full.split(" ")[0] : "")).trim();
  const derivedLast = (
    family || (full && full.includes(" ") ? full.slice(full.indexOf(" ") + 1) : "")
  ).trim();

  return {
    first_name: derivedFirst,
    last_name: derivedLast,
    avatar_url: avatar,
  };
}

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
      // PGRST116: No row found when using single(), lo tratamos como "no encontrado"
      if ((error as PostgrestError).code === 'PGRST116') {
        return null;
      }
      console.warn(
        "Error al encontrar usuario en BD:",
        (error as PostgrestError).message || error
      );
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

    // Si no existe, crearlo (aunque debería haberse creado automáticamente por trigger)
    const derived = deriveNamesFromMetadata(user.user_metadata as Meta);
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        first_name: derived.first_name || '',
        last_name: derived.last_name || '',
        avatar_url: derived.avatar_url || '',
      });

    if (insertError) {
      const code = (insertError as PostgrestError).code;
      // 23505: unique_violation (probable carrera con trigger que ya insertó)
      if (code === '23505') {
        return true;
      }

      // Si hubo otro error, revalidar si el usuario ya existe (trigger puede haberlo insertado)
      const after = await getUserFromDatabase(user.id);
      if (after) return true;

      console.warn("Error al crear usuario:", (insertError as PostgrestError).message || insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error al asegurar que el usuario existe:", error);
    return false;
  }
}
