import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

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
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authUser.id)
          .single();

        if (userError && userError.code === 'PGRST116') {
          // Usuario no existe en nuestra tabla, pero debería haberse creado automáticamente
          // Esto puede pasar si el trigger falló, así que lo creamos manualmente
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email || '',
              first_name: authUser.user_metadata?.first_name || '',
              last_name: authUser.user_metadata?.last_name || '',
              avatar_url: authUser.user_metadata?.avatar_url || '',
            });

          if (insertError) {
            console.error('Error creating user:', insertError);
          } else {
            setIsInitialized(true);
          }
        } else if (userData) {
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
