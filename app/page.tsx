import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Controla tus Finanzas
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gestiona tus ingresos y gastos de manera inteligente. 
            Visualiza tus datos financieros y toma mejores decisiones.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-muted">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-center text-foreground flex items-center justify-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Dashboard Intuitivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Visualiza tus finanzas con gráficos claros y tarjetas de resumen
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-center text-foreground flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Registro Fácil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Añade tus ingresos y gastos de forma rápida y sencilla
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-center text-foreground flex items-center justify-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Análisis Detallado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Obtén insights sobre tus patrones de gasto por categoría
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
