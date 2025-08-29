import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Error de Autenticación
          </h1>
          <p className="text-muted-foreground mb-6">
            Hubo un problema al procesar tu solicitud de autenticación. 
            Por favor, intenta nuevamente.
          </p>
          <div className="space-y-3">
            <Link href="/auth/signin" className="block">
              <Button className="w-full">
                Volver a Iniciar Sesión
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                Ir al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
