import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900">
      <SignedOut>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Controla tus Finanzas
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Gestiona tus ingresos y gastos de manera inteligente. 
              Visualiza tus datos financieros y toma mejores decisiones.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" size="lg">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-green-400">
                  📊 Dashboard Intuitivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-center">
                  Visualiza tus finanzas con gráficos claros y tarjetas de resumen
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center text-blue-400">
                  💰 Registro Fácil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-center">
                  Añade tus ingresos y gastos de forma rápida y sencilla
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center text-purple-400">
                  📈 Análisis Detallado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-center">
                  Obtén insights sobre tus patrones de gasto por categoría
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-8">
            ¡Bienvenido de vuelta! 👋
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Accede a tu dashboard para gestionar tus finanzas
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Ir al Dashboard
            </Button>
          </Link>
        </div>
      </SignedIn>
    </div>
  );
}
