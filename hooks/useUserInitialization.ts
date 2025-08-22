import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

export function useUserInitialization() {
  const { user, isLoaded } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeUser = async () => {
      if (!isLoaded || !user) return;

      try {
        // Verificar si el usuario existe en nuestra BD
        const response = await fetch('/api/users');
        
        if (response.status === 404) {
          // Usuario no existe, crearlo
          const createResponse = await fetch('/api/users', { method: 'POST' });
          
          if (createResponse.ok) {
            setIsInitialized(true);
          }
        } else if (response.ok) {
          setIsInitialized(true);
        }
      } catch {
        // Error silencioso, se puede manejar con UI si es necesario
      }
    };

    initializeUser();
  }, [user, isLoaded]);

  return { user, isLoaded, isInitialized };
}
