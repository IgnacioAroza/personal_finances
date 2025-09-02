import { type Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { UserNav } from '@/components/user-nav'
import './globals.css'
import { Toaster } from 'sonner'
import Link from 'next/link'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Gestor de Finanzas Personales',
  description: 'Gestiona tus ingresos y gastos de manera inteligente',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="border-b border-border bg-card">
            <div className="container mx-auto flex justify-between items-center p-4 h-16">
              <Link href="/dashboard" className="text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                💰 Finanzas
              </Link>
              <div className="flex items-center gap-4">
                <UserNav />
              </div>
            </div>
          </header>
          <main className="container mx-auto p-4">
            {children}
          </main>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
