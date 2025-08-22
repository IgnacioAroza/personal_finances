import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-700 bg-gray-800 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link 
                href="/dashboard" 
                className="text-white hover:text-blue-400 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/income" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Ingresos
              </Link>
              <Link 
                href="/dashboard/expense" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Gastos
              </Link>
              <Link 
                href="/dashboard/analytics" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Análisis
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/income">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  + Ingreso
                </Button>
              </Link>
              <Link href="/dashboard/expense">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  + Gasto
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>
  );
}
