# Gestor de Finanzas Personales 💰

Una aplicación web moderna para gestionar ingresos y gastos personales, construida con Next.js 15, Clerk, Supabase y Tailwind CSS.

## ✨ Características

- 🔐 **Autenticación segura** con Clerk
- 📊 **Dashboard intuitivo** con resumen financiero
- 💰 **Gestión de ingresos y gastos** por categorías
- 📈 **Análisis y gráficos** de patrones financieros
- 🌙 **Diseño oscuro** y responsive
- 🔒 **Seguridad RLS** en Supabase
- ⚡ **Rendimiento optimizado** con Next.js 15

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Autenticación**: Clerk
- **Base de datos**: Supabase (PostgreSQL)
- **Estilos**: Tailwind CSS
- **Validación**: Zod + React Hook Form
- **Gráficos**: Recharts
- **Deployment**: Vercel

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta en Clerk
- Cuenta en Supabase

## ⚙️ Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/IgnacioAroza/personal_finances.git
cd personal_finances
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Configurar Clerk

1. Ve a [Clerk](https://clerk.dev) y crea una nueva aplicación
2. Copia las claves y añádelas al `.env.local`
3. Configura las URLs de redirect:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

### 5. Configurar Supabase

1. Ve a [Supabase](https://supabase.com) y crea un nuevo proyecto
2. Ve a Settings > API y copia las claves
3. Ejecuta el schema SQL en el SQL Editor:

```sql
-- Ejecutar el contenido del archivo schema.sql
```

### 6. Configurar autenticación Clerk-Supabase

En Supabase, ve a Authentication > Providers > JWT y configura:

- JWT Secret: Tu clave secreta de Clerk
- JWKS URL: `https://your-clerk-frontend-api/.well-known/jwks.json`

### 7. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

```
/app
  /dashboard          # Dashboard principal protegido
    /income          # Formulario de ingresos
    /expense         # Formulario de gastos
    /analytics       # Página de análisis
  /sign-in           # Página de login
  /sign-up           # Página de registro
  /api               # API routes
/components
  /ui                # Componentes base (Button, Card, etc.)
  /forms             # Formularios específicos
  /charts            # Componentes de gráficos
/lib
  /supabase.ts       # Cliente de Supabase
  /utils.ts          # Funciones utilitarias
/types
  /database.ts       # Tipos de TypeScript
```

## 🗃️ Base de Datos

### Tablas principales:

- **users**: Información de usuarios sincronizada con Clerk
- **categories**: Categorías de ingresos y gastos
- **income**: Registro de ingresos
- **expenses**: Registro de gastos

### Categorías predeterminadas:

**Ingresos**: Salario, Freelance, Inversiones, Otros  
**Gastos**: Alimentación, Transporte, Entretenimiento, Compras, Salud, Servicios, Educación, Otros

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Otros proveedores

La aplicación es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- AWS Amplify

## 🔧 Scripts Disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Construir para producción
npm run start    # Iniciar en producción
npm run lint     # Linter
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una branch para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes alguna pregunta:

- Abre un issue en GitHub
- Revisa la documentación de [Next.js](https://nextjs.org/docs)
- Consulta la documentación de [Clerk](https://clerk.dev/docs)
- Revisa los docs de [Supabase](https://supabase.com/docs)