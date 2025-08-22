import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-gray-400">
            Inicia sesión para gestionar tus finanzas
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-gray-800 border border-gray-700",
              headerTitle: "text-white",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
              formFieldInput: "bg-gray-700 border-gray-600 text-white",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
              footerActionLink: "text-blue-400 hover:text-blue-300"
            }
          }}
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}
