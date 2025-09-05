import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { deriveNamesFromMetadata } from '@/lib/user-utils';

export function useUserInitialization() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Obtener el usuario actual de Supabase Auth
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          setIsLoaded(true);
          return;
        }

        setUser(authUser);
        setIsLoaded(true);

        if (!authUser) {
          setIsInitialized(false);
          return;
        }

        // Verificar si el usuario existe en nuestra tabla users
        console.log('Checking if user exists in database...');
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authUser.id)
          .single();

        console.log('User check result:', { userData, userError });

        if (userError && userError.code === 'PGRST116') {
          // Usuario no existe en nuestra tabla, lo creamos con nombres derivados de metadata
          console.log('Creating new user in database...');
          console.log('Auth user data:', {
            id: authUser.id,
            email: authUser.email,
            metadata: authUser.user_metadata
          });
          
          const derived = deriveNamesFromMetadata(authUser.user_metadata);
          console.log('Derived user data:', derived);
          
          const insertData = {
            id: authUser.id,
            email: authUser.email || '',
            first_name: derived.first_name || '',
            last_name: derived.last_name || '',
            avatar_url: derived.avatar_url || '',
          };
          
          console.log('Data to insert:', insertData);
          
          const { data: insertResult, error: insertError } = await supabase
            .from('users')
            .insert(insertData)
            .select(); // Agregar select para ver qué se insertó

          if (insertError) {
            console.error('Error creating user:', {
              error: insertError,
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              code: insertError.code
            });
            console.error('User data being inserted:', insertData);
          } else {
            console.log('User created successfully:', insertResult);
            setIsInitialized(true);
          }
        } else if (userError) {
          // Error diferente al usuario no encontrado
          console.error('Unexpected error checking user:', {
            error: userError,
            message: userError.message,
            code: userError.code,
            details: userError.details
          });
          setIsInitialized(false);
        } else if (userData) {
          // El usuario existe; si faltan nombres/imagen, completar desde metadata
          const { data: fullUserRow } = await supabase
            .from('users')
            .select('first_name, last_name, avatar_url')
            .eq('id', authUser.id)
            .single();

          const derived = deriveNamesFromMetadata(authUser.user_metadata);
          const updates: Record<string, string> = {};

          if ((!fullUserRow?.first_name || fullUserRow.first_name.trim() === '') && derived.first_name) {
            updates.first_name = derived.first_name;
          }
          if ((!fullUserRow?.last_name || fullUserRow.last_name.trim() === '') && derived.last_name) {
            updates.last_name = derived.last_name;
          }
          if ((!fullUserRow?.avatar_url || fullUserRow.avatar_url.trim() === '') && derived.avatar_url) {
            updates.avatar_url = derived.avatar_url;
          }

          if (Object.keys(updates).length > 0) {
            await supabase
              .from('users')
              .update({
                ...updates,
                updated_at: new Date().toISOString(),
              })
              .eq('id', authUser.id);
          }

          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setIsLoaded(true);
      }
    };

    initializeUser();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setIsInitialized(true);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsInitialized(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, isLoaded, isInitialized };
}
