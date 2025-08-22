'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useUserInitialization } from '@/hooks/useUserInitialization';
import Link from 'next/link';

// Componente para las tarjetas de resumen
function SummaryCard({ 
  title, 
  amount, 
  icon, 
  color 
}: { 
  title: string; 
  amount: number; 
  icon: string; 
  color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">
          {title}
        </CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>
          {formatCurrency(amount)}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, isLoaded } = useUserInitialization();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">No autorizado</div>
      </div>
    );
  }

  // TODO: Obtener datos reales de la base de datos
  const mockData = {
    totalIncome: 3500,
    totalExpenses: 2200,
    balance: 1300,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">
          Gestiona tus finanzas personales de forma inteligente
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Ingresos Totales"
          amount={mockData.totalIncome}
          icon="💰"
          color="text-green-400"
        />
        <SummaryCard
          title="Gastos Totales"
          amount={mockData.totalExpenses}
          icon="💸"
          color="text-red-400"
        />
        <SummaryCard
          title="Balance"
          amount={mockData.balance}
          icon="📊"
          color={mockData.balance >= 0 ? "text-green-400" : "text-red-400"}
        />
      </div>

      {/* Acciones rápidas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Registrar Movimientos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              Añade nuevos ingresos o gastos a tu registro financiero
            </p>
            <div className="flex gap-2">
              <Link href="/dashboard/income">
                <Button className="bg-green-600 hover:bg-green-700">
                  + Ingreso
                </Button>
              </Link>
              <Link href="/dashboard/expense">
                <Button className="bg-red-600 hover:bg-red-700">
                  + Gasto
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Análisis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-400">
              Visualiza tus patrones de gasto y tendencias financieras
            </p>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full">
                Ver Análisis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Transacciones recientes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-400">
              No hay transacciones aún. ¡Comienza registrando tu primer movimiento!
            </p>
            <div className="flex gap-2 justify-center mt-4">
              <Link href="/dashboard/income">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Registrar Ingreso
                </Button>
              </Link>
              <Link href="/dashboard/expense">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  Registrar Gasto
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
