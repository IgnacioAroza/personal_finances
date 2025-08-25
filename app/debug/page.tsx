'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const { user, isLoaded } = useUser();
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const checkUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/user');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error:', error);
      setDebugInfo({ error: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  const forceCreateUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/user', { method: 'POST' });
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error:', error);
      setDebugInfo({ error: 'Error creando usuario' });
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/update-user', { method: 'POST' });
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error:', error);
      setDebugInfo({ error: 'Error actualizando usuario' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      checkUser();
    }
  }, [isLoaded, user]);

  if (!isLoaded) {
    return <div className="p-8">Cargando...</div>;
  }

  if (!user) {
    return <div className="p-8">No autenticado</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Debug - Estado del Usuario</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Información de Clerk</CardTitle>
          <CardDescription>Datos del usuario autenticado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}</p>
            <p><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estado en la Base de Datos</CardTitle>
          <CardDescription>Verificar si el usuario existe en Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={checkUser} disabled={loading}>
                {loading ? 'Verificando...' : 'Verificar Usuario'}
              </Button>
              <Button onClick={forceCreateUser} disabled={loading} variant="outline">
                {loading ? 'Creando...' : 'Forzar Creación'}
              </Button>
              <Button onClick={updateUser} disabled={loading} variant="secondary">
                {loading ? 'Actualizando...' : 'Actualizar Datos'}
              </Button>
            </div>
            
            {debugInfo && (
              <div className="mt-4 p-4 bg-secondary rounded">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
