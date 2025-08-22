import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export function useUserInitialization() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const initializeUser = async () => {
      if (!isLoaded || !user) return;

      try {
        // Verificar si el usuario existe en nuestra BD
        const response = await fetch('/api/users');
        
        if (response.status === 404) {
          // Usuario no existe, crearlo
          await fetch('/api/users', { method: 'POST' });
        }
      } catch (error) {
        console.error('Error inicializando usuario:', error);
      }
    };

    initializeUser();
  }, [user, isLoaded]);

  return { user, isLoaded };
}
