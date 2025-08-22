import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

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
    <ClerkProvider>
      <html lang="es" className="dark">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white min-h-screen`}>
          <header className="border-b border-gray-700 bg-gray-800">
            <div className="container mx-auto flex justify-between items-center p-4 h-16">
              <h1 className="text-xl font-bold text-white">💰 Finanzas</h1>
              <div className="flex items-center gap-4">
                <SignedOut>
                  <SignInButton>
                    <button className="text-gray-300 hover:text-white">
                      Iniciar Sesión
                    </button>
                  </SignInButton>
                  <SignUpButton>
                    <button className="bg-blue-600 text-white rounded-lg font-medium text-sm h-10 px-5 hover:bg-blue-700 transition-colors">
                      Registrarse
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </header>
          <main className="container mx-auto p-4">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}